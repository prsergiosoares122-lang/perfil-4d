'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { label: 'Painel', path: '/dashboard', active: true },
    { label: 'Casais', path: '/dashboard', active: false },
    { label: 'Leads', path: '#', active: false },
    { label: 'Tutorial', path: '#', active: false },
    { label: 'Financeiro', path: '#', active: false },
    { label: 'Cursos', path: '#', active: false },
    { label: 'Guia', path: '#', active: false },
    { label: 'Configurações', path: '#', active: false },
    { label: 'Análises', path: '#', active: false },
    { label: 'Relatórios', path: '#', active: false },
    { label: 'Eventos', path: '#', active: false },
    { label: 'Perguntas', path: '#', active: false },
    { label: 'Admin', path: '#', active: false },
  ]

  async function sair() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h1 style={styles.logo}>PERFIL 4D</h1>
        <p style={styles.logoSub}>Painel Psicanálise</p>
      </div>
      
      <div style={styles.navContainer}>
        {menuItems.map((item, idx) => {
          // Casais is where the therapist currently manages, so make it look selected
          const isActive = item.label === 'Casais'
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
