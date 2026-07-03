'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState([])
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaCadastroVisivel, setSenhaCadastroVisivel] = useState(false)
  const [senhaRevelada, setSenhaRevelada] = useState({})
  const [origem, setOrigem] = useState('WhatsApp')

  // Detalhamento e Alteração de Senha
  const [detalhesLeadAberto, setDetalhesLeadAberto] = useState(false)
  const [leadSelecionado, setLeadSelecionado] = useState(null)
  const [modalAlterarSenhaAberto, setModalAlterarSenhaAberto] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [novaSenhaVisivel, setNovaSenhaVisivel] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('perfil4d_leads')
    if (saved) {
      setLeads(JSON.parse(saved))
    } else {
      const defaultLeads = [
        { id: 1, nome: 'Carlos Eduardo', email: 'carlos@email.com', origem: 'WhatsApp', data: '03/07/2026', whatsapp: '5521974013287', senha: 'senha_carlos' },
        { id: 2, nome: 'Fernanda Lima', email: 'fernanda@email.com', origem: 'Instagram', data: '02/07/2026', whatsapp: '5511999999999', senha: 'senha_fernanda' },
        { id: 3, nome: 'Juliana Ramos', email: 'juliana@email.com', origem: 'Indicação', data: '28/06/2026', whatsapp: '5531988888888', senha: 'senha_juliana' }
      ]
      setLeads(defaultLeads)
      localStorage.setItem('perfil4d_leads', JSON.stringify(defaultLeads))
    }
  }, [])

  const handleAddLead = (e) => {
    e.preventDefault()
    if (!nome) return
    const dataAtual = new Date().toLocaleDateString('pt-BR')
    const novoLead = {
      id: Date.now(),
      nome,
      email: email || 'Sem e-mail',
      whatsapp: whatsapp || 'Sem WhatsApp',
      senha: senha || '123456',
      origem,
      data: dataAtual
    }
    const updated = [novoLead, ...leads]
    setLeads(updated)
    localStorage.setItem('perfil4d_leads', JSON.stringify(updated))
    
    setNome('')
    setEmail('')
    setWhatsapp('')
    setSenha('')
    setOrigem('WhatsApp')
    setModalAberto(false)
  }

  const handleDeletarLead = (id, nomeLead) => {
    if (confirm(`Deseja realmente excluir o lead "${nomeLead}"?`)) {
      const updated = leads.filter(l => l.id !== id)
      setLeads(updated)
      localStorage.setItem('perfil4d_leads', JSON.stringify(updated))
    }
  }

  const handleAlterarSenha = (e) => {
    e.preventDefault()
    if (!novaSenha) return
    
    const updated = leads.map(l => {
      if (l.id === leadSelecionado.id) {
        const updatedLead = { ...l, senha: novaSenha }
        setLeadSelecionado(updatedLead)
        return updatedLead
      }
      return l
    })
    setLeads(updated)
    localStorage.setItem('perfil4d_leads', JSON.stringify(updated))
    
    setNovaSenha('')
    setModalAlterarSenhaAberto(false)
    alert('Senha alterada com sucesso!')
  }

  const leadsFiltrados = leads.filter(lead => {
    const matchBusca = lead.nome.toLowerCase().includes(busca.toLowerCase()) || 
                       lead.email.toLowerCase().includes(busca.toLowerCase()) ||
                       (lead.whatsapp && lead.whatsapp.toLowerCase().includes(busca.toLowerCase()))
    return matchBusca
  })

  return (
    <div style={styles.container}>
      {/* Top Header Bar */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Captação de Leads</h2>
          <p style={styles.pageSubtitle}>Gerencie potenciais clientes e contatos recebidos para avaliações do Perfil 4D.</p>
        </div>
        <button onClick={() => setModalAberto(true)} style={styles.btnNovo}>
          + Nova Lead
        </button>
      </div>

      {/* Actions Bar */}
      <div style={styles.actionsBar}>
        <input 
          style={styles.busca} 
          placeholder="Buscar por nome, e-mail ou WhatsApp..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {/* Leads Table Card */}
      <div style={styles.tableCard}>
        {leadsFiltrados.length === 0 ? (
          <div style={styles.vazio}>Nenhum lead encontrado com os filtros atuais.</div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Nome do Lead</th>
                  <th style={styles.th}>E-mail</th>
                  <th style={styles.th}>Origem</th>
                  <th style={styles.th}>Data de Entrada</th>
                  <th style={styles.th}>WhatsApp</th>
                  <th style={styles.th}>Senha</th>
                  <th style={styles.th} style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {leadsFiltrados.map(lead => {
                  const isSenhaRevelada = !!senhaRevelada[lead.id]
                  return (
                    <tr key={lead.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span 
                          onClick={() => {
                            setLeadSelecionado(lead)
                            setDetalhesLeadAberto(true)
                          }}
                          style={{
                            ...styles.leadName,
                            cursor: 'pointer',
                            color: '#1565C0',
                            textDecoration: 'underline'
                          }}
                        >
                          {lead.nome}
                        </span>
                      </td>
                      <td style={styles.td}>{lead.email}</td>
                      <td style={styles.td}>{lead.origem}</td>
                      <td style={styles.td}>{lead.data}</td>
                      <td style={styles.td}>{lead.whatsapp}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: isSenhaRevelada ? 'inherit' : 'monospace' }}>
                            {isSenhaRevelada ? lead.senha : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSenhaRevelada(prev => ({ ...prev, [lead.id]: !prev[lead.id] }))
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {isSenhaRevelada ? '👁️' : '🙈'}
                          </button>
                        </div>
                      </td>
                      <td style={styles.td} style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeletarLead(lead.id, lead.nome)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#C62828'
                          }}
                          title="Excluir Lead"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Cadastrar Nova Lead</h3>
              <button onClick={() => setModalAberto(false)} style={styles.modalFecharBtn}>✕</button>
            </div>
            <form onSubmit={handleAddLead} style={styles.modalForm}>
              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Nome do Lead *</label>
                <input 
                  style={styles.modalInput} 
                  value={nome} 
                  onChange={e => setNome(e.target.value)} 
                  placeholder="Nome do contato" 
                  required 
                />
              </div>

              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>E-mail</label>
                <input 
                  style={styles.modalInput} 
                  type="email"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="email@contato.com" 
                />
              </div>

              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Número do WhatsApp *</label>
                <input 
                  style={styles.modalInput} 
                  value={whatsapp} 
                  onChange={e => setWhatsapp(e.target.value)} 
                  placeholder="Ex: 5521974013287" 
                  required
                />
              </div>

              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Definir Senha *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    style={{ ...styles.modalInput, paddingRight: '45px' }} 
                    type={senhaCadastroVisivel ? "text" : "password"}
                    value={senha} 
                    onChange={e => setSenha(e.target.value)} 
                    placeholder="Defina a senha do lead" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setSenhaCadastroVisivel(!senhaCadastroVisivel)}
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
                    {senhaCadastroVisivel ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Origem da Lead</label>
                <select style={styles.modalSelect} value={origem} onChange={e => setOrigem(e.target.value)}>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Indicação">Indicação</option>
                  <option value="Site/Landing Page">Site / Landing Page</option>
                </select>
              </div>

              <button type="submit" style={styles.btnModalSalvar}>
                Salvar Lead
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Lead */}
      {detalhesLeadAberto && leadSelecionado && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '540px' }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Detalhamento do Lead</h3>
              <button onClick={() => setDetalhesLeadAberto(false)} style={styles.modalFecharBtn}>✕</button>
            </div>
            
            <div style={styles.detalhesLayout}>
              <div style={styles.detalhesRow}>
                <span style={styles.detalhesLabel}>Nome do Lead:</span>
                <span style={styles.detalhesVal}>{leadSelecionado.nome}</span>
              </div>
              <div style={styles.detalhesRow}>
                <span style={styles.detalhesLabel}>E-mail:</span>
                <span style={styles.detalhesVal}>{leadSelecionado.email}</span>
              </div>
              <div style={styles.detalhesRow}>
                <span style={styles.detalhesLabel}>WhatsApp:</span>
                <span style={styles.detalhesVal}>{leadSelecionado.whatsapp}</span>
              </div>
              <div style={styles.detalhesRow}>
                <span style={styles.detalhesLabel}>Origem da Lead:</span>
                <span style={styles.detalhesVal}>{leadSelecionado.origem}</span>
              </div>
              <div style={styles.detalhesRow}>
                <span style={styles.detalhesLabel}>Data de Entrada:</span>
                <span style={styles.detalhesVal}>{leadSelecionado.data}</span>
              </div>
              <div style={styles.detalhesRow}>
                <span style={styles.detalhesLabel}>Senha Atual:</span>
                <span style={{ ...styles.detalhesVal, fontWeight: 'bold', color: '#C62828' }}>
                  {leadSelecionado.senha}
                </span>
              </div>
            </div>

            <div style={styles.divider}></div>

            {/* CONFIGURAÇÕES DE ACESSO */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={styles.secaoTitle}>CONFIGURAÇÕES DE ACESSO</h4>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                Gerencie as credenciais e altere a senha de acesso deste lead.
              </p>
              <button 
                onClick={() => setModalAlterarSenhaAberto(true)} 
                style={styles.btnAlterarSenha}
              >
                🔒 ALTERAR SENHA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Alterar Senha do Lead */}
      {modalAlterarSenhaAberto && leadSelecionado && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '400px', zIndex: 10000 }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Alterar Senha do Lead</h3>
              <button onClick={() => setModalAlterarSenhaAberto(false)} style={styles.modalFecharBtn}>✕</button>
            </div>
            <form onSubmit={handleAlterarSenha} style={styles.modalForm}>
              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Nova Senha *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    style={{ ...styles.modalInput, paddingRight: '45px' }} 
                    type={novaSenhaVisivel ? "text" : "password"}
                    value={novaSenha} 
                    onChange={e => setNovaSenha(e.target.value)} 
                    placeholder="Defina a nova senha" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setNovaSenhaVisivel(!novaSenhaVisivel)}
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
                    {novaSenhaVisivel ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <button type="submit" style={styles.btnModalSalvar}>
                Salvar Nova Senha
              </button>
            </form>
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
  actionsBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  busca: {
    flex: 1,
    minWidth: '220px',
    padding: '12px 16px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#fff',
    outline: 'none',
  },
  select: {
    padding: '12px 16px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#fff',
    outline: 'none',
    cursor: 'pointer',
    color: '#333',
  },
  tableCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
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
  leadName: {
    fontWeight: 'bold',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
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
  },
  modalSelect: {
    padding: '12px 14px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: '#FAFAFA',
    cursor: 'pointer',
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
  detalhesLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
  },
  detalhesRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '8px',
    borderBottom: '1px dashed #eee',
  },
  detalhesLabel: {
    fontWeight: 'bold',
    color: '#666',
    fontSize: '13.5px',
  },
  detalhesVal: {
    color: '#0D1B3E',
    fontSize: '13.5px',
  },
  divider: {
    height: '1px',
    background: '#E5E7EB',
    margin: '24px 0 16px',
  },
  secaoTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  btnAlterarSenha: {
    padding: '10px 16px',
    background: '#C62828',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '12.5px',
    cursor: 'pointer',
    letterSpacing: '0.5px',
  }
}
