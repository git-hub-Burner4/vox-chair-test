"use client"

import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { logMemberAdded, logMemberRemoved, logMemberRenamed, logSessionStart } from "@/lib/logging"

// Lazy load heavy components
const SetupNewCommittee = dynamic(() => import("@/components/setup-committee").then(mod => ({ default: mod.SetupNewCommittee })), {
  loading: () => <Skeleton className="h-[600px] w-full" />,
  ssr: true
})
const EditableCommittee = dynamic(() => import("@/components/editable-committee").then(mod => ({ default: mod.EditableCommittee })), {
  loading: () => <Skeleton className="h-[600px] w-full" />,
  ssr: true
})

// ----- Data -----
type Country = { id: string; name: string; flagQuery: string }

// ----- Left Column -----
function LoadCommittee() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-balance">Load Committee</CardTitle>
        <CardDescription className="sr-only">Load from a file or template</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Button variant="outline" className="flex-1 bg-transparent">
          From File
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          From Template
        </Button>
      </CardContent>
    </Card>
  )
}

// ----- Right Column -----
type Selected = { id: string; name: string; flagQuery: string }

// ----- Page -----
export default function Page() {
  const [title, setTitle] = useState("Editable Committee Name")
  const [selected, setSelected] = useState<Selected[]>([])

  function addCountry(c: Country) {
    setSelected((curr) => {
      if (curr.some((x) => x.id === c.id)) return curr
      return [...curr, { id: c.id, name: c.name, flagQuery: c.flagQuery }]
    })
  }

  function addCustom(name: string) {
    const id = `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    setSelected((curr) => {
      if (curr.some((x) => x.id === id)) return curr
      return [...curr, { id, name, flagQuery: "custom member icon" }]
    })
  }

  function remove(id: string) {
    setSelected((curr) => {
      const member = curr.find((x) => x.id === id)
      if (member) {
        logMemberRemoved(member.name)
      }
      return curr.filter((x) => x.id !== id)
    })
  }

  function rename(id: string, name: string) {
    setSelected((curr) => {
      const oldMember = curr.find((x) => x.id === id)
      if (oldMember && oldMember.name !== name) {
        logMemberRenamed(oldMember.name, name)
      }
      return curr.map((x) => (x.id === id ? { ...x, name } : x))
    })
  }

  function clearAll() {
    setSelected([])
  }

  const router = useRouter()

  function start() {
    if (selected.length === 0) {
      alert("Please add at least one member to start a session")
      return
    }
    // Log session start
    logSessionStart(title, selected.length)
    // Store session data in sessionStorage
    sessionStorage.setItem("sessionData", JSON.stringify({ title, members: selected }))
    // Navigate to speaker-list page
    router.push("/speaker-list")
  }

  return (
    <main className="min-h-dvh">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <LoadCommittee />
            <SetupNewCommittee onAddCountry={addCountry} onAddCustom={addCustom} />
          </div>

          <EditableCommittee
            title={title}
            setTitle={setTitle}
            items={selected}
            onRemove={remove}
            onRename={rename}
            onClear={clearAll}
            onStart={start}
          />
        </div>
      </div>
    </main>
  )
}
