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

  const handleAddSlide = (newSlide: Slide) => {
    setSlides(prevSlides => [...prevSlides, newSlide]);
    setIsModalOpen(false);
  };

  const handleRemoveSlide = (indexToRemove: number) => {
    setSlides(prevSlides => prevSlides.filter((_, index) => index !== indexToRemove));
  };
  
  const handleGlowColorChange = (color: string) => {
    setGlowColor(color);
  };

  return (
    <>
      <header className="absolute top-0 right-0 p-6 z-10">
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-3 text-gray-300 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-black"
          aria-label="Add your spark"
        >
          <SettingsIcon />
        </button>
      </header>
      <main className="h-screen w-screen bg-black text-white antialiased p-6">
        <div 
          className="h-full w-full relative glowing-frame rounded-3xl"
          style={{ '--glow-color': glowColor } as React.CSSProperties}
        >
          <ImageSlider slides={slides} />
        </div>
      </main>
      <AddSlideModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSlide={handleAddSlide}
        slides={slides}
        setSlides={setSlides}
        onRemoveSlide={handleRemoveSlide}
        glowColor={glowColor}
        setGlowColor={setGlowColor}
        onGlowColorChange={handleGlowColorChange}
      />
    </>
  );
};

export default App;