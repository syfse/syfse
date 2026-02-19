# Syfse

A modern community-driven discussion platform built with React, TypeScript, and Supabase. Users can create communities, post content, reply to discussions, and vote on contributions.

## 🚀 Features

- **Communities**: Create and join communities to organize discussions
- **Hierarchical Discussions**: Post content and reply to create threaded conversations
- **Voting System**: Upvote and downvote posts and replies
- **User Profiles**: View user profiles with their posts and replies
- **Real-time Updates**: Built with Supabase for scalable backend
- **Responsive Design**: Tailwind CSS for modern, mobile-friendly UI
- **Authentication**: Secure user authentication via Supabase

## 📋 Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **React Router v7** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend
- **Supabase** - PostgreSQL database with built-in auth
- **Row-Level Security (RLS)** - Database-level access control

### Tools & Configuration
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **TypeScript** - Strict type checking

## 📁 Project Structure

```
syfse/
├── apps/
│   └── web/                    # Main React application
│       ├── src/
│       │   ├── components/     # React components
│       │   │   ├── ui/         # Reusable UI components
│       │   │   └── ...         # Feature components
│       │   ├── contexts/       # React contexts (Auth, Theme)
│       │   ├── lib/            # Utilities and database config
│       │   ├── App.tsx         # Main app component
│       │   ├── main.tsx        # Entry point
│       │   └── index.css       # Global styles
│       ├── package.json        # Dependencies
│       ├── vite.config.ts      # Vite configuration
│       └── tsconfig.json       # TypeScript config
├── supabase/                   # Supabase configuration and migrations
├── package.json                # Root package (monorepo)
└── README.md                   # This file
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/syfse.git
   cd syfse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and API key
   - Create a `.env.local` file in `apps/web/`:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Run migrations** (if needed)
   ```bash
   cd supabase
   supabase db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

## 📚 Database Schema

### Tables
- **profiles** - User profile information with roles
- **communities** - Community metadata and settings
- **community_members** - Community membership tracking
- **content_nodes** - Unified table for posts and replies (hierarchical via `parent_id`)
- **votes** - User votes on content (upvote/downvote)

### Key Relationships
- `content_nodes.parent_id` - NULL for posts, references another node for replies
- `content_nodes.community_id` - References the community where content was posted
- `votes.node_id` - References the content being voted on
- `community_members.community_id` - Tracks which communities users have joined

## 🔐 Security

### Row-Level Security (RLS)
The database uses RLS policies to ensure:
- Users can only modify their own votes
- Community members can only view members-only content
- Users can only edit/delete their own posts and replies

### Required RLS Policies
Ensure these policies are enabled on the `votes` table:
- SELECT: All votes are readable
- INSERT: Users can insert only their own votes
- UPDATE: Users can update only their own votes
- DELETE: Users can delete only their own votes

## 🎨 Key Components

### Vote Component
Handles upvoting and downvoting on posts and replies
- Props: `nodeId`, `initialVoteCount`, `horizontal`
- Manages optimistic updates and vote state

### PostsFeed Component
Displays paginated list of posts in a community
- Props: `communityId` (optional)
- Loads posts with reply counts and vote totals

### PostView Component
Detailed view of a single post with threaded replies
- Supports nested replies with indentation
- Real-time voting on individual replies
- Reply form with submission handling

### UserProfile Component
Shows user's published posts and replies
- Displays user stats and content history
- Vote counts and reply metrics

## 🚀 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📝 Database Migrations

Migrations are stored in `supabase/migrations/`. To create a new migration:

```bash
supabase migration new <migration_name>
```

Then edit the generated SQL file and run:

```bash
supabase db push
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes
3. Commit: `git commit -m 'feat: add your feature'`
4. Push and open a pull request

## 📖 API Documentation

### Vote System
- **Upvote**: `vote_value = 1`
- **Downvote**: `vote_value = -1`
- **No Vote**: Delete the vote record
- Vote count is calculated as the sum of all `vote_value` entries

### Content Hierarchy
- **Posts**: `parent_id = null`
- **Replies**: `parent_id` references the parent post or reply

## 🐛 Troubleshooting

### RLS Policy Errors
If you see "new row violates row-level security policy", ensure:
1. RLS is enabled on the affected table
2. The correct policies are in place for your user role
3. Your user is authenticated via Supabase Auth

### Vote Updates Not Working
Check:
1. Supabase connection is active
2. User is logged in (`useAuth()` hook shows user data)
3. Browser console for detailed error messages
4. RLS policies on the votes table

## 📄 License

ISC

## 👥 Support

For questions or issues, please open an issue on GitHub or check the Supabase documentation at [supabase.com/docs](https://supabase.com/docs).

---

**Made with ❤️ using React, TypeScript, and Supabase**
