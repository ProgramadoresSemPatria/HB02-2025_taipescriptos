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
import { useAuth } from '@/hooks/useAuth'

const navMainData = [
  {
    title: 'Início',
    url: '/',
    icon: <Home className="h-4 w-4" />,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  // Dados do usuário para a sidebar
  const userData = user
    ? {
        name: user.name,
        email: user.email,
      }
    : {
        name: 'Usuário',
        email: 'carregando...',
      }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
            <Brain className="h-6 w-6 text-primary-foreground dark:text-foreground" />
          </div>
          <span className="text-xl font-bold text-primary dark:text-primary-glow">
            Study Buddy
          </span>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <NavMain items={navMainData} />
      </SidebarContent>
      <ThemeSelector />
      <Separator />
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
