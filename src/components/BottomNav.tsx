
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Rocket, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center flex-1 py-2",
        isActive ? "text-playops-accent" : "text-gray-500"
      )}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-xs">{label}</span>
    </Link>
  );
};

const BottomNav: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-gray-800 flex justify-around py-1">
      <NavItem
        to="/"
        icon={<Home size={20} />}
        label="Home"
        isActive={pathname === '/'}
      />
      <NavItem
        to="/missions"
        icon={<Rocket size={20} />}
        label="Mission"
        isActive={pathname === '/missions'}
      />
      <NavItem
        to="/leaderboard"
        icon={<Trophy size={20} />}
        label="Leaderboards"
        isActive={pathname === '/leaderboard'}
      />
      <NavItem
        to="/account"
        icon={<User size={20} />}
        label="Account"
        isActive={pathname === '/account'}
      />
    </div>
  );
};

export default BottomNav;
