export interface Inspiration {
  id: string;
  type: 'link' | 'image';
  url: string;
  title?: string;
}

export interface ScriptPart {
  id: string;
  title: string;
  content: string;
  /** Scene depiction (advanced mode) */
  sceneDepiction?: string;
  inspirations: Inspiration[];
}

export interface Script {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isMultiPart: boolean;
  // For single mode
  content?: string;
  inspirations?: Inspiration[];
  // For multi-part mode
  parts?: ScriptPart[];
  // Preserved multi-part state when switching to single mode
  preservedParts?: ScriptPart[];
  // Soundtracks for the script (can play multiple at once)
  soundtracks?: { url: string; name?: string }[];
  // Back-compat (older scripts)
  soundtrackUrl?: string;
  soundtrackName?: string;
  // Project-specific moodboard images
  moodboard?: string[];
  // Advanced mode: part boxes show scene depiction + dialogue
  advancedMode?: boolean;
}

// Moodboard image type for the general moodboard
export interface MoodboardImage {
  id: string;
  url: string;
  createdAt: Date;
}
