import { useState, useRef, useEffect } from 'react';
import { Music, Upload, X, Play, Pause, SkipBack, SkipForward, Loader2, Plus, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Soundtrack } from '@/types/script';

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

interface MultiSoundtrackPlayerProps {
  scriptId: string;
  soundtracks: Soundtrack[];
  onUpdate: (soundtracks: Soundtrack[]) => void;
}

export const MultiSoundtrackPlayer = ({
  scriptId,
  soundtracks,
  onUpdate,
}: MultiSoundtrackPlayerProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [audioStates, setAudioStates] = useState<Record<string, AudioState>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize audio states
    const initialStates: Record<string, AudioState> = {};
    soundtracks.forEach(track => {
      if (!audioStates[track.id]) {
        initialStates[track.id] = { isPlaying: false, currentTime: 0, duration: 0 };
      }
    });
    if (Object.keys(initialStates).length > 0) {
      setAudioStates(prev => ({ ...prev, ...initialStates }));
    }
  }, [soundtracks]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newTracks: Soundtrack[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('audio/')) {
          toast.error(`${file.name} is not an audio file`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const trackId = Math.random().toString(36).substring(2, 15);
        const fileName = `${scriptId}-${trackId}.${fileExt}`;
        const filePath = `tracks/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('soundtracks')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('soundtracks')
          .getPublicUrl(filePath);

        newTracks.push({
          id: trackId,
          url: publicUrl,
          name: file.name,
        });
      }
      
      if (newTracks.length > 0) {
        onUpdate([...soundtracks, ...newTracks]);
        toast.success(`${newTracks.length} soundtrack(s) added`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload soundtrack');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const setupAudioHandlers = (trackId: string, audio: HTMLAudioElement) => {
    audio.loop = true;
    
    audio.addEventListener('timeupdate', () => {
      setAudioStates(prev => ({
        ...prev,
        [trackId]: { ...prev[trackId], currentTime: audio.currentTime },
      }));
    });

    audio.addEventListener('durationchange', () => {
      setAudioStates(prev => ({
        ...prev,
        [trackId]: { ...prev[trackId], duration: audio.duration },
      }));
    });
  };

  const getAudioRef = (trackId: string, url: string) => {
    if (!audioRefs.current[trackId]) {
      const audio = new Audio(url);
      setupAudioHandlers(trackId, audio);
      audioRefs.current[trackId] = audio;
    }
    return audioRefs.current[trackId];
  };

  const togglePlay = (trackId: string, url: string) => {
    const audio = getAudioRef(trackId, url);
    const state = audioStates[trackId];
    
    if (state?.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    
    setAudioStates(prev => ({
      ...prev,
      [trackId]: { ...prev[trackId], isPlaying: !state?.isPlaying },
    }));
  };

  const handleSeek = (trackId: string, url: string, value: number[]) => {
    const audio = getAudioRef(trackId, url);
    audio.currentTime = value[0];
    setAudioStates(prev => ({
      ...prev,
      [trackId]: { ...prev[trackId], currentTime: value[0] },
    }));
  };

  const skipBackward = (trackId: string, url: string) => {
    const audio = getAudioRef(trackId, url);
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const skipForward = (trackId: string, url: string) => {
    const audio = getAudioRef(trackId, url);
    const state = audioStates[trackId];
    audio.currentTime = Math.min(state?.duration || 0, audio.currentTime + 10);
  };

  const removeTrack = (trackId: string) => {
    const audio = audioRefs.current[trackId];
    if (audio) {
      audio.pause();
      delete audioRefs.current[trackId];
    }
    onUpdate(soundtracks.filter(t => t.id !== trackId));
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
      });
    };
  }, []);

  return (
    <div className="space-y-2">
      {soundtracks.map((track) => {
        const state = audioStates[track.id] || { isPlaying: false, currentTime: 0, duration: 0 };
        
        return (
          <div key={track.id} className="flex items-center gap-3 bg-secondary/50 rounded-lg px-3 py-2">
            <Music className="w-4 h-4 text-primary flex-shrink-0" />
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => skipBackward(track.id, track.url)}
            >
              <SkipBack className="w-3.5 h-3.5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => togglePlay(track.id, track.url)}
            >
              {state.isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => skipForward(track.id, track.url)}
            >
              <SkipForward className="w-3.5 h-3.5" />
            </Button>
            
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(state.currentTime)}
              </span>
              <Slider
                value={[state.currentTime]}
                max={state.duration || 100}
                step={0.1}
                onValueChange={(v) => handleSeek(track.id, track.url, v)}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(state.duration)}
              </span>
            </div>
            
            <span className="text-xs text-muted-foreground truncate max-w-[100px]" title={track.name}>
              {track.name}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeTrack(track.id)}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      })}

      {/* Add soundtrack button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Soundtrack
            </>
          )}
        </Button>
        {soundtracks.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {soundtracks.length} track{soundtracks.length !== 1 ? 's' : ''} • Play multiple simultaneously
          </span>
        )}
      </div>
    </div>
  );
};
