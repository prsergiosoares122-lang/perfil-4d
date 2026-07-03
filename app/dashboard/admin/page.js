'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const router = useRouter()
  const [autorizado, setAutorizado] = useState(false)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [detalhesAberto, setDetalhesAberto] = useState(false)
  const [selecionado, setSelecionado] = useState(null)
  
  const [userRole, setUserRole] = useState('Super Admin')
  const [afiliados, setAfiliados] = useState([])

  // Campos do formulário de novo profissional
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const [papel, setPapel] = useState('Afiliado')
  const [relatoriosIniciais, setRelatoriosIniciais] = useState('10')

  // Campos de Ajuste de Relatórios (Modal Olho)
  const [ajusteQtd, setAjusteQtd] = useState('5')
  const [ajusteAcao, setAjusteAcao] = useState('Adicionar')
  const [ajusteMotivo, setAjusteMotivo] = useState('')

  useEffect(() => {
    verificarAuth()
    carregarProfissionais()
  }, [])

  async function verificarAuth() {
    if (typeof window !== 'undefined' && (window.location.hash || window.location.search.includes('code='))) {
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    const email = session.user.email.toLowerCase()
    const isSuperAdmin = email === 'prsergiosoares122@gmail.com' ||
                         email === 'thiago.medeiros@perfil4d.com' ||
                         email === 'sergio.soares@perfil4d.com' ||
                         email === 'sergio@email.com' ||
                         email.includes('admin')
    if (!isSuperAdmin) {
      alert('Acesso Negado: Esta área é restrita a Super Administradores.')
      router.push('/dashboard')
    } else {
      setUserRole('Super Admin')
      setAutorizado(true)
    }
  }

  async function carregarProfissionais() {
    try {
      const { data, error } = await supabase
        .from('casais')
        .select('*')
        .in('plano', ['afiliado', 'analista', 'super_admin'])
      if (error) throw error

      const mapeados = (data || []).map(item => ({
        id: item.id,
        nome: item.nome_esposo,
        email: item.email_esposo,
        whatsapp: item.nome_esposa || '',
        senha: item.email_esposa || '',
        papel: item.plano === 'super_admin' ? 'Super Admin' : item.plano === 'analista' ? 'Analista' : 'Afiliado',
        relatorios: item.plano === 'super_admin' ? 'Ilimitados' : 10,
        status: item.status === 'Bloqueado' ? 'Bloqueado' : 'Ativo',
        historico: []
      }))
      setAfiliados(mapeados)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddAfiliado = async (e) => {
    e.preventDefault()
    if (!nome || !email || !senha) return

    try {
      // 1. Criar credenciais no Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: senha,
      })
      if (signUpError) throw new Error('Erro ao criar credenciais de acesso: ' + signUpError.message)

      // 2. Inserir registro correspondente no banco
      const planoDb = papel === 'Super Admin' ? 'super_admin' : papel === 'Analista' ? 'analista' : 'afiliado'
      const { error: dbError } = await supabase
        .from('casais')
        .insert({
          nome_esposo: nome,
          email_esposo: email,
          nome_esposa: whatsapp,
          email_esposa: senha,
          plano: planoDb,
          status: 'Ativo'
        })
      
      if (dbError) throw new Error('Erro ao persistir profissional no banco: ' + dbError.message)

      await carregarProfissionais()

      setNome('')
      setEmail('')
      setWhatsapp('')
      setSenha('')
      setPapel('Afiliado')
      setModalAberto(false)
      alert('Profissional cadastrado com sucesso!')
    } catch (err) {
      alert(err.message)
    }
  }

  const handleBloquearAfiliado = async (id, nomeProf, statusAtual) => {
    if (userRole !== 'Super Admin') {
      alert('Acesso Negado: Apenas o Super Admin tem autoridade para bloquear/desbloquear profissionais.')
      return
    }

    const acaoLabel = statusAtual === 'Ativo' ? 'bloquear' : 'desbloquear'
    if (confirm(`Deseja realmente ${acaoLabel} o profissional "${nomeProf}"?`)) {
      try {
        const novoStatus = statusAtual === 'Ativo' ? 'Bloqueado' : 'Ativo'
        const { error } = await supabase
          .from('casais')
          .update({ status: novoStatus })
          .eq('id', id)
        if (error) throw error

        setAfiliados(prev => prev.map(a => {
          if (a.id === id) {
            return { ...a, status: novoStatus }
          }
          return a
        }))
        alert(`Profissional ${statusAtual === 'Ativo' ? 'bloqueado' : 'desbloqueado'} com sucesso!`)
      } catch (err) {
        alert('Erro ao atualizar status: ' + err.message)
      }
    }
  }

  const handleDeletarAfiliado = async (id, nomeProf) => {
    if (userRole !== 'Super Admin') {
      alert('Acesso Negado: Apenas o Super Admin tem autoridade para excluir profissionais do sistema.')
      return
    }

    if (confirm(`Tem certeza de que deseja remover permanentemente o profissional "${nomeProf}"?`)) {
      try {
        const { error } = await supabase
          .from('casais')
          .delete()
          .eq('id', id)
        if (error) throw error

        setAfiliados(prev => prev.filter(a => a.id !== id))
        if (selecionado && selecionado.id === id) {
          setDetalhesAberto(false)
        }
        alert('Profissional removido com sucesso!')
      } catch (err) {
        alert('Erro ao excluir profissional: ' + err.message)
      }
    }
  }

  const handleAplicarAjuste = (e) => {
    e.preventDefault()
    if (!selecionado || selecionado.relatorios === 'Ilimitados') return

    const qtd = parseInt(ajusteQtd) || 0
    if (qtd <= 0) {
      alert('A quantidade informada precisa ser maior que zero.')
      return
    }

    const saldoAtual = parseInt(selecionado.relatorios) || 0
    let novoSaldo = saldoAtual

    if (ajusteAcao === 'Adicionar') {
      novoSaldo += qtd
    } else {
      if (qtd > saldoAtual) {
        alert('A quantidade informada excede o total de relatórios disponíveis.')
        return
      }
      novoSaldo -= qtd
    }

    const logEntry = {
      data: new Date().toLocaleDateString('pt-BR'),
      acao: ajusteAcao,
      qtd: qtd,
      motivo: ajusteMotivo || 'Ajuste administrativo'
    }

    const atualizados = afiliados.map(a => {
      if (a.id === selecionado.id) {
        const novoHist = [...a.historico, logEntry]
        const novoProf = { ...a, relatorios: novoSaldo, historico: novoHist }
        setSelecionado(novoProf) // Atualiza o modal ativo
        return novoProf
      }
      return a
    })

    setAfiliados(atualizados)
    setAjusteMotivo('')
    alert('Relatórios atualizados com sucesso!')
  }

  const afiliadosFiltrados = afiliados.filter(a => {
    const termo = busca.toLowerCase()
    return a.nome.toLowerCase().includes(termo) || 
           a.email.toLowerCase().includes(termo) || 
           a.papel.toLowerCase().includes(termo)
  })

  if (!autorizado) return null

  return (
    <div style={styles.container}>
      {/* Simulation Toggle Top Bar */}
      <div style={styles.simulacaoBar}>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0D1B3E' }}>
          Simulador de Permissões:
        </span>
        <select 
          style={styles.simulacaoSelect} 
          value={roleSimulado} 
          onChange={e => setRoleSimulado(e.target.value)}
        >
          <option value="Super Admin">Perfil: Super Admin (Acesso Completo)</option>
          <option value="Analista">Perfil: Analista (Ações de Excluir/Bloquear Bloqueadas)</option>
        </select>
        <span style={styles.simulacaoDesc}>
          {roleSimulado === 'Super Admin' 
            ? '✓ Botões de Lixeira e Cadeado estão ativados.' 
            : '🔒 Ações de excluir e bloquear estão desativadas para seu papel.'}
        </span>
      </div>

      {/* Top Header Bar */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Gestão de Profissionais</h2>
          <p style={styles.pageSubtitle}>Administre os profissionais cadastrados, atribua papéis e defina a cota de relatórios contratados.</p>
        </div>
        <button onClick={() => setModalAberto(true)} style={styles.btnNovo}>
          + Novo Profissional
        </button>
      </div>

      {/* Actions Bar */}
      <div style={styles.searchBar}>
        <input 
          style={styles.inputBusca} 
          placeholder="Buscar profissional por nome, e-mail..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {/* Affiliates Table Card */}
      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>Profissionais Afiliados Cadastrados</h3>
        
        {afiliadosFiltrados.length === 0 ? (
          <div style={styles.vazio}>Nenhum profissional encontrado.</div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Nome do Profissional</th>
                  <th style={styles.th}>E-mail</th>
                  <th style={styles.th}>Papel</th>
                  <th style={styles.th}>Relatórios Restantes</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th} style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {afiliadosFiltrados.map(a => {
                  const isBloqueado = a.status === 'Bloqueado'
                  
                  return (
                    <tr key={a.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.profName}>{a.nome}</span>
                      </td>
                      <td style={styles.td}>{a.email}</td>
                      <td style={styles.td}>
                        <span style={{ 
                          ...styles.papelBadge,
                          background: a.papel === 'Super Admin' ? '#FFF3E0' : '#E8F5E9',
                          color: a.papel === 'Super Admin' ? '#E65100' : '#2E7D32'
                        }}>
                          {a.papel}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 'bold', color: '#0D1B3E' }}>
                          {a.relatorios}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: isBloqueado ? '#FFEBEE' : '#E8F5E9',
                          color: isBloqueado ? '#C62828' : '#2E7D32'
                        }}>
                          {a.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.acoesContainer}>
                          {/* Eye button (details & balance adjustment) */}
                          <button 
                            onClick={() => {
                              setSelecionado(a)
                              setDetalhesAberto(true)
                            }}
                            style={styles.btnAcao}
                            title="Ver detalhes e ajustar relatórios"
                          >
                            👁️
                          </button>
                          
                          {/* Padlock button (block/unblock) - guarded */}
                          <button 
                            onClick={() => handleBloquearAfiliado(a.id, a.nome, a.status)}
                            style={{
                              ...styles.btnAcao,
                              opacity: userRole === 'Super Admin' ? 1 : 0.4,
                              cursor: userRole === 'Super Admin' ? 'pointer' : 'not-allowed',
                              color: isBloqueado ? '#E65100' : '#2E7D32',
                              borderColor: isBloqueado ? '#FFE082' : '#C8E6C9',
                              background: isBloqueado ? '#FFF8E1' : '#E8F5E9'
                            }}
                            title={isBloqueado ? "Desbloquear Profissional" : "Bloquear Profissional"}
                          >
                            {isBloqueado ? '🔒' : '🔓'}
                          </button>
                          
                          {/* Trash button (delete) - guarded */}
                          <button 
                            onClick={() => handleDeletarAfiliado(a.id, a.nome)}
                            style={{
                              ...styles.btnAcao,
                              opacity: userRole === 'Super Admin' ? 1 : 0.4,
                              cursor: userRole === 'Super Admin' ? 'pointer' : 'not-allowed'
                            }}
                            title="Remover Profissional"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Cadastrar Profissional */}
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Cadastrar Profissional</h3>
              <button onClick={() => setModalAberto(false)} style={styles.modalFecharBtn}>✕</button>
            </div>
            <form onSubmit={handleAddAfiliado} style={styles.modalForm}>
              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Nome Completo *</label>
                <input 
                  style={styles.modalInput} 
                  value={nome} 
                  onChange={e => setNome(e.target.value)} 
                  placeholder="Nome do profissional" 
                  required 
                />
              </div>

              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>E-mail *</label>
                <input 
                  style={styles.modalInput} 
                  type="email"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="profissional@perfil4d.com" 
                  required 
                />
              </div>

              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>WhatsApp *</label>
                <input 
                  style={styles.modalInput} 
                  value={whatsapp} 
                  onChange={e => setWhatsapp(e.target.value)} 
                  placeholder="Ex: 5521974013287" 
                  required 
                />
              </div>

              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Senha *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    style={{ ...styles.modalInput, paddingRight: '45px' }} 
                    type={senhaVisivel ? "text" : "password"}
                    value={senha} 
                    onChange={e => setSenha(e.target.value)} 
                    placeholder="Defina a senha" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setSenhaVisivel(!senhaVisivel)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {senhaVisivel ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Papel / Acesso</label>
                <select 
                  style={styles.modalSelect} 
                  value={papel} 
                  onChange={e => setPapel(e.target.value)}
                >
                  <option value="Afiliado">Afiliado</option>
                  <option value="Analista">Analista</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              {papel === 'Analista' && (
                <div style={styles.modalGrupo}>
                  <label style={styles.modalLabel}>Relatórios Iniciais</label>
                  <input 
                    style={styles.modalInput} 
                    type="number"
                    value={relatoriosIniciais} 
                    onChange={e => setRelatoriosIniciais(e.target.value)} 
                    min="0"
                  />
                </div>
              )}

              <button type="submit" style={styles.btnModalSalvar}>
                Cadastrar Profissional
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Profissional (Olho Modal) */}
      {detalhesAberto && selecionado && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '580px' }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Detalhes do Profissional</h3>
              <button onClick={() => setDetalhesAberto(false)} style={styles.modalFecharBtn}>✕</button>
            </div>
            
            <div style={styles.detalhesLayout}>
              <div style={styles.detalhesRow}>
                <span style={styles.detalhesLabel}>Nome:</span>
                <span style={styles.detalhesVal}>{selecionado.nome}</span>
              </div>
              <div style={styles.detalhesRow}>
                <span style={styles.detalhesLabel}>E-mail:</span>
                <span style={styles.detalhesVal}>{selecionado.email}</span>
              </div>
              <div style={styles.detalhesRow}>
                <span style={styles.detalhesLabel}>WhatsApp:</span>
                <span style={styles.detalhesVal}>{selecionado.whatsapp}</span>
              </div>
              <div style={styles.detalhesRow}>
                <span style={styles.detalhesLabel}>Senha de Acesso:</span>
                <span style={{ ...styles.detalhesVal, fontWeight: 'bold', color: '#C62828' }}>
                  {selecionado.senha || '(Sem senha salva)'}
                </span>
              </div>
              <div style={styles.detalhesRow}>
                <span style={styles.detalhesLabel}>Papel:</span>
                <span style={styles.detalhesVal}>{selecionado.papel}</span>
              </div>
              <div style={styles.detalhesRow}>
                <span style={styles.detalhesLabel}>Relatórios Ativos:</span>
                <span style={{ ...styles.detalhesVal, fontWeight: 'bold', color: '#0D1B3E' }}>
                  {selecionado.relatorios}
                </span>
              </div>
            </div>

            <div style={styles.divider}></div>

            {/* Adjustments Form */}
            {selecionado.relatorios !== 'Ilimitados' ? (
              <form onSubmit={handleAplicarAjuste} style={styles.ajusteForm}>
                <h4 style={styles.ajusteTitle}>Gerenciar Relatórios do Afiliado</h4>
                
                <div style={styles.ajusteCamposRow}>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={styles.modalLabel}>Quantidade</label>
                    <input 
                      style={styles.modalInput} 
                      type="number"
                      value={ajusteQtd}
                      onChange={e => setAjusteQtd(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <label style={styles.modalLabel}>Operação</label>
                    <select 
                      style={styles.modalSelect}
                      value={ajusteAcao}
                      onChange={e => setAjusteAcao(e.target.value)}
                    >
                      <option value="Adicionar">Adicionar Relatórios</option>
                      <option value="Remover">Remover Relatórios</option>
                    </select>
                  </div>
                </div>

                <div style={styles.modalGrupo}>
                  <label style={styles.modalLabel}>Motivo do Ajuste</label>
                  <input 
                    style={styles.modalInput}
                    value={ajusteMotivo}
                    onChange={e => setAjusteMotivo(e.target.value)}
                    placeholder="Ex: Compra de novo pacote"
                    required
                  />
                </div>

                <button type="submit" style={styles.btnAjustar}>
                  Salvar Ajuste de Relatórios
                </button>
              </form>
            ) : (
              <div style={styles.ilimitadosAviso}>
                Este profissional possui acesso a relatórios <strong>ilimitados</strong> na plataforma por ser dono do sistema.
              </div>
            )}

            <div style={styles.divider}></div>

            {/* Adjustment History List */}
            <h4 style={styles.ajusteTitle}>Histórico de Movimentações</h4>
            {selecionado.historico.length === 0 ? (
              <p style={styles.vazioHist}>Nenhuma movimentação registrada.</p>
            ) : (
              <div style={styles.historicoContainer}>
                <table style={styles.tableHist}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.thHist}>Data</th>
                      <th style={styles.thHist}>Movimentação</th>
                      <th style={styles.thHist}>Quantidade</th>
                      <th style={styles.thHist}>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selecionado.historico.map((h, i) => (
                      <tr key={i} style={styles.trHist}>
                        <td style={styles.tdHist}>{h.data}</td>
                        <td style={styles.tdHist}>
                          <span style={{ 
                            fontWeight: 'bold', 
                            color: h.acao === 'Adição' ? '#2E7D32' : '#C62828' 
                          }}>
                            {h.acao}
                          </span>
                        </td>
                        <td style={styles.tdHist}>{h.qtd}</td>
                        <td style={styles.tdHist}>{h.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

const styles = {
  container: {
    padding: '40px',
    background: '#F8F9FA',
    minHeight: '100vh',
    fontFamily: '"Outfit", "Inter", sans-serif',
  },
  simulacaoBar: {
    background: '#FFF8E1',
    border: '1px solid #FFE082',
    borderRadius: '10px',
    padding: '12px 20px',
    marginBottom: '28px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  simulacaoSelect: {
    padding: '6px 12px',
    border: '1px solid #C9A84C',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    background: '#fff',
    color: '#0D1B3E',
    cursor: 'pointer',
    outline: 'none',
  },
  simulacaoDesc: {
    fontSize: '12.5px',
    color: '#D84315',
    fontWeight: '500',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '36px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '28px',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    fontWeight: 'normal',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '13.5px',
    color: '#666',
    margin: '4px 0 0 0',
  },
  btnNovo: {
    padding: '12px 24px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(13,27,62,0.15)',
    transition: 'all 0.2s',
  },
  searchBar: {
    marginBottom: '24px',
  },
  inputBusca: {
    width: '100%',
    maxWidth: '460px',
    padding: '12px 16px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#fff',
    outline: 'none',
  },
  tableCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
  },
  tableTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: '20px',
    fontFamily: 'Georgia, serif',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    borderBottom: '1.5px solid #F3F4F6',
  },
  th: {
    padding: '12px 16px',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #F3F4F6',
    transition: 'background 0.2s',
  },
  td: {
    padding: '16px',
    fontSize: '13.5px',
    color: '#4B5563',
  },
  profName: {
    fontWeight: 'bold',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    fontSize: '14.5px',
  },
  papelBadge: {
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'inline-block',
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'inline-block',
  },
  acoesContainer: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
  btnAcao: {
    padding: '6px 10px',
    background: '#FAF9F6',
    border: '1px solid #e0d8cc',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  vazio: {
    textAlign: 'center',
    padding: '40px',
    color: '#888',
  },

  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(13,27,62,0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalCard: {
    background: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '440px',
    padding: '28px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    border: '1px solid #e8e0d4',
    margin: '20px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #f0ebe3',
    paddingBottom: '14px',
  },
  modalTitle: {
    fontSize: '18px',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    fontWeight: 'normal',
  },
  modalFecharBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '18px',
    color: '#888',
    cursor: 'pointer',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalGrupo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  modalLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  modalInput: {
    padding: '12px 14px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: '#FAFAFA',
    width: '100%',
  },
  modalSelect: {
    padding: '12px 14px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: '#FAFAFA',
    cursor: 'pointer',
    width: '100%',
  },
  btnModalSalvar: {
    padding: '14px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(13,27,62,0.1)',
    marginTop: '10px',
  },

  // Detalhes modal specific
  detalhesLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  },
  detalhesRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    borderBottom: '1px dashed #f0ebe3',
    paddingBottom: '6px',
  },
  detalhesLabel: {
    color: '#666',
    fontWeight: '500',
  },
  detalhesVal: {
    color: '#0D1B3E',
    fontWeight: 'bold',
  },
  divider: {
    height: '1px',
    background: '#E5E7EB',
    margin: '20px 0',
  },
  ajusteForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  ajusteTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  ajusteCamposRow: {
    display: 'flex',
    gap: '12px',
  },
  btnAjustar: {
    padding: '12px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  ilimitadosAviso: {
    padding: '14px',
    background: '#E8F5E9',
    color: '#2E7D32',
    borderRadius: '8px',
    fontSize: '13.5px',
    lineHeight: '1.6',
    border: '1px solid #C8E6C9',
  },
  historicoContainer: {
    maxHeight: '160px',
    overflowY: 'auto',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
  },
  tableHist: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  thHist: {
    padding: '8px 12px',
    fontSize: '10px',
    color: '#6B7280',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    borderBottom: '1px solid #E5E7EB',
    background: '#F9FAFB',
    textAlign: 'left',
  },
  trHist: {
    borderBottom: '1px solid #F3F4F6',
  },
  tdHist: {
    padding: '8px 12px',
    fontSize: '12.5px',
    color: '#4B5563',
  },
  vazioHist: {
    fontSize: '13px',
    color: '#999',
    textAlign: 'center',
    margin: '10px 0',
  }
}
