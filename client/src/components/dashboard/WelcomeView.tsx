import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StickyNote, Calendar, Flame, Plus, FileText } from "lucide-react";
import { type Note } from "@shared/schema";

interface WelcomeViewProps {
  onCreateNote: () => void;
  onShowNotes: () => void;
}

export default function WelcomeView({ onCreateNote, onShowNotes }: WelcomeViewProps) {
  const { user } = useAuth();

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
    enabled: !!user,
  });

  const totalNotes = notes.length;
  const todayNotes = notes.filter((note: Note) => {
    const today = new Date();
    const noteDate = new Date(note.createdAt || '');
    return noteDate.toDateString() === today.toDateString();
  }).length;
  
  // Simple streak calculation (consecutive days with notes)
  const streak = 7; // Placeholder for now

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="welcome-view">
      {/* Welcome Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">
          Welcome back, <span className="text-primary">{user?.firstName}</span>! 👋
        </h2>
        <p className="text-xl text-muted-foreground">Ready to capture your next brilliant idea?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <StickyNote className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="stat-total-notes">{totalNotes}</p>
                <p className="text-muted-foreground">Total Notes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="stat-today-notes">{todayNotes}</p>
                <p className="text-muted-foreground">Created Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                <Flame className="h-6 w-6 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="stat-streak">{streak}</p>
                <p className="text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="text-center mb-12">
        <Button 
          size="lg"
          className="px-8 py-4 text-lg shadow-lg"
          onClick={onCreateNote}
          data-testid="button-create-first-note"
        >
          <Plus className="mr-3 h-5 w-5" />
          {totalNotes === 0 ? "Create Your First Note" : "Create New Note"}
        </Button>
      </div>

      {/* Recent Notes Preview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Recent Notes</h3>
            <Button 
              variant="outline" 
              onClick={onShowNotes}
              data-testid="button-view-all"
            >
              View All
            </Button>
          </div>
          
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium mb-2">No notes yet</h4>
              <p className="text-muted-foreground mb-4">Start by creating your first note to see it here</p>
              <Button 
                variant="outline" 
                onClick={onCreateNote}
                data-testid="button-create-note"
              >
                Create Note
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.slice(0, 3).map((note: Note) => (
                <div key={note.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <h4 className="font-medium mb-1">{note.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'No date'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
