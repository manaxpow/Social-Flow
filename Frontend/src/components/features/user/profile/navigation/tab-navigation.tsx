import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, User, Users, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface TabNavigationProps {
  value: string;
  onValueChange: (value: string) => void;
  postsCount?: number;
  friendsCount?: number;
  photosCount?: number;
  videosCount?: number;
}

export const TabNavigation = ({ 
  value, 
  onValueChange,
  postsCount = 0,
  friendsCount = 0,
  photosCount = 0,
  videosCount = 0
}: TabNavigationProps) => {
  const tabs = [
    { id: "posts", label: "Posts", icon: Home, count: postsCount },
    { id: "about", label: "About", icon: User, count: null },
    { id: "friends", label: "Friends", icon: Users, count: friendsCount },
    { id: "photos", label: "Photos", icon: ImageIcon, count: photosCount },
    { id: "videos", label: "Videos", icon: VideoIcon, count: videosCount },
  ];

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === value);
    const activeTab = tabsRef.current[activeIndex];
    
    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
        opacity: 1
      });
    }
  }, [value]);

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <Tabs value={value} onValueChange={onValueChange} className="w-full">
        <TabsList className="w-full justify-start h-14 bg-transparent rounded-none px-6 gap-8 overflow-x-auto relative">
          {/* Sliding Indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-gradient-to-r from-[#00CFEE] to-[#0061FF] transition-all duration-300 ease-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
            }}
          />

          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = value === tab.id;
            
            return (
              <TabsTrigger
                key={tab.id}
                ref={(el) => {
                  tabsRef.current[index] = el;
                }}
                value={tab.id}
                className="relative data-[state=active]:text-[#0061FF] data-[state=active]:font-semibold rounded-none px-1 bg-transparent shadow-none hover:text-[#0061FF] transition-all duration-200 whitespace-nowrap group"
              >
                <span className="flex items-center gap-2 px-3 py-1">
                  <Icon 
                    className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-[#0061FF]' : 'text-slate-400'
                    }`} 
                  />
                  <span className="text-[15px]">{tab.label}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                      {tab.count}
                    </span>
                  )}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
};