"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Link01Icon,
  PercentIcon,
  Time01Icon,
  SourceCodeIcon,
  PaintBoardIcon,
} from "@hugeicons/core-free-icons";

type NavItem = {
  title: string;
  href: string;
  icon: typeof Home01Icon;
};

const navItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home01Icon,
  },
  {
    title: "Cron Parser",
    href: "/cron-parser",
    icon: Time01Icon,
  },
  {
    title: "URL Parser",
    href: "/url-parser",
    icon: Link01Icon,
  },
  {
    title: "URL Encoder",
    href: "/url-encoder",
    icon: PercentIcon,
  },
  {
    title: "JSON / YAML",
    href: "/json-to-yaml",
    icon: SourceCodeIcon,
  },
  {
    title: "Color Converter",
    href: "/color-converter",
    icon: PaintBoardIcon,
  },
];

export const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <span className="text-sm font-medium">DevTools</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.href} aria-label={item.title} />}
                      isActive={isActive}
                    >
                      <HugeiconsIcon icon={item.icon} size={16} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
