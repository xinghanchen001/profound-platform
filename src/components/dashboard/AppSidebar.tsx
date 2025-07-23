'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import {
  BarChart3,
  Zap,
  Globe,
  MessageSquare,
  Target,
  FileText,
  Search,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Link as LinkIcon,
} from 'lucide-react'

const navigationItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: BarChart3,
    isActive: true,
  },
  {
    title: "Answer Engine Insights",
    url: "/dashboard/insights",
    icon: Zap,
  },
  {
    title: "Citations",
    url: "/dashboard/citations",
    icon: LinkIcon,
  },
  {
    title: "My Website",
    url: "/dashboard/website",
    icon: Globe,
  },
  {
    title: "Conversations",
    url: "/dashboard/conversations",
    icon: MessageSquare,
    badge: "Beta",
  },
  {
    title: "Actions",
    url: "/dashboard/actions",
    icon: Target,
    badge: "Beta",
  },
  {
    title: "Custom Reports",
    url: "/dashboard/reports",
    icon: FileText,
    badge: "Beta",
  },
]

const managementItems = [
  {
    title: "Brands",
    url: "/dashboard/brands",
    icon: Globe,
  },
  {
    title: "Topics",
    url: "/dashboard/topics",
    icon: Target,
  },
  {
    title: "Prompts",
    url: "/dashboard/prompts",
    icon: MessageSquare,
  },
]

export function AppSidebar() {
  const { user, organization, signOut } = useAuth()
  const pathname = usePathname()

  const isActiveRoute = (url: string) => {
    if (url === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(url)
  }

  return (
    <Sidebar className="border-r border-border bg-card">
      <SidebarHeader className="p-4 border-b border-border">
        {/* Organization/Brand Header */}
        <div className="flex items-center gap-2 w-full">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">
              {organization?.name.charAt(0).toUpperCase() || 'O'}
            </span>
          </div>
          <span className="font-medium text-foreground truncate">
            {organization?.name || 'Organization'}
          </span>
          <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
        </div>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            placeholder="Search" 
            className="pl-10 pr-12 bg-background"
          />
          <kbd className="absolute right-3 top-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">⌘K</kbd>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs font-medium px-3 py-2">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActiveRoute(item.url)}>
                    <Link href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-md">
                      <item.icon className="w-4 h-4" />
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        {/* Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs font-medium px-3 py-2">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActiveRoute(item.url)}>
                    <Link href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-md">
                      <item.icon className="w-4 h-4" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        {/* User Section */}
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {organization?.name || 'No organization'}
                </p>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="flex-1">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="flex-1" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}