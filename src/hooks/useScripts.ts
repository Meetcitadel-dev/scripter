import { useState, useEffect } from 'react';
import { Script, ScriptPart, Inspiration } from '@/types/script';

const STORAGE_KEY = 'content-scripts';

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useScripts = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setScripts(parsed.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      })));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
    }
  }, [scripts, isLoaded]);

  const createScript = (title: string, isMultiPart: boolean = false): Script => {
    const newScript: Script = {
      id: generateId(),
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
      isMultiPart,
      content: isMultiPart ? undefined : '',
      inspirations: isMultiPart ? undefined : [],
      parts: isMultiPart ? [{
        id: generateId(),
        title: 'Part 1',
        content: '',
        inspirations: [],
      }] : undefined,
      moodboard: [],
      soundtracks: [],
    };
    setScripts(prev => [newScript, ...prev]);
    return newScript;
  };

  const updateScript = (id: string, updates: Partial<Script>) => {
    setScripts(prev => prev.map(script => 
      script.id === id 
        ? { ...script, ...updates, updatedAt: new Date() }
        : script
    ));
  };

  const deleteScript = (id: string) => {
    setScripts(prev => prev.filter(script => script.id !== id));
  };

  const moveScript = (id: string, direction: 'up' | 'down') => {
    setScripts(prev => {
      const index = prev.findIndex((s) => s.id === id);
      if (index === -1) return prev;
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const addMoodboardImage = (scriptId: string, url: string) => {
    setScripts(prev => prev.map(script => {
      if (script.id !== scriptId) return script;
      const next = [...(script.moodboard || []), url];
      // de-dupe while preserving order
      const deduped = Array.from(new Set(next));
      return { ...script, moodboard: deduped, updatedAt: new Date() };
    }));
  };

  const removeMoodboardImage = (scriptId: string, url: string) => {
    setScripts(prev => prev.map(script => {
      if (script.id !== scriptId) return script;
      return { ...script, moodboard: (script.moodboard || []).filter(u => u !== url), updatedAt: new Date() };
    }));
  };

  const addPart = (scriptId: string) => {
    setScripts(prev => prev.map(script => {
      if (script.id !== scriptId || !script.parts) return script;
      const newPart: ScriptPart = {
        id: generateId(),
        title: `Part ${script.parts.length + 1}`,
        content: '',
        sceneDepiction: '',
        inspirations: [],
      };
      return {
        ...script,
        parts: [...script.parts, newPart],
        updatedAt: new Date(),
      };
    }));
  };

  const updatePart = (scriptId: string, partId: string, updates: Partial<ScriptPart>) => {
    setScripts(prev => prev.map(script => {
      if (script.id !== scriptId || !script.parts) return script;
      return {
        ...script,
        parts: script.parts.map(part =>
          part.id === partId ? { ...part, ...updates } : part
        ),
        updatedAt: new Date(),
      };
    }));
  };

  const deletePart = (scriptId: string, partId: string) => {
    setScripts(prev => prev.map(script => {
      if (script.id !== scriptId || !script.parts) return script;
      return {
        ...script,
        parts: script.parts.filter(part => part.id !== partId),
        updatedAt: new Date(),
      };
    }));
  };

  const addInspiration = (
    scriptId: string, 
    inspiration: Omit<Inspiration, 'id'>,
    partId?: string
  ) => {
    const newInspiration: Inspiration = { ...inspiration, id: generateId() };
    
    setScripts(prev => prev.map(script => {
      if (script.id !== scriptId) return script;
      
      if (partId && script.parts) {
        return {
          ...script,
          parts: script.parts.map(part =>
            part.id === partId 
              ? { ...part, inspirations: [...part.inspirations, newInspiration] }
              : part
          ),
          updatedAt: new Date(),
        };
      } else if (script.inspirations) {
        return {
          ...script,
          inspirations: [...script.inspirations, newInspiration],
          updatedAt: new Date(),
        };
      }
      return script;
    }));
  };

  const removeInspiration = (scriptId: string, inspirationId: string, partId?: string) => {
    setScripts(prev => prev.map(script => {
      if (script.id !== scriptId) return script;
      
      if (partId && script.parts) {
        return {
          ...script,
          parts: script.parts.map(part =>
            part.id === partId 
              ? { ...part, inspirations: part.inspirations.filter(i => i.id !== inspirationId) }
              : part
          ),
          updatedAt: new Date(),
        };
      } else if (script.inspirations) {
        return {
          ...script,
          inspirations: script.inspirations.filter(i => i.id !== inspirationId),
          updatedAt: new Date(),
        };
      }
      return script;
    }));
  };

  const getScript = (id: string): Script | undefined => {
    return scripts.find(script => script.id === id);
  };

  return {
    scripts,
    isLoaded,
    createScript,
    updateScript,
    deleteScript,
    moveScript,
    addMoodboardImage,
    removeMoodboardImage,
    addPart,
    updatePart,
    deletePart,
    addInspiration,
    removeInspiration,
    getScript,
  };
};
