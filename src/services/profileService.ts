
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
      console.error("Error fetching profiles:", error);
      throw error;
    }
    
    return data || [];
  },

  /**
   * Get a single profile by ID
   */
  getProfileById: async (id: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      // Calculate real-time time balance
      if (data) {
        const now = new Date();
        const lastActive = new Date(data.last_active);
        const hoursSinceLastActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
        
        // Apply real-time decay if more than 1 hour has passed
        if (hoursSinceLastActive >= 1) {
          const hoursToDecay = Math.floor(hoursSinceLastActive);
          console.log(`Real-time decay: ${hoursToDecay} hours from balance ${data.time_balance}`);
          const newBalance = Math.max(0, data.time_balance - hoursToDecay);
          data.time_balance = newBalance;
          
          // Silently update the time balance in the background
          profileService.updateTimeBalance(id, newBalance).catch(err => {
            console.error("Error updating time balance in background:", err);
          });
        }
      }
      
      return data;
    } catch (error) {
      console.error("Error in getProfileById:", error);
      // Return null instead of throwing to avoid breaking the UI
      return null;
    }
  },

  /**
   * Get a profile directly bypassing RLS policies using a serverless function
   * This is used to work around infinite recursion in RLS policy issues
   */
  getProfileDirectWithoutRLS: async (id: string) => {
    try {
      console.log(`Fetching profile directly for user ${id}`);
      // Direct query bypassing RLS
      const response = await fetch(`https://cyybipewxsatzqxarohn.supabase.co/functions/v1/get-profile?userId=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Profile fetched directly:", data);
      return data;
    } catch (error) {
      console.error("Error in getProfileDirectWithoutRLS:", error);
      throw error;
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUserProfile: async (): Promise<Profile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      return profileService.getProfileById(user.id);
    } catch (error) {
      console.error("Error getting current user profile:", error);
      return null;
    }
  },

  /**
   * Update a user's profile
   */
  updateProfile: async (id: string, updates: Partial<Profile>): Promise<Profile> => {
    // Always update last_active when the profile is updated
    updates.last_active = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Update a user's time balance directly
   */
  updateTimeBalance: async (id: string, newTimeBalance: number): Promise<void> => {
    console.log(`Updating time balance for user ${id} to ${newTimeBalance} hours`);
    const { error } = await supabase
      .from('profiles')
      .update({ 
        time_balance: newTimeBalance,
        last_active: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error("Error updating time balance:", error);
      throw error;
    }
  },
  
  /**
   * Adjust a user's time balance by adding or subtracting hours
   */
  adjustTimeBalance: async (id: string, hoursChange: number): Promise<Profile> => {
    // First get current profile to calculate new time balance
    const profile = await profileService.getProfileById(id);
    
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    console.log(`Adjusting time balance for user ${id} by ${hoursChange} hours. Current: ${profile.time_balance}`);
    const newTimeBalance = Math.max(0, profile.time_balance + hoursChange);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        time_balance: newTimeBalance,
        last_active: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      console.error("Error adjusting time balance:", error);
      throw error;
    }
    
    return data;
  },

  /**
   * Update a user's XP points
   */
  updateXP: async (id: string, xpChange: number): Promise<Profile> => {
    // First get current profile to calculate new XP
    const profile = await profileService.getProfileById(id);
    
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    const newXP = Math.max(0, profile.xp_points + xpChange);
    
    // Calculate new level based on XP (1000 XP per level)
    const newLevel = Math.floor(newXP / 1000) + 1;
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        xp_points: newXP,
        level: newLevel,
        last_active: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      console.error("Error updating XP:", error);
      throw error;
    }
    
    return data;
  }
};
