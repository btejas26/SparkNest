import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/dashboard/Navbar";
import WelcomeView from "@/components/dashboard/WelcomeView";
import NotesView from "@/components/dashboard/NotesView";
import NoteEditor from "@/components/dashboard/NoteEditor";

type DashboardView = "welcome" | "notes";

export default function Dashboard() {
  const [view, setView] = useState<DashboardView>("welcome");
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsNoteEditorOpen(true);
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setIsNoteEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsNoteEditorOpen(false);
    setEditingNote(null);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard">
      <Navbar 
        onShowWelcome={() => setView("welcome")}
        onShowNotes={() => setView("notes")}
      />
      
      <main>
        {view === "welcome" && (
          <WelcomeView onCreateNote={handleCreateNote} onShowNotes={() => setView("notes")} />
        )}
        
        {view === "notes" && (
          <NotesView onCreateNote={handleCreateNote} onEditNote={handleEditNote} />
        )}
      </main>

      {isNoteEditorOpen && (
        <NoteEditor 
          note={editingNote}
          onClose={handleCloseEditor}
          onSave={() => {
            // Refresh will be handled by react-query
            handleCloseEditor();
          }}
        />
      )}
    </div>
  );
}
