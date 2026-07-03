'use client'
import { useState } from 'react'

export default function AdminPage() {
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  
  // Lista de Afiliados cadastrados
  const [afiliados, setAfiliados] = useState([
    { id: 1, nome: 'Dra. Heloísa Ribeiro', email: 'heloisa.ribeiro@perfil4d.com', nivel: 'Analista Master', status: 'Ativo' },
    { id: 2, nome: 'Dr. Marcos Vinícius', email: 'marcos.vinicius@perfil4d.com', nivel: 'Analista Pleno', status: 'Ativo' },
    { id: 3, nome: 'Dra. Ana Beatriz Costa', email: 'ana.beatriz@perfil4d.com', nivel: 'Supervisor', status: 'Ativo' }
  ])

  // Campos do formulário
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [nivel, setNivel] = useState('Analista Pleno')

  const handleAddAfiliado = (e) => {
    e.preventDefault()
    if (!nome || !email) return

    const novo = {
      id: Date.now(),
      nome,
      email,
      nivel,
      status: 'Ativo'
    }

    setAfiliados(prev => [novo, ...prev])
    setNome('')
    setEmail('')
    setNivel('Analista Pleno')
    setModalAberto(false)
    alert('Psicanalista afiliado cadastrado com sucesso!')
  }

  const handleDeletarAfiliado = (id) => {
    if (confirm('Deseja desativar ou excluir este psicanalista do sistema?')) {
      setAfiliados(prev => prev.filter(a => a.id !== id))
    }
  }

  const afiliadosFiltrados = afiliados.filter(a => {
    const termo = busca.toLowerCase()
    return a.nome.toLowerCase().includes(termo) || 
           a.email.toLowerCase().includes(termo) || 
           a.nivel.toLowerCase().includes(termo)
  })

  return (
    <div style={styles.container}>
      {/* Top Header Bar */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Administração Geral</h2>
          <p style={styles.pageSubtitle}>Gerencie os psicanalistas afiliados ao Perfil 4D e controle seus níveis de acesso.</p>
        </div>
        <button onClick={() => setModalAberto(true)} style={styles.btnNovo}>
          + Novo Afiliado
        </button>
      </div>

      {/* Actions Bar */}
      <div style={styles.searchBar}>
        <input 
          style={styles.inputBusca} 
          placeholder="Buscar afiliado por nome, e-mail ou cargo..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {/* Affiliates Table Card */}
      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>Psicanalistas Afiliados Cadastrados</h3>
        
        {afiliadosFiltrados.length === 0 ? (
          <div style={styles.vazio}>Nenhum psicanalista encontrado.</div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Nome do Profissional</th>
                  <th style={styles.th}>E-mail</th>
                  <th style={styles.th}>Nível de Acesso</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {afiliadosFiltrados.map(a => (
                  <tr key={a.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.profName}>{a.nome}</span>
                    </td>
                    <td style={styles.td}>{a.email}</td>
                    <td style={styles.td}>
                      <span style={styles.nivelLabel}>{a.nivel}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge}>
                        {a.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button 
                        onClick={() => handleDeletarAfiliado(a.id)} 
                        style={styles.btnExcluir}
                        title="Remover Afiliado"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Cadastrar Afiliado */}
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Cadastrar Psicanalista Afiliado</h3>
              <button onClick={() => setModalAberto(false)} style={styles.modalFecharBtn}>✕</button>
            </div>
            <form onSubmit={handleAddAfiliado} style={styles.modalForm}>
              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Nome Completo *</label>
                <input 
                  style={styles.modalInput} 
                  value={nome} 
                  onChange={e => setNome(e.target.value)} 
                  placeholder="Nome do analista" 
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
                  placeholder="analista@perfil4d.com" 
                  required 
                />
              </div>

              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Nível de Acesso</label>
                <select style={styles.modalSelect} value={nivel} onChange={e => setNivel(e.target.value)}>
                  <option value="Analista Pleno">Analista Pleno</option>
                  <option value="Analista Master">Analista Master</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <button type="submit" style={styles.btnModalSalvar}>
                Cadastrar e Enviar Convite
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
  nivelLabel: {
    fontSize: '12.5px',
    fontWeight: '500',
    color: '#0D1B3E',
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: '#E8F5E9',
    color: '#2E7D32',
    display: 'inline-block',
  },
  btnExcluir: {
    padding: '4px 10px',
    background: '#FEF2F2',
    color: '#EF4444',
    border: '1px solid #FEE2E2',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
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
