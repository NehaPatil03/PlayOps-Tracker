
import { supabase } from "@/integrations/supabase/client";
import { profileService } from "./profileService";

export interface Mission {
  id: string;
  title: string;
  description?: string;
  mission_type: string;
  time_reward: number;
  xp_reward: number;
  telegram_link?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserMission {
  id: string;
  user_id: string;
  mission_id: string;
  completed_at: string;
  mission?: Mission;
}

export const missionService = {
  /**
   * Get all active missions
   */
  getMissions: async (): Promise<Mission[]> => {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching missions:", error);
      throw error;
    }
    
    return data;
  },

  /**
   * Get completed missions for a user
   */
  getUserCompletedMissions: async (userId: string): Promise<UserMission[]> => {
    const { data, error } = await supabase
      .from('user_missions')
      .select(`
        *,
        mission:missions(*)
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error fetching completed missions:", error);
      throw error;
    }
    
    return data;
  },

  /**
   * Mark a mission as completed and update user profile with rewards
   */
  completeMission: async (userId: string, missionId: string): Promise<void> => {
    console.log(`Completing mission ${missionId} for user ${userId}`);
    
    // First, check if the mission exists
    const { data: mission, error: missionError } = await supabase
      .from('missions')
      .select('*')
      .eq('id', missionId)
      .single();
    
    if (missionError) {
      console.error("Error fetching mission:", missionError);
      throw new Error("Mission not found");
    }
    
    // Check if the user has already completed this mission
    const { data: existingCompletion, error: existingError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', userId)
      .eq('mission_id', missionId);
    
    if (existingError) {
      console.error("Error checking existing completion:", existingError);
      throw existingError;
    }
    
    if (existingCompletion && existingCompletion.length > 0) {
      console.log(`Mission ${missionId} already completed by user ${userId}`);
      throw new Error("You have already completed this mission");
    }
    
    // Insert the user_mission record
    const { error } = await supabase
      .from('user_missions')
      .insert({
        user_id: userId,
        mission_id: missionId
      });
    
    if (error) {
      console.error("Error inserting user mission:", error);
      throw error;
    }
    
    // Get the current profile for the user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('xp_points, time_balance, level')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      throw profileError;
    }
    
    // Calculate new values
    const newXp = profile.xp_points + mission.xp_reward;
    const newTimeBalance = Math.max(0, profile.time_balance + mission.time_reward);
    const newLevel = Math.floor(newXp / 1000) + 1;
    
    console.log(`Mission rewards: XP +${mission.xp_reward}, Time ${mission.time_reward > 0 ? '+' : ''}${mission.time_reward}h`);
    console.log(`User ${userId} new values: XP ${profile.xp_points} → ${newXp}, Time ${profile.time_balance} → ${newTimeBalance}, Level ${profile.level} → ${newLevel}`);
    
    // Update the profile with new values
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        xp_points: newXp,
        time_balance: newTimeBalance,
        level: newLevel,
        last_active: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error("Error updating user profile:", updateError);
      throw updateError;
    }
    
    console.log(`Successfully completed mission ${missionId} for user ${userId}`);
  },
};
