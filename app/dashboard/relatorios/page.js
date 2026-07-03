'use client'
export default function RelatoriosPage() {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Relatórios de Desempenho</h2>
      <p style={styles.subtitle}>Esta tela está em desenvolvimento e trará estatísticas consolidadas dos relatórios em breve.</p>
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
