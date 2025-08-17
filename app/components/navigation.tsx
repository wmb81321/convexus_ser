"use client";

import { useState } from "react";
<<<<<<< HEAD
import { Home, User, ArrowLeftRight, TrendingUp, Menu, X, Wallet, Users, ArrowRightLeft, LucideIcon } from "lucide-react";
=======
import { Home, User, ArrowLeftRight, TrendingUp, Menu, X, Wallet, Users, LucideIcon } from "lucide-react";
>>>>>>> 6bacf371f04fca6d4bf466b4ce58ae4973f2ce73
import { Button } from "@/components/ui/button";
import { ModuleType } from "@/app/types/modules";

interface NavigationItem {
  id: ModuleType;
  label: string;
  icon: LucideIcon;
  description: string;
  color: string;
  bgColor: string;
}

interface NavigationProps {
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'transfers' as ModuleType,
    label: 'Home',
    icon: Home,
    description: 'Send & Receive',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
<<<<<<< HEAD
    id: 'crosschain' as ModuleType,
    label: 'Cross-Chain',
    icon: ArrowRightLeft,
    description: 'USDC Cross-Chain',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
  },
  {
=======
>>>>>>> 6bacf371f04fca6d4bf466b4ce58ae4973f2ce73
    id: 'profile' as ModuleType,
    label: 'Profile',
    icon: User,
    description: 'Account & Bank Info',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    id: 'clients' as ModuleType,
    label: 'Clients & Suppliers',
    icon: Users,
    description: 'CRM & Billing',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    id: 'funding' as ModuleType,
    label: 'Funding',
    icon: Wallet,
    description: 'Cash In/Out',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  {
    id: 'defi' as ModuleType,
    label: 'SER',
    icon: TrendingUp,
    description: 'Smart Exchange',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
  },
];

export default function Navigation({ activeModule, onModuleChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex glass-card border-0 shadow-lg mb-8">
        <div className="flex w-full">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={`
                  flex-1 flex flex-col items-center gap-2 p-6 transition-all duration-300
                  ${isActive 
                    ? `${item.bgColor} ${item.color} shadow-inner` 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-institutional'
                  }
                  ${index === 0 ? 'rounded-l-xl' : ''}
                  ${index === navigationItems.length - 1 ? 'rounded-r-xl' : ''}
                  border-r border-gray-200/30 dark:border-gray-700/30 last:border-r-0
                `}
              >
                <Icon className={`w-6 h-6 ${isActive ? item.color : 'text-gray-500'}`} />
                <div className="text-center">
                  <div className={`font-semibold text-sm ${isActive ? item.color : ''}`}>
                    {item.label}
                  </div>
                  <div className="text-xs text-institutional-light mt-1">
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className={`w-full h-1 ${item.color.replace('text-', 'bg-')} rounded-full mt-2`} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden mb-6">
        {/* Mobile Header */}
        <div className="glass-card border-0 shadow-lg p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {(() => {
              const activeItem = navigationItems.find(item => item.id === activeModule);
              const Icon = activeItem?.icon || Home;
              return (
                <>
                  <div className={`p-2 rounded-lg ${activeItem?.bgColor}`}>
                    <Icon className={`w-5 h-5 ${activeItem?.color}`} />
                  </div>
                  <div>
                    <h2 className="font-semibold heading-institutional">
                      {activeItem?.label}
                    </h2>
                    <p className="text-xs text-institutional-light">
                      {activeItem?.description}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="glass-card border-0 shadow-lg mt-2 overflow-hidden">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onModuleChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 p-4 transition-all duration-200
                    ${isActive 
                      ? `${item.bgColor} ${item.color}` 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
                    border-b border-gray-200/30 dark:border-gray-700/30 last:border-b-0
                  `}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-gray-500'}`} />
                  </div>
                  <div className="text-left">
                    <div className={`font-medium text-sm ${isActive ? item.color : ''}`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-institutional-light">
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="ml-auto">
                      <div className={`w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
} 