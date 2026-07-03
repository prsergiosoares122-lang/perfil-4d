'use client'
export default function PainelPage() {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Painel Geral</h2>
      <p style={styles.subtitle}>Esta tela está em desenvolvimento e trará estatísticas gerais em breve.</p>
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
