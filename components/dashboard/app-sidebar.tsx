"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Megaphone,
  Video,
  Users,
  CreditCard,
  UserCircle,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";

const creatorLinks = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Campaigns", href: "/campaigns", icon: Megaphone },
  { title: "My Videos", href: "/my-videos", icon: Video },
  { title: "Profile", href: "/profile", icon: UserCircle },
];

const adminLinks = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Campaigns", href: "/campaigns", icon: Megaphone },
  { title: "Creators", href: "/admin/creators", icon: Users },
  { title: "Videos", href: "/admin/videos", icon: Video },
  { title: "Payments", href: "/admin/payments", icon: CreditCard },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAdmin = session?.user?.role === "admin";
  const links = isAdmin ? adminLinks : creatorLinks;

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <span className="text-lg font-semibold tracking-tight">
          UGC Manager
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === link.href}
                  >
                    <Link href={link.href}>
                      <link.icon />
                      <span>{link.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
