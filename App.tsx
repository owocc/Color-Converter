
import React from 'react';
import ColorConverter from './components/ColorConverter';

const App: React.FC = () => {
  return (
    <main className="bg-gray-900 min-h-screen text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Color Converter
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Instantly convert HEX, RGB, and HSL colors to your desired format.
          </p>
        </header>
        <ColorConverter />
         <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Built for modern CSS workflows. Paste your code and get instant color conversions.</p>
        </footer>
      </div>
    </main>
  );
};

export default App;