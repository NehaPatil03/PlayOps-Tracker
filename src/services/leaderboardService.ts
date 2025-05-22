
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/services/profileService";

export interface LeaderboardFilters {
  timeframe: 'daily' | 'weekly' | 'allTime';
  searchQuery?: string;
}

export interface RankedProfile extends Profile {
  rank: number;
}

export const leaderboardService = {
  /**
   * Get all profiles for the leaderboard with ranking
   */
  getLeaderboard: async (filters: LeaderboardFilters): Promise<RankedProfile[]> => {
    try {
      const now = new Date();
      let query = supabase.from('profiles').select();
      
      // Apply timeframe filtering
      if (filters.timeframe === 'daily') {
        // Get profiles with activity in the last 24 hours
        const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString();
        query = query.gte('last_active', oneDayAgo);
      } else if (filters.timeframe === 'weekly') {
        // Get profiles with activity in the last 7 days
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString();
        query = query.gte('last_active', sevenDaysAgo);
      }
      
      // Get profiles sorted by XP
      const { data, error } = await query
        .order('xp_points', { ascending: false });
      
      if (error) {
        console.error("Error fetching leaderboard:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Apply ranking
      const rankedProfiles = data.map((profile, index) => ({
        ...profile,
        rank: index + 1
      })) as RankedProfile[];
      
      // Apply search filtering if needed
      let filteredProfiles = rankedProfiles;
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const searchLower = filters.searchQuery.toLowerCase();
        filteredProfiles = rankedProfiles.filter(profile => 
          profile.username.toLowerCase().includes(searchLower)
        );
      }
      
      return filteredProfiles;
    } catch (error) {
      console.error("Error in getLeaderboard:", error);
      return [];
    }
  },
  
  /**
   * Get the current user's leaderboard position
   */
  getCurrentUserRank: async (userId: string): Promise<number | null> => {
    try {
      // First get the user's XP directly
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('xp_points')
        .eq('id', userId)
        .single();
      
      if (userError || !userData) {
        console.error("Error fetching current user XP:", userError);
        return null;
      }
      
      const userXp = userData.xp_points;
      
      // Then get all profiles with higher XP
      const { data: higherProfiles, error: countError } = await supabase
        .from('profiles')
        .select('id')
        .gt('xp_points', userXp);
      
      if (countError) {
        console.error("Error counting higher ranked users:", countError);
        return null;
      }
      
      // Rank is count + 1 (0-based array to 1-based rank)
      return (higherProfiles?.length || 0) + 1;
    } catch (error) {
      console.error("Error in getCurrentUserRank:", error);
      return null;
    }
  }
};
