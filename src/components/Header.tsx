
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showAction?: boolean;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title = "PlayOps",
  subtitle = "PlayOps Training Ground",
  showBack = false,
  showAction = false,
  actionLabel = "GO",
  onActionClick,
  className
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.pathname !== '/') {
      navigate(-1);
    } else {
      // Some fallback if needed
    }
  };

  return (
    <header className={cn("flex items-center justify-between p-4", className)}>
      <div className="flex-1">
        {showBack && (
          <button 
            className="text-gray-300" 
            onClick={handleBack}
          >
            Cancel
          </button>
        )}
      </div>

      <div className="flex flex-col items-center flex-1">
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>

      <div className="flex-1 flex justify-end">
        {showAction && (
          <button 
            className="bg-blue-500 text-white text-xs py-1 px-3 rounded-full"
            onClick={onActionClick}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
