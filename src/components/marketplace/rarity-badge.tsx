import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles, Star, Crown, Diamond } from "lucide-react";

type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

interface RarityBadgeProps {
  rarity: Rarity;
  className?: string;
}

const rarityConfig: Record<Rarity, { color: string; icon: any; bg: string }> = {
  Common: { color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20", icon: null },
  Uncommon: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", icon: Sparkles },
  Rare: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Star },
  Epic: { color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: Diamond },
  Legendary: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: Crown },
};

export function RarityBadge({ rarity, className }: RarityBadgeProps) {
  const config = rarityConfig[rarity] || rarityConfig.Common;
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1.5 font-medium border",
        config.bg,
        config.color,
        className
      )}
    >
      {Icon && <Icon size={12} />}
      {rarity}
    </Badge>
  );
}
