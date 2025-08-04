import {
  CirclePlus,
  ChevronRight,
  BookOpen,
  BookCheck,
  FileStack,
  NotebookPen,
  AlertCircle,
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
import { useStudyMaterials } from '@/hooks/useStudyMaterials'
import { useState } from 'react'

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
  const { materials, loading, error } = useStudyMaterials(1, 10) // Carregar até 10 estudos
  const [openStudyId, setOpenStudyId] = useState<string | null>(null)

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

          {/* Estudos do usuário */}
          {loading ? (
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Carregando...</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : error ? (
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-destructive text-xs">
                  Erro ao carregar
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : materials.length === 0 ? (
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-xs">
                  Nenhum estudo
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            materials.map((study) => (
              <Collapsible
                key={study.id}
                asChild
                open={openStudyId === study.id}
                onOpenChange={(open) => setOpenStudyId(open ? study.id : null)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={study.filename}>
                      <BookOpen />
                      <span className="truncate">
                        {study.filename.replace(/\.[^/.]+$/, '')}
                      </span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          onClick={() =>
                            navigate(`/dashboard/study/${study.id}`)
                          }
                        >
                          <a href={`/dashboard/study/${study.id}`}>
                            <NotebookPen />
                            <span>Resumo</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          onClick={() =>
                            navigate(`/dashboard/study/${study.id}?tab=quiz`)
                          }
                        >
                          <a href={`/dashboard/study/${study.id}?tab=quiz`}>
                            <BookCheck />
                            <span>Quiz</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          onClick={() =>
                            navigate(
                              `/dashboard/study/${study.id}?tab=flashcards`,
                            )
                          }
                        >
                          <a
                            href={`/dashboard/study/${study.id}?tab=flashcards`}
                          >
                            <FileStack />
                            <span>Flashcards</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))
          )}
        </SidebarMenu>
        <Separator />
        <SidebarMenuItem className="flex items-center gap-2">
          <SidebarMenuButton
            tooltip="Quick Create"
            className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground dark:text-foreground hover:text-primary-foreground hover:scale-[1.03] transition-all cursor-pointer min-w-8 duration-200 ease-linear"
            onClick={() => navigate('/dashboard/uploadpage')}
          >
            <CirclePlus />
            <span className="font-medium">Novo Estudo</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
