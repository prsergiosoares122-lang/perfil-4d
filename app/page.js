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
    // Verificação explícita de nulo que satisfaz o TypeScript
    if (supabase === null || supabase === undefined) {
      console.error('Supabase client not initialized');
      return;
    }

    // Acessando o auth com segurança após a verificação
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }

  return null
}
