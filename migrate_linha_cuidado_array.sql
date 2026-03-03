-- Migração para alterar o campo linha_cuidado de TEXT para TEXT[] (array de strings)
-- Execute este script no Editor SQL do Supabase para suportar múltiplas linhas de cuidado por plano.

-- 1. Primeiro, adicionar uma nova coluna temporária como array
ALTER TABLE public.plans ADD COLUMN linha_cuidado_new TEXT[];

-- 2. Converter os dados existentes: cada valor TEXT vira um array com um elemento
UPDATE public.plans SET linha_cuidado_new = ARRAY[linha_cuidado] WHERE linha_cuidado IS NOT NULL AND linha_cuidado != '';

-- 3. Para registros com valor NULL ou vazio, definir como array vazio
UPDATE public.plans SET linha_cuidado_new = ARRAY[]::TEXT[] WHERE linha_cuidado IS NULL OR linha_cuidado = '';

-- 4. Remover a coluna antiga
ALTER TABLE public.plans DROP COLUMN linha_cuidado;

-- 5. Renomear a nova coluna para o nome original
ALTER TABLE public.plans RENAME COLUMN linha_cuidado_new TO linha_cuidado;

-- 6. Adicionar comentário para documentação
COMMENT ON COLUMN public.plans.linha_cuidado IS 'Array de linhas de cuidado associadas ao plano (suporte a múltiplas seleções)';

-- 7. Verificar a migração
SELECT 
  id,
  professional_id,
  linha_cuidado,
  array_length(linha_cuidado, 1) as qtd_linhas
FROM public.plans 
LIMIT 10;

-- Mensagem de confirmação
SELECT 'Migração concluída com sucesso! Campo linha_cuidado agora é um array de strings.' as status;