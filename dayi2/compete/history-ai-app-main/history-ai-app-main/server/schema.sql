-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    registration_id SERIAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Logs (for semantic analysis)
CREATE TABLE IF NOT EXISTS public.learning_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    scene_id TEXT NOT NULL,
    log_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Results Table
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    scene_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Persona Profiles Table
CREATE TABLE IF NOT EXISTS public.persona_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    strategic INTEGER DEFAULT 0,
    empathy INTEGER DEFAULT 0,
    people_oriented INTEGER DEFAULT 0,
    meticulousness INTEGER DEFAULT 0,
    pragmatic INTEGER DEFAULT 0,
    ai_comments TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge Documents Table
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT,
    category TEXT,
    tags TEXT[],
    scene_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Chunks Table (for RAG vector storage)
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding vector(768),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding 
ON public.knowledge_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for document lookup
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id 
ON public.knowledge_chunks(document_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_scene_id 
ON public.knowledge_documents(scene_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_category 
ON public.knowledge_documents(category);

-- Create vector similarity search function
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE(
  id uuid,
  chunk_text text,
  document_id uuid,
  title text,
  source text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.chunk_text,
    kc.document_id,
    kd.title,
    kd.source,
    1 - (kc.embedding <=> query_embedding) AS similarity,
    kc.metadata
  FROM public.knowledge_chunks kc
  JOIN public.knowledge_documents kd ON kc.document_id = kd.id
  WHERE 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function to add knowledge document with chunks
CREATE OR REPLACE FUNCTION add_knowledge_document_with_chunks(
  p_title text,
  p_content text,
  p_source text,
  p_category text,
  p_tags text[],
  p_scene_id text,
  p_chunks jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_document_id uuid;
  v_chunk jsonb;
BEGIN
  -- Insert document
  INSERT INTO public.knowledge_documents (title, content, source, category, tags, scene_id)
  VALUES (p_title, p_content, p_source, p_category, p_tags, p_scene_id)
  RETURNING id INTO v_document_id;
  
  -- Insert chunks
  FOR v_chunk IN SELECT * FROM jsonb_array_elements(p_chunks)
  LOOP
    INSERT INTO public.knowledge_chunks (
      document_id, 
      chunk_text, 
      chunk_index, 
      embedding, 
      metadata
    ) VALUES (
      v_document_id,
      v_chunk->>'text',
      (v_chunk->>'index')::int,
      (v_chunk->>'embedding')::vector(768),
      v_chunk->'metadata'
    );
  END LOOP;
  
  RETURN v_document_id;
END;
$$;
