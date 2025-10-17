// src/app/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Clock, Layout, Loader2 } from "lucide-react"
import { useCommittee } from "@/lib/committee-context"
import CommitteeSetupModal from "@/components/committee-setup-modal"
import { logSessionStart } from "@/lib/logging"
import { saveCommittee } from "@/lib/session-storage"
import { 
  getRecentCommittees, 
  updateCommitteeAccess,
  getCommitteeById 
} from "@/lib/supabase/committees"
import { createCommitteeAction } from "@/lib/actions/committees"

// Mock templates
const templates = [
  { id: 1, name: "UN Security Council", members: 15, description: "Standard UN Security Council setup" },
  { id: 2, name: "Small Committee", members: 10, description: "For smaller discussion groups" },
  { id: 3, name: "Large Assembly", members: 50, description: "For large-scale simulations" },
]

export default function Page() {
  const [setupModalOpen, setSetupModalOpen] = useState(false)
  const [recentCommittees, setRecentCommittees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { setCommittee } = useCommittee()
  const router = useRouter()

  // Load recent committees on mount
  useEffect(() => {
    loadRecentCommittees()
  }, [])

  const loadRecentCommittees = async () => {
    setIsLoading(true)
    try {
      const committees = await getRecentCommittees(6)
      setRecentCommittees(committees)
    } catch (error) {
      console.error('Error loading recent committees:', error)
    } finally {
      setIsLoading(false)
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
    countryList: Array<{ id: string; name: string; flagQuery: string }>
    settings?: any
  }) => {
    try {
      console.log('Setting up committee with data:', data)
      
      // Call server action
      const result = await createCommitteeAction(data)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create committee')
      }

      const committeeData = {
        id: result.committee_id,
        name: data.name,
        abbrev: data.abbrev,
        agenda: data.agenda,
        countries: data.countries || [],
        countryList: data.countryList || [],
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
      }

      logSessionStart(`Committee prepared: ${data.name}`, data.countries.length)
      console.log('Saving committee data:', committeeData)

      saveCommittee(committeeData)
      setCommittee(committeeData)

      // Reload recent committees
      await loadRecentCommittees()

      // Navigate to speaker list
      router.push(`/speaker-list?committee=${result.committee_id}`)
    } catch (error) {
      console.error('Error setting up committee:', error)
      alert(`Failed to create committee: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    setSetupModalOpen(false)
  }

  const handleCommitteeClick = async (committeeId: string) => {
    try {
      // Update last accessed time
      await updateCommitteeAccess(committeeId)
      
      // Load full committee data
      const fullCommittee = await getCommitteeById(committeeId)
      
      // Set in context and session storage
      saveCommittee(fullCommittee)
      setCommittee(fullCommittee)
      
      // Navigate to speaker list
      router.push(`/speaker-list?committee=${committeeId}`)
    } catch (error) {
      console.error('Error loading committee:', error)
      alert('Failed to load committee. Please try again.')
    }
  }

  return (
    <main className="min-h-dvh">
      <CommitteeSetupModal 
        open={setupModalOpen} 
        onOpenChange={setSetupModalOpen}
        onSetupComplete={handleSetupComplete}
      />
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Committees</h1>
            <p className="text-muted-foreground">Manage and create your committees</p>
          </div>
          <Button onClick={() => setSetupModalOpen(true)} size="lg">
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
                <Button onClick={() => setSetupModalOpen(true)}>
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