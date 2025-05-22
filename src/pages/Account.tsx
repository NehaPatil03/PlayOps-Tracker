import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Hourglass } from 'lucide-react';

const Account: React.FC = () => {
  const { user, profile, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Refresh profile data when component mounts
    refreshProfile();
  }, [refreshProfile]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  // Format time balance to HH:MM:SS
  const formatTimeBalance = (hours: number | undefined) => {
    if (hours === undefined) return "00:00:00";
    
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.floor(((hours - h) * 60 - m) * 60);
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  // Format date to relative time (e.g., "2 hours ago")
  const formatLastActive = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) {
      return 'Just now';
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)} minutes ago`;
    } else if (diffSeconds < 86400) {
      return `${Math.floor(diffSeconds / 3600)} hours ago`;
    } else {
      return `${Math.floor(diffSeconds / 86400)} days ago`;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="PlayOps" subtitle="PlayOps Training Ground" />
      
      <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
      
      <div className="relative px-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gray-300 rounded-full border-4 border-black -mt-10 flex items-center justify-center text-black font-bold">
            {profile?.username?.slice(0, 2).toUpperCase() || 'PO'}
          </div>
        </div>
        
        <div className="text-center mt-2 mb-4">
          <h1 className="font-medium">{profile?.username || 'PlayOps User'}</h1>
          <div className="text-sm text-gray-400">
            Streak: {profile?.streak_days || 0}d • XP: {profile?.xp_points || 0}
          </div>
          <button className="mt-1 px-3 py-1 text-xs bg-gray-800 rounded-full">
            Contact us
          </button>
          
          <div className="mt-2 inline-block px-4 py-1 bg-gray-800 rounded-full text-sm">
            {profile?.username || 'PlayOps User'}
          </div>
        </div>
      </div>
      
      <div className="px-4">
        <div className="flex justify-between text-sm mb-1">
          <div className="text-gray-400">
            <div>Streaks</div>
            <div className="text-playops-accent font-bold">{profile?.streak_days || 0} Days</div>
          </div>
          
          <div className="text-center">
            <div className="text-gray-400">Leaderboard Rank</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-playops-accent">🏆</span>
              <span className="text-white font-bold">#{profile?.rank || 'N/A'}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-gray-400">XP Points</div>
            <div className="flex items-center justify-end gap-1">
              <span className="text-playops-accent">⭐</span>
              <span className="text-white font-bold">{profile?.xp_points || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-2 mb-1">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">Level Progress</span>
            <span className="text-xs text-gray-400">Level {profile?.level || 1}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{
                width: `${Math.min(100, ((profile?.xp_points || 0) % 1000) / 10)}%`
              }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="px-4 mt-6">
        <h2 className="text-lg font-medium mb-4">Game Statistics</h2>
        
        <div className="bg-gray-900 rounded-lg p-4 flex justify-between items-center mb-3">
          <div>
            <div className="text-sm text-gray-400">Time Balance</div>
            <div className="text-playops-accent font-bold">
              {formatTimeBalance(profile?.time_balance || 0)}
            </div>
          </div>
          <Hourglass className="text-gray-500" />
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4 flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-400">Last Active</div>
            <div className="font-bold">
              {formatLastActive(profile?.last_active)}
            </div>
          </div>
          <Clock className="text-gray-500" />
        </div>

        {profile?.time_balance !== undefined && profile.time_balance <= 24 && (
          <div className="mt-4 bg-red-900 text-white p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-1">Low Time Balance Warning</h3>
            <p className="text-sm">
              Your time balance is running low. Complete missions or participate in activities to earn more time!
            </p>
          </div>
        )}

        {user?.email === 'admin@playops.com' && (
          <button 
            onClick={() => navigate('/admin')}
            className="w-full py-3 mt-6 bg-green-600 text-white rounded-lg"
          >
            Admin Dashboard
          </button>
        )}
      </div>
      
      <div className="px-4 mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full py-3 mt-6 bg-red-600 text-white rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Account;
