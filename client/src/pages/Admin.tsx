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
  Image,
  BookOpen,
  Settings,
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
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "overview" | "content" | "documents" | "assets" | "guide";

// ─── How-To Guide Content ─────────────────────────────────────────────────────
const GUIDE_SECTIONS = [
  {
    id: "welcome",
    title: "Welcome to Your Admin Panel",
    icon: "🏠",
    steps: [
      {
        step: 1,
        title: "How to get here",
        body: "You are already here! To get back to this page any time, go to your site and click your profile picture in the top-right corner. You will see an 'Admin' option in the menu. Click it and you will land right here.",
      },
      {
        step: 2,
        title: "What you can do here",
        body: "This admin panel is your control center. You can edit text on any page of the site, store your planning documents, manage uploaded images, and read step-by-step guides for everything. You never need to touch code.",
      },
      {
        step: 3,
        title: "The sidebar on the left",
        body: "The sidebar has five sections: Overview (this page), Content Editor (edit site text), Documents (your planning docs), Assets (your images), and How-To Guide (the guide you are reading now). Click any section name to go there.",
      },
    ],
  },
  {
    id: "content",
    title: "How to Edit Text on the Site",
    icon: "✏️",
    steps: [
      {
        step: 1,
        title: "Go to Content Editor",
        body: "Click 'Content Editor' in the sidebar on the left. You will see a list of every piece of text on the site that you are allowed to edit — things like page descriptions, section headings, and welcome messages.",
      },
      {
        step: 2,
        title: "Find the text you want to change",
        body: "Each row shows you the page it lives on (like 'Universe Map' or 'Landing Page'), a label that describes what it is (like 'AO Universe Description'), and the current text. Scroll through the list to find what you want.",
      },
      {
        step: 3,
        title: "Click Edit",
        body: "Click the pencil icon (✏️) on the right side of any row. The text will turn into a text box you can type in. Make your changes — you can type as much or as little as you want.",
      },
      {
        step: 4,
        title: "Save your changes",
        body: "When you are done typing, click the green 'Save' button. Your change goes live on the site immediately — no waiting, no publishing step needed. If you change your mind, click the grey 'Cancel' button instead.",
      },
      {
        step: 5,
        title: "See it on the site",
        body: "Open a new browser tab and go to anomarsty.lol. Navigate to the page you just edited. Your new text will be showing. If you do not see it right away, try refreshing the page (press F5 or Ctrl+R on Windows, Cmd+R on Mac).",
      },
    ],
  },
  {
    id: "documents",
    title: "How to Use Your Documents",
    icon: "📄",
    steps: [
      {
        step: 1,
        title: "Go to Documents",
        body: "Click 'Documents' in the sidebar. This is where all your planning documents live — the Master Plan, the Spark Concept doc, the Lounge Plan, and anything else you save here.",
      },
      {
        step: 2,
        title: "Read a document",
        body: "Click on any document title to open it. It will show the full text right here in the panel. You can scroll through it, read it, and copy text from it.",
      },
      {
        step: 3,
        title: "Edit a document",
        body: "Click the pencil icon (✏️) next to any document. The text will open in an editor. Make your changes — you can add new sections, update dates, fill in the blank fields (like the Open Decisions table), or change anything you want.",
      },
      {
        step: 4,
        title: "Save a document",
        body: "Click the green 'Save' button when you are done. The document is saved instantly. It stays here in your admin panel — it does not appear on the public site.",
      },
      {
        step: 5,
        title: "Create a new document",
        body: "Click the '+ New Document' button at the top of the Documents tab. Give it a title, choose a category (Planning, Creative, Reference, or Notes), and start typing. Click Save when done.",
      },
      {
        step: 6,
        title: "Download a document",
        body: "Click the download icon (⬇️) next to any document to save it to your computer as a text file. This is useful for sharing with collaborators or keeping a backup.",
      },
    ],
  },
  {
    id: "assets",
    title: "How to Manage Your Images",
    icon: "🖼️",
    steps: [
      {
        step: 1,
        title: "Go to Assets",
        body: "Click 'Assets' in the sidebar. This shows all the images you have uploaded to the site — logos, creature concept art, lounge backgrounds, and anything else.",
      },
      {
        step: 2,
        title: "Upload a new image",
        body: "Click the '+ Upload Image' button. A file picker will open. Choose an image from your computer (JPG, PNG, GIF, or WebP). The image will upload and appear in your asset library.",
      },
      {
        step: 3,
        title: "Copy an image URL",
        body: "Every image has a 'Copy URL' button. Click it to copy the web address of that image. You can then paste this URL into the Content Editor when editing a page, or give it to Manus to use in a new feature.",
      },
      {
        step: 4,
        title: "Delete an image",
        body: "Click the trash icon (🗑️) next to any image to delete it. Be careful — if the image is being used on the site, deleting it will cause a broken image to appear on that page.",
      },
    ],
  },
  {
    id: "navigation",
    title: "How to Navigate the Site as Admin",
    icon: "🗺️",
    steps: [
      {
        step: 1,
        title: "Your site address",
        body: "Your site lives at two addresses: anomarsty.lol and anomartsy.xyz. Both go to the same place. You can use either one.",
      },
      {
        step: 2,
        title: "The main navigation bar",
        body: "At the top of every page on your site, there is a navigation bar. It has links to the main sections: Home, Universe Map, Games, Financial District, Anom's Corner, and more. Click any of these to go to that section.",
      },
      {
        step: 3,
        title: "Your profile menu",
        body: "In the top-right corner of every page, you will see your profile picture (or a placeholder if you have not set one yet). Click it to open a dropdown menu with links to: Your Profile, Settings, Admin Panel, and Log Out.",
      },
      {
        step: 4,
        title: "Quick links from this panel",
        body: "In the Overview tab of this admin panel, there are quick-link buttons to every major page on the site. Click any of them to jump directly to that page in a new tab.",
      },
      {
        step: 5,
        title: "The back button",
        body: "On most pages, there is a back arrow (←) in the top-left corner. Click it to go back to where you came from. You can also use your browser's back button (the ← arrow in the browser toolbar at the very top of your screen).",
      },
      {
        step: 6,
        title: "Getting back to the admin panel",
        body: "From anywhere on the site: click your profile picture in the top-right → click 'Admin' in the dropdown. Or type /admin at the end of your site address in the browser bar (e.g. anomarsty.lol/admin).",
      },
    ],
  },
  {
    id: "settings",
    title: "How to Change Site Settings",
    icon: "⚙️",
    steps: [
      {
        step: 1,
        title: "Your personal settings",
        body: "Go to anomarsty.lol/settings (or click your profile picture → Settings). Here you can change your profile photo, bio, username, being type, background theme, and font. These are your personal settings — they only affect your profile.",
      },
      {
        step: 2,
        title: "Changing your profile photo",
        body: "In Settings, look for the 'Profile Photo' section. Click 'Upload Photo' to choose an image from your computer. The photo will upload and appear on your profile right away.",
      },
      {
        step: 3,
        title: "Changing your bio",
        body: "In Settings, find the 'About You' section. Click in the text box and type your bio. You can write up to 280 characters. Click 'Save Changes' when done.",
      },
      {
        step: 4,
        title: "Changing the site font",
        body: "In Settings, scroll down to the 'Font' section. You will see six font options — click any one to preview it. The whole site will switch to that font instantly. Click 'Save Changes' to keep it.",
      },
      {
        step: 5,
        title: "Changing your theme",
        body: "In Settings, find the 'Theme' section. Click any theme card to switch to it. Themes change the colors of the site. Some themes cost coins to unlock — you will see a coin price on those.",
      },
    ],
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function GuideSection({ section }: { section: typeof GUIDE_SECTIONS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden mb-3">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{section.icon}</span>
          <span className="font-semibold text-foreground">{section.title}</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-border bg-muted/20 p-4 space-y-4">
          {section.steps.map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                {s.step}
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">{s.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

  // Assets state
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    { id: "documents", label: "Documents", icon: <FileText className="w-4 h-4" />, badge: docsQuery.data?.length?.toString() },
    { id: "assets", label: "Assets", icon: <Image className="w-4 h-4" /> },
    { id: "guide", label: "How-To Guide", icon: <BookOpen className="w-4 h-4" /> },
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-border bg-card flex flex-col">
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
              {item.badge && (
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>
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
                  { label: "Guide Sections", value: GUIDE_SECTIONS.length, color: "text-green-400" },
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
                    { done: false, task: "Confirm Spark vessel name (see Documents → Spark Concept)" },
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

          {/* ── DOCUMENTS TAB */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Documents</h1>
                  <p className="text-muted-foreground mt-1">Your planning docs, concept notes, and guides. Private — only you can see these.</p>
                </div>
                <Button size="sm" className="gap-2" onClick={() => { setShowNewDoc(true); setEditingDoc(null); setViewingDoc(null); setDocForm({ title: "", slug: "", content: "", category: "general" }); }}>
                  <Plus className="w-4 h-4" /> New Document
                </Button>
              </div>

              {/* New doc form */}
              {showNewDoc && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Create New Document</CardTitle>
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

              {docsQuery.isLoading && <p className="text-muted-foreground">Loading documents...</p>}
              {docsQuery.data?.length === 0 && !showNewDoc && (
                <Card className="border-border">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No documents yet.</p>
                    <p className="text-sm mt-1">Click '+ New Document' to create your first one.</p>
                  </CardContent>
                </Card>
              )}

              {/* Document list */}
              {docsQuery.data && docsQuery.data.length > 0 && !viewingDoc && !editingDoc && (
                <div className="space-y-2">
                  {docsQuery.data.map((doc) => (
                    <Card key={doc.slug} className="border-border hover:border-primary/40 transition-colors cursor-pointer" onClick={() => setViewingDoc(doc.slug)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-foreground">{doc.title}</p>
                              <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Updated {new Date(doc.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="ghost" className="gap-1" onClick={() => {
                              setEditingDoc(doc.slug);
                              setViewingDoc(null);
                              setDocForm({ title: doc.title, slug: doc.slug, content: doc.content, category: doc.category });
                            }}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => {
                              const blob = new Blob([doc.content], { type: "text/plain" });
                              const a = document.createElement("a");
                              a.href = URL.createObjectURL(blob);
                              a.download = `${doc.slug}.txt`;
                              a.click();
                            }}>
                              <Download className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => {
                              if (confirm(`Delete "${doc.title}"?`)) deleteDoc.mutate({ slug: doc.slug });
                            }}>
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
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                          setEditingDoc(viewingDoc);
                          setViewingDoc(null);
                          setDocForm({ title: docDetailQuery.data!.title, slug: docDetailQuery.data!.slug, content: docDetailQuery.data!.content, category: docDetailQuery.data!.category });
                        }}>
                          <Pencil className="w-3 h-3" /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setViewingDoc(null)}>
                          <X className="w-4 h-4" />
                        </Button>
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

          {/* ── ASSETS TAB */}
          {activeTab === "assets" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Assets</h1>
                  <p className="text-muted-foreground mt-1">Upload images for the site. Copy the URL to use an image anywhere.</p>
                </div>
                <Button size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4" /> Upload Image
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append("file", file);
                  try {
                    const res = await fetch("/api/upload/shop-asset", { method: "POST", body: formData, credentials: "include" });
                    const data = await res.json() as { url?: string; error?: string };
                    if (data.url) {
                      toast.success("Uploaded! URL copied to clipboard.");
                      navigator.clipboard.writeText(data.url);
                    } else {
                      toast.error(data.error ?? "Upload failed");
                    }
                  } catch {
                    toast.error("Upload failed — network error");
                  }
                  e.target.value = "";
                }} />
              </div>
              <Card className="border-border">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Image className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Asset library coming soon.</p>
                  <p className="text-sm mt-1">For now, use the Upload button above to upload an image. The URL will be copied to your clipboard automatically so you can paste it wherever you need it.</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── HOW-TO GUIDE TAB */}
          {activeTab === "guide" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">How-To Guide</h1>
                <p className="text-muted-foreground mt-1">
                  Step-by-step instructions for everything you can do as admin. Click any section to expand it.
                </p>
              </div>
              <div className="space-y-2">
                {GUIDE_SECTIONS.map((section) => (
                  <GuideSection key={section.id} section={section} />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
