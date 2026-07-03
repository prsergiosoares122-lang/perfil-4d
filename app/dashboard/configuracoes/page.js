'use client'
import { useState } from 'react'

export default function ConfiguracoesPage() {
  const [abaAtiva, setAbaAtiva] = useState('perfil')
  const [loading, setLoading] = useState(false)
  const [avisoSucesso, setAvisoSucesso] = useState('')

  // Form Perfil
  const [nome, setNome] = useState('Sérgio Soares')
  const [funcao, setFuncao] = useState('Psicanalista')
  const [email, setEmail] = useState('sergio.soares@perfil4d.com')

  useState(() => {
    if (typeof window !== 'undefined') {
      const savedNome = localStorage.getItem('perfil4d_perfil_nome')
      const savedFuncao = localStorage.getItem('perfil4d_perfil_funcao')
      if (savedNome) setNome(savedNome)
      if (savedFuncao) setFuncao(savedFuncao)
    }
  })

  // Form Segurança
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  // Preferências
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifWhatsApp, setNotifWhatsApp] = useState(true)

  const dispararSucesso = (msg) => {
    setAvisoSucesso(msg)
    setTimeout(() => {
      setAvisoSucesso('')
    }, 4000)
  }

  const salvarPerfil = (e) => {
    e.preventDefault()
    setLoading(true)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('perfil4d_perfil_nome', nome)
      localStorage.setItem('perfil4d_perfil_funcao', funcao)
    }

    setTimeout(() => {
      setLoading(false)
      dispararSucesso('Dados do perfil atualizados com sucesso!')
    }, 1000)
  }

  const salvarSeguranca = (e) => {
    e.preventDefault()
    if (novaSenha !== confirmarSenha) {
      alert('A nova senha e a confirmação não conferem.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
      dispararSucesso('Sua senha de acesso foi alterada com sucesso!')
    }, 1200)
  }

  const salvarPreferencias = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      dispararSucesso('Preferências de notificação salvas com sucesso!')
    }, 800)
  }

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Configurações</h2>
          <p style={styles.pageSubtitle}>Gerencie suas credenciais de acesso, dados do perfil e preferências de alertas.</p>
        </div>
      </div>

      {/* Success Feedback Alert */}
      {avisoSucesso && (
        <div style={styles.alertSucesso}>
          <span style={{ marginRight: '8px' }}>✓</span> {avisoSucesso}
        </div>
      )}

      {/* Horizontal Tabs Selection */}
      <div style={styles.tabsContainer}>
        <button 
          onClick={() => setAbaAtiva('perfil')} 
          style={{ ...styles.tabBtn, ...(abaAtiva === 'perfil' ? styles.tabBtnAtivo : {}) }}
        >
          Dados do Perfil
        </button>
        <button 
          onClick={() => setAbaAtiva('seguranca')} 
          style={{ ...styles.tabBtn, ...(abaAtiva === 'seguranca' ? styles.tabBtnAtivo : {}) }}
        >
          Segurança e Senha
        </button>
        <button 
          onClick={() => setAbaAtiva('notificacoes')} 
          style={{ ...styles.tabBtn, ...(abaAtiva === 'notificacoes' ? styles.tabBtnAtivo : {}) }}
        >
          Preferências de Notificação
        </button>
      </div>

      {/* Main Configurations Card */}
      <div style={styles.configCard}>
        
        {/* TAB 1: Dados do Perfil */}
        {abaAtiva === 'perfil' && (
          <form onSubmit={salvarPerfil} style={styles.form}>
            <div style={styles.avatarSection}>
              <div style={styles.avatarPlaceholder}>SS</div>
              <div>
                <h4 style={styles.avatarTitle}>Foto de Perfil</h4>
                <p style={styles.avatarDesc}>Recomendado: imagem quadrada de pelo menos 200x200px.</p>
                <button type="button" onClick={() => alert('Seletor de imagem simulado.')} style={styles.btnUpload}>
                  Alterar Imagem
                </button>
              </div>
            </div>

            <div style={styles.divider}></div>

            <div style={styles.formRow}>
              <div style={styles.formCol}>
                <label style={styles.label}>Nome Completo</label>
                <input 
                  style={styles.input} 
                  value={nome} 
                  onChange={e => setNome(e.target.value)} 
                  required 
                />
              </div>
              <div style={styles.formCol}>
                <label style={styles.label}>Função Profissional</label>
                <select 
                  style={styles.select} 
                  value={funcao} 
                  onChange={e => setFuncao(e.target.value)}
                  required 
                >
                  <option value="Analista">Analista</option>
                  <option value="Psicanalista">Psicanalista</option>
                  <option value="Psicólogo">Psicólogo</option>
                  <option value="Terapeuta">Terapeuta</option>
                  <option value="Terapeuta Familiar">Terapeuta Familiar</option>
                </select>
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formCol}>
                <label style={styles.label}>E-mail de Contato</label>
                <input 
                  style={styles.input} 
                  type="email"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div style={styles.formCol}></div>
            </div>

            <button type="submit" disabled={loading} style={styles.btnSalvar}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        )}

        {/* TAB 2: Segurança e Senha */}
        {abaAtiva === 'seguranca' && (
          <form onSubmit={salvarSeguranca} style={styles.form}>
            <h3 style={styles.sectionTitle}>Alterar Senha de Acesso</h3>
            <p style={styles.sectionDesc}>Garanta que sua senha tenha pelo menos 8 caracteres contendo letras e números.</p>

            <div style={styles.formColMax}>
              <label style={styles.label}>Senha Atual</label>
              <input 
                style={styles.input} 
                type="password" 
                value={senhaAtual}
                onChange={e => setSenhaAtual(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formCol}>
                <label style={styles.label}>Nova Senha</label>
                <input 
                  style={styles.input} 
                  type="password" 
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div style={styles.formCol}>
                <label style={styles.label}>Confirmar Nova Senha</label>
                <input 
                  style={styles.input} 
                  type="password" 
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.btnSalvar}>
              {loading ? 'Alterando...' : 'Atualizar Senha'}
            </button>
          </form>
        )}

        {/* TAB 3: Preferências de Notificação */}
        {abaAtiva === 'notificacoes' && (
          <form onSubmit={salvarPreferencias} style={styles.form}>
            <h3 style={styles.sectionTitle}>Preferências de Alertas</h3>
            <p style={styles.sectionDesc}>Escolha como deseja ser avisado sobre o progresso e finalizações dos questionários.</p>

            <div style={styles.toggleRow}>
              <div>
                <h4 style={styles.toggleTitle}>Notificação por E-mail</h4>
                <p style={styles.toggleDesc}>Receber alertas por e-mail quando um cônjuge terminar de preencher as perguntas.</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifEmail} 
                onChange={e => setNotifEmail(e.target.checked)} 
                style={styles.checkbox}
              />
            </div>

            <div style={styles.toggleRow}>
              <div>
                <h4 style={styles.toggleTitle}>Notificação por WhatsApp</h4>
                <p style={styles.toggleDesc}>Receber alertas automáticos de devolução diretamente no seu número cadastrado.</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifWhatsApp} 
                onChange={e => setNotifWhatsApp(e.target.checked)} 
                style={styles.checkbox}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.btnSalvar}>
              {loading ? 'Salvando...' : 'Salvar Preferências'}
            </button>
          </form>
        )}

      </div>
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
    marginBottom: '36px',
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
  alertSucesso: {
    background: '#E8F5E9',
    border: '1px solid #C8E6C9',
    color: '#2E7D32',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '24px',
    animation: 'fadeIn 0.3s ease',
  },
  tabsContainer: {
    display: 'flex',
    gap: '16px',
    borderBottom: '1px solid #E5E7EB',
    marginBottom: '32px',
    paddingBottom: '12px',
  },
  tabBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '14px',
    color: '#6B7280',
    cursor: 'pointer',
    fontWeight: '500',
    borderBottom: '2px solid transparent',
    padding: '8px 12px',
    transition: 'all 0.2s',
  },
  tabBtnAtivo: {
    color: '#0D1B3E',
    fontWeight: 'bold',
    borderBottom: '2px solid #C9A84C',
  },
  configCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '36px',
    maxWidth: '720px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  avatarSection: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#0D1B3E',
    color: '#C9A84C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: 'bold',
    fontFamily: 'Georgia, serif',
  },
  avatarTitle: {
    fontSize: '15px',
    color: '#0D1B3E',
    margin: '0 0 4px 0',
  },
  avatarDesc: {
    fontSize: '12px',
    color: '#6B7280',
    margin: '0 0 10px 0',
  },
  btnUpload: {
    padding: '6px 14px',
    background: '#fff',
    border: '1px solid #e0d8cc',
    borderRadius: '6px',
    color: '#0D1B3E',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  divider: {
    height: '1px',
    background: '#F3F4F6',
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  formCol: {
    flex: 1,
    minWidth: '240px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formColMax: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxWidth: '320px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: '#FAFAFA',
  },
  select: {
    padding: '12px 16px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: '#FAFAFA',
    cursor: 'pointer',
  },
  btnSalvar: {
    padding: '14px 28px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    boxShadow: '0 4px 12px rgba(13,27,62,0.1)',
    marginTop: '10px',
  },
  sectionTitle: {
    fontSize: '16px',
    color: '#0D1B3E',
    margin: '0 0 4px 0',
    fontFamily: 'Georgia, serif',
  },
  sectionDesc: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0,
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#F9FAFB',
    padding: '18px 24px',
    borderRadius: '10px',
    border: '1px solid #E5E7EB',
  },
  toggleTitle: {
    fontSize: '14px',
    color: '#0D1B3E',
    margin: '0 0 4px 0',
  },
  toggleDesc: {
    fontSize: '12px',
    color: '#6B7280',
    margin: 0,
    maxWidth: '480px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  }
}
