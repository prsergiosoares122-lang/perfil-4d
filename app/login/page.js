'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      window.location.href = '/dashboard';
    } catch (err) {
      console.error("Erro no login:", err);
      setErro(err.message || "Erro desconhecido ao entrar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.logo}>PERFIL 4D</h1>
          <p style={styles.subtitle}>Painel do Psicanalista</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.grupo}>
            <label style={styles.label}>E-mail de Acesso</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.grupo}>
            <label style={styles.label}>Senha de Segurança</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {erro && <div style={styles.erroBox}>{erro}</div>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Autenticando...' : 'Acessar Painel'}
          </button>
        </form>
      </div>
      <p style={styles.footerText}>Perfil 4D · Área Administrativa Restrita</p>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F8F4ED',
    fontFamily: '"Outfit", "Inter", sans-serif',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '40px 32px',
    boxShadow: '0 10px 30px rgba(13, 27, 62, 0.06)',
    border: '1px solid #e8e0d4',
  },
  header: {
    textAlign: 'center',
    marginBottom: '36px',
  },
  logo: {
    fontFamily: 'Georgia, serif',
    color: '#0D1B3E',
    fontSize: '32px',
    letterSpacing: '3px',
    fontWeight: 'normal',
    marginBottom: '6px',
  },
  subtitle: {
    color: '#C9A84C',
    fontSize: '13px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  grupo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    background: '#faf7f2',
    transition: 'border-color 0.2s',
  },
  erroBox: {
    background: '#FFEBEE',
    border: '1px solid #FFCDD2',
    borderRadius: '8px',
    color: '#C62828',
    padding: '12px 14px',
    fontSize: '13px',
    lineHeight: '1.5',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(13, 27, 62, 0.15)',
  },
  footerText: {
    marginTop: '24px',
    color: '#AAA',
    fontSize: '12px',
    letterSpacing: '0.5px',
  },
};