"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";

const commands = [
  ["bold", Bold, "Bold"],
  ["italic", Italic, "Italic"],
  ["underline", Underline, "Underline"],
  ["insertUnorderedList", List, "Bulleted list"],
  ["insertOrderedList", ListOrdered, "Numbered list"],
];

export default function RichTextEditor({ value = "", onChange, placeholder = "" }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  function runCommand(command) {
    editorRef.current?.focus();
    document.execCommand(command, false);
    onChange(editorRef.current?.innerHTML || "");
  }

  function handlePaste(event) {
    event.preventDefault();
    const plainText = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, plainText);
    onChange(editorRef.current?.innerHTML || "");
  }

  return (
    <div className="mt-1 overflow-hidden border border-line bg-paper focus-within:border-emerald">
      <div className="flex flex-wrap gap-1 border-b border-line bg-paper-dim/40 p-1.5">
        {commands.map(([command, Icon, label]) => (
          <button
            key={command}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(command)}
            title={label}
            aria-label={label}
            className="inline-flex h-8 w-8 items-center justify-center text-charcoal/70 hover:bg-emerald/10 hover:text-emerald"
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        autoCapitalize="sentences"
        autoCorrect="on"
        spellCheck
        onPaste={handlePaste}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        className="min-h-[8rem] px-3 py-2 text-sm text-ink normal-case outline-none [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:ml-5 [&_ul]:list-disc"
      />
    </div>
  );
}
