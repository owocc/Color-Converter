import React, { useRef, useMemo } from 'react';
import { COLOR_REGEX } from '../services/colorConverter';

interface CodeEditorProps {
  value: string;
  onValueChange?: (value: string) => void;
  readOnly?: boolean;
  onColorHover: (color: string, index: number, event: React.MouseEvent) => void;
  onColorLeave: () => void;
  id: string;
  ariaLabel: string;
  previewsEnabled: boolean;
  highlightingEnabled?: boolean;
  showLineNumbers: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onValueChange,
  readOnly = false,
  onColorHover,
  onColorLeave,
  id,
  ariaLabel,
  previewsEnabled,
  highlightingEnabled = true,
  showLineNumbers,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement | HTMLPreElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
    // Sync highlight layer from textarea scroll, if it exists
    if (!readOnly && highlightRef.current) { 
        highlightRef.current.scrollTop = scrollTop;
        highlightRef.current.scrollLeft = scrollLeft;
    }
  };
  
  const highlightContent = useMemo(() => {
    if (!value) return null;
    if (!highlightingEnabled) {
      return value;
    }

    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let colorIndex = 0;
    const matches = value.matchAll(COLOR_REGEX);

    for (const match of matches) {
        const color = match[0];
        const index = match.index!;
        const currentIndex = colorIndex;

        if (index > lastIndex) {
            parts.push(value.substring(lastIndex, index));
        }

        parts.push(
            <span
                key={`${index}-${color}`}
                className="color-token"
                onMouseEnter={previewsEnabled ? (e) => onColorHover(color, currentIndex, e) : undefined}
                onMouseLeave={previewsEnabled ? onColorLeave : undefined}
                style={{
                    backgroundColor: 'rgba(208, 188, 255, 0.08)',
                    borderRadius: '3px',
                    cursor: previewsEnabled ? 'pointer' : 'default',
                    padding: '1px 2px',
                    margin: '-1px -2px',
                }}
            >
                {color}
            </span>
        );
        lastIndex = index + color.length;
        colorIndex++;
    }

    if (lastIndex < value.length) {
        parts.push(value.substring(lastIndex));
    }

    return parts;
  }, [value, onColorHover, onColorLeave, previewsEnabled, highlightingEnabled]);

  const lineCount = useMemo(() => {
    const count = value.split('\n').length;
    return Math.max(1, count);
  }, [value]);

  const lineNumbers = useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');
  }, [lineCount]);

  const sharedStyles: React.CSSProperties = {
    lineHeight: '1.5rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    padding: '1rem',
    whiteSpace: 'pre',
    wordBreak: 'keep-all',
    overflowWrap: 'normal'
  };
  
  const isSimpleInput = !readOnly && !highlightingEnabled;

  return (
    <div className="relative flex-grow flex h-full overflow-hidden">
      {showLineNumbers && (
        <div
            ref={lineNumbersRef}
            className="line-numbers text-right pl-4 pr-3 pt-4 text-[#938F99] font-mono text-sm select-none overflow-y-hidden bg-[#242429] flex-shrink-0 w-16"
            aria-hidden="true"
            style={{ lineHeight: '1.5rem' }}
        >
            <pre className="m-0">{lineNumbers}</pre>
        </div>
      )}
      
      {isSimpleInput ? (
          <textarea
            id={id}
            ref={textareaRef}
            value={value}
            onChange={(e) => onValueChange && onValueChange(e.target.value)}
            onScroll={handleScroll}
            className="flex-grow w-full h-full resize-none bg-transparent text-[#C8C5CA] caret-[#E6E1E5] focus:outline-none"
            style={sharedStyles}
            aria-label={ariaLabel}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
        />
      ) : (
        <div className="relative flex-grow h-full">
            {!readOnly && (
                <textarea
                    id={id}
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onValueChange && onValueChange(e.target.value)}
                    onScroll={handleScroll}
                    className="absolute inset-0 w-full h-full resize-none z-10 bg-transparent text-transparent caret-[#E6E1E5] focus:outline-none"
                    style={sharedStyles}
                    aria-label={ariaLabel}
                    spellCheck="false"
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                />
            )}
            <pre
              ref={highlightRef}
              className={`w-full h-full m-0 z-0 text-[#C8C5CA] ${readOnly ? 'overflow-auto' : 'overflow-hidden pointer-events-none'}`}
              style={sharedStyles}
              onScroll={readOnly ? handleScroll : undefined}
              aria-hidden="true"
            >
              <code className={readOnly ? 'pointer-events-auto' : ''}>
                {highlightContent}
              </code>
            </pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;