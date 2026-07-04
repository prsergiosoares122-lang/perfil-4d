'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export default function AfiliadosPage() {
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
  const [papel, setPapel] = useState('Analista')
  const [relatoriosIniciais, setRelatoriosIniciais] = useState('10')

  // Campos de Ajuste de Relatórios (Modal)
  const [ajusteQtd, setAjusteQtd] = useState('5')
  const [ajusteAcao, setAjusteAcao] = useState('Adicionar')
  const [ajusteMotivo, setAjusteMotivo] = useState('')

  // Campos de Edição de Senha (Modal)
  const [editSenhaAberto, setEditSenhaAberto] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [novaSenhaVisivel, setNovaSenhaVisivel] = useState(false)

  const [mostrarAlterarSenha, setMostrarAlterarSenha] = useState(false)
  const [novaSenhaDetalhes, setNovaSenhaDetalhes] = useState('')

  useEffect(() => {
    verificarAuth()
    carregarProfissionais()
  }, [])

  async function verificarAuth() {
    if (typeof window !== 'undefined' && (window.location.hash || window.location.search.includes('code='))) {
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    
    let email = ''
    let userPlano = ''
    
    const { data: { session } } = await supabase.auth.getSession()
    if (session && session.user) {
      email = session.user.email.toLowerCase()
    } else {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('perfil4d_logged_user')
        if (savedUser) {
          const user = JSON.parse(savedUser)
          email = user.email.toLowerCase()
          userPlano = user.plano
        }
      }
    }

    if (!email) {
      router.push('/login')
      return
    }
    
    if (!userPlano) {
      // Obter dados do usuário para verificar plano
      const { data: userData } = await supabase
          .from('casais')
          .select('plano')
          .eq('nome_esposa', email)
          .single()
      
      userPlano = userData?.plano || ''
    }
    
    const isSuperAdmin = email === 'prsergiosoares122@gmail.com' ||
                         email === 'thiago.medeiros@perfil4d.com' ||
                         email === 'sergio.soares@perfil4d.com' ||
                         email === 'sergio@email.com' ||
                         email === 'pr_sergiosoares@hotmail.com' ||
                         email.includes('admin') ||
                         userPlano.startsWith('super_admin')

    if (!isSuperAdmin) {
      alert('Acesso Negado: Esta área é restrita a administradores.')
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

      if (error) throw error

      // Filtrar apenas registros correspondentes a profissionais
      const mapeados = (data || [])
        .filter(item => {
          const p = item.plano || ''
          return p.startsWith('afiliado') || p.startsWith('analista') || p.startsWith('terapeuta') || p.startsWith('psicanalista') || p.startsWith('super_admin')
        })
        .map(item => {
          const planoRaw = item.plano || ''
          const partes = planoRaw.split(':')
          const basePapel = partes[0]
          
          let pName = 'Analista'
          let relatorios = 0
          let senhaSalva = ''
          
          if (basePapel === 'super_admin') {
            pName = 'Super Admin'
            relatorios = 'Ilimitados'
            senhaSalva = partes[2] || ''
          } else {
            pName = basePapel === 'analista' ? 'Analista' : basePapel === 'terapeuta' ? 'Terapeuta de Casal' : basePapel === 'psicanalista' ? 'Psicanalista' : 'Afiliado'
            relatorios = partes[1] ? parseInt(partes[1]) || 0 : 0
            senhaSalva = partes[3] || ''
          }

          return {
            id: item.id,
            nome: item.nome_esposo,
            email: item.nome_esposa, // Email is stored in nome_esposa
            whatsapp: '',
            senha: senhaSalva,
            papel: pName,
            relatorios: relatorios,
            status: item.status === 'Inativo' || item.status === 'Bloqueado' ? 'Inativo' : 'Ativo',
            planoOriginal: planoRaw,
            historico: [] // Histórico simples local por conta da estrutura
          }
        })
      setAfiliados(mapeados)
    } catch (err) {
      console.error('Erro ao carregar profissionais:', err)
    }
  }

  const handleAddAfiliado = async (e) => {
    e.preventDefault()
    if (!nome || !email || !senha) return

    async function gerarHashSenha(s) {
      if (!s) return ''
      try {
        const encoder = new TextEncoder()
        const data = encoder.encode(s)
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      } catch (err) {
        console.error('Error generating hash:', err)
        return s
      }
    }

    try {
      const bcrypt = require('bcryptjs')
      const salt = bcrypt.genSaltSync(10)
      const bcryptHash = bcrypt.hashSync(senha, salt)

      const formattedEmail = email.trim().toLowerCase()
      const senhaHash = await gerarHashSenha(senha) // SHA-256 string for Auth

      // 1. Criar credenciais no Supabase Auth usando cliente temporário
      const tempSupabase = createClient(
        'https://aojqrexjcnwjmfdcfgfy.supabase.co',
        'sb_publishable_wCD4iCoimK9O_Js-975OdA_zwii0paQ',
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
          }
        }
      )

      try {
        const { error: signUpError } = await tempSupabase.auth.signUp({
          email: formattedEmail,
          password: senhaHash,
        })
        if (signUpError) {
          console.log('Supabase Auth signUp returned error (proceeding anyway):', signUpError.message)
        }
      } catch (authErr) {
        console.log('Auth signUp failed (proceeding to insert into database):', authErr.message)
      }

      // 2. Inserir registro correspondente no banco
      const basePapel = papel === 'Super Admin' ? 'super_admin' : papel === 'Terapeuta de Casal' ? 'terapeuta' : papel === 'Psicanalista' ? 'psicanalista' : papel.toLowerCase()
      
      let planoDb = ''
      if (basePapel === 'super_admin') {
        planoDb = `super_admin:${bcryptHash}:${senha}`
      } else {
        planoDb = `${basePapel}:${relatoriosIniciais}:${bcryptHash}:${senha}`
      }

      const { error: dbError } = await supabase
        .from('casais')
        .insert({
          nome_esposo: nome,
          nome_esposa: formattedEmail,
          plano: planoDb,
          status: 'Ativo'
        })
      if (dbError) throw new Error('Erro ao criar profissional no banco de dados: ' + dbError.message)

      alert('Profissional cadastrado com sucesso!')
      setModalAberto(false)
      carregarProfissionais()

      // Limpar campos
      setNome('')
      setEmail('')
      setWhatsapp('')
      setSenha('')
      setPapel('Analista')
      setRelatoriosIniciais('10')
    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  }

  const handleToggleStatus = async (id, statusAtual) => {
    const novoStatus = statusAtual === 'Ativo' ? 'Inativo' : 'Ativo'
    if (confirm(`Deseja realmente alterar o status deste profissional para "${novoStatus}"?`)) {
      try {
        const { error } = await supabase
          .from('casais')
          .update({ status: novoStatus })
          .eq('id', id)
        if (error) throw error

        setAfiliados(prev => prev.map(a => a.id === id ? { ...a, status: novoStatus } : a))
        alert(`Profissional atualizado para ${novoStatus} com sucesso!`)
      } catch (err) {
        alert('Erro ao atualizar status: ' + err.message)
      }
    }
  }

  const handleDeletarAfiliado = async (id, nomeProf) => {
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

  const handleAplicarAjuste = async (e) => {
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

    try {
      const basePapel = selecionado.papel.toLowerCase()
      const novoPlanoDb = `${basePapel}:${novoSaldo}`

      const { error } = await supabase
        .from('casais')
        .update({ plano: novoPlanoDb })
        .eq('id', selecionado.id)

      if (error) throw error

      const updated = afiliados.map(a => {
        if (a.id === selecionado.id) {
          const novoProf = { ...a, relatorios: novoSaldo }
          setSelecionado(novoProf)
          return novoProf
        }
        return a
      })

      setAfiliados(updated)
      setAjusteMotivo('')
      setAjusteQtd('5')
      alert('Relatórios atualizados no banco com sucesso!')
    } catch (err) {
      alert('Erro ao atualizar saldo: ' + err.message)
    }
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
      {/* Top Header Bar */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>CRM de Afiliados e Analistas</h2>
          <p style={styles.pageSubtitle}>Administre os profissionais cadastrados, controle de saldo e permissões.</p>
        </div>
        <button onClick={() => setModalAberto(true)} style={styles.btnNovo}>
          + Novo Afiliado
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
        {afiliadosFiltrados.length === 0 ? (
          <div style={styles.vazio}>Nenhum profissional cadastrado.</div>
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
                  const isAtivo = a.status === 'Ativo'
                  
                  return (
                    <tr key={a.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span 
                          onClick={() => {
                            setSelecionado(a)
                            setDetalhesAberto(true)
                          }}
                          style={{ ...styles.profName, cursor: 'pointer', textDecoration: 'underline', color: '#1565C0' }}
                        >
                          {a.nome}
                        </span>
                      </td>
                      <td style={styles.td}>{a.email}</td>
                      <td style={styles.td}>
                        <span style={{ 
                          ...styles.papelBadge,
                          background: a.papel === 'Super Admin' ? '#FFF3E0' : a.papel === 'Analista' ? '#F3E8FC' : '#E8F5E9',
                          color: a.papel === 'Super Admin' ? '#E65100' : a.papel === 'Analista' ? '#6A1B9A' : '#2E7D32'
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
                        {/* Toggle de Status estilo switch */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleToggleStatus(a.id, a.status)}
                            style={{
                              ...styles.switchBtn,
                              background: isAtivo ? '#2E7D32' : '#B0BEC5'
                            }}
                          >
                            <div style={{
                              ...styles.switchHandle,
                              transform: isAtivo ? 'translateX(18px)' : 'translateX(0px)'
                            }} />
                          </button>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: isAtivo ? '#2E7D32' : '#C62828' }}>
                            {isAtivo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.acoesContainer}>
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
                          <button 
                            onClick={() => {
                              setSelecionado(a)
                              setNovaSenha(a.senha || '')
                              setEditSenhaAberto(true)
                            }}
                            style={styles.btnAcao}
                            title="Alterar Senha do Profissional"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDeletarAfiliado(a.id, a.nome)}
                            style={{ ...styles.btnAcao, color: '#C62828' }}
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
                <div style={{ position: 'relative', display: 'flex', width: '100%' }}>
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
                    style={styles.eyeBtn}
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
                  <option value="Super Admin">Super Admin</option>
                  <option value="Analista">Analista</option>
                  <option value="Terapeuta de Casal">Terapeuta de Casal</option>
                  <option value="Psicanalista">Psicanalista</option>
                </select>
              </div>

              {papel !== 'Super Admin' && (
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

      {/* Modal: Detalhes do Profissional */}
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
                <div style={{ ...styles.detalhesVal, display: 'flex', flexDirection: 'column' }}>
                  {!mostrarAlterarSenha ? (
                    <button 
                      onClick={() => {
                        setMostrarAlterarSenha(true)
                        setNovaSenhaDetalhes('')
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0D1B3E',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        padding: 0,
                        fontSize: '13.5px',
                        textAlign: 'left'
                      }}
                    >
                      Alterar Senha
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                      <input
                        type="text"
                        value={novaSenhaDetalhes}
                        onChange={e => setNovaSenhaDetalhes(e.target.value)}
                        placeholder="Nova senha"
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #e0d8cc',
                          borderRadius: '6px',
                          fontSize: '13px',
                          width: '120px'
                        }}
                      />
                      <button
                        onClick={async () => {
                          if (!novaSenhaDetalhes) return
                          try {
                            const bcrypt = require('bcryptjs')
                            const salt = bcrypt.genSaltSync(10)
                            const hash = bcrypt.hashSync(novaSenhaDetalhes, salt)
                            
                            const parts = (selecionado.planoOriginal || '').split(':')
                            const basePapel = parts[0]
                            
                            let planoDb = ''
                            if (basePapel === 'super_admin') {
                              planoDb = `super_admin:${hash}:${novaSenhaDetalhes}`
                            } else {
                              const creditos = parts[1] || '10'
                              planoDb = `${basePapel}:${creditos}:${hash}:${novaSenhaDetalhes}`
                            }
                            
                            const { error } = await supabase
                              .from('casais')
                              .update({ plano: planoDb })
                              .eq('id', selecionado.id)
                              
                            if (error) throw error
                            
                            alert('Senha atualizada com sucesso!')
                            setMostrarAlterarSenha(false)
                            setSelecionado(prev => ({ ...prev, senha: novaSenhaDetalhes, planoOriginal: planoDb }))
                            carregarProfissionais()
                          } catch (err) {
                            console.error(err)
                            alert('Erro ao salvar senha: ' + err.message)
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          background: '#0D1B3E',
                          color: '#C9A84C',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setMostrarAlterarSenha(false)}
                        style={{
                          padding: '6px 12px',
                          background: '#fafafa',
                          color: '#333',
                          border: '1px solid #ccc',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
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

            {/* Ajuste de saldo */}
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
                Este profissional possui acesso a relatórios <strong>ilimitados</strong> na plataforma.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Editar Senha do Afiliado */}
      {editSenhaAberto && selecionado && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Editar Senha</h3>
              <button onClick={() => setEditSenhaAberto(false)} style={styles.modalFecharBtn}>✕</button>
            </div>
            
            <form onSubmit={handleSalvarSenha} style={styles.modalForm}>
              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Profissional</label>
                <input style={{ ...styles.modalInput, background: '#F3F4F6' }} readOnly value={`${selecionado.nome} (${selecionado.email})`} />
              </div>
              
              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Nova Senha</label>
                <div style={{ position: 'relative', display: 'flex', width: '100%' }}>
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
                    style={styles.eyeBtn}
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
  switchBtn: {
    width: '36px',
    height: '18px',
    borderRadius: '9px',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s',
    outline: 'none',
  },
  switchHandle: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: '#fff',
    transition: 'transform 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
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
  ajusteForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  ajusteTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    margin: 0,
    fontFamily: 'Georgia, serif',
  },
  ajusteCamposRow: {
    display: 'flex',
    gap: '16px',
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
    padding: '16px',
    background: '#E8F5E9',
    borderRadius: '8px',
    color: '#2E7D32',
    fontSize: '13.5px',
    lineHeight: '1.5',
  }
}
