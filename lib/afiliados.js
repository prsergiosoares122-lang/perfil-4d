import { supabase } from './supabase'

/**
 * Extrai o e-mail do afiliado/analista criador do campo 'plano' do casal.
 * Exemplo: "relatorio:maria@terapeuta.com" -> "maria@terapeuta.com"
 */
export function obterEmailCriador(planoRaw) {
  if (!planoRaw) return null
  const partes = planoRaw.split(':')
  if (partes.length > 1) {
    return partes[1].trim().toLowerCase()
  }
  return null
}

/**
 * Remove a parte do e-mail do plano do casal para exibição visual limpa.
 * Exemplo: "relatorio:maria@terapeuta.com" -> "Relatório"
 */
export function limparNomePlano(planoRaw) {
  if (!planoRaw) return 'Relatório'
  const base = planoRaw.split(':')[0].toLowerCase()
  if (base === 'devolutiva') return 'Devolutiva'
  return 'Relatório'
}

/**
 * Decrementa o saldo do afiliado criador do casal, caso se aplique.
 * Se o saldo for 0 ou menor, lança um erro impedindo a geração.
 */
export async function decrementarSaldoRelatorio(casalId) {
  // 1. Carregar casal
  const { data: casal, error: errorCasal } = await supabase
    .from('casais')
    .select('*')
    .eq('id', casalId)
    .single()

  if (errorCasal || !casal) {
    throw new Error('Casal não encontrado para verificação de saldo.')
  }

  // Se já foi gerado anteriormente, não decrementa de novo
  if (casal.status === 'relatorio_gerado') {
    return { success: true, alreadyGenerated: true }
  }

  // Obter o e-mail do criador
  const emailCriador = obterEmailCriador(casal.plano)
  if (!emailCriador) {
    // Sem criador associado (ex: cadastrado diretamente pelo Admin do sistema)
    return { success: true }
  }

  // 2. Carregar profissional criador
  const { data: profissionais, error: errorPro } = await supabase
    .from('casais')
    .select('*')
    .eq('nome_esposa', emailCriador)

  if (errorPro || !profissionais || profissionais.length === 0) {
    // Se o criador não existe mais ou não é um profissional válido
    return { success: true }
  }

  const pro = profissionais[0]

  // Se o profissional estiver inativo ou bloqueado
  if (pro.status === 'Inativo' || pro.status === 'Bloqueado') {
    throw new Error('Acesso bloqueado: A conta do profissional associado está inativa.')
  }

  const planoRaw = pro.plano || ''

  // Super Admins possuem relatórios ilimitados
  if (planoRaw.startsWith('super_admin')) {
    return { success: true, unlimited: true }
  }

  // Extrair tipo e saldo
  const partes = planoRaw.split(':')
  const papel = partes[0] // 'afiliado' ou 'analista'
  const saldoAtual = partes[1] ? parseInt(partes[1]) || 0 : 0

  if (saldoAtual <= 0) {
    throw new Error('Acesso bloqueado: Seu saldo de relatórios está esgotado. Entre em contato com o administrador para adquirir novos créditos.')
  }

  // Decrementar saldo
  const novoSaldo = saldoAtual - 1
  const novoPlanoDb = `${papel}:${novoSaldo}`

  // Atualizar saldo no banco
  const { error: errorUpdate } = await supabase
    .from('casais')
    .update({ plano: novoPlanoDb })
    .eq('id', pro.id)

  if (errorUpdate) {
    throw new Error('Erro ao debitar saldo de relatórios: ' + errorUpdate.message)
  }

  return { success: true, novoSaldo }
}
