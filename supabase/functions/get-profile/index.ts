
// Follow this setup guide to integrate the Supabase Edge Functions:
// https://supabase.com/docs/functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

export const handler = async (req: Request) => {
  // CORS headers for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      'https://cyybipewxsatzqxarohn.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the user ID from the query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log(`Fetching profile for user: ${userId}`);

    // Get the user's profile using the service role key (bypassing RLS)
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Process profile data
    if (profile) {
      // Calculate real-time time balance
      const now = new Date();
      const lastActive = profile.last_active ? new Date(profile.last_active) : now;
      const hoursSinceLastActive = Math.max(0, (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));
      
      // Apply real-time decay - calculate actual hours and decay precisely
      if (hoursSinceLastActive > 0) {
        const hoursToDecay = hoursSinceLastActive;
        console.log(`Real-time decay calculation: ${hoursToDecay.toFixed(2)} hours from balance ${profile.time_balance}`);
        
        // Calculate new balance without rounding to provide more accurate visual display
        const newBalance = Math.max(0, profile.time_balance - hoursToDecay);
        console.log(`Updated time balance: ${newBalance.toFixed(2)}`);
        
        // Return the exact decimal balance for accurate display
        profile.time_balance = parseFloat(newBalance.toFixed(2));
        
        // Update the time balance in the database - but round to whole number for storage
        const roundedBalance = Math.floor(newBalance);
        await supabaseAdmin
          .from('profiles')
          .update({ 
            time_balance: roundedBalance,
            last_active: now.toISOString()
          })
          .eq('id', userId);
          
        console.log(`Saved time balance to database: ${roundedBalance} hours`);
      } else {
        console.log(`No decay needed. Last active: ${lastActive.toISOString()}`);
      }
    }

    return new Response(
      JSON.stringify({ data: profile }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
};
