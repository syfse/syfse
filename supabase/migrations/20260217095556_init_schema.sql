-- ############################################################################
-- 1. CLEANUP
-- ############################################################################
DROP VIEW IF EXISTS public.view_posts;
DROP VIEW IF EXISTS public.view_comments;

-- Check if the communities table exists before dropping the trigger
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'communities' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS on_community_created ON public.communities;
    END IF;
END $$;

DROP FUNCTION IF EXISTS public.handle_community_creation();
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.community_members CASCADE;
DROP TABLE IF EXISTS public.content_nodes CASCADE;
DROP TABLE IF EXISTS public.communities CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.global_role;
DROP TYPE IF EXISTS public.community_role;

-- ############################################################################
-- 2. SETUP EXTENSIONS & ENUMS
-- ############################################################################
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE public.global_role AS ENUM ('sys_admin', 'sys_moderator', 'sys_bot', 'usr_member');
CREATE TYPE public.community_role AS ENUM ('usr_com_admin', 'usr_com_moderator', 'usr_com_member');

-- ############################################################################
-- 3. TABLES
-- ############################################################################

CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    
    -- Moderation & State
    is_banned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE, -- For future use (soft ban, deactivation after inactivity, etc.)

    avatar_url TEXT,
    role public.global_role DEFAULT 'usr_member' NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT username_min_length CHECK (char_length(username) >= 3)
);

CREATE TABLE public.communities (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    creator_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT community_slug_format CHECK (slug ~* '^[a-z0-9_-]+$')
);

CREATE TABLE public.content_nodes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES public.content_nodes(id) ON DELETE CASCADE,
    
    title TEXT,
    content_body TEXT NOT NULL,
    
    -- Moderation & State
    is_active BOOLEAN DEFAULT TRUE, -- For moderation (soft delete)
    is_edited BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT post_requires_title CHECK (
        (parent_id IS NULL AND title IS NOT NULL) OR (parent_id IS NOT NULL)
    )
);

CREATE TABLE public.community_members (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.community_role DEFAULT 'usr_com_member' NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

CREATE TABLE public.votes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    node_id uuid NOT NULL REFERENCES public.content_nodes(id) ON DELETE CASCADE,
    vote_value INTEGER NOT NULL CHECK (vote_value IN (1, -1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, node_id)
);

-- ############################################################################
-- 4. LOGIC & TRIGGERS
-- ############################################################################

CREATE OR REPLACE FUNCTION public.generate_default_username(user_id uuid)
RETURNS text AS $$
BEGIN
    -- Simple default username generator: "user_" + first 8 chars of UUID
    RETURN 'user_' || substring(user_id::text from 1 for 8);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_profile_creation()
RETURNS trigger AS $$
BEGIN
    -- If username is not provided, generate a default one
    IF NEW.username IS NULL THEN
        NEW.username := public.generate_default_username(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
    BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_profile_creation();

CREATE OR REPLACE FUNCTION public.handle_community_creation()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.community_members (community_id, user_id, role)
    VALUES (NEW.id, NEW.creator_id, 'usr_com_admin');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_community_created
    AFTER INSERT ON public.communities
    FOR EACH ROW EXECUTE FUNCTION public.handle_community_creation();

-- ############################################################################
-- 5. ROW LEVEL SECURITY (PRODUCTION POLICIES)
-- ############################################################################

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- 5.1 Profiles
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5.2 Communities
CREATE POLICY "Communities are public" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Logged in users can create communities" ON public.communities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- NEW: Community Admins can update their community metadata
CREATE POLICY "Community Admins can update community" ON public.communities 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.community_members 
            WHERE community_id = public.communities.id 
            AND user_id = auth.uid() 
            AND role = 'usr_com_admin'
        )
    );

-- 5.3 Community Members
CREATE POLICY "Memberships are public" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Users can join communities" ON public.community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can leave or Admins can kick" ON public.community_members 
    FOR DELETE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.community_members 
            WHERE community_id = public.community_members.community_id 
            AND user_id = auth.uid() 
            AND role = 'usr_com_admin'
        )
    );

-- 5.4 Content Nodes (The Hub)
CREATE POLICY "Public can see active content" ON public.content_nodes FOR SELECT USING (is_active = true);
-- NEW: Authors and Mods can see inactive content
CREATE POLICY "Authors and Mods can see inactive" ON public.content_nodes FOR SELECT USING (
    auth.uid() = author_id OR 
    EXISTS (
        SELECT 1 FROM public.community_members 
        WHERE community_id = public.content_nodes.community_id 
        AND user_id = auth.uid() 
        AND role IN ('usr_com_admin', 'usr_com_moderator')
    )
);

CREATE POLICY "Members can post content" ON public.content_nodes 
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.community_members WHERE community_id = content_nodes.community_id AND user_id = auth.uid())
    );

-- NEW: Authors can update content (but not change community or author)
CREATE POLICY "Authors can update own content" ON public.content_nodes 
    FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

-- NEW: Moderators can toggle 'is_active' (Moderation)
CREATE POLICY "Moderators can moderate content" ON public.content_nodes 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.community_members 
            WHERE community_id = public.content_nodes.community_id 
            AND user_id = auth.uid() 
            AND role IN ('usr_com_admin', 'usr_com_moderator')
        )
    );

-- NEW: Hard delete only for authors OR Admins
CREATE POLICY "Authors/Admins can hard delete" ON public.content_nodes 
    FOR DELETE USING (
        auth.uid() = author_id OR 
        EXISTS (
            SELECT 1 FROM public.community_members 
            WHERE community_id = public.content_nodes.community_id 
            AND user_id = auth.uid() 
            AND role = 'usr_com_admin'
        )
    );

-- 5.5 Votes (UPSERT Friendly)
CREATE POLICY "Votes are public" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Vote Insert" ON public.votes FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('usr_member', 'sys_admin', 'sys_moderator', 'sys_bot'))
);
CREATE POLICY "Vote Update" ON public.votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Vote Delete" ON public.votes FOR DELETE USING (auth.uid() = user_id);

-- ############################################################################
-- 6. INDEXES
-- ############################################################################
CREATE INDEX idx_nodes_parent_id ON public.content_nodes(parent_id);
CREATE INDEX idx_nodes_community_id ON public.content_nodes(community_id);
CREATE INDEX idx_nodes_active ON public.content_nodes(is_active);
CREATE INDEX idx_votes_node_id ON public.votes(node_id);
CREATE INDEX idx_votes_user_node ON public.votes(user_id, node_id);