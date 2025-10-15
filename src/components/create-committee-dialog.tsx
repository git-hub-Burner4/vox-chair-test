"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TimePicker } from "@/components/time-picker"
import { 
  Plus, 
  X, 
  GripVertical, 
  Upload,
  Info,
  Users,
  Clock,
  Palette,
  Settings,
  Pencil
} from "lucide-react"
import { cn } from "@/lib/utils"

type Portfolio = {
  id: string
  name: string
}

function PortfolioItem({
  portfolio,
  onRemove,
  onEdit,
  onReorder,
  isDragging,
  isSearching,
  draggedOver,
}: {
  portfolio: Portfolio
  onRemove: (id: string) => void
  onEdit: (id: string, name: string) => void
  onReorder?: (draggedId: string, targetId: string) => void
  isDragging?: boolean
  isSearching?: boolean
  draggedOver?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(portfolio.name)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onEdit(portfolio.id, editedName)
      setIsEditing(false)
    }
    if (e.key === "Escape") {
      setEditedName(portfolio.name)
      setIsEditing(false)
    }
  }

  const handleBlur = () => {
    onEdit(portfolio.id, editedName)
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md border p-2",
        isDragging && "opacity-50",
        draggedOver && "border-primary",
        isSearching && "border-muted"
      )}
      draggable={!isSearching}
      onDragStart={(e) => {
        if (onReorder) {
          e.dataTransfer.setData("text/plain", portfolio.id)
        }
      }}
      onDragOver={(e) => {
        if (onReorder) {
          e.preventDefault()
        }
      }}
      onDrop={(e) => {
        if (onReorder) {
          e.preventDefault()
          const draggedId = e.dataTransfer.getData("text/plain")
          onReorder(draggedId, portfolio.id)
        }
      }}
    >
      {onReorder && !isSearching && (
        <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
      )}
      <div className="flex-1">
        {isEditing ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="h-6 py-1"
            autoFocus
          />
        ) : (
          <span
            className="cursor-text"
            onClick={() => !isSearching && setIsEditing(true)}
          >
            {portfolio.name}
          </span>
        )}
      </div>
      {!isSearching && (
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 opacity-0 group-hover:opacity-100"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 opacity-0 group-hover:opacity-100"
        onClick={() => onRemove(portfolio.id)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

type Tab = {
  id: string
  label: string
  icon: JSX.Element
  content: JSX.Element
}

export function CreateCommitteeDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [activeTab, setActiveTab] = useState("general")
  const [name, setName] = useState("")
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [newPortfolio, setNewPortfolio] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [votingEnabled, setVotingEnabled] = useState(true)
  const [speakerTimeLimit, setSpeakerTimeLimit] = useState("2")
  const [defaultSpeakerTime, setDefaultSpeakerTime] = useState<string>("02:00")
  const [committeeType, setCommitteeType] = useState("")
  const [draggedPortfolio, setDraggedPortfolio] = useState<string | null>(null)

  const filteredPortfolios = useMemo(() => {
    if (!searchQuery) return []
    const normalizedQuery = searchQuery.toLowerCase()
    return portfolios.filter((p) =>
      p.name.toLowerCase().includes(normalizedQuery)
    )
  }, [searchQuery, portfolios])

  const handleAddPortfolio = () => {
    if (newPortfolio.trim() && !portfolios.find((p) => p.name === newPortfolio.trim())) {
      setPortfolios([
        ...portfolios,
        { id: Math.random().toString(), name: newPortfolio.trim() },
      ])
      setNewPortfolio("")
    }
  }

  const handleRemovePortfolio = (id: string) => {
    setPortfolios(portfolios.filter((p) => p.id !== id))
  }

  const handleEditPortfolio = (id: string, newName: string) => {
    if (newName.trim() && !portfolios.find((p) => p.id !== id && p.name === newName.trim())) {
      setPortfolios(
        portfolios.map((p) =>
          p.id === id ? { ...p, name: newName.trim() } : p
        )
      )
    }
  }

  const handleReorderPortfolio = (draggedId: string, targetId: string) => {
    const draggedIndex = portfolios.findIndex((p) => p.id === draggedId)
    const targetIndex = portfolios.findIndex((p) => p.id === targetId)
    
    if (draggedIndex === -1 || targetIndex === -1) return
    
    const newPortfolios = [...portfolios]
    const [draggedPortfolio] = newPortfolios.splice(draggedIndex, 1)
    newPortfolios.splice(targetIndex, 0, draggedPortfolio)
    
    setPortfolios(newPortfolios)
  }

  const handleCreateCommittee = () => {
    // TODO: Implement committee creation
    console.log({
      name,
      portfolios,
      votingEnabled,
      speakerTimeLimit,
      defaultSpeakerTime,
      committeeType,
    })
    onOpenChange(false)
  }

  const tabs: Tab[] = [
    {
      id: "general",
      label: "General",
      icon: <Settings className="h-4 w-4" />,
      content: (
        <div className="space-y-4 px-2">
          <div className="space-y-2">
            <Label htmlFor="name">Committee Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Security Council"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Committee Type</Label>
            <Select value={committeeType} onValueChange={setCommitteeType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a committee type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general-assembly">General Assembly</SelectItem>
                <SelectItem value="security-council">Security Council</SelectItem>
                <SelectItem value="ecosoc">ECOSOC</SelectItem>
                <SelectItem value="specialized">Specialized Committee</SelectItem>
                <SelectItem value="crisis">Crisis Committee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      id: "portfolios",
      label: "Portfolios",
      icon: <Users className="h-4 w-4" />,
      content: (
        <div className="space-y-4 px-2">
          <div className="flex gap-2">
            <Input
              value={newPortfolio}
              onChange={(e) => setNewPortfolio(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddPortfolio()}
              placeholder="Add a portfolio"
            />
            <Button onClick={handleAddPortfolio}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Separator />
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search portfolios"
              className="sticky top-0 bg-background"
            />
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2 py-2">
                {searchQuery
                  ? filteredPortfolios.map((portfolio) => (
                      <PortfolioItem
                        key={portfolio.id}
                        portfolio={portfolio}
                        onRemove={handleRemovePortfolio}
                        onEdit={handleEditPortfolio}
                        isSearching
                      />
                    ))
                  : portfolios.map((portfolio) => (
                      <PortfolioItem
                        key={portfolio.id}
                        portfolio={portfolio}
                        onRemove={handleRemovePortfolio}
                        onEdit={handleEditPortfolio}
                        onReorder={handleReorderPortfolio}
                        isDragging={draggedPortfolio === portfolio.id}
                        draggedOver={draggedPortfolio !== null && draggedPortfolio !== portfolio.id}
                      />
                    ))}
              </div>
            </ScrollArea>
          </div>
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Drag to reorder portfolios
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "timing",
      label: "Timing",
      icon: <Clock className="h-4 w-4" />,
      content: (
        <div className="space-y-4 px-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="speakerTimeLimit">Speaker Time Limit</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Maximum time allowed for each speaker</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="speakerTimeLimit"
              type="number"
              min="1"
              max="60"
              value={speakerTimeLimit}
              onChange={(e) => setSpeakerTimeLimit(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="defaultSpeakerTime">Default Speaker Time</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Default time allocated to each speaker</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <TimePicker value={defaultSpeakerTime} onChange={setDefaultSpeakerTime} />
          </div>
        </div>
      ),
    },
    {
      id: "voting",
      label: "Voting",
      icon: <Palette className="h-4 w-4" />,
      content: (
        <div className="space-y-4 px-2">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="voting-enabled">Enable Voting System</Label>
            <Switch
              id="voting-enabled"
              checked={votingEnabled}
              onCheckedChange={setVotingEnabled}
            />
          </div>
        </div>
      ),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="flex h-[600px] overflow-hidden">
          {/* Sidebar */}
          <div className="w-40 space-y-2 border-r p-4">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </Button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure your committee settings
              </p>
            </div>

            {tabs.find((t) => t.id === activeTab)?.content}

            <div className="absolute bottom-6 right-6">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCommittee}>Create Committee</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}