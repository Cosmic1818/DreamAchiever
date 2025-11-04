
import React, { useState, useEffect, useRef } from 'react';
import ImageSlider from './components/ImageSlider';
import AddSlideModal from './components/AddSlideModal';
import SettingsIcon from './components/icons/SettingsIcon';
import SpeakerOnIcon from './components/icons/SpeakerOnIcon';
import SpeakerOffIcon from './components/icons/SpeakerOffIcon';
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

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('dream-achiever-is-muted') === 'true';
  });

  const [isUiSoundEnabled, setIsUiSoundEnabled] = useState<boolean>(() => {
    // Default to true if not set
    return localStorage.getItem('dream-achiever-ui-sounds') !== 'false';
  });

  const backgroundAudioRef = useRef<HTMLAudioElement>(null);
  const uiClickAudioRef = useRef<HTMLAudioElement>(null);
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

  // Effect to save mute state and control audio element
  useEffect(() => {
    localStorage.setItem('dream-achiever-is-muted', String(isMuted));
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Effect to save UI sound preference
  useEffect(() => {
    localStorage.setItem('dream-achiever-ui-sounds', String(isUiSoundEnabled));
  }, [isUiSoundEnabled]);

  // Effect to play background audio on first user interaction to comply with autoplay policies
  useEffect(() => {
    const playAudio = () => {
      if (backgroundAudioRef.current && backgroundAudioRef.current.paused) {
        backgroundAudioRef.current.play().catch(error => {
          console.log("Background audio playback failed:", error);
        });
        document.removeEventListener('click', playAudio);
        document.removeEventListener('keydown', playAudio);
      }
    };

    document.addEventListener('click', playAudio);
    document.addEventListener('keydown', playAudio);

    return () => {
      document.removeEventListener('click', playAudio);
      document.removeEventListener('keydown', playAudio);
    };
  }, []);

  // Effect for global click sound
  useEffect(() => {
    const playClickSound = () => {
      if (isUiSoundEnabled && uiClickAudioRef.current) {
        uiClickAudioRef.current.currentTime = 0;
        uiClickAudioRef.current.play().catch(e => console.error("Could not play UI sound", e));
      }
    };
    window.addEventListener('click', playClickSound);
    return () => {
      window.removeEventListener('click', playClickSound);
    };
  }, [isUiSoundEnabled]);


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
      localStorage.removeItem('dream-achiever-is-muted');
      localStorage.removeItem('dream-achiever-ui-sounds');
      setSlides(SLIDES);
      setGlowColor('#a855f7');
      setSlideDuration(7000);
      setIsMuted(false);
      setIsUiSoundEnabled(true);
    }
  };


  return (
    <>
      <audio ref={backgroundAudioRef} src="https://storage.googleapis.com/aistudio-hosting/vedic-background-ambiience.mp3" loop muted={isMuted}></audio>
      <audio ref={uiClickAudioRef} src="https://storage.googleapis.com/aistudio-hosting/vedic-click.mp3"></audio>

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
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 text-gray-300 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-black"
            aria-label={isMuted ? "Unmute background music" : "Mute background music"}
          >
            {isMuted ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
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
        isUiSoundEnabled={isUiSoundEnabled}
        onIsUiSoundEnabledChange={setIsUiSoundEnabled}
        onReset={handleResetAllData}
      />
    </>
  );
};

export default App;
