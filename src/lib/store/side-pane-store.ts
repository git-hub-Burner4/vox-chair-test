import { create } from 'zustand';

interface SidePaneStore {
  isOpen: boolean;
  lastEditedDraftId: string | null;
  lastEditedDraftTitle: string | null;
  lastEditedDraftDescription: string | null; // ADD THIS
  editorContent: string;
  isSaved: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setLastEditedDraft: (draftId: string | null, draftTitle: string | null, draftDescription?: string | null) => void; // UPDATE THIS
  setEditorContent: (content: string) => void;
  setIsSaved: (saved: boolean) => void;
}

export const useSidePaneStore = create<SidePaneStore>((set) => ({
  isOpen: false,
  lastEditedDraftId: null,
  lastEditedDraftTitle: null,
  lastEditedDraftDescription: null, // ADD THIS
  editorContent: "",
  isSaved: true,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setLastEditedDraft: (draftId, draftTitle, draftDescription) => set({ 
    lastEditedDraftId: draftId, 
    lastEditedDraftTitle: draftTitle,
    lastEditedDraftDescription: draftDescription || null // ADD THIS
  }),
  setEditorContent: (content) => set({ editorContent: content }),
  setIsSaved: (saved) => set({ isSaved: saved }),
}));