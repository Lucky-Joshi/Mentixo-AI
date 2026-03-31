import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Shared markdown renderer used in Chat and Notes.
 * Renders #headings, **bold**, bullet lists, code blocks, tables etc.
 */
const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="text-2xl font-black text-white mt-6 mb-3 tracking-tight border-b border-white/10 pb-2">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold text-white mt-5 mb-2 tracking-tight">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-bold text-primary mt-4 mb-1">
            {children}
          </h3>
        ),

        // Paragraph
        p: ({ children }) => (
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            {children}
          </p>
        ),

        // Lists
        ul: ({ children }) => (
          <ul className="space-y-1.5 mb-3 ml-2">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1.5 mb-3 ml-2 text-sm text-slate-300">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="flex items-start gap-2 text-sm text-slate-300">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span>{children}</span>
          </li>
        ),

        // Inline code
        code: ({ inline, children }) =>
          inline ? (
            <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-primary text-xs font-mono">
              {children}
            </code>
          ) : (
            <pre className="my-3 p-4 rounded-2xl bg-black/40 border border-white/10 overflow-x-auto">
              <code className="text-xs font-mono text-emerald-400 leading-relaxed">
                {children}
              </code>
            </pre>
          ),

        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary/50 pl-4 my-3 text-sm text-slate-400 italic">
            {children}
          </blockquote>
        ),

        // Bold / Italic
        strong: ({ children }) => (
          <strong className="font-bold text-white">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-slate-300">{children}</em>
        ),

        // Horizontal rule
        hr: () => <hr className="my-4 border-white/10" />,

        // Table (GFM)
        table: ({ children }) => (
          <div className="overflow-x-auto my-4 rounded-2xl border border-white/10">
            <table className="w-full text-sm text-slate-300">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-white/5 text-white font-bold">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left text-xs uppercase tracking-widest">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 border-t border-white/5">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
