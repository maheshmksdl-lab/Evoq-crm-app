"use client";
import Avatar from "@mui/material/Avatar";
import { TrendUp, UserPlus, PencilSimple, CheckCircle, CurrencyDollar } from "@phosphor-icons/react";
import { OWNER_AVATARS } from "@/lib/avatars";

type FeedItem = {
  id: number;
  Icon: React.ElementType;
  iconColor: string;
  iconColorDark: string;
  iconBg: string;
  title: string;
  user: string;
  initials: string;
  avatarBg: string;
  ownerKey: string;
  time: string;
};

const feed: FeedItem[] = [
  { id:1, Icon:TrendUp,       iconColor:"#0C2472", iconColorDark:"#60A5FA", iconBg:"#E3ECFC", title:"Matrix Corp moved to Negotiation",   user:"PM SDL",  initials:"PM", avatarBg:"#1D4ED8", ownerKey:"PM SDL",  time:"5m ago"  },
  { id:2, Icon:UserPlus,      iconColor:"#2F6FED", iconColorDark:"#60A5FA", iconBg:"#EFF6FF", title:"New lead added: James Wilson",        user:"Sarah K", initials:"SK", avatarBg:"#3B82F6", ownerKey:"Sarah K", time:"23m ago" },
  { id:3, Icon:PencilSimple,  iconColor:"#3B82F6", iconColorDark:"#60A5FA", iconBg:"#EFF6FF", title:"Sweany Inc contact updated",          user:"PM SDL",  initials:"PM", avatarBg:"#1D4ED8", ownerKey:"PM SDL",  time:"1h ago"  },
  { id:4, Icon:CheckCircle,   iconColor:"#2E9E7B", iconColorDark:"#34D399", iconBg:"#EFF6FF", title:"Task: Follow up with Apex done",      user:"John D",  initials:"JD", avatarBg:"#2E9E7B", ownerKey:"John D",  time:"2h ago"  },
  { id:5, Icon:CurrencyDollar,iconColor:"#E0883F", iconColorDark:"#FB923C", iconBg:"#EFF6FF", title:"New deal created: Pixel Studios",     user:"Ria M",   initials:"RM", avatarBg:"#0C2472", ownerKey:"Ria M",   time:"3h ago"  },
];

export default function ActivityFeed({ isDark = false }: { isDark?: boolean }) {
  return (
    <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 border h-full flex flex-col backdrop-blur-xl transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "#18181B" : "rgba(255, 255, 255, 0.6)",
        borderColor: isDark ? "#27272A" : "rgba(255,255,255,0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      }}>
      <div className="mb-4 sm:mb-5">
        <h3 className={`m-0 text-sm sm:text-[14px] font-bold ${isDark ? "text-[#FFFFFF]" : "text-[#0C2472]"}`}>Recent Activity</h3>
        <p className="text-[11px] sm:text-[12px] text-slate-400 mt-0.5">Live team updates</p>
      </div>

      <div className="flex-1 space-y-3 sm:space-y-4">
        {feed.map((item, idx) => {
          const { Icon } = item;
          return (
            <div key={item.id} className="flex items-start gap-3 group">
              <div className="relative flex flex-col items-center flex-shrink-0">
                <div className="w-7 h-7 rounded-[9px] flex items-center justify-center" style={{ backgroundColor: isDark ? "#27272A" : item.iconBg }}>
                  <Icon size={14} color={isDark ? item.iconColorDark : item.iconColor} weight="duotone" />
                </div>
                {idx < feed.length - 1 && (
                  <div className={`w-px flex-1 mt-1 mb-0 h-[14px] ${isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"}`} />
                )}
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <p className={`text-xs sm:text-[14px] font-medium leading-snug transition-colors ${isDark ? "text-[#E2E8F0] group-hover:text-[#FFFFFF]" : "text-slate-700 group-hover:text-slate-900"}`}>
                  {item.title}
                </p>
                <div className="flex items-center gap-1 sm:gap-1.5 mt-1 flex-wrap">
                  <Avatar
                    src={OWNER_AVATARS[item.ownerKey]}
                    sx={{ width:12, height:12, bgcolor:item.avatarBg, fontSize:"0.42rem", fontWeight:700 }}
                  >
                    {item.initials}
                  </Avatar>
                  <span className="text-[10px] sm:text-[12px] text-slate-400 font-medium">{item.user}</span>
                  <span className={`text-[10px] sm:text-[12px] ${isDark ? "text-slate-600" : "text-slate-300"}`}>·</span>
                  <span className="text-[10px] sm:text-[12px] text-slate-400">{item.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className={`mt-3 sm:mt-4 w-full text-center text-[10px] sm:text-[11.5px] font-bold py-2 rounded-lg sm:rounded-xl transition-all duration-150 ${isDark ? "text-[#60A5FA] hover:text-[#FAFAFA] hover:bg-[#27272A]" : "text-[#1D4ED8] hover:text-[#0C2472] hover:bg-[rgba(96,165,250,0.1)]"}`}>
        View all activity →
      </button>
    </div>
  );
}

