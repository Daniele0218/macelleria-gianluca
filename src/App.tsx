import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './hooks/useTheme';
import AppLayout from './components/layout/AppLayout';
import RevenuesPage from './pages/RevenuesPage';
import ExpensesPage from './pages/ExpensesPage';
import DashboardPage from './pages/DashboardPage';
import SuppliersPage from './pages/SuppliersPage';
import SettingsPage from './pages/SettingsPage';

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
          <Route path="/" element={<RevenuesPage />} />
          <Route path="/spese" element={<ExpensesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/fornitori" element={<SuppliersPage />} />
          <Route path="/altro" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
