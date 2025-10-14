"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Clock, Layout, Folder } from "lucide-react"
import { useCommittee } from "@/lib/committee-context"
import { SetupNewCommittee } from "@/components/setup-committee"
import CommitteeSetupModal from "@/components/committee-setup-modal"
import { logSessionStart } from "@/lib/logging"

// Mock data - replace with actual data later
const recentCommittees = [
  { id: 1, name: "Security Council", members: 15, lastAccessed: "2 hours ago" },
  { id: 2, name: "General Assembly", members: 193, lastAccessed: "1 day ago" },
  { id: 3, name: "Human Rights Council", members: 47, lastAccessed: "3 days ago" },
]

const templates = [
  { id: 1, name: "UN Security Council", members: 15, description: "Standard UN Security Council setup" },
  { id: 2, name: "Small Committee", members: 10, description: "For smaller discussion groups" },
  { id: 3, name: "Large Assembly", members: 50, description: "For large-scale simulations" },
]

const myCommittees = [
  { id: 1, name: "ECOSOC 2024", members: 54, created: "Jan 15, 2025" },
  { id: 2, name: "DISEC Session", members: 25, created: "Feb 20, 2025" },
  { id: 3, name: "Custom MUN", members: 30, created: "Mar 5, 2025" },
]

export default function Page() {
  const [setupModalOpen, setSetupModalOpen] = useState(false)
  const { setCommittee } = useCommittee()

  const handleSetupComplete = (data: {
    name: string
    abbrev: string
    agenda: string
    chair: string
    coChair: string
    rapporteur: string
    countries: Array<{ name: string; code: string; attendance: 'present' | 'absent' | 'present-voting' }>
    countryList: Array<{ id: string; name: string; flagQuery: string }>
  }) => {
    try {
      console.log('Setting up committee with data:', data);
      const committeeData = {
        id: Math.random().toString(36).substr(2, 9),
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
          notificationsEnabled: data.settings?.notificationsEnabled ?? true
        }
      };
      logSessionStart(`Committee prepared: ${data.name}`, data.countries.length);
      console.log('Saving committee data:', committeeData);
      setCommittee(committeeData);
    } catch (error) {
      console.error('Error setting up committee:', error);
    }
    setSetupModalOpen(false)
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentCommittees.map((committee) => (
              <Card key={committee.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{committee.name}</CardTitle>
                  <CardDescription>{committee.members} members</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Last accessed: {committee.lastAccessed}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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

        {/* My Committees Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Folder className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">My Committees</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myCommittees.map((committee) => (
              <Card key={committee.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{committee.name}</CardTitle>
                  <CardDescription>{committee.members} members</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Created: {committee.created}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
