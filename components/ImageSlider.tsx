import React, { useState, useEffect, useCallback } from 'react';
import { Slide } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface ImageSliderProps {
  slides: Slide[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = useCallback(() => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  const goToNext = useCallback(() => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setTimeout(goToNext, 7000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, goToNext, slides.length]);
  
  useEffect(() => {
    if (slides.length > 0 && currentIndex >= slides.length) {
      setCurrentIndex(slides.length - 1);
    }
  }, [slides, currentIndex]);


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
  
  const currentSlide = slides[currentIndex];

  return (
    <div className="h-full w-full relative group rounded-3xl overflow-hidden">
      <div
        style={{ backgroundImage: `url(${currentSlide.imageUrl})` }}
        className="w-full h-full bg-center bg-cover duration-700 ease-in-out"
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8">
          <div className="text-center text-white max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              "{currentSlide.quote}"
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 italic">
              - {currentSlide.author}
            </p>
          </div>
        </div>
      </div>
      
      {slides.length > 1 && (
        <>
          {/* Left Arrow */}
          <button 
            onClick={goToPrevious}
            className="absolute top-1/2 left-5 -translate-y-1/2 bg-black/30 group-hover:bg-black/50 hover:bg-black/70 p-3 rounded-full text-white cursor-pointer transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeftIcon />
          </button>

          {/* Right Arrow */}
          <button 
            onClick={goToNext}
            className="absolute top-1/2 right-5 -translate-y-1/2 bg-black/30 group-hover:bg-black/50 hover:bg-black/70 p-3 rounded-full text-white cursor-pointer transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRightIcon />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-3">
            {slides.map((_, slideIndex) => (
              <div
                key={slideIndex}
                onClick={() => goToSlide(slideIndex)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${currentIndex === slideIndex ? 'bg-white' : 'bg-gray-500'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageSlider;