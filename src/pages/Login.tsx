
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && (!email || !password || !username)) {
      toast.error('Please fill in all fields');
      return;
    } else if (!isSignUp && (!email || !password)) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        console.log("Attempting signup with:", { email, username });
        const success = await signup(email, password, username);
        if (success) {
          toast.success('Account created successfully! Please check your email for confirmation.');
          setShowConfirmationMessage(true);
        }
      } else {
        console.log("Attempting login with email:", email);
        const success = await login(email, password);
        if (success) {
          toast.success('Welcome back!');
          navigate('/');
        } else {
          // Check if this might be an unconfirmed email
          const message = 'Login failed. If you just created your account, please check your email and confirm your registration before logging in.';
          toast.error(message);
          setShowConfirmationMessage(true); // Show confirmation message with resend option
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      let errorMessage = error.message || 'Authentication failed';
      
      // Check if the error is about email confirmation
      if (errorMessage.toLowerCase().includes('email') && 
          (errorMessage.toLowerCase().includes('not confirmed') || 
           errorMessage.toLowerCase().includes('confirmation'))) {
        errorMessage = 'Please check your email and confirm your registration before logging in.';
        setShowConfirmationMessage(true);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setResendLoading(true);
      console.log("Attempting to resend confirmation to:", email);
      await authService.resendConfirmationEmail(email);
      toast.success('Confirmation email has been resent! Please check your inbox and spam folder.');
    } catch (error: any) {
      console.error('Error resending confirmation:', error);
      toast.error(error.message || 'Failed to resend confirmation email. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-playops-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1">PlayOps</h1>
          <p className="text-gray-400">
            {showConfirmationMessage 
              ? 'Please check your email to confirm your registration'
              : (isSignUp 
                ? 'Create an account to join PlayOps Training Ground' 
                : 'Sign in to continue to PlayOps Training Ground')}
          </p>
        </div>
        
        {showConfirmationMessage ? (
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <p className="text-white mb-4">
                A confirmation email has been sent to <span className="text-playops-accent font-medium">{email}</span>
              </p>
              <p className="text-gray-400 mb-6">
                Please check your inbox (and spam folder) and click the confirmation link to activate your account.
              </p>
              <Button 
                onClick={handleResendConfirmation}
                disabled={resendLoading}
                className="mb-4 py-2 px-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 w-full"
              >
                {resendLoading ? 'Sending...' : 'Resend confirmation email'}
              </Button>
            </div>
            
            <Button 
              onClick={() => setShowConfirmationMessage(false)}
              className="w-full py-3 bg-playops-accent text-black font-medium rounded"
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <Button className="w-full py-3 bg-blue-600 rounded text-white font-medium mb-4">
              {isSignUp ? 'Sign up with Telegram' : 'Login with Telegram'}
            </Button>
            
            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="flex-shrink mx-4 text-gray-500">Or continue with</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>
            
            <form onSubmit={handleSubmit}>
              {isSignUp && (
                <div className="mb-4">
                  <Label className="block text-sm text-gray-300 mb-1">Username</Label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username"
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                  />
                </div>
              )}
              
              <div className="mb-4">
                <Label className="block text-sm text-gray-300 mb-1">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                />
              </div>
              
              <div className="mb-6">
                <Label className="block text-sm text-gray-300 mb-1">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-playops-accent text-black font-medium rounded"
              >
                {isLoading 
                  ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                  : (isSignUp ? 'Sign up' : 'Sign in')}
              </Button>
            </form>
          </div>
        )}
        
        <div className="text-center text-gray-400 text-sm">
          {isSignUp ? (
            <>
              Already have an account? <span className="text-playops-accent cursor-pointer" onClick={() => {setIsSignUp(false); setShowConfirmationMessage(false);}}>Sign in</span>
            </>
          ) : (
            <>
              Don't have an account? <span className="text-playops-accent cursor-pointer" onClick={() => {setIsSignUp(true); setShowConfirmationMessage(false);}}>Sign up</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
