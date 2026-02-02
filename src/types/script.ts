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
}
