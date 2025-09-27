
import React, { useState, useEffect, useCallback } from 'react';
import { convertCssToOklch } from '../services/colorConverter';

const PLACEHOLDER_TEXT = `
/* Paste your CSS here */

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

  useEffect(() => {
    const convertedText = convertCssToOklch(inputText);
    setOutputText(convertedText);
  }, [inputText]);

  const handleCopy = useCallback(() => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [outputText]);

  const
  handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col">
        <label htmlFor="input-css" className="text-lg font-semibold mb-2 text-gray-300">
          Input (CSS with HEX/RGB/HSL)
        </label>
        <textarea
          id="input-css"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Paste your CSS variables here..."
          className="flex-grow bg-gray-800 border border-gray-700 rounded-lg p-4 font-mono text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
          rows={20}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-2">
            <label htmlFor="output-oklch" className="text-lg font-semibold text-gray-300">
            Output (OKLCH)
            </label>
            <button
                onClick={handleCopy}
                className="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 bg-gray-700 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!outputText}
            >
                {isCopied ? 'Copied!' : 'Copy'}
            </button>
        </div>

        <textarea
          id="output-oklch"
          value={outputText}
          readOnly
          className="flex-grow bg-gray-800 border border-gray-700 rounded-lg p-4 font-mono text-sm text-green-300 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
          rows={20}
        />
      </div>
    </div>
  );
};

export default ColorConverter;
