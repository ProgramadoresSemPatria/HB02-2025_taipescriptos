import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/Sidebar'

export function AppLayout() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-grow flex">
        <aside>
          <AppSidebar />
        </aside>
        <main className="p-4 flex-grow min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
