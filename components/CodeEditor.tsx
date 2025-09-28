import React, { useRef, useMemo, useCallback } from 'react';
import { COLOR_REGEX } from '../services/colorConverter';

interface CodeEditorProps {
  value: string;
  onValueChange?: (value: string) => void;
  readOnly?: boolean;
  onColorHover: (color: string, event: React.MouseEvent) => void;
  onColorLeave: () => void;
  id: string;
  ariaLabel: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onValueChange,
  readOnly = false,
  onColorHover,
  onColorLeave,
  id,
  ariaLabel,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const hoveredWordRef = useRef<string | null>(null);
  const throttleTimer = useRef<number | null>(null);

  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lineCount = useMemo(() => {
    const count = value.split('\n').length;
    return Math.max(1, count); // Ensure at least one line number
  }, [value]);

  const lineNumbers = useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');
  }, [lineCount]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (throttleTimer.current) return;

    throttleTimer.current = window.setTimeout(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Approximate character position from mouse coordinates
        const rect = textarea.getBoundingClientRect();
        // Consistent with Tailwind's text-sm (14px) and leading-6 (24px)
        const lineHeight = 24; 
        const charWidth = 8.4; // Approximation for 14px mono font

        const scrollTop = textarea.scrollTop;
        const y = e.clientY - rect.top + scrollTop;
        const lineIndex = Math.floor(y / lineHeight);

        const lines = value.split('\n');
        if (lineIndex < 0 || lineIndex >= lines.length) {
            if (hoveredWordRef.current) {
                hoveredWordRef.current = null;
                onColorLeave();
            }
            throttleTimer.current = null;
            return;
        }
        
        const line = lines[lineIndex];
        const scrollLeft = textarea.scrollLeft;
        const x = e.clientX - rect.left + scrollLeft - 2; // Minor adjustment for padding/cursor
        const colIndex = Math.max(0, Math.round(x / charWidth));

        // Find word boundaries around the calculated column index
        const match = line.substring(0, colIndex + 1).match(/[\w#.()-]+$/);
        if (!match) {
            if (hoveredWordRef.current) {
                hoveredWordRef.current = null;
                onColorLeave();
            }
            throttleTimer.current = null;
            return;
        }

        const prefix = match[0];
        const suffixMatch = line.substring(match.index! + prefix.length).match(/^[\w#.()%/-]+/);
        const word = prefix + (suffixMatch ? suffixMatch[0] : '');
        
        COLOR_REGEX.lastIndex = 0; // Reset regex state before test
        if (word && COLOR_REGEX.test(word)) {
            if (hoveredWordRef.current !== word) {
                hoveredWordRef.current = word;
                onColorHover(word, e);
            }
        } else {
            if (hoveredWordRef.current) {
                hoveredWordRef.current = null;
                onColorLeave();
            }
        }
        throttleTimer.current = null;
    }, 50);
  }, [value, onColorHover, onColorLeave]);

  const handleMouseLeave = useCallback(() => {
      if (hoveredWordRef.current) {
        hoveredWordRef.current = null;
        onColorLeave();
      }
      if (throttleTimer.current) {
          clearTimeout(throttleTimer.current);
          throttleTimer.current = null;
      }
  }, [onColorLeave]);

  return (
    <div className="relative flex-grow flex h-full overflow-hidden">
      <div
        ref={lineNumbersRef}
        className="line-numbers text-right pl-4 pr-3 pt-4 text-[#938F99] font-mono text-sm select-none overflow-y-hidden bg-[#1B1B1F]"
        aria-hidden="true"
        style={{ lineHeight: '1.5rem' }}
      >
        <pre className="m-0">{lineNumbers}</pre>
      </div>
      <textarea
        id={id}
        ref={textareaRef}
        value={value}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}
        onScroll={handleScroll}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        readOnly={readOnly}
        className="flex-grow bg-[#1B1B1F] p-4 font-mono text-sm text-[#C8C5CA] focus:ring-2 focus:ring-[#D0BCFF] focus:outline-none resize-none h-full rounded-r-2xl"
        style={{ lineHeight: '1.5rem' }}
        aria-label={ariaLabel}
        spellCheck="false"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
      />
    </div>
  );
};

export default CodeEditor;
