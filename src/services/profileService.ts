
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  streak_days: number;
  xp_points: number;
  level: number;
  rank?: number;
  time_balance: number;
  last_active: string;
  created_at: string;
  updated_at: string;
}

export const profileService = {
  /**
   * Get all profiles for the leaderboard
   */
  getProfiles: async (): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('xp_points', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data;
  },

  /**
   * Get a single profile by ID
   */
  getProfileById: async (id: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },

  /**
   * Get current user profile
   */
  getCurrentUserProfile: async (): Promise<Profile | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    return profileService.getProfileById(user.id);
  },

  /**
   * Update a user's profile
   */
  updateProfile: async (id: string, updates: Partial<Profile>): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
};
