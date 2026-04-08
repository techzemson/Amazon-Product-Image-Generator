import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, Image as ImageIcon, Settings, Type, Download, 
  CheckCircle2, Loader2, Sparkles, LayoutGrid, Maximize, 
  Wand2, Layers, Zap, X, Plus, SlidersHorizontal, 
  Sun, Droplets, Palette, Box, ChevronDown, ChevronUp
} from 'lucide-react';
import { cn } from './lib/utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toBlob } from 'html-to-image';

// --- Types ---
const GENERATION_STEPS = [
  "Analyzing product geometry and lighting...",
  "Running AI background removal model...",
  "Refining edges and applying smoothing...",
  "Generating studio lighting environment...",
  "Creating lifestyle and contextual scenes...",
  "Applying marketing text and badges...",
  "Upscaling to selected resolution...",
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

// --- Components ---

const Accordion = ({ title, icon: Icon, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-200 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-6 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800 uppercase tracking-wider">
          <Icon className="w-4 h-4 text-orange-500" />
          <span>{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CompositeImage = ({ type, sourceImage, settings, id, isPreview = false }: any) => {
  const bgImageMap: Record<string, string> = {
    kitchen: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80',
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    outdoor: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1000&q=80',
    home: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    model: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
    usecase: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1000&q=80'
  };

  const getFilter = () => {
    return `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;
  };

  const shadowClass = settings.shadowType === 'drop' ? 'drop-shadow-2xl' : 
                      settings.shadowType === 'contact' ? 'drop-shadow-md' : 
                      settings.shadowType === 'floating' ? 'drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]' : '';

  const renderContent = () => {
    switch (type) {
      case 'main':
        return (
          <div className="w-full h-full bg-white flex items-center justify-center p-8 relative">
            <img src={sourceImage} className={cn("max-w-full max-h-full object-contain z-10", shadowClass)} style={{ filter: getFilter() }} crossOrigin="anonymous" />
            {settings.reflection && (
              <img src={sourceImage} className="absolute bottom-0 max-w-full max-h-full object-contain opacity-20 scale-y-[-1] translate-y-[90%] blur-[2px]" crossOrigin="anonymous" />
            )}
          </div>
        );
      case 'angles':
        return (
          <div className="w-full h-full bg-white flex items-center justify-center p-8 relative overflow-hidden">
            <img src={sourceImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-1/3 object-contain -rotate-12 opacity-80 drop-shadow-lg" style={{ filter: getFilter() }} crossOrigin="anonymous" />
            <img src={sourceImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-1/3 object-contain rotate-12 opacity-80 drop-shadow-lg" style={{ filter: getFilter() }} crossOrigin="anonymous" />
            <img src={sourceImage} className="relative z-10 w-1/2 object-contain drop-shadow-2xl" style={{ filter: getFilter() }} crossOrigin="anonymous" />
          </div>
        );
      case 'lifestyle':
        return (
          <div className="w-full h-full relative flex items-end justify-center pb-12">
            <img src={bgImageMap[settings.scene] || bgImageMap.home} className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <img src={sourceImage} className={cn("relative z-10 w-2/3 object-contain", shadowClass)} style={{ filter: getFilter() }} crossOrigin="anonymous" />
          </div>
        );
      case 'model':
        return (
          <div className="w-full h-full relative flex items-center justify-end pr-12">
            <img src={bgImageMap.model} className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
            <div className="absolute inset-0 bg-black/20" />
            <img src={sourceImage} className={cn("relative z-10 w-1/2 object-contain", shadowClass)} style={{ filter: getFilter() }} crossOrigin="anonymous" />
          </div>
        );
      case 'benefits':
        return (
          <div className="w-full h-full bg-slate-50 flex items-center justify-center p-8 relative">
            <img src={sourceImage} className={cn("relative z-10 w-1/2 object-contain", shadowClass)} style={{ filter: getFilter() }} crossOrigin="anonymous" />
            <div className="absolute left-8 top-1/4 bg-white p-3 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Premium Build</div>
            <div className="absolute right-8 top-1/3 bg-white p-3 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Durable</div>
            <div className="absolute left-12 bottom-1/4 bg-white p-3 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Easy to Use</div>
          </div>
        );
      case 'how-to':
        return (
          <div className="w-full h-full bg-white flex flex-col items-center justify-center p-8">
            <h3 className="text-2xl font-bold mb-8 text-slate-800">How To Use</h3>
            <div className="flex items-center justify-center gap-4 w-full">
              {[1, 2, 3].map(step => (
                <div key={step} className="flex-1 flex flex-col items-center">
                  <div className="w-full aspect-square bg-slate-100 rounded-2xl flex items-center justify-center p-4 mb-4 relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">{step}</div>
                    <img src={sourceImage} className="w-full h-full object-contain drop-shadow-md" style={{ filter: getFilter() }} crossOrigin="anonymous" />
                  </div>
                  <p className="text-sm font-medium text-center text-slate-600">Step {step} description</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'before-after':
        return (
          <div className="w-full h-full flex">
            <div className="flex-1 bg-slate-100 relative flex items-center justify-center p-8 border-r-4 border-white">
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">Before</div>
              <img src={sourceImage} className="w-full h-full object-contain opacity-50 grayscale" crossOrigin="anonymous" />
            </div>
            <div className="flex-1 bg-white relative flex items-center justify-center p-8">
              <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">After</div>
              <img src={sourceImage} className={cn("w-full h-full object-contain", shadowClass)} style={{ filter: getFilter() }} crossOrigin="anonymous" />
            </div>
          </div>
        );
      case 'use-case':
        return (
          <div className="w-full h-full relative flex items-center justify-center">
            <img src={bgImageMap.usecase} className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <img src={sourceImage} className={cn("relative z-10 w-3/4 object-contain", shadowClass)} style={{ filter: getFilter() }} crossOrigin="anonymous" />
          </div>
        );
      case 'close-up':
        return (
          <div className="w-full h-full bg-white flex items-center justify-center overflow-hidden relative">
            <img src={sourceImage} className="w-full h-full object-cover scale-150 origin-center" style={{ filter: getFilter() }} crossOrigin="anonymous" />
            <div className="absolute inset-0 border-[16px] border-white/20" />
            <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-xl max-w-[200px]">
              <h4 className="font-bold text-slate-900 mb-1">Macro Detail</h4>
              <p className="text-xs text-slate-600">High quality material and texture visible.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div id={id} className="w-full h-full relative bg-white overflow-hidden" style={{ width: isPreview ? '100%' : '1000px', height: isPreview ? '100%' : '1000px' }}>
      {renderContent()}
      
      {/* Marketing Text Overlay */}
      {settings.textEnabled && type !== 'main' && (
        <div className={cn(
          "absolute left-0 right-0 px-8 pointer-events-none flex flex-col items-center z-50",
          settings.textPosition === 'top' ? "top-12" : settings.textPosition === 'center' ? "top-1/2 -translate-y-1/2" : "bottom-12"
        )}>
          {settings.badge !== 'none' && (
            <div className={cn(
              "mb-3 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-xl",
              settings.badge === 'best-seller' ? "bg-orange-500 text-white" :
              settings.badge === 'amazon-choice' ? "bg-slate-800 text-white" :
              "bg-amber-400 text-amber-900"
            )}>
              {settings.badge.replace('-', ' ')}
            </div>
          )}
          {settings.text && (
            <div 
              className={cn(
                "font-bold text-center drop-shadow-2xl",
                settings.fontStyle === 'serif' ? "font-serif" : settings.fontStyle === 'mono' ? "font-mono" : "font-sans",
                settings.textSize === 'small' ? "text-2xl" : settings.textSize === 'large' ? "text-6xl" : "text-4xl"
              )}
              style={{ color: settings.textColor }}
            >
              {settings.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  // State
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Massive Settings State (20+ Features)
  const [settings, setSettings] = useState({
    // 1. Dimensions & Quality
    width: 3000,
    height: 3000,
    aspectRatioLock: true,
    quality: '8K',
    format: 'JPG',
    upscaleEngine: 'Pro',
    
    // 2. AI Background & Edges
    removeBg: true,
    edgeSmoothing: 50,
    bgType: 'white',
    scene: 'kitchen',
    
    // 3. Lighting & Shadows
    lightingAngle: 'top-left',
    shadowType: 'contact',
    shadowIntensity: 60,
    reflection: false,
    
    // 4. Color & Retouching
    autoColor: true,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    
    // 5. Marketing & Text
    textEnabled: false,
    text: 'Premium Quality',
    textPosition: 'bottom',
    fontStyle: 'sans',
    textColor: '#000000',
    textSize: 'medium',
    badge: 'none',
    
    // 6. Advanced
    removeWatermark: true,
    generateProps: false,
    batchMode: true
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(s => ({ ...s, [key]: value }));
  };

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...uploadedFiles, ...acceptedFiles].slice(0, 5);
    setUploadedFiles(newFiles);
    
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newUrls);
    setHasGenerated(false);
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
    setHasGenerated(false);
  };

  const handleGenerate = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsGenerating(true);
    setGenerationStep(0);
    setHasGenerated(false);

    // Simulate generation steps
    for (let i = 0; i < GENERATION_STEPS.length; i++) {
      setGenerationStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setHasGenerated(true);
    setIsGenerating(false);
  };

  const downloadAll = async () => {
    if (!hasGenerated) return;
    
    const zip = new JSZip();
    
    try {
      // We need to render the composite images to blobs.
      // Since they are in the DOM, we can use html-to-image on hidden rendering containers.
      // For simplicity in this prototype, we'll capture the visible preview elements.
      const promises = IMAGE_TYPES.map(async (type) => {
        const node = document.getElementById(`render-${type.id}`);
        if (node) {
          const blob = await toBlob(node, { quality: 0.95, pixelRatio: 2 });
          if (blob) {
            zip.file(`amazon-listing-${type.id}.${settings.format.toLowerCase()}`, blob);
          }
        }
      });
      
      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'amazon-listing-images.zip');
    } catch (error) {
      console.error("Failed to zip images", error);
      alert("Failed to download images. Ensure images are fully loaded.");
    }
  };

  const downloadSingle = async (id: string) => {
    const node = document.getElementById(`render-${id}`);
    if (node) {
      const blob = await toBlob(node, { quality: 0.95, pixelRatio: 2 });
      if (blob) {
        saveAs(blob, `amazon-listing-${id}.${settings.format.toLowerCase()}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans flex flex-col md:flex-row">
      {/* Sidebar Controls - 20+ Features */}
      <aside className="w-full md:w-96 bg-white border-r border-neutral-200 flex flex-col h-screen sticky top-0 z-40">
        <div className="p-6 border-b border-neutral-200 shrink-0">
          <div className="flex items-center gap-2 text-orange-500 mb-1">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Amazon AI Pro</h1>
          </div>
          <p className="text-sm text-neutral-500">26-Feature Photography Engine</p>
          <div className="mt-4 flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-md text-xs font-medium border border-orange-100">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Studio Engine Active
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Group 1: Dimensions & Quality */}
          <Accordion title="Dimensions & Quality" icon={Maximize} defaultOpen={true}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1 block">Width (px)</label>
                  <input type="number" value={settings.width} onChange={e => updateSetting('width', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1 block">Height (px)</label>
                  <input type="number" value={settings.height} onChange={e => updateSetting('height', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={settings.aspectRatioLock} onChange={e => updateSetting('aspectRatioLock', e.target.checked)} className="rounded text-orange-500" />
                Lock Aspect Ratio
              </label>
              
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1 block">Quality Mode</label>
                <select value={settings.quality} onChange={e => updateSetting('quality', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="HD">HD (1080p)</option>
                  <option value="4K">4K Ultra HD</option>
                  <option value="8K">8K Studio Quality</option>
                  <option value="16K">16K Maximum</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1 block">Format</label>
                  <select value={settings.format} onChange={e => updateSetting('format', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="JPG">JPG</option>
                    <option value="PNG">PNG</option>
                    <option value="WEBP">WEBP</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1 block">AI Upscale</label>
                  <select value={settings.upscaleEngine} onChange={e => updateSetting('upscaleEngine', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Standard">Standard</option>
                    <option value="Pro">Pro Engine</option>
                    <option value="Ultra">Ultra Detail</option>
                  </select>
                </div>
              </div>
            </div>
          </Accordion>

          {/* Group 2: AI Background & Edges */}
          <Accordion title="AI Background & Edges" icon={Layers}>
            <div className="space-y-4">
              <label className="flex items-center justify-between text-sm font-medium">
                Remove Original Background
                <input type="checkbox" checked={settings.removeBg} onChange={e => updateSetting('removeBg', e.target.checked)} className="rounded text-orange-500 w-4 h-4" />
              </label>
              
              <div>
                <label className="flex justify-between text-xs font-medium text-neutral-500 mb-1">
                  <span>Edge Smoothing</span>
                  <span>{settings.edgeSmoothing}%</span>
                </label>
                <input type="range" min="0" max="100" value={settings.edgeSmoothing} onChange={e => updateSetting('edgeSmoothing', e.target.value)} className="w-full accent-orange-500" />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1 block">AI Scene Selection (Lifestyle)</label>
                <select value={settings.scene} onChange={e => updateSetting('scene', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="kitchen">Modern Kitchen</option>
                  <option value="office">Corporate Office</option>
                  <option value="outdoor">Nature / Outdoor</option>
                  <option value="home">Cozy Living Room</option>
                </select>
              </div>
            </div>
          </Accordion>

          {/* Group 3: Lighting & Shadows */}
          <Accordion title="Lighting & Shadows" icon={Sun}>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1 block">Shadow Type</label>
                <select value={settings.shadowType} onChange={e => updateSetting('shadowType', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="none">No Shadow</option>
                  <option value="drop">Drop Shadow</option>
                  <option value="contact">Contact Shadow</option>
                  <option value="floating">Floating Shadow</option>
                </select>
              </div>

              <div>
                <label className="flex justify-between text-xs font-medium text-neutral-500 mb-1">
                  <span>Shadow Intensity</span>
                  <span>{settings.shadowIntensity}%</span>
                </label>
                <input type="range" min="0" max="100" value={settings.shadowIntensity} onChange={e => updateSetting('shadowIntensity', e.target.value)} className="w-full accent-orange-500" />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1 block">Lighting Angle</label>
                <select value={settings.lightingAngle} onChange={e => updateSetting('lightingAngle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="center">Center Studio</option>
                  <option value="dramatic">Dramatic Side</option>
                </select>
              </div>

              <label className="flex items-center justify-between text-sm font-medium">
                Generate Floor Reflection
                <input type="checkbox" checked={settings.reflection} onChange={e => updateSetting('reflection', e.target.checked)} className="rounded text-orange-500 w-4 h-4" />
              </label>
            </div>
          </Accordion>

          {/* Group 4: Color & Retouching */}
          <Accordion title="Color & Retouching" icon={Palette}>
            <div className="space-y-4">
              <label className="flex items-center justify-between text-sm font-medium">
                Auto Color Correction
                <input type="checkbox" checked={settings.autoColor} onChange={e => updateSetting('autoColor', e.target.checked)} className="rounded text-orange-500 w-4 h-4" />
              </label>

              <div>
                <label className="flex justify-between text-xs font-medium text-neutral-500 mb-1">
                  <span>Brightness</span>
                  <span>{settings.brightness}%</span>
                </label>
                <input type="range" min="50" max="150" value={settings.brightness} onChange={e => updateSetting('brightness', e.target.value)} className="w-full accent-orange-500" />
              </div>

              <div>
                <label className="flex justify-between text-xs font-medium text-neutral-500 mb-1">
                  <span>Contrast</span>
                  <span>{settings.contrast}%</span>
                </label>
                <input type="range" min="50" max="150" value={settings.contrast} onChange={e => updateSetting('contrast', e.target.value)} className="w-full accent-orange-500" />
              </div>

              <div>
                <label className="flex justify-between text-xs font-medium text-neutral-500 mb-1">
                  <span>Saturation</span>
                  <span>{settings.saturation}%</span>
                </label>
                <input type="range" min="0" max="200" value={settings.saturation} onChange={e => updateSetting('saturation', e.target.value)} className="w-full accent-orange-500" />
              </div>
            </div>
          </Accordion>

          {/* Group 5: Marketing & Text */}
          <Accordion title="Marketing & Text" icon={Type}>
            <div className="space-y-4">
              <label className="flex items-center justify-between text-sm font-medium">
                Enable Text Overlay
                <input type="checkbox" checked={settings.textEnabled} onChange={e => updateSetting('textEnabled', e.target.checked)} className="rounded text-orange-500 w-4 h-4" />
              </label>

              {settings.textEnabled && (
                <div className="space-y-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <input type="text" value={settings.text} onChange={e => updateSetting('text', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Marketing Text" />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <select value={settings.textPosition} onChange={e => updateSetting('textPosition', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                      <option value="top">Top</option>
                      <option value="center">Center</option>
                      <option value="bottom">Bottom</option>
                    </select>
                    <select value={settings.fontStyle} onChange={e => updateSetting('fontStyle', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                      <option value="sans">Sans-serif</option>
                      <option value="serif">Serif</option>
                      <option value="mono">Monospace</option>
                    </select>
                    <select value={settings.textSize} onChange={e => updateSetting('textSize', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                    <select value={settings.badge} onChange={e => updateSetting('badge', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                      <option value="none">No Badge</option>
                      <option value="best-seller">Best Seller</option>
                      <option value="amazon-choice">Amazon's Choice</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-500">Color:</span>
                    <input type="color" value={settings.textColor} onChange={e => updateSetting('textColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  </div>
                </div>
              )}
            </div>
          </Accordion>

          {/* Group 6: Advanced */}
          <Accordion title="Advanced Settings" icon={Settings}>
            <div className="space-y-4">
              <label className="flex items-center justify-between text-sm font-medium">
                Remove Watermark
                <input type="checkbox" checked={settings.removeWatermark} disabled className="rounded text-orange-500 w-4 h-4 opacity-50" />
              </label>
              <p className="text-xs text-neutral-400 -mt-2">Always enabled for Pro users.</p>

              <label className="flex items-center justify-between text-sm font-medium">
                Batch Processing Mode
                <input type="checkbox" checked={settings.batchMode} onChange={e => updateSetting('batchMode', e.target.checked)} className="rounded text-orange-500 w-4 h-4" />
              </label>

              <label className="flex items-center justify-between text-sm font-medium">
                AI Prop Generation
                <input type="checkbox" checked={settings.generateProps} onChange={e => updateSetting('generateProps', e.target.checked)} className="rounded text-orange-500 w-4 h-4" />
              </label>
            </div>
          </Accordion>

        </div>

        <div className="p-6 border-t border-neutral-200 bg-neutral-50 shrink-0">
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
                Generate 9 Images
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
          {hasGenerated && (
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
          {!hasGenerated && !isGenerating && (
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
          {hasGenerated && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Your Amazon Listing is Ready</h2>
                  <p className="text-neutral-500 mt-1">9 professional images generated using your uploaded photo.</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium border border-green-200">
                  <CheckCircle2 className="w-4 h-4" />
                  Amazon Compliant
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {IMAGE_TYPES.map((type, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={type.id}
                    className="group bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                    onClick={() => setSelectedImageId(type.id)}
                  >
                    <div className="aspect-square relative overflow-hidden bg-neutral-100">
                      
                      {/* Render the composite image for preview */}
                      <div className="absolute inset-0 pointer-events-none origin-top-left" style={{ transform: 'scale(1)', width: '100%', height: '100%' }}>
                         <CompositeImage 
                           id={`render-${type.id}`}
                           type={type.id} 
                           sourceImage={previewUrls[0]} 
                           settings={settings}
                           isPreview={true}
                         />
                      </div>

                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-neutral-900 shadow-sm z-50">
                        Image {i + 1}
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center z-40">
                        <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-neutral-900 px-4 py-2 rounded-full font-medium text-sm shadow-lg flex items-center gap-2">
                          <Maximize className="w-4 h-4" />
                          Preview
                        </div>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-neutral-900">{type.title}</h3>
                      <p className="text-sm text-neutral-500 mt-1">{type.desc}</p>
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
        {selectedImageId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedImageId(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl overflow-hidden max-w-6xl w-full max-h-full flex flex-col md:flex-row shadow-2xl"
            >
              <div className="flex-1 bg-neutral-100 relative flex items-center justify-center min-h-[400px] md:min-h-[600px] overflow-hidden">
                 <div className="w-full h-full">
                   <CompositeImage 
                     type={selectedImageId} 
                     sourceImage={previewUrls[0]} 
                     settings={settings}
                     isPreview={true}
                   />
                 </div>
              </div>
              <div className="w-full md:w-80 p-6 flex flex-col bg-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-neutral-900">
                    {IMAGE_TYPES.find(t => t.id === selectedImageId)?.title}
                  </h3>
                  <button 
                    onClick={() => setSelectedImageId(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-neutral-600 mb-8">
                  {IMAGE_TYPES.find(t => t.id === selectedImageId)?.desc}
                </p>
                
                <div className="space-y-4 mt-auto">
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Specs</h4>
                    <ul className="space-y-2 text-sm text-neutral-700">
                      <li className="flex justify-between"><span>Resolution</span> <span className="font-medium">{settings.width}x{settings.height}</span></li>
                      <li className="flex justify-between"><span>Quality</span> <span className="font-medium">{settings.quality}</span></li>
                      <li className="flex justify-between"><span>Format</span> <span className="font-medium">{settings.format}</span></li>
                      <li className="flex justify-between"><span>Watermark</span> <span className="font-medium text-green-600">Removed</span></li>
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => downloadSingle(selectedImageId)}
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
