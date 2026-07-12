import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Edit3,
  Save,
  Trash2,
  Plus,
  Download,
  Upload,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Pencil,
  X,
  ExternalLink,
  Home,
  Map,
  Gamepad2,
  ShoppingBag,
  Users,
  Settings,
  Copy,
  FolderOpen,
  Image,
  File,
  Link,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "overview" | "content" | "storage" | "help";

interface StoredFile {
  url: string;
  key: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedAt: number;
  category: string;
}

// ─── Help & Navigation Content ────────────────────────────────────────────────
const HELP_SECTIONS = [
  {
    id: "getting-here",
    title: "How to Get to the Admin Panel",
    icon: "🏠",
    anchor: "getting-here",
    steps: [
      {
        step: 1,
        title: "From anywhere on the site",
        body: "Click your profile picture or name in the top-right corner of any page. A dropdown menu will appear. Click 'Admin Panel' — it's highlighted in cyan so it's easy to spot.",
        link: null,
      },
      {
        step: 2,
        title: "Type it directly in your browser",
        body: "Go to your browser's address bar (the box at the very top of the screen where you type web addresses). Type: anomarsty.lol/admin and press Enter. You'll land right here.",
        link: "https://anomarsty.lol/admin",
      },
      {
        step: 3,
        title: "From the Dashboard sidebar",
        body: "If you're in the Dashboard, look at the left sidebar. Click your name or profile picture at the very bottom. A menu pops up — click 'Admin Panel' at the top of that menu.",
        link: null,
      },
    ],
  },
  {
    id: "navigation",
    title: "How to Navigate the Site",
    icon: "🗺️",
    anchor: "navigation",
    steps: [
      {
        step: 1,
        title: "The top navigation bar",
        body: "Every page has a row of links at the top: Home, Universe Map, Games, Financial District, Anom's Corner, and more. Click any of them to jump to that section.",
        link: null,
      },
      {
        step: 2,
        title: "Quick links from this panel",
        body: "In the Overview tab (click 'Overview' in the left sidebar), there are big buttons for every major page. Click any button to open that page in a new tab.",
        link: null,
      },
      {
        step: 3,
        title: "The back button",
        body: "On most pages, there is a back arrow (←) in the top-left corner. Click it to go back. You can also use your browser's back button — the ← arrow at the very top-left of your browser window.",
        link: null,
      },
      {
        step: 4,
        title: "All the pages and their addresses",
        body: "Home: anomarsty.lol/ · Universe Map: /universe-map · Games: /games · Financial District: /financial-district · Anom's Corner: /anoms-corner · Settings: /settings · Admin: /admin",
        link: null,
      },
    ],
  },
  {
    id: "edit-text",
    title: "How to Edit Text on the Site",
    icon: "✏️",
    anchor: "edit-text",
    steps: [
      {
        step: 1,
        title: "Go to Content Editor",
        body: "Click 'Content Editor' in the left sidebar. You'll see a list of every piece of text you're allowed to edit — page descriptions, headings, welcome messages, and more.",
        link: null,
      },
      {
        step: 2,
        title: "Find the text you want to change",
        body: "Each row shows the page it's on (like 'Universe Map'), a label describing what it is (like 'AO Universe Description'), and the current text. Scroll to find what you want.",
        link: null,
      },
      {
        step: 3,
        title: "Click the pencil icon to edit",
        body: "Click the pencil icon (✏️) on the right side of any row. The text turns into a box you can type in. Make your changes.",
        link: null,
      },
      {
        step: 4,
        title: "Save your changes",
        body: "Click the green Save button. Your change goes live on the site immediately — no extra steps needed. Click Cancel if you change your mind.",
        link: null,
      },
      {
        step: 5,
        title: "Check it on the site",
        body: "Open a new browser tab and go to the page you edited. Your new text will be there. If you don't see it, press Ctrl+R (Windows) or Cmd+R (Mac) to refresh.",
        link: null,
      },
    ],
  },
  {
    id: "documents",
    title: "How to Use Documents & Storage",
    icon: "📁",
    anchor: "documents",
    steps: [
      {
        step: 1,
        title: "Go to Documents & Storage",
        body: "Click 'Documents & Storage' in the left sidebar. This is where all your planning documents, concept files, images, and uploaded files live.",
        link: null,
      },
      {
        step: 2,
        title: "Upload a file",
        body: "Click the '+ Upload File' button at the top. A file picker opens. Choose any file from your computer — images (JPG, PNG, GIF), documents (PDF, TXT, DOC), or text files. Files up to 25MB are supported.",
        link: null,
      },
      {
        step: 3,
        title: "Copy a file's URL",
        body: "Every uploaded file has a 'Copy URL' button (the chain-link icon). Click it to copy the web address of that file. Paste it anywhere — in the Content Editor, in a message to Manus, or in your notes.",
        link: null,
      },
      {
        step: 4,
        title: "Create a text document",
        body: "Click '+ New Text Doc'. Give it a title and category, then type or paste your content. Good for notes, plans, schedules, and anything you want to keep private in your admin panel.",
        link: null,
      },
      {
        step: 5,
        title: "Download a document",
        body: "Click the download icon (⬇️) next to any document to save it to your computer as a text file. Useful for sharing or keeping a backup.",
        link: null,
      },
      {
        step: 6,
        title: "Filter by category",
        body: "Use the category filter buttons at the top (All, Planning, Creative, Reference, Notes, Images, Files) to quickly find what you're looking for.",
        link: null,
      },
      {
        step: 7,
        title: "Delete a file or document",
        body: "Click the trash icon (🗑️) next to any item to delete it. For uploaded files, the file is removed from storage. Be careful — this cannot be undone.",
        link: null,
      },
    ],
  },
  {
    id: "settings",
    title: "How to Change Your Settings",
    icon: "⚙️",
    anchor: "settings",
    steps: [
      {
        step: 1,
        title: "Go to Settings",
        body: "Click your profile picture → Settings, or go to anomarsty.lol/settings. This is your personal settings page — changes here only affect your own profile.",
        link: "https://anomarsty.lol/settings",
      },
      {
        step: 2,
        title: "Change your profile photo",
        body: "In Settings, find the Profile Photo section. Click 'Upload Photo' to choose an image from your computer. It uploads and shows on your profile right away.",
        link: null,
      },
      {
        step: 3,
        title: "Change your bio",
        body: "Find the 'About You' section. Click in the text box and type your bio (up to 280 characters). Click Save Changes when done.",
        link: null,
      },
      {
        step: 4,
        title: "Change the site font",
        body: "Scroll to the Font section. Click any font option to preview it — the whole site switches instantly. Click Save Changes to keep it.",
        link: null,
      },
      {
        step: 5,
        title: "Change your theme",
        body: "Find the Theme section. Click any theme card to switch colors. Some themes cost coins — you'll see the price on those cards.",
        link: null,
      },
    ],
  },
  {
    id: "shop",
    title: "How to Manage the Shop",
    icon: "🛍️",
    anchor: "shop",
    steps: [
      {
        step: 1,
        title: "Go to Shop Manager",
        body: "In the Dashboard, click the hamburger menu (☰) in the top-left. Click 'Shop Manager'. This is where you create and manage items members can buy with coins or real money.",
        link: null,
      },
      {
        step: 2,
        title: "Create a new shop item",
        body: "Click '+ New Item'. Fill in the name, description, price (in coins), category (theme, badge, decoration, etc.), and a preview image URL. Toggle it to 'Active' when you're ready for members to see it.",
        link: null,
      },
      {
        step: 3,
        title: "Edit or remove an item",
        body: "Click the pencil icon on any item to edit it. Click the trash icon to delete it. Toggling an item to 'Inactive' hides it from members without deleting it.",
        link: null,
      },
    ],
  },
  {
    id: "missions",
    title: "How to Manage Missions",
    icon: "🎯",
    anchor: "missions",
    steps: [
      {
        step: 1,
        title: "What missions are",
        body: "Missions are tasks members complete to earn coins and Social Good Score. They guide new members through the platform and reward good behavior.",
        link: null,
      },
      {
        step: 2,
        title: "View active missions",
        body: "Go to anomarsty.lol/dashboard and click the Missions tab. You'll see all current missions exactly as members see them.",
        link: "https://anomarsty.lol/dashboard",
      },
      {
        step: 3,
        title: "To add or change missions",
        body: "Tell Manus what you want — new mission name, description, coin reward, and what action it requires. Manus will add it to the database and wire it to the right page.",
        link: null,
      },
    ],
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function HelpSection({ section, isOpen, onToggle }: {
  section: typeof HELP_SECTIONS[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div id={section.anchor} className="border border-border rounded-lg overflow-hidden mb-3 scroll-mt-4">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{section.icon}</span>
          <span className="font-semibold text-foreground">{section.title}</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>
      {isOpen && (
        <div className="border-t border-border bg-muted/20 p-4 space-y-4">
          {section.steps.map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                {s.step}
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">{s.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                {s.link && (
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                  >
                    <Link className="w-3 h-3" /> {s.link}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FileIcon({ mimetype }: { mimetype: string }) {
  if (mimetype.startsWith("image/")) return <Image className="w-4 h-4 text-blue-400" />;
  if (mimetype === "application/pdf") return <File className="w-4 h-4 text-red-400" />;
  return <FileText className="w-4 h-4 text-muted-foreground" />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Main Admin Page ───────────────────────────────────────────────────────────
export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Content editor state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Documents state
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [docForm, setDocForm] = useState({ title: "", slug: "", content: "", category: "general" });
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [storageFilter, setStorageFilter] = useState("all");

  // Uploaded files state (stored in localStorage for session persistence)
  const [uploadedFiles, setUploadedFiles] = useState<StoredFile[]>(() => {
    try {
      const saved = localStorage.getItem("admin-uploaded-files");
      return saved ? JSON.parse(saved) as StoredFile[] : [];
    } catch { return []; }
  });

  // Help section open state
  const [openHelpSection, setOpenHelpSection] = useState<string | null>("getting-here");

  // File upload refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // tRPC queries
  const contentQuery = trpc.admin.content.getAll.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const docsQuery = trpc.admin.docs.list.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const docDetailQuery = trpc.admin.docs.get.useQuery(
    { slug: viewingDoc ?? "" },
    { enabled: !!viewingDoc && isAuthenticated && user?.role === "admin" }
  );

  const utils = trpc.useUtils();
  const setContent = trpc.admin.content.set.useMutation({
    onSuccess: () => {
      utils.admin.content.getAll.invalidate();
      setEditingKey(null);
      toast.success("Saved!", { description: "Your change is live on the site." });
    },
    onError: (e) => toast.error(e.message),
  });
  const upsertDoc = trpc.admin.docs.upsert.useMutation({
    onSuccess: () => {
      utils.admin.docs.list.invalidate();
      setEditingDoc(null);
      setShowNewDoc(false);
      setDocForm({ title: "", slug: "", content: "", category: "general" });
      toast.success("Document saved!");
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteDoc = trpc.admin.docs.delete.useMutation({
    onSuccess: () => {
      utils.admin.docs.list.invalidate();
      setViewingDoc(null);
      toast.success("Document deleted.");
    },
  });

  // Persist uploaded files to localStorage
  const saveUploadedFiles = (files: StoredFile[]) => {
    setUploadedFiles(files);
    try { localStorage.setItem("admin-uploaded-files", JSON.stringify(files)); } catch { /* ignore */ }
  };

  const handleFileUpload = async (file: File, category: string) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload/admin-doc", { method: "POST", body: formData, credentials: "include" });
      const data = await res.json() as { url?: string; key?: string; filename?: string; mimetype?: string; size?: number; error?: string };
      if (data.url && data.key) {
        const newFile: StoredFile = {
          url: data.url,
          key: data.key,
          filename: data.filename ?? file.name,
          mimetype: data.mimetype ?? file.type,
          size: data.size ?? file.size,
          uploadedAt: Date.now(),
          category,
        };
        const updated = [newFile, ...uploadedFiles];
        saveUploadedFiles(updated);
        toast.success("File uploaded!", { description: "URL copied to clipboard." });
        navigator.clipboard.writeText(data.url).catch(() => {/* ignore */});
      } else {
        toast.error(data.error ?? "Upload failed");
      }
    } catch {
      toast.error("Upload failed — network error");
    }
  };

  // Auth guard
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Access Denied
            </CardTitle>
            <CardDescription>This page is only accessible to the site owner (Anom).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Sidebar nav items
  const navItems: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "content", label: "Content Editor", icon: <Edit3 className="w-4 h-4" />, badge: contentQuery.data?.length?.toString() },
    { id: "storage", label: "Documents & Storage", icon: <FolderOpen className="w-4 h-4" />, badge: ((docsQuery.data?.length ?? 0) + uploadedFiles.length).toString() },
    { id: "help", label: "Help & Navigation", icon: <HelpCircle className="w-4 h-4" /> },
  ];

  // ── Quick links for Overview
  const quickLinks = [
    { label: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    { label: "Universe Map", href: "/universe-map", icon: <Map className="w-4 h-4" /> },
    { label: "Games Hub", href: "/games", icon: <Gamepad2 className="w-4 h-4" /> },
    { label: "Shop", href: "/shop", icon: <ShoppingBag className="w-4 h-4" /> },
    { label: "Members", href: "/members", icon: <Users className="w-4 h-4" /> },
    { label: "Settings", href: "/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  // ── Storage filter categories
  const filterCategories = ["all", "planning", "creative", "reference", "notes", "images", "files"];
  const filteredDocs = storageFilter === "all" || storageFilter === "planning" || storageFilter === "creative" || storageFilter === "reference" || storageFilter === "notes"
    ? (docsQuery.data ?? []).filter(d => storageFilter === "all" || d.category === storageFilter)
    : [];
  const filteredFiles = storageFilter === "all" || storageFilter === "images" || storageFilter === "files"
    ? uploadedFiles.filter(f => {
        if (storageFilter === "images") return f.mimetype.startsWith("image/");
        if (storageFilter === "files") return !f.mimetype.startsWith("image/");
        return true;
      })
    : [];

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Admin Panel</p>
              <p className="text-xs text-muted-foreground">Anom's Control Hub</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === item.id
                  ? "bg-primary/20 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
              {item.badge && item.badge !== "0" && (
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        {/* Help quick-jump links */}
        {activeTab === "help" && (
          <div className="p-3 border-t border-border space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Jump to</p>
            {HELP_SECTIONS.map((s) => (
              <button
                key={s.anchor}
                onClick={() => {
                  setOpenHelpSection(s.id);
                  setTimeout(() => {
                    document.getElementById(s.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <span>{s.icon}</span> {s.title.replace("How to ", "")}
              </button>
            ))}
          </div>
        )}

        <div className="p-3 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => navigate("/")}>
            <Home className="w-4 h-4" /> Back to Site
          </Button>
        </div>
      </aside>

      {/* ── Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-5xl">

          {/* ── OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome back, Anom 👋</h1>
                <p className="text-muted-foreground mt-1">Everything you need to manage Sanctuary is right here.</p>
              </div>

              {/* Status cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Editable Blocks", value: contentQuery.data?.length ?? "—", color: "text-cyan-400" },
                  { label: "Documents", value: docsQuery.data?.length ?? "—", color: "text-purple-400" },
                  { label: "Uploaded Files", value: uploadedFiles.length, color: "text-blue-400" },
                  { label: "Your Role", value: "Admin", color: "text-yellow-400" },
                ].map((card) => (
                  <Card key={card.label} className="border-border">
                    <CardContent className="p-4">
                      <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick links */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Quick Links — Jump to Any Page
                  </CardTitle>
                  <CardDescription>Click any button to open that page on your site in a new tab.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {quickLinks.map((link) => (
                      <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          {link.icon} {link.label}
                        </Button>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Getting started checklist */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Getting Started Checklist</CardTitle>
                  <CardDescription>Things to do to get the site ready for members.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { done: true, task: "Site is live at anomarsty.lol" },
                    { done: true, task: "Giphy GIF picker is active in profile editor" },
                    { done: true, task: "SEO meta tags added to home page" },
                    { done: false, task: "Confirm Spark vessel name (see Documents & Storage → Spark Concept)" },
                    { done: false, task: "Fill in Open Decisions table in Master Plan" },
                    { done: false, task: "Set up Stripe for premium purchases" },
                    { done: false, task: "Generate concept art for Lumifox and Glow Pod" },
                    { done: false, task: "Build Lounge selection system" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {item.done
                        ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                      }
                      <span className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>{item.task}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── CONTENT EDITOR TAB */}
          {activeTab === "content" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Content Editor</h1>
                <p className="text-muted-foreground mt-1">
                  Click the pencil icon on any row to edit that text. Your changes go live immediately.
                </p>
              </div>

              {contentQuery.isLoading && <p className="text-muted-foreground">Loading editable content...</p>}
              {contentQuery.data?.length === 0 && (
                <Card className="border-border">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Edit3 className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No editable content blocks yet.</p>
                    <p className="text-sm mt-1">Content blocks are added automatically when pages are updated. Check back after the next deploy.</p>
                  </CardContent>
                </Card>
              )}

              {/* Group by page */}
              {contentQuery.data && (() => {
                const byPage: Record<string, typeof contentQuery.data> = {};
                for (const item of contentQuery.data) {
                  if (!byPage[item.page]) byPage[item.page] = [];
                  byPage[item.page].push(item);
                }
                return Object.entries(byPage).map(([page, items]) => (
                  <div key={page}>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">{page}</h2>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <Card key={item.contentKey} className="border-border">
                          <CardContent className="p-4">
                            {editingKey === item.contentKey ? (
                              <div className="space-y-3">
                                <Label className="text-sm font-medium">{item.label}</Label>
                                <Textarea
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  rows={4}
                                  className="font-mono text-sm"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="gap-2 bg-green-600 hover:bg-green-700"
                                    onClick={() => setContent.mutate({
                                      contentKey: item.contentKey,
                                      label: item.label,
                                      page: item.page,
                                      value: editValue,
                                    })}
                                    disabled={setContent.isPending}
                                  >
                                    <Save className="w-3 h-3" /> Save
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingKey(null)}>
                                    <X className="w-3 h-3 mr-1" /> Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground font-medium mb-1">{item.label}</p>
                                  <p className="text-sm text-foreground line-clamp-2">{item.value}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="flex-shrink-0 gap-1 text-muted-foreground hover:text-foreground"
                                  onClick={() => { setEditingKey(item.contentKey); setEditValue(item.value); }}
                                >
                                  <Pencil className="w-3 h-3" /> Edit
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* ── DOCUMENTS & STORAGE TAB */}
          {activeTab === "storage" && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Documents & Storage</h1>
                  <p className="text-muted-foreground mt-1">Your planning docs, concept files, images, and uploads. Private — only you can see these.</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => { setShowNewDoc(true); setEditingDoc(null); setViewingDoc(null); setDocForm({ title: "", slug: "", content: "", category: "general" }); }}>
                    <Plus className="w-4 h-4" /> New Text Doc
                  </Button>
                  <Button size="sm" className="gap-2" onClick={() => docFileInputRef.current?.click()}>
                    <Upload className="w-4 h-4" /> Upload File
                  </Button>
                  <input
                    ref={docFileInputRef}
                    type="file"
                    accept="image/*,.pdf,.txt,.md,.doc,.docx"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const cat = file.type.startsWith("image/") ? "images" : "files";
                      await handleFileUpload(file, cat);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-2">
                {filterCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setStorageFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                      storageFilter === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    {cat === "all" ? "All" : cat}
                  </button>
                ))}
              </div>

              {/* New doc form */}
              {showNewDoc && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Create New Text Document</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Title</Label>
                        <Input placeholder="e.g. Sprint 2 Plan" value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Category</Label>
                        <Select value={docForm.category} onValueChange={(v) => setDocForm({ ...docForm, category: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="creative">Creative</SelectItem>
                            <SelectItem value="reference">Reference</SelectItem>
                            <SelectItem value="notes">Notes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Content</Label>
                      <Textarea placeholder="Start writing your document here..." value={docForm.content} onChange={(e) => setDocForm({ ...docForm, content: e.target.value })} rows={8} className="font-mono text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => upsertDoc.mutate(docForm)} disabled={!docForm.title || upsertDoc.isPending}>
                        <Save className="w-3 h-3" /> Save Document
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowNewDoc(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Text documents section */}
              {(storageFilter === "all" || ["planning","creative","reference","notes","general"].includes(storageFilter)) && (
                <div>
                  {filteredDocs.length > 0 && (
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Text Documents</h2>
                  )}
                  {docsQuery.isLoading && <p className="text-muted-foreground text-sm">Loading documents...</p>}
                  {!viewingDoc && !editingDoc && (
                    <div className="space-y-2">
                      {filteredDocs.map((doc) => (
                        <Card key={doc.slug} className="border-border hover:border-primary/40 transition-colors cursor-pointer" onClick={() => setViewingDoc(doc.slug)}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0 flex items-center gap-3">
                                <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                <div>
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <p className="font-medium text-foreground text-sm">{doc.title}</p>
                                    <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">Updated {new Date(doc.updatedAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                                <Button size="sm" variant="ghost" title="Edit" onClick={() => { setEditingDoc(doc.slug); setViewingDoc(null); setDocForm({ title: doc.title, slug: doc.slug, content: doc.content, category: doc.category }); }}>
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost" title="Download" onClick={() => {
                                  const blob = new Blob([doc.content], { type: "text/plain" });
                                  const a = document.createElement("a");
                                  a.href = URL.createObjectURL(blob);
                                  a.download = `${doc.slug}.txt`;
                                  a.click();
                                }}>
                                  <Download className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" title="Delete" onClick={() => { if (confirm(`Delete "${doc.title}"?`)) deleteDoc.mutate({ slug: doc.slug }); }}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* View doc */}
                  {viewingDoc && docDetailQuery.data && (
                    <Card className="border-border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{docDetailQuery.data.title}</CardTitle>
                            <Badge variant="outline" className="text-xs mt-1">{docDetailQuery.data.category}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="gap-1" onClick={() => { setEditingDoc(viewingDoc); setViewingDoc(null); setDocForm({ title: docDetailQuery.data!.title, slug: docDetailQuery.data!.slug, content: docDetailQuery.data!.content, category: docDetailQuery.data!.category }); }}>
                              <Pencil className="w-3 h-3" /> Edit
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setViewingDoc(null)}><X className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-sm text-foreground whitespace-pre-wrap font-mono bg-muted/30 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                          {docDetailQuery.data.content}
                        </pre>
                      </CardContent>
                    </Card>
                  )}

                  {/* Edit doc */}
                  {editingDoc && (
                    <Card className="border-primary/50 bg-primary/5">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Editing: {docForm.title}</CardTitle>
                          <Button size="sm" variant="ghost" onClick={() => setEditingDoc(null)}><X className="w-4 h-4" /></Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>Title</Label>
                            <Input value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} />
                          </div>
                          <div className="space-y-1">
                            <Label>Category</Label>
                            <Select value={docForm.category} onValueChange={(v) => setDocForm({ ...docForm, category: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="creative">Creative</SelectItem>
                                <SelectItem value="reference">Reference</SelectItem>
                                <SelectItem value="notes">Notes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>Content</Label>
                          <Textarea value={docForm.content} onChange={(e) => setDocForm({ ...docForm, content: e.target.value })} rows={16} className="font-mono text-sm" />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => upsertDoc.mutate(docForm)} disabled={upsertDoc.isPending}>
                            <Save className="w-3 h-3" /> Save Changes
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingDoc(null)}>Cancel</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Uploaded files section */}
              {(storageFilter === "all" || storageFilter === "images" || storageFilter === "files") && filteredFiles.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">Uploaded Files</h2>
                  <div className="space-y-2">
                    {filteredFiles.map((file) => (
                      <Card key={file.key} className="border-border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileIcon mimetype={file.mimetype} />
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-foreground truncate">{file.filename}</p>
                                <p className="text-xs text-muted-foreground">{formatBytes(file.size)} · {new Date(file.uploadedAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              {file.mimetype.startsWith("image/") && (
                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="ghost" title="Preview">
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                </a>
                              )}
                              <Button size="sm" variant="ghost" title="Copy URL" onClick={() => {
                                navigator.clipboard.writeText(file.url).catch(() => {/* ignore */});
                                toast.success("URL copied to clipboard!");
                              }}>
                                <Copy className="w-3 h-3" />
                              </Button>
                              <a href={file.url} download={file.filename}>
                                <Button size="sm" variant="ghost" title="Download">
                                  <Download className="w-3 h-3" />
                                </Button>
                              </a>
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" title="Remove from list" onClick={() => {
                                if (confirm(`Remove "${file.filename}" from your storage list?`)) {
                                  const updated = uploadedFiles.filter(f => f.key !== file.key);
                                  saveUploadedFiles(updated);
                                  toast.success("Removed from storage list.");
                                }
                              }}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {filteredDocs.length === 0 && filteredFiles.length === 0 && !showNewDoc && !docsQuery.isLoading && (
                <Card className="border-border">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <FolderOpen className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">Nothing here yet.</p>
                    <p className="text-sm mt-1">Click '+ New Text Doc' to write a document, or 'Upload File' to add an image or PDF.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ── HELP & NAVIGATION TAB */}
          {activeTab === "help" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Help & Navigation</h1>
                <p className="text-muted-foreground mt-1">
                  Step-by-step instructions for everything you can do as admin. Click any section to expand it. Use the jump links in the sidebar to go straight to a topic.
                </p>
              </div>

              {/* Quick jump bar */}
              <Card className="border-border bg-muted/30">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Jump to a topic</p>
                  <div className="flex flex-wrap gap-2">
                    {HELP_SECTIONS.map((s) => (
                      <button
                        key={s.anchor}
                        onClick={() => {
                          setOpenHelpSection(s.id);
                          setTimeout(() => {
                            document.getElementById(s.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }, 50);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border text-xs text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                      >
                        <span>{s.icon}</span>
                        <span>{s.title.replace("How to ", "")}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Guide sections */}
              <div className="space-y-2">
                {HELP_SECTIONS.map((section) => (
                  <HelpSection
                    key={section.id}
                    section={section}
                    isOpen={openHelpSection === section.id}
                    onToggle={() => setOpenHelpSection(openHelpSection === section.id ? null : section.id)}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
