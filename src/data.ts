import { PresetExample, AnalysisMode } from "./types";

export const PRESETS: PresetExample[] = [
  {
    id: "protesto-politico",
    title: "Protesto Político em Av. Central",
    description: "Imagem viral alegando aglomerações em protesto de rua recente. Suspeita de duplicação de multidão e inserção de faixas via Stable Diffusion.",
    source: "Manipulada (Híbrida)",
    imageUrl: "https://images.unsplash.com/photo-1571624436279-b272abc752b5?w=800&auto=format&fit=crop&q=80",
    mode: AnalysisMode.COMPLETO,
    analysis: {
      fileName: "protesto_viral_final.jpg",
      fileSize: 3145728, // 3.0 MB
      mimeType: "image/jpeg",
      dimensions: { width: 2048, height: 1365 },
      mode: AnalysisMode.COMPLETO,
      timestamp: "2026-06-01T15:20:00Z",
      authenticityScore: 28, // 0-100 (weighted)
      confidence: 0.91,
      interpretationBand: {
        label: "Provavelmente sintética",
        description: "Fortes indícios de adulteração, manipulação parcial ou inserção de elementos artificiais sintéticos misturados a cenas reais.",
        classColor: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20"
      },
      layers: {
        globalArtifacts: {
          score: 35,
          findings: "Assinaturas aberrantes detectadas em alta frequência espectral nas áreas superiores. Padrão compatível com geração de redes Stable Diffusion XL.",
          status: "danger"
        },
        internalConsistency: {
          score: 22,
          findings: "O ângulo de reflexão do sol nos vidros dos prédios traseiros diverge em 42 graus da principal fonte de iluminação que incide sobre os manifestantes dianteiros.",
          status: "danger"
        },
        metadataForensic: {
          score: 15,
          findings: "Os metadados EXIF foram completamente removidos. A assinatura do container JPG exibe duplicações de tabelas de quantização, comuns em re-salvamentos de editores gráficos.",
          status: "danger"
        },
        noiseCompression: {
          score: 42,
          findings: "Nível de ruído de sensor inconsistente. Enquanto o plano de fundo revela um granulado suave de câmera, as faixas e cartazes demonstram ausência de ruído típico de película CMOS.",
          status: "warning"
        }
      },
      regions: [
        {
          id: "r1",
          label: "Prédios e Multidão ao Fundo",
          category: "ai_generated",
          suspicionScore: 91,
          findings: "Estrutura gerada por IA. Observam-se janelas distorcidas, fusão bizarra de silhuetas humanas e letreiros ilegíveis gerados sinteticamente pelo Stable Diffusion.",
          boundingBox: [0, 0, 100, 48] // upper half of image
        },
        {
          // real part
          id: "r2",
          label: "Manifestantes no Primeiro Plano",
          category: "real",
          suspicionScore: 12,
          findings: "Ruído óptico íntegro, foco físico normal, anatomia correta e compressão típica de lente teleobjetiva real de smartphone.",
          boundingBox: [5, 52, 90, 45]
        },
        {
          id: "r3",
          label: "Cartaz Principal no Eixo Central",
          category: "manipulated",
          suspicionScore: 78,
          findings: "Adulteração local. Texto nítido sobreposto sobre pixels desfocados. Ausência total de grão de sensor e corte de bordas com anti-aliasing artificial.",
          boundingBox: [35, 40, 30, 15]
        }
      ],
      metadata: {
        cameraModel: "Desconhecido (Metadados Limpos)",
        software: "Adobe Photoshop 2026 (Presença de metadados XMP residuais)",
        creationDate: "01/06/2026",
        modifyDate: "01/06/2026 14:15:22",
        compression: "JPEG (Standard)",
        hasExif: false,
        exifAnomalyDetected: true,
        exifAnomalyDetails: "Tags de software e marcadores Photoshop indicam adulteração intencional do arquivo."
      }
    }
  },
  {
    id: "documento-identidade",
    title: "Foto Pericial de Passaporte Suspeito",
    description: "Laudo pericial de passaporte apreendido em fronteira aeroportuária. Suspeita de falsificação ideológica usando foto gerada por StyleGAN3.",
    source: "Manipulada (Híbrida)",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    mode: AnalysisMode.COMPLETO,
    analysis: {
      fileName: "passaporte_scan_0483.png",
      fileSize: 4572210, // 4.3 MB
      mimeType: "image/png",
      dimensions: { width: 1400, height: 1800 },
      mode: AnalysisMode.COMPLETO,
      timestamp: "2026-05-28T09:12:44Z",
      authenticityScore: 8, // 0-100 (weighted)
      confidence: 0.96,
      interpretationBand: {
        label: "Alta probabilidade de geração por IA",
        description: "A imagem exibe padrões biométricos e estatísticos inequívocos de geração integral por IA generativa (p. ex., Diffusion Models, GANs).",
        classColor: "text-rose-600 dark:text-rose-400",
        bgColor: "bg-rose-500/10",
        borderColor: "border-rose-500/20"
      },
      layers: {
        globalArtifacts: {
          score: 5,
          findings: "Assinaturas de deformação geométrica e incongruências orgânicas graves e irrefutáveis de redes generativas StyleGAN3.",
          status: "danger"
        },
        internalConsistency: {
          score: 11,
          findings: "Múltiplas fontes de luz conflitantes atuando no sombreamento do rosto, enquanto os ombros e roupa possuem iluminação plana unidirecional.",
          status: "danger"
        },
        metadataForensic: {
          score: 10,
          findings: "Filtro forensic aponta que o cabeçalho PNG ausenta metadados de câmeras fotográficas ou scanner físico, contendo metadados de codificação Web padrão.",
          status: "danger"
        },
        noiseCompression: {
          score: 9,
          findings: "O ruído de sensor é praticamente nulo na região facial, porém o papel de fundo possui textura de impressora com ruído gaussiano sintético sobreposto para disfarçar o recorte.",
          status: "danger"
        }
      },
      regions: [
        {
          id: "r1",
          label: "Área e Corte dos Cabelos",
          category: "ai_generated",
          suspicionScore: 92,
          findings: "Cabelos fundindo-se de forma anormal com o fundo do documento, fios de cabelo que se liquefazem em texturas indistintas (assinatura típica do StyleGAN).",
          boundingBox: [15, 5, 70, 30]
        },
        {
          id: "r2",
          label: "Região Ocular e Pupilas",
          category: "ai_generated",
          suspicionScore: 95,
          findings: "Pupilas não-circulares (geométrica irregular) com pontos de brilho assimétricos em ambos os olhos, descumprindo leis de reflexão óptica.",
          boundingBox: [32, 34, 36, 12]
        },
        {
          id: "r3",
          label: "Brincos e Assimetria de Acessórios",
          category: "ai_generated",
          suspicionScore: 88,
          findings: "Brincos assimétricos com padrões e decorações diferentes em cada orelha, imperfeição típica de redes neurais generativas na geração de bijuterias emparelhadas.",
          boundingBox: [18, 48, 64, 18]
        },
        {
          id: "r4",
          label: "Fundo Físico do Documento",
          category: "real",
          suspicionScore: 18,
          findings: "Trama de papel de alta segurança de passaporte real e carimbos regulamentares autênticos com desgaste mecânico tridimensional.",
          boundingBox: [2, 2, 96, 96]
        }
      ],
      metadata: {
        cameraModel: "Scanner de Mesa Flatbed HP (Simulado)",
        software: "LibPNG Encoder",
        creationDate: "27/05/2026",
        modifyDate: "27/05/2026 18:31:02",
        compression: "PNG (Lossless)",
        hasExif: true,
        exifAnomalyDetected: true,
        exifAnomalyDetails: "Inconsistências críticas nos carimbos de tempo de criação versus a maturidade do padrão criptográfico do passaporte."
      }
    }
  },
  {
    id: "clima-extremo",
    title: "Furacão sobre o Rio de Janeiro",
    description: "Imagem que circulou mundialmente após alerta meteorológico, mostrando nuvens apocalípticas no formato de redemoinho acima do Cristo Redentor.",
    source: "Gerada por IA",
    imageUrl: "https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?w=800&auto=format&fit=crop&q=80",
    mode: AnalysisMode.RAPIDO,
    analysis: {
      fileName: "rio_apocalypse_weather.png",
      fileSize: 8483921, // 8.1 MB
      mimeType: "image/png",
      dimensions: { width: 1440, height: 1440 },
      mode: AnalysisMode.RAPIDO,
      timestamp: "2026-05-15T18:40:11Z",
      authenticityScore: 3, // Highly fake
      confidence: 0.98,
      interpretationBand: {
        label: "Alta probabilidade de geração por IA",
        description: "A imagem exibe padrões biométricos e estatísticos inequívocos de geração integral por IA generativa (p. ex., Midjourney).",
        classColor: "text-rose-600 dark:text-rose-400",
        bgColor: "bg-rose-500/10",
        borderColor: "border-rose-500/20"
      },
      layers: {
        globalArtifacts: {
          score: 2,
          findings: "Assinatura espectral característica do motor Midjourney v6 encontrada em 98.4% da malha. Texturas hiper-detalhadas e contraste dramático não-natural.",
          status: "danger"
        },
        internalConsistency: {
          score: 5,
          findings: "Incoerências na escala das nuvens gigantesca comparadas à linha costeira e montanhas. O reflexo da água do mar é de um pôr do sol azul-lilás inconsequente.",
          status: "danger"
        },
        metadataForensic: {
          score: 5,
          findings: "Nenhuma informação fotográfica de câmera física. Cabeçalhos de compressão idênticos a renderizadores sintéticos de nuvem.",
          status: "danger"
        },
        noiseCompression: {
          score: 1,
          findings: "Falta total de ruído térmico de sensor, comum em qualquer fotografia tirada sob condições extremas de luz e chuva.",
          status: "danger"
        }
      },
      regions: [
        {
          id: "r1",
          label: "Nuvens e Vórtex Climático",
          category: "ai_generated",
          suspicionScore: 99,
          findings: "Estrutura meteorológica simulada. Nuvens exibem padrões fractais matemáticos impossíveis no mundo físico real.",
          boundingBox: [0, 0, 100, 75]
        },
        {
          id: "r2",
          label: "Monumento do Cristo Redentor",
          category: "ai_generated",
          suspicionScore: 93,
          findings: "Adulteração tridimensional. Detalhes anatômicos e arquitetônicos simplificados com proporções ligeiramente alteradas comparadas ao monumento federal original.",
          boundingBox: [40, 50, 20, 35]
        }
      ],
      metadata: {
        cameraModel: "Câmera Virtual (M6 Renderer)",
        software: "Midjourney Neural Engine",
        creationDate: "15/05/2026",
        modifyDate: "Não modificado",
        compression: "Sintética",
        hasExif: false,
        exifAnomalyDetected: true,
        exifAnomalyDetails: "A imagem tem sua gênese exclusivamente no domínio digital, sem nunca ter sido projetada sob uma lente física ou lente cônica."
      }
    }
  },
  {
    id: "noticia-real",
    title: "Trabalho de Campo em Safári Geológico",
    description: "Fotografia capturada por geólogo em alta resolução na fenda geológica da Namíbia. Totalmente fidedigna e sem intervenções.",
    source: "Câmera Real",
    imageUrl: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&auto=format&fit=crop&q=80",
    mode: AnalysisMode.COMPLETO,
    analysis: {
      fileName: "GEOM_NAM_04932.jpg",
      fileSize: 8329481, // 7.9 MB
      mimeType: "image/jpeg",
      dimensions: { width: 4032, height: 3024 },
      mode: AnalysisMode.COMPLETO,
      timestamp: "2026-06-01T11:42:01Z",
      authenticityScore: 96, // Highly genuine
      confidence: 0.95,
      interpretationBand: {
        label: "Alta probabilidade de autenticidade",
        description: "A imagem exibe padrões consistentes com captura direta de sensor fotográfico real, sem sinais de geração ou manipulações por IA generativa.",
        classColor: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20"
      },
      layers: {
        globalArtifacts: {
          score: 97,
          findings: "Análise espectral livre de padrões de grade ou ruído periódico de upscaling. Grão óptico autêntico.",
          status: "secure"
        },
        internalConsistency: {
          score: 95,
          findings: "Distribuição perfeita da iluminação natural incidente (sol do meio-dia) e difração atmosférica coerente em todas as profundidades.",
          status: "secure"
        },
        metadataForensic: {
          score: 96,
          findings: "Metadados EXIF abundantes e perfeitamente coerentes. Contém dados de data, exposição (f/2.8, ISO 100), modelo de câmera e geolocalização exata.",
          status: "secure"
        },
        noiseCompression: {
          score: 95,
          findings: "Ruído nativo e térmico correspondente exatamente ao perfil de cores sRGB do sensor CMOS Canon de 40MP.",
          status: "secure"
        }
      },
      regions: [
        {
          id: "r1",
          label: "Fenda Rochosa e Detalhes de Geologia",
          category: "real",
          suspicionScore: 3,
          findings: "Texturas orgânicas ricas, fraturas rochosas físicas microscópicas, poeira e grãos de areia consistentes em foco óptico real.",
          boundingBox: [0, 0, 100, 100]
        }
      ],
      metadata: {
        cameraModel: "Canon EOS R5",
        software: "Canon Firmware 1.4.0",
        creationDate: "01/06/2026 11:42:01",
        modifyDate: "Não modificado",
        compression: "RAW convertida para JPEG",
        hasExif: true,
        exifAnomalyDetected: false,
        exifAnomalyDetails: "Nenhuma anomalia de metadados. Todos os hashes do arquivo sinaleiam integridade absoluta."
      }
    }
  }
];
