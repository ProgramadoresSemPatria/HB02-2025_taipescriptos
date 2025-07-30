import { House, Plus, LogOut, Brain } from 'lucide-react'
import { SidebarItem } from './SidebarItem'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { ThemeSelector } from './ThemeSelector'

export function Sidebar() {
  return (
    <div className="hidden lg:flex flex-col h-full bg-background border-r">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Study Buddy</span>
        </div>
      </div>

      <div className="flex-1 p-4">
        <nav className="space-y-2">
          <SidebarItem to="/">
            <House className="h-4 w-4" />
            Início
          </SidebarItem>
        </nav>

        <Separator className="my-4" />

        <Button className="w-full justify-start" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Novo Estudo
        </Button>
      </div>

      <div className="p-4 border-t space-y-2">
        <ThemeSelector />
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  )
}
