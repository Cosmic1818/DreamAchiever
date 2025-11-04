
import React, { useState, useEffect, useCallback } from 'react';
import { Slide } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface ImageSliderProps {
  slides: Slide[];
  slideDuration: number;
  currentIndex: number;
  onCurrentIndexChange: (index: number) => void;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ slides, slideDuration, currentIndex, onCurrentIndexChange }) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const minSwipeDistance = 50;

  const goToPrevious = useCallback(() => {
    if (slides.length < 2) return;
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    onCurrentIndexChange(newIndex);
  }, [currentIndex, slides.length, onCurrentIndexChange]);

  const goToNext = useCallback(() => {
    if (slides.length < 2) return;
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    onCurrentIndexChange(newIndex);
  }, [currentIndex, slides.length, onCurrentIndexChange]);

  const goToSlide = (slideIndex: number) => {
    onCurrentIndexChange(slideIndex);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0); // reset
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
    // reset
    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    if (slides.length > 1 && slideDuration > 0) {
      const timer = setTimeout(goToNext, slideDuration);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, goToNext, slides.length, slideDuration]);

  if (!slides || slides.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-4xl font-bold text-white mb-4">Your canvas is empty.</h2>
        <p className="text-xl text-gray-400">
          Click the settings icon to add your first spark of inspiration.
        </p>
      </div>
    );
  }
  
  return (
    <div 
      className="h-full w-full relative group rounded-3xl overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, slideIndex) => (
        <div
          key={slide.imageUrl + slideIndex}
          className={`absolute inset-0 w-full h-full bg-center bg-cover transition-opacity duration-1000 ease-in-out ${slideIndex === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          style={{ backgroundImage: `url(${slide.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8">
            <div className="text-center text-white max-w-3xl">
              <h2 className={`text-3xl md:text-5xl font-bold leading-tight mb-4 transition-all duration-1000 ease-out whitespace-pre-wrap ${slideIndex === currentIndex ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-10'}`}>
                "{slide.quote}"
              </h2>
              <p className={`text-xl md:text-2xl text-gray-300 italic transition-all duration-1000 ease-out ${slideIndex === currentIndex ? 'opacity-100 translate-y-0 delay-500' : 'opacity-0 translate-y-10'}`}>
                - {slide.author}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {slides.length > 1 && (
        <>
          {/* Left Arrow */}
          <button 
            onClick={goToPrevious}
            className="absolute top-1/2 left-5 -translate-y-1/2 bg-black/30 group-hover:bg-black/50 hover:bg-black/70 p-3 rounded-full text-white cursor-pointer transition-all opacity-0 group-hover:opacity-100 hidden md:block z-20"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon />
          </button>

          {/* Right Arrow */}
          <button 
            onClick={goToNext}
            className="absolute top-1/2 right-5 -translate-y-1/2 bg-black/30 group-hover:bg-black/50 hover:bg-black/70 p-3 rounded-full text-white cursor-pointer transition-all opacity-0 group-hover:opacity-100 hidden md:block z-20"
            aria-label="Next slide"
          >
            <ChevronRightIcon />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
            {slides.map((_, slideIndex) => (
              <div
                key={slideIndex}
                onClick={() => goToSlide(slideIndex)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${currentIndex === slideIndex ? 'bg-white' : 'bg-gray-500'}`}
                aria-label={`Go to slide ${slideIndex + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageSlider;
