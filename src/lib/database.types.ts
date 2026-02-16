export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type UserRole = 'member' | 'moderator' | 'admin'

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    avatar_url: string | null
                    updated_at: string
                    created_at: string
                }
                Insert: {
                    id: string
                    username?: string | null
                    avatar_url?: string | null
                    updated_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    username?: string | null
                    avatar_url?: string | null
                    updated_at?: string
                    created_at?: string
                }
                Relationships: []
            }
            sub_syfses: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    banner_url: string | null
                    created_at: string
                    creator_id: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    banner_url?: string | null
                    created_at?: string
                    creator_id?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    banner_url?: string | null
                    created_at?: string
                    creator_id?: string | null
                }
                Relationships: []
            }
            sub_syfse_members: {
                Row: {
                    id: string
                    sub_id: string | null
                    user_id: string | null
                    role: UserRole
                }
                Insert: {
                    id?: string
                    sub_id?: string | null
                    user_id?: string | null
                    role?: UserRole
                }
                Update: {
                    id?: string
                    sub_id?: string | null
                    user_id?: string | null
                    role?: UserRole
                }
                Relationships: [
                    {
                        foreignKeyName: 'sub_syfse_members_sub_id_fkey'
                        columns: ['sub_id']
                        referencedRelation: 'sub_syfses'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'sub_syfse_members_user_id_fkey'
                        columns: ['user_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                ]
            }
            posts: {
                Row: {
                    id: string
                    author_id: string
                    sub_id: string
                    title: string
                    content: string | null
                    image_url: string | null
                    assets: string[]
                    created_at: string
                }
                Insert: {
                    id?: string
                    author_id: string
                    sub_id: string
                    title: string
                    content?: string | null
                    image_url?: string | null
                    assets?: string[]
                    created_at?: string
                }
                Update: {
                    id?: string
                    author_id?: string
                    sub_id?: string
                    title?: string
                    content?: string | null
                    image_url?: string | null
                    assets?: string[]
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'posts_author_id_fkey'
                        columns: ['author_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'posts_sub_id_fkey'
                        columns: ['sub_id']
                        referencedRelation: 'sub_syfses'
                        referencedColumns: ['id']
                    },
                ]
            }
            comments: {
                Row: {
                    id: string
                    post_id: string
                    author_id: string
                    content: string
                    parent_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    author_id: string
                    content: string
                    parent_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string
                    author_id?: string
                    content?: string
                    parent_id?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'comments_author_id_fkey'
                        columns: ['author_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'comments_post_id_fkey'
                        columns: ['post_id']
                        referencedRelation: 'posts'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'comments_parent_id_fkey'
                        columns: ['parent_id']
                        referencedRelation: 'comments'
                        referencedColumns: ['id']
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: UserRole
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
