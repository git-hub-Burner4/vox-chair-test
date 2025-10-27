"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Clock, Layout, Loader2, LogIn, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useCommittee } from "@/lib/committee-context"
import CommitteeSetupModal from "@/components/committee-setup-modal"
import { logSessionStart } from "@/lib/logging"
import { saveCommittee } from "@/lib/session-storage"
import { 
  getRecentCommittees, 
  saveCommitteeToDatabase,
  updateCommitteeAccess,
  getCommitteeById,
  deleteCommittee
} from "@/lib/supabase/committees"
import { useAuth } from "@/lib/auth-context"

// Mock templates
const templates = [
  { id: 1, name: "UN Security Council", members: 15, description: "Standard UN Security Council setup", countries: ["United States of America", "United Kingdom", "France", "Russian Federation", "China", "Brazil", "Japan", "Germany", "India", "South Africa", "Nigeria", "Mexico", "Australia", "Saudi Arabia", "Turkey"] },
  { id: 2, name: "Small Committee", members: 10, description: "For smaller discussion groups", countries: [] },
  { id: 3, name: "Large Assembly", members: 50, description: "For large-scale simulations", countries: [] },
]

export default function Page() {
  const [setupModalOpen, setSetupModalOpen] = useState(false)
  const [authGateOpen, setAuthGateOpen] = useState(false)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [signupDialogOpen, setSignupDialogOpen] = useState(false)
  const [recentCommittees, setRecentCommittees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { setCommittee } = useCommittee()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadRecentCommittees()
  }, [user])

  const loadRecentCommittees = async () => {
    setIsLoading(true)
    try {
      if (user) {
        const committees = await getRecentCommittees(6)
        setRecentCommittees(committees)
      } else {
        setRecentCommittees([])
      }
    } catch (error) {
      console.error('Error loading recent committees:', error)
      setRecentCommittees([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCommitteeClick = () => {
    if (!user) {
      setAuthGateOpen(true)
    } else {
      setSetupModalOpen(true)
    }
  }

  const handleSetupComplete = async (data: {
    name: string
    abbrev: string
    agenda: string
    chair: string
    coChair: string
    rapporteur: string
    countries: Array<{ name: string; code: string; attendance: 'present' | 'absent' | 'present-voting' }>
    countryList: Array<{ id: string; name: string; flagQuery: string; attendance?: 'present' | 'absent' | 'present-voting' }>
    settings?: any
  }) => {
    try {
      
      const savedCommittee = await saveCommitteeToDatabase(
        {
          name: data.name,
          abbrev: data.abbrev,
          agenda: data.agenda,
          chair: data.chair,
          coChair: data.coChair,
          rapporteur: data.rapporteur,
          settings: data.settings || {}
        },
        data.countries
      );

      const committeeData = {
        id: savedCommittee.committee_id || savedCommittee.id,
        name: data.name,
        abbrev: data.abbrev,
        agenda: data.agenda,
        countries: data.countries || [],
        countryList: (data.countryList || []).map((country: any) => ({
          id: country.id,
          name: country.name,
          flagQuery: country.flagQuery,
          attendance: (country.attendance as 'present' | 'absent' | 'present-voting') || 'present'
        })),
        chair: data.chair,
        coChair: data.coChair,
        rapporteur: data.rapporteur,
        settings: {
          enableMotions: data.settings?.enableMotions ?? true,
          enableVoting: data.settings?.enableVoting ?? true,
          showTimer: data.settings?.showTimer ?? true,
          showSpeakerList: data.settings?.showSpeakerList ?? true,
          showMotions: data.settings?.showMotions ?? true,
          recordSession: data.settings?.recordSession ?? true,
          autoSaveDrafts: data.settings?.autoSaveDrafts ?? true,
          notificationsEnabled: data.settings?.notificationsEnabled ?? true,
          speakingTime: data.settings?.speakingTime ?? 120
        }
      };

      logSessionStart(`Committee prepared: ${data.name}`, data.countries.length);

      saveCommittee(committeeData);
      setCommittee(committeeData);

      await loadRecentCommittees();

      router.push(`/speaker-list?committee=${committeeData.id}`);
    } catch (error) {
      console.error('Error setting up committee:', error);
      alert('Failed to create committee. Please try again.');
    }
    setSetupModalOpen(false)
  }

  const handleCommitteeClick = async (committeeId: string) => {
    try {
      await updateCommitteeAccess(committeeId);
      
      const fullCommittee = await getCommitteeById(committeeId);
      
      saveCommittee(fullCommittee);
      setCommittee(fullCommittee);
      
      router.push(`/speaker-list?committee=${committeeId}`);
    } catch (error) {
      console.error('Error loading committee:', error);
      alert('Failed to load committee. Please try again.');
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh">
      <CommitteeSetupModal 
        open={setupModalOpen} 
        onOpenChange={setSetupModalOpen}
        onSetupComplete={handleSetupComplete}
      />

      {/* Authentication Gate Dialog */}
      <Dialog open={authGateOpen} onOpenChange={setAuthGateOpen}>
        <DialogContent className="sm:max-w-md" title="Welcome to Vox Chair">
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="text-2xl">Welcome to Vox Chair</DialogTitle>
            <DialogDescription>
              Create and manage Model UN committees with ease
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm text-muted-foreground py-4">
            <p className="flex items-start gap-3">
              <span className="text-primary text-lg">✓</span>
              <span>Create and manage multiple committees</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-primary text-lg">✓</span>
              <span>Manage speaker lists and timing</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-primary text-lg">✓</span>
              <span>Track motions and voting</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-primary text-lg">✓</span>
              <span>Create and share draft resolutions</span>
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
  variant="outline"
  onClick={() => setAuthGateOpen(false)}
>
  Cancel
</Button>
<Button 
  variant="outline"
  onClick={() => {
    setAuthGateOpen(false)
    setLoginDialogOpen(true)
  }}
>
  <LogIn className="mr-2 h-4 w-4" />
  Log In
</Button>
<Button 
  onClick={() => {
    setAuthGateOpen(false)
    setSignupDialogOpen(true)
  }}
>
  Sign Up
</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
<Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
  <DialogContent className="sm:max-w-[425px]" title="Log In">
    <DialogHeader>
      <DialogTitle>Log in to your account</DialogTitle>
      <DialogDescription>
        Enter your email and password to access your account
      </DialogDescription>
    </DialogHeader>
    <form onSubmit={async (e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        alert(error.message)
      } else {
        setLoginDialogOpen(false)
        router.refresh()
      }
    }}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Log in
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              })
            }}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              })
            }}
          >
            <svg
                    className="mr-2 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
            GitHub
          </Button>
        </div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => {
              setLoginDialogOpen(false)
              setSignupDialogOpen(true)
            }}
          >
            Sign up
          </Button>
        </div>
      </div>
    </form>
  </DialogContent>
</Dialog>

{/* Signup Dialog */}
<Dialog open={signupDialogOpen} onOpenChange={setSignupDialogOpen}>
  <DialogContent className="sm:max-w-[425px]" title="Sign Up">
    <DialogHeader>
      <DialogTitle>Create an account</DialogTitle>
      <DialogDescription>
        Enter your details to create your account
      </DialogDescription>
    </DialogHeader>
    <form onSubmit={async (e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const name = formData.get('name') as string
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })
      
      if (error) {
        alert(error.message)
      } else {
        setSignupDialogOpen(false)
        alert("Check your email to verify your account!")
        router.refresh()
      }
    }}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="signup-name">Name</Label>
          <Input
            id="signup-name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>
        <Button type="submit" className="w-full">
          Sign up
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              })
            }}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              })
            }}
          >
            <svg
                    className="mr-2 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
            GitHub
          </Button>
        </div>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => {
              setSignupDialogOpen(false)
              setLoginDialogOpen(true)
            }}
          >
            Log in
          </Button>
        </div>
      </div>
    </form>
  </DialogContent>
</Dialog>
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Committees</h1>
            <p className="text-muted-foreground">Manage and create your committees</p>
          </div>
          <Button onClick={handleCreateCommitteeClick} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create New Committee
          </Button>
        </div>

        {/* Recent Committees Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Recent Committees</h2>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : recentCommittees.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No recent committees</p>
                <p className="text-sm text-muted-foreground mb-4">Create your first committee to get started</p>
                <Button onClick={handleCreateCommitteeClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Committee
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentCommittees.map((committee) => (
  <Card 
    key={committee.id} 
    className="hover:shadow-lg transition-shadow cursor-pointer relative group"
  >
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      onClick={async (e) => {
        e.stopPropagation()
        if (window.confirm(`Delete "${committee.name}"? This cannot be undone.`)) {
          try {
            await deleteCommittee(committee.id)
            await loadRecentCommittees()
            toast.success("Committee deleted")
          } catch (error) {
            toast.error("Failed to delete committee")
          }
        }
      }}
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
    <div onClick={() => handleCommitteeClick(committee.id)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{committee.name}</span>
        </CardTitle>
        <CardDescription>{committee.members} members</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Last accessed: {committee.lastAccessed}</p>
      </CardContent>
    </div>
  </Card>
))}
            </div>
          )}
        </section>

        {/* Templates Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Layout className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Templates</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
  <Card 
    key={template.id} 
    className="hover:shadow-lg transition-shadow cursor-pointer"
    onClick={() => {
      if (template.countries.length > 0) {
        // Pre-populate setup modal with template data
        setSetupModalOpen(true)
        // You'll need to add a way to pass template data to the modal
      } else {
        toast.info("This template is coming soon!")
      }
    }}
  >
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.members} members</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}