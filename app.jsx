// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FilmIcon, TvIcon, HomeIcon, CogIcon, UserIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Player } from 'jwplayer-react';

const API_URL = 'http://localhost:5000/api';

const App = () => {
  const [content, setContent] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchContent();
    checkAuthStatus();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API_URL}/content`);
      setContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/status`, { withCredentials: true });
      setUser(response.data.user);
    } catch (error) {
      console.log('User not authenticated');
    }
  };

  const filterContent = (type = null, category = null) => {
    return content.filter(item => 
      (!type || item.type === type) &&
      (!category || item.category === category) &&
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleWatchHistory = async (item) => {
    if (user) {
      await axios.post(`${API_URL}/watch-history`, { contentId: item.id }, { withCredentials: true });
    }
  };

  const renderSection = (title, filterFn) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
        {filterFn().map((item) => (
          <div 
            key={item.id} 
            onClick={() => {
              setSelectedContent(item);
              handleWatchHistory(item);
            }}
            className="flex-shrink-0 w-32 cursor-pointer group"
          >
            <img src={item.image} alt={item.title} className="w-full h-48 object-cover rounded-lg shadow-md transition-transform group-hover:scale-105" />
            <p className="mt-2 text-sm truncate">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContentDetails = () => {
    if (!selectedContent) return null;
    return (
      <div className="fixed inset-0 bg-black/95 z-50 p-6 overflow-y-auto animate-fade-in">
        <button onClick={() => setSelectedContent(null)} className="absolute top-4 right-4 text-white hover:text-purple-500">
          <XMarkIcon className="w-8 h-8" />
        </button>
        <div className="max-w-4xl mx-auto">
          <img src={selectedContent.image} alt={selectedContent.title} className="w-full h-80 object-cover rounded-lg shadow-2xl" />
          <div className="mt-6">
            <h2 className="text-3xl font-bold">{selectedContent.title}</h2>
            <p className="text-gray-300 mt-2">{selectedContent.description}</p>
            <div className="flex space-x-4 mt-2 text-sm text-gray-400">
              <span>Category: {selectedContent.category}</span>
              {selectedContent.type === 'series' && <span>Seasons: {selectedContent.seasons}</span>}
              <span>{selectedContent.duration || 'N/A'}</span>
            </div>
            <button 
              onClick={() => setSelectedContent({ ...selectedContent, play: true })}
              className="mt-4 w-full p-3 bg-purple-600 rounded-full hover:bg-purple-700 transition-all"
            >
              Play Now
            </button>
            {selectedContent.play && (
              <div className="mt-6">
                <Player
                  library="https://cdn.jwplayer.com/libraries/YOUR_JWPLAYER_ID.js"
                  playlist={[{
                    file: selectedContent.videoUrl,
                    image: selectedContent.image,
                    title: selectedContent.title,
                    description: selectedContent.description,
                  }]}
                  config={{
                    width: "100%",
                    aspectratio: "16:9",
                    autostart: true,
                    controls: true,
                    playbackRateControls: [0.5, 1, 1.25, 1.5, 2],
                    sharing: true,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Other render functions (renderHome, renderMovies, renderSeries) remain similar with enhanced styling

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <div className="pb-20">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'movies' && renderMovies()}
        {activeTab === 'series' && renderSeries()}
      </div>

      <nav className="fixed bottom-0 w-full bg-black/90 backdrop-blur-md p-2 flex justify-around items-center z-50 shadow-lg">
        {/* Navigation buttons remain similar */}
      </nav>

      {selectedContent && renderContentDetails()}
      {showPopup && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl animate-pop-in">
            <h3 className="text-xl font-bold mb-4">Feature Coming Soon</h3>
            <p className="text-gray-400">Stay tuned for exciting updates!</p>
            <button 
              onClick={() => setShowPopup(false)}
              className="mt-4 p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
