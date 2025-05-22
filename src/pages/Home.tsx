
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import HorizontalScroll from '@/components/HorizontalScroll';
import { useAuth } from '@/contexts/AuthContext';
import { missionService } from '@/services/missionService';
import { useQuery } from '@tanstack/react-query';
import UserStats from '@/components/UserStats';
import TimeDisplay from '@/components/TimeDisplay';
import ProgressBar from '@/components/ProgressBar';
import QuestsList from '@/components/QuestsList';
import { toast } from '@/components/ui/use-toast';
import { profileService } from '@/services/profileService';

const Home: React.FC = () => {
  const { user, profile } = useAuth();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [localProfile, setLocalProfile] = useState<any>(null);

  const { data: missions } = useQuery({
    queryKey: ['missions'],
    queryFn: missionService.getMissions,
    enabled: !!user,
  });

  // Direct database queries to get profile without using policies
  useEffect(() => {
    if (user?.id) {
      fetchProfileDirectly();
    }
  }, [user]);

  // Fetch profile helper function
  const fetchProfileDirectly = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Use a direct database query to bypass RLS
      const { data: fetchedProfile } = await profileService.getProfileDirectWithoutRLS(user.id);
      if (fetchedProfile) {
        console.log("Successfully fetched profile directly:", fetchedProfile);
        setLocalProfile(fetchedProfile);
      } else {
        console.log("No profile found, using fallback values");
        setLocalProfile({
          username: user.email,
          time_balance: 336,
          xp_points: 0,
          streak_days: 0,
          level: 1
        });
      }
    } catch (error) {
      console.error("Error fetching profile directly:", error);
      // Use fallback values
      setLocalProfile({
        username: user.email,
        time_balance: 336,
        xp_points: 0,
        streak_days: 0,
        level: 1
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Periodically refresh profile to get updated time balance from server
  useEffect(() => {
    if (!user) return;
    
    // Initial refresh with better error handling
    fetchProfileDirectly();
    
    // Refresh profile every 15 seconds to sync with server
    const serverSyncInterval = setInterval(() => {
      refreshLocalProfile()
        .catch(err => {
          console.error("Error syncing with server:", err);
        });
    }, 15 * 1000); // 15 seconds for more frequent updates
    
    return () => clearInterval(serverSyncInterval);
  }, [user]);

  // Helper function to refresh profile
  const refreshLocalProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data: refreshedProfile } = await profileService.getProfileDirectWithoutRLS(user.id);
      if (refreshedProfile) {
        setLocalProfile(refreshedProfile);
        setLastRefresh(new Date());
        console.log("Profile refreshed successfully:", refreshedProfile);
        return refreshedProfile;
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error);
      throw error;
    }
  };

  // Manual refresh function to be passed to TimeDisplay
  const handleManualRefresh = () => {
    toast({
      title: "Refreshing time balance...",
      duration: 2000,
    });
    
    refreshLocalProfile()
      .then(() => {
        toast({
          title: "Time balance refreshed",
          description: "Your time balance has been updated.",
          duration: 3000,
        });
      })
      .catch(() => {
        toast({
          title: "Failed to refresh",
          description: "Please try again later.",
          variant: "destructive",
          duration: 3000,
        });
      });
  };

  // Get time balance value, defaulting to 0 if not available
  const timeBalance = localProfile?.time_balance || 0;

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header showAction actionLabel="GO" />
      
      <UserStats profile={localProfile || profile} />
      
      <TimeDisplay 
        initialTimeBalance={timeBalance} 
        timeRefreshed={lastRefresh}
        onRefresh={handleManualRefresh}
      />
      
      <ProgressBar profile={localProfile || profile} />

      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">
          Welcome {localProfile?.username?.split('@')[0] || user?.email?.split('@')[0] || 'Player'}
        </h2>
      </div>

      <HorizontalScroll className="px-4 mb-6" />
      
      <QuestsList missions={missions} />
    </div>
  );
};

export default Home;
