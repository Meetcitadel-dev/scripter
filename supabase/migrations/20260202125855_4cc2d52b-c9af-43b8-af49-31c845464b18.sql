-- Create storage bucket for inspiration images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inspirations', 'inspirations', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read images
CREATE POLICY "Anyone can view inspiration images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'inspirations');

-- Allow anyone to upload images (no auth required for this app)
CREATE POLICY "Anyone can upload inspiration images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'inspirations');

-- Allow anyone to delete their uploaded images
CREATE POLICY "Anyone can delete inspiration images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'inspirations');