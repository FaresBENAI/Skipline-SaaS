import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour TypeScript basés sur le schéma exact
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          user_type: 'client' | 'business'
          qr_code: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          user_type: 'client' | 'business'
          qr_code?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          user_type?: 'client' | 'business'
          qr_code?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          logo_url: string | null
          owner_id: string
          is_active: boolean
          company_qr_code: string | null
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          owner_id: string
          is_active?: boolean
          company_qr_code?: string | null
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          owner_id?: string
          is_active?: boolean
          company_qr_code?: string | null
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      queues: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          max_capacity: number
          estimated_time_per_person: number
          is_active: boolean
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          max_capacity?: number
          estimated_time_per_person?: number
          is_active?: boolean
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          max_capacity?: number
          estimated_time_per_person?: number
          is_active?: boolean
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      queue_entries: {
        Row: {
          id: string
          queue_id: string
          user_id: string | null
          position: number
          status: 'waiting' | 'called' | 'served' | 'cancelled' | 'no_show'
          estimated_time: string | null
          called_at: string | null
          served_at: string | null
          notes: string | null
          guest_email: string | null
          guest_phone: string | null
          guest_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          queue_id: string
          user_id?: string | null
          position: number
          status?: 'waiting' | 'called' | 'served' | 'cancelled' | 'no_show'
          estimated_time?: string | null
          called_at?: string | null
          served_at?: string | null
          notes?: string | null
          guest_email?: string | null
          guest_phone?: string | null
          guest_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          queue_id?: string
          user_id?: string | null
          position?: number
          status?: 'waiting' | 'called' | 'served' | 'cancelled' | 'no_show'
          estimated_time?: string | null
          called_at?: string | null
          served_at?: string | null
          notes?: string | null
          guest_email?: string | null
          guest_phone?: string | null
          guest_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Types utilitaires
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type Queue = Database['public']['Tables']['queues']['Row']
export type QueueEntry = Database['public']['Tables']['queue_entries']['Row']
