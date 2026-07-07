'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    checarSessao()
  }, [])

  async function checarSessao() {
    // Verifica se o supabase foi importado corretamente
    if (!supabase || !supabase.auth) {
      console.error('Supabase não inicializado');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }

  return null
}
