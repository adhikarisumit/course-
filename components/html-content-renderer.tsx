"use client";

import React, { useState, useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface CodeBlockWithCopyProps {
  code: string;
  language: string;
}

function CodeBlockWithCopy({ code, language }: CodeBlockWithCopyProps) {
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Map common language names to prism language identifiers
  const languageMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    rb: "ruby",
    yml: "yaml",
    sh: "bash",
    shell: "bash",
    plaintext: "text",
  };

  const normalizedLanguage = languageMap[language?.toLowerCase()] || language?.toLowerCase() || "text";

  return (
    <div className="relative group my-4">
      <div className="absolute right-2 top-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          className="h-8 w-8 bg-gray-800/50 hover:bg-gray-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <div className="absolute left-2 top-2 z-10">
        <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
          {language || "code"}
        </span>
      </div>
      <SyntaxHighlighter
        language={normalizedLanguage}
        style={resolvedTheme === "dark" ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
          paddingTop: "2.5rem",
          fontSize: "0.875rem",
          lineHeight: "1.5",
        }}
        showLineNumbers={code.split("\n").length > 3}
        wrapLines={true}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

interface HtmlContentRendererProps {
  content: string;
  className?: string;
}

export function HtmlContentRenderer({ content, className = "" }: HtmlContentRendererProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [processedElements, setProcessedElements] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !content) {
      setProcessedElements([]);
      return;
    }

    // Debug: log the raw content to see what TipTap outputs
    console.log("HtmlContentRenderer - Raw content:", content);

    // Parse HTML and extract code blocks
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const elements: React.ReactNode[] = [];
    let elementKey = 0;

    // Function to extract language from various attributes
    const extractLanguage = (codeElement: Element, preElement: Element): string => {
      // Check code element class for language-xxx
      const codeClass = codeElement.className || "";
      const langFromCodeClass = codeClass.match(/language-(\S+)/)?.[1];
      if (langFromCodeClass) return langFromCodeClass;

      // Check pre element class for language-xxx
      const preClass = preElement.className || "";
      const langFromPreClass = preClass.match(/language-(\S+)/)?.[1];
      if (langFromPreClass) return langFromPreClass;

      // Check data-language attribute
      const dataLang = codeElement.getAttribute("data-language") || preElement.getAttribute("data-language");
      if (dataLang) return dataLang;

      // Check hljs class (like hljs-javascript)
      const hljsMatch = codeClass.match(/hljs-?(\S+)/)?.[1];
      if (hljsMatch) return hljsMatch;

      return "text";
    };

    // Process each child node
    const processNode = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          elements.push(<span key={elementKey++}>{node.textContent}</span>);
        }
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const element = node as Element;

      // Check if this is a pre element with code
      if (element.tagName === "PRE") {
        const codeElement = element.querySelector("code");
        if (codeElement) {
          const language = extractLanguage(codeElement, element);
          // Get text content and decode any HTML entities
          const codeText = codeElement.textContent || "";
          
          elements.push(
            <CodeBlockWithCopy
              key={elementKey++}
              code={codeText}
              language={language}
            />
          );
          return;
        }
      }

      // For all other elements, render as HTML without wrapping in div
      // This preserves proper prose styling for lists, paragraphs, etc.
      const tagName = element.tagName.toLowerCase();
      
      // Void elements cannot have children or dangerouslySetInnerHTML
      const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
      const isVoidElement = voidElements.includes(tagName);
      
      // Build props from attributes
      const props: Record<string, unknown> = {
        key: elementKey++,
      };
      
      // Add attributes
      Array.from(element.attributes).forEach(attr => {
        if (attr.name === 'class') {
          props.className = attr.value;
        } else if (attr.name === 'style') {
          // Convert style string to React style object
          const styleObj: Record<string, string> = {};
          attr.value.split(';').forEach(rule => {
            const [prop, val] = rule.split(':').map(s => s.trim());
            if (prop && val) {
              // Convert CSS property to camelCase
              const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
              styleObj[camelProp] = val;
            }
          });
          props.style = styleObj;
        } else if (attr.name === 'for') {
          props.htmlFor = attr.value;
        } else {
          props[attr.name] = attr.value;
        }
      });
      
      // Only add innerHTML for non-void elements
      if (!isVoidElement && element.innerHTML) {
        props.dangerouslySetInnerHTML = { __html: element.innerHTML };
      }
      
      elements.push(React.createElement(tagName, props));
    };

    // Process all children of the body
    const body = doc.body;
    body.childNodes.forEach(processNode);

    setProcessedElements(elements);
  }, [content, mounted]);

  // Define prose classes with inline style support and proper list styling
  const proseClasses = `prose prose-sm sm:prose dark:prose-invert max-w-none 
    [&_p[style]]:leading-[unset] [&_li[style]]:leading-[unset] 
    [&_h1[style]]:leading-[unset] [&_h2[style]]:leading-[unset] [&_h3[style]]:leading-[unset]
    [&_h4[style]]:leading-[unset] [&_h5[style]]:leading-[unset] [&_h6[style]]:leading-[unset]
    [&_div[style]]:leading-[unset] [&_span[style]]:leading-[unset]
    [&_hr]:my-6 [&_hr]:border-border
    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4
    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4
    [&_li]:my-1 [&_li]:pl-1
    [&_p]:my-3
    ${className}`;

  if (!mounted) {
    // Return a simple placeholder during SSR
    return (
      <div className={proseClasses}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }

  if (processedElements.length === 0 && content) {
    // Fallback: render raw HTML if parsing produced no elements
    return (
      <div className={proseClasses}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={proseClasses}
    >
      {processedElements}
    </div>
  );
}
