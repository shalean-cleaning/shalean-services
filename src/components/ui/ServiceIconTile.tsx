import type { LucideIcon } from "lucide-react";
import LinkSafe from "@/components/LinkSafe";

type Props = {
  icon: LucideIcon;
  label: string;
  href?: string;
  fg?: string;
  bg?: string;
  ring?: string;
  className?: string;
};

function cn(...a: (string | false | undefined | null)[]) {
  return a.filter(Boolean).join(" ");
}

export default function ServiceIconTile({
  icon: Icon,
  label,
  href = "#",
  fg = "text-blue-600",
  bg = "bg-blue-50",
  ring = "ring-blue-100",
  className,
}: Props) {
  return (
    <LinkSafe href={href} className="block">
      <div className={cn(
        "flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow",
        className
      )}>
        <div className={cn(
          "w-12 h-12 rounded-lg grid place-items-center ring-1 mb-3",
          bg, ring
        )}>
          <Icon className={cn("w-6 h-6", fg)} strokeWidth={2} />
        </div>
        <span className="text-sm font-medium text-gray-700 text-center">
          {label}
        </span>
      </div>
    </LinkSafe>
  );
}
