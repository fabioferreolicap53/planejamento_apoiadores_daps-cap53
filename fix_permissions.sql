-- Arquivo de Correção de Permissões (RLS)
-- Execute este script no Editor SQL do Supabase para corrigir a visualização dos planos.

-- 1. Habilitar RLS na tabela plans (caso não esteja)
ALTER TABLE IF EXISTS public.plans ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas que podem estar conflitando ou faltando
DROP POLICY IF EXISTS "All users can view all plans" ON public.plans;
DROP POLICY IF EXISTS "Users can insert their own plans" ON public.plans;
DROP POLICY IF EXISTS "Owners and Admins can update plans" ON public.plans;
DROP POLICY IF EXISTS "Owners and Admins can delete plans" ON public.plans;

-- 3. Criar Política de LEITURA (SELECT)
-- Esta é a política crítica para "Normal" ver todos os planos.
CREATE POLICY "All users can view all plans" 
ON public.plans 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 4. Criar Política de INSERÇÃO (INSERT)
CREATE POLICY "Users can insert their own plans" 
ON public.plans 
FOR INSERT 
WITH CHECK (auth.uid() = professional_id);

-- 5. Criar Política de ATUALIZAÇÃO (UPDATE)
CREATE POLICY "Owners and Admins can update plans" 
ON public.plans 
FOR UPDATE 
USING (
  auth.uid() = professional_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'Administrador'
  )
);

-- 6. Criar Política de EXCLUSÃO (DELETE)
CREATE POLICY "Owners and Admins can delete plans" 
ON public.plans 
FOR DELETE 
USING (
  auth.uid() = professional_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'Administrador'
  )
);

-- Mensagem de confirmação (opcional, para visualização no editor)
SELECT 'Permissões atualizadas com sucesso!' as status;
