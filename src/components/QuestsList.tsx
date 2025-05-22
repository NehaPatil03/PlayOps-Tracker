
import React from 'react';
import QuestItem from '@/components/QuestItem';
import { Mission } from '@/services/missionService';
import { List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuestsListProps {
  missions: Mission[] | undefined;
}

const QuestsList: React.FC<QuestsListProps> = ({ missions }) => {
  const navigate = useNavigate();

  const getMissionsByType = (type: string) =>
    missions?.filter((m) => m.mission_type.toLowerCase().includes(type.toLowerCase())) || [];

  return (
    <>
      <div className="px-4 mb-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-playops-accent" />
          <h2 className="font-medium">Quest List</h2>
        </div>
      </div>

      <div className="px-4 space-y-3 mb-4">
        {!missions ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-16 bg-gray-800 rounded-lg animate-pulse"></div>
            ))
        ) : (
          <>
            {getMissionsByType('qotd').length > 0 && (
              <QuestItem
                type="mission"
                title="QOTD"
                duration="+6h"
                onClick={() => navigate('/missions')}
              />
            )}
            {getMissionsByType('networking').length > 0 && (
              <QuestItem
                type="mission"
                title="Networking Event"
                duration="+12h"
                onClick={() => navigate('/missions')}
              />
            )}
            {getMissionsByType('small').length > 0 && (
              <QuestItem
                type="assignment"
                title="Small Workshop"
                duration="-18h"
                onClick={() => navigate('/missions')}
              />
            )}
            {getMissionsByType('big').length > 0 && (
              <QuestItem
                type="assignment"
                title="Big Workshop"
                duration="-36h"
                onClick={() => navigate('/missions')}
              />
            )}
            {getMissionsByType('future').length > 0 && (
              <QuestItem
                type="advanced"
                title="Future Ready Drop"
                duration="+12h"
                onClick={() => navigate('/missions')}
              />
            )}
            {getMissionsByType('speaker').length > 0 && (
              <QuestItem
                type="speaker"
                title="Speaker Session"
                duration="0h"
                onClick={() => navigate('/missions')}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default QuestsList;
