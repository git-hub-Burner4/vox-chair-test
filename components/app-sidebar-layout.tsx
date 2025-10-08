"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Home, Users, Settings, FileText, Maximize, FilePenLine } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { SidebarAuth } from "@/components/sidebar-auth"
import { createContext, useContext, useState } from "react"

type HeaderContextType = {
  title: string
  setTitle: (title: string) => void
}

const HeaderContext = createContext<HeaderContextType | null>(null)

export function useHeader() {
  const context = useContext(HeaderContext)
  if (!context) {
    throw new Error("useHeader must be used within AppSidebarLayout")
  }
  return context
}

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/speaker-list">
                    <Users className="h-4 w-4" />
                    <span>Speaker's List</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/drafts">
                    <FilePenLine className="h-4 w-4" />
                    <span>Drafts</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Committee</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FileText className="h-4 w-4" />
                  <span>Documents</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarAuth />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AppSidebarLayout({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState("")

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <HeaderContext.Provider value={{ title, setTitle }}>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full min-w-0">
          <header className="flex items-center justify-between gap-2 border-b px-4 py-2 sticky top-0 bg-background z-10">
            <div className="flex items-center gap-2 shrink-0">
              <SidebarTrigger />
            </div>
            {title && (
              <div className="flex-1 min-w-0 px-4">
                <h1 className="text-sm font-medium text-muted-foreground truncate text-center">{title}</h1>
              </div>
            )}
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleFullscreen} aria-label="Fullscreen">
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </header>
          {children}
        </main>
      </SidebarProvider>
    </HeaderContext.Provider>
  )
}
