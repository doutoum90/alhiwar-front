
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import { useEffect } from "react";
import { Box, Button, Flex } from "@chakra-ui/react";

export function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit, LinkExt.configure({ openOnClick: true }), ImageExt],
    content: value || "<p></p>",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    
  }, [value, editor]);

  if (!editor) return null;

  const Btn = ({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) => (
    <Button size="sm" variant={active ? "solid" : "outline"} onClick={onClick}>
      {label}
    </Button>
  );

  return (
    <Box borderWidth="1px" borderRadius="xl" overflow="hidden">
      <Flex wrap="wrap" gap={2} p={3} bg="gray.50">
        <Btn label="B" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <Btn label="I" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <Btn label="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <Btn label="• Liste" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <Btn label="1. Liste" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const url = window.prompt("Lien (https://...)");
            if (!url) return;
            editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          Lien
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const url = window.prompt("URL image (https://...)");
            if (!url) return;
            editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          Image
        </Button>

        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          Reset
        </Button>
      </Flex>

      <Box p={4} bg="white" minH="220px">
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}