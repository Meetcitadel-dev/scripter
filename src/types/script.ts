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
  // Soundtrack for the script
  soundtrackUrl?: string;
  soundtrackName?: string;
  // Project-specific moodboard images
  moodboard?: string[];
}

// Moodboard image type for the general moodboard
export interface MoodboardImage {
  id: string;
  url: string;
  createdAt: Date;
}
