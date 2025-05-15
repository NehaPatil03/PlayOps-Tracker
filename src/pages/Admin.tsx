
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { QOTD } from '@/services/qotdService';
import { Mission } from '@/services/missionService';
import { Profile } from '@/services/profileService';

const Admin: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('qotd');
  
  // QOTD state
  const [questions, setQuestions] = useState<QOTD[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [questionDate, setQuestionDate] = useState('');
  
  // Missions state
  const [missions, setMissions] = useState<Mission[]>([]);
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    mission_type: 'workshop_small',
    time_reward: -18,
    xp_reward: 100,
    telegram_link: '',
  });
  
  // Users state
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [timeAdjustment, setTimeAdjustment] = useState(0);
  
  // Check if user is admin (for demo purposes, you'd have a proper role system)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // For demo purposes, first user is admin
    // In a real app, you should check against a proper role system
    const checkAdmin = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1);
      
      if (data && data.length > 0 && user?.id === data[0].id) {
        setIsAdmin(true);
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel",
          variant: "destructive",
        });
        navigate('/');
      }
    };
    
    checkAdmin();
  }, [isAuthenticated, user, navigate]);
  
  // Load QOTDs
  useEffect(() => {
    if (isAdmin && activeTab === 'qotd') {
      loadQOTDs();
    }
  }, [isAdmin, activeTab]);
  
  // Load Missions
  useEffect(() => {
    if (isAdmin && activeTab === 'missions') {
      loadMissions();
    }
  }, [isAdmin, activeTab]);
  
  // Load Users
  useEffect(() => {
    if (isAdmin && activeTab === 'users') {
      loadUsers();
    }
  }, [isAdmin, activeTab]);
  
  const loadQOTDs = async () => {
    try {
      const { data, error } = await supabase
        .from('qotd')
        .select('*')
        .order('active_date', { ascending: false });
      
      if (error) throw error;
      setQuestions(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading QOTDs",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const loadMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMissions(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading missions",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('xp_points', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const addQOTD = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newQuestion || !questionDate) {
        throw new Error("Question and date are required");
      }
      
      const { error } = await supabase
        .from('qotd')
        .insert({
          question: newQuestion,
          active_date: questionDate
        });
      
      if (error) throw error;
      
      toast({
        title: "QOTD Added",
        description: `Question scheduled for ${questionDate}`,
      });
      
      setNewQuestion('');
      setQuestionDate('');
      loadQOTDs();
    } catch (error: any) {
      toast({
        title: "Error adding QOTD",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const addMission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newMission.title) {
        throw new Error("Mission title is required");
      }
      
      const { error } = await supabase
        .from('missions')
        .insert(newMission);
      
      if (error) throw error;
      
      toast({
        title: "Mission Added",
        description: `"${newMission.title}" has been added`,
      });
      
      setNewMission({
        title: '',
        description: '',
        mission_type: 'workshop_small',
        time_reward: -18,
        xp_reward: 100,
        telegram_link: '',
      });
      
      loadMissions();
    } catch (error: any) {
      toast({
        title: "Error adding mission",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const adjustUserTime = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedUser) {
        throw new Error("Please select a user");
      }
      
      // Get current time balance
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('time_balance')
        .eq('id', selectedUser)
        .single();
      
      if (userError) throw userError;
      
      const newTimeBalance = (userData.time_balance || 0) + timeAdjustment;
      
      // Update time balance
      const { error } = await supabase
        .from('profiles')
        .update({ time_balance: newTimeBalance })
        .eq('id', selectedUser);
      
      if (error) throw error;
      
      toast({
        title: "Time Adjusted",
        description: `User's time balance updated by ${timeAdjustment} hours`,
      });
      
      setSelectedUser(null);
      setTimeAdjustment(0);
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error adjusting time",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  if (!isAdmin) {
    return <div className="p-4">Loading...</div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="Admin Dashboard" showBack />
      
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="qotd">QOTD</TabsTrigger>
            <TabsTrigger value="missions">Missions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="qotd">
            <Card>
              <CardHeader>
                <CardTitle>Question of the Day</CardTitle>
                <CardDescription>Create and manage daily questions</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={addQOTD} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Question</label>
                    <textarea 
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                      rows={3}
                      placeholder="Enter the question..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Active Date</label>
                    <input 
                      type="date"
                      value={questionDate}
                      onChange={(e) => setQuestionDate(e.target.value)}
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full py-2 bg-playops-accent text-black font-medium rounded"
                  >
                    Add QOTD
                  </button>
                </form>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Scheduled Questions</h3>
                  <div className="space-y-2">
                    {questions.map((q) => (
                      <div key={q.id} className="bg-gray-800 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-300">{q.question}</p>
                            <p className="text-xs text-gray-500 mt-1">Date: {new Date(q.active_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {questions.length === 0 && (
                      <p className="text-gray-500 text-sm">No questions scheduled</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="missions">
            <Card>
              <CardHeader>
                <CardTitle>Missions</CardTitle>
                <CardDescription>Create and manage missions</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={addMission} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                    <input 
                      type="text"
                      value={newMission.title}
                      onChange={(e) => setNewMission({...newMission, title: e.target.value})}
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                      placeholder="Mission title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <textarea 
                      value={newMission.description}
                      onChange={(e) => setNewMission({...newMission, description: e.target.value})}
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                      rows={2}
                      placeholder="Mission description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Type</label>
                      <select
                        value={newMission.mission_type}
                        onChange={(e) => {
                          const type = e.target.value;
                          let timeReward = newMission.time_reward;
                          let xpReward = newMission.xp_reward;
                          
                          // Set default values based on type
                          if (type === 'qotd') {
                            timeReward = 6;
                            xpReward = 50;
                          } else if (type === 'workshop_small') {
                            timeReward = -18;
                            xpReward = 100;
                          } else if (type === 'workshop_big') {
                            timeReward = -36;
                            xpReward = 200;
                          } else if (type === 'networking') {
                            timeReward = 12;
                            xpReward = 75;
                          } else if (type === 'future_ready_drop') {
                            timeReward = 12;
                            xpReward = 150;
                          }
                          
                          setNewMission({
                            ...newMission,
                            mission_type: type,
                            time_reward: timeReward,
                            xp_reward: xpReward
                          });
                        }}
                        className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                      >
                        <option value="qotd">QOTD</option>
                        <option value="workshop_small">Small Workshop</option>
                        <option value="workshop_big">Big Workshop</option>
                        <option value="networking">Networking</option>
                        <option value="future_ready_drop">Future Ready Drop</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Telegram Link</label>
                      <input 
                        type="text"
                        value={newMission.telegram_link}
                        onChange={(e) => setNewMission({...newMission, telegram_link: e.target.value})}
                        className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                        placeholder="https://t.me/..."
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Time Reward (hours)</label>
                      <input 
                        type="number"
                        value={newMission.time_reward}
                        onChange={(e) => setNewMission({...newMission, time_reward: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">XP Reward</label>
                      <input 
                        type="number"
                        value={newMission.xp_reward}
                        onChange={(e) => setNewMission({...newMission, xp_reward: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full py-2 bg-playops-accent text-black font-medium rounded"
                  >
                    Add Mission
                  </button>
                </form>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Active Missions</h3>
                  <div className="space-y-2">
                    {missions.filter(m => m.is_active).map((mission) => (
                      <div key={mission.id} className="bg-gray-800 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{mission.title}</p>
                            <p className="text-sm text-gray-300">{mission.description}</p>
                            <div className="flex gap-4 mt-1 text-xs text-gray-500">
                              <span>Type: {mission.mission_type}</span>
                              <span>Time: {mission.time_reward}h</span>
                              <span>XP: {mission.xp_reward}</span>
                            </div>
                          </div>
                          <button 
                            className="text-red-500 text-sm"
                            onClick={async () => {
                              try {
                                await supabase
                                  .from('missions')
                                  .update({ is_active: false })
                                  .eq('id', mission.id);
                                loadMissions();
                              } catch (error) {
                                console.error(error);
                              }
                            }}
                          >
                            Deactivate
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {missions.filter(m => m.is_active).length === 0 && (
                      <p className="text-gray-500 text-sm">No active missions</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user lifelines and time</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={adjustUserTime} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Select User</label>
                    <select
                      value={selectedUser || ''}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                    >
                      <option value="">-- Select a user --</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username} (Time: {user.time_balance}h, XP: {user.xp_points})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Time Adjustment (hours)</label>
                    <input 
                      type="number"
                      value={timeAdjustment}
                      onChange={(e) => setTimeAdjustment(parseInt(e.target.value))}
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                      placeholder="Enter positive or negative hours"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full py-2 bg-playops-accent text-black font-medium rounded"
                    disabled={!selectedUser}
                  >
                    Update Time Balance
                  </button>
                </form>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">User Statistics</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {users.map((user) => (
                      <div key={user.id} className="bg-gray-800 p-3 rounded">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <div className="flex gap-4 mt-1 text-xs text-gray-500">
                              <span>Time: {user.time_balance}h</span>
                              <span>XP: {user.xp_points}</span>
                              <span>Streak: {user.streak_days}</span>
                              <span>Level: {user.level}</span>
                            </div>
                          </div>
                          <button 
                            className="text-yellow-500 text-sm"
                            onClick={() => {
                              setSelectedUser(user.id);
                              setTimeAdjustment(336); // Reset to full time
                            }}
                          >
                            Reset Time
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
