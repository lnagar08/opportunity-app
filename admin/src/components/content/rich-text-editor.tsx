import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Bold,
	Italic,
	UnderlineIcon,
	List,
	ListOrdered,
	Heading2,
	LinkIcon,
	Unlink,
	Undo,
	Redo
} from 'lucide-react';

interface RichTextEditorProps {
	value: string;
	onChange: (html: string) => void;
}

// Controlled Tiptap wrapper — plain HTML string in/out, so it drops into
// react-hook-form the same way a controlled <Textarea> would.
const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			Link.configure({ openOnClick: false, autolink: true })
		],
		content: value,
		editorProps: {
			attributes: {
				class: 'prose prose-sm max-w-none min-h-[240px] px-3 py-2 focus:outline-none'
			}
		},
		onUpdate: ({ editor: e }) => onChange(e.getHTML())
	});

	// Keep the editor in sync if `value` changes from outside (e.g. form
	// reset when switching between Terms & Privacy, or Cancel discarding
	// edits) — Tiptap won't pick that up on its own since it's uncontrolled
	// internally.
	useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value, { emitUpdate: false });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value, editor]);

	if (!editor) return null;

	const setLink = () => {
		const previousUrl = editor.getAttributes('link').href as string | undefined;
		const url = window.prompt('URL', previousUrl ?? 'https://');
		if (url === null) return;
		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}
		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	};

	return (
		<div className="border-input rounded-md border">
			<div className="border-input bg-muted/40 flex flex-wrap items-center gap-1 border-b p-1.5">
				<ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
					<Bold className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
					<Italic className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive('underline')}
					onClick={() => editor.chain().focus().toggleUnderline().run()}
				>
					<UnderlineIcon className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive('heading', { level: 2 })}
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				>
					<Heading2 className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive('bulletList')}
					onClick={() => editor.chain().focus().toggleBulletList().run()}
				>
					<List className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive('orderedList')}
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
				>
					<ListOrdered className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton active={editor.isActive('link')} onClick={setLink}>
					<LinkIcon className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().unsetLink().run()}
					disabled={!editor.isActive('link')}
				>
					<Unlink className="h-3.5 w-3.5" />
				</ToolbarButton>
				<div className="bg-border mx-1 h-5 w-px" />
				<ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
					<Undo className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
					<Redo className="h-3.5 w-3.5" />
				</ToolbarButton>
			</div>
			<EditorContent editor={editor} />
		</div>
	);
};

const ToolbarButton = ({
	children,
	active,
	disabled,
	onClick
}: {
	children: React.ReactNode;
	active?: boolean;
	disabled?: boolean;
	onClick: () => void;
}) => (
	<Button
		type="button"
		variant="ghost"
		size="icon"
		className={`h-7 w-7 ${active ? 'bg-primary/10 text-primary' : ''}`}
		disabled={disabled}
		onClick={onClick}
	>
		{children}
	</Button>
);

export default RichTextEditor;