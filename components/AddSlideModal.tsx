import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { Slide } from '../types';
import XIcon from './icons/XIcon';
import TrashIcon from './icons/TrashIcon';
import ExportIcon from './icons/ExportIcon';
import ImportIcon from './icons/ImportIcon';

interface AddSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSlide: (newSlide: Slide) => void;
  slides: Slide[];
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;
  onRemoveSlide: (index: number) => void;
  glowColor: string;
  setGlowColor: React.Dispatch<React.SetStateAction<string>>;
  onGlowColorChange: (color: string) => void;
}

const AddSlideModal: React.FC<AddSlideModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddSlide, 
  slides, 
  setSlides,
  onRemoveSlide,
  glowColor,
  setGlowColor,
  onGlowColorChange,
}) => {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!image || !quote || !author) {
      setError('All fields are required.');
      return;
    }
    onAddSlide({ imageUrl: image, quote, author });
    // Reset form
    setQuote('');
    setAuthor('');
    setImage(null);
    setError('');
    setFileInputKey(Date.now()); // Reset file input
  };
  
  const handleExport = () => {
    const dataToExport = {
      slides,
      glowColor,
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dream-achiever-backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleFileImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') throw new Error("File is not readable");
        const data = JSON.parse(text);

        if (Array.isArray(data.slides) && typeof data.glowColor === 'string') {
          if (window.confirm("Are you sure you want to import this data? This will overwrite your current settings.")) {
            setSlides(data.slides);
            setGlowColor(data.glowColor);
            onGlowColorChange(data.glowColor); // To update the color picker UI instantly
          }
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Failed to read or parse the backup file.");
        console.error(err);
      }
    };
    reader.readAsText(file);
    // Reset file input so the same file can be loaded again
    e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      localStorage.removeItem('dream-achiever-slides');
      localStorage.removeItem('dream-achiever-glow-color');
      setSlides([]);
      const defaultColor = '#a855f7';
      setGlowColor(defaultColor);
      onGlowColorChange(defaultColor);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 p-8 w-full max-w-lg m-4 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <XIcon />
        </button>
        
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        </div>

        <div className="flex-grow overflow-y-auto -mr-4 pr-4 mt-4 min-h-0">
          <h3 className="text-xl font-bold text-white mb-4">Add Your Own Spark</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium text-gray-400 mb-2">
                Motivational Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {image ? (
                    <img src={image} alt="Preview" className="mx-auto h-24 w-auto rounded-md object-cover" />
                  ) : (
                    <svg className="mx-auto h-12 w-12 text-gray-600" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-500">
                    <label htmlFor="image-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-purple-400 hover:text-purple-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-purple-500 px-1">
                      <span>Upload a file</span>
                      <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} key={fileInputKey} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-600">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="quote" className="block text-sm font-medium text-gray-400">Quote</label>
              <input
                type="text"
                name="quote"
                id="quote"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder='"The secret of getting ahead..."'
              />
            </div>
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-400">Author</label>
              <input
                type="text"
                name="author"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Mark Twain"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
              >
                Add to Slideshow
              </button>
            </div>
          </form>

          <div className="my-6 border-t border-gray-700"></div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Frame Color</h3>
            <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
              <label htmlFor="glow-color-picker" className="text-white font-medium">
                Choose a glow color
              </label>
              <input
                id="glow-color-picker"
                type="color"
                value={glowColor}
                onChange={(e) => onGlowColorChange(e.target.value)}
                className="w-10 h-10 p-0 border-none rounded-md cursor-pointer bg-transparent"
              />
            </div>
          </div>
          
          <div className="my-6 border-t border-gray-700"></div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Data Management</h3>
            <div className="space-y-3">
               <button onClick={handleExport} className="w-full flex items-center justify-center space-x-2 text-center py-3 px-4 border border-blue-500/50 text-blue-300 font-medium rounded-md hover:bg-blue-500/10 transition-colors">
                <ExportIcon />
                <span>Export Data</span>
              </button>
               <button onClick={handleImportClick} className="w-full flex items-center justify-center space-x-2 text-center py-3 px-4 border border-green-500/50 text-green-300 font-medium rounded-md hover:bg-green-500/10 transition-colors">
                <ImportIcon />
                <span>Import Data</span>
              </button>
              <input type="file" accept=".json" ref={importFileRef} onChange={handleFileImport} className="hidden" />
               <button onClick={handleReset} className="w-full flex items-center justify-center space-x-2 text-center py-3 px-4 border border-red-500/50 text-red-400 font-medium rounded-md hover:bg-red-500/10 transition-colors">
                <TrashIcon />
                <span>Reset & Delete All Data</span>
              </button>
            </div>
          </div>

          <div className="my-6 border-t border-gray-700"></div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Manage Wallpapers</h3>
            {slides.length > 0 ? (
              <div className="space-y-3">
                {slides.map((slide, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-4 min-w-0">
                      <img src={slide.imageUrl} alt={slide.quote} className="h-12 w-12 rounded-md object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">"{slide.quote}"</p>
                        <p className="text-gray-400 text-sm truncate">- {slide.author}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveSlide(index)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors ml-4"
                      aria-label={`Remove slide: ${slide.quote}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No wallpapers added yet.</p>
            )}
          </div>

        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale { animation: fade-in-scale 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1); }
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: none; border-radius: 0.375rem; }
        input[type="color"]::-moz-color-swatch { border: none; border-radius: 0.375rem; }
      `}</style>
    </div>
  );
};

export default AddSlideModal;