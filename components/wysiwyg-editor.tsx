"use client"

import { useEditor, EditorContent, Extension } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { Color } from "@tiptap/extension-color"
import { TextStyle } from "@tiptap/extension-text-style"
import Highlight from "@tiptap/extension-highlight"
import { common, createLowlight } from "lowlight"
import { useCallback, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Link as LinkIcon,
  Minus,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Trash2,
  Plus,
  RowsIcon,
  Columns,
  Eye,
  Edit,
  Palette,
  Highlighter,
  ALargeSmall,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Create lowlight instance with common languages
const lowlight = createLowlight(common)

// Line height options
const LINE_HEIGHTS = [
  { value: "1", label: "1.0 (Compact)" },
  { value: "1.25", label: "1.25" },
  { value: "1.5", label: "1.5 (Normal)" },
  { value: "1.75", label: "1.75" },
  { value: "2", label: "2.0 (Relaxed)" },
  { value: "2.5", label: "2.5 (Loose)" },
]

// Custom Line Height Extension
const LineHeight = Extension.create({
  name: "lineHeight",

  addOptions() {
    return {
      types: ["paragraph", "heading"],
      defaultLineHeight: "1.5",
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) {
                return {}
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands }) => {
          return this.options.types.every((type: string) =>
            commands.updateAttributes(type, { lineHeight })
          )
        },
      unsetLineHeight:
        () =>
        ({ commands }) => {
          return this.options.types.every((type: string) =>
            commands.resetAttributes(type, "lineHeight")
          )
        },
    }
  },
})

interface WysiwygEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  isModal?: boolean
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "php", label: "PHP" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash/Shell" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
]

// Text colors for the color picker
const TEXT_COLORS = [
  { name: "Default", color: "" },
  { name: "Black", color: "#000000" },
  { name: "Dark Gray", color: "#4a4a4a" },
  { name: "Gray", color: "#9ca3af" },
  { name: "Red", color: "#ef4444" },
  { name: "Orange", color: "#f97316" },
  { name: "Yellow", color: "#eab308" },
  { name: "Green", color: "#22c55e" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Purple", color: "#a855f7" },
  { name: "Pink", color: "#ec4899" },
]

// Highlight colors for background
const HIGHLIGHT_COLORS = [
  { name: "None", color: "" },
  { name: "Yellow", color: "#fef08a" },
  { name: "Green", color: "#bbf7d0" },
  { name: "Blue", color: "#bfdbfe" },
  { name: "Purple", color: "#e9d5ff" },
  { name: "Pink", color: "#fbcfe8" },
  { name: "Red", color: "#fecaca" },
  { name: "Orange", color: "#fed7aa" },
]

// Toolbar Button Component
function ToolbarButton({ 
  onClick, 
  isActive = false, 
  disabled = false,
  title,
  children 
}: { 
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode 
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-accent text-accent-foreground"
      )}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  )
}

// Toolbar Divider
function ToolbarDivider() {
  return <div className="w-px h-6 bg-border mx-1" />
}

export function WysiwygEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing your content...",
  minHeight = "300px",
  isModal = false 
}: WysiwygEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [codeDialogOpen, setCodeDialogOpen] = useState(false)
  const [codeLanguage, setCodeLanguage] = useState("javascript")
  const [isPreview, setIsPreview] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Underline,
      TextStyle,
      Color,
      LineHeight,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-border w-full my-4",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-border bg-muted/50 px-4 py-2 text-left font-semibold",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-border px-4 py-2",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-[#282c34] text-gray-100 rounded-lg p-4 my-4 overflow-x-auto font-mono text-sm",
        },
      }),
    ],
    content: value,
    immediatelyRender: false, // Prevent SSR hydration mismatch
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `prose prose-gray dark:prose-invert max-w-none focus:outline-none p-4`,
        style: `min-height: ${minHeight}`,
      },
    },
  })

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  const setLink = useCallback(() => {
    if (!editor) return

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
    }
    setLinkDialogOpen(false)
    setLinkUrl("")
  }, [editor, linkUrl])

  const insertTable = useCallback(() => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  const insertCodeBlock = useCallback(() => {
    if (!editor) return
    editor.chain().focus().setCodeBlock({ language: codeLanguage }).run()
    setCodeDialogOpen(false)
  }, [editor, codeLanguage])

  if (!editor) {
    return <div className="border rounded-lg p-4 min-h-[300px] animate-pulse bg-muted/20" />
  }

  return (
    <div className="border rounded-lg bg-background">
      {/* Toolbar - sticky under navbar or at top if in modal */}
      <div className={`flex flex-wrap items-center gap-1 p-2 border-b bg-background sticky ${isModal ? 'top-0' : 'top-16'} z-40 rounded-t-lg shadow-sm`}>
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Text Color"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-4 gap-1">
              {TEXT_COLORS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={cn(
                    "w-6 h-6 rounded border border-border hover:scale-110 transition-transform",
                    item.color === "" && "bg-gradient-to-br from-white to-gray-200 dark:from-gray-800 dark:to-gray-600"
                  )}
                  style={item.color ? { backgroundColor: item.color } : undefined}
                  title={item.name}
                  onClick={() => {
                    if (item.color === "") {
                      editor.chain().focus().unsetColor().run()
                    } else {
                      editor.chain().focus().setColor(item.color).run()
                    }
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Highlight"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-4 gap-1">
              {HIGHLIGHT_COLORS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={cn(
                    "w-6 h-6 rounded border border-border hover:scale-110 transition-transform",
                    item.color === "" && "bg-gradient-to-br from-white to-gray-200 dark:from-gray-800 dark:to-gray-600 relative after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-xs after:content-['✕']"
                  )}
                  style={item.color ? { backgroundColor: item.color } : undefined}
                  title={item.name}
                  onClick={() => {
                    if (item.color === "") {
                      editor.chain().focus().unsetHighlight().run()
                    } else {
                      editor.chain().focus().setHighlight({ color: item.color }).run()
                    }
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        {/* Line Height */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 gap-1"
              title="Line Height"
            >
              <ALargeSmall className="h-4 w-4" />
              <span className="text-xs hidden sm:inline">Line</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2" align="start">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">Line Height</p>
              {LINE_HEIGHTS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={cn(
                    "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors",
                    editor.getAttributes("paragraph").lineHeight === item.value && "bg-accent"
                  )}
                  onClick={() => {
                    (editor.chain().focus() as any).setLineHeight(item.value).run()
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Quote */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        {/* Horizontal Rule */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Line"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        {/* Delete Current Block */}
        <ToolbarButton
          onClick={() => {
            // Delete the current node/block
            if (editor.isActive("codeBlock")) {
              editor.chain().focus().deleteNode("codeBlock").run()
            } else if (editor.isActive("blockquote")) {
              editor.chain().focus().lift("blockquote").run()
            } else if (editor.isActive("table")) {
              editor.chain().focus().deleteTable().run()
            } else if (editor.isActive("horizontalRule")) {
              editor.chain().focus().deleteSelection().run()
            } else if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
              editor.chain().focus().liftListItem("listItem").run()
            } else if (editor.isActive("heading")) {
              editor.chain().focus().clearNodes().run()
            } else {
              // Delete current selection or node
              editor.chain().focus().deleteSelection().run()
            }
          }}
          title="Delete Block (Del)"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Table */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2 gap-1",
                editor.isActive("table") && "bg-accent text-accent-foreground"
              )}
              title="Table"
            >
              <TableIcon className="h-4 w-4" />
              <span className="text-xs">Table</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium">Table Options</p>
              {!editor.isActive("table") ? (
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  onClick={insertTable}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Insert 3×3 Table
                </Button>
              ) : (
                <div className="space-y-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                  >
                    <Columns className="h-4 w-4 mr-2" />
                    Add Column After
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => editor.chain().focus().addColumnBefore().run()}
                  >
                    <Columns className="h-4 w-4 mr-2" />
                    Add Column Before
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                  >
                    <RowsIcon className="h-4 w-4 mr-2" />
                    Add Row After
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => editor.chain().focus().addRowBefore().run()}
                  >
                    <RowsIcon className="h-4 w-4 mr-2" />
                    Add Row Before
                  </Button>
                  <div className="border-t my-2" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive"
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Column
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive"
                    onClick={() => editor.chain().focus().deleteRow().run()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Row
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive"
                    onClick={() => editor.chain().focus().deleteTable().run()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Table
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Code Block */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-2 gap-1",
            editor.isActive("codeBlock") && "bg-accent text-accent-foreground"
          )}
          onClick={() => setCodeDialogOpen(true)}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
          <span className="text-xs">Code</span>
        </Button>

        {/* Link */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-2 gap-1",
            editor.isActive("link") && "bg-accent text-accent-foreground"
          )}
          onClick={() => {
            const previousUrl = editor.getAttributes("link").href || ""
            setLinkUrl(previousUrl)
            setLinkDialogOpen(true)
          }}
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
          <span className="text-xs">Link</span>
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Preview Toggle */}
        <Button
          type="button"
          variant={isPreview ? "default" : "outline"}
          size="sm"
          className="h-8 px-3 gap-2"
          onClick={() => setIsPreview(!isPreview)}
          title={isPreview ? "Edit" : "Preview"}
        >
          {isPreview ? (
            <>
              <Edit className="h-4 w-4" />
              <span className="text-xs">Edit</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span className="text-xs">Preview</span>
            </>
          )}
        </Button>
      </div>

      {/* Editor Content or Preview */}
      {isPreview ? (
        <div 
          className="prose prose-gray dark:prose-invert max-w-none p-4
            prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:leading-relaxed prose-blockquote:border-l-4 prose-blockquote:border-primary
            prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ol:list-decimal
            [&_table]:border-collapse [&_table]:w-full [&_table]:my-4
            [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold
            [&_td]:border [&_td]:border-border [&_td]:px-4 [&_td]:py-2
            [&_tr:hover]:bg-muted/30
            [&_pre]:bg-[#282c34] [&_pre]:text-gray-100 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto
            [&_code]:font-mono [&_code]:text-sm
            [&_a]:text-primary [&_a]:underline"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-muted-foreground italic">No content to preview</p>' }}
        />
      ) : (
        <EditorContent 
          editor={editor} 
          className="prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:leading-relaxed prose-blockquote:border-l-4 prose-blockquote:border-primary
            prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ol:list-decimal
            [&_.ProseMirror-selectednode]:ring-2 [&_.ProseMirror-selectednode]:ring-primary
            [&_table]:border-collapse [&_table]:w-full
            [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold
            [&_td]:border [&_td]:border-border [&_td]:px-4 [&_td]:py-2
            [&_tr:hover]:bg-muted/30
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
        />
      )}

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Add a URL to create a hyperlink
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    setLink()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLinkDialogOpen(false)}
            >
              Cancel
            </Button>
            {editor?.isActive("link") && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  editor.chain().focus().unsetLink().run()
                  setLinkDialogOpen(false)
                }}
              >
                Remove Link
              </Button>
            )}
            <Button type="button" onClick={setLink}>
              {editor?.isActive("link") ? "Update Link" : "Insert Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Code Block Dialog */}
      <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Insert Code Block</DialogTitle>
            <DialogDescription>
              Select a programming language for syntax highlighting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCodeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={insertCodeBlock}>
              Insert Code Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
