import { cn } from "@/lib/utils";
import { useState } from "react";
import { NavItem } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { ChevronDown, LucideIcon } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";

export default function NavGroup({
  groupTitle,
  icon,
  items,
  ...props
}: {
  groupTitle: string;
  icon?: LucideIcon | null;
  items: NavItem[];
}) {
  const page = usePage();
  const isGroupActive = items.some((item) => item.href === page.url);
  const [open, setOpen] = useState<boolean>(isGroupActive);
  const Icon = icon;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      defaultOpen
      className="group/collapsible"
      {...props}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isGroupActive}
            tooltip={{ children: groupTitle }}
          >
            {Icon && <Icon />}
            <span>{groupTitle}</span>
            <ChevronDown
              className={cn(
                'ml-auto transition-transform',
                open ? 'rotate-180' : '',
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {items.map((item) => (
            <SidebarMenuSub key={item.title}>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild>
                  <Link href={item.href || '#'}>
                    {item.icon && <item.icon />}
                    {item.title}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          ))}
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};