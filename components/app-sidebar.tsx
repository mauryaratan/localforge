"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { navItems } from "@/lib/nav-items";

export const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-sidebar-border border-b px-4 py-3">
        <Link aria-label="LocalForge Home" href="/">
          <Logo size="sm" />
        </Link>
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
                      isActive={isActive}
                      render={<Link aria-label={item.title} href={item.href} />}
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
      <SidebarFooter className="border-sidebar-border border-t px-4 py-3">
        <span className="text-[10px] text-sidebar-foreground/50">
          Built by{" "}
          <a
            className="text-primary underline"
            href="https://x.com/mauryaratan"
            rel="noopener noreferrer"
            target="_blank"
          >
            @mauryaratan
          </a>
          .<br />
          Proudly{" "}
          <a
            className="text-primary underline"
            href="https://github.com/mauryaratan/localforge"
            rel="noopener noreferrer"
            target="_blank"
          >
            Open Source
          </a>
        </span>
      </SidebarFooter>
    </Sidebar>
  );
};
