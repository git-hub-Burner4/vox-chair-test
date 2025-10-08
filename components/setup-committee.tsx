"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusIcon } from "@radix-ui/react-icons"
import { useMemo, useState } from "react"

type Country = { id: string; name: string; flagQuery: string }

const UN_COUNTRIES: Country[] = [
  { id: "afg", name: "Afghanistan", flagQuery: "flag of Afghanistan" },
  { id: "alb", name: "Albania", flagQuery: "flag of Albania" },
  { id: "ago", name: "Angola", flagQuery: "flag of Angola" },
  { id: "alg", name: "Algeria", flagQuery: "flag of Algeria" },
  { id: "and", name: "Andorra", flagQuery: "flag of Andorra" },
  { id: "atg", name: "Antigua and Barbuda", flagQuery: "flag of Antigua and Barbuda" },
  { id: "arg", name: "Argentina", flagQuery: "flag of Argentina" },
  { id: "arm", name: "Armenia", flagQuery: "flag of Armenia" },
  { id: "aus", name: "Australia", flagQuery: "flag of Australia" },
  { id: "aut", name: "Austria", flagQuery: "flag of Austria" },
  { id: "aze", name: "Azerbaijan", flagQuery: "flag of Azerbaijan" },
]

function FlagAvatar({ query, alt }: { query: string; alt: string }) {
  return (
    <Avatar className="h-7 w-7">
      <AvatarImage alt={alt} src={`/.jpg?height=28&width=28&query=${encodeURIComponent(query)}`} />
      <AvatarFallback className="text-xs">UN</AvatarFallback>
    </Avatar>
  )
}

function CountryRow({
  country,
  onAdd,
}: {
  country: Country
  onAdd: (c: Country) => void
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 min-w-0">
        <FlagAvatar query={country.flagQuery} alt={`${country.name} flag`} />
        <span className="truncate">{country.name}</span>
      </div>
      <Button variant="ghost" size="icon" aria-label={`Add ${country.name}`} onClick={() => onAdd(country)}>
        <PlusIcon />
      </Button>
    </div>
  )
}

export function SetupNewCommittee({
  onAddCountry,
  onAddCustom,
}: {
  onAddCountry: (c: Country) => void
  onAddCustom: (name: string) => void
}) {
  const [customName, setCustomName] = useState("")

  const [q, setQ] = useState("")
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return UN_COUNTRIES
    return UN_COUNTRIES.filter((c) => c.name.toLowerCase().includes(s))
  }, [q])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">Set Up New Committee</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="custom-member-input" className="font-medium">Custom Members</Label>
          <div className="flex items-center gap-2">
            <Input
              id="custom-member-input"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter custom member"
              aria-label="Enter custom member"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const name = customName.trim()
                  if (!name) return
                  onAddCustom(name)
                  setCustomName("")
                }
              }}
            />
            <Button
              variant="outline"
              size="icon"
              aria-label="Add custom member"
              onClick={() => {
                const name = customName.trim()
                if (!name) return
                onAddCustom(name)
                setCustomName("")
              }}
            >
              <PlusIcon />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="un-search-input" className="font-medium">UN Member States</Label>
          <Input
            id="un-search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            aria-label="Search UN member states"
          />

          <Separator />

          <ScrollArea className="h-[360px] pr-3">
            <div className="divide-y">
              {filtered.map((c) => (
                <CountryRow key={c.id} country={c} onAdd={onAddCountry} />
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
