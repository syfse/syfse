/**
 * Type Safety Demonstration
 * 
 * This file demonstrates the IntelliSense and type safety features
 * provided by the Supabase client and database types.
 */

import { supabase } from './lib/supabase'
import type { Tables, TablesInsert, TablesUpdate, Enums } from './types/database.types'

// ============================================================================
// 1. Type-safe Table Access
// ============================================================================

/**
 * Example: Fetching communities with full type safety
 * IntelliSense will show all available columns when you type .select('...')
 */
export async function getCommunities() {
  const { data, error } = await supabase
    .from('communities')  // ✅ IntelliSense shows all table names
    .select('*')          // ✅ IntelliSense shows all column names
    .order('created_at', { ascending: false })
  
  // ✅ data is automatically typed as Tables<'communities'>[]
  if (data) {
    data.forEach(community => {
      console.log(community.name)        // ✅ TypeScript knows these properties exist
      console.log(community.slug)
      console.log(community.description)
    })
  }
  
  return { data, error }
}

// ============================================================================
// 2. Using Typed Row Objects
// ============================================================================

type Community = Tables<'communities'>

export function processCommunity(community: Community) {
  // ✅ IntelliSense shows all properties
  const { id, name, slug, description, creator_id, created_at } = community
  return { id, name, slug, description, creator_id, created_at }
}

// Example types for other tables (use as needed)
export type Profile = Tables<'profiles'>
export type ContentNode = Tables<'content_nodes'>
export type Vote = Tables<'votes'>
export type CommunityMember = Tables<'community_members'>

// ============================================================================
// 3. Type-safe Inserts
// ============================================================================

export async function createCommunity(
  name: string,
  slug: string,
  description?: string
) {
  // ✅ TablesInsert provides correct types for insert operations
  const newCommunity: TablesInsert<'communities'> = {
    name,
    slug,
    description: description ?? null,
    // ✅ TypeScript will error if required fields are missing
    // ✅ TypeScript will error if invalid fields are added
  }
  
  const { data, error } = await supabase
    .from('communities')
    .insert(newCommunity)
    .select()
    .single()
  
  return { data, error }
}

// ============================================================================
// 4. Type-safe Updates
// ============================================================================

export async function updateCommunityDescription(
  communityId: string,
  description: string
) {
  // ✅ TablesUpdate allows partial updates
  const updates: TablesUpdate<'communities'> = {
    description,
    // Only fields you want to update are required
  }
  
  const { data, error } = await supabase
    .from('communities')
    .update(updates)
    .eq('id', communityId)
    .select()
    .single()
  
  return { data, error }
}

// ============================================================================
// 5. Enum Type Safety
// ============================================================================

type GlobalRole = Enums<'global_role'>

// Export for use in other files
export type CommunityRole = Enums<'community_role'>

export function checkUserRole(role: GlobalRole) {
  // ✅ TypeScript ensures only valid enum values are used
  if (role === 'sys_admin') {
    console.log('User is a system admin')
  } else if (role === 'sys_moderator') {
    console.log('User is a system moderator')
  } else if (role === 'usr_member') {
    console.log('User is a member')
  }
  // TypeScript will error if you try to use an invalid value
}

export async function updateUserRole(userId: string, newRole: GlobalRole) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })  // ✅ Only valid enum values accepted
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

// ============================================================================
// 6. Relationships and Joins
// ============================================================================

export async function getPostsWithAuthors() {
  const { data, error } = await supabase
    .from('content_nodes')
    .select(`
      *,
      author:profiles!content_nodes_author_id_fkey(*),
      community:communities!content_nodes_community_id_fkey(*)
    `)
    .is('parent_id', null)  // Only top-level posts
    .order('created_at', { ascending: false })
  
  // Note: For complex joins, you may need to define custom types
  // The base types are for single-table operations
  return { data, error }
}

// ============================================================================
// 7. Complex Filtering with Type Safety
// ============================================================================

export async function getActivePostsInCommunity(communitySlug: string) {
  // First get the community
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('id')
    .eq('slug', communitySlug)  // ✅ IntelliSense knows 'slug' is a valid column
    .single()
  
  if (communityError || !community) {
    return { data: null, error: communityError }
  }
  
  // Then get posts
  const { data, error } = await supabase
    .from('content_nodes')
    .select('*')
    .eq('community_id', community.id)
    .eq('is_active', true)        // ✅ TypeScript knows is_active is a boolean
    .is('parent_id', null)        // Top-level posts only
    .order('created_at', { ascending: false })
  
  return { data, error }
}

// ============================================================================
// 8. Vote Operations with Constraints
// ============================================================================

export async function castVote(
  userId: string,
  nodeId: string,
  value: 1 | -1  // ✅ Type-safe vote values
) {
  const vote: TablesInsert<'votes'> = {
    user_id: userId,
    node_id: nodeId,
    vote_value: value,
  }
  
  // Using upsert to handle existing votes
  const { data, error } = await supabase
    .from('votes')
    .upsert(vote, { onConflict: 'user_id,node_id' })
    .select()
    .single()
  
  return { data, error }
}

// ============================================================================
// 9. Real-time Subscriptions with Types
// ============================================================================

export function subscribeToCommunityUpdates(
  communityId: string,
  callback: (payload: Tables<'communities'>) => void
) {
  const channel = supabase
    .channel(`community:${communityId}`)
    .on<Tables<'communities'>>(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'communities',
        filter: `id=eq.${communityId}`,
      },
      (payload) => {
        // ✅ payload.new is typed as Tables<'communities'>
        callback(payload.new)
      }
    )
    .subscribe()
  
  return channel
}

// ============================================================================
// 10. Error Handling with Types
// ============================================================================

export async function safeFetchCommunity(slug: string): Promise<Community | null> {
  try {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error) {
      console.error('Error fetching community:', error.message)
      return null
    }
    
    // ✅ data is typed as Tables<'communities'>
    return data
  } catch (err) {
    console.error('Unexpected error:', err)
    return null
  }
}
