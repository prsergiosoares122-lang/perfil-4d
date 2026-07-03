'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const STATUS_LABEL = {
  aguardando: { texto:'Aguardando', cor:'#E65100', bg:'#FFF8E1' },
  esposo_respondeu: { texto:'Esposo ✓', cor:'#1565C0', bg:'#E3F2FD' },
  esposa_respondeu: { texto:'Esposa ✓', cor:'#6A1B9A', bg:'#F3E8FC' },
  completo: { texto:'Completo ✓✓', cor:'#2E7D32', bg:'#E8F5E9' },
  relatorio_gerado: { texto:'Relatório gerado', cor:'#37474F', bg:'#ECEFF1' },
}

export default function Dashboard() {
  const router = useRouter()
  const [casais, setCasais] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => { verificarAuth(); carregarCasais() }, [])

  async function verificarAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/login')
  }

  async function carregarCasais() {
    const { data, error } = await supabase
      .from('casais')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setCasais(data || [])
    setLoading(false)
  }

  async function sair() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const casaisFiltrados = casais.filter(c => {
    const termoBusca = busca.toLowerCase()
    const matchBusca = !busca ||
      c.nome_esposo.toLowerCase().includes(termoBusca) ||
      c.nome_esposa.toLowerCase().includes(termoBusca)
    const matchFiltro = filtro === 'todos' || c.status === filtro
    return matchBusca && matchFiltro
  })

  function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', {
      day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
    })
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h1 style={styles.logo}>PERFIL 4D</h1>
        <p style={styles.logoSub}>Painel do Psicanalista</p>
        <div style={styles.navDivider}></div>
        <div style={styles.stats}>
          <div style={styles.statItem}>
            <span style={styles.statNum}>{casais.length}</span>
            <span style={styles.statLabel}>Casais cadastrados</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNum}>{casais.filter(c=>c.status==='completo'||c.status==='relatorio_gerado').length}</span>
            <span style={styles.statLabel}>Completos</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNum}>{casais.filter(c=>c.status==='aguardando'||c.status==='esposo_respondeu'||c.status==='esposa_respondeu').length}</span>
            <span style={styles.statLabel}>Aguardando</span>
          </div>
        </div>
        <div style={styles.navDivider}></div>
        <button onClick={sair} style={styles.btnSair}>Sair</button>
      </div>

      <div style={styles.main}>
        <div style={styles.topBar}>
          <h2 style={styles.pageTitle}>Casais cadastrados</h2>
          <a href="/questionario" target="_blank" style={styles.btnNovo}>+ Novo casal</a>
        </div>

        <div style={styles.filtros}>
          <input style={styles.busca} placeholder="Buscar por nome..."
            value={busca} onChange={e => setBusca(e.target.value)} />
          <select style={styles.select} value={filtro} onChange={e => setFiltro(e.target.value)}>
            <option value="todos">Todos os status</option>
            <option value="aguardando">Aguardando</option>
            <option value="esposo_respondeu">Esposo respondeu</option>
            <option value="esposa_respondeu">Esposa respondeu</option>
            <option value="completo">Completo</option>
            <option value="relatorio_gerado">Relatório gerado</option>
          </select>
        </div>

        {loading ? (
          <div style={styles.loading}>Carregando...</div>
        ) : casaisFiltrados.length === 0 ? (
          <div style={styles.vazio}>Nenhum casal encontrado.</div>
        ) : (
          <div style={styles.lista}>
            {casaisFiltrados.map(casal => {
              const s = STATUS_LABEL[casal.status] || STATUS_LABEL.aguardando
              const podeGerar = casal.status === 'completo' || casal.status === 'relatorio_gerado'
              return (
                <div key={casal.id} style={styles.casalCard}>
                  <div style={styles.casalInfo}>
                    <div style={styles.casalNomes}>
                      <span style={styles.nomeEsposo}>{casal.nome_esposo}</span>
                      <span style={styles.amp}> & </span>
                      <span style={styles.nomeEsposa}>{casal.nome_esposa}</span>
                    </div>
                    <div style={styles.casalMeta}>
                      <span style={{...styles.badge, color:s.cor, background:s.bg}}>{s.texto}</span>
                      <span style={styles.data}>{formatarData(casal.created_at)}</span>
                    </div>
                  </div>
                  <div style={styles.casalAcoes}>
                    {podeGerar ? (
                      <>
                        <button onClick={() => router.push(`/dashboard/relatorio/${casal.id}/esposo`)}
                          style={styles.btnEsposo}>Rel. Esposo</button>
                        <button onClick={() => router.push(`/dashboard/relatorio/${casal.id}/esposa`)}
                          style={styles.btnEsposa}>Rel. Esposa</button>
                        <button onClick={() => router.push(`/dashboard/relatorio/${casal.id}/consultor`)}
                          style={styles.btnConsultor}>Consultor</button>
                      </>
                    ) : (
                      <span style={styles.aguardandoTag}>Aguardando respostas</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { display:'flex', minHeight:'100vh', fontFamily:'Arial,sans-serif', background:'#F8F4ED' },
  sidebar: { width:240, background:'#0D1B3E', padding:'28px 20px', display:'flex', flexDirection:'column', flexShrink:0 },
  logo: { fontFamily:'Georgia,serif', color:'#C9A84C', fontSize:22, letterSpacing:3, marginBottom:4 },
  logoSub: { color:'rgba(255,255,255,0.5)', fontSize:12, marginBottom:0 },
  navDivider: { height:1, background:'rgba(255,255,255,0.1)', margin:'20px 0' },
  stats: { display:'flex', flexDirection:'column', gap:16 },
  statItem: { display:'flex', flexDirection:'column', gap:2 },
  statNum: { color:'#C9A84C', fontSize:28, fontWeight:'bold', fontFamily:'Georgia,serif' },
  statLabel: { color:'rgba(255,255,255,0.5)', fontSize:12 },
  btnSair: { marginTop:'auto', padding:'10px', background:'transparent', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, cursor:'pointer', fontSize:13 },
  main: { flex:1, padding:'28px 32px', overflow:'auto' },
  topBar: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 },
  pageTitle: { fontSize:22, color:'#0D1B3E', fontFamily:'Georgia,serif' },
  btnNovo: { padding:'10px 18px', background:'#0D1B3E', color:'#C9A84C', borderRadius:8, textDecoration:'none', fontSize:14, fontWeight:'bold' },
  filtros: { display:'flex', gap:12, marginBottom:20 },
  busca: { flex:1, padding:'10px 14px', border:'1px solid #e0d8cc', borderRadius:8, fontSize:14, outline:'none' },
  select: { padding:'10px 14px', border:'1px solid #e0d8cc', borderRadius:8, fontSize:14, outline:'none', background:'#fff' },
  loading: { textAlign:'center', padding:40, color:'#888' },
  vazio: { textAlign:'center', padding:40, color:'#888' },
  lista: { display:'flex', flexDirection:'column', gap:12 },
  casalCard: { background:'#fff', border:'1px solid #e8e0d4', borderRadius:10, padding:'18px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, flexWrap:'wrap' },
  casalInfo: { flex:1, minWidth:200 },
  casalNomes: { fontSize:17, fontWeight:'bold', color:'#0D1B3E', marginBottom:6 },
  nomeEsposo: { color:'#1565C0' },
  amp: { color:'#C9A84C', margin:'0 4px' },
  nomeEsposa: { color:'#6A1B9A' },
  casalMeta: { display:'flex', alignItems:'center', gap:12 },
  badge: { fontSize:12, fontWeight:'bold', padding:'3px 10px', borderRadius:20 },
  data: { fontSize:12, color:'#AAA' },
  casalAcoes: { display:'flex', gap:8, flexWrap:'wrap' },
  btnEsposo: { padding:'8px 14px', background:'#1565C0', color:'#fff', border:'none', borderRadius:6, fontSize:13, cursor:'pointer', fontWeight:'bold' },
  btnEsposa: { padding:'8px 14px', background:'#6A1B9A', color:'#fff', border:'none', borderRadius:6, fontSize:13, cursor:'pointer', fontWeight:'bold' },
  btnConsultor: { padding:'8px 14px', background:'#C9A84C', color:'#0D1B3E', border:'none', borderRadius:6, fontSize:13, cursor:'pointer', fontWeight:'bold' },
  aguardandoTag: { fontSize:13, color:'#AAA', fontStyle:'italic' },
}