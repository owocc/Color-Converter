import React from 'react';
import ColorConverter from './components/ColorConverter';
import { LocaleProvider } from './i18n/context';

const App: React.FC = () => {
  return (
    <LocaleProvider>
      <main className="bg-[#1B1B1F] min-h-screen text-[#E6E1E5] font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <ColorConverter />
        </div>
      </main>
    </LocaleProvider>
  );
};

export default App;