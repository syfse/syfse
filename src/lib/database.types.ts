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
      }
      posts: {
        Row: {
          id: string
          author_id: string
          sub_id: string
          title: string
          content: string | null
          assets: string[]
          created_at: string
        }
        Insert: {
          id?: string
          author_id: string
          sub_id: string
          title: string
          content?: string | null
          assets?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          sub_id?: string
          title?: string
          content?: string | null
          assets?: string[]
          created_at?: string
        }
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
      }
    }
  }
}
