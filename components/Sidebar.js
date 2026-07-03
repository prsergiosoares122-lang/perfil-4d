'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Sidebar() {
  const router = useRouter()
  const [counts, setCounts] = useState({ total: 0, completos: 0, aguardando: 0 })

  useEffect(() => {
    carregarStats()
    window.addEventListener('stats-updated', carregarStats)
    return () => window.removeEventListener('stats-updated', carregarStats)
  }, [])

  async function carregarStats() {
    const { data, error } = await supabase
      .from('casais')
      .select('status')
    
    if (!error && data) {
      const total = data.length
      const completos = data.filter(c => c.status === 'completo' || c.status === 'relatorio_gerado').length
      const aguardando = data.filter(c => c.status === 'aguardando' || c.status === 'esposo_respondeu' || c.status === 'esposa_respondeu').length
      setCounts({ total, completos, aguardando })
    }
  }

  async function sair() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={styles.sidebar}>
      <h1 style={styles.logo}>PERFIL 4D</h1>
      <p style={styles.logoSub}>Painel do Psicanalista</p>
      <div style={styles.navDivider}></div>
      <div style={styles.stats}>
        <div style={styles.statItem}>
          <span style={styles.statNum}>{counts.total}</span>
          <span style={styles.statLabel}>Casais cadastrados</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statNum}>{counts.completos}</span>
          <span style={styles.statLabel}>Completos</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statNum}>{counts.aguardando}</span>
          <span style={styles.statLabel}>Aguardando</span>
        </div>
      </div>
      <div style={styles.navDivider}></div>
      <button onClick={sair} style={styles.btnSair}>Sair</button>
    </div>
  )
}

const styles = {
  sidebar: { width: 240, background: '#0D1B3E', padding: '28px 20px', display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: '100vh' },
  logo: { fontFamily: 'Georgia,serif', color: '#C9A84C', fontSize: 22, letterSpacing: 3, marginBottom: 4 },
  logoSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 0 },
  navDivider: { height: 1, background: 'rgba(255,255,255,0.1)', margin: '20px 0' },
  stats: { display: 'flex', flexDirection: 'column', gap: 16 },
  statItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  statNum: { color: '#C9A84C', fontSize: 28, fontWeight: 'bold', fontFamily: 'Georgia,serif' },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  btnSair: { marginTop: 'auto', padding: '10px', background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
}
