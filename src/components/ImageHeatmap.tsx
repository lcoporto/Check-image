import { useState, useRef, useEffect } from "react";
import { AnalyzedRegion, RegionCategory } from "../types";
import { Info, HelpCircle, Play, Pause, Radio } from "lucide-react";

interface ImageHeatmapProps {
  imageUrl: string;
  regions: AnalyzedRegion[];
  opacity: number; // 0 to 1
  threshold: number; // 0 to 100
  selectedRegionId: string | null;
  onSelectRegion: (id: string | null) => void;
}

export default function ImageHeatmap({
  imageUrl,
  regions,
  opacity,
  threshold,
  selectedRegionId,
  onSelectRegion,
}: ImageHeatmapProps) {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-start scanning line whenever the image gets updated
  useEffect(() => {
    setIsScanning(true);
  }, [imageUrl]);

  // Filter regions based on suspicion threshold requested in PRD 3.4
  const visibleRegions = regions.filter((r) => r.suspicionScore >= threshold);

  const getRegionStyles = (category: RegionCategory, score: number, isSelected: boolean) => {
    let strokeColor = "stroke-emerald-500";
    let fillColor = "rgba(16, 185, 129, 0.2)";
    let badgeColor = "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300";

    if (score >= 80) {
      strokeColor = "stroke-rose-600";
      fillColor = "rgba(225, 29, 72, 0.45)"; // Intense red (generative)
      badgeColor = "bg-rose-600/20 text-rose-700 dark:text-rose-300";
    } else if (score >= 50) {
      strokeColor = "stroke-orange-500";
      fillColor = "rgba(249, 115, 22, 0.35)"; // Orange (manipulated)
      badgeColor = "bg-orange-500/20 text-orange-700 dark:text-orange-300";
    } else if (score >= 30) {
      strokeColor = "stroke-amber-500";
      fillColor = "rgba(245, 158, 11, 0.25)"; // Yellow/Amber (suspicious)
      badgeColor = "bg-amber-500/20 text-amber-700 dark:text-amber-300";
    }

    if (isSelected) {
      strokeColor = "stroke-cyan-400 stroke-[3px]";
    }

    return { strokeColor, fillColor, badgeColor };
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Self-contained stylish styles for seamless scanning line laser movement & bounding box pulses */}
      <style>{`
        @keyframes forensicSweep {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-scanner-sweep {
          animation: forensicSweep 5s ease-in-out infinite;
        }
        @keyframes borderAura {
          0% { stroke-opacity: 0.6; filter: drop-shadow(0 0 1px rgba(34, 211, 238, 0.2)); }
          50% { stroke-opacity: 1; filter: drop-shadow(0 0 6px rgba(34, 211, 238, 0.8)); }
          100% { stroke-opacity: 0.6; filter: drop-shadow(0 0 1px rgba(34, 211, 238, 0.2)); }
        }
        .animate-aura-pulse {
          animation: borderAura 2s ease-in-out infinite;
        }
      `}</style>

      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-slate-200 text-sm flex items-center gap-1.5 animate-pulse-subtle">
          <Info className="w-4 h-4 text-blue-500" />
          Mapa de Analisadores &amp; Segmentos Suspeitos
        </h3>
        
        <div className="flex items-center gap-2.5">
          {/* Active Scanner Controller */}
          <button
            id="toggle-laser-scanner"
            type="button"
            onClick={() => setIsScanning(!isScanning)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold uppercase flex items-center gap-1.5 transition-all border ${
              isScanning
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-505/30 border-cyan-500/30 hover:bg-cyan-500/20"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300"
            }`}
            title={isScanning ? "Pausar linha de varredura" : "Iniciar linha de varredura"}
          >
            {isScanning ? (
              <>
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                </span>
                Varredura Ativa
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-slate-400" />
                Varredura Pausada
              </>
            )}
          </button>

          <span className="text-xs text-slate-500 font-mono">
            {visibleRegions.length} de {regions.length} regiões filtradas
          </span>
        </div>
      </div>

      {/* Main Image Stage */}
      <div 
        id="image-forensic-stage"
        ref={containerRef}
        className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center max-h-[500px]"
      >
        <img
          src={imageUrl}
          alt="Forensic analysis source"
          className="w-full h-auto object-contain max-h-[480px] pointer-events-none"
        />

        {/* Dynamic Canvas SVG Overlay */}
        <svg
          className="absolute inset-0 w-full h-full cursor-crosshair"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {visibleRegions.map((region) => {
            const [x, y, w, h] = region.boundingBox;
            const isSelected = selectedRegionId === region.id;
            const isHovered = hoveredRegionId === region.id;
            const { strokeColor, fillColor } = getRegionStyles(region.category, region.suspicionScore, isSelected);

            // Active Scan pulses suspected nodes to catch focus
            const shouldPulse = isScanning && (region.suspicionScore >= 50 || isSelected || isHovered);

            return (
              <g key={region.id}>
                {/* SVG Rect covering the bounding box dynamically */}
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  className={`${strokeColor} ${shouldPulse ? "animate-aura-pulse" : ""} transition-all duration-200 cursor-pointer`}
                  style={{
                    fill: fillColor,
                    opacity: isHovered || isSelected ? Math.min(1, opacity + 0.2) : opacity,
                    strokeDasharray: isSelected ? "none" : (region.category === "real" ? "1,1" : "3,2"),
                    strokeWidth: isSelected || isHovered ? 2.5 : 1.2
                  }}
                  onClick={() => onSelectRegion(isSelected ? null : region.id)}
                  onMouseEnter={() => setHoveredRegionId(region.id)}
                  onMouseLeave={() => setHoveredRegionId(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Laser Scanner sweeping absolute animations */}
        {isScanning && (
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-10">
            {/* Horizontal glowing sweeping line */}
            <div 
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee,0_0_18px_#06b6d4] pointer-events-none animate-scanner-sweep" 
              style={{ transform: 'translateY(-50%)' }}
            />
            {/* Gentle sweeping fog / light beam */}
            <div 
              className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none animate-scanner-sweep" 
              style={{ transform: 'translateY(-50%)' }}
            />
          </div>
        )}

        {/* Real-time Tooltip Floating on Bounding Box selection or hover */}
        {regions.map((region) => {
          const isSelected = selectedRegionId === region.id;
          const isHovered = hoveredRegionId === region.id;
          if (!isSelected && !isHovered) return null;

          const [x, y, w, h] = region.boundingBox;
          // Calculate average hover threshold position
          const topPosition = Math.max(5, y - 10);
          const leftPosition = Math.min(75, Math.max(5, x + w / 2 - 10));

          return (
            <div
              key={`tooltip-${region.id}`}
              className="absolute pointer-events-none z-20 bg-slate-900/95 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-md shadow-lg flex flex-col gap-0.5 border border-slate-705 border-slate-700 max-w-[180px]"
              style={{
                top: `${topPosition}%`,
                left: `${leftPosition}%`,
              }}
            >
              <span className="font-semibold truncate text-[11px]">{region.label}</span>
              <div className="flex items-center gap-1.5 justify-between">
                <span className="font-mono text-[9px] text-slate-300 uppercase">{region.category}</span>
                <span className="font-bold text-rose-400 font-mono text-[10px]">{region.suspicionScore}% sus.</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide Note */}
      <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80 flex items-center gap-1.5 leading-relaxed">
        <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>
          <strong>Dica Interativa:</strong> Clique sobre qualquer região colorida no mapa acima para inspecionar os laudos forenses em detalhes. Use os controles deslizantes ao lado para isolar as pontuações críticas!
        </span>
      </div>
    </div>
  );
}
