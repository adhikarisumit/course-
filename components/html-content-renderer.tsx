"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import CodeBlock from "@/components/code-block";
import { InArticleAd, HtmlAd } from "@/components/ads";

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

      // Check if this is an ad placeholder
      if (element.classList.contains("ad-placeholder")) {
        const adType = element.getAttribute("data-ad-type");
        const adCodeEncoded = element.getAttribute("data-ad-code");
        
        if (adType === "custom" && adCodeEncoded) {
          // Custom ad code
          const adCode = decodeURIComponent(adCodeEncoded);
          elements.push(
            <div key={elementKey++} className="my-1">
              <HtmlAd code={adCode} />
            </div>
          );
        } else {
          // Default global ad
          elements.push(
            <div key={elementKey++} className="my-1">
              <InArticleAd />
            </div>
          );
        }
        return;
      }

      // Check if this is a pre element with code
      if (element.tagName === "PRE") {
        const codeElement = element.querySelector("code");
        if (codeElement) {
          const language = extractLanguage(codeElement, element);
          // Get text content and decode any HTML entities
          const codeText = codeElement.textContent || "";
          
          elements.push(
            <CodeBlock
              key={elementKey++}
              code={codeText}
              language={language}
              showLanguageSelector={true}
              className="my-3 sm:my-4"
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
  const proseClasses = `prose prose-sm sm:prose dark:prose-invert max-w-none overflow-hidden break-words
    [&_*]:max-w-full
    [&_p[style]]:leading-[unset] [&_li[style]]:leading-[unset] 
    [&_h1[style]]:leading-[unset] [&_h2[style]]:leading-[unset] [&_h3[style]]:leading-[unset]
    [&_h4[style]]:leading-[unset] [&_h5[style]]:leading-[unset] [&_h6[style]]:leading-[unset]
    [&_div[style]]:leading-[unset] [&_span[style]]:leading-[unset]
    [&_hr]:my-6 [&_hr]:border-border
    [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:sm:pl-6 [&_ul]:my-3 [&_ul]:sm:my-4 [&_ul]:max-w-full
    [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:sm:pl-6 [&_ol]:my-3 [&_ol]:sm:my-4 [&_ol]:max-w-full
    [&_li]:my-1 [&_li]:pl-0.5 [&_li]:sm:pl-1
    [&_p]:my-2 [&_p]:sm:my-3 [&_p]:break-words [&_p]:overflow-hidden
    [&_h1]:text-xl [&_h1]:sm:text-2xl [&_h1]:md:text-3xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:sm:mt-6 [&_h1]:mb-3 [&_h1]:sm:mb-4 [&_h1]:break-words
    [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:md:text-2xl [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:sm:mt-5 [&_h2]:mb-2 [&_h2]:sm:mb-3 [&_h2]:break-words
    [&_h3]:text-base [&_h3]:sm:text-lg [&_h3]:md:text-xl [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:sm:mt-4 [&_h3]:mb-2 [&_h3]:break-words
    [&_h4]:text-sm [&_h4]:sm:text-base [&_h4]:md:text-lg [&_h4]:font-medium [&_h4]:mt-2 [&_h4]:sm:mt-3 [&_h4]:mb-1 [&_h4]:sm:mb-2
    [&_h5]:text-sm [&_h5]:sm:text-base [&_h5]:font-medium [&_h5]:mt-2 [&_h5]:mb-1
    [&_h6]:text-xs [&_h6]:sm:text-sm [&_h6]:font-medium [&_h6]:mt-2 [&_h6]:mb-1
    [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_pre]:text-xs [&_pre]:sm:text-sm [&_pre]:!whitespace-pre-wrap
    [&_code]:text-xs [&_code]:sm:text-sm [&_code]:break-all [&_code]:whitespace-pre-wrap
    [&_table]:text-xs [&_table]:sm:text-sm [&_table]:block [&_table]:overflow-x-auto [&_table]:max-w-full [&_table]:w-full
    [&_img]:max-w-full [&_img]:h-auto
    [&_a]:break-all
    [&_span]:break-words
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
      <div className={proseClasses} style={{ maxWidth: '100%', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
        <div dangerouslySetInnerHTML={{ __html: content }} style={{ maxWidth: '100%' }} />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={proseClasses}
      style={{ maxWidth: '100%', overflowWrap: 'break-word', wordBreak: 'break-word' }}
    >
      {processedElements}
    </div>
  );
}
