'use client'
import React from "react"
import {
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar"
import { Sidebar } from "@/components/ui/sidebar"
import { LayoutDashboard, Bot, Presentation, CreditCard, Plus } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { projectShutdown } from "next/dist/build/swc/generated-native"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const items = [
  {
    title: "Dashboard",
    url: "/Dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Presentation,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
]

const projects =[
  {
    name:'Project 1'
  },
  {
    name:'Project 1'
  },
  {
    name:'Project 1'
  },
]

export function AppSidebar() {

  const pathname = usePathname()
  const {open } = useSidebar()
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
<div className="flex items-center gap-2">
  <Image src='/logo.png' alt='logo' width={40} height={40} />
  {open &&( <h1 className="text-xl font-bold text-primary/80">
    Dionysus</h1>)}
 
</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span>Application</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                    <Link
  href={item.url}
  className={cn(
    'flex items-center p-2 rounded-md transition-all',
    isActive
      ? 'bg-[rgb(0,0,0)] text-white' // Active state with pure black
      : 'bg-transparent text-gray-800 hover:bg-[rgb(0,0,0)] hover:text-white' // Default and hover states with pure black
  )}
>
  <item.icon className="mr-2 text-gray-700" />
  <span className="font-medium">{item.title}</span>
</Link>



                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        <SidebarGroup>
          <SidebarGroupLabel>
            Your Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map(project => {
                return (
                  <SidebarMenuItem key={project.name}>

                    <SidebarMenuButton asChild>
                      <div>
                        <div className={cn('rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary',
                          {
                            'bg-primary text-white' : true
                          }
                        )}>
                          {project.name[0]}

                        </div>
                        <span>
                          {project.name}
                        </span>
                      </div>

                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              <div className="h-2"></div>
              {open && (
                <SidebarMenuItem>
                  <Link href='/create'>
                <Button size ='sm' variant={'outline'} className="w-fit">
                  <Plus />
                  Create Project 
                </Button>
                </Link>
                </SidebarMenuItem>
              )}
                
              
            </SidebarMenu>
          </SidebarGroupContent>


        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
