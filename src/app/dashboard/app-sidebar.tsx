'use clint'

import { SidebarHeader ,Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar"

export function AppSidebar(){
return (
    <Sidebar collapsible="icon" variant="floating">

<SidebarHeader>
    logo
</SidebarHeader>
<SidebarContent>
    <SidebarGroup>
        <SidebarGroupLabel>
Application

        </SidebarGroupLabel>
    </SidebarGroup>
</SidebarContent>
    </Sidebar>
    
   
)
}