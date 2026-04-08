import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, Image as ImageIcon, Settings, Type, Download, 
  CheckCircle2, Loader2, Sparkles, LayoutGrid, Maximize, 
  Wand2, Layers, Zap, X, Plus
} from 'lucide-react';
import { cn } from './lib/utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// --- Types ---
type ImageSize = '3000x3000' | '2500x2500' | '2000x2000' | 'custom';
type ImageQuality = 'HD' | '4K' | '8K';

interface TextSettings {
  enabled: boolean;
  text: string;
  position: 'top' | 'bottom' | 'center';
  fontStyle: 'sans' | 'serif' | 'mono';
  color: string;
  size: 'small' | 'medium' | 'large';
  badge: 'none' | 'best-seller' | 'amazon-choice' | 'premium';
}

interface GeneratedImage {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
}

const GENERATION_STEPS = [
  "Analyzing product geometry and lighting...",
  "Removing background and cleaning edges...",
  "Enhancing resolution to selected quality...",
  "Generating studio lighting environment...",
  "Creating lifestyle and contextual scenes...",
  "Applying marketing text and badges...",
  "Finalizing Amazon-ready assets..."
];

const IMAGE_TYPES = [
  { id: 'main', title: 'Main Image', desc: 'Pure white background, studio lighting' },
  { id: 'angles', title: 'Multiple Angles', desc: 'Front, side, top, close-up' },
  { id: 'lifestyle', title: 'Lifestyle', desc: 'Real-life environment' },
  { id: 'model', title: 'With Model', desc: 'Natural human interaction' },
  { id: 'benefits', title: 'Product Benefits', desc: 'Icons and highlights' },
  { id: 'how-to', title: 'How To Use', desc: 'Step-by-step visual guide' },
  { id: 'before-after', title: 'Before & After', desc: 'Transformation comparison' },
  { id: 'use-case', title: 'Use Case', desc: 'Multiple usage scenarios' },
  { id: 'close-up', title: 'Feature Close-Up', desc: 'Macro detail highlighting' },
];

export default function App() {
  // State
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Settings State
  const [size, setSize] = useState<ImageSize>('3000x3000');
  const [customWidth, setCustomWidth] = useState('3000');
  const [customHeight, setCustomHeight] = useState('3000');
  const [quality, setQuality] = useState<ImageQuality>('8K');
  const [textSettings, setTextSettings] = useState<TextSettings>({
    enabled: false,
    text: 'Premium Quality',
    position: 'bottom',
    fontStyle: 'sans',
    color: '#000000',
    size: 'medium',
    badge: 'none'
  });

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...uploadedFiles, ...acceptedFiles].slice(0, 5);
    setUploadedFiles(newFiles);
    
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newUrls);
  }, [uploadedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 5
  });

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    
    const newUrls = [...previewUrls];
    URL.revokeObjectURL(newUrls[index]);
    newUrls.splice(index, 1);
    setPreviewUrls(newUrls);
  };

  const handleGenerate = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsGenerating(true);
    setGenerationStep(0);
    setGeneratedImages([]);

    // Simulate generation steps
    for (let i = 0; i < GENERATION_STEPS.length; i++) {
      setGenerationStep(i);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    // Generate mock results
    const seed = Math.floor(Math.random() * 1000);
    const results: GeneratedImage[] = IMAGE_TYPES.map((type, index) => ({
      id: type.id,
      title: type.title,
      description: type.desc,
      url: `https://picsum.photos/seed/${seed + index}/1000/1000`, // Placeholder
      type: type.id
    }));

    // In a real app, we would send the images to a backend AI service here.
    // For this demo, we use Picsum placeholders but we can pretend they are generated.
    // To make it look slightly more realistic, we'll use the first uploaded image as a base for some if possible,
    // but since we can't easily do complex AI image manipulation in the browser without a heavy model,
    // we'll rely on high-quality placeholders.

    setGeneratedImages(results);
    setIsGenerating(false);
  };

  const downloadAll = async () => {
    if (generatedImages.length === 0) return;
    
    const zip = new JSZip();
    
    // In a real app, we would fetch the actual blobs. Here we just create dummy text files or fetch the picsum images.
    // Fetching picsum images might have CORS issues, so we'll just simulate it or try to fetch.
    try {
      const promises = generatedImages.map(async (img, i) => {
        const response = await fetch(img.url);
        const blob = await response.blob();
        zip.file(`amazon-listing-${img.id}.jpg`, blob);
      });
      
      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'amazon-listing-images.zip');
    } catch (error) {
      console.error("Failed to zip images", error);
      alert("Failed to download images due to CORS on placeholder images. In a real app, this would download the generated files.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans flex flex-col md:flex-row">
      {/* Sidebar Controls */}
      <aside className="w-full md:w-80 bg-white border-r border-neutral-200 flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center gap-2 text-orange-500 mb-1">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Amazon AI</h1>
          </div>
          <p className="text-sm text-neutral-500">Product Image Generator</p>
          <div className="mt-4 flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-md text-xs font-medium border border-orange-100">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Studio Photography Engine Active
          </div>
        </div>

        <div className="p-6 space-y-8 flex-1">
          {/* Size Settings */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 uppercase tracking-wider">
              <Maximize className="w-4 h-4" />
              <span>Image Size</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['3000x3000', '2500x2500', '2000x2000', 'custom'] as ImageSize[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg border transition-all",
                    size === s 
                      ? "border-orange-500 bg-orange-50 text-orange-700 font-medium" 
                      : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                  )}
                >
                  {s === 'custom' ? 'Custom' : s}
                </button>
              ))}
            </div>
            {size === 'custom' && (
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="number" 
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Width"
                />
                <span className="text-neutral-400">×</span>
                <input 
                  type="number" 
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Height"
                />
              </div>
            )}
          </section>

          {/* Quality Settings */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Quality Mode</span>
            </div>
            <div className="space-y-2">
              {(['HD', '4K', '8K'] as ImageQuality[]).map((q) => (
                <label key={q} className={cn(
                  "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                  quality === q 
                    ? "border-orange-500 bg-orange-50" 
                    : "border-neutral-200 hover:border-neutral-300"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center",
                      quality === q ? "border-orange-500" : "border-neutral-300"
                    )}>
                      {quality === q && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      quality === q ? "text-orange-900" : "text-neutral-700"
                    )}>
                      {q} {q === '8K' && 'Ultra Quality'}
                    </span>
                  </div>
                  {q === '8K' && <span className="text-[10px] uppercase tracking-wider bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">Default</span>}
                </label>
              ))}
            </div>
          </section>

          {/* Text Settings */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 uppercase tracking-wider">
                <Type className="w-4 h-4" />
                <span>Marketing Text</span>
              </div>
              <button 
                onClick={() => setTextSettings(s => ({...s, enabled: !s.enabled}))}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  textSettings.enabled ? "bg-orange-500" : "bg-neutral-300"
                )}
              >
                <div className={cn(
                  "w-3 h-3 bg-white rounded-full absolute top-1 transition-transform",
                  textSettings.enabled ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
            
            {textSettings.enabled && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 overflow-hidden"
              >
                <input 
                  type="text" 
                  value={textSettings.text}
                  onChange={(e) => setTextSettings(s => ({...s, text: e.target.value}))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g. Premium Quality"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={textSettings.position}
                    onChange={(e) => setTextSettings(s => ({...s, position: e.target.value as any}))}
                    className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  >
                    <option value="top">Top</option>
                    <option value="center">Center</option>
                    <option value="bottom">Bottom</option>
                  </select>
                  <select 
                    value={textSettings.fontStyle}
                    onChange={(e) => setTextSettings(s => ({...s, fontStyle: e.target.value as any}))}
                    className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  >
                    <option value="sans">Sans-serif</option>
                    <option value="serif">Serif</option>
                    <option value="mono">Monospace</option>
                  </select>
                  <select 
                    value={textSettings.size}
                    onChange={(e) => setTextSettings(s => ({...s, size: e.target.value as any}))}
                    className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                  <select 
                    value={textSettings.badge}
                    onChange={(e) => setTextSettings(s => ({...s, badge: e.target.value as any}))}
                    className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  >
                    <option value="none">No Badge</option>
                    <option value="best-seller">Best Seller</option>
                    <option value="amazon-choice">Amazon's Choice</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500">Color:</span>
                  <input 
                    type="color" 
                    value={textSettings.color}
                    onChange={(e) => setTextSettings(s => ({...s, color: e.target.value}))}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                </div>
              </motion.div>
            )}
          </section>
        </div>

        <div className="p-6 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={handleGenerate}
            disabled={uploadedFiles.length === 0 || isGenerating}
            className={cn(
              "w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
              uploadedFiles.length === 0
                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                : isGenerating
                  ? "bg-orange-500 text-white opacity-90 cursor-wait"
                  : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Listing
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-neutral-100">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-500">
              {uploadedFiles.length} / 5 Images Uploaded
            </span>
          </div>
          {generatedImages.length > 0 && (
            <button 
              onClick={downloadAll}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download All (ZIP)
            </button>
          )}
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Upload Zone */}
          {generatedImages.length === 0 && !isGenerating && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div 
                {...getRootProps()} 
                className={cn(
                  "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer",
                  isDragActive 
                    ? "border-orange-500 bg-orange-50" 
                    : "border-neutral-300 bg-white hover:border-orange-400 hover:bg-orange-50/50"
                )}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Drop your product photos here
                </h3>
                <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                  Upload 1-5 mobile photos. Any background, any lighting. Our AI will automatically detect the product and generate a professional Amazon listing.
                </p>
                <button className="px-6 py-2.5 bg-white border border-neutral-200 shadow-sm rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                  Browse Files
                </button>
              </div>

              {/* Uploaded Previews */}
              {previewUrls.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">Source Images</h4>
                  <div className="flex flex-wrap gap-4">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative group w-32 h-32 rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-sm">
                        <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {previewUrls.length < 5 && (
                      <div 
                        {...getRootProps()}
                        className="w-32 h-32 rounded-xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-500 hover:border-orange-400 hover:text-orange-500 cursor-pointer transition-colors bg-white"
                      >
                        <input {...getInputProps()} />
                        <Plus className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">Add More</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generating State */}
          {isGenerating && (
            <div className="max-w-2xl mx-auto mt-20 text-center space-y-8">
              <div className="relative w-32 h-32 mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-orange-100 border-t-orange-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-orange-500 animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-neutral-900">AI is working its magic...</h2>
                <p className="text-neutral-500">Transforming your photos into a professional studio shoot.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-left max-w-md mx-auto">
                <div className="space-y-4">
                  {GENERATION_STEPS.map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {i < generationStep ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      ) : i === generationStep ? (
                        <Loader2 className="w-5 h-5 text-orange-500 animate-spin shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-neutral-200 shrink-0" />
                      )}
                      <span className={cn(
                        "text-sm font-medium transition-colors",
                        i < generationStep ? "text-neutral-900" : 
                        i === generationStep ? "text-orange-600" : "text-neutral-400"
                      )}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results Gallery */}
          {!isGenerating && generatedImages.length > 0 && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Your Amazon Listing is Ready</h2>
                  <p className="text-neutral-500 mt-1">9 professional images generated and optimized for conversion.</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium border border-green-200">
                  <CheckCircle2 className="w-4 h-4" />
                  Amazon Compliant
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedImages.map((img, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={img.id}
                    className="group bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedImage(img)}
                  >
                    <div className="aspect-square relative overflow-hidden bg-neutral-100">
                      <img 
                        src={img.url} 
                        alt={img.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {/* Simulated Text Overlay */}
                      {textSettings.enabled && img.id !== 'main' && (
                        <div className={cn(
                          "absolute left-0 right-0 px-4 pointer-events-none flex flex-col items-center",
                          textSettings.position === 'top' ? "top-8" : textSettings.position === 'center' ? "top-1/2 -translate-y-1/2" : "bottom-8"
                        )}>
                          {textSettings.badge !== 'none' && (
                            <div className={cn(
                              "mb-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm",
                              textSettings.badge === 'best-seller' ? "bg-orange-500 text-white" :
                              textSettings.badge === 'amazon-choice' ? "bg-slate-800 text-white" :
                              "bg-amber-400 text-amber-900"
                            )}>
                              {textSettings.badge.replace('-', ' ')}
                            </div>
                          )}
                          {textSettings.text && (
                            <div 
                              className={cn(
                                "font-bold text-center drop-shadow-md",
                                textSettings.fontStyle === 'serif' ? "font-serif" : textSettings.fontStyle === 'mono' ? "font-mono" : "font-sans",
                                textSettings.size === 'small' ? "text-sm" : textSettings.size === 'large' ? "text-2xl" : "text-lg"
                              )}
                              style={{ color: textSettings.color }}
                            >
                              {textSettings.text}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-neutral-900 shadow-sm">
                        Image {i + 1}
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-neutral-900 px-4 py-2 rounded-full font-medium text-sm shadow-lg flex items-center gap-2">
                          <Maximize className="w-4 h-4" />
                          Preview
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-neutral-900">{img.title}</h3>
                      <p className="text-sm text-neutral-500 mt-1">{img.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl overflow-hidden max-w-5xl w-full max-h-full flex flex-col md:flex-row shadow-2xl"
            >
              <div className="flex-1 bg-neutral-100 relative flex items-center justify-center min-h-[300px] md:min-h-[600px] overflow-hidden">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.title}
                  className="max-w-full max-h-[80vh] object-contain"
                  referrerPolicy="no-referrer"
                />
                {textSettings.enabled && selectedImage.id !== 'main' && (
                  <div className={cn(
                    "absolute left-0 right-0 px-8 pointer-events-none flex flex-col items-center",
                    textSettings.position === 'top' ? "top-12" : textSettings.position === 'center' ? "top-1/2 -translate-y-1/2" : "bottom-12"
                  )}>
                    {textSettings.badge !== 'none' && (
                      <div className={cn(
                        "mb-3 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-md",
                        textSettings.badge === 'best-seller' ? "bg-orange-500 text-white" :
                        textSettings.badge === 'amazon-choice' ? "bg-slate-800 text-white" :
                        "bg-amber-400 text-amber-900"
                      )}>
                        {textSettings.badge.replace('-', ' ')}
                      </div>
                    )}
                    {textSettings.text && (
                      <div 
                        className={cn(
                          "font-bold text-center drop-shadow-lg",
                          textSettings.fontStyle === 'serif' ? "font-serif" : textSettings.fontStyle === 'mono' ? "font-mono" : "font-sans",
                          textSettings.size === 'small' ? "text-xl" : textSettings.size === 'large' ? "text-5xl" : "text-3xl"
                        )}
                        style={{ color: textSettings.color }}
                      >
                        {textSettings.text}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="w-full md:w-80 p-6 flex flex-col bg-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-neutral-900">{selectedImage.title}</h3>
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-neutral-600 mb-8">{selectedImage.description}</p>
                
                <div className="space-y-4 mt-auto">
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Specs</h4>
                    <ul className="space-y-2 text-sm text-neutral-700">
                      <li className="flex justify-between"><span>Resolution</span> <span className="font-medium">{size === 'custom' ? `${customWidth}x${customHeight}` : size}</span></li>
                      <li className="flex justify-between"><span>Quality</span> <span className="font-medium">{quality}</span></li>
                      <li className="flex justify-between"><span>Format</span> <span className="font-medium">JPG / PNG</span></li>
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => {
                      saveAs(selectedImage.url, `amazon-${selectedImage.id}.jpg`);
                    }}
                    className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Image
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
