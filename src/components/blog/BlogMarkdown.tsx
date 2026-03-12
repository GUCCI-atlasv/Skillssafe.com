"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-8 mb-4 text-3xl font-extrabold tracking-tight text-white">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 mb-4 text-xl font-bold text-white border-b border-gray-800 pb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-3 text-lg font-semibold text-gray-100">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-7 text-gray-300">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 ml-4 space-y-1.5 list-disc list-outside text-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-4 space-y-1.5 list-decimal list-outside text-gray-300">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-7 pl-1">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-green-400 hover:text-green-300 underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-300">{children}</em>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      const lang = className?.replace("language-", "") ?? "";
      return (
        <div className="my-4 rounded-lg border border-gray-700 bg-gray-900 overflow-hidden">
          {lang && (
            <div className="px-4 py-1.5 text-xs text-gray-500 border-b border-gray-700 bg-gray-800/50 font-mono">
              {lang}
            </div>
          )}
          <pre className="overflow-x-auto p-4">
            <code className="text-sm font-mono text-gray-200 leading-6">
              {children}
            </code>
          </pre>
        </div>
      );
    }
    return (
      <code className="rounded bg-gray-800 px-1.5 py-0.5 text-sm font-mono text-green-300 border border-gray-700">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-gray-700">
      <table className="w-full text-sm text-left">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-800 text-gray-300">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-gray-800">{children}</tbody>
  ),
  tr: ({ children }) => <tr className="hover:bg-gray-800/50 transition-colors">{children}</tr>,
  th: ({ children }) => (
    <th className="px-4 py-3 font-semibold text-gray-200">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-gray-400">{children}</td>
  ),
  hr: () => <hr className="my-8 border-gray-800" />,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-green-500/50 pl-4 text-gray-400 italic">
      {children}
    </blockquote>
  ),
};

type BlogMarkdownProps = {
  content: string;
};

export default function BlogMarkdown({ content }: BlogMarkdownProps) {
  return (
    <div className="min-w-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
