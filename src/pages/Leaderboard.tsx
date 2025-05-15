
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardUserProps {
  rank?: number;
  username: string;
  streakDays: number;
  xpPoints: number;
  level: number;
  avatarUrl?: string;
}

const LeaderboardUser: React.FC<LeaderboardUserProps> = ({
  rank,
  username,
  streakDays,
  xpPoints,
  level,
  avatarUrl
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-800">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs">
              {username.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-1">
            {rank && <span className="font-bold">#{rank}</span>}
            <span className="font-medium">{username}</span>
          </div>
          <div className="text-xs text-gray-400">
            Streak: {streakDays} • XP: {xpPoints}
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
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'allTime'>('daily');
  
  // Mock leaderboard data
  const users: LeaderboardUserProps[] = [
    { rank: 1, username: '@Lian Pham', streakDays: 120, xpPoints: 2307, level: 33 },
    { rank: 2, username: '@Lian Pham', streakDays: 120, xpPoints: 2307, level: 33 },
    { rank: 3, username: '@Lian Pham', streakDays: 120, xpPoints: 2307, level: 33 },
    { username: '@Lian Pham', streakDays: 120, xpPoints: 2307, level: 33 },
    { username: '@Lian Pham', streakDays: 120, xpPoints: 2307, level: 33 },
    { username: '@Lian Pham', streakDays: 120, xpPoints: 2307, level: 33 },
  ];
  
  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="Leaderboard" showBack />
      
      <div className="flex justify-around p-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 border-2 border-playops-accent">
          {/* Avatar placeholder */}
        </div>
        <div className="flex flex-col items-center justify-center">
          <h2 className="font-medium">@Lian Pham</h2>
          <div className="text-xs text-gray-400">
            Streak: 150 • XP: 3250
          </div>
          <button className="mt-1 px-3 py-1 text-xs bg-gray-800 rounded-full">Country us</button>
        </div>
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800">
          {/* Avatar placeholder */}
        </div>
      </div>
      
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
      
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-gray-900 text-white rounded-lg py-2 pl-10 pr-4 border border-gray-800"
          />
        </div>
      </div>
      
      <div>
        {users.map((user, index) => (
          <LeaderboardUser key={index} {...user} />
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
