"use client"

import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { DotsHorizontalIcon, Pencil1Icon } from "@radix-ui/react-icons"
import { Trash2 } from "lucide-react"
import { FlagAvatar } from "@/components/ui/flag-avatar"

// Types
type Selected = { id: string; name: string; flagQuery: string }

// Lazy load Dialog and Dropdown components via the UI barrel
const DropdownMenu = dynamic(() => import("@/components/ui").then(mod => ({ default: mod.DropdownMenu })))
const DropdownMenuContent = dynamic(() => import("@/components/ui").then(mod => ({ default: mod.DropdownMenuContent })))
const DropdownMenuItem = dynamic(() => import("@/components/ui").then(mod => ({ default: mod.DropdownMenuItem })))
const DropdownMenuTrigger = dynamic(() => import("@/components/ui").then(mod => ({ default: mod.DropdownMenuTrigger })))
const Dialog = dynamic(() => import("@/components/ui").then(mod => ({ default: mod.Dialog })))
const DialogContent = dynamic(() => import("@/components/ui").then(mod => ({ default: mod.DialogContent })))
const DialogFooter = dynamic(() => import("@/components/ui").then(mod => ({ default: mod.DialogFooter })))
const DialogHeader = dynamic(() => import("@/components/ui").then(mod => ({ default: mod.DialogHeader })))
const DialogTitle = dynamic(() => import("@/components/ui").then(mod => ({ default: mod.DialogTitle })))
const DialogTrigger = dynamic(() => import("@/components/ui").then(mod => ({ default: mod.DialogTrigger })))

function SelectedRow({
  item,
  onRemove,
  onRename,
}: {
  item: Selected
  onRemove: (id: string) => void
  onRename: (id: string, name: string) => void
}) {
  const [renameOpen, setRenameOpen] = useState(false)
  const [temp, setTemp] = useState(item.name)

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 min-w-0">
        <FlagAvatar query={item.flagQuery} alt={`${item.name} flag`} />
        <span className="truncate">{item.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Rename ${item.name}`}>
              <Pencil1Icon />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rename Member</DialogTitle>
            </DialogHeader>
            <Input value={temp} onChange={(e) => setTemp(e.target.value)} aria-label="New name" />
            <DialogFooter>
              <Button variant="secondary" onClick={() => setRenameOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const n = temp.trim()
                  if (n) onRename(item.id, n)
                  setRenameOpen(false)
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More actions">
              <DotsHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setRenameOpen(true)}>
              <Pencil1Icon className="mr-2 h-4 w-4" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onRemove(item.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function EditableCommittee({
  items,
  onRemove,
  onRename,
  title,
  setTitle,
  onClear,
  onStart,
}: {
  items: Selected[]
  onRemove: (id: string) => void
  onRename: (id: string, name: string) => void
  title: string
  setTitle: (t: string) => void
  onClear: () => void
  onStart: () => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-balance">{title}</CardTitle>
            <CardDescription className="mt-1">
              {items.length} {items.length === 1 ? "Country" : "Countries"}
            </CardDescription>
          </div>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Edit committee name">
                <Pencil1Icon />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Committee Name</DialogTitle>
              </DialogHeader>
              <Input defaultValue={title} onChange={(e) => setTitle(e.target.value)} aria-label="Committee name" />
              <DialogFooter>
                <Button onClick={() => setEditOpen(false)}>Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="divide-y">
          {items.map((i) => (
            <SelectedRow key={i.id} item={i} onRemove={onRemove} onRename={onRename} />
          ))}
        </div>

        <div className="mt-10 flex items-center justify-end">
          <Button variant="link" onClick={onClear} className="px-0">
            Clear Selection
          </Button>
        </div>

        <div className="mt-2">
          <Button className="w-full" onClick={onStart}>
            Start Session
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
