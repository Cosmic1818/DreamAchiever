
import React, { useState, useEffect, useRef } from 'react';
import ImageSlider from './components/ImageSlider';
import AddSlideModal from './components/AddSlideModal';
import SettingsIcon from './components/icons/SettingsIcon';
import { SLIDES } from './constants';
import { Slide } from './types';

// Audio assets URLs
const UI_CLICK_SOUND_URL = 'https://storage.googleapis.com/aistudio-hosting/vedic-click.mp3';


const App: React.FC = () => {
  // Slides state
  const [slides, setSlides] = useState<Slide[]>(() => {
    try {
      const savedSlides = localStorage.getItem('dream-achiever-slides');
      return savedSlides ? JSON.parse(savedSlides) : SLIDES;
    } catch (error) {
      console.error('Failed to parse slides from localStorage', error);
      return SLIDES;
    }
  });

  // Slider state
  const [currentIndex, setCurrentIndex] = useState(0);

  // UI state
  const [glowColor, setGlowColor] = useState<string>(() => {
    return localStorage.getItem('dream-achiever-glow-color') || '#a855f7';
  });
  
  const [slideDuration, setSlideDuration] = useState<number>(() => {
    const savedDuration = localStorage.getItem('dream-achiever-slide-duration');
    return savedDuration ? parseInt(savedDuration, 10) : 7000;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Audio state
  const uiAudioRef = useRef<HTMLAudioElement>(null);

  // === DATA PERSISTENCE EFFECTS ===
  useEffect(() => {
    localStorage.setItem('dream-achiever-slides', JSON.stringify(slides));
  }, [slides]);

  useEffect(() => {
    localStorage.setItem('dream-achiever-glow-color', glowColor);
  }, [glowColor]);
  
  useEffect(() => {
    localStorage.setItem('dream-achiever-slide-duration', String(slideDuration));
  }, [slideDuration]);
  

  // === FUNCTIONAL EFFECTS ===
  // Effect for global click sound
  useEffect(() => {
    const audioEl = uiAudioRef.current;
    if (!audioEl) return;

    const playUiSound = () => {
      audioEl.currentTime = 0;
      audioEl.play().catch(error => console.error("UI sound play failed:", error));
    };

    const setupClickListener = () => {
      document.addEventListener('click', playUiSound);
    };

    // readyState 4 means the media has loaded enough to play through
    if (audioEl.readyState >= 4) {
      setupClickListener();
    } else {
      audioEl.addEventListener('canplaythrough', setupClickListener, { once: true });
    }

    return () => {
      document.removeEventListener('click', playUiSound);
      audioEl.removeEventListener('canplaythrough', setupClickListener);
    };
  }, []);

  // Effect to handle index correction when slides change
  useEffect(() => {
    if (slides.length > 0 && currentIndex >= slides.length) {
      setCurrentIndex(slides.length - 1);
    } else if (slides.length === 0 && currentIndex !== 0) {
      setCurrentIndex(0);
    }
  }, [slides, currentIndex]);


  // === HANDLER FUNCTIONS ===
  const handleAddSlide = (newSlide: Slide) => {
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setCurrentIndex(newSlides.length - 1); // Jump to the new slide
    setIsModalOpen(false);
  };

  const handleRemoveSlide = (indexToRemove: number) => {
    setSlides(prevSlides => prevSlides.filter((_, index) => index !== indexToRemove));
  };
  
  const handleSlidesUpdate = (newSlides: Slide[]) => {
    setSlides(newSlides);
    setCurrentIndex(0); // Reset to first slide on import
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
      setCurrentIndex(0);
      setIsModalOpen(false);
    }
  };


  return (
    <>
      <audio ref={uiAudioRef} src={UI_CLICK_SOUND_URL} preload="auto" />

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
              currentIndex={currentIndex}
              onCurrentIndexChange={setCurrentIndex}
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
