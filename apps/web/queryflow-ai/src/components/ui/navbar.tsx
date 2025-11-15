'use client'

import { Search, Bell, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'

const navigation = [
  { label: 'Dashboard', href: '#' },
  { label: 'Playground', href: '#' },
  { label: 'Datasets', href: '#' },
  { label: 'Activity', href: '#' },
]

export function Navbar() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-3 px-4">
        <SidebarTrigger className="md:hidden" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">QueryFlow AI</span>
          <span className="text-xs text-muted-foreground">Workspace</span>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <Button
              key={item.label}
              variant={item.label === 'Playground' ? 'secondary' : 'ghost'}
              size="sm"
              className="font-medium"
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden w-64 md:flex">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search prompts, datasets..." className="pl-8" />
          </div>
          <Button size="icon" variant="ghost" className="md:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Open search</span>
          </Button>
          <Button size="icon" variant="ghost">
            <Bell className="h-5 w-5" />
            <span className="sr-only">View notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 pl-2 pr-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://avatar.vercel.sh/shadcn" alt="Profile" />
                  <AvatarFallback>QA</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Apoorv</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My workspace</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings & billing</DropdownMenuItem>
              <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked>Launch summary</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>New dataset alerts</DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

