"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { Button } from "./button";

interface JsonViewerProps {
  data: any;
  maxHeight?: string;
  className?: string;
}

interface JsonNodeProps {
  data: any;
  keyName?: string;
  depth?: number;
  isLast?: boolean;
  isRoot?: boolean;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ 
  data, 
  maxHeight = "300px", 
  className = "" 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      let textToCopy: string;
      
      if (typeof data === 'string') {
        // If data is already a string, try to parse and re-stringify for formatting
        try {
          const parsed = JSON.parse(data);
          textToCopy = JSON.stringify(parsed, null, 2);
        } catch {
          // If parsing fails, use the string as-is
          textToCopy = data;
        }
      } else {
        // If data is an object, stringify it
        textToCopy = JSON.stringify(data, null, 2);
      }
      
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 w-6 p-0 hover:bg-gray-100"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 text-gray-500" />
          )}
        </Button>
      </div>
      <div 
        className="bg-gray-50 rounded-lg p-3 overflow-auto border font-mono text-sm"
        style={{ maxHeight }}
      >
        <JsonNode data={data} isRoot={true} />
      </div>
    </div>
  );
};

const JsonNode: React.FC<JsonNodeProps> = ({ 
  data, 
  keyName, 
  depth = 0, 
  isLast = true, 
  isRoot = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  const getValueColor = (value: any) => {
    if (value === null) return "text-gray-500";
    if (typeof value === "string") return "text-green-600";
    if (typeof value === "number") return "text-blue-600";
    if (typeof value === "boolean") return "text-purple-600";
    return "text-gray-800";
  };

  const getValueDisplay = (value: any) => {
    if (value === null) return "null";
    if (typeof value === "string") return `"${value}"`;
    if (typeof value === "boolean") return value.toString();
    return value;
  };

  const isExpandable = (value: any) => {
    return (typeof value === "object" && value !== null) && 
           (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0);
  };

  const getPreview = (value: any) => {
    if (Array.isArray(value)) {
      return value.length === 0 ? "[]" : `[${value.length} items]`;
    }
    if (typeof value === "object" && value !== null) {
      const keys = Object.keys(value);
      return keys.length === 0 ? "{}" : `{${keys.length} properties}`;
    }
    return "";
  };

  const indent = "  ".repeat(depth);

  if (!isExpandable(data)) {
    return (
      <div className="flex items-start">
        <span className="text-gray-400">{indent}</span>
        {keyName && (
          <>
            <span className="text-gray-800 font-medium">"{keyName}"</span>
            <span className="text-gray-500 mx-1">:</span>
          </>
        )}
        <span className={getValueColor(data)}>
          {getValueDisplay(data)}
        </span>
        {!isLast && <span className="text-gray-500">,</span>}
      </div>
    );
  }

  const isArray = Array.isArray(data);
  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";
  const entries = isArray 
    ? data.map((item, index) => [index.toString(), item])
    : Object.entries(data);

  return (
    <div>
      <div className="flex items-start">
        <span className="text-gray-400">{indent}</span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center hover:bg-gray-100 rounded px-1 -ml-1"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-gray-500" />
          ) : (
            <ChevronRight className="h-3 w-3 text-gray-500" />
          )}
        </button>
        {keyName && (
          <>
            <span className="text-gray-800 font-medium">"{keyName}"</span>
            <span className="text-gray-500 mx-1">:</span>
          </>
        )}
        <span className="text-gray-500">{openBracket}</span>
        {!isExpanded && (
          <>
            <span className="text-gray-400 text-xs ml-1">
              {getPreview(data)}
            </span>
            <span className="text-gray-500">{closeBracket}</span>
          </>
        )}
        {!isLast && <span className="text-gray-500">,</span>}
      </div>

      {isExpanded && (
        <>
          {entries.map(([key, value], index) => (
            <JsonNode
              key={key}
              data={value}
              keyName={isArray ? undefined : key}
              depth={depth + 1}
              isLast={index === entries.length - 1}
            />
          ))}
          <div className="flex items-start">
            <span className="text-gray-400">{indent}</span>
            <span className="text-gray-500">{closeBracket}</span>
            {!isLast && <span className="text-gray-500">,</span>}
          </div>
        </>
      )}
    </div>
  );
};

export default JsonViewer; 