export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calendar_entries: {
        Row: {
          amount: number | null
          created_at: string
          date: string
          description: string | null
          end_date: string | null
          frequency: Database["public"]["Enums"]["entry_frequency"]
          id: string
          is_paused: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          date: string
          description?: string | null
          end_date?: string | null
          frequency: Database["public"]["Enums"]["entry_frequency"]
          id?: string
          is_paused?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          date?: string
          description?: string | null
          end_date?: string | null
          frequency?: Database["public"]["Enums"]["entry_frequency"]
          id?: string
          is_paused?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      entry_statuses: {
        Row: {
          id: string
          entry_id: string
          date: string
          status: 'COMPLETED' | 'INCOMPLETE'
          remarks: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          entry_id: string
          date: string
          status?: 'COMPLETED' | 'INCOMPLETE'
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          entry_id?: string
          date?: string
          status?: 'COMPLETED' | 'INCOMPLETE'
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_statuses_entry_id_fkey"
            columns: ["entry_id"]
            referencedRelation: "calendar_entries"
            referencedColumns: ["id"]
          }
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
      entry_frequency:
        | "DAILY"
        | "WEEKLY"
        | "FORTNIGHTLY"
        | "MONTHLY"
        | "3_MONTHLY"
        | "6_MONTHLY"
        | "YEARLY"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
