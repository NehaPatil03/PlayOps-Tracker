import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Mission, missionService } from '@/services/missionService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface MissionItemProps {
  mission: Mission;
  onComplete: () => Promise<void>;
  isCompleting: boolean;
}

const MissionItem: React.FC<MissionItemProps> = ({ 
  mission,
  onComplete,
  isCompleting
}) => {
  const getMissionIcon = (type: string) => {
    // Different icon styles based on mission type
    switch(type.toLowerCase()) {
      case 'qotd':
        return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-800">Q</span>;
      case 'networking event':
      case 'networking':
        return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-800">📅</span>;
      case 'small workshop':
      case 'workshop_small':
        return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-800">📝</span>;
      case 'big workshop':
      case 'workshop_big':
        return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-800">📚</span>;
      case 'future ready drop':
      case 'future_ready_drop':
        return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-800">🎯</span>;
      case 'speaker session':
      case 'speaker':
        return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-800">🎤</span>;
      default:
        return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800">📌</span>;
    }
  };

  // Format time reward as +X hrs or -X hrs
  const formatTimeReward = (timeReward: number) => {
    if (timeReward > 0) return `+${timeReward} hrs`;
    if (timeReward < 0) return `${timeReward} hrs`;
    return '0 hrs';
  };

  // Open telegram link in new tab
  const openTelegramLink = async () => {
    try {
      if (mission.telegram_link) {
        window.open(mission.telegram_link, '_blank');
      }
      await onComplete();
    } catch (error) {
      console.error("Error completing mission:", error);
    }
  };

  return (
    <div className="border-b border-gray-800 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-playops-accent">{getMissionIcon(mission.mission_type)}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{mission.title}</span>
            </div>
            <div className="flex text-xs text-gray-400 gap-2">
              <span>{mission.mission_type}</span>
              {mission.description && <span>• {mission.description}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-playops-accent text-sm mr-2">{formatTimeReward(mission.time_reward)}</span>
          <span className="text-gray-600">›</span>
        </div>
      </div>
      
      <div className="mt-3">
        <button 
          className="w-full flex items-center justify-center gap-2 py-2 text-sm border border-gray-800 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={openTelegramLink}
          disabled={isCompleting}
        >
          {isCompleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <MessageSquare className="w-4 h-4" />
              <span>Complete in Telegram</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const Missions: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const [completingMissionId, setCompletingMissionId] = useState<string | null>(null);
  
  // Fetch all active missions
  const { data: missions, isLoading: isMissionsLoading, error: missionsError } = useQuery({
    queryKey: ['missions'],
    queryFn: missionService.getMissions
  });
  
  // Fetch user's completed missions to track which ones are already done
  const { data: completedMissions, isLoading: isCompletedLoading } = useQuery({
    queryKey: ['completedMissions', user?.id],
    queryFn: () => user?.id ? missionService.getUserCompletedMissions(user.id) : Promise.resolve([]),
    enabled: !!user?.id
  });
  
  // Mutation to complete a mission
  const completeMissionMutation = useMutation({
    mutationFn: async ({ userId, missionId }: { userId: string, missionId: string }) => {
      console.log(`Completing mission ${missionId} for user ${userId}`);
      await missionService.completeMission(userId, missionId);
    },
    onSuccess: () => {
      console.log("Mission completed successfully");
      queryClient.invalidateQueries({ queryKey: ['completedMissions'] });
      
      if (refreshProfile) {
        console.log("Refreshing profile after mission completion");
        refreshProfile();
      }
      
      toast({
        title: "Mission completed!",
        description: "Your rewards have been credited to your account.",
      });
    },
    onError: (error) => {
      console.error("Mission completion error:", error);
      toast({
        title: "Failed to complete mission",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  });
  
  const handleCompleteMission = async (mission: Mission) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to complete missions",
        variant: "destructive"
      });
      return;
    }
    
    setCompletingMissionId(mission.id);
    try {
      console.log(`Attempting to complete mission: ${mission.title}`);
      await completeMissionMutation.mutateAsync({ userId: user.id, missionId: mission.id });
    } catch (error) {
      console.error("Error in handleCompleteMission:", error);
    } finally {
      setCompletingMissionId(null);
    }
  };
  
  // Check if a mission has been completed by the user
  const isMissionCompleted = (missionId: string) => {
    return completedMissions?.some(completed => completed.mission_id === missionId) ?? false;
  };
  
  // Filter out completed missions if needed
  const activeMissions = missions?.filter(mission => !isMissionCompleted(mission.id)) || [];
  
  // Ensure missions are loaded
  useEffect(() => {
    console.log("Missions loaded:", missions);
  }, [missions]);

  if (missionsError) {
    return (
      <div className="flex flex-col min-h-screen pb-20">
        <Header title="Missions" showBack />
        <div className="p-4 text-center">
          <p className="text-red-500">Error loading missions. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header 
        title="Missions" 
        showBack
      />
      
      <div className="px-4">
        {(isMissionsLoading || isCompletedLoading) ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-playops-accent" />
          </div>
        ) : activeMissions.length > 0 ? (
          activeMissions.map(mission => (
            <MissionItem 
              key={mission.id}
              mission={mission}
              onComplete={() => handleCompleteMission(mission)}
              isCompleting={completingMissionId === mission.id}
            />
          ))
        ) : (
          <div className="py-8 text-center text-gray-400">
            <p>No active missions available at the moment.</p>
            <p className="mt-2">Check back later for new missions!</p>
          </div>
        )}
      </div>
      
      <div className="mt-auto px-4 py-4 bg-black bg-opacity-50 flex items-center">
        <span className="flex items-center text-xs text-orange-400">
          <span className="mr-2">⚡</span>
          All missions must be completed in the Telegram group. Your time updates based on your activity.
        </span>
      </div>
    </div>
  );
};

export default Missions;
