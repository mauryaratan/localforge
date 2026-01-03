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
  Settings01Icon,
  CommandIcon,
  CodeIcon,
  PaintBrush01Icon,
  File01Icon,
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
    title: "Components",
    href: "/components",
    icon: CommandIcon,
  },
  {
    title: "Code",
    href: "/code",
    icon: CodeIcon,
  },
  {
    title: "Design",
    href: "/design",
    icon: PaintBrush01Icon,
  },
  {
    title: "Docs",
    href: "/docs",
    icon: File01Icon,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings01Icon,
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
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={
                        <Link
                          href={item.href}
                          aria-label={item.title}
                          tabIndex={0}
                        />
                      }
                      isActive={isActive}
                      tooltip={item.title}
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
