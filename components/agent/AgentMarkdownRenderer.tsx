"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink, Users, Coins, Link2 } from "lucide-react";
import { Components } from "react-markdown";

interface AgentMarkdownRendererProps {
  content: string;
}

/**
 * Enhanced Markdown Renderer for Agent Chat
 *
 * Provides elegant styling for agent citations including:
 * - Styled links with hover effects
 * - Code blocks with syntax highlighting
 * - Lists and emphasis
 * - Special formatting for citation patterns
 */
export default function AgentMarkdownRenderer({
  content,
}: AgentMarkdownRendererProps) {
  const components: Components = {
    // Enhanced link styling for citations
    a: ({ node, children, href, ...props }) => {
      const isBlockscout = href?.includes("blockscout.com");

      if (isBlockscout) {
        // Blockscout transaction links - styled distinctly
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium hover:underline transition-colors group border-b border-purple-300"
            {...props}
          >
            <Link2 className="w-3 h-3" />
            {children}
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        );
      }

      // Regular content links
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors group"
          {...props}
        >
          {children}
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      );
    },

    // Styled paragraphs with proper spacing
    p: ({ node, children, ...props }) => {
      const text = String(children);

      // Check if this is a "Supported by" line (on-chain significance)
      if (text.match(/Supported by \d+ members/i) || text.match(/\d+% match/i)) {
        return (
          <p className="text-xs text-gray-600 flex items-center gap-2 mt-1 mb-2" {...props}>
            {text.includes("members") && <Users className="w-3 h-3" />}
            {text.includes("tokens") && <Coins className="w-3 h-3" />}
            {children}
          </p>
        );
      }

      // Check if this is a comment insight line
      if (text.match(/Top comment|Key comment|Comment pattern/i)) {
        return (
          <p className="text-xs text-gray-700 bg-amber-50 border-l-2 border-amber-400 pl-3 py-1 my-2 italic" {...props}>
            {children}
          </p>
        );
      }

      // Check if this is a data/metrics line
      if (text.match(/\d+ supporters|tokens staked|\d+ matches/i)) {
        return (
          <p className="text-sm font-medium text-gray-800 mb-2" {...props}>
            {children}
          </p>
        );
      }

      return (
        <p className="mb-3 leading-relaxed text-sm" {...props}>
          {children}
        </p>
      );
    },

    // Styled emphasis for titles and important text
    strong: ({ node, children, ...props }) => (
      <strong className="font-semibold text-gray-900" {...props}>
        {children}
      </strong>
    ),

    // Italic text
    em: ({ node, children, ...props }) => (
      <em className="italic text-gray-700" {...props}>
        {children}
      </em>
    ),

    // Ordered lists with custom styling
    ol: ({ node, children, ...props }) => (
      <ol className="space-y-4 mb-4 ml-1" {...props}>
        {children}
      </ol>
    ),

    // List items with citation-friendly styling
    li: ({ node, children, ...props }) => {
      return (
        <li className="relative pl-1 border-l-2 border-blue-200 hover:border-blue-400 transition-colors" {...props}>
          <div className="pl-4 pr-2 py-2 hover:bg-blue-50/50 rounded-r transition-colors">
            {children}
          </div>
        </li>
      );
    },

    // Unordered lists
    ul: ({ node, children, ...props }) => (
      <ul className="space-y-2 mb-4 ml-4 list-disc marker:text-blue-500" {...props}>
        {children}
      </ul>
    ),

    // Code blocks with syntax highlighting
    code: ({ node, className, children, ...props }) => {
      // Check if it's inline code by checking if className exists (block code has className)
      const isInline = !className;
      if (isInline) {
        return (
          <code
            className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <code
          className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-3"
          {...props}
        >
          {children}
        </code>
      );
    },

    // Styled blockquotes
    blockquote: ({ node, children, ...props }) => (
      <blockquote
        className="border-l-4 border-blue-400 pl-4 py-2 my-3 italic text-gray-700 bg-blue-50/30"
        {...props}
      >
        {children}
      </blockquote>
    ),

    // Headings with proper hierarchy
    h1: ({ node, children, ...props }) => (
      <h1 className="text-xl font-bold mb-3 mt-4 text-gray-900" {...props}>
        {children}
      </h1>
    ),

    h2: ({ node, children, ...props }) => (
      <h2 className="text-lg font-semibold mb-2 mt-3 text-gray-900" {...props}>
        {children}
      </h2>
    ),

    h3: ({ node, children, ...props }) => (
      <h3 className="text-base font-semibold mb-2 mt-2 text-gray-900" {...props}>
        {children}
      </h3>
    ),

    // Horizontal rule
    hr: ({ node, ...props }) => (
      <hr className="my-4 border-gray-300" {...props} />
    ),

    // Tables
    table: ({ node, children, ...props }) => (
      <div className="overflow-x-auto my-3">
        <table className="min-w-full border border-gray-300" {...props}>
          {children}
        </table>
      </div>
    ),

    thead: ({ node, children, ...props }) => (
      <thead className="bg-gray-100" {...props}>
        {children}
      </thead>
    ),

    tbody: ({ node, children, ...props }) => (
      <tbody className="divide-y divide-gray-200" {...props}>
        {children}
      </tbody>
    ),

    tr: ({ node, children, ...props }) => (
      <tr className="hover:bg-gray-50" {...props}>
        {children}
      </tr>
    ),

    th: ({ node, children, ...props }) => (
      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700" {...props}>
        {children}
      </th>
    ),

    td: ({ node, children, ...props }) => (
      <td className="px-3 py-2 text-sm" {...props}>
        {children}
      </td>
    ),
  };

  return (
    <div className="text-sm text-gray-800 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
