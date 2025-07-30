import { Link, type LinkProps, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

type SidebarItemProps = LinkProps & {
  children: React.ReactNode
}

export function SidebarItem({
  children,
  to,
  className,
  ...props
}: SidebarItemProps) {
  const { pathname } = useLocation()
  const isActive = pathname === to

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
