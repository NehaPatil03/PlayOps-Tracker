
import React, { useRef, useEffect } from 'react';
import { Brain, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  className?: string;
  style?: React.CSSProperties; // Add style prop to fix build error
}

const MissionCard: React.FC<MissionCardProps> = ({ icon, title, subtitle, className, style }) => {
  return (
    <div 
      className={cn(
        "min-w-[250px] flex flex-col items-center justify-center p-6 bg-playops-card rounded-xl border border-gray-800 snap-center",
        className
      )}
      style={style}
    >
      <div className="text-playops-accent mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-playops-accent mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
  );
};

interface HorizontalScrollProps {
  className?: string;
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ className }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cards data
  const cards = [
    {
      icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>,
      title: "Design for Change",
      subtitle: "Starts Monday 02:00:00"
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Growth Sprint",
      subtitle: "Apply Now"
    },
    {
      icon: <Brain size={32} />,
      title: "Brain Control",
      subtitle: "Practice Daily"
    }
  ];

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollRef.current && e.deltaY !== 0) {
        e.preventDefault();
        scrollRef.current.scrollLeft += e.deltaY;
      }
    };

    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 py-2 snap-x snap-mandatory snap-scroll-container"
      >
        {cards.map((card, index) => (
          <MissionCard 
            key={index}
            icon={card.icon}
            title={card.title}
            subtitle={card.subtitle}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

export default HorizontalScroll;
