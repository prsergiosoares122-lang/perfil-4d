import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aojqrexjcnwjmfdcfgfy.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_wCD4iCoimK9O_Js-975OdA_zwii0paQ'

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
})

export async function getCustomSession() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session && session.user) {
    return {
      email: session.user.email.toLowerCase(),
      plano: '',
      isAuth: true
    }
  }
  
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('perfil4d_logged_user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        return {
          email: user.email.toLowerCase(),
          plano: user.plano,
          isAuth: false
        }
      } catch (e) {
        console.error("Error parsing custom session:", e)
      }
    }
  }
  
  return null
}