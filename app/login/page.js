'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [mostrarEsqueciSenhaModal, setMostrarEsqueciSenhaModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    
    try {
      // 1. Verificar se a conta está cadastrada e bloqueada/inativa na tabela casais
      const { data: profs, error: profError } = await supabase
        .from('casais')
        .select('*')
        .eq('email_esposo', email)
      
      if (!profError && profs && profs.length > 0) {
        const p = profs[0].plano || ''
        const isProf = p.startsWith('afiliado') || p.startsWith('analista') || p.startsWith('super_admin')
        if (isProf && (profs[0].status === 'Bloqueado' || profs[0].status === 'Inativo')) {
          throw new Error('Sua conta está inativa ou bloqueada pelo administrador. Entre em contato com o suporte.');
        }
      }

      // 2. Acessar via Supabase Auth
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
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={senhaVisivel ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...styles.input, paddingRight: '45px' }}
                required
              />
              <button
                type="button"
                onClick={() => setSenhaVisivel(!senhaVisivel)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {senhaVisivel ? '👁' : '🙈'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '-10px' }}>
            <button
              type="button"
              onClick={() => setMostrarEsqueciSenhaModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#C9A84C',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Esqueci minha senha
            </button>
          </div>

          {erro && <div style={styles.erroBox}>{erro}</div>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Autenticando...' : 'Acessar Painel'}
          </button>
        </form>
      </div>

      {mostrarEsqueciSenhaModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Recuperar Acesso</h3>
              <button onClick={() => setMostrarEsqueciSenhaModal(false)} style={styles.modalFecharBtn}>✕</button>
            </div>
            <p style={{ fontSize: '14.5px', color: '#666', lineHeight: '1.6', margin: '16px 0' }}>
              Esqueceu sua senha? Por favor, entre em contato diretamente com o suporte ou o administrador da plataforma para recuperar seu acesso de forma simplificada.
            </p>
            <button
              onClick={() => setMostrarEsqueciSenhaModal(false)}
              style={styles.btnModalFechar}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

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
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(13,27,62,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  modalCard: {
    background: '#FFF',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    border: '1px solid #e0d8cc',
    position: 'relative',
    textAlign: 'left'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  modalTitle: {
    fontSize: '20px',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    margin: 0
  },
  modalFecharBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#999'
  },
  btnModalFechar: {
    width: '100%',
    padding: '12px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14.5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  }
};