import React, { useState, useEffect, useCallback } from 'react';
import { convertCssColors, ColorFormat } from '../services/colorConverter';

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


const ColorConverter: React.FC = () => {
  const [inputText, setInputText] = useState<string>(PLACEHOLDER_TEXT);
  const [outputText, setOutputText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<ColorFormat>('oklch');
  const [useCssSyntax, setUseCssSyntax] = useState<boolean>(true);

  useEffect(() => {
    const convertedText = convertCssColors(inputText, { format: outputFormat, useCssSyntax });
    setOutputText(convertedText);
  }, [inputText, outputFormat, useCssSyntax]);

  const handleCopy = useCallback(() => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [outputText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };
  
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
            <button
                onClick={handleCopy}
                className="px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 bg-[#B69DF8] text-[#381E72] hover:bg-[#C0A8FA] focus:outline-none focus:ring-4 focus:ring-[#D0BCFF]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600"
                disabled={!outputText}
            >
                {isCopied ? 'Copied!' : 'Copy Output'}
            </button>
        </div>

        {/* IO Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input */}
            <div className="bg-[#242429] border border-[#49454F] rounded-3xl p-6 flex flex-col">
                <label htmlFor="input-css" className="text-sm font-medium mb-3 text-[#C8C5CA]">
                Input
                </label>
                <textarea
                id="input-css"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Paste your CSS variables here..."
                className="flex-grow bg-[#1B1B1F] rounded-2xl p-4 font-mono text-sm text-[#C8C5CA] focus:ring-2 focus:ring-[#D0BCFF] focus:outline-none resize-none min-h-[400px] sm:min-h-[500px]"
                aria-label="CSS Input"
                />
            </div>

            {/* Output */}
            <div className="bg-[#242429] border border-[#49454F] rounded-3xl p-6 flex flex-col">
                <label htmlFor="output-color" className="text-sm font-medium mb-3 text-[#C8C5CA]">
                Output
                </label>
                <textarea
                id="output-color"
                value={outputText}
                readOnly
                className="flex-grow bg-[#1B1B1F] rounded-2xl p-4 font-mono text-sm text-[#CAC4D0] focus:ring-2 focus:ring-[#D0BCFF] focus:outline-none resize-none min-h-[400px] sm:min-h-[500px]"
                aria-label="Converted CSS Output"
                />
            </div>
        </div>
    </div>
  );
};

export default ColorConverter;