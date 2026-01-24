"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Helper to extract text content from React children
const getTextContent = (children: React.ReactNode): string => {
  if (typeof children === "string") {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(getTextContent).join("");
  }
  if (children && typeof children === "object" && "props" in children) {
    const childElement = children as React.ReactElement<{
      children?: React.ReactNode;
    }>;
    return getTextContent(childElement.props.children);
  }
  return "";
};

// Helper to create URL-friendly slug
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        components={{
          // Headings with IDs for TOC navigation
          h1: ({ children, ...props }) => {
            const text = getTextContent(children);
            const id = slugify(text);
            return (
              <h1
                className="mt-6 mb-4 border-b pb-2 font-semibold text-2xl first:mt-0"
                id={id}
                {...props}
              >
                {children}
              </h1>
            );
          },
          h2: ({ children, ...props }) => {
            const text = getTextContent(children);
            const id = slugify(text);
            return (
              <h2
                className="mt-5 mb-3 border-b pb-1.5 font-semibold text-xl"
                id={id}
                {...props}
              >
                {children}
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const text = getTextContent(children);
            const id = slugify(text);
            return (
              <h3
                className="mt-4 mb-2 font-semibold text-lg"
                id={id}
                {...props}
              >
                {children}
              </h3>
            );
          },
          h4: ({ children, ...props }) => {
            const text = getTextContent(children);
            const id = slugify(text);
            return (
              <h4
                className="mt-3 mb-2 font-semibold text-base"
                id={id}
                {...props}
              >
                {children}
              </h4>
            );
          },
          h5: ({ children, ...props }) => {
            const text = getTextContent(children);
            const id = slugify(text);
            return (
              <h5
                className="mt-2 mb-1 font-semibold text-sm"
                id={id}
                {...props}
              >
                {children}
              </h5>
            );
          },
          h6: ({ children, ...props }) => {
            const text = getTextContent(children);
            const id = slugify(text);
            return (
              <h6
                className="mt-2 mb-1 font-semibold text-muted-foreground text-xs"
                id={id}
                {...props}
              >
                {children}
              </h6>
            );
          },
          // Paragraphs
          p: ({ children, ...props }) => (
            <p className="mb-3 text-sm leading-relaxed" {...props}>
              {children}
            </p>
          ),
          // Lists
          ul: ({ children, ...props }) => (
            <ul className="mb-3 list-disc pl-6 text-sm" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="mb-3 list-decimal pl-6 text-sm" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="mb-1" {...props}>
              {children}
            </li>
          ),
          // Blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="my-3 border-primary/50 border-l-4 pl-4 text-muted-foreground text-sm italic"
              {...props}
            >
              {children}
            </blockquote>
          ),
          // Code
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-primary text-xs"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            const language = className?.replace("language-", "") || "";
            return (
              <code className={`language-${language}`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => (
            <pre
              className="my-3 overflow-x-auto rounded-md bg-muted/50 p-4 font-mono text-xs"
              {...props}
            >
              {children}
            </pre>
          ),
          // Links
          a: ({ children, href, ...props }) => (
            <a
              className="text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
              {...props}
            >
              {children}
            </a>
          ),
          // Images
          img: ({ src, alt, ...props }) => (
            <img
              alt={alt || ""}
              className="my-3 max-w-full rounded-md"
              loading="lazy"
              src={src}
              {...props}
            />
          ),
          // Tables
          table: ({ children, ...props }) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="border-b bg-muted/50" {...props}>
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th className="px-3 py-2 text-left font-medium" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border-t px-3 py-2" {...props}>
              {children}
            </td>
          ),
          // Horizontal rule
          hr: (props) => <hr className="my-6 border-border" {...props} />,
          // Strong and emphasis
          strong: ({ children, ...props }) => (
            <strong className="font-semibold" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic" {...props}>
              {children}
            </em>
          ),
          // Strikethrough
          del: ({ children, ...props }) => (
            <del className="text-muted-foreground line-through" {...props}>
              {children}
            </del>
          ),
          // Task list items
          input: ({ type, checked, ...props }) => {
            if (type === "checkbox") {
              return (
                <input
                  checked={checked}
                  className="mr-2 rounded"
                  disabled
                  type="checkbox"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
        }}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
