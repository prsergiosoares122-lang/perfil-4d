-- =============================================
-- PERFIL 4D — SCHEMA DO BANCO DE DADOS
-- Cole este SQL no Supabase → SQL Editor → Run
-- =============================================

-- Tabela de casais
CREATE TABLE casais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_esposo TEXT NOT NULL,
  nome_esposa TEXT NOT NULL,
  plano TEXT DEFAULT 'relatorio', -- 'relatorio' ou 'devolutiva'
  status TEXT DEFAULT 'aguardando', -- 'aguardando', 'esposo_respondeu', 'esposa_respondeu', 'completo', 'relatorio_gerado'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de respostas
CREATE TABLE respostas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  casal_id UUID REFERENCES casais(id) ON DELETE CASCADE,
  conjuge TEXT NOT NULL CHECK (conjuge IN ('esposo', 'esposa')),
  -- Bloco 1
  comunicativo_1 INT, comunicativo_2 INT, comunicativo_3 INT,
  comunicativo_4 INT, comunicativo_5 INT, comunicativo_6 INT, comunicativo_7 INT,
  socializante_1 INT, socializante_2 INT, socializante_3 INT,
  socializante_4 INT, socializante_5 INT, socializante_6 INT, socializante_7 INT,
  analitico_1 INT, analitico_2 INT, analitico_3 INT,
  analitico_4 INT, analitico_5 INT, analitico_6 INT, analitico_7 INT,
  determinante_1 INT, determinante_2 INT, determinante_3 INT,
  determinante_4 INT, determinante_5 INT, determinante_6 INT, determinante_7 INT,
  -- Bloco 2
  empatia_1 INT, empatia_2 INT, empatia_3 INT,
  empatia_4 INT, empatia_5 INT, empatia_6 INT, empatia_7 INT,
  expressividade_1 INT, expressividade_2 INT, expressividade_3 INT,
  expressividade_4 INT, expressividade_5 INT, expressividade_6 INT, expressividade_7 INT,
  resiliencia_1 INT, resiliencia_2 INT, resiliencia_3 INT,
  resiliencia_4 INT, resiliencia_5 INT, resiliencia_6 INT, resiliencia_7 INT,
  proatividade_1 INT, proatividade_2 INT, proatividade_3 INT,
  proatividade_4 INT, proatividade_5 INT, proatividade_6 INT, proatividade_7 INT,
  espiritualidade_1 INT, espiritualidade_2 INT, espiritualidade_3 INT,
  espiritualidade_4 INT, espiritualidade_5 INT, espiritualidade_6 INT, espiritualidade_7 INT,
  financeiro_1 INT, financeiro_2 INT, financeiro_3 INT,
  financeiro_4 INT, financeiro_5 INT, financeiro_6 INT, financeiro_7 INT,
  sinergia_1 INT, sinergia_2 INT, sinergia_3 INT,
  sinergia_4 INT, sinergia_5 INT, sinergia_6 INT, sinergia_7 INT,
  sexualidade_1 INT, sexualidade_2 INT, sexualidade_3 INT,
  sexualidade_4 INT, sexualidade_5 INT, sexualidade_6 INT, sexualidade_7 INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(casal_id, conjuge)
);

-- Habilitar RLS (segurança)
ALTER TABLE casais ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas ENABLE ROW LEVEL SECURITY;

-- Política: apenas usuários autenticados (você) veem tudo
CREATE POLICY "Admin acessa tudo" ON casais
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin acessa respostas" ON respostas
  FOR ALL USING (auth.role() = 'authenticated');

-- Política: anônimos só inserem (para o casal responder)
CREATE POLICY "Casal insere respostas" ON respostas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Casal insere casal" ON casais
  FOR INSERT WITH CHECK (true);

-- Política: anônimos lêem casais por ID
CREATE POLICY "Casal lê por ID" ON casais
  FOR SELECT USING (true);

-- Política: anônimos atualizam casais por ID
CREATE POLICY "Casal atualiza por ID" ON casais
  FOR UPDATE USING (true) WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER casais_updated_at
  BEFORE UPDATE ON casais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
