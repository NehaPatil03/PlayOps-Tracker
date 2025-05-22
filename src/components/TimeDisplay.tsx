import React, { useEffect, useState } from 'react';

interface TimeDisplayProps {
  initialTimeBalance: number;
  timeRefreshed: Date;
  onRefresh?: () => void;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ 
  initialTimeBalance,
  timeRefreshed,
  onRefresh
}) => {
  const [timeDisplay, setTimeDisplay] = useState("00:00:00");
  const [timeBalance, setTimeBalance] = useState<number>(0);

  // Format time balance (hours) to HH:MM:SS display
  const formatTimeBalance = (hours: number): string => {
    if (hours === undefined || isNaN(hours) || hours < 0) return "00:00:00";
    
    const totalSeconds = Math.floor(hours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Initialize timeBalance when profile loads or changes
  useEffect(() => {
    if (initialTimeBalance !== undefined && initialTimeBalance > 0) {
      console.log(`Setting initial time balance: ${initialTimeBalance} hours`);
      setTimeBalance(initialTimeBalance);
      setTimeDisplay(formatTimeBalance(initialTimeBalance));
    } else {
      console.log("No initial time balance available or zero");
      setTimeBalance(0);
      setTimeDisplay("00:00:00");
    }
  }, [initialTimeBalance]);

  // Reset the timer when refresh time updates
  useEffect(() => {
    if (initialTimeBalance !== undefined && initialTimeBalance > 0) {
      console.log(`Time refreshed at: ${timeRefreshed?.toISOString() || 'unknown'}, balance: ${initialTimeBalance}`);
      setTimeBalance(initialTimeBalance);
      setTimeDisplay(formatTimeBalance(initialTimeBalance));
    }
  }, [timeRefreshed, initialTimeBalance]);

  // Timer countdown logic - visual effect that decrements every second
  useEffect(() => {
    if (initialTimeBalance <= 0) {
      setTimeDisplay("00:00:00");
      return;
    }
    
    // Store the current time as a reference point
    const startTime = new Date();
    const startBalance = initialTimeBalance;
    
    const timer = setInterval(() => {
      try {
        // Calculate real-time decay since last refresh
        const now = new Date();
        
        // First calculate hours since the last server refresh
        const hoursSinceRefresh = timeRefreshed ? 
          (now.getTime() - timeRefreshed.getTime()) / (1000 * 60 * 60) : 0;
        
        // Then calculate seconds since the timer was started (for smooth visual decay)
        const secondsSinceStart = (now.getTime() - startTime.getTime()) / 1000;
        const visualHoursDecay = secondsSinceStart / 3600;
        
        // Apply both server-sync decay and visual decay per second
        const serverSyncedBalance = Math.max(0, startBalance - hoursSinceRefresh);
        const newBalance = Math.max(0, serverSyncedBalance - visualHoursDecay);
        
        // Update the display
        setTimeDisplay(formatTimeBalance(newBalance));
        
        // If we've gone below zero, clear the interval
        if (newBalance <= 0) {
          setTimeDisplay("00:00:00");
          clearInterval(timer);
        }
      } catch (error) {
        console.error("Error updating time display:", error);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [initialTimeBalance, timeRefreshed]);

  // Return a button that triggers manual refresh when clicked
  return (
    <div className="mx-4 bg-gray-900 rounded-lg py-4 flex justify-center items-center mb-4">
      <div className="flex flex-col items-center">
        <span className="text-3xl font-bold text-playops-accent">{timeDisplay}</span>
        {onRefresh && (
          <button 
            onClick={onRefresh} 
            className="mt-2 text-xs text-playops-accent hover:underline"
          >
            Refresh
          </button>
        )}
      </div>
    </div>
  );
};

export default TimeDisplay;
