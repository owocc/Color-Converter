import React, { useState, useEffect, useCallback, useRef } from 'react';
import { convertCssColors, ColorFormat } from '../services/colorConverter';
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

const ToggleSwitch: React.FC<{
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}> = ({ id, checked, onChange, label }) => (
  <label htmlFor={id} className="flex items-center cursor-pointer">
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
    <div className="ml-3 text-sm font-medium text-[#C8C5CA]">{label}</div>
  </label>
);

const ColorTooltip: React.FC<{
    data: { color: string; top: number; left: number };
    bg: string;
}> = ({ data, bg }) => (
    <div
        className="fixed z-10 p-2 rounded-lg shadow-lg text-xs"
        style={{
            top: `${data.top}px`,
            left: `${data.left}px`,
            backgroundColor: bg,
            border: '1px solid #49454F'
        }}
    >
        <div className="flex items-center gap-2">
            <div
                className="w-5 h-5 rounded border border-[#938F99]/50"
                style={{ backgroundColor: data.color }}
            ></div>
            <span className="font-mono text-[#E6E1E5]">{data.color}</span>
        </div>
    </div>
);

const SettingsPanel: React.FC<{
  onBgChange: (color: string) => void;
  currentBg: string;
}> = ({ onBgChange, currentBg }) => {
  const bgOptions = [
    { name: 'Dark', color: '#242429' },
    { name: 'Grey', color: '#49454F' },
    { name: 'Light', color: '#E6E1E5' },
    { name: 'White', color: '#FFFFFF' },
  ];
  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-[#242429] border border-[#49454F] rounded-2xl shadow-xl z-20 p-2">
        <p className="text-xs text-[#C8C5CA] px-2 pt-1 pb-2">Preview Background</p>
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
  )
}

const ColorConverter: React.FC = () => {
  const [inputText, setInputText] = useState<string>(PLACEHOLDER_TEXT);
  const [outputText, setOutputText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<ColorFormat>('oklch');
  const [useCssSyntax, setUseCssSyntax] = useState<boolean>(true);

  const [tooltipData, setTooltipData] = useState<{ color: string; top: number; left: number } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewBg, setPreviewBg] = useState('#49454F');
  const settingsRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const convertedText = convertCssColors(inputText, { format: outputFormat, useCssSyntax });
    setOutputText(convertedText);
  }, [inputText, outputFormat, useCssSyntax]);

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

  const handleColorHover = useCallback((color: string, event: React.MouseEvent) => {
    setTooltipData({ color, top: event.clientY + 15, left: event.clientX + 15 });
  }, []);

  const handleColorLeave = useCallback(() => {
    setTooltipData(null);
  }, []);
  
  return (
    <div className="flex flex-col gap-6">
        {/* Controls Block */}
        <div className="bg-[#242429] border border-[#49454F] rounded-3xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center flex-wrap gap-x-6 gap-y-4">
                <div className="flex flex-col">
                    <label htmlFor="output-format" className="text-xs text-[#C8C5CA] mb-1 px-3">Format</label>
                     <div className="relative">
                        <select
                            id="output-format"
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value as ColorFormat)}
                            className="appearance-none bg-[#36343B] border border-[#938F99] rounded-full pl-4 pr-10 py-2.5 text-sm text-[#E6E1E5] focus:ring-2 focus:ring-[#D0BCFF] focus:outline-none focus:border-[#D0BCFF]"
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
                 <ToggleSwitch
                    id="css-syntax-toggle"
                    checked={useCssSyntax}
                    onChange={setUseCssSyntax}
                    label="CSS Syntax"
                />
            </div>
            <div className="flex items-center gap-2">
                <div className="relative" ref={settingsRef}>
                    <button
                        onClick={() => setIsSettingsOpen(prev => !prev)}
                        className="p-2.5 rounded-full hover:bg-[#36343B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#242429] focus:ring-[#D0BCFF]"
                        aria-label="Open settings"
                    >
                        <svg className="w-6 h-6 text-[#C8C5CA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                    {isSettingsOpen && <SettingsPanel currentBg={previewBg} onBgChange={(color) => { setPreviewBg(color); setIsSettingsOpen(false); }} />}
                </div>
                <button
                    onClick={handleCopy}
                    className="px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 bg-[#B69DF8] text-[#381E72] hover:bg-[#C0A8FA] focus:outline-none focus:ring-4 focus:ring-[#D0BCFF]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600"
                    disabled={!outputText}
                >
                    {isCopied ? 'Copied!' : 'Copy Output'}
                </button>
            </div>
        </div>

        {/* IO Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div className="flex flex-col">
                <h2 className="text-sm font-medium mb-3 text-[#C8C5CA] px-2">Input</h2>
                <div className="bg-[#242429] border border-[#49454F] rounded-3xl p-1 flex flex-col min-h-[400px] sm:min-h-[500px] flex-grow">
                    <CodeEditor
                        id="input-css"
                        value={inputText}
                        onValueChange={setInputText}
                        onColorHover={handleColorHover}
                        onColorLeave={handleColorLeave}
                        ariaLabel="CSS Input"
                    />
                </div>
            </div>

            <div className="flex flex-col">
                 <h2 className="text-sm font-medium mb-3 text-[#C8C5CA] px-2">Output</h2>
                 <div className="bg-[#242429] border border-[#49454F] rounded-3xl p-1 flex flex-col min-h-[400px] sm:min-h-[500px] flex-grow">
                    <CodeEditor
                        id="output-css"
                        value={outputText}
                        readOnly
                        onColorHover={handleColorHover}
                        onColorLeave={handleColorLeave}
                        ariaLabel="Converted CSS Output"
                    />
                </div>
            </div>
        </div>
        {tooltipData && <ColorTooltip data={tooltipData} bg={previewBg} />}
    </div>
  );
};

export default ColorConverter;