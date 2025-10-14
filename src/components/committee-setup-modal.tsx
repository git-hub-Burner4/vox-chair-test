"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { countryList } from "@/lib/countries"
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
  X, 
  Info,
  Users,
  Clock,
  Palette,
  Settings,
  Search,
  ChevronsUpDown
} from "lucide-react"
import { Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,  // <-- Add this
  CommandItem, } from "@/components/ui/command"
import Image from 'next/image'
import { cn } from "@/lib/utils"

type Portfolio = {
  id: string        // country code
  name: string      // country name
  code?: string     // country code (optional for backward compatibility)
  attendance?: 'present' | 'present-voting' | 'absent'
}

function PortfolioItem({
  portfolio,
  onRemove,
}: {
  portfolio: Portfolio
  onRemove: (id: string) => void
}) {
  const itemRef = React.useRef<HTMLDivElement>(null);

  const handleRemove = () => {
    if (itemRef.current) {
      itemRef.current.classList.add('opacity-0', 'scale-95');
      setTimeout(() => {
        onRemove(portfolio.id);
      }, 150);
    }
  };

  return (
    <div 
      ref={itemRef}
      className="flex items-center justify-between p-2 rounded-md hover:bg-accent group transform transition-all duration-150 ease-in-out"
    >
      <div className="flex items-center gap-2">
        <Image
          src={`https://flagcdn.com/w20/${portfolio.id.toLowerCase()}.png`}
          alt={`${portfolio.name} flag`}
          width={20}
          height={15}
          className="object-cover rounded-sm"
        />
        <span className="text-sm">{portfolio.name}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
        onClick={handleRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function CommitteeSetupModal({
  open,
  onOpenChange,
  onSetupComplete
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSetupComplete: (data: {
    name: string
    abbrev: string
    agenda: string
    chair: string
    coChair: string
    rapporteur: string
    countries: Array<{
      name: string
      code: string
      attendance: 'present' | 'absent' | 'present-voting'
    }>
    countryList: Array<{
      id: string
      name: string
      flagQuery: string
    }>
  }) => void
}) {
  const [currentPage, setCurrentPage] = useState<"basic-info" | "members" | "session" | "display" | "advanced">("basic-info")
  const [committeeName, setCommitteeName] = useState("")
  const [shortcode, setShortcode] = useState("")

  const [agenda, setAgenda] = useState("")
  const [chair, setChair] = useState("")
  const [coChair, setCoChair] = useState("")
  const [rapporteur, setRapporteur] = useState("")
  const [portfolioSearchQuery, setPortfolioSearchQuery] = useState("")
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  
  // Session Settings
  const [speakingTime, setSpeakingTime] = useState(120)
  const [enableMotions, setEnableMotions] = useState(true)
  const [enableVoting, setEnableVoting] = useState(true)
  
  // Display Settings
  const [showTimer, setShowTimer] = useState(true)
  const [showSpeakerList, setShowSpeakerList] = useState(true)
  const [showMotions, setShowMotions] = useState(true)
  const [theme, setTheme] = useState("default")
  
  // Advanced Settings
  const [recordSession, setRecordSession] = useState(true)
  const [autoSaveDrafts, setAutoSaveDrafts] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  // Auto-generate shortcode from committee name
  const generateShortcode = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 5)
  }

  const handleNameChange = (name: string) => {
    setCommitteeName(name)
    if (!shortcode || shortcode === generateShortcode(committeeName)) {
      setShortcode(generateShortcode(name))
    }
  }

  const filteredPortfolios = useMemo(() => {
    const s = portfolioSearchQuery.trim().toLowerCase()
    const filtered = s ? 
      portfolios.filter((p) => p.name.toLowerCase().includes(s)) :
      portfolios
    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [portfolioSearchQuery, portfolios])

  // Handle drag events
  useEffect(() => {
    const handleDragStart = (e: Event) => {
      const customEvent = e as CustomEvent
      setDraggedId(customEvent.detail)
    }
    const handleDragEnd = () => {
      setDraggedId(null)
      setDraggedOverId(null)
    }
    const handleDragEnter = (e: Event) => {
      const customEvent = e as CustomEvent
      setDraggedOverId(customEvent.detail)
    }
    const handleDragLeave = () => {
      setDraggedOverId(null)
    }

    window.addEventListener('dragstart', handleDragStart)
    window.addEventListener('dragend', handleDragEnd)
    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)

    return () => {
      window.removeEventListener('dragstart', handleDragStart)
      window.removeEventListener('dragend', handleDragEnd)
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
    }
  }, [])



  const removePortfolio = (id: string) => {
    setPortfolios(portfolios.filter(p => p.id !== id))
  }

  // Portfolio management simplified - drag and drop removed
  const handleExcelImport = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // For now, let's just read the file as text and try to parse basic CSV
      const text = await file.text();
      const rows = text.split('\n');
      const countries = rows
        .map(row => {
          const [name] = row.split(',');
          if (!name) return null;
          
          // Find country code from name
          const country = countryList.find(c => 
            c.name.toLowerCase().includes(name.toLowerCase().trim())
          );
          
          if (country) {
            return {
              id: country.code,
              name: country.name,
              code: country.code,
              attendance: 'present' as const
            };
          }
          return null;
        })
        .filter((c): c is Portfolio => c !== null);

      setPortfolios(prev => {
        const newPortfolios = [...prev];
        countries.forEach(country => {
          if (!newPortfolios.some(p => p.id === country.id)) {
            newPortfolios.push(country);
          }
        });
        return newPortfolios;
      });
    } catch (error) {
      console.error('Error importing Excel file:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="min-w-[85vw] max-w-[85vw] w-[85vw] h-[85vh] p-0 gap-0 overflow-hidden">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 border-r bg-sidebar flex flex-col shrink-0">
              <div className="p-4 border-b">
                <h3 className="text-sm font-semibold text-sidebar-foreground">Committee Setup</h3>
                <p className="text-xs text-sidebar-foreground/60 mt-1">Configure your committee</p>
              </div>
              <nav className="flex-1 p-3">
                <div className="space-y-1">
                  <button
                    onClick={() => setCurrentPage("basic-info")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                      currentPage === "basic-info"
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Info className="h-4 w-4 shrink-0" />
                    <span>Basic Info</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage("members")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                      currentPage === "members"
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Users className="h-4 w-4 shrink-0" />
                    <span>Members</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage("session")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                      currentPage === "session"
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>Session</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage("display")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                      currentPage === "display"
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Palette className="h-4 w-4 shrink-0" />
                    <span>Display</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage("advanced")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                      currentPage === "advanced"
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Settings className="h-4 w-4 shrink-0" />
                    <span>Advanced</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-background">
              {/* Header */}
              <div className="border-b px-6 py-4 bg-card">
                <h2 className="text-xl font-semibold">Create New Committee</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Set up your committee with members and settings
                </p>
              </div>

              {/* Content Area */}
              <ScrollArea className="flex-1 overflow-y-scroll max-h-screen">
                <div className="p-6">
                  <div className="max-w-2xl mx-auto space-y-6">
                  {currentPage === "basic-info" && (
                    <>
                      {/* Committee Name and Shortcode */}
                      <div className="space-y-3">
                        <div className="flex gap-3 items-end">
                          <div className="flex-1 space-y-2">
                            <Label htmlFor="committee-name" className="text-sm font-medium">
                              Committee Name
                            </Label>
                            <Input
                              id="committee-name"
                              value={committeeName}
                              onChange={(e) => handleNameChange(e.target.value)}
                              placeholder="e.g., United Nations Security Council"
                              className="h-9"
                            />
                          </div>
                          <div className="w-32 space-y-2">
                            <Label htmlFor="shortcode" className="text-sm font-medium">
                              Shortcode
                            </Label>
                            <Input
                              id="shortcode"
                              value={shortcode}
                              onChange={(e) => setShortcode(e.target.value.toUpperCase())}
                              placeholder="UNSC"
                              maxLength={5}
                              className="h-9"
                            />
                          </div>
                        </div>
                      </div>


                      {/* Committee Agenda */}
                      <div className="space-y-2">
                        <Label htmlFor="agenda" className="text-sm font-medium">
                          Committee Agenda
                        </Label>
                        <textarea
                          id="agenda"
                          value={agenda}
                          onChange={(e) => setAgenda(e.target.value)}
                          placeholder="Enter the committee agenda or topic of discussion..."
                          className="w-full min-h-[150px] px-3 py-2 text-sm border rounded-md bg-background resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                      </div>
                    </>
                  )}
                  
                      {currentPage === "members" && (
                    <>
                      {/* Members Section */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-sm font-semibold">Add Countries</h3>
                          <p className="text-xs text-muted-foreground">
                            Select participating member states
                          </p>
                        </div>

                        {/* Country Search Dropdown */}
                        <div className="space-y-1.5">
  <Label htmlFor="country-search" className="text-sm">
    Search Countries
  </Label>
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        className="w-full justify-between h-9"
      >
        Search for a country...
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
      <Command>
        <CommandInput placeholder="Search countries..." />
        <CommandEmpty>No country found.</CommandEmpty>
        <CommandGroup className="max-h-[300px] overflow-auto">
          {countryList.map(country => {
            const isAdded = portfolios.some(p => p.id === country.code);
            return (
              <CommandItem
                key={country.code}
                value={country.name}
                onSelect={() => {
                  if (!isAdded) {
                    const portfolio = {
                      id: country.code.toLowerCase(),
                      code: country.code.toLowerCase(),
                      name: country.name,
                      attendance: 'present' as const
                    };
                    const newPortfolios = [...portfolios, portfolio];
                    setPortfolios(newPortfolios.sort((a, b) => a.name.localeCompare(b.name)));
                  }
                }}
                disabled={isAdded}
                className={cn(
                  "flex items-center gap-2",
                  isAdded && "opacity-50 cursor-not-allowed"
                )}
              >
                <Image
                  src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                  alt={`${country.name} flag`}
                  width={20}
                  height={15}
                  className="object-cover rounded-sm"
                />
                <span>{country.name}</span>
                {isAdded && (
                  <span className="ml-auto text-xs text-muted-foreground">Added</span>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </Command>
    </PopoverContent>
  </Popover>
</div>
                        <div className="flex items-center gap-2 mb-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('excel-upload')?.click()}
                            className="text-xs"
                          >
                            Import from Excel
                          </Button>
                          <input
                            id="excel-upload"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleExcelImport(file);
                              }
                            }}
                          />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Upload an Excel or CSV file with country names</p>
                                <p>First column should contain country names</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {/* Added Portfolios List - Full Width */}
                        <div className="border rounded-lg bg-card overflow-hidden">
                          <ScrollArea className="h-[340px] overflow-y-scroll max-h-screen">
                            {filteredPortfolios.length === 0 ? (
                              <div className="h-[340px] flex items-center justify-center text-center p-8">
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">
                                    {portfolios.length === 0 ? "No members added yet" : "No matching portfolios"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {portfolios.length === 0 ? "Add custom members to get started" : "Try a different search term"}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 space-y-2.5">
                                {filteredPortfolios.map((portfolio) => (
                                  <PortfolioItem
                                    key={portfolio.id}
                                    portfolio={portfolio}
                                    onRemove={removePortfolio}
                                  />
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                        </div>
                      </div>

                      <Separator className="my-4" />
                    </>
                  )}

                  {currentPage === "session" && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold mb-1">Default Speaking Time</h3>
                          <p className="text-xs text-muted-foreground mb-4">
                            Set the default speaking time for delegates
                          </p>
                          <div className="flex justify-center">
                            <TimePicker value={speakingTime} onChange={setSpeakingTime} />
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-sm font-semibold mb-4">Procedural Options</h3>
                          <TooltipProvider>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                <div className="space-y-1">
                                  <Label htmlFor="enable-motions" className="text-sm font-medium cursor-pointer">
                                    Enable Motions
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    Allow delegates to make procedural motions
                                  </p>
                                </div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Switch
                                        id="enable-motions"
                                        checked={enableMotions}
                                        onCheckedChange={setEnableMotions}
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="z-[100]">
                                    <p>Delegates can propose motions</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>

                              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                <div className="space-y-1">
                                  <Label htmlFor="enable-voting" className="text-sm font-medium cursor-pointer">
                                    Enable Voting
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    Allow voting on resolutions and motions
                                  </p>
                                </div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Switch
                                        id="enable-voting"
                                        checked={enableVoting}
                                        onCheckedChange={setEnableVoting}
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="z-[100]">
                                    <p>Enable voting functionality</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentPage === "display" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold mb-4">Display Elements</h3>
                        <TooltipProvider>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                              <div className="space-y-1">
                                <Label htmlFor="show-timer" className="text-sm font-medium cursor-pointer">
                                  Show Timer
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  Display countdown timer during speeches
                                </p>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Switch
                                      id="show-timer"
                                      checked={showTimer}
                                      onCheckedChange={setShowTimer}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="z-[100]">
                                  <p>Visible countdown timer</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                              <div className="space-y-1">
                                <Label htmlFor="show-speaker-list" className="text-sm font-medium cursor-pointer">
                                  Show Speaker List
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  Display current speaker list on screen
                                </p>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Switch
                                      id="show-speaker-list"
                                      checked={showSpeakerList}
                                      onCheckedChange={setShowSpeakerList}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="z-[100]">
                                  <p>Display speaker queue</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                              <div className="space-y-1">
                                <Label htmlFor="show-motions" className="text-sm font-medium cursor-pointer">
                                  Show Motion Status
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  Display active motions and their status
                                </p>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Switch
                                      id="show-motions"
                                      checked={showMotions}
                                      onCheckedChange={setShowMotions}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="z-[100]">
                                  <p>Show motion information</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </TooltipProvider>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="theme" className="text-sm font-medium">
                          Color Theme
                        </Label>
                        <TooltipProvider>
                          <Select value={theme} onValueChange={setTheme}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <SelectTrigger id="theme" className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="z-[100]">
                                <p>Choose a color theme for the committee</p>
                              </TooltipContent>
                            </Tooltip>
                            <SelectContent>
                              <SelectItem value="default">Default</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="modern">Modern</SelectItem>
                              <SelectItem value="classic">Classic</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                              <SelectItem value="vibrant">Vibrant</SelectItem>
                            </SelectContent>
                          </Select>
                        </TooltipProvider>
                      </div>
                    </div>
                  )}

                  {currentPage === "advanced" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold mb-4">Session Management</h3>
                        <TooltipProvider>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                              <div className="space-y-1">
                                <Label htmlFor="record-session" className="text-sm font-medium cursor-pointer">
                                  Record Session
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  Automatically save session logs and transcripts
                                </p>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Switch
                                      id="record-session"
                                      checked={recordSession}
                                      onCheckedChange={setRecordSession}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="z-[100]">
                                  <p>Save session history</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                              <div className="space-y-1">
                                <Label htmlFor="auto-save-drafts" className="text-sm font-medium cursor-pointer">
                                  Auto-save Drafts
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  Automatically save working papers and drafts
                                </p>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Switch
                                      id="auto-save-drafts"
                                      checked={autoSaveDrafts}
                                      onCheckedChange={setAutoSaveDrafts}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="z-[100]">
                                  <p>Automatic draft saving</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                              <div className="space-y-1">
                                <Label htmlFor="notifications" className="text-sm font-medium cursor-pointer">
                                  Enable Notifications
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  Send notifications for important events
                                </p>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Switch
                                      id="notifications"
                                      checked={notificationsEnabled}
                                      onCheckedChange={setNotificationsEnabled}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="z-[100]">
                                  <p>Receive event notifications</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </TooltipProvider>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t px-6 py-3 flex justify-between items-center bg-card">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      setIsCreating(true);
                      const committeeData = {
                        name: committeeName.trim(),
                        abbrev: shortcode.trim(),
                        agenda: agenda.trim(),
                        chair: chair.trim(),
                        coChair: coChair.trim(),
                        rapporteur: rapporteur.trim(),
                        countries: portfolios.map(portfolio => ({
                          name: portfolio.name,
                          code: portfolio.id.toLowerCase(),  // Ensure lowercase for consistency
                          attendance: 'present' as const
                        })),
                        countryList: portfolios.map(portfolio => ({
                          id: portfolio.id.toLowerCase(),   // Ensure lowercase for consistency
                          name: portfolio.name,
                          code: portfolio.id.toLowerCase(), // Add code field
                          flagQuery: portfolio.id.toLowerCase(), // Ensure lowercase for flags
                          attendance: 'present' as const    // Add attendance field
                        })),
                        settings: {
                          enableMotions,
                          enableVoting,
                          showTimer,
                          showSpeakerList,
                          showMotions,
                          recordSession,
                          autoSaveDrafts,
                          notificationsEnabled,
                          speakingTime
                        }
                      };
                      
                      await onSetupComplete(committeeData);
                      router.push('/speaker-list');
                    } catch (error) {
                      console.error('Error creating committee:', error);
                    } finally {
                      setIsCreating(false);
                    }
                  }}
                  disabled={!committeeName || !shortcode || portfolios.length === 0 || isCreating}
                >
                  {isCreating ? "Creating..." : "Create Committee"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
