
import React from 'react';
import { Profile } from '@/services/profileService';

interface UserStatsProps {
  profile: Profile | null;
}

const UserStats: React.FC<UserStatsProps> = ({ profile }) => {
  return (
    <div className="px-4 mb-4">
      <div className="flex justify-between text-xs mb-1">
        <div className="text-gray-400">
          <div>Streaks</div>
          <div className="text-playops-accent font-bold">{profile?.streak_days || 0} Days</div>
        </div>

        <div className="text-center">
          <div className="text-gray-400">Leaderboard Rank</div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-playops-accent">⭐</span>
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
    </div>
  );
};

export default UserStats;
