import {
  CirclePlus,
  ChevronRight,
  BookOpen,
  BookCheck,
  FileStack,
  NotebookPen,
} from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useNavigate } from 'react-router-dom'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
}) {
  const navigate = useNavigate()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => navigate(item.url)}
              >
                {item.icon && item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <Collapsible asChild defaultOpen={true} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip="Teste">
                  <BookOpen />
                  <span>JavaScript Estudo</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#">
                        <NotebookPen />
                        <span>Resumo</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#">
                        <BookCheck />
                        <span>Quiz</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href="#">
                        <FileStack />
                        <span>Flashcards</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
        <Separator />
        <SidebarMenuItem className="flex items-center gap-2">
          <SidebarMenuButton
            tooltip="Quick Create"
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            onClick={() => navigate('/uploadpage')}
          >
            <CirclePlus />
            <span>Novo Estudo</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
