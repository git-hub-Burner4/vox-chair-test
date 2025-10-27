"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Clock, Layout, Loader2, LogIn } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
  getCommitteeById 
} from "@/lib/supabase/committees"
import { useAuth } from "@/lib/auth-context"

// Mock templates
const templates = [
  { id: 1, name: "UN Security Council", members: 15, description: "Standard UN Security Council setup" },
  { id: 2, name: "Small Committee", members: 10, description: "For smaller discussion groups" },
  { id: 3, name: "Large Assembly", members: 50, description: "For large-scale simulations" },
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
      console.log('Setting up committee with data:', data);
      
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
      console.log('Saving committee data:', committeeData);

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
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleCommitteeClick(committee.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{committee.name}</span>
                      <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                        {committee.abbrev}
                      </span>
                    </CardTitle>
                    <CardDescription>{committee.members} members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Last accessed: {committee.lastAccessed}</p>
                  </CardContent>
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
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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