'use client'
import { useState } from 'react'

const STATUS_LEAD = {
  novo: { texto: 'Novo', cor: '#1565C0', bg: '#E3F2FD' },
  contato: { texto: 'Em Contato', cor: '#E65100', bg: '#FFF8E1' },
  convertido: { texto: 'Convertido', cor: '#2E7D32', bg: '#E8F5E9' }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([
    { id: 1, nome: 'Carlos Eduardo', email: 'carlos@email.com', origem: 'WhatsApp', data: '03/07/2026', status: 'contato' },
    { id: 2, nome: 'Fernanda Lima', email: 'fernanda@email.com', origem: 'Instagram', data: '02/07/2026', status: 'novo' },
    { id: 3, nome: 'Juliana Ramos', email: 'juliana@email.com', origem: 'Indicação', data: '28/06/2026', status: 'convertido' }
  ])
  
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [modalAberto, setModalAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [origem, setOrigem] = useState('WhatsApp')
  const [status, setStatus] = useState('novo')

  const handleAddLead = (e) => {
    e.preventDefault()
    if (!nome) return
    const dataAtual = new Date().toLocaleDateString('pt-BR')
    setLeads(prev => [
      { id: Date.now(), nome, email: email || 'Sem e-mail', origem, data: dataAtual, status },
      ...prev
    ])
    setNome('')
    setEmail('')
    setOrigem('WhatsApp')
    setStatus('novo')
    setModalAberto(false)
  }

  const leadsFiltrados = leads.filter(lead => {
    const matchBusca = lead.nome.toLowerCase().includes(busca.toLowerCase()) || 
                       lead.email.toLowerCase().includes(busca.toLowerCase())
    const matchFiltro = filtro === 'todos' || lead.status === filtro
    return matchBusca && matchFiltro
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

      {/* Actions and Filters Bar */}
      <div style={styles.actionsBar}>
        <input 
          style={styles.busca} 
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <select 
          style={styles.select} 
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        >
          <option value="todos">Todos os status</option>
          <option value="novo">Novos</option>
          <option value="contato">Em Contato</option>
          <option value="convertido">Convertidos</option>
        </select>
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
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leadsFiltrados.map(lead => {
                  const s = STATUS_LEAD[lead.status] || STATUS_LEAD.novo
                  return (
                    <tr key={lead.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.leadName}>{lead.nome}</span>
                      </td>
                      <td style={styles.td}>{lead.email}</td>
                      <td style={styles.td}>{lead.origem}</td>
                      <td style={styles.td}>{lead.data}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: s.bg,
                          color: s.cor
                        }}>
                          {s.texto}
                        </span>
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
                <label style={styles.modalLabel}>Origem da Lead</label>
                <select style={styles.modalSelect} value={origem} onChange={e => setOrigem(e.target.value)}>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Indicação">Indicação</option>
                  <option value="Site/Landing Page">Site / Landing Page</option>
                </select>
              </div>

              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Status Inicial</label>
                <select style={styles.modalSelect} value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="novo">Novo</option>
                  <option value="contato">Em Contato</option>
                  <option value="convertido">Convertido</option>
                </select>
              </div>

              <button type="submit" style={styles.btnModalSalvar}>
                Salvar Lead
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
}
