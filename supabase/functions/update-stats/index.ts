
// Follow this setup guide to integrate the Supabase Edge Functions:
// https://supabase.com/docs/functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseClient = createClient(
      'https://cyybipewxsatzqxarohn.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5eWJpcGV3eHNhdHpxeGFyb2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzA4ODEsImV4cCI6MjA2MjcwNjg4MX0.dhajrcWIwBmyp8FsnmshYF1HiLh1b87cn8X7O_WtrFk'
    )

    console.log("Starting update_time_balances function")
    
    // Get all profiles to calculate accurate time decay for each user
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, time_balance, last_active, created_at')
      .order('created_at', { ascending: false }); // Sort to process newest first
    
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }
    
    // Process each profile individually to apply the correct time decay
    const now = new Date();
    const updates = [];
    
    for (const profile of profiles) {
      try {
        // Skip if profile doesn't have necessary data
        if (!profile?.last_active) {
          console.log(`User ${profile.id}: Skipping due to missing last_active timestamp`);
          continue;
        }
        
        // Convert timestamps to JavaScript Date objects
        const lastActive = new Date(profile.last_active);
        
        // Calculate hours since last activity
        const hoursSinceLastActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
        
        // Only decay time if more than 1 hour has passed
        if (hoursSinceLastActive >= 1) {
          // Decay by the precise number of full hours that have passed
          const hoursToDecay = Math.floor(hoursSinceLastActive);
          console.log(`User ${profile.id}: Decaying ${hoursToDecay} hours. Previous balance: ${profile.time_balance}`);
          
          const newTimeBalance = Math.max(0, profile.time_balance - hoursToDecay);
          
          updates.push({
            id: profile.id,
            time_balance: newTimeBalance,
            last_active: now.toISOString()
          });
        }
      } catch (err) {
        console.error(`Error processing profile ${profile.id}:`, err);
      }
    }
    
    // Batch update all profiles that need updating
    if (updates.length > 0) {
      console.log(`Updating time balances for ${updates.length} profiles`);
      
      // Update in smaller batches to avoid potential issues
      const batchSize = 50;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .upsert(batch);
        
        if (updateError) {
          console.error(`Error updating batch ${i}-${i + batch.length}:`, updateError);
        } else {
          console.log(`Successfully updated batch ${i}-${i + batch.length}`);
        }
      }
      
      console.log(`Successfully updated time balances for ${updates.length} profiles`);
    } else {
      console.log("No profiles needed time balance updates");
    }
    
    // Update user streaks (daily job) - only run once a day
    if (now.getHours() === 0) { // Run at midnight
      console.log("Updating user streaks (midnight job)");
      // Retry streak update up to 3 times
      let streakError = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const { error } = await supabaseClient.rpc('update_user_streaks');
          if (!error) {
            console.log("Successfully updated user streaks");
            streakError = null;
            break;
          }
          streakError = error;
          console.error(`Streak update attempt ${attempt} failed:`, error);
        } catch (err) {
          streakError = err;
          console.error(`Streak update attempt ${attempt} exception:`, err);
        }
      }
      
      if (streakError) {
        console.error("All streak update attempts failed");
        throw streakError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Stats updated successfully', 
        profiles_updated: updates.length,
        timestamp: now.toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error in handler:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error", 
        timestamp: new Date().toISOString() 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 400,
      }
    )
  }
}
