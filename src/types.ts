/**
 * Types and interfaces for the Image Authenticity Verification system.
 */

export enum AnalysisMode {
  RAPIDO = "rapido",     // Quick mode: global CNN-like artifact detection
  COMPLETO = "completo", // Complete mode: hybrid segmentation, metadata search, and deep forensic heatmap
  ULTRA = "ultra"        // Ultra Accuracy mode: multi-pass subpixel deep forensic scanner with error bounds
}

export type RegionCategory = "real" | "manipulated" | "ai_generated";

export interface AnalyzedRegion {
  id: string;
  label: string;
  category: RegionCategory;
  suspicionScore: number; // 0 to 100% suspicion
  findings: string;       // Text description of anomalies
  // Bounding box in percentage [x, y, width, height] for heatmap overlay
  boundingBox: [number, number, number, number];
}

export interface ForensicMetric {
  score: number;       // 0 to 100
  findings: string;    // Detailed observations
  status: "secure" | "warning" | "danger" | "neutral";
}

export interface AnalysisResult {
  fileName: string;
  fileSize: number;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
  };
  mode: AnalysisMode;
  timestamp: string;
  
  // Aggregate Metrics
  authenticityScore: number; // 0% to 100% (High = Genuine, Low = Manipulated/AI)
  confidence: number;        // 0.0 to 1.0 (reliability)
  interpretationBand: {
    label: string;           // E.g., "Alta probabilidade de autenticidade"
    description: string;
    classColor: string;      // E.g., "text-green-500", "text-red-500"
    bgColor: string;         // E.g., "bg-green-500/10"
    borderColor: string;     // border color
  };

  // Three Layers of Analysis (PRD Section 3.2 - 3.5)
  layers: {
    globalArtifacts: ForensicMetric;  // Peso: 40%
    internalConsistency: ForensicMetric; // Peso: 25% (Híbrido)
    metadataForensic: ForensicMetric;    // Peso: 20%
    noiseCompression: ForensicMetric;    // Peso: 15%
  };

  // Hybrid Segmented Regions (PRD Section 3.3)
  regions: AnalyzedRegion[];

  // Extracted Metadata (PRD Section 3.1)
  metadata: {
    cameraModel?: string;
    software?: string;
    creationDate?: string;
    modifyDate?: string;
    compression?: string;
    hasExif: boolean;
    exifAnomalyDetected: boolean;
    exifAnomalyDetails?: string;
  };
}

export interface PresetExample {
  id: string;
  title: string;
  description: string;
  source: string; // "Câmera Real" | "Midjourney v6" | "Stable Diffusion XL" | "Manipulada (Híbrida)"
  imageUrl: string;
  mode: AnalysisMode;
  analysis: AnalysisResult;
}
