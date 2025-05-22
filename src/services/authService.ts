
import { supabase } from "@/integrations/supabase/client";

export const authService = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    try {
      console.log("Attempting sign in for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error);
        // Enhanced logging for debugging
        console.error("Error code:", error.status);
        console.error("Error message:", error.message);
        throw error;
      }
      
      console.log("Sign in successful for:", email);
      return data;
    } catch (error: any) {
      // Enhance error message for better user feedback
      console.error("Sign in exception:", error);
      
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        console.log("Detected unconfirmed email issue");
        throw new Error('Please confirm your email address before signing in');
      }
      
      throw error;
    }
  },

  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string, username: string) => {
    try {
      console.log("Attempting sign up for:", email);
      
      // Make sure the redirect URL is absolute with domain
      const redirectUrl = `${window.location.origin}/login`;
      console.log("Using redirect URL:", redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: redirectUrl,
        }
      });
      
      if (error) {
        console.error("Sign up error:", error);
        throw error;
      }
      
      console.log("Sign up successful, confirmation email sent to:", email);
      return data;
    } catch (error) {
      console.error("Sign up exception:", error);
      throw error;
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  },

  /**
   * Get the current session
   */
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Get session error:", error);
        throw error;
      }
      return data.session;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Resend confirmation email with improved error handling
   */
  resendConfirmationEmail: async (email: string) => {
    try {
      console.log("Attempting to resend confirmation email to:", email);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        }
      });
      
      if (error) {
        console.error("Resend confirmation error:", error);
        throw error;
      }
      
      console.log("Confirmation email resent successfully to:", email);
      return true;
    } catch (error: any) {
      console.error("Failed to resend confirmation email:", error);
      throw error;
    }
  },
};
