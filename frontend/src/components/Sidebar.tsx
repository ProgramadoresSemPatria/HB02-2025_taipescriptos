import * as React from 'react'
import { Home, Brain } from 'lucide-react'

import { NavMain } from '@/components/NavMain'
import { NavUser } from '@/components/NavUser'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeSelector } from './ThemeSelector'

const data = {
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
  navMain: [
    {
      title: 'Início',
      url: '/',
      icon: <Home className="h-4 w-4" />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Study Buddy</span>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <ThemeSelector />
      <Separator />
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
