import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/Sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/SiteHeader'

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="h-screen flex flex-col bg-background">
        <div className="flex-grow flex">
          <aside>
            <AppSidebar />
          </aside>
          <main className="p-4 flex-grow min-w-0">
            <SiteHeader />
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
