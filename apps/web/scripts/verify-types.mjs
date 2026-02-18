#!/usr/bin/env node

/**
 * Script to verify Supabase type generation and structure
 * This ensures the database.types.ts file has the correct structure
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const typesPath = join(process.cwd(), 'src', 'types', 'database.types.ts')

console.log('🔍 Verifying Supabase type definitions...\n')

try {
  const content = readFileSync(typesPath, 'utf-8')
  
  const checks = [
    { name: 'Database type export', pattern: /export type Database = \{/ },
    { name: 'Communities table', pattern: /communities: \{/ },
    { name: 'Profiles table', pattern: /profiles: \{/ },
    { name: 'Content nodes table', pattern: /content_nodes: \{/ },
    { name: 'Community members table', pattern: /community_members: \{/ },
    { name: 'Votes table', pattern: /votes: \{/ },
    { name: 'Global role enum', pattern: /global_role: "sys_admin" \| "sys_moderator" \| "sys_bot" \| "usr_member"/ },
    { name: 'Community role enum', pattern: /community_role: "usr_com_admin" \| "usr_com_moderator" \| "usr_com_member"/ },
    { name: 'Tables helper type', pattern: /export type Tables</ },
    { name: 'TablesInsert helper type', pattern: /export type TablesInsert</ },
    { name: 'TablesUpdate helper type', pattern: /export type TablesUpdate</ },
    { name: 'Enums helper type', pattern: /export type Enums</ },
  ]
  
  let allPassed = true
  
  checks.forEach(({ name, pattern }) => {
    if (pattern.test(content)) {
      console.log(`✅ ${name}`)
    } else {
      console.log(`❌ ${name}`)
      allPassed = false
    }
  })
  
  console.log('\n' + '='.repeat(60))
  
  if (allPassed) {
    console.log('✅ All type checks passed!')
    console.log('\n📚 Database schema includes:')
    console.log('  - profiles: User profiles linked to auth.users')
    console.log('  - communities: Community/subreddit-like entities')
    console.log('  - content_nodes: Posts and comments (hierarchical)')
    console.log('  - community_members: User membership in communities')
    console.log('  - votes: Upvotes/downvotes on content')
    console.log('\n🎯 Type safety features:')
    console.log('  - IntelliSense for table names')
    console.log('  - IntelliSense for column names')
    console.log('  - Type-safe insert/update operations')
    console.log('  - Enum value validation')
    process.exit(0)
  } else {
    console.log('❌ Some type checks failed!')
    process.exit(1)
  }
  
} catch (error) {
  console.error('❌ Error reading types file:', error.message)
  process.exit(1)
}
