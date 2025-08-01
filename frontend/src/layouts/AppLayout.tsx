import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/Sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/SiteHeader'

export function AppLayout() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 px-8 py-4 md:px-12 md:py-8 min-w-0">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
