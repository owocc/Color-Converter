import React from 'react';
import ColorConverter from './components/ColorConverter';

const App: React.FC = () => {
  return (
    <main className="bg-[#1B1B1F] min-h-screen text-[#E6E1E5] font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <ColorConverter />
         <footer className="mt-12 text-center text-[#938F99] text-sm">
          <p>© 2025 OWOCC</p>
        </footer>
      </div>
    </main>
  );
};

export default App;