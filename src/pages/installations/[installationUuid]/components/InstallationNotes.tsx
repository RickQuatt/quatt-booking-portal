import { useState } from "react";
import type { components } from "@/openapi-client/types/api/v1";
import { $api } from "@/openapi-client/context";
import { toast } from "sonner";
import { ErrorText } from "@/components/shared/ErrorText";
import { CardContainer } from "@/components/shared/DetailPage";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";
import { formatDateTime } from "@/utils/formatDate";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type Note = components["schemas"]["Note"];

export interface InstallationNotesProps {
  installationId: string;
}

const noteSchema = z.object({
  note: z.string().min(1, "Note is required"),
});

type NoteFormData = z.infer<typeof noteSchema>;

/**
 * Installation Notes Component
 * Displays and manages installation notes with create/edit/delete functionality
 */
export function InstallationNotes({ installationId }: InstallationNotesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const {
    data: notesData,
    error,
    isPending,
    refetch,
  } = $api.useQuery("get", "/admin/installation/{installationId}/notes", {
    params: {
      path: { installationId },
    },
  });

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    refetch();
  };

  if (isPending) {
    return (
      <CardContainer title="📝 Notes">
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          Loading notes...
        </div>
      </CardContainer>
    );
  }

  if (error) {
    return (
      <CardContainer title="📝 Notes">
        <ErrorText
          text="Failed to fetch notes for the installation."
          retry={() => refetch() as any}
        />
      </CardContainer>
    );
  }

  const notes = notesData?.result || [];

  return (
    <>
      <CardContainer
        title="📝 Notes"
        headerAction={
          <Button
            size="sm"
            onClick={handleCreateNote}
            className="h-8 w-8 p-0"
            variant="ghost"
          >
            <Plus className="h-4 w-4" />
          </Button>
        }
      >
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => handleEditNote(note)}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-orange-400 hover:shadow-md dark:border-gray-700 dark:bg-dark-foreground"
            >
              <div className="mb-2 flex items-start justify-between gap-4">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  👤 {note.updatedBy}
                </span>
                <span className="text-sm italic text-gray-500 dark:text-gray-400">
                  {note.createdAt
                    ? formatDateTime(new Date(note.createdAt))
                    : "N/A"}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{note.note}</p>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No notes 👍
            </div>
          )}
        </div>
      </CardContainer>

      <NoteModal
        open={isModalOpen}
        onClose={handleCloseModal}
        note={selectedNote}
        installationId={installationId}
        onSuccess={handleSuccess}
      />
    </>
  );
}

interface NoteModalProps {
  open: boolean;
  onClose: () => void;
  note: Note | null;
  installationId: string;
  onSuccess: () => void;
}

function NoteModal({
  open,
  onClose,
  note,
  installationId,
  onSuccess,
}: NoteModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      note: note?.note || "",
    },
  });

  // Reset form when note changes
  useState(() => {
    reset({ note: note?.note || "" });
  });

  // Mutations
  const createNoteMutation = $api.useMutation(
    "post",
    "/admin/installation/{installationId}/notes",
    {
      onSuccess: () => {
        toast.success("Note created successfully");
        reset({}, { keepValues: true });
        onSuccess();
      },
      onError: () => {
        toast.error("Failed to create note");
      },
    },
  );

  const updateNoteMutation = $api.useMutation(
    "put",
    "/admin/installation/{installationId}/notes/{noteId}",
    {
      onSuccess: () => {
        toast.success("Note updated successfully");
        reset({}, { keepValues: true });
        onSuccess();
      },
      onError: () => {
        toast.error("Failed to update note");
      },
    },
  );

  const deleteNoteMutation = $api.useMutation(
    "delete",
    "/admin/installation/{installationId}/notes/{noteId}",
    {
      onSuccess: () => {
        toast.success("Note deleted successfully");
        reset({}, { keepValues: true });
        onSuccess();
      },
      onError: () => {
        toast.error("Failed to delete note");
      },
    },
  );

  const isPending =
    createNoteMutation.isPending ||
    updateNoteMutation.isPending ||
    deleteNoteMutation.isPending;

  const onSubmit = (data: NoteFormData) => {
    if (note) {
      // Update existing note
      updateNoteMutation.mutate({
        params: {
          path: {
            installationId,
            noteId: note.id.toString(),
          },
        },
        body: {
          note: data.note,
        },
      });
    } else {
      // Create new note
      createNoteMutation.mutate({
        params: {
          path: { installationId },
        },
        body: {
          note: data.note,
        },
      });
    }
  };

  const onDelete = () => {
    if (
      !window.confirm(
        "Are you sure you would like to delete this note? This action cannot be undone.",
      )
    ) {
      return;
    }

    if (!note) return;

    deleteNoteMutation.mutate({
      params: {
        path: {
          installationId,
          noteId: note.id.toString(),
        },
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>✏️ Note</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Textarea
              placeholder="Write down a note..."
              className="min-h-[150px] bg-gray-50 dark:bg-dark-foreground"
              {...register("note")}
            />
            {errors.note && (
              <p className="mt-1 text-sm text-red-500">{errors.note.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            {note && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={deleteNoteMutation.isPending}
                className="mr-auto"
              >
                {deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty || isPending}>
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
