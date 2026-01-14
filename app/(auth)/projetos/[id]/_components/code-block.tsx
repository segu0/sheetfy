"use client";

import type { BundledLanguage } from "@/components/ui/shadcn-io/code-block";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
  CodeBlockSelect,
  CodeBlockSelectContent,
  CodeBlockSelectItem,
  CodeBlockSelectTrigger,
  CodeBlockSelectValue,
} from "@/components/ui/shadcn-io/code-block";

export type CodeSnippet = {
  language: BundledLanguage | string;
  filename: string;
  code: string;
};

interface CodeExampleProps {
  snippets: CodeSnippet[];
}

export function CodeExample({ snippets }: CodeExampleProps) {
  const defaultLanguage = snippets[0]?.language ?? "tsx";

  return (
    <CodeBlock data={snippets} defaultValue={defaultLanguage} className="font-semibold">
      <CodeBlockHeader>
        <CodeBlockFiles>
          {(item) => (
            <CodeBlockFilename key={item.language} value={item.language}>
              {item.filename}
            </CodeBlockFilename>
          )}
        </CodeBlockFiles>
        <CodeBlockSelect>
          <CodeBlockSelectTrigger>
            <CodeBlockSelectValue />
          </CodeBlockSelectTrigger>
          <CodeBlockSelectContent className="overflow-scroll">
            {(item) => (
              <CodeBlockSelectItem key={item.language} value={item.language}>
                {item.language}
              </CodeBlockSelectItem>
            )}
          </CodeBlockSelectContent>
        </CodeBlockSelect>
        <CodeBlockCopyButton
          onCopy={() => console.log("Copied code to clipboard")}
          onError={() => console.error("Failed to copy code to clipboard")}
        />
      </CodeBlockHeader>
      <CodeBlockBody className="overflow-x-auto">
        {(item) => (
          <CodeBlockItem
            key={item.language}
            value={item.language}
            className="overflow-x-auto bg-gray-50/50"
          >
            <CodeBlockContent
              language={item.language as BundledLanguage}
              className="overflow-x-auto whitespace-pre"
            >
              {item.code}
            </CodeBlockContent>
          </CodeBlockItem>
        )}
      </CodeBlockBody>
    </CodeBlock>
  );
}
