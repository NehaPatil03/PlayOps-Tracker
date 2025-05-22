
import React from 'react';
import { Profile } from '@/services/profileService';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  profile: Profile | null;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ profile }) => {
  // Calculate XP progress as percentage within current level (0-100%)
  const xpProgress = Math.min(100, ((profile?.xp_points || 0) % 1000) / 10);
  
  return (
    <div className="px-4 mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-400">Progress</span>
        <span className="text-xs text-gray-400">Level {profile?.level || 1}</span>
      </div>
      <Progress value={xpProgress} className="h-2 bg-gray-700" />
    </div>
  );
};

export default ProgressBar;
