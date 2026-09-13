CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL CHECK (service IN ('Demolição de Casa', 'Demolição de Prédio', 'Demolição Industrial', 'Terraplanagem', 'Escavação', 'Limpeza de Terreno', 'Remoção de Entulho', 'Fechamento de Obra (Tapume)')),
  urgency text NOT NULL CHECK (urgency IN ('Urgente — até 7 dias', 'Este mês', 'Estou planejando / sem data')),
  address text NOT NULL,
  city text NOT NULL,
  size text,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  files text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'respondido', 'convertido')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.quote_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT ALL ON public.quote_requests TO service_role;

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create quote requests"
ON public.quote_requests
FOR INSERT
TO anon
WITH CHECK (status = 'novo');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_quote_requests_updated_at
BEFORE UPDATE ON public.quote_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Public can upload request media"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'request-media'
  AND (storage.foldername(name))[1] = 'requests'
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'mp4', 'mov', 'webm')
);