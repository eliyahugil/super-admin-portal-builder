-- Create storage bucket for ID documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('id-documents', 'id-documents', true);

-- Create policies for ID documents storage
CREATE POLICY "Anyone can upload ID documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'id-documents');

CREATE POLICY "Anyone can view ID documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'id-documents');

CREATE POLICY "Anyone can delete their ID documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'id-documents');