import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Star } from "lucide-react";

const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required"),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteEditorProps {
  note?: any;
  onClose: () => void;
  onSave: () => void;
}

export default function NoteEditor({ note, onClose, onSave }: NoteEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<string>("");
  const { toast } = useToast();
  const isEditing = !!note;

  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: note?.title || "",
      content: note?.content || "",
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data: NoteFormData) => {
      const response = await apiRequest("POST", "/api/notes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Success",
        description: "Note created successfully",
      });
      onSave();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create note",
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (data: NoteFormData) => {
      const response = await apiRequest("PUT", `/api/notes/${note.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      setLastSaved("Auto-saved just now");
      onSave();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update note",
        variant: "destructive",
      });
    },
  });

  const contentValue = form.watch("content");

  useEffect(() => {
    const words = contentValue.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [contentValue]);

  const onSubmit = (data: NoteFormData) => {
    if (isEditing) {
      updateNoteMutation.mutate(data);
    } else {
      createNoteMutation.mutate(data);
    }
  };

  const isLoading = createNoteMutation.isPending || updateNoteMutation.isPending;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      data-testid="note-editor"
    >
      <div className="bg-card rounded-xl shadow-2xl border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Editor Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              data-testid="button-close-editor"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h3 className="font-semibold">
                {isEditing ? "Edit Note" : "New Note"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isEditing ? "Update your note" : "Start writing your thoughts..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Star className="h-4 w-4" />
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
              data-testid="button-save-note"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            {/* Note Title */}
            <Input
              placeholder="Note title..."
              {...form.register("title")}
              className="text-2xl font-bold border-none shadow-none px-0 focus-visible:ring-0"
              data-testid="input-note-title"
            />
            {form.formState.errors.title && (
              <p className="text-destructive text-sm">
                {form.formState.errors.title.message}
              </p>
            )}
            
            {/* Note Content */}
            <Textarea
              placeholder="Start writing your note..."
              {...form.register("content")}
              className="min-h-[400px] border-none shadow-none px-0 resize-none text-base leading-relaxed focus-visible:ring-0"
              data-testid="textarea-note-content"
            />
            {form.formState.errors.content && (
              <p className="text-destructive text-sm">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>
        </form>

        {/* Editor Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span data-testid="text-word-count">{wordCount} words</span>
              {lastSaved && <span data-testid="text-last-saved">{lastSaved}</span>}
            </div>
            <div className="flex items-center gap-2">
              <span>
                {isEditing ? "Updated" : "Created"} {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
