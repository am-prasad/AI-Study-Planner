-- Create storage bucket for syllabi
INSERT INTO storage.buckets (id, name, public) VALUES ('syllabi', 'syllabi', true);

-- Create policy for uploading syllabi
CREATE POLICY "Anyone can upload syllabi"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'syllabi');

-- Create policy for reading syllabi
CREATE POLICY "Anyone can read syllabi"
ON storage.objects FOR SELECT
USING (bucket_id = 'syllabi');