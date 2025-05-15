
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
      // Use env vars for SUPABASE_URL and SUPABASE_ANON_KEY
      'https://cyybipewxsatzqxarohn.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5eWJpcGV3eHNhdHpxeGFyb2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzA4ODEsImV4cCI6MjA2MjcwNjg4MX0.dhajrcWIwBmyp8FsnmshYF1HiLh1b87cn8X7O_WtrFk'
    )

    // Update time balances (hourly job)
    const { error: timeError } = await supabaseClient.rpc('update_time_balances')
    if (timeError) throw timeError
    
    // Update user streaks (daily job) - only run once a day
    const now = new Date()
    if (now.getHours() === 0) { // Run at midnight
      const { error: streakError } = await supabaseClient.rpc('update_user_streaks')
      if (streakError) throw streakError
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Stats updated successfully' }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
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
