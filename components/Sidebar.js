'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const [role, setRole] = useState('Analista')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    checarRole()
  }, [])

  async function checarRole() {
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

    if (email) {
      if (!userPlano) {
        const { data } = await supabase
          .from('casais')
          .select('plano')
          .eq('nome_esposa', email)
          .limit(1)

        if (data && data[0]) {
          userPlano = data[0].plano || ''
        }
      }

      if (
        email === 'prsergiosoares122@gmail.com' ||
        email === 'thiago.medeiros@perfil4d.com' ||
        email === 'sergio@email.com' ||
        email === 'pr_sergiosoares@hotmail.com' ||
        email.includes('admin') ||
        userPlano.startsWith('super_admin')
      ) {
        setIsSuperAdmin(true)
        setRole('Super Admin')
      } else {
        if (userPlano.startsWith('afiliado')) {
          setRole('Afiliado')
        } else if (userPlano.startsWith('analista')) {
          setRole('Analista')
        } else if (userPlano.startsWith('terapeuta')) {
          setRole('Terapeuta de Casal')
        } else if (userPlano.startsWith('psicanalista')) {
          setRole('Psicanalista')
        } else {
          setRole('Analista')
        }
      }
    }
  }

  const allItems = [
    { label: 'Painel', path: (role === 'Afiliado' || role === 'Analista' || role === 'Terapeuta de Casal' || role === 'Psicanalista') ? '/dashboard' : '/dashboard/painel' },
    { label: 'Casais', path: '/dashboard' },
    { label: 'Afiliados', path: '/dashboard/afiliados' },
    { label: 'Tutorial', path: '/dashboard/tutorial' },
    { label: 'Cursos', path: '/dashboard/cursos' },
    { label: 'Configurações', path: '/dashboard/configuracoes' },
    { label: 'Relatórios', path: '/dashboard/relatorios' },
    const menuItems = allItems.filter(item => {
      // Se for Super Admin, mostra tudo
      if (isSuperAdmin) return true;

      // Se não for, limita aos itens permitidos
      const allowed = ['Painel', 'Tutorial', 'Cursos', 'Relatórios'];
      return allowed.includes(item.label);
    });




  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h1 style={styles.logo}>PERFIL 4D</h1>
        <p style={styles.logoSub}>Painel Psicanálise</p>
      </div>

      <div style={styles.navContainer}>
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.path
          return (
            <div
              key={idx}
              onClick={() => {
                if (item.path !== '#') {
                  router.push(item.path)
                }
              }}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              }}
            >
              <span style={{
                ...styles.navDot,
                ...(isActive ? styles.navDotActive : {})
              }}>•</span>
              {item.label}
            </div>
          )
        })}
      </div>

      <div style={styles.footer}>
        <button onClick={sair} style={styles.btnSair}>
          <span style={{ marginRight: 6 }}>🚪</span> Sair da Conta
        </button>
      </div>
    </div>
  )
}

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: '240px',
    background: '#0D1B3E',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    zIndex: 100,
    fontFamily: '"Outfit", "Inter", sans-serif',
  },
  header: {
    padding: '30px 24px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  logo: {
    fontFamily: 'Georgia, serif',
    color: '#C9A84C',
    fontSize: '20px',
    letterSpacing: '3px',
    margin: 0,
    fontWeight: 'normal',
  },
  logoSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '11px',
    margin: '4px 0 0 0',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  navContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: '13.5px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: '500',
  },
  navItemActive: {
    background: 'rgba(201, 168, 76, 0.08)',
    color: '#C9A84C',
    fontWeight: 'bold',
  },
  navDot: {
    marginRight: '10px',
    fontSize: '16px',
    color: 'rgba(255,255,255,0.15)',
    transition: 'color 0.2s ease',
  },
  navDotActive: {
    color: '#C9A84C',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: '#0a1430',
  },
  btnSair: {
    width: '100%',
    padding: '10px',
    background: 'transparent',
    color: 'rgba(255,255,255,0.45)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}
