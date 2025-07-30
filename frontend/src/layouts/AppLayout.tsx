import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'

export function AppLayout() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-grow flex">
        <aside className="lg:w-1/5 hidden lg:block">
          <Sidebar />
        </aside>
        <main className="p-4 flex-grow min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
