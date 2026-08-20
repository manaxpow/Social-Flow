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

  const updateIndicator = () => {
    const activeIndex = tabs.findIndex(tab => tab.id === value);
    const activeTab = tabsRef.current[activeIndex];
    
    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
        opacity: 1
      });
    }
  };

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [value]);

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-background/95 backdrop-blur-md sticky top-0 z-20">
      <Tabs value={value} onValueChange={onValueChange} className="w-full max-w-300 mx-auto">
        <TabsList className="w-full justify-start h-14 bg-transparent rounded-none px-4 md:px-6 gap-1 md:gap-2 overflow-x-auto relative scrollbar-none border-none">
          {/* Sliding Indicator */}
          <div
            className="absolute bottom-0 h-[3px] bg-linear-to-r from-[#00CFEE] to-[#0061FF] rounded-t-full transition-all duration-300 ease-out z-10"
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
                className="relative cursor-pointer border-none shadow-none outline-hidden focus:outline-hidden focus:ring-0 focus-visible:ring-0 focus-visible:outline-hidden data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-none data-[state=active]:text-[#0061FF] dark:data-[state=active]:text-[#0061FF] text-slate-600 dark:text-slate-400 hover:text-[#0061FF] hover:bg-slate-100/70 dark:hover:bg-slate-800/50 rounded-lg px-3 py-2 transition-all duration-200 whitespace-nowrap group h-10 my-auto"
              >
                <span className="flex items-center gap-2">
                  <Icon 
                    className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-[#0061FF]' : 'text-slate-400 dark:text-slate-500 group-hover:text-[#0061FF]'
                    }`} 
                  />
                  <span className={`text-[14px] md:text-[15px] font-medium transition-colors ${
                    isActive ? 'font-semibold text-[#0061FF]' : ''
                  }`}>
                    {tab.label}
                  </span>
                  {tab.count !== null && tab.count > 0 && (
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full transition-colors ${
                      isActive 
                        ? 'bg-blue-100 dark:bg-blue-950/80 text-[#0061FF]' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-slate-700 group-hover:text-[#0061FF]'
                    }`}>
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