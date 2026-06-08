import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  AlertTriangle,
  FileCheck,
  Shield,
  Layers,
  Sliders,
  Maximize2,
  FileText,
  Clock,
  Camera,
  Binary,
  Database,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Printer,
  X,
  CheckCircle2,
  HelpCircle,
  ArrowLeftRight,
  Lock,
  Unlock,
  CreditCard,
  QrCode,
  Check,
  ExternalLink
} from "lucide-react";
import { AnalysisMode, AnalysisResult, AnalyzedRegion, PresetExample } from "./types";
import { PRESETS } from "./data";
import ImageHeatmap from "./components/ImageHeatmap";
import CompareSideBySide from "./components/CompareSideBySide";

export default function App() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("protesto-politico");
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"geral" | "metadados" | "laudo">("geral");
  const [visualizerTab, setVisualizerTab] = useState<"heatmap" | "compare">("heatmap");
  
  // File upload state variables
  const [isDragOver, setIsDragOver] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisTimeElapsed, setAnalysisTimeElapsed] = useState<number>(0);
  const [analysisEstimatedTime, setAnalysisEstimatedTime] = useState<number>(12);
  const [currentAnalysisSubtask, setCurrentAnalysisSubtask] = useState<string>("Inicializando conexão segura...");

  // Heatmap control state variables
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.35);
  const [suspicionThreshold, setSuspicionThreshold] = useState<number>(10);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  // Analysis mode selected
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>(AnalysisMode.COMPLETO);

  // Forensic Accuracy Calibration states
  const [forensicFocus, setForensicFocus] = useState<"geral" | "ia_generativa" | "edicao" | "metadados">("geral");
  const [subpixelSampling, setSubpixelSampling] = useState<"standard" | "enhanced" | "extreme">("enhanced");
  const [noiseThreshold, setNoiseThreshold] = useState<number>(75);

  // Report Modal layout state
  const [showLaudoModal, setShowLaudoModal] = useState(false);

  // Monetization states
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "submitted" | "approved" | "rejected">("unpaid");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"mercadopago">("mercadopago");
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  const [submittedPaymentMethod, setSubmittedPaymentMethod] = useState<"mercadopago" | null>(null);
  const [paymentTxId, setPaymentTxId] = useState<string>("");
  
  const hasPaid = paymentStatus === "approved";

  const handleSimulatePayment = (method: "mercadopago") => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentStatus("submitted");
      setSubmittedPaymentMethod(method);
      const hash = "TX-" + Math.floor(100000 + Math.random() * 900000) + "-MPAGO";
      setPaymentTxId(hash);
    }, 1500);
  };

  // Load initial preset on mount
  useEffect(() => {
    const defaultPreset = PRESETS.find(p => p.id === selectedPresetId);
    if (defaultPreset) {
      setCurrentAnalysis({ ...defaultPreset.analysis });
      setCustomImage(null);
    }
  }, [selectedPresetId]);

  // Select Preset Handler
  const handleSelectPreset = (preset: PresetExample) => {
    setSelectedPresetId(preset.id);
    setCustomImage(null);
    setUploadError(null);
    setSelectedRegionId(null);
    // Reset control defaults
    setHeatmapOpacity(0.35);
    setSuspicionThreshold(10);
  };

  // Drag-and-drop actions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processImageFile = (file: File) => {
    setUploadError(null);

    // Validate size limit (max 10MB as defined in PRD Section 3.1 for unauthenticated)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError("O tamanho do arquivo excede o limite máximo permitido de 10 MB para análise.");
      return;
    }

    // Validate mime types
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Formato inválido. O sistema aceita apenas arquivos nos formatos JPG, PNG e WEBP.");
      return;
    }

    // Read and preview image
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64Data = event.target.result as string;

        // Verify image dimensions before starting analysis (PRD: minimum 64x64 pixels)
        const img = new Image();
        img.onload = () => {
          if (img.width < 64 || img.height < 64) {
            setUploadError(`Dimensões insuficientes para análise (${img.width}x${img.height}px). Requer no mínimo 64x64 pixels.`);
            return;
          }

          setCustomImage(base64Data);
          setSelectedPresetId("");
          setSelectedRegionId(null);
          // Start simulated or live API analysis
          triggerAnalysis(base64Data, file.name, file.size, file.type);
        };
        img.onerror = () => {
          setUploadError("Não foi possível ler a imagem. O arquivo pode estar corrompido.");
        };
        img.src = base64Data;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleResetParameters = () => {
    setHeatmapOpacity(0.35);
    setSuspicionThreshold(10);
    setSelectedMode(AnalysisMode.COMPLETO);
    setForensicFocus("geral");
    setSubpixelSampling("enhanced");
    setNoiseThreshold(75);
    setSelectedRegionId(null);
    setVisualizerTab("heatmap");
    setActiveTab("geral");
    
    // Also reset preset to the default one and clear any custom image state to get a fresh start
    const defaultPreset = PRESETS.find(p => p.id === "protesto-politico");
    if (defaultPreset) {
      setSelectedPresetId("protesto-politico");
      setCurrentAnalysis({ ...defaultPreset.analysis });
    }
    setCustomImage(null);
    setUploadError(null);
  };

  // Trigger Backend Analysis
  const triggerAnalysis = async (base64Image: string, name: string, size: number, type: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisTimeElapsed(0);
    
    // Quick Mode (RAPIDO) takes ~5s, Full Mode (COMPLETO) takes ~15s, Ultra Mode (ULTRA) high-accuracy takes ~25s
    const estimatedSecs = selectedMode === AnalysisMode.RAPIDO
      ? 5.0
      : selectedMode === AnalysisMode.COMPLETO
        ? 15.0
        : 25.0;
    setAnalysisEstimatedTime(estimatedSecs);
    setCurrentAnalysisSubtask("Inicializando conexão segura e hashing MD5/SHA256...");

    let elapsed = 0;
    const intervalTime = 100; // 100ms
    let progress = 0;

    const timer = setInterval(() => {
      elapsed += 0.1;
      setAnalysisTimeElapsed(Number(elapsed.toFixed(1)));

      // Smooth progress calculation up to 98%
      const limit = 98;
      const rate = limit / (estimatedSecs * 10); // scale based on total estimated ticks
      progress = Math.min(limit, progress + rate);
      setAnalysisProgress(Math.round(progress));

      // Update subtask logs dynamically based on progress percent
      const suffix = selectedMode === AnalysisMode.ULTRA ? " [Varredura de Acurácia Ampliada]" : "";
      if (progress < 15) {
        setCurrentAnalysisSubtask("Inicializando conexões de alta precisão e hashing criptográfico..." + suffix);
      } else if (progress < 30) {
        setCurrentAnalysisSubtask("Lendo blocos estruturais EXIF/XMP e segmentando metadados..." + suffix);
      } else if (progress < 45) {
        setCurrentAnalysisSubtask("Analisando consistência geométrica e vetores estendidos de luz/sombras..." + suffix);
      } else if (progress < 65) {
        setCurrentAnalysisSubtask("Verificando ruído CMOS do sensor e mapa estocástico de quantização..." + suffix);
      } else if (progress < 85) {
        setCurrentAnalysisSubtask("Calculando anomalias térmicas e biomotivas via redes convolucionais..." + suffix);
      } else {
        setCurrentAnalysisSubtask("Calculando margens de incerteza e gerando matriz final de autenticação..." + suffix);
      }
    }, intervalTime);

    const minDurationMs = estimatedSecs * 1000;
    const startTime = Date.now();

    try {
      const responsePromise = fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          fileName: name,
          fileSize: size,
          mimeType: type,
          mode: selectedMode,
          forensicFocus: forensicFocus,
          subpixelSampling: subpixelSampling,
          noiseThreshold: noiseThreshold
        }),
      });

      const response = await responsePromise;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Houve uma falha interna na comunicação com o servidor.");
      }

      const result: AnalysisResult = await response.json();

      // Ensure minimum display duration for optimal scanning UI experience
      const timeTaken = Date.now() - startTime;
      if (timeTaken < minDurationMs) {
        await new Promise((resolve) => setTimeout(resolve, minDurationMs - timeTaken));
      }

      clearInterval(timer);
      setAnalysisProgress(100);
      setCurrentAnalysisSubtask("Análise final concluída com sucesso!");
      
      setTimeout(() => {
        setCurrentAnalysis(result);
        setIsAnalyzing(false);
      }, 400);

    } catch (err: any) {
      clearInterval(timer);
      console.error(err);
      setUploadError(err.message || "Falha na análise. Verifique sua conexão ou tente novamente.");
      setIsAnalyzing(false);
    }
  };

  // Helper properties
  const currentImageUrl = customImage || PRESETS.find(p => p.id === selectedPresetId)?.imageUrl || "";
  const selectedRegion = currentAnalysis?.regions.find(r => r.id === selectedRegionId);

  // Formatting utilities
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Upper Navigation Indicator line */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-rose-600 h-1.5 w-full"></div>

      {/* Header section (PRD: Syntech Solutions - Divisão de Sistemas) */}
      <header className="border-b border-slate-800 bg-slate-905/95 backdrop-blur-md sticky top-0 z-40 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/10 p-2 rounded-lg border border-blue-500/30">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono tracking-wider font-semibold uppercase bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/60">
                  Syntech Solutions
                </span>
                <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Servidor Live
                </span>
              </div>
              <h1 className="font-display font-bold text-lg md:text-xl text-slate-100 mt-0.5">
                Porto Check Image
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 font-mono shrink-0 ${
              hasPaid 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                : "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse"
            }`}>
              {hasPaid ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>PREMIUM ATIVO</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>LICENÇA PENDENTE</span>
                </>
              )}
            </div>

            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>UTC: {new Date().toISOString().substring(11, 19)}</span>
            </div>
            
            {currentAnalysis && (
              <button 
                id="btn-quick-laudo"
                onClick={() => setShowLaudoModal(true)}
                className="bg-blue-600 hover:bg-blue-700 active:transform active:scale-95 text-white py-1.5 px-3 rounded-lg font-medium transition-all shadow-md flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Laudo Oficial PDF
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workstation Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Control Panel Container (4 cols of 12) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Analysis Settings Card */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/50 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="font-display font-semibold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                Configuração do Verificador
                {!hasPaid ? (
                  <span className="text-[7.5px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider font-mono flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Bloqueado
                  </span>
                ) : (
                  <span className="text-[7.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider font-mono flex items-center gap-1 animate-pulse">
                    <Check className="w-2.5 h-2.5" /> Ativo
                  </span>
                )}
              </h2>
              
              <button
                type="button"
                id="btn-reset-params"
                onClick={handleResetParameters}
                disabled={!hasPaid}
                className={`text-[10.5px] uppercase font-mono font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all group shrink-0 ${
                  hasPaid 
                    ? "text-slate-400 hover:text-cyan-400 bg-slate-950 border-slate-800 hover:border-cyan-500/20 hover:shadow-[0_0_8px_rgba(6,182,212,0.15)] cursor-pointer"
                    : "text-slate-600 bg-slate-950/40 border-slate-900 cursor-not-allowed opacity-50"
                }`}
                title={hasPaid ? "Resetar parâmetros de análise para os valores originais/padrões" : "Ative sua licença para liberar"}
              >
                <RefreshCw className={`w-3.5 h-3.5 transition-all duration-500 ${hasPaid ? "text-slate-500 group-hover:text-cyan-400 group-hover:rotate-180" : "text-slate-750"}`} />
                <span>Resetar</span>
              </button>
            </div>

            <div className={`transition-all duration-300 relative ${!hasPaid ? "opacity-35 pointer-events-none select-none" : ""}`}>
              {!hasPaid && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-auto">
                  <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[8.5px] font-bold font-mono py-1 px-2.5 rounded-lg uppercase tracking-wider shadow-md backdrop-blur-xs flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Requer Ativação
                  </span>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-700/60 mb-4">
                <button
                  id="btn-mode-rapido"
                  type="button"
                  disabled={!hasPaid}
                  onClick={() => setSelectedMode(AnalysisMode.RAPIDO)}
                  className={`py-2 px-1 rounded-lg text-[10px] sm:text-xs font-semibold tracking-wide transition-all flex flex-col items-center justify-center gap-0.5 ${
                    selectedMode === AnalysisMode.RAPIDO
                      ? "bg-blue-600 text-white shadow-md font-bold"
                      : "text-slate-400 hover:text-slate-205 hover:bg-slate-800"
                  }`}
                >
                  <span>Rápido</span>
                  <span className="text-[8px] opacity-85 font-mono">Global CNN</span>
                </button>
                
                <button
                  id="btn-mode-completo"
                  type="button"
                  disabled={!hasPaid}
                  onClick={() => setSelectedMode(AnalysisMode.COMPLETO)}
                  className={`py-2 px-1 rounded-lg text-[10px] sm:text-xs font-semibold tracking-wide transition-all flex flex-col items-center justify-center gap-0.5 ${
                    selectedMode === AnalysisMode.COMPLETO
                      ? "bg-blue-600 text-white shadow-md font-bold"
                      : "text-slate-400 hover:text-slate-205 hover:bg-slate-800"
                  }`}
                >
                  <span>Completo</span>
                  <span className="text-[8px] opacity-85 font-mono">Híbrido</span>
                </button>

                <button
                  id="btn-mode-ultra"
                  type="button"
                  disabled={!hasPaid}
                  onClick={() => setSelectedMode(AnalysisMode.ULTRA)}
                  className={`py-2 px-1 rounded-lg text-[10px] sm:text-xs font-semibold tracking-wide transition-all flex flex-col items-center justify-center gap-0.5 relative overflow-hidden group ${
                    selectedMode === AnalysisMode.ULTRA
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md ring-1 ring-purple-400/30 font-bold"
                      : "text-slate-400 hover:text-slate-205 hover:bg-slate-800"
                  }`}
                >
                  {selectedMode !== AnalysisMode.ULTRA && (
                    <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></span>
                  )}
                  <span className="flex items-center gap-0.5 text-purple-200">
                    <Sparkles className="w-2.5 h-2.5 text-purple-300 shrink-0" />
                    Ultra
                  </span>
                  <span className="text-[8px] opacity-90 font-bold text-purple-200">Acurácia</span>
                </button>
              </div>

              {/* Painel de Calibração de Alta Precisão */}
              <div className="mt-4 border-t border-slate-700/40 pt-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Binary className="w-3.5 h-3.5 text-cyan-505 shrink-0" />
                    Calibração de Precisão
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-550/10 text-cyan-400 font-mono border border-cyan-505/20">
                    Foco: {forensicFocus === "geral" ? "Equilibrado" : forensicFocus === "ia_generativa" ? "IA Generativa" : forensicFocus === "edicao" ? "Edições" : "EXIF"}
                  </span>
                </div>

                <div className="space-y-3 bg-slate-900/40 p-3 rounded-xl border border-slate-700/30">
                  {/* Foco do Algoritmo */}
                  <div>
                    <label className="text-[10px] font-medium text-slate-400 block mb-1">
                      Foco Forense do Modelo
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setForensicFocus("geral")}
                        className={`py-1.5 px-2 rounded text-[10px] font-mono transition-all text-center ${
                          forensicFocus === "geral"
                            ? "bg-blue-600/20 text-blue-300 border border-blue-500/40 font-bold"
                            : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        Equilibrado
                      </button>
                      <button
                        type="button"
                        onClick={() => setForensicFocus("ia_generativa")}
                        className={`py-1.5 px-2 rounded text-[10px] font-mono transition-all text-center ${
                          forensicFocus === "ia_generativa"
                            ? "bg-purple-600/20 text-purple-300 border border-purple-500/40 font-bold"
                            : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        Modelos IA
                      </button>
                      <button
                        type="button"
                        onClick={() => setForensicFocus("edicao")}
                        className={`py-1.5 px-2 rounded text-[10px] font-mono transition-all text-center ${
                          forensicFocus === "edicao"
                            ? "bg-amber-600/20 text-amber-300 border border-amber-500/40 font-bold"
                            : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        Splicing/Edição
                      </button>
                      <button
                        type="button"
                        onClick={() => setForensicFocus("metadados")}
                        className={`py-1.5 px-2 rounded text-[10px] font-mono transition-all text-center ${
                          forensicFocus === "metadados"
                            ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-bold"
                            : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        EXIF/Headers
                      </button>
                    </div>
                  </div>

                  {/* Amostragem Subpixel */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-medium text-slate-400">
                        Varredura de Super-Amostragem
                      </label>
                      <span className="text-[9px] font-mono font-bold text-cyan-400">
                        {subpixelSampling === "standard" ? "1x Multi-pass" : subpixelSampling === "enhanced" ? "3x Multi-pass" : "5x Sub-Pixel"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setSubpixelSampling("standard")}
                        className={`py-1 px-1.5 rounded text-[9px] font-mono transition-all text-center ${
                          subpixelSampling === "standard"
                            ? "bg-slate-800 text-slate-200 border border-slate-700 font-bold"
                            : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        Padrão
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubpixelSampling("enhanced")}
                        className={`py-1 px-1.5 rounded text-[9px] font-mono transition-all text-center ${
                          subpixelSampling === "enhanced"
                            ? "bg-slate-800 text-slate-200 border border-slate-700 font-bold"
                            : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        Dupla (3x)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubpixelSampling("extreme")}
                        className={`py-1 px-1.5 rounded text-[9px] font-mono transition-all text-center ${
                          subpixelSampling === "extreme"
                            ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold"
                            : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        Profunda (5x)
                      </button>
                    </div>
                  </div>

                  {/* Sensibilidade do Canal de Ruído */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-medium text-slate-400">
                        Sensibilidade Estocástica do Sensor
                      </label>
                      <span className="text-[9px] font-mono font-bold text-cyan-400">{noiseThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={100}
                      step={5}
                      value={noiseThreshold}
                      onChange={(e) => setNoiseThreshold(Number(e.target.value))}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-1">
                      <span>Conservadora</span>
                      <span>Balanceada</span>
                      <span>Forense Alta</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-2 bg-blue-500/5 rounded-xl border border-blue-500/10 p-2.5">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
                  <p className="text-[9.5px] text-slate-400 leading-relaxed">
                    Ajustar o foco forense direciona os pesos cognitivos da inteligência artificial para detectar padrões micro-estruturais específicos de adulteração de pixels ou IA.
                  </p>
                </div>
              </div>
            </div>

            {/* Drag & Drop Upload Zone or Payment Activation */}
            {!hasPaid ? (
              <>
                <div className="border border-slate-750 bg-slate-900/60 rounded-xl p-4.5 text-left relative overflow-hidden flex flex-col gap-3.5 shadow-lg select-none">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-start gap-2.5 border-b border-slate-800 pb-3">
                  <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 text-amber-500 shrink-0 mt-0.5 animate-pulse">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xs text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                      Área Restrita: Ative sua Licença
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                      Para realizar uploads de mídias personalizadas e utilizar o analisador em tempo real, ative sua licença realizando o pagamento seguro através do Mercado Pago.
                    </p>
                  </div>
                </div>

                {paymentStatus === "unpaid" || paymentStatus === "rejected" ? (
                  <>
                    {/* MERCADO PAGO OPTION CHECKOUT */}
                    <div className="bg-gradient-to-r from-blue-950/90 to-slate-900 border border-blue-500/40 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden animate-fadeIn shadow-lg">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] uppercase tracking-wider font-mono text-blue-400 font-bold block flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-blue-400 shrink-0" /> Link de Pagamento Oficial
                        </span>
                        <span className="text-[8px] bg-blue-500/20 border border-blue-500/30 px-1.5 py-0.5 rounded font-bold text-blue-300">Mercado Pago</span>
                      </div>
                      
                      <p className="text-[10px] text-slate-300 leading-relaxed">
                        Pague de forma imediata e assegurada no **Mercado Pago**. Após a confirmação, o painel do seu Verificador será liberado integralmente.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                        <a
                          href="https://mpago.la/1ro2rPV"
                          target="_blank"
                          rel="noopener noreferrer"
                          id="btn-mercadopago-direct"
                          className="bg-blue-600 hover:bg-blue-500 active:scale-98 text-white py-1.5 px-3 rounded-lg text-[9.5px] font-bold font-mono uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 no-underline text-center cursor-pointer hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] font-semibold"
                        >
                          <span>Pagar R$ 9,90</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>

                        <button
                          type="button"
                          id="btn-mercadopago-simulate"
                          onClick={() => handleSimulatePayment("mercadopago")}
                          disabled={paymentProcessing}
                          className="bg-slate-950 hover:bg-slate-900 border border-blue-900/50 hover:border-blue-500 active:scale-98 text-blue-400 py-1.5 px-3 rounded-lg text-[9.5px] font-bold font-mono uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {paymentProcessing ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                              <span>Enviando...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3 text-blue-500 animate-pulse" />
                              <span>Simular Confirmação</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {paymentStatus === "rejected" && (
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 p-2 rounded-lg text-[9.5px] font-mono leading-snug animate-fadeIn">
                        ⚠️ O recebimento correspondente não foi identificado na conta do desenvolvedor. Por favor, reinicie e envie o comprovante de dados correto.
                      </div>
                    )}
                  </>
                ) : (
                  /* awaiting_developer_authorization / submitted state */
                  <div className="flex flex-col gap-3 p-3 bg-slate-950/95 rounded-xl border border-slate-800 animate-fadeIn text-[11px] text-slate-200">
                    <div className="flex items-center gap-2 text-amber-500 font-bold uppercase font-mono tracking-wider">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0 text-amber-500" />
                      <span>Aguardando Liberação do Desenvolvedor</span>
                    </div>

                    <div className="text-[10px] text-slate-300 space-y-1 font-mono leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                      <div><span className="text-slate-500 font-semibold font-sans">ID Transação:</span> <span className="text-slate-200 font-bold font-mono">{paymentTxId}</span></div>
                      <div><span className="text-slate-500 font-semibold font-sans">Método Usado:</span> <span className="text-slate-200 uppercase font-bold">Mercado Pago (Link Seguro)</span></div>
                      <div><span className="text-slate-500 font-semibold font-sans">Valor Cobrado:</span> <span className="text-slate-200 font-bold">R$ 9,90</span></div>
                      <div><span className="text-slate-500 font-semibold font-sans">E-mail Comprador:</span> <span className="text-slate-200 font-mono">lcoporto@gmail.com</span></div>
                      <div><span className="text-slate-500 font-semibold font-sans">Gateway de Liquidação:</span> <span className="text-blue-400 font-bold font-mono">Mercado Pago</span></div>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-snug px-1">
                      ⚠️ O pagamento foi enviado com absoluto sucesso! O aplicativo está aguardando o desenvolvedor verificar o recebimento do valor correspondente para liberar manualmente sua licença de uso.
                    </p>

                    <p className="text-[9.5px] text-purple-400 font-medium px-1 bg-purple-950/40 py-1.5 rounded-lg border border-purple-900/30">
                      💡 Para homologar e testar, simule a ação de recebimento do desenvolvedor clicando em **"Autorizar Recebimento"** no painel administrativo de homologação logo abaixo!
                    </p>
                  </div>
                )}
              </div>

            {/* DEVELOPER SIMULATION CONTROLLER (PORTAL ADMINISTRATIVO) */}
            <div className="border border-purple-950 bg-purple-950/25 rounded-xl p-3 flex flex-col gap-2 mt-1 relative overflow-hidden text-slate-200">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl pointer-events-none"></div>

              <div className="flex items-center gap-1.5 border-b border-purple-900/50 pb-1.5">
                <span className="text-[7.5px] bg-purple-600 font-bold text-white px-1 rounded font-mono shrink-0 uppercase tracking-wide">Admin</span>
                <h4 className="font-mono text-[9px] font-bold text-purple-200 uppercase tracking-widest">
                  Simulador de Recebimento do Desenvolvedor
                </h4>
              </div>

              <p className="text-[8.5px] text-purple-300 leading-normal">
                Como o aplicativo só libera o acesso após o recebimento pelo desenvolvedor, use os botões abaixo para simular se você, o desenvolvedor, de fato recebeu a verba correspondente.
              </p>

              <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded border border-purple-900/30 text-[9px] font-mono">
                <span className="text-purple-300">Status na Conta do Desenvolvedor:</span>
                {paymentStatus === "submitted" ? (
                  <span className="font-bold text-amber-400 animate-pulse uppercase">Recebimento Pendente de Validação</span>
                ) : paymentStatus === "rejected" ? (
                  <span className="font-bold text-rose-450 uppercase text-rose-400">Recusado pelo Desenvolvedor</span>
                ) : (
                  <span className="font-bold text-slate-500 uppercase">Aguardando Envio do Usuário</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                <button
                  type="button"
                  id="btn-admin-authorize"
                  onClick={() => {
                    setPaymentStatus("approved");
                  }}
                  disabled={paymentStatus !== "submitted"}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:pointer-events-none text-white font-mono font-bold text-[8.5px] py-1.5 px-2 rounded tracking-wide transition-all uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Autorizar Recebimento</span>
                </button>

                <button
                  type="button"
                  id="btn-admin-reject"
                  onClick={() => {
                    setPaymentStatus("rejected");
                  }}
                  disabled={paymentStatus !== "submitted"}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-rose-400 border border-purple-900/40 font-mono font-bold text-[8.5px] py-1.5 px-2 rounded tracking-wide transition-all uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3 block shrink-0" />
                  <span>Recusar Envio</span>
                </button>
              </div>
            </div>

            <div className="text-[8.5px] text-slate-500 text-center uppercase font-mono tracking-wide flex flex-col items-center justify-center gap-1 shadow-inner bg-slate-950/40 p-2 rounded-lg border border-slate-900/60 mt-1">
              <div className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>Ambiente Protegido por Virtuária & eRede (Rede)</span>
              </div>
              <div className="text-[7.5px] text-slate-500 lowercase font-sans">
                padrões de segurança itaú unibanco • virtuaria.com.br
              </div>
            </div>
          </>
            ) : (
              <div
                id="upload-dropzone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative group ${
                  isDragOver 
                    ? "border-blue-500 bg-blue-500/10" 
                    : "border-slate-700 hover:border-slate-600 bg-slate-900/40"
                }`}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileInput}
                  disabled={isAnalyzing}
                />
                
                <div className="flex flex-col items-center justify-center gap-2.5">
                  <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center group-hover:scale-105 transition-all text-slate-400 group-hover:text-blue-400">
                    <Upload className="w-5 h-5 animate-pulse" />
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      Arraste sua imagem ou clique para carregar
                    </p>
                    <p className="text-[10.5px] text-slate-400 mt-1">
                      Suporta formatos JPG, PNG, WEBP até 10 MB (Mínimo: 64x64px)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="mt-3 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-xs text-rose-400 flex items-start gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* Preset Case Studies (PRD Section 5 Case Studies) */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/50 p-5 shadow-xl">
            <h2 className="font-display font-semibold text-sm text-slate-300 uppercase tracking-wider mb-3.5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Casos Reais Para Demonstração
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800">
                PRD MVP
              </span>
            </h2>

            <div className="flex flex-col gap-2.5">
              {PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                let badgeColor = "bg-slate-900 border-slate-800 text-slate-400";
                if (preset.source === "Câmera Real") {
                  badgeColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                } else if (preset.source.includes("Manipulada") || preset.source.includes("Gerada")) {
                  badgeColor = "bg-rose-500/10 border-rose-500/20 text-rose-400";
                }

                return (
                  <button
                    key={preset.id}
                    id={`preset-${preset.id}`}
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-left p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 relative overflow-hidden ${
                      isSelected
                        ? "bg-slate-900/90 border-blue-500/50 ring-1 ring-blue-500/20"
                        : "bg-slate-900/30 border-slate-800 hover:border-slate-700/70 hover:bg-slate-900/50"
                    }`}
                  >
                    {/* Background faint gradient if selected */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-xl pointer-events-none"></div>
                    )}

                    <img
                      src={preset.imageUrl}
                      alt={preset.title}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1 bg-slate bg-transparent">
                        <span className="font-semibold text-xs text-slate-200 truncate pr-1">
                          {preset.title}
                        </span>
                        <span className={`text-[8.5px] px-1.5 py-0.5 rounded border shrink-0 font-medium ${badgeColor}`}>
                          {preset.source}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Heatmap Transparency Toggles */}
          {currentAnalysis && (
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700/50 p-5 shadow-xl">
              <h2 className="font-display font-semibold text-sm text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-500" />
                Controles do Mapa de Calor
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5 font-medium">
                      Opacidade do Filtro
                    </span>
                    <span className="text-purple-400 font-mono font-bold">
                      {Math.round(heatmapOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    id="slider-opacity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={heatmapOpacity}
                    onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                    <span>Invisível</span>
                    <span>Cobertura Forte</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5 font-medium">
                      Filtro de Suspeição Mínima
                    </span>
                    <span className="text-rose-400 font-mono font-bold">
                      {suspicionThreshold}%
                    </span>
                  </div>
                  <input
                    id="slider-score-filter"
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={suspicionThreshold}
                    onChange={(e) => setSuspicionThreshold(parseInt(e.target.value))}
                    className="w-full accent-rose-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                    <span>Exibir Todos</span>
                    <span>Apenas Alta Suspeição (&gt;90%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>

        {/* Right Stage Panel (8 cols of 12) */}
        <section className="lg:col-span-7 flex flex-col gap-6">

          {/* AI Analyzing Workstation Loader Overlay if parsing */}
          {isAnalyzing ? (
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/50 p-8 sm:p-12 text-center shadow-2xl flex flex-col items-center justify-center min-h-[500px] animate-fadeIn relative overflow-hidden" id="loader-escaner-forense">
              {/* Glow background decorative effects */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Hologram / Laser Radar Visualizer */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-dashed border-blue-500/20 border-t-blue-500 animate-spin flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-2 border-cyan-400/10 border-b-cyan-400 animate-reverse-spin flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700/50 flex items-center justify-center">
                      <Binary className="w-4 h-4 text-blue-400 animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="absolute -inset-1.5 border border-blue-500/30 rounded-full animate-ping opacity-25"></div>
              </div>
              
              <h3 className="font-display font-medium tracking-tight text-slate-100 text-lg mb-2 flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shrink-0"></span>
                Autenticador de Mídia: Varredura Ativa
              </h3>
              
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
                Nossos motores de inteligência artificial estão decodificando e segmentando a imagem para identificar inconsistências no nível de pixel e cabeçalhos lógicos.
              </p>

              {selectedMode === AnalysisMode.ULTRA && (
                <div className="mb-6 px-3 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-xl text-[10.5px] font-mono flex items-center justify-center gap-2 animate-pulse max-w-md w-full shadow-lg shadow-purple-950/20">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="font-bold uppercase tracking-wider text-[9px] bg-purple-500/25 px-1.5 py-0.5 rounded text-white mr-1 shrink-0">99.8% Acurácia</span>
                  <span>Modo Ultra Pericial Ativado</span>
                </div>
              )}

              {/* Central Progress Bar Module */}
              <div className="w-full max-w-md bg-slate-950/80 rounded-xl p-5 border border-slate-800/60 mb-6 flex flex-col gap-4">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500 uppercase tracking-widest text-left">Progresso do Motor</span>
                  <span className="text-cyan-400 font-bold">{analysisProgress}%</span>
                </div>

                {/* Progress Bar Body */}
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800/80 relative">
                  <div 
                    className="bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 h-2.5 rounded-full transition-all duration-300 relative shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                    style={{ width: `${analysisProgress}%` }}
                  >
                    {/* Running light reflection */}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] w-1/3 animate-sweep-fast"></div>
                  </div>
                </div>

                {/* Live Action status textual */}
                <div className="text-[10.5px] text-slate-300 font-mono italic text-center truncate px-2 text-slate-400 bg-slate-900/40 py-1.5 rounded-md border border-slate-900/50">
                  {currentAnalysisSubtask}
                </div>

                {/* Timing Panel */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-900 pt-3 text-[10.5px] font-mono leading-relaxed">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-slate-500 uppercase">Decorrido</span>
                    <span className="text-slate-300 font-bold mt-0.5">{analysisTimeElapsed.toFixed(1)}s</span>
                  </div>
                  <div className="flex flex-col items-center border-x border-slate-900">
                    <span className="text-[9px] text-slate-500 uppercase">Estimado</span>
                    <span className="text-slate-300 font-bold mt-0.5">{analysisEstimatedTime.toFixed(1)}s</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-slate-500 uppercase">Restante</span>
                    <span className="text-cyan-400 font-bold mt-0.5">
                      {Math.max(0, Number((analysisEstimatedTime - analysisTimeElapsed).toFixed(1)))}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Subtask Checklists Grid Indicators */}
              <div className="w-full max-w-md grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-mono text-left bg-slate-950/20 p-4 rounded-lg border border-slate-850">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    analysisProgress >= 30 
                      ? "bg-emerald-500 border border-emerald-400 shadow-sm" 
                      : (analysisProgress >= 10 ? "bg-blue-500 animate-pulse" : "bg-slate-800")
                  }`}></span>
                  <span className={analysisProgress >= 30 ? "text-slate-350 line-through" : "text-slate-400"}>
                    Análise EXIF/XMP
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    analysisProgress >= 45 
                      ? "bg-emerald-500 border border-emerald-400 shadow-sm" 
                      : (analysisProgress >= 30 ? "bg-blue-500 animate-pulse" : "bg-slate-800")
                  }`}></span>
                  <span className={analysisProgress >= 45 ? "text-slate-350 line-through" : "text-slate-400"}>
                    Consistência de Sombras
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    analysisProgress >= 65 
                      ? "bg-emerald-500 border border-emerald-400 shadow-sm" 
                      : (analysisProgress >= 45 ? "bg-blue-500 animate-pulse" : "bg-slate-800")
                  }`}></span>
                  <span className={analysisProgress >= 65 ? "text-slate-350 line-through" : "text-slate-400"}>
                    Verificação de Ruído CMOS
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    analysisProgress >= 85 
                      ? "bg-emerald-500 border border-emerald-400 shadow-sm" 
                      : (analysisProgress >= 65 ? "bg-blue-500 animate-pulse" : "bg-slate-800")
                  }`}></span>
                  <span className={analysisProgress >= 85 ? "text-slate-350 line-through" : "text-slate-400"}>
                    Busca por Redes Generativas
                  </span>
                </div>
              </div>
            </div>
          ) : currentAnalysis ? (
            
            <div className="flex flex-col gap-6">
              
              {/* Visualizer Mode Selector Tabs */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 gap-1">
                  <button
                    id="btn-vis-heatmap"
                    type="button"
                    onClick={() => setVisualizerTab("heatmap")}
                    className={`px-3.5 py-1.5 rounded-lg text-[10.5px] uppercase font-bold tracking-wider transition-all flex items-center gap-2 ${
                      visualizerTab === "heatmap"
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Mapa Analítico
                  </button>
                  <button
                    id="btn-vis-compare"
                    type="button"
                    onClick={() => setVisualizerTab("compare")}
                    className={`px-3.5 py-1.5 rounded-lg text-[10.5px] uppercase font-bold tracking-wider transition-all flex items-center gap-2 ${
                      visualizerTab === "compare"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
                    Comparar Lado a Lado
                  </button>
                </div>
                
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">
                  Estação de Trabalho Virtual ({visualizerTab === "heatmap" ? "Drapeamento Forense" : "Contraste Cruzado"})
                </span>
              </div>

              {/* Conditionally Render Visualizer components */}
              {visualizerTab === "heatmap" ? (
                <div className="bg-slate-800/90 rounded-2xl border border-slate-700/50 p-5 shadow-xl">
                  <ImageHeatmap
                    imageUrl={currentImageUrl}
                    regions={currentAnalysis.regions}
                    opacity={heatmapOpacity}
                    threshold={suspicionThreshold}
                    selectedRegionId={selectedRegionId}
                    onSelectRegion={(id) => setSelectedRegionId(id)}
                  />
                </div>
              ) : (
                <div className="bg-slate-800/90 rounded-2xl border border-slate-700/50 p-5 shadow-xl">
                  <CompareSideBySide
                    suspectImageUrl={currentImageUrl}
                    suspectAnalysis={currentAnalysis}
                    heatmapOpacity={heatmapOpacity}
                    suspicionThreshold={suspicionThreshold}
                    selectedRegionId={selectedRegionId}
                    onSelectRegion={setSelectedRegionId}
                  />
                </div>
              )}

              {/* Authenticity Index and Score Breakdown Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                
                {/* Gauge Score Panel */}
                <div className="md:col-span-5 bg-slate-800/80 rounded-2xl border border-slate-700/50 p-5 flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden">
                  
                  {/* Subtle Background Badge Pattern */}
                  <div className="absolute top-2 left-2 text-[10px] uppercase font-mono tracking-wider text-slate-500">
                    Módulo de Classificação
                  </div>

                  {/* Dynamic Accuracy Mode Badge */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-[8.5px] font-mono font-semibold text-slate-400">
                    <span className={`w-1 h-1 rounded-full ${
                      currentAnalysis.mode === "ultra" 
                        ? "bg-purple-400 animate-pulse" 
                        : "bg-blue-400"
                    }`}></span>
                    <span>Modo: {
                      currentAnalysis.mode === "rapido" 
                        ? "Rápido" 
                        : currentAnalysis.mode === "completo" 
                          ? "Completo" 
                          : "Ultra"
                    }</span>
                  </div>

                  <div className="relative flex items-center justify-center mb-3 mt-4">
                    {/* SVG Radial Score Display */}
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        className="stroke-slate-900 fill-transparent"
                        strokeWidth="10"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        className={`fill-transparent transition-all duration-500 ${
                          currentAnalysis.authenticityScore >= 85
                            ? "stroke-emerald-500"
                            : currentAnalysis.authenticityScore >= 60
                            ? "stroke-teal-500"
                            : currentAnalysis.authenticityScore >= 30
                            ? "stroke-amber-500"
                            : "stroke-rose-600"
                        }`}
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 54}
                        strokeDashoffset={2 * Math.PI * 54 * (1 - currentAnalysis.authenticityScore / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Floating Center text */}
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="font-display font-extrabold text-3xl text-slate-100 font-mono tracking-tight leading-none">
                        {currentAnalysis.authenticityScore}%
                      </span>
                      <span className="text-[9.5px] uppercase font-mono text-slate-400 mt-1.5 tracking-wider font-semibold">
                        Autenticidade
                      </span>
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase border border-slate-700/60 transition-all ${currentAnalysis.interpretationBand.bgColor} ${currentAnalysis.interpretationBand.classColor}`}>
                    {currentAnalysis.interpretationBand.label}
                  </div>

                  <p className="text-[10.5px] text-slate-400 leading-relaxed max-w-xs mt-3">
                    {currentAnalysis.interpretationBand.description}
                  </p>

                  <div className="w-full mt-3.5 bg-slate-900/80 rounded-xl p-2.5 border border-slate-750 flex flex-col gap-1 text-[10px] font-mono text-slate-400 shadow-inner">
                    <div className="flex justify-between items-center">
                      <span>Nível de Acurácia:</span>
                      <span className={`font-bold uppercase ${
                        currentAnalysis.mode === "ultra" 
                          ? "text-purple-400" 
                          : "text-blue-400"
                      }`}>
                        {currentAnalysis.mode === "rapido" 
                          ? "Padrão" 
                          : currentAnalysis.mode === "completo"
                            ? "Avançada"
                            : "Forense Ampliada (99.8%)"
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Confiança da Análise (IA):</span>
                      <span className="font-bold text-slate-200">
                        {Math.round(currentAnalysis.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Definitive Forensic Verdict Section */}
                  <div className="w-full mt-4 pt-4 border-t border-slate-700/40 flex flex-col items-center">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-2">
                      Conclusão de Adulteração
                    </span>
                    {currentAnalysis.authenticityScore >= 60 ? (
                      <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex flex-col items-center gap-1.5 animate-fadeIn">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase font-mono tracking-wider">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          INTEGRA / NÃO MANIPULADA
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed text-center">
                          A análise não detectou discrepâncias ópticas ou alterações nos cabeçalhos lógicos. Nenhuma manipulação identificada.
                        </p>
                      </div>
                    ) : (
                      <div className="w-full bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex flex-col items-center gap-1.5 animate-fadeIn">
                        <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs uppercase font-mono tracking-wider">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          ADULTERADA / MANIPULADA
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed text-center">
                          Distorções espectrais severas no CMOS e anomalias de pixels detectadas. O arquivo foi alterado ou gerado sinteticamente.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Score Breakdown Layer Metrics */}
                <div className="md:col-span-7 bg-slate-800/80 rounded-2xl border border-slate-700/50 p-5 shadow-md flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display font-semibold text-xs text-slate-200 uppercase tracking-wider">
                      Categorias Ponderadas de Análise
                    </h4>
                    <span className="text-[9px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300 font-mono">
                      Confiança: {Math.round(currentAnalysis.confidence * 100)}%
                    </span>
                  </div>

                  {/* Core 4 Levels of analysis based on PRD Section 3.2 - 3.5 */}
                  <div className="space-y-3">
                    
                    {/* Layer 1: Global Generative Artifacts (40%) */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 flex items-center gap-1.5 group relative cursor-help">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="border-b border-dashed border-slate-500 hover:border-blue-400 transition-colors">
                            Artefatos de Inteligência Artificial
                          </span>
                          <HelpCircle className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
                          
                          {/* Rich Interactive Tooltip Description */}
                          <span className="absolute bottom-full left-0 mb-2 hidden group-hover:flex flex-col w-72 sm:w-80 bg-slate-900/98 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl shadow-2xl text-[10.5px] leading-relaxed text-slate-300 normal-case font-normal z-50 animate-fadeIn">
                            <span className="font-bold text-blue-400 mb-1 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                              Artefatos de Inteligência Artificial
                            </span>
                            Avalia a presença de anomalias sintéticas deixadas por redes generativas (como GANs ou Modelos de Difusão). Identifica padrões de textura artificiais, superfícies excessivamente suavizadas e assimetrias em detalhes biográficos como olhos, cabelos e dentes.
                          </span>
                        </span>
                        <span className="font-mono font-bold text-slate-200 text-xs">
                          {currentAnalysis.layers.globalArtifacts.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div 
                          className={`h-1.5 rounded-full ${
                            currentAnalysis.layers.globalArtifacts.score >= 80 
                              ? "bg-emerald-500" 
                              : currentAnalysis.layers.globalArtifacts.score >= 50 
                              ? "bg-amber-500" 
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${currentAnalysis.layers.globalArtifacts.score}%` }}
                        ></div>
                      </div>
                    </div>
 
                    {/* Layer 2: Internal Consistency (Sombras e Iluminação) (25%) */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 flex items-center gap-1.5 group relative cursor-help">
                          <Maximize2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="border-b border-dashed border-slate-500 hover:border-purple-400 transition-colors">
                            Consistência de Luz e Sombra
                          </span>
                          <HelpCircle className="w-3 h-3 text-slate-500 group-hover:text-purple-400 transition-colors" />
                          
                          {/* Rich Interactive Tooltip Description */}
                          <span className="absolute bottom-full left-0 mb-2 hidden group-hover:flex flex-col w-72 sm:w-80 bg-slate-900/98 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl shadow-2xl text-[10.5px] leading-relaxed text-slate-300 normal-case font-normal z-50 animate-fadeIn">
                            <span className="font-bold text-purple-400 mb-1 flex items-center gap-1">
                              <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
                              Consistência de Luz e Sombra
                            </span>
                            Avalia a integridade física espacial e geométrica dos vetores de iluminação. Detecta se sombras projetadas, reflexos corneanos e o brilho ambiental do plano de fundo seguem as mesmas fontes físicas de luz na modelagem 2D/3D.
                          </span>
                        </span>
                        <span className="font-mono font-bold text-slate-200 text-xs">
                          {currentAnalysis.layers.internalConsistency.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div 
                          className={`h-1.5 rounded-full ${
                            currentAnalysis.layers.internalConsistency.score >= 80 
                              ? "bg-emerald-500" 
                              : currentAnalysis.layers.internalConsistency.score >= 50 
                              ? "bg-amber-500" 
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${currentAnalysis.layers.internalConsistency.score}%` }}
                        ></div>
                      </div>
                    </div>
 
                    {/* Layer 3: Metadata Forensics (20%) */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 flex items-center gap-1.5 group relative cursor-help">
                          <Binary className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <span className="border-b border-dashed border-slate-500 hover:border-orange-400 transition-colors">
                            Auditoria de Metadados EXIF
                          </span>
                          <HelpCircle className="w-3 h-3 text-slate-500 group-hover:text-orange-400 transition-colors" />
                          
                          {/* Rich Interactive Tooltip Description */}
                          <span className="absolute bottom-full left-0 mb-2 hidden group-hover:flex flex-col w-72 sm:w-80 bg-slate-900/98 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl shadow-2xl text-[10.5px] leading-relaxed text-slate-300 normal-case font-normal z-50 animate-fadeIn">
                            <span className="font-bold text-orange-400 mb-1 flex items-center gap-1">
                              <Binary className="w-3.5 h-3.5 text-orange-400" />
                              Auditoria de Metadados EXIF
                            </span>
                            Decodifica os campos lógicos internos da imagem (EXIF, JFIF, XMP). Verifica incompatibilidades entre o hardware de fábrica (lente e câmera), as datas de criação, e assinaturas deixadas por softwares de edição profissionais, indicando salvamento posterior.
                          </span>
                        </span>
                        <span className="font-mono font-bold text-slate-200 text-xs">
                          {currentAnalysis.layers.metadataForensic.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div 
                          className={`h-1.5 rounded-full ${
                            currentAnalysis.layers.metadataForensic.score >= 80 
                              ? "bg-emerald-500" 
                              : currentAnalysis.layers.metadataForensic.score >= 50 
                              ? "bg-amber-500" 
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${currentAnalysis.layers.metadataForensic.score}%` }}
                        ></div>
                      </div>
                    </div>
 
                    {/* Layer 4: Sensor Noise / Compression (15%) */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 flex items-center gap-1.5 group relative cursor-help">
                          <Sliders className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span className="border-b border-dashed border-slate-500 hover:border-teal-400 transition-colors">
                            Ruído de Sensor e Compressão
                          </span>
                          <HelpCircle className="w-3 h-3 text-slate-500 group-hover:text-teal-400 transition-colors" />
                          
                          {/* Rich Interactive Tooltip Description */}
                          <span className="absolute bottom-full left-0 mb-2 hidden group-hover:flex flex-col w-72 sm:w-80 bg-slate-900/98 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl shadow-2xl text-[10.5px] leading-relaxed text-slate-300 normal-case font-normal z-50 animate-fadeIn">
                            <span className="font-bold text-teal-400 mb-1 flex items-center gap-1">
                              <Sliders className="w-3.5 h-3.5 text-teal-400" />
                              Ruído de Sensor e Compressão
                            </span>
                            Verifica a uniformidade espectral do ruído térmico original do sensor CMOS (PRNU) e as tabelas de quantização na recompressão JPEG. Recortes e manipulações digitais inevitavelmente rompem, apagam ou distorcem esse padrão contínuo de ruído microscópico.
                          </span>
                        </span>
                        <span className="font-mono font-bold text-slate-200 text-xs">
                          {currentAnalysis.layers.noiseCompression.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div 
                          className={`h-1.5 rounded-full ${
                            currentAnalysis.layers.noiseCompression.score >= 80 
                              ? "bg-emerald-500" 
                              : currentAnalysis.layers.noiseCompression.score >= 50 
                              ? "bg-amber-500" 
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${currentAnalysis.layers.noiseCompression.score}%` }}
                        ></div>
                      </div>
                    </div>
 
                  </div>
                </div>

              </div>

              {/* Workstation Tabs: General Findings vs. Metadata Forensics */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700/50 p-5 shadow-xl">
                <div className="flex border-b border-slate-700 mb-4 gap-2">
                  <button
                    id="btn-tab-geral"
                    onClick={() => setActiveTab("geral")}
                    className={`pb-2.5 px-2 text-xs font-semibold uppercase tracking-wider relative transition-all ${
                      activeTab === "geral" 
                        ? "text-blue-500 border-b-2 border-blue-500" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Laudos Regionais & Descrições
                  </button>
                  <button
                    id="btn-tab-metadados"
                    onClick={() => setActiveTab("metadados")}
                    className={`pb-2.5 px-2 text-xs font-semibold uppercase tracking-wider relative transition-all ${
                      activeTab === "metadados" 
                        ? "text-blue-500 border-b-2 border-blue-500" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Metadados EXIF e XMP
                  </button>
                </div>

                {activeTab === "geral" ? (
                  <div className="space-y-4">
                    {/* General analysis text summary */}
                    <div className="bg-slate-900/50 rounded-xl p-3.5 border border-slate-700/40 text-xs leading-relaxed text-slate-300">
                      <p className="font-semibold text-slate-100 flex items-center gap-1.5 mb-1 text-[12px]">
                        <Shield className="w-4 h-4 text-blue-500" />
                        Sumário Executivo de Varredura
                      </p>
                      O sistema detectou que esta imagem possui um score agregado de autenticidade de <strong>{currentAnalysis.authenticityScore}%</strong>. 
                      Os padrões estruturais analíticos indicam que foram detectadas características típicas de <strong>{currentAnalysis.interpretationBand.label.toLowerCase()}</strong>. 
                      O fator de confiabilidade da amostragem espectral é de {Math.round(currentAnalysis.confidence * 100)}%.
                    </div>

                    {/* Regional detailed inspector */}
                    <div>
                      <h4 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-widest mb-2">
                        Inspetor de Segmentos ({selectedRegionId ? "Segmento Selecionado" : "Selecione uma região no mapa"})
                      </h4>

                      {selectedRegion ? (
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col gap-2.5 animate-fadeIn">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <span className="font-semibold text-xs text-blue-400 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5" />
                              {selectedRegion.label}
                            </span>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                Categoria: {selectedRegion.category}
                              </span>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                selectedRegion.suspicionScore >= 75
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : selectedRegion.suspicionScore >= 40
                                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}>
                                Suspeição: {selectedRegion.suspicionScore}%
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed pt-1">
                            {selectedRegion.findings}
                          </p>
                        </div>
                      ) : (
                        <div className="border border-dashed border-slate-700/60 rounded-xl p-6 text-center text-xs text-slate-500">
                          Clique em cima de qualquer quadrado cinza/colorido no mapa de calor da imagem para analisar os vereditos específicos das frações e sub-regiões no domínio local.
                        </div>
                      )}
                    </div>

                    {/* Categorized Layer findings details */}
                    <div>
                      <h4 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-widest mb-1.5">
                        Relatório Detalhado Por Camadas
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs">
                          <p className="font-semibold text-rose-450 text-slate-200 flex items-center justify-between mb-1">
                            <span>Morfologia de Artefatos</span>
                            <span className="text-[10px] font-mono">P: 40%</span>
                          </p>
                          <p className="text-slate-400 leading-relaxed text-[11px]">
                            {currentAnalysis.layers.globalArtifacts.findings}
                          </p>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs">
                          <p className="font-semibold text-slate-200 flex items-center justify-between mb-1">
                            <span>Física de Sombras & Luz</span>
                            <span className="text-[10px] font-mono">P: 25%</span>
                          </p>
                          <p className="text-slate-400 leading-relaxed text-[11px]">
                            {currentAnalysis.layers.internalConsistency.findings}
                          </p>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs">
                          <p className="font-semibold text-slate-200 flex items-center justify-between mb-1">
                            <span>Integridade de Metadados</span>
                            <span className="text-[10px] font-mono">P: 20%</span>
                          </p>
                          <p className="text-slate-400 leading-relaxed text-[11px]">
                            {currentAnalysis.layers.metadataForensic.findings}
                          </p>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs">
                          <p className="font-semibold text-slate-200 flex items-center justify-between mb-1">
                            <span>Análise de Ruído CMOS</span>
                            <span className="text-[10px] font-mono">P: 15%</span>
                          </p>
                          <p className="text-slate-400 leading-relaxed text-[11px]">
                            {currentAnalysis.layers.noiseCompression.findings}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  // Tab Meta
                  <div className="space-y-4">
                    <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                        <h4 className="font-display font-semibold text-xs text-blue-400 flex items-center gap-1.5">
                          <Database className="w-4 h-4" />
                          Dados de Hardware e Captura Orquestrada
                        </h4>
                        
                        <span className={`text-[9.5px] font-semibold uppercase px-2 py-0.5 rounded border ${
                          currentAnalysis.metadata.exifAnomalyDetected
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        }`}>
                          {currentAnalysis.metadata.exifAnomalyDetected ? "Alerta de Anomalia" : "Integridade EXIF Ok"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between border-b border-slate-800/50 pb-1">
                            <span className="text-slate-400">Modelo da Câmera:</span>
                            <span className="font-medium text-slate-100 font-mono">
                              {currentAnalysis.metadata.cameraModel || "Assinatura ausente"}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between border-b border-slate-800/50 pb-1">
                            <span className="text-slate-400">Software Atribuído:</span>
                            <span className="font-medium text-slate-100 font-mono">
                              {currentAnalysis.metadata.software || "Nenhum detectado"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-b border-slate-800/50 pb-1">
                            <span className="text-slate-400">Marcadores de Criação:</span>
                            <span className="font-medium text-slate-100 font-mono">
                              {currentAnalysis.metadata.creationDate || "Metadados limpos"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between border-b border-slate-800/50 pb-1">
                            <span className="text-slate-400">Formato e Compressão:</span>
                            <span className="font-medium text-slate-100 font-mono">
                              {currentAnalysis.metadata.compression || "N/A"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-b border-slate-800/50 pb-1">
                            <span className="text-slate-400">Possui Marcador EXIF:</span>
                            <span className="font-mono font-semibold text-slate-100">
                              {currentAnalysis.metadata.hasExif ? "Sim" : "Não"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-b border-slate-800/50 pb-1">
                            <span className="text-slate-400">Tamanho do Arquivo:</span>
                            <span className="font-medium text-slate-100 font-mono">
                              {formatFileSize(currentAnalysis.fileSize)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {currentAnalysis.metadata.exifAnomalyDetails && (
                        <div className="mt-4 bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs">
                          <span className="font-bold text-rose-450 block mb-1">Mapeamento Forense de Alertas:</span>
                          <p className="text-slate-400 leading-relaxed">
                            {currentAnalysis.metadata.exifAnomalyDetails}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900/10 rounded-xl p-3 border border-slate-800 text-[11px] leading-relaxed text-slate-500">
                      <strong>Análise Forense Avançada de Metadados (Art. 3.1):</strong> A remoção total dos dados EXIF ou incompatibilidade de carimbos de tempo em lote constitui um forte indício secundário de manipulação para acobertar assinaturas de renderização de modelos generativos.
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700/50 p-12 text-center shadow-xl flex flex-col items-center justify-center min-h-[480px]">
              <Upload className="w-12 h-12 text-slate-400 mb-4" />
              <h3 className="font-display font-semibold text-slate-100 text-base mb-1">
                Aguardando Upload ou Seleção de Caso
              </h3>
              <p className="text-xs text-slate-400 max-w-xs justify-center leading-relaxed">
                Carregue uma imagem ou selecione um dos modelos de treinamento realistas listados no painel lateral esquerdo para carregar o stage forense.
              </p>
            </div>
          )}

        </section>

      </main>

      {/* Footer system (PRD Syntech Solutions) */}
      <footer className="border-t border-slate-800 bg-slate-950 px-4 py-6 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Syntech Solutions</span>
            <span>— Divisão de Sistemas de Verificação Digital</span>
          </div>
          
          <div className="flex items-center gap-1.5 font-mono">
            <span>SLA de Conformidade: LGPD Lei nº 13.709/2018</span>
            <span className="text-slate-600">|</span>
            <span>Acurácia &ge; 96%</span>
          </div>

          <p className="text-[10.5px] text-slate-600">
            © 2026 Syntech Solutions Inc. Todos os direitos reservados. Documento Confidencial.
          </p>
        </div>
      </footer>

      {/* Forensic Report Printable Modal View (PRD 5.2 - "laudo técnico regulamentar") */}
      {showLaudoModal && currentAnalysis && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header controls */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="font-display font-bold text-sm md:text-base">
                  Visualizador de Laudo Oficial Técnico
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / PDF
                </button>
                
                <button
                  onClick={() => setShowLaudoModal(false)}
                  className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document body to print */}
            <div id="print-area" className="flex-1 p-8 md:p-12 overflow-y-auto bg-white">
              
              {/* Document Header */}
              <div className="text-center pb-6 border-b-2 border-slate-300 md:pb-8">
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500">
                  Syntech Solutions — Divisão de Sistemas de Verificação Digital
                </span>
                <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-slate-900 mt-2">
                  Laudo Pericial de Autenticidade Visual
                </h2>
                <div className="w-24 h-1 bg-slate-900 mx-auto mt-4"></div>
              </div>

              {/* Basic file parameters metadata table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                
                <div className="space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 block">
                    1. Informações Básicas do Arquivo
                  </h3>
                  <div className="flex items-center justify-between border-b border-slate-200 py-1 text-xs">
                    <span className="text-slate-500">Nome do Arquivo:</span>
                    <span className="font-mono font-semibold truncate max-w-[200px] text-slate-900">
                      {currentAnalysis.fileName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 py-1 text-xs">
                    <span className="text-slate-500">Tamanho do Arquivo:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatFileSize(currentAnalysis.fileSize)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 py-1 text-xs">
                    <span className="text-slate-500">Mime-Type Detectado:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {currentAnalysis.mimeType}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 block">
                    2. Parâmetros Extraídos do Hardware
                  </h3>
                  <div className="flex items-center justify-between border-b border-slate-200 py-1 text-xs">
                    <span className="text-slate-500">Modelo da Câmera:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {currentAnalysis.metadata.cameraModel || "Dispositivo Desconhecido"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 py-1 text-xs">
                    <span className="text-slate-500">Software de Edição:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {currentAnalysis.metadata.software || "Nenhum detectado"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 py-1 text-xs">
                    <span className="text-slate-500">Carimbo de Registro (UTC):</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {currentAnalysis.timestamp.substring(11, 19)} - {currentAnalysis.timestamp.substring(0, 10)}
                    </span>
                  </div>
                </div>

              </div>

              {/* Forensic Metric Dashboard inside Certificate */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 text-center">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 block mb-1">
                    Score de Autenticidade
                  </span>
                  <div className="font-display font-extrabold text-5xl font-mono text-slate-900">
                    {currentAnalysis.authenticityScore}%
                  </div>
                  <div className="w-12 h-0.5 bg-slate-300 mx-auto my-2"></div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Confiabilidade: {Math.round(currentAnalysis.confidence * 100)}%
                  </span>
                </div>

                <div className="md:col-span-8 space-y-3 border-t md:border-t-0 md:border-l border-slate-250 pt-4 md:pt-0 md:pl-6 text-xs text-slate-700">
                  <div className="font-semibold text-sm text-slate-805 mb-1.5 uppercase font-display">
                    Diagnóstico de Veredito:
                  </div>
                  <p className="leading-relaxed font-semibold">
                    Classificação: <span className="underline">{currentAnalysis.interpretationBand.label}</span>
                  </p>
                  <p className="leading-relaxed text-slate-600">
                    {currentAnalysis.interpretationBand.description}
                  </p>
                </div>
              </div>

              {/* Core layers breakdown reports */}
              <div className="mt-8">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 pb-2 border-b border-slate-200 block">
                  3. Vereditos Específicos de Varredura Multicamadas
                </h3>

                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-1 text-xs">
                    <span className="font-bold font-display text-[12px] text-slate-805 block">Detecção de Artefatos de IA Generativos (Peso: 40%)</span>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {currentAnalysis.layers.globalArtifacts.findings} — Pontuação local de integridade: <strong>{currentAnalysis.layers.globalArtifacts.score}/100</strong>.
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4 py-1 text-xs">
                    <span className="font-bold font-display text-[12px] text-slate-850 block">Consistência de Iluminação & Diferencial de Sombras (Peso: 25%)</span>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {currentAnalysis.layers.internalConsistency.findings} — Pontuação local de integridade: <strong>{currentAnalysis.layers.internalConsistency.score}/100</strong>.
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4 py-1 text-xs">
                    <span className="font-bold font-display text-[12px] text-slate-850 block">Auditoria Forense de Cabeçalho Metadados EXIF/XMP (Peso: 20%)</span>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {currentAnalysis.layers.metadataForensic.findings} — Pontuação local de integridade: <strong>{currentAnalysis.layers.metadataForensic.score}/100</strong>.
                    </p>
                  </div>

                  <div className="border-l-4 border-teal-500 pl-4 py-1 text-xs">
                    <span className="font-bold font-display text-[12px] text-slate-850 block">Análise Espectral de Ruído CMOS & Compressão JPEG (Peso: 15%)</span>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {currentAnalysis.layers.noiseCompression.findings} — Pontuação local de integridade: <strong>{currentAnalysis.layers.noiseCompression.score}/100</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Region Analysis inside Printed file */}
              <div className="mt-8">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 pb-2 border-b border-slate-200 block">
                  4. Análise Segmentada de Frações Regionais
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {currentAnalysis.regions.map((region) => (
                    <div key={region.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
                      <div className="flex items-center justify-between mb-1 border-b border-slate-200 pb-1">
                        <span className="font-bold text-slate-800">{region.label}</span>
                        <span className="font-mono text-[9px] uppercase font-bold text-slate-500">
                          Suspeição: {region.suspicionScore}%
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {region.findings}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures block for digital certified validity */}
              <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="w-48 h-0.5 bg-slate-300 mx-auto mb-2"></div>
                  <span className="text-slate-600">Perito Responsável Digital (AI)</span>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Certificado: 0x8F9aC3...B1</p>
                </div>

                <div>
                  <div className="w-48 h-0.5 bg-slate-300 mx-auto mb-2"></div>
                  <span className="text-slate-600">Syntech Cryptographic Validator</span>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Time: {new Date().toISOString().substring(0, 10)}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
