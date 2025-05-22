
import { supabase } from "@/integrations/supabase/client";
import { profileService } from "./profileService";

export interface QOTD {
  id: string;
  question: string;
  active_date: string;
  created_at: string;
}

export interface UserResponse {
  id: string;
  user_id: string;
  qotd_id: string;
  response: string;
  sentences_count: number;
  created_at: string;
}

export const qotdService = {
  /**
   * Get today's QOTD
   */
  getTodaysQOTD: async (): Promise<QOTD | null> => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('qotd')
      .select('*')
      .eq('active_date', today)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw error;
    }
    
    return data;
  },

  /**
   * Submit a response to QOTD
   */
  submitResponse: async (userId: string, qotdId: string, response: string): Promise<UserResponse> => {
    // Count sentences (split by period, question mark, or exclamation point)
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentencesCount = sentences.length;
    
    console.log(`QOTD response from user ${userId}: ${sentencesCount} sentences`);
    
    const { data, error } = await supabase
      .from('user_responses')
      .insert({
        user_id: userId,
        qotd_id: qotdId,
        response,
        sentences_count: sentencesCount
      })
      .select('*')
      .single();
    
    if (error) {
      console.error("Error submitting QOTD response:", error);
      throw error;
    }
    
    // Give time reward if the response has 3+ sentences
    if (sentencesCount >= 3) {
      try {
        console.log(`Awarding 6 hours for QOTD response with ${sentencesCount} sentences`);
        // Award 6 hours for a good QOTD response
        await profileService.adjustTimeBalance(userId, 6);
      } catch (rewardError) {
        console.error("Error awarding time for QOTD:", rewardError);
        // Don't fail the submission if reward fails
      }
    } else {
      console.log(`No time award for QOTD - only ${sentencesCount} sentences (minimum 3 required)`);
    }
    
    return data;
  },

  /**
   * Check if user has already responded to today's QOTD
   */
  hasUserRespondedToday: async (userId: string): Promise<boolean> => {
    const todayQOTD = await qotdService.getTodaysQOTD();
    if (!todayQOTD) return false;
    
    const { data, error } = await supabase
      .from('user_responses')
      .select('id')
      .eq('user_id', userId)
      .eq('qotd_id', todayQOTD.id);
    
    if (error) {
      console.error("Error checking user QOTD response:", error);
      throw error;
    }
    
    return data.length > 0;
  },
};
