-- Create moodboard bucket for general and project moodboards
INSERT INTO storage.buckets (id, name, public) VALUES ('moodboard', 'moodboard', true);

-- Create soundtracks bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('soundtracks', 'soundtracks', true);

-- Allow public read access to moodboard
CREATE POLICY "Public read access for moodboard"
ON storage.objects FOR SELECT
USING (bucket_id = 'moodboard');

-- Allow public uploads to moodboard (for anonymous users)
CREATE POLICY "Anyone can upload to moodboard"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'moodboard');

-- Allow public deletes from moodboard
CREATE POLICY "Anyone can delete from moodboard"
ON storage.objects FOR DELETE
USING (bucket_id = 'moodboard');

-- Allow public read access to soundtracks
CREATE POLICY "Public read access for soundtracks"
ON storage.objects FOR SELECT
USING (bucket_id = 'soundtracks');

-- Allow public uploads to soundtracks
CREATE POLICY "Anyone can upload to soundtracks"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'soundtracks');

-- Allow public deletes from soundtracks
CREATE POLICY "Anyone can delete from soundtracks"
ON storage.objects FOR DELETE
USING (bucket_id = 'soundtracks');