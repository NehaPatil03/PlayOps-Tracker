
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { leaderboardService, LeaderboardFilters, RankedProfile } from '@/services/leaderboardService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';

interface LeaderboardUserProps {
  profile: RankedProfile;
  isCurrent?: boolean;
}

const LeaderboardUser: React.FC<LeaderboardUserProps> = ({
  profile,
  isCurrent = false
}) => {
  const { rank, username, streak_days, xp_points, level, avatar_url } = profile;
  
  // Extract initials from username for avatar fallback
  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : '??';
  
  return (
    <div className={cn(
      "flex items-center justify-between p-4 border-b border-gray-800",
      isCurrent && "bg-gray-800/50"
    )}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-800">
          <Avatar>
            <AvatarImage src={avatar_url || undefined} alt={username} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
        
        <div>
          <div className="flex items-center gap-1">
            {rank !== undefined && <span className="font-bold">#{rank}</span>}
            <span className="font-medium">{username}</span>
            {isCurrent && <span className="ml-1 text-xs bg-playops-accent/20 text-playops-accent px-2 py-0.5 rounded-full">You</span>}
          </div>
          <div className="text-xs text-gray-400">
            Streak: {streak_days} • XP: {xp_points}
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <span className="text-sm">Lvl {level}</span>
      </div>
    </div>
  );
};

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => {
  return (
    <button 
      className={cn(
        "flex-1 py-2 text-sm",
        isActive 
          ? "text-playops-accent border-b-2 border-playops-accent font-medium"
          : "text-gray-400"
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

const Leaderboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'allTime'>('daily');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Query for leaderboard data with automatic refresh every 30 seconds
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard', activeTab, debouncedSearch],
    queryFn: () => leaderboardService.getLeaderboard({ 
      timeframe: activeTab, 
      searchQuery: debouncedSearch 
    }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Find top 3 users and current user
  const topUsers = leaderboardData?.slice(0, 3) || [];
  const otherUsers = leaderboardData?.slice(3) || [];
  const currentUserEntry = leaderboardData?.find(p => p.id === user?.id);
  
  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="Leaderboard" showBack />
      
      {/* Top 3 podium section */}
      <div className="flex justify-around items-end p-4 mb-4">
        {/* Second place */}
        {topUsers[1] ? (
          <div className="flex flex-col items-center">
            <Avatar className="w-16 h-16 border-2 border-gray-400">
              <AvatarImage src={topUsers[1].avatar_url || undefined} alt={topUsers[1].username} />
              <AvatarFallback>{topUsers[1].username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="mt-2 text-center">
              <div className="text-sm font-bold">#{topUsers[1].rank}</div>
              <div className="text-xs truncate max-w-[80px]">{topUsers[1].username}</div>
              <div className="text-xs text-gray-400">XP: {topUsers[1].xp_points}</div>
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-800"></div>
        )}
        
        {/* First place */}
        {topUsers[0] ? (
          <div className="flex flex-col items-center -mt-4">
            <Avatar className="w-20 h-20 border-2 border-playops-accent">
              <AvatarImage src={topUsers[0].avatar_url || undefined} alt={topUsers[0].username} />
              <AvatarFallback>{topUsers[0].username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="mt-2 text-center">
              <div className="text-sm font-bold">#{topUsers[0].rank}</div>
              <div className="text-xs truncate max-w-[80px]">{topUsers[0].username}</div>
              <div className="text-xs text-gray-400">XP: {topUsers[0].xp_points}</div>
            </div>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-800"></div>
        )}
        
        {/* Third place */}
        {topUsers[2] ? (
          <div className="flex flex-col items-center">
            <Avatar className="w-16 h-16 border-2 border-gray-700">
              <AvatarImage src={topUsers[2].avatar_url || undefined} alt={topUsers[2].username} />
              <AvatarFallback>{topUsers[2].username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="mt-2 text-center">
              <div className="text-sm font-bold">#{topUsers[2].rank}</div>
              <div className="text-xs truncate max-w-[80px]">{topUsers[2].username}</div>
              <div className="text-xs text-gray-400">XP: {topUsers[2].xp_points}</div>
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-800"></div>
        )}
      </div>
      
      {/* Current user stats */}
      {currentUserEntry && (
        <div className="px-4 mb-4">
          <div className="bg-gray-900 rounded-lg p-3 flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username} />
              <AvatarFallback>
                {profile?.username?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <span className="font-medium">#{currentUserEntry.rank}</span>
                <span className="ml-2">{profile?.username}</span>
              </div>
              <div className="text-xs text-gray-400">
                Streak: {profile?.streak_days || 0} • XP: {profile?.xp_points || 0} • Level {profile?.level || 1}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs for timeframe selection */}
      <div className="flex border-b border-gray-800 mb-4">
        <Tab 
          label="Daily" 
          isActive={activeTab === 'daily'} 
          onClick={() => setActiveTab('daily')} 
        />
        <Tab 
          label="Weekly" 
          isActive={activeTab === 'weekly'} 
          onClick={() => setActiveTab('weekly')} 
        />
        <Tab 
          label="All Time" 
          isActive={activeTab === 'allTime'} 
          onClick={() => setActiveTab('allTime')} 
        />
      </div>
      
      {/* Search input */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text" 
            placeholder="Search by username" 
            className="w-full bg-gray-900 text-white rounded-lg py-2 pl-10 pr-4 border border-gray-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center p-8">
          <div className="animate-pulse text-gray-400">Loading leaderboard...</div>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && leaderboardData?.length === 0 && (
        <div className="text-center p-8 text-gray-400">
          No users found{debouncedSearch ? ' matching "' + debouncedSearch + '"' : ''}.
        </div>
      )}
      
      {/* List of other users */}
      <div className="flex-grow overflow-auto">
        {otherUsers.map((profile) => (
          <LeaderboardUser 
            key={profile.id} 
            profile={profile} 
            isCurrent={profile.id === user?.id}
          />
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
