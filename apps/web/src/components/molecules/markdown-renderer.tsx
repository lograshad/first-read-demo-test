import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function MarkdownRenderer({ text }: { text?: string }) {
  return (
    <Markdown
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm]}
      remarkRehypeOptions={{ passThrough: ["link"] }}
      components={{
        p({ children }) {
          return <p>{children}</p>;
        },
        pre({ children }) {
          return <pre>{children}</pre>;
        },
        a({ children, ...props }) {
          return (
            <a target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          );
        },
      }}
    >
      {text}
    </Markdown>
  );
}
