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
  sceneDepiction?: string; // Advanced mode field
  inspirations: Inspiration[];
}

export interface Soundtrack {
  id: string;
  url: string;
  name: string;
}

export interface Script {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isMultiPart: boolean;
  // For single mode
  content?: string;
  sceneDepiction?: string; // Advanced mode field for single mode
  inspirations?: Inspiration[];
  // For multi-part mode
  parts?: ScriptPart[];
  // Preserved multi-part state when switching to single mode
  preservedParts?: ScriptPart[];
  // Multiple soundtracks for the script
  soundtracks?: Soundtrack[];
  // Legacy single soundtrack (for backward compatibility)
  soundtrackUrl?: string;
  soundtrackName?: string;
  // Project-specific moodboard images
  moodboard?: string[];
}

// Moodboard image type for the general moodboard
export interface MoodboardImage {
  id: string;
  url: string;
  originalWidth?: number;
  originalHeight?: number;
  createdAt: Date;
}
