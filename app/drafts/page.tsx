"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileTextIcon, PlusIcon, ExclamationTriangleIcon, FileIcon, DotsHorizontalIcon, ChevronRightIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useSidePaneStore } from "@/lib/store/side-pane-store"
import { SidePane } from "@/components/side-pane"
import { MilkdownEditor } from "@/components/milkdown-editor"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logDraftCreated, logDraftDeleted } from "@/lib/logging"

type Draft = {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

type DraftType = {
  name: string
  color: string
  icon: React.ReactNode
}

const DRAFT_TYPES: DraftType[] = [
  { name: "Crisis Note", color: "orange", icon: <ExclamationTriangleIcon className="h-5 w-5" /> },
  { name: "Working Paper", color: "blue", icon: <FileIcon className="h-5 w-5" /> },
  { name: "Custom", color: "gray", icon: <FileTextIcon className="h-5 w-5" /> },
]

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([
    {
      id: crypto.randomUUID(),
      title: "Lorem",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ["Crisis Note"],
    }
  ])
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewDraftOpen, setIsNewDraftOpen] = useState(false)
  const [draftName, setDraftName] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const { open } = useSidePaneStore()
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [draftToDelete, setDraftToDelete] = useState<Draft | null>(null)
  const [hoveredDraft, setHoveredDraft] = useState<string | null>(null)

  const filteredDrafts = drafts.filter((draft) =>
    draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleCreateDraft = () => {
    if (!draftName.trim() || !selectedType) return
    
    const selectedDraftType = DRAFT_TYPES.find(t => t.name === selectedType)
    if (selectedDraftType?.name === "Custom") {
      // Do nothing for Custom for now
      return
    }

    const newDraft: Draft = {
      id: crypto.randomUUID(),
      title: draftName,
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [selectedType],
    }

    setDrafts([...drafts, newDraft])
    logDraftCreated(draftName, selectedType)
    setIsNewDraftOpen(false)
    setDraftName("")
    setSelectedType(null)
  }

  const getTagColor = (tag: string) => {
    const type = DRAFT_TYPES.find(t => t.name === tag)
    if (type?.color === "orange") return "bg-orange-100 text-orange-800 border-orange-300"
    if (type?.color === "blue") return "bg-blue-100 text-blue-800 border-blue-300"
    return "bg-gray-100 text-gray-800 border-gray-300"
  }

  const handleDeleteConfirm = () => {
    if (draftToDelete) {
      const draftType = draftToDelete.tags[0] || "Draft"
      logDraftDeleted(draftToDelete.title, draftType)
      setDrafts(drafts.filter(d => d.id !== draftToDelete.id))
      setDraftToDelete(null)
    }
    setIsDeleteAlertOpen(false)
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Drafts</h1>
            <p className="text-muted-foreground mt-1">
              Manage your working papers, resolutions, and amendments
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={open} variant="outline">
              Open Side Pane (Temp)
            </Button>
            <Button onClick={() => setIsNewDraftOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Draft
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search drafts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {filteredDrafts.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No drafts found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Get started by creating your first draft"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDrafts.map((draft) => (
              <Card 
                key={draft.id} 
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer relative group"
                onMouseEnter={() => setHoveredDraft(draft.id)}
                onMouseLeave={() => setHoveredDraft(null)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg truncate flex-1">{draft.title}</h3>
                    {hoveredDraft === draft.id && (
                      <ChevronRightIcon className="h-5 w-5 text-muted-foreground transition-opacity" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {draft.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className={getTagColor(tag)}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Created {draft.createdAt.toLocaleDateString()}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <DotsHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Download as PDF</DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            setDraftToDelete(draft)
                            setIsDeleteAlertOpen(true)
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <SidePane title="Side Panel">
        <MilkdownEditor
          defaultValue=""
          onChange={(markdown) => console.log("Editor content:", markdown)}
        />
      </SidePane>

      <Dialog open={isNewDraftOpen} onOpenChange={setIsNewDraftOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Draft</DialogTitle>
            <DialogDescription>
              Enter a name for your draft and select a type.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="draft-name">Draft Name</Label>
              <Input
                id="draft-name"
                placeholder="Enter draft name..."
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Draft Type</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DRAFT_TYPES.map((type) => (
                  <Button
                    key={type.name}
                    type="button"
                    variant={selectedType === type.name ? "default" : "outline"}
                    className={`flex-1 min-w-0 h-auto py-3 px-4 text-sm ${
                      selectedType === type.name
                        ? type.color === "orange"
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : type.color === "blue"
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : ""
                        : ""
                    }`}
                    onClick={() => setSelectedType(type.name)}
                  >
                    <span className="mr-2">{type.icon}</span>
                    <span className="truncate">{type.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNewDraftOpen(false)
                setDraftName("")
                setSelectedType(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDraft}
              disabled={!draftName.trim() || !selectedType}
            >
              Create Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{draftToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
