# Supabase Setup

This directory contains the Supabase client configuration and TypeScript type definitions for the application.

## Files

- **`src/lib/supabase.ts`**: Main Supabase client instance with full type safety
- **`src/types/database.types.ts`**: Auto-generated TypeScript types from database schema

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### For Local Development

If using Supabase local development:

```bash
# Start Supabase locally
npx supabase start

# Get your local credentials
npx supabase status
```

Then use:
- URL: `http://127.0.0.1:54321`
- Anon key: (from `supabase status` output)

### For Production

Get credentials from your Supabase Dashboard at https://app.supabase.com

## Database Schema

The database includes the following tables:

- **profiles**: User profiles linked to auth.users
- **communities**: Community/subreddit-like entities
- **content_nodes**: Posts and comments (hierarchical)
- **community_members**: User membership in communities
- **votes**: Upvotes/downvotes on content

### Enums

- **global_role**: `sys_admin`, `sys_moderator`, `sys_bot`, `usr_member`
- **community_role**: `usr_com_admin`, `usr_com_moderator`, `usr_com_member`

## Usage Examples

### Basic Query

```typescript
import { supabase } from './lib/supabase'

// Fetch communities - with full type safety!
const { data, error } = await supabase
  .from('communities')
  .select('*')

// data is typed as Tables<'communities'>[]
```

### Using Types

```typescript
import type { Tables, TablesInsert } from './types/database.types'

// Get the type for a community row
type Community = Tables<'communities'>

// Get the type for inserting a community
type CommunityInsert = TablesInsert<'communities'>

const newCommunity: CommunityInsert = {
  name: 'My Community',
  slug: 'my-community',
  description: 'A cool community'
}
```

### Type-safe Relationships

```typescript
// Fetch posts with author information
const { data } = await supabase
  .from('content_nodes')
  .select(`
    *,
    author:profiles(*),
    community:communities(*)
  `)
  .is('parent_id', null) // Only top-level posts
```

## Type Generation

The types in `database.types.ts` are manually created based on the migration file at `supabase/migrations/20260217095556_init_schema.sql`.

To regenerate types from a live Supabase instance:

```bash
# For local instance
npx supabase gen types typescript --local > src/types/database.types.ts

# For remote instance (requires linking)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

## IntelliSense Features

With these types, you get:

✅ **Autocomplete** for table names  
✅ **Autocomplete** for column names  
✅ **Type checking** for insert/update operations  
✅ **Autocomplete** for enum values  
✅ **Type safety** for query results  

Try it in your editor:
```typescript
supabase.from('communities').select('...')
//             ↑ Autocomplete shows all table names
```
