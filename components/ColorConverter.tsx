import React, { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import { convertCssColors, ColorFormat, COLOR_REGEX } from '../services/colorConverter';
import CodeEditor from './CodeEditor';

const PLACEHOLDER_TEXT = `/* 
  Paste any CSS with colors here.
  The tool will convert them instantly.
*/

:root {
  --md-sys-color-primary: #6750A4;
  --md-sys-color-secondary: #958DA5;
  --md-ref-palette-tertiary50: #7D5260;
  
  /* Other formats work too */
  --accent-rgb: rgb(103, 80, 164);
  --accent-hsl: hsl(200, 80%, 60%);
  --transparent: oklch(59.69% 0.154 292.34 / 50%);
}

.card {
  background-color: var(--md-sys-color-secondary);
  color: #FFFFFF;
}`;

const useDebouncedValue = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const useIsMobile = (breakpoint = '(max-width: 768px)') => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(breakpoint);
    setIsMobile(mediaQuery.matches);
    
    const handleResize = () => setIsMobile(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, [breakpoint]);

  return isMobile;
};


const ToggleSwitch: React.FC<{
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}> = ({ id, checked, onChange, label }) => (
  <label htmlFor={id} className="flex items-center justify-between w-full cursor-pointer">
    <span className="text-sm font-medium text-[#C8C5CA]">{label}</span>
    <div className="relative">
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className={`block w-12 h-6 rounded-full transition-colors ${checked ? 'bg-[#B69DF8]' : 'bg-[#49454F]'}`}></div>
      <div
        className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
          checked ? 'transform translate-x-6' : ''
        }`}
      ></div>
    </div>
  </label>
);

interface TooltipData {
    original?: { color: string };
    converted: { color: string };
    top: number;
    left: number;
}

const ColorTooltip: React.FC<{
    data: TooltipData;
    compareEnabled: boolean;
}> = ({ data, compareEnabled }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({
        opacity: 0, // Start hidden
    });

    useLayoutEffect(() => {
        if (tooltipRef.current) {
            const { innerWidth, innerHeight } = window;
            const { width, height } = tooltipRef.current.getBoundingClientRect();
            const offset = 24; // A nice offset from the cursor

            // Default position: bottom-right of cursor
            let newTop = data.top + offset;
            let newLeft = data.left + offset;

            // Flip to left of cursor if it overflows right edge
            if (newLeft + width > innerWidth) {
                newLeft = data.left - width - offset;
            }

            // Flip to top of cursor if it overflows bottom edge
            if (newTop + height > innerHeight) {
                newTop = data.top - height - offset;
            }

            // Final boundary checks to prevent going off-screen on the top/left
            if (newTop < 0) {
                newTop = offset;
            }
            if (newLeft < 0) {
                newLeft = offset;
            }

            setStyle({
                opacity: 1,
                top: `${newTop}px`,
                left: `${newLeft}px`,
                transform: 'translateZ(0)', // GPU acceleration for smoother animations
                transition: 'opacity 0.1s ease-in',
            });
        }
    }, [data]);

    const showComparison = compareEnabled && data.original && data.original.color !== data.converted.color;

    return (
        <div
            ref={tooltipRef}
            className="fixed z-10 p-3 rounded-xl shadow-xl text-xs flex flex-col gap-2 w-52" // Fixed width
            style={{
                ...style,
                backgroundColor: '#242429', // Consistent dark background
                border: '1px solid #49454F'
            }}
        >
            {showComparison && data.original && (
                <>
                    <div className="flex flex-col items-start gap-1.5">
                        <span className="text-xs text-[#C8C5CA] opacity-80 px-1">Original</span>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-5 h-5 rounded border border-[#938F99]/50 flex-shrink-0"
                                style={{ backgroundColor: data.original.color }}
                            ></div>
                            <span className="font-mono text-sm text-[#E6E1E5] break-all">{data.original.color}</span>
                        </div>
                    </div>
                    <hr className="border-t border-[#938F99]/30 my-1"/>
                </>
            )}
            <div className="flex flex-col items-start gap-1.5">
                {showComparison && <span className="text-xs text-[#C8C5CA] opacity-80 px-1">Converted</span>}
                <div className="flex items-center gap-2">
                    <div
                        className="w-5 h-5 rounded border border-[#938F99]/50 flex-shrink-0"
                        style={{ backgroundColor: data.converted.color }}
                    ></div>
                    <span className="font-mono text-sm text-[#E6E1E5] break-all">{data.converted.color}</span>
                </div>
            </div>
        </div>
    );
};

interface ColorPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: TooltipData | null;
  compareEnabled: boolean;
}

const ColorPreviewDrawer: React.FC<ColorPreviewDrawerProps> = ({ isOpen, onClose, data, compareEnabled }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!data) return null;

    const showComparison = compareEnabled && data.original && data.original.color !== data.converted.color;

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-end ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-modal="true"
            role="dialog"
            aria-hidden={!isOpen}
            onClick={onClose}
            style={{ transition: 'opacity 0.3s ease-in-out' }}
        >
            <div className={`absolute inset-0 bg-black/50 ${isOpen ? 'opacity-100' : 'opacity-0'}`} style={{ transition: 'opacity 0.3s ease-in-out' }} />
            <div
                className="bg-[#2E2E33] border-t border-[#49454F] rounded-t-2xl w-full max-w-lg p-5 pb-8 shadow-xl relative"
                onClick={(e) => e.stopPropagation()}
                style={{
                    transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.3s ease-in-out',
                }}
            >
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#938F99] rounded-full" />
                
                <div className="flex flex-col gap-4 mt-4">
                    {showComparison && data.original && (
                        <>
                            <div className="flex flex-col items-start gap-1.5">
                                <span className="text-xs text-[#C8C5CA] opacity-80 px-1">Original</span>
                                <div className="flex items-center gap-3 w-full">
                                    <div
                                        className="w-8 h-8 rounded-full border border-[#938F99]/50 flex-shrink-0"
                                        style={{ backgroundColor: data.original.color }}
                                    ></div>
                                    <span className="font-mono text-base text-[#E6E1E5] break-all">{data.original.color}</span>
                                </div>
                            </div>
                            <hr className="border-t border-[#938F99]/30 my-1"/>
                        </>
                    )}
                    <div className="flex flex-col items-start gap-1.5">
                        {showComparison && <span className="text-xs text-[#C8C5CA] opacity-80 px-1">Converted</span>}
                        <div className="flex items-center gap-3 w-full">
                            <div
                                className="w-8 h-8 rounded-full border border-[#938F99]/50 flex-shrink-0"
                                style={{ backgroundColor: data.converted.color }}
                            ></div>
                            <span className="font-mono text-base text-[#E6E1E5] break-all">{data.converted.color}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface SettingsPanelProps {
  onBgChange: (color: string) => void;
  currentBg: string;
  outputFormat: ColorFormat;
  onFormatChange: (format: ColorFormat) => void;
  useCssSyntax: boolean;
  onCssSyntaxChange: (checked: boolean) => void;
  showColorPreviews: boolean;
  onShowColorPreviewsChange: (checked: boolean) => void;
  compareOnPreview: boolean;
  onCompareOnPreviewChange: (checked: boolean) => void;
  showLineNumbers: boolean;
  onShowLineNumbersChange: (checked: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
    onBgChange, 
    currentBg,
    outputFormat,
    onFormatChange,
    useCssSyntax,
    onCssSyntaxChange,
    showColorPreviews,
    onShowColorPreviewsChange,
    compareOnPreview,
    onCompareOnPreviewChange,
    showLineNumbers,
    onShowLineNumbersChange,
}) => {
  const bgOptions = [
    { name: 'Dark', color: '#242429' },
    { name: 'Grey', color: '#49454F' },
    { name: 'Light', color: '#E6E1E5' },
    { name: 'White', color: '#FFFFFF' },
  ];
  return (
    <div className="absolute top-full right-0 mt-2 w-60 bg-[#242429] border border-[#49454F] rounded-2xl shadow-xl z-20 p-2 flex flex-col gap-1">
      <div className="p-2">
          <label htmlFor="output-format-settings" className="text-xs text-[#C8C5CA] mb-2 block px-1">Output Format</label>
          <div className="relative">
              <select
                  id="output-format-settings"
                  value={outputFormat}
                  onChange={(e) => onFormatChange(e.target.value as ColorFormat)}
                  className="w-full appearance-none bg-[#36343B] border border-[#938F99] rounded-full pl-4 pr-10 py-2.5 text-sm text-[#E6E1E5] focus:ring-2 focus:ring-[#D0BCFF] focus:outline-none focus:border-[#D0BCFF]"
                  aria-label="Select output color format"
              >
                  <option value="oklch">OKLCH</option>
                  <option value="hex">HEX</option>
                  <option value="rgb">RGB</option>
                  <option value="hsl">HSL</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#C8C5CA]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.144-.446 1.58 0L10 10.405l2.904-2.857c.436-.446 1.144-.446 1.58 0 .436.446.436 1.17 0 1.616l-3.7 3.64c-.436.446-1.144.446-1.58 0l-3.7-3.64c-.436-.446-.436-1.17 0-1.616z"/></svg>
              </div>
          </div>
      </div>
       <div className="px-3 py-2">
          <ToggleSwitch
              id="css-syntax-toggle-settings"
              checked={useCssSyntax}
              onChange={onCssSyntaxChange}
              label="CSS Syntax"
          />
        </div>
        <div className="px-3 py-2">
            <ToggleSwitch
                id="color-preview-toggle-settings"
                checked={showColorPreviews}
                onChange={onShowColorPreviewsChange}
                label="Show Color Previews"
            />
        </div>
         <div className="px-3 py-2">
            <ToggleSwitch
                id="compare-preview-toggle"
                checked={compareOnPreview}
                onChange={onCompareOnPreviewChange}
                label="Compare on Preview"
            />
        </div>
        <div className="px-3 py-2">
            <ToggleSwitch
                id="line-numbers-toggle"
                checked={showLineNumbers}
                onChange={onShowLineNumbersChange}
                label="Show Line Numbers"
            />
        </div>
      <hr className="border-t border-[#49454F] my-1" />
      <div className="p-2">
        <p className="text-xs text-[#C8C5CA] px-1 pt-1 pb-2">Preview Background</p>
        <div className="grid grid-cols-2 gap-2">
            {bgOptions.map(opt => (
                <button
                    key={opt.name}
                    onClick={() => onBgChange(opt.color)}
                    className={`h-10 w-full rounded-lg text-xs border-2 ${currentBg === opt.color ? 'border-[#B69DF8]' : 'border-transparent'}`}
                    style={{ backgroundColor: opt.color }}
                    aria-label={`Set preview background to ${opt.name}`}
                />
            ))}
        </div>
      </div>
    </div>
  )
}

const ColorConverter: React.FC = () => {
  const [inputText, setInputText] = useState<string>(PLACEHOLDER_TEXT);
  const [outputText, setOutputText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<ColorFormat>('oklch');
  const [useCssSyntax, setUseCssSyntax] = useState<boolean>(true);

  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewBg, setPreviewBg] = useState('#49454F');
  const [showColorPreviews, setShowColorPreviews] = useState<boolean>(true);
  const [compareOnPreview, setCompareOnPreview] = useState<boolean>(true);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const inputColors = useMemo(() => inputText.match(COLOR_REGEX) || [], [inputText]);
  const outputColors = useMemo(() => outputText.match(COLOR_REGEX) || [], [outputText]);
  const debouncedInputText = useDebouncedValue(inputText, 200);

  useEffect(() => {
    const convertedText = convertCssColors(debouncedInputText, { format: outputFormat, useCssSyntax });
    setOutputText(convertedText);
  }, [debouncedInputText, outputFormat, useCssSyntax]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
            setIsSettingsOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCopy = useCallback(() => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [outputText]);

  const handleInputColorHover = useCallback((color: string, index: number, event: React.MouseEvent) => {
    if (!showColorPreviews) return;
    setTooltipData({
      converted: { color },
      top: event.clientY,
      left: event.clientX,
    });
  }, [showColorPreviews]);

  const handleOutputColorHover = useCallback((convertedColor: string, index: number, event: React.MouseEvent) => {
    if (!showColorPreviews) return;
    const originalColor = inputColors[index];
    setTooltipData({
      original: originalColor ? { color: originalColor } : undefined,
      converted: { color: convertedColor },
      top: event.clientY,
      left: event.clientX,
    });
  }, [inputColors, showColorPreviews]);

  const handleColorLeave = useCallback(() => {
    setTooltipData(null);
  }, []);

  const handleInputColorClick = useCallback((color: string, index: number) => {
    if (!showColorPreviews) return;
    const convertedColor = outputColors[index];
    setTooltipData({
        original: { color: color },
        converted: { color: convertedColor || "..." },
        top: 0, left: 0
    });
    setIsDrawerOpen(true);
  }, [outputColors, showColorPreviews]);

  const handleOutputColorClick = useCallback((convertedColor: string, index: number) => {
    if (!showColorPreviews) return;
    const originalColor = inputColors[index];
    setTooltipData({
        original: originalColor ? { color: originalColor } : undefined,
        converted: { color: convertedColor },
        top: 0, left: 0
    });
    setIsDrawerOpen(true);
  }, [inputColors, showColorPreviews]);
  
  return (
    <div className="flex flex-col gap-12">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold text-[#E6E1E5]">
              Material Color Tool
            </h1>
            <p className="mt-4 text-lg text-[#C8C5CA]">
               A utility to convert CSS colors between formats.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
              <div className="relative" ref={settingsRef}>
                  <button
                      onClick={() => setIsSettingsOpen(prev => !prev)}
                      className="p-2.5 rounded-full hover:bg-[#36343B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#242429] focus:ring-[#D0BCFF]"
                      aria-label="Open settings"
                  >
                      <svg className="w-6 h-6 text-[#C8C5CA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                  {isSettingsOpen && <SettingsPanel 
                    currentBg={previewBg} 
                    onBgChange={(color) => { setPreviewBg(color); setIsSettingsOpen(false); }} 
                    outputFormat={outputFormat}
                    onFormatChange={setOutputFormat}
                    useCssSyntax={useCssSyntax}
                    onCssSyntaxChange={setUseCssSyntax}
                    showColorPreviews={showColorPreviews}
                    onShowColorPreviewsChange={setShowColorPreviews}
                    compareOnPreview={compareOnPreview}
                    onCompareOnPreviewChange={setCompareOnPreview}
                    showLineNumbers={showLineNumbers}
                    onShowLineNumbersChange={setShowLineNumbers}
                    />}
              </div>
              <button
                  onClick={handleCopy}
                  className="px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 bg-[#B69DF8] text-[#381E72] hover:bg-[#C0A8FA] focus:outline-none focus:ring-4 focus:ring-[#D0BCFF]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600"
                  disabled={!outputText}
              >
                  {isCopied ? 'Copied!' : 'Copy Output'}
              </button>
          </div>
        </header>

        {/* IO Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div className="flex flex-col min-h-0 min-w-0">
                <h2 className="text-sm font-medium mb-3 text-[#C8C5CA] px-2">Input</h2>
                <div className="bg-[#242429] border border-[#49454F] rounded-3xl p-1 flex flex-col min-h-[400px] sm:min-h-[500px] overflow-hidden flex-grow">
                    <CodeEditor
                        id="input-css"
                        value={inputText}
                        onValueChange={setInputText}
                        onColorHover={!isMobile ? handleInputColorHover : undefined}
                        onColorLeave={!isMobile ? handleColorLeave : undefined}
                        onColorClick={isMobile ? handleInputColorClick : undefined}
                        ariaLabel="CSS Input"
                        previewsEnabled={showColorPreviews}
                        highlightingEnabled={false}
                        showLineNumbers={showLineNumbers}
                    />
                </div>
            </div>

            <div className="flex flex-col min-h-0 min-w-0">
                 <h2 className="text-sm font-medium mb-3 text-[#C8C5CA] px-2">Output</h2>
                 <div className="bg-[#242429] border border-[#49454F] rounded-3xl p-1 flex flex-col min-h-[400px] sm:min-h-[500px] overflow-hidden flex-grow">
                    <CodeEditor
                        id="output-css"
                        value={outputText}
                        readOnly
                        onColorHover={!isMobile ? handleOutputColorHover : undefined}
                        onColorLeave={!isMobile ? handleColorLeave : undefined}
                        onColorClick={isMobile ? handleOutputColorClick : undefined}
                        ariaLabel="Converted CSS Output"
                        previewsEnabled={showColorPreviews}
                        showLineNumbers={showLineNumbers}
                    />
                </div>
            </div>
        </div>
        {!isMobile && showColorPreviews && tooltipData && <ColorTooltip data={tooltipData} compareEnabled={compareOnPreview} />}
        {isMobile && <ColorPreviewDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} data={tooltipData} compareEnabled={compareOnPreview} />}
    </div>
  );
};

export default ColorConverter;