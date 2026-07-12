/**
 * EditableText — admin-only inline content editor.
 *
 * Usage:
 *   <EditableText contentKey="hero.title" fallback="Welcome to Sanctuary" tag="h1" className="text-4xl font-bold" />
 *
 * - For admin users: shows a pencil icon on hover. Click to edit inline. Enter or blur to save.
 * - For non-admin users: renders the text exactly as a normal element.
 * - Saves to the site_content table via trpc.admin.content.set.
 * - Falls back to `fallback` prop if no DB value exists yet.
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Pencil, Check, X } from "lucide-react";
import { useState, useRef, useEffect, ElementType } from "react";

interface EditableTextProps {
  /** Unique key for this piece of content in the site_content table */
  contentKey: string;
  /** Default text shown if no DB value exists yet */
  fallback: string;
  /** HTML tag to render (default: "span") */
  tag?: ElementType;
  /** Extra className applied to the rendered element */
  className?: string;
  /** If true, renders a <textarea> instead of a single-line input when editing */
  multiline?: boolean;
}

export default function EditableText({
  contentKey,
  fallback,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tag: Tag = "span" as any,
  className = "",
  multiline = false,
}: EditableTextProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Fetch the current value from DB (public procedure)
  const { data } = trpc.admin.content.getByKey.useQuery(
    { key: contentKey },
    { enabled: true }
  );

  const utils = trpc.useUtils();
  const setContent = trpc.admin.content.set.useMutation({
    onSuccess: () => utils.admin.content.getByKey.invalidate({ key: contentKey } as { key: string }),
  });

  const currentValue = data?.value ?? fallback;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentValue);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  // Sync draft when DB value loads
  useEffect(() => {
    if (!editing) setDraft(currentValue);
  }, [currentValue, editing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== currentValue) {
      setContent.mutate({ contentKey, label: contentKey, page: "site", value: trimmed });
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(currentValue);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) { e.preventDefault(); save(); }
    if (e.key === "Escape") cancel();
  };

  // Non-admin: just render the text
  if (!isAdmin) {
    return <Tag className={className}>{currentValue}</Tag>;
  }

  // Admin editing mode
  if (editing) {
    return (
      <span className="inline-flex items-start gap-1 group">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={save}
            rows={3}
            className={`${className} bg-transparent border border-cyan-400/60 rounded px-1 py-0.5 outline-none resize-y min-w-[200px] text-inherit font-inherit`}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={save}
            className={`${className} bg-transparent border border-cyan-400/60 rounded px-1 py-0.5 outline-none min-w-[120px] text-inherit font-inherit`}
          />
        )}
        <button
          onMouseDown={(e) => { e.preventDefault(); save(); }}
          className="text-green-400 hover:text-green-300 mt-0.5 shrink-0"
          title="Save"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          onMouseDown={(e) => { e.preventDefault(); cancel(); }}
          className="text-red-400 hover:text-red-300 mt-0.5 shrink-0"
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </span>
    );
  }

  // Admin hover mode — show pencil on hover
  return (
    <span className="group inline-flex items-baseline gap-1">
      <Tag className={className}>{currentValue}</Tag>
      <button
        onClick={() => { setDraft(currentValue); setEditing(true); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 hover:text-cyan-300 shrink-0"
        title={`Edit: ${contentKey}`}
      >
        <Pencil className="w-3 h-3" />
      </button>
    </span>
  );
}
