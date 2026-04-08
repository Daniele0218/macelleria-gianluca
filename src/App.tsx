import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './hooks/useTheme';
import AppLayout from './components/layout/AppLayout';

function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-[var(--color-subdued)] mt-2">In costruzione...</p>
    </div>
  );
}

export default function App() {
  const { dark, toggle } = useTheme();

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: dark ? '#303030' : '#FFFFFF',
            color: dark ? '#E3E3E6' : '#1A1A1A',
            border: `1px solid ${dark ? '#404040' : '#E7E5E4'}`,
            borderRadius: '10px',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route element={<AppLayout dark={dark} onToggleTheme={toggle} />}>
          <Route path="/" element={<Placeholder title="Incassi" />} />
          <Route path="/spese" element={<Placeholder title="Spese" />} />
          <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
          <Route path="/fornitori" element={<Placeholder title="Fornitori" />} />
          <Route path="/altro" element={<Placeholder title="Altro" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
