'use client'
export default function GuiaPage() {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Guia Metodológico</h2>
      <p style={styles.subtitle}>Esta tela está em desenvolvimento e trará o guia do Perfil 4D em breve.</p>
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
