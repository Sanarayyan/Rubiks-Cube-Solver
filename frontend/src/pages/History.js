import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Play, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { cubeAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const result = await cubeAPI.getHistory();
      setHistory(result.history || []);
    } catch (error) {
      console.error('Load history error:', error);
      setError('Failed to load history: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const viewSolution = (solution) => {
    navigate(`/solution/${Date.now()}`, { 
      state: { solution } 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading history..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Arrow Button - Mobile Style */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 border border-gray-200 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Solving History
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            Browse your previously solved cubes
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <HistoryIcon className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No History Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Solve your first cube to see it appear here
            </p>
            <button
              onClick={() => navigate('/manual')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors active:scale-[0.99]"
            >
              Solve a Cube
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:gap-6">
            {history.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Solution #{item.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.total_moves} moves • {item.estimated_time || 0}s
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{item.estimated_time || 0} seconds</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.solved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.solved ? 'Solved' : 'In Progress'}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {item.difficulty || 'Beginner'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => viewSolution(item)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    View Solution
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Demo History Items */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Demo History</h2>
          <div className="grid gap-5 sm:gap-6">
            {[
              {
                id: 1,
                created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                total_moves: 20,
                estimated_time: 30,
                solved: true,
                difficulty: 'Beginner'
              },
              {
                id: 2,
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                total_moves: 35,
                estimated_time: 45,
                solved: true,
                difficulty: 'Intermediate'
              },
              {
                id: 3,
                created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                total_moves: 15,
                estimated_time: 25,
                solved: true,
                difficulty: 'Beginner'
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Demo Solution #{item.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.total_moves} moves • {item.estimated_time}s
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{item.estimated_time} seconds</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Solved
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {item.difficulty}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => navigate('/manual')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Try Similar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History; 