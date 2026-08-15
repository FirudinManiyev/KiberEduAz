import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function LessonMarkdown({ children }: { children: string }) {
  return (
    <div className="local-lesson-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children: tableChildren }) => (
            <div className="local-lesson-table" tabIndex={0}>
              <table>{tableChildren}</table>
            </div>
          ),
          pre: ({ children: preChildren }) => (
            <div className="local-lesson-code" tabIndex={0}>
              <pre>{preChildren}</pre>
            </div>
          ),
          a: ({ href, children: linkChildren }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {linkChildren}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

