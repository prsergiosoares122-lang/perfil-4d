'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCustomSession } from '@/lib/supabase'

export default function EventosPage() {
  const router = useRouter()
  const [autorizado, setAutorizado] = useState(false)

  useEffect(() => {
    verificarAuth()
  }, [])

  async function verificarAuth() {
    const session = await getCustomSession()
    if (!session) {
      router.push('/login')
      return
    }
    const email = session.email
    let userPlano = session.plano

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

    const isAdmin = email === 'prsergiosoares122@gmail.com' ||
                    email === 'thiago.medeiros@perfil4d.com' ||
                    email === 'sergio.soares@perfil4d.com' ||
                    email === 'sergio@email.com' ||
                    email === 'pr_sergiosoares@hotmail.com' ||
                    email.includes('admin') ||
                    userPlano.startsWith('super_admin')

    if (!isAdmin) {
      router.push('/dashboard')
    } else {
      setAutorizado(true)
    }
  }

  if (!autorizado) return null

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Eventos e Workshops</h2>
      <p style={styles.subtitle}>Esta tela está em desenvolvimento e trará a agenda de eventos em breve.</p>
    </div>
  )
}

const styles = {
  container: {
    padding: '40px',
    fontFamily: '"Outfit", "Inter", sans-serif',
  },
  title: {
    fontSize: '28px',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    fontWeight: 'normal',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '14.5px',
    color: '#666',
  }
}
