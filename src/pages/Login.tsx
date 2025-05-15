
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { authService } from '@/services/authService';

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
        const success = await signup(email, password, username);
        if (success) {
          toast.success('Account created successfully!');
          setShowConfirmationMessage(true);
        }
      } else {
        const success = await login(email, password);
        if (success) {
          toast.success('Welcome back!');
          navigate('/');
        } else {
          // Handle failed login - could be due to email not being confirmed
          const errorMessage = 'Login failed. If you just created your account, please check your email and confirm your registration before logging in.';
          toast.error(errorMessage);
          setShowConfirmationMessage(true); // Show confirmation message with resend option
        }
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Authentication failed';
      
      // Check if the error is about email confirmation
      if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
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
      await authService.resendConfirmationEmail(email);
      toast.success('Confirmation email has been resent! Please check your inbox.');
    } catch (error: any) {
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
                Please check your inbox and click the confirmation link to activate your account.
              </p>
              <button 
                onClick={handleResendConfirmation}
                disabled={resendLoading}
                className="mb-4 py-2 px-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
              >
                {resendLoading ? 'Sending...' : 'Resend confirmation email'}
              </button>
            </div>
            
            <button 
              onClick={() => setShowConfirmationMessage(false)}
              className="w-full py-3 bg-playops-accent text-black font-medium rounded"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <button className="w-full py-3 bg-blue-600 rounded text-white font-medium mb-4">
              {isSignUp ? 'Sign up with Telegram' : 'Login with Telegram'}
            </button>
            
            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="flex-shrink mx-4 text-gray-500">Or continue with</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>
            
            <form onSubmit={handleSubmit}>
              {isSignUp && (
                <div className="mb-4">
                  <label className="block text-sm text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username"
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-playops-accent text-black font-medium rounded"
              >
                {isLoading 
                  ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                  : (isSignUp ? 'Sign up' : 'Sign in')}
              </button>
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
