export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          email: string
          full_name: string
          phone_number: string | null
          role: string
          language_preference: string | null
          avatar_url: string | null
          permissions: Json | null
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          email: string
          full_name: string
          phone_number?: string | null
          role: string
          language_preference?: string | null
          avatar_url?: string | null
          permissions?: Json | null
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          email?: string
          full_name?: string
          phone_number?: string | null
          role?: string
          language_preference?: string | null
          avatar_url?: string | null
          permissions?: Json | null
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          domain: string | null
          subscription_tier: string
          max_users: number
          features: Json | null
          settings: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          domain?: string | null
          subscription_tier?: string
          max_users?: number
          features?: Json | null
          settings?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string | null
          subscription_tier?: string
          max_users?: number
          features?: Json | null
          settings?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      farms: {
        Row: {
          id: string
          tenant_id: string
          name: string
          location: string
          size_hectares: number
          soil_type: string | null
          climate_zone: string | null
          coordinates: Json | null
          farm_type: string
          established_date: string | null
          manager_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          location: string
          size_hectares: number
          soil_type?: string | null
          climate_zone?: string | null
          coordinates?: Json | null
          farm_type: string
          established_date?: string | null
          manager_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          location?: string
          size_hectares?: number
          soil_type?: string | null
          climate_zone?: string | null
          coordinates?: Json | null
          farm_type?: string
          established_date?: string | null
          manager_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      crops: {
        Row: {
          id: string
          tenant_id: string
          farm_id: string
          crop_name: string
          variety: string
          planting_date: string
          expected_harvest_date: string
          actual_harvest_date: string | null
          area_hectares: number
          status: string
          growth_stage: string
          expected_yield: number | null
          actual_yield: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          farm_id: string
          crop_name: string
          variety: string
          planting_date: string
          expected_harvest_date: string
          actual_harvest_date?: string | null
          area_hectares: number
          status: string
          growth_stage: string
          expected_yield?: number | null
          actual_yield?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          farm_id?: string
          crop_name?: string
          variety?: string
          planting_date?: string
          expected_harvest_date?: string
          actual_harvest_date?: string | null
          area_hectares?: number
          status?: string
          growth_stage?: string
          expected_yield?: number | null
          actual_yield?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      livestock: {
        Row: {
          id: string
          tenant_id: string
          farm_id: string
          animal_id: string
          species: string
          breed: string
          date_of_birth: string | null
          gender: string
          status: string
          health_status: string
          weight: number | null
          parent_ids: Json | null
          location: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          farm_id: string
          animal_id: string
          species: string
          breed: string
          date_of_birth?: string | null
          gender: string
          status: string
          health_status?: string
          weight?: number | null
          parent_ids?: Json | null
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          farm_id?: string
          animal_id?: string
          species?: string
          breed?: string
          date_of_birth?: string | null
          gender?: string
          status?: string
          health_status?: string
          weight?: number | null
          parent_ids?: Json | null
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      financial_records: {
        Row: {
          id: string
          tenant_id: string
          farm_id: string | null
          transaction_type: string
          category: string
          amount: number
          currency: string
          description: string | null
          transaction_date: string
          related_entity_type: string | null
          related_entity_id: string | null
          payment_method: string | null
          receipt_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          farm_id?: string | null
          transaction_type: string
          category: string
          amount: number
          currency?: string
          description?: string | null
          transaction_date: string
          related_entity_type?: string | null
          related_entity_id?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          farm_id?: string | null
          transaction_type?: string
          category?: string
          amount?: number
          currency?: string
          description?: string | null
          transaction_date?: string
          related_entity_type?: string | null
          related_entity_id?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          tenant_id: string
          farm_id: string | null
          item_name: string
          category: string
          current_stock: number
          unit: string
          minimum_stock: number
          maximum_stock: number | null
          unit_cost: number | null
          supplier: string | null
          expiry_date: string | null
          location: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          farm_id?: string | null
          item_name: string
          category: string
          current_stock: number
          unit: string
          minimum_stock: number
          maximum_stock?: number | null
          unit_cost?: number | null
          supplier?: string | null
          expiry_date?: string | null
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          farm_id?: string | null
          item_name?: string
          category?: string
          current_stock?: number
          unit?: string
          minimum_stock?: number
          maximum_stock?: number | null
          unit_cost?: number | null
          supplier?: string | null
          expiry_date?: string | null
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      breeding_records: {
        Row: {
          id: string
          tenant_id: string
          farm_id: string
          female_id: string
          male_id: string
          breeding_date: string
          breeding_method: string
          expected_delivery_date: string | null
          actual_delivery_date: string | null
          pregnancy_confirmed: boolean
          pregnancy_confirmation_date: string | null
          number_of_offspring: number | null
          complications: string | null
          veterinarian_id: string | null
          cost: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          farm_id: string
          female_id: string
          male_id: string
          breeding_date: string
          breeding_method: string
          expected_delivery_date?: string | null
          actual_delivery_date?: string | null
          pregnancy_confirmed?: boolean
          pregnancy_confirmation_date?: string | null
          number_of_offspring?: number | null
          complications?: string | null
          veterinarian_id?: string | null
          cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          farm_id?: string
          female_id?: string
          male_id?: string
          breeding_date?: string
          breeding_method?: string
          expected_delivery_date?: string | null
          actual_delivery_date?: string | null
          pregnancy_confirmed?: boolean
          pregnancy_confirmation_date?: string | null
          number_of_offspring?: number | null
          complications?: string | null
          veterinarian_id?: string | null
          cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      health_records: {
        Row: {
          id: string
          tenant_id: string
          animal_id: string
          record_type: string
          record_date: string
          description: string
          symptoms: Json | null
          diagnosis: string | null
          treatment: string | null
          medications: Json | null
          veterinarian_id: string | null
          cost: number | null
          follow_up_date: string | null
          recovery_status: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          animal_id: string
          record_type: string
          record_date: string
          description: string
          symptoms?: Json | null
          diagnosis?: string | null
          treatment?: string | null
          medications?: Json | null
          veterinarian_id?: string | null
          cost?: number | null
          follow_up_date?: string | null
          recovery_status?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          animal_id?: string
          record_type?: string
          record_date?: string
          description?: string
          symptoms?: Json | null
          diagnosis?: string | null
          treatment?: string | null
          medications?: Json | null
          veterinarian_id?: string | null
          cost?: number | null
          follow_up_date?: string | null
          recovery_status?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      weather_data: {
        Row: {
          id: string
          tenant_id: string
          farm_id: string | null
          recorded_date: string
          temperature_min: number | null
          temperature_max: number | null
          temperature_avg: number | null
          humidity: number | null
          rainfall: number | null
          wind_speed: number | null
          wind_direction: string | null
          pressure: number | null
          uv_index: number | null
          weather_condition: string | null
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          farm_id?: string | null
          recorded_date: string
          temperature_min?: number | null
          temperature_max?: number | null
          temperature_avg?: number | null
          humidity?: number | null
          rainfall?: number | null
          wind_speed?: number | null
          wind_direction?: string | null
          pressure?: number | null
          uv_index?: number | null
          weather_condition?: string | null
          source: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          farm_id?: string | null
          recorded_date?: string
          temperature_min?: number | null
          temperature_max?: number | null
          temperature_avg?: number | null
          humidity?: number | null
          rainfall?: number | null
          wind_speed?: number | null
          wind_direction?: string | null
          pressure?: number | null
          uv_index?: number | null
          weather_condition?: string | null
          source?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'owner' | 'manager' | 'worker' | 'viewer'
      subscription_tier: 'free' | 'basic' | 'premium' | 'enterprise'
      farm_type: 'crop' | 'livestock' | 'mixed' | 'aquaculture' | 'poultry'
      animal_status: 'active' | 'sold' | 'deceased' | 'retired'
      crop_status: 'planning' | 'planted' | 'growing' | 'harvested' | 'failed'
      transaction_type: 'income' | 'expense'
      breeding_method: 'natural' | 'artificial_insemination' | 'embryo_transfer'
      health_record_type: 'vaccination' | 'treatment' | 'checkup' | 'surgery' | 'death'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}