import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './routerConfig'; // Suppress React Router warnings
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import Home from './pages/Home';
import ManualInput from './pages/ManualInput';
// import ImageUpload from './pages/ImageUpload';
import Solution from './pages/Solution';
import History from './pages/History';
import NotFound from './pages/NotFound';

function App() {
  // Debug logging
  console.log('React App is loading...');
  console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:8081');
  
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/manual" element={<ManualInput />} />
                {/* Upload route temporarily disabled */}
                <Route path="/solution/:id" element={<Solution />} />
                <Route path="/history" element={<History />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App; 