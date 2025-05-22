
import React from 'react';
import { ArrowRight, Mic, ClipboardList, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestItemProps {
  type: 'speaker' | 'assignment' | 'mission' | 'advanced';
  title: string;
  duration: string;
  onClick?: () => void;
}

const QuestItem: React.FC<QuestItemProps> = ({ type, title, duration, onClick }) => {
  const getIcon = () => {
    switch (type) {
      case 'speaker':
        return <Mic className="w-5 h-5 text-playops-accent" />;
      case 'assignment':
        return <ClipboardList className="w-5 h-5 text-playops-accent" />;
      case 'mission':
      case 'advanced':
        return <Rocket className="w-5 h-5 text-playops-accent" />;
      default:
        return <Rocket className="w-5 h-5 text-playops-accent" />;
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-4 bg-playops-card rounded-lg border border-gray-800 cursor-pointer",
        "hover:bg-gray-800 transition-colors duration-200"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-playops-accent">{duration}</span>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

export default QuestItem;
