import React from 'react';
import ColorConverter from './components/ColorConverter';

const App: React.FC = () => {
  return (
    <main className="bg-[#1B1B1F] min-h-screen text-[#E6E1E5] font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-[#E6E1E5]">
            Material Color Tool
          </h1>
          <p className="mt-4 text-lg text-[#C8C5CA]">
            A utility to convert CSS colors between formats, inspired by the Material 3 design system.
          </p>
        </header>
        <ColorConverter />
         <footer className="mt-12 text-center text-[#938F99] text-sm">
          <p>Designed with Material 3 principles for a clean and efficient experience.</p>
        </footer>
      </div>
    </main>
  );
};

export default App;