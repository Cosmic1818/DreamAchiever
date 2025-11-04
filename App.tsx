
import React, { useState, useEffect } from 'react';
import ImageSlider from './components/ImageSlider';
import AddSlideModal from './components/AddSlideModal';
import SettingsIcon from './components/icons/SettingsIcon';
import { SLIDES } from './constants';
import { Slide } from './types';

const App: React.FC = () => {
  // Load slides from localStorage or use initial constants
  const [slides, setSlides] = useState<Slide[]>(() => {
    try {
      const savedSlides = localStorage.getItem('dream-achiever-slides');
      // If there are saved slides, parse them. Otherwise, use the initial SLIDES constant.
      return savedSlides ? JSON.parse(savedSlides) : SLIDES;
    } catch (error) {
      console.error('Failed to parse slides from localStorage', error);
      // Fallback to initial slides in case of parsing error
      return SLIDES;
    }
  });

  // Load glow color from localStorage or use a default
  const [glowColor, setGlowColor] = useState<string>(() => {
    return localStorage.getItem('dream-achiever-glow-color') || '#a855f7';
  });
  
  // Load slide duration from localStorage or use a default
  const [slideDuration, setSlideDuration] = useState<number>(() => {
    const savedDuration = localStorage.getItem('dream-achiever-slide-duration');
    return savedDuration ? parseInt(savedDuration, 10) : 7000; // Default to 7 seconds
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Effect to save slides to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('dream-achiever-slides', JSON.stringify(slides));
    } catch (error) {
      console.error('Failed to save slides to localStorage', error);
    }
  }, [slides]);

  // Effect to save glow color to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('dream-achiever-glow-color', glowColor);
    } catch (error) {
      console.error('Failed to save glow color to localStorage', error);
    }
  }, [glowColor]);
  
  // Effect to save slide duration to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dream-achiever-slide-duration', String(slideDuration));
  }, [slideDuration]);

  const handleAddSlide = (newSlide: Slide) => {
    setSlides(prevSlides => [...prevSlides, newSlide]);
    setIsModalOpen(false);
  };

  const handleRemoveSlide = (indexToRemove: number) => {
    setSlides(prevSlides => prevSlides.filter((_, index) => index !== indexToRemove));
  };
  
  const handleSlidesUpdate = (newSlides: Slide[]) => {
    setSlides(newSlides);
  };

  const handleGlowColorChange = (color: string) => {
    setGlowColor(color);
  };

  const handleSlideDurationChange = (duration: number) => {
    setSlideDuration(duration);
  };

  const handleResetAllData = () => {
    if (window.confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      localStorage.removeItem('dream-achiever-slides');
      localStorage.removeItem('dream-achiever-glow-color');
      localStorage.removeItem('dream-achiever-slide-duration');
      setSlides(SLIDES);
      setGlowColor('#a855f7');
      setSlideDuration(7000);
    }
  };


  return (
    <>
      <div className="relative h-screen w-screen bg-black text-white antialiased">
        <main 
          className="absolute inset-0 h-full w-full p-6"
        >
          <div 
            className="h-full w-full relative glowing-frame rounded-3xl"
            style={{ '--glow-color': glowColor } as React.CSSProperties}
          >
            <ImageSlider 
              slides={slides} 
              slideDuration={slideDuration}
            />
          </div>
        </main>
        <header className="absolute top-0 right-0 p-6 z-10 flex items-center space-x-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="p-3 text-gray-300 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-black"
            aria-label="Settings"
          >
            <SettingsIcon />
          </button>
        </header>
      </div>
      <AddSlideModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSlide={handleAddSlide}
        slides={slides}
        onSlidesUpdate={handleSlidesUpdate}
        onRemoveSlide={handleRemoveSlide}
        glowColor={glowColor}
        onGlowColorChange={handleGlowColorChange}
        slideDuration={slideDuration}
        onSlideDurationChange={handleSlideDurationChange}
        onReset={handleResetAllData}
      />
    </>
  );
};

export default App;
