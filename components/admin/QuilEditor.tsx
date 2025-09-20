"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface QuilEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const QuilEditor = ({ 
  value, 
  onChange, 
  theme, 
  placeholder, 
  className,
  disabled = false 
}: QuilEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadQuill = async () => {
      try {
        if (typeof window === "undefined" || !editorRef.current) {
          return;
        }

        // Clean up existing instance
        if (quillInstanceRef.current) {
          quillInstanceRef.current = null;
        }

        const Quill = (await import("quill")).default;
        
        // Import Quill CSS
        await import('quill/dist/quill.snow.css' as any).catch(() => {
          console.warn('Could not load Quill CSS - styles may be missing');
        });

        if (!isMounted || !editorRef.current) return;

        quillInstanceRef.current = new Quill(editorRef.current, {
          theme: "snow",
          placeholder: placeholder || "Write your product description...",
          readOnly: disabled,
          modules: {
            toolbar: disabled ? false : [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ indent: "-1" }, { indent: "+1" }],
              [{ align: [] }],
              ["link"],
              ["blockquote", "code-block"],
              ["clean"],
            ],
          },
        });

        // Set initial content
        if (value && quillInstanceRef.current) {
          try {
            // Try to set HTML content directly first
            quillInstanceRef.current.root.innerHTML = value;
          } catch (error) {
            // Fallback to clipboard conversion if direct HTML setting fails
            try {
              const delta = quillInstanceRef.current.clipboard.convert(value);
              quillInstanceRef.current.setContents(delta, "silent");
            } catch (deltaError) {
              // Final fallback - set as plain text
              quillInstanceRef.current.setText(value);
            }
          }
        }

        // Listen for changes
        quillInstanceRef.current.on("text-change", () => {
          if (quillInstanceRef.current && onChange) {
            const html = quillInstanceRef.current.root.innerHTML;
            // Only call onChange if content actually changed
            if (html !== value) {
              onChange(html === "<p><br></p>" ? "" : html);
            }
          }
        });

        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error("Failed to load Quill editor:", err);
        setError("Failed to load editor");
        setIsLoading(false);
      }
    };

    loadQuill();

    return () => {
      isMounted = false;
      if (quillInstanceRef.current) {
        quillInstanceRef.current.off("text-change");
        quillInstanceRef.current = null;
      }
    };
  }, [disabled]);

  // Update content when value prop changes
  useEffect(() => {
    if (quillInstanceRef.current && value !== undefined) {
      const currentContent = quillInstanceRef.current.root.innerHTML;
      const normalizedCurrent = currentContent === "<p><br></p>" ? "" : currentContent;
      
      if (normalizedCurrent !== value) {
        try {
          // Try to set HTML content directly first
          quillInstanceRef.current.root.innerHTML = value || "<p><br></p>";
        } catch (error) {
          // Fallback to clipboard conversion if direct HTML setting fails
          try {
            const delta = quillInstanceRef.current.clipboard.convert(value || "");
            quillInstanceRef.current.setContents(delta, "silent");
          } catch (deltaError) {
            // Final fallback - set as plain text
            quillInstanceRef.current.setText(value || "");
          }
        }
      }
    }
  }, [value]);

  if (error) {
    return (
      <div className={cn(
        "min-h-[200px] border rounded-md p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
        className
      )}>
        <div className="text-red-600 dark:text-red-400 text-sm">
          Error loading editor: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative min-h-[200px] border rounded-md bg-background",
      "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
          <div className="text-sm text-muted-foreground">Loading editor...</div>
        </div>
      )}
      <div 
        ref={editorRef} 
        className={cn(
          "min-h-[180px] prose prose-sm max-w-none",
          "[&_.ql-editor]:min-h-[180px] [&_.ql-editor]:p-3",
          "[&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-border",
          "[&_.ql-container]:border-0 [&_.ql-editor]:border-0",
          "[&_.ql-editor]:focus:outline-none",
          theme === "dark" && "[&_.ql-toolbar]:bg-muted [&_.ql-editor]:bg-background"
        )}
      />
    </div>
  );
};

export default QuilEditor;
