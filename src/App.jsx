import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ThemeProvider from './hooks/ThemeProvider';
import { ToastProvider } from './components/Toast';
import BackgroundMesh from './components/BackgroundMesh';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Translator from './pages/Translator';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <ToastProvider>
          <BackgroundMesh />
          <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Translator />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}