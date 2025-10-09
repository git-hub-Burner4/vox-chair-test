"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"

type NewCommittee = {
  name: string
  abbrev: string
  agenda: string
}

const SUGGESTED_COMMITTEES: Array<{ name: string; exampleAbbrev?: string }> = [
  { name: "General Assembly", exampleAbbrev: "GA" },
  { name: "Security Council", exampleAbbrev: "SC" },
  { name: "Human Rights Council", exampleAbbrev: "HRC" },
  { name: "Economic and Social Council", exampleAbbrev: "ECOSOC" },
  { name: "Disarmament and International Security Committee", exampleAbbrev: "DISEC" },
  { name: "Historical Security Council", exampleAbbrev: "HSC" },
]

function generateAbbrev(name: string) {
  const s = name.trim()
  if (!s) return ""
  // If multiple words, take initials
  const words = s.split(/[^A-Za-z0-9]+/).filter(Boolean)
  if (words.length === 1) {
    return words[0].slice(0, 4).toUpperCase()
  }
  const initials = words.map((w) => w[0].toUpperCase()).join("")
  return initials.slice(0, 6)
}

export function SetupNewCommittee({
  onCreate,
}: {
  onCreate: (n: NewCommittee) => void
}) {
  const [name, setName] = useState("")
  const [abbrev, setAbbrev] = useState("")
  const [abbrevEdited, setAbbrevEdited] = useState(false)
  const [agenda, setAgenda] = useState("")

  useEffect(() => {
    // Auto-generate abbreviation when name changes, but only if the user hasn't typed one manually
    if (!abbrevEdited) {
      setAbbrev(generateAbbrev(name))
    }
  }, [name, abbrevEdited])

  function tryCreate() {
    const n = name.trim()
    const a = (abbrev || generateAbbrev(n)).trim()
    const ag = agenda.trim()
    if (!n) {
      alert("Please enter a committee name")
      return
    }
    if (!ag) {
      alert("Please enter an agenda for the committee")
      return
    }

    onCreate({ name: n, abbrev: a, agenda: ag })
    // clear
    setName("")
    setAbbrev("")
    setAgenda("")
    setAbbrevEdited(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">Create / Select Committee</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="committee-name" className="font-medium">Committee</Label>
          <Input
            list="committee-suggestions"
            id="committee-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Select or type committee name"
            aria-label="Committee name"
          />
          <datalist id="committee-suggestions">
            {SUGGESTED_COMMITTEES.map((s) => (
              <option key={s.name} value={s.name} />
            ))}
          </datalist>
        </div>

        <div className="space-y-1">
          <Label htmlFor="committee-abbrev" className="font-medium">Abbreviation</Label>
          <Input
            id="committee-abbrev"
            value={abbrev || generateAbbrev(name)}
            onChange={(e) => {
              setAbbrev(e.target.value)
              setAbbrevEdited(true)
            }}
            placeholder="Auto-generated abbreviation"
            aria-label="Committee abbreviation"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="committee-agenda" className="font-medium">Agenda (required)</Label>
          <Textarea
            id="committee-agenda"
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            placeholder="Enter the agenda/topic for this committee"
            aria-label="Committee agenda"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={tryCreate}>Create Committee</Button>
        </div>
      </CardContent>
    </Card>
  )
}
