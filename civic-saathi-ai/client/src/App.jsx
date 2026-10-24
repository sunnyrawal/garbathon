import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import TrackPage from './pages/TrackPage.jsx';
import AssistantPage from './pages/AssistantPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="*" element={
              <div className="max-w-xl mx-auto px-4 py-20 text-center">
                <p className="text-6xl mb-4">🏚️</p>
                <h1 className="font-display font-bold text-2xl text-slate-800 mb-2">Page Not Found</h1>
                <p className="text-slate-500">The page you're looking for doesn't exist.</p>
                <a href="/" className="mt-6 inline-block text-amber-600 font-medium hover:underline">← Go Home</a>
              </div>
            } />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
            success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: 'white' } },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
