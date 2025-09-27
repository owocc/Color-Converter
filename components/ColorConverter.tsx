
import React, { useState, useEffect, useCallback } from 'react';
import { convertCssColors, ColorFormat } from '../services/colorConverter';

const PLACEHOLDER_TEXT = `
/* 
  Paste your CSS here. 
  Any valid color (HEX, RGB, HSL) will be converted.
*/

:root {
  --brand-primary: #6a34ff;
  --brand-secondary: rgb(255, 100, 200);
  
  --vis-pink-60: hsl(338, 70%, 70%);
  --vis-pink-70: hsl(338, 60%, 80%);
  --vis-pink-80: hsl(338, 60%, 90%);
  --vis-pink-90: hsl(338, 60%, 95%);

  --vis-salmon-10: hsl(0, 60%, 20%);
  --vis-salmon-20: hsl(0, 60%, 35%);
  --vis-salmon-30: hsl(0, 60%, 50%);
}

.button {
  background-color: #3b82f6; /* A nice blue */
  color: white;
}
`;

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col">
        <label htmlFor="input-css" className="text-lg font-semibold mb-2 text-gray-300">
          Input
        </label>
        <textarea
          id="input-css"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Paste your CSS variables here..."
          className="flex-grow bg-gray-800 border border-gray-700 rounded-lg p-4 font-mono text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
          rows={20}
          aria-label="CSS Input"
        />
      </div>
      <div className="flex flex-col">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
            <label htmlFor="output-color" className="text-lg font-semibold text-gray-300">
            Output
            </label>
            <div className="flex items-center gap-4">
                <select
                    id="output-format"
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as ColorFormat)}
                    className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    aria-label="Select output color format"
                >
                    <option value="oklch">OKLCH</option>
                    <option value="hex">HEX</option>
                    <option value="rgb">RGB</option>
                    <option value="hsl">HSL</option>
                </select>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="css-syntax-toggle"
                        checked={useCssSyntax}
                        onChange={(e) => setUseCssSyntax(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="css-syntax-toggle" className="ml-2 text-sm text-gray-400 whitespace-nowrap">
                        CSS Syntax
                    </label>
                </div>
                <button
                    onClick={handleCopy}
                    className="px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 bg-gray-700 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!outputText}
                >
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>
        </div>

        <textarea
          id="output-color"
          value={outputText}
          readOnly
          className="flex-grow bg-gray-800 border border-gray-700 rounded-lg p-4 font-mono text-sm text-green-300 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
          rows={20}
          aria-label="Converted CSS Output"
        />
      </div>
    </div>
  );
};

export default ColorConverter;