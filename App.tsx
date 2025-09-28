import React from 'react';
import ColorConverter from './components/ColorConverter';

const App: React.FC = () => {
  return (
    <main className="bg-[#1A1C1E] min-h-screen text-[#e3e3e6] font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#E3E4E8]">
            Material Color Tool
          </h1>
          <p className="mt-3 text-lg text-[#C4C7C5]">
            A utility to convert CSS colors between formats, inspired by the Material 3 design system.
          </p>
        </header>
        <ColorConverter />
         <footer className="mt-12 text-[#8E918F] text-sm">
          <p>Designed with Material 3 principles for a clean and efficient experience.</p>
        </footer>
      </div>
    </main>
  );
};

export default App;