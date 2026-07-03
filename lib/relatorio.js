import { NOMES, CORES_DISC, classificar, BLOCOS } from './perguntas'

export function gerarRelatorioHTML(casal, pctEsposo, pctEsposa, conjuge) {
  const nome = conjuge === 'esposo' ? casal.nome_esposo : casal.nome_esposa
  const nomePartner = conjuge === 'esposo' ? casal.nome_esposa : casal.nome_esposo
  const corPrincipal = conjuge === 'esposo' ? '#1565C0' : '#6A1B9A'
  const corBg = conjuge === 'esposo' ? '#E8F0FA' : '#F3E8FC'
  const pct = conjuge === 'esposo' ? pctEsposo : pctEsposa
  const pctOther = conjuge === 'esposo' ? pctEsposa : pctEsposo
  const data = new Date().toLocaleDateString('pt-BR')

  const disc = BLOCOS.bloco1.map(c => ({
    nome: NOMES[c], pct: pct[c], cor: CORES_DISC[c]
  })).sort((a,b) => b.pct - a.pct)

  function barraComparativa(comportamento) {
    const p1 = pct[comportamento] || 0
    const p2 = pctOther[comportamento] || 0
    const dist = Math.abs(p1 - p2).toFixed(0)
    const nivel = classificar(p1)
    const badgeColor = nivel === 'elevado' ? '#2E7D32' : nivel === 'medio' ? '#E65100' : '#C62828'
    const badgeBg = nivel === 'elevado' ? '#E8F5E9' : nivel === 'medio' ? '#FFF8E1' : '#FFEBEE'

    let mensagem = ''
    const distNum = parseFloat(dist)

    if (distNum > 30) {
      mensagem = `
        <div style="background:#0D1B3E;border:1px solid #C9A84C;border-radius:10px;padding:20px;margin-top:14px;text-align:center">
          <div style="color:#C9A84C;font-size:15px;font-weight:bold;margin-bottom:8px">Distância comportamental: ${dist} pontos</div>
          <div style="color:rgba(255,255,255,0.85);font-size:14px;line-height:1.8;margin-bottom:16px">Às vezes um número não conta a história toda. Se este resultado despertou algo em você, há um espaço preparado para aprofundar essa conversa — com acolhimento e sem julgamentos.</div>
          <a href="https://wa.me/5521974013287?text=Desejo%20uma%20sess%C3%A3o%20de%20terapia%20para%20melhor%20entender%20nossa%20situa%C3%A7%C3%A3o" style="display:inline-block;background:#C9A84C;color:#0D1B3E;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold">Quero entender isso na Devolutiva</a>
        </div>`
    } else if (p1 >= 66 && p2 >= 66) {
      mensagem = `<div style="background:#E8F5E9;border-left:4px solid #2E7D32;border-radius:0 8px 8px 0;padding:16px;margin-top:14px"><p style="color:#1B5E20;font-size:14px;line-height:1.8;margin:0">🌟 <strong>Excelente!</strong> Vocês dois estão em nível elevado neste comportamento — isso é raro e precioso. Continue alimentando essa área: ela é um dos pilares do relacionamento de vocês.</p></div>`
    } else if (distNum <= 15 && p1 < 66) {
      mensagem = `<div style="background:#FFF8E1;border-left:4px solid #F9A825;border-radius:0 8px 8px 0;padding:16px;margin-top:14px"><p style="color:#4E342E;font-size:14px;line-height:1.8;margin:0">📌 <strong>Atenção:</strong> vocês estão próximos neste comportamento, mas ambos têm espaço para crescer. Não deixe essa área cair — cultivá-la juntos fortalece o relacionamento.</p></div>`
    } else if (distNum > 15 && distNum <= 30) {
      mensagem = `
        <div style="background:#0D1B3E;border:1px solid #C9A84C;border-radius:10px;padding:20px;margin-top:14px;text-align:center">
          <div style="color:#C9A84C;font-size:15px;font-weight:bold;margin-bottom:8px">Distância comportamental: ${dist} pontos</div>
          <div style="color:rgba(255,255,255,0.85);font-size:14px;line-height:1.8;margin-bottom:16px">Há uma diferença que merece atenção aqui. Entender o que está por trás dela pode transformar a dinâmica de vocês.</div>
          <a href="https://wa.me/5521974013287?text=Desejo%20uma%20sess%C3%A3o%20de%20terapia%20para%20melhor%20entender%20nossa%20situa%C3%A7%C3%A3o" style="display:inline-block;background:#C9A84C;color:#0D1B3E;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold">Quero entender isso na Devolutiva</a>
        </div>`
    } else if (p1 < 33 || p2 < 33) {
      mensagem = `<div style="background:#FFEBEE;border:1.5px solid #C62828;border-radius:8px;padding:18px;margin-top:14px"><div style="color:#C62828;font-size:14px;font-weight:bold;margin-bottom:6px">⚠ Área que precisa de atenção urgente</div><p style="color:#4a1a1a;font-size:14px;line-height:1.8;margin-bottom:12px">Este comportamento está em nível baixo e pode estar gerando impactos silenciosos no relacionamento. Não ignorar — agir com leveza mas com intenção.</p><a href="https://wa.me/5521974013287?text=Desejo%20uma%20sess%C3%A3o%20de%20terapia%20para%20melhor%20entender%20nossa%20situa%C3%A7%C3%A3o" style="display:inline-block;background:#C62828;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:bold">Esta área precisa de atenção urgente</a></div>`
    }

    return `
      <div style="background:#fff;border-radius:8px;padding:22px;border:1px solid #e0d8cc;margin-bottom:28px">
        <div style="font-size:15px;font-weight:bold;color:#0D1B3E;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #e8e0d4">${NOMES[comportamento]}</div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:12px;color:#666;width:65px;flex-shrink:0">${casal.nome_esposo}</span>
          <div style="flex:1;background:#e8e0d4;border-radius:4px;height:24px;overflow:hidden">
            <div style="width:${pctEsposo[comportamento]}%;height:100%;background:#1565C0;border-radius:4px;display:flex;align-items:center;padding-left:8px">
              <span style="font-size:12px;font-weight:bold;color:#fff">${pctEsposo[comportamento]}%</span>
            </div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <span style="font-size:12px;color:#666;width:65px;flex-shrink:0">${casal.nome_esposa}</span>
          <div style="flex:1;background:#e8e0d4;border-radius:4px;height:24px;overflow:hidden">
            <div style="width:${pctEsposa[comportamento]}%;height:100%;background:#6A1B9A;border-radius:4px;display:flex;align-items:center;padding-left:8px">
              <span style="font-size:12px;font-weight:bold;color:#fff">${pctEsposa[comportamento]}%</span>
            </div>
          </div>
        </div>
        <span style="display:inline-block;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:bold;text-transform:uppercase;background:${badgeBg};color:${badgeColor}">${nivel === 'elevado' ? 'Elevado' : nivel === 'medio' ? 'Médio' : 'Baixo'} — ${p1}%</span>
        ${mensagem}
      </div>`
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Perfil 4D — ${nome}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;background:#F8F4ED;color:#1a1a1a}
.page{max-width:800px;margin:0 auto;padding:0 0 60px}
p{font-size:15px;line-height:1.85;color:#333;margin-bottom:12px}
@media print{body{background:#fff}.header,.footer,.terapeuta{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
</head>
<body>
<div class="page">

<div style="background:#FFF8E1;border-left:5px solid #C9A84C;padding:20px 28px">
  <p style="font-size:13px;font-weight:bold;color:#7a5200;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Antes de começar — leia com atenção</p>
  <p style="font-size:14px;color:#4a3800;line-height:1.8;margin:0">O <strong>Perfil 4D não é um laudo final do relacionamento</strong>, mas sim uma <strong>análise comportamental</strong>. Os resultados refletem o momento atual — e à medida que o casal evolui, os comportamentos também mudam.</p>
</div>

<div class="header" style="background:#0D1B3E;padding:50px 40px;text-align:center">
  <h1 style="font-family:Georgia,serif;color:#C9A84C;font-size:44px;letter-spacing:4px;margin-bottom:8px">PERFIL 4D</h1>
  <h2 style="color:#fff;font-size:20px;font-weight:300;margin-bottom:6px">Relatório Individual</h2>
  <h3 style="color:rgba(255,255,255,0.6);font-size:14px;font-weight:300;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px">${nome} · Análise Comportamental</h3>
  <div style="width:60px;height:2px;background:#C9A84C;margin:0 auto"></div>
</div>

<div style="padding:36px 40px;border-bottom:1px solid #e0d8cc">
  <div style="background:${corBg};border-left:4px solid ${corPrincipal};border-radius:0 8px 8px 0;padding:24px 28px">
    <p>O que você está vendo aqui não é um veredito — é uma fotografia do momento.</p>
    <p>${nome}, o Perfil 4D é uma análise comportamental — e comportamento não é destino. Ele reflete os seus padrões de agir e reagir no relacionamento hoje.</p>
    <p>Tudo o que aparece aqui pode mudar. Quando a gente se conhece melhor, passa a fazer escolhas melhores.</p>
    <p style="font-style:italic;font-weight:bold;color:${corPrincipal};margin-bottom:0">Leia com curiosidade, não com julgamento. Cada comportamento é uma porta — e você tem a chave.</p>
  </div>
</div>

<div style="padding:36px 40px;border-bottom:1px solid #e0d8cc">
  <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;margin-bottom:6px">Seu perfil comportamental principal</div>
  <div style="font-family:Georgia,serif;font-size:22px;color:#0D1B3E;margin-bottom:24px">Como você age no relacionamento</div>
  ${disc.map(d => `
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;font-size:13px;color:#444;margin-bottom:5px"><span>${d.nome}</span><span style="font-weight:bold;color:#0D1B3E">${d.pct}%</span></div>
      <div style="background:#e0d8cc;border-radius:6px;height:28px;overflow:hidden">
        <div style="width:${d.pct}%;height:100%;background:${d.cor};border-radius:6px;display:flex;align-items:center;padding-left:12px"><span style="font-size:12px;font-weight:bold;color:#fff">${d.pct}%</span></div>
      </div>
    </div>`).join('')}
</div>

<div style="padding:36px 40px;border-bottom:1px solid #e0d8cc">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:10px">
    <div style="font-family:Georgia,serif;font-size:22px;color:#0D1B3E">Análise Comparativa do Casal</div>
    <div style="display:flex;gap:16px;font-size:12px;color:#555">
      <span><span style="width:12px;height:12px;border-radius:50%;background:#1565C0;display:inline-block;margin-right:4px;vertical-align:middle"></span>${casal.nome_esposo}</span>
      <span><span style="width:12px;height:12px;border-radius:50%;background:#6A1B9A;display:inline-block;margin-right:4px;vertical-align:middle"></span>${casal.nome_esposa}</span>
    </div>
  </div>
  ${BLOCOS.bloco2.map(c => barraComparativa(c)).join('')}
</div>

<div id="psicanalista" style="padding:40px;background:#0D1B3E;text-align:center">
  <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;margin-bottom:12px">Próximo passo recomendado</div>
  <h2 style="font-family:Georgia,serif;color:#fff;font-size:26px;margin-bottom:20px">Psicanalista Sérgio Soares</h2>
  <div style="background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.35);border-radius:10px;padding:22px 24px;max-width:600px;margin:0 auto 28px;text-align:left">
    <p style="color:#C9A84C;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Orientação clínica</p>
    <p style="color:rgba(255,255,255,0.9);font-size:15px;line-height:1.85;margin-bottom:0">Diante do quadro apresentado nesta análise, a recomendação mais aconselhada é marcar <strong style="color:#C9A84C">uma sessão de terapia para melhor entender o quadro de vocês</strong> — com acolhimento, sem julgamentos e com direcionamento profissional.</p>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:600px;margin:0 auto 28px;text-align:left">
    <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:20px">
      <p style="color:#C9A84C;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Quem é Sérgio Soares</p>
      <p style="color:rgba(255,255,255,0.75);font-size:14px;line-height:1.8;margin:0">Psicanalista clínico especializado em relações conjugais e dinâmicas familiares. Com anos de atuação dedicados à escuta e ao cuidado de casais, desenvolveu uma abordagem própria que une rigor psicanalítico e acolhimento humano.</p>
    </div>
    <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:20px">
      <p style="color:#C9A84C;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Atendimento e acompanhamento</p>
      <p style="color:rgba(255,255,255,0.75);font-size:14px;line-height:1.8;margin:0">Para orientação personalizada, leitura aprofundada do casal e direcionamento terapêutico, toque no botão abaixo e envie a sua mensagem pelo WhatsApp.</p>
    </div>
  </div>
  <a href="https://wa.me/5521974013287?text=Desejo%20uma%20sess%C3%A3o%20de%20terapia%20para%20melhor%20entender%20nossa%20situa%C3%A7%C3%A3o" style="display:block;background:#C9A84C;color:#0D1B3E;text-align:center;padding:18px 28px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;max-width:420px;margin:0 auto 8px">Falar com o Psicanalista Sérgio Soares</a>
  <div style="color:rgba(255,255,255,0.4);font-size:13px;text-align:center">Atendimento online e presencial</div>
</div>

<div style="background:#060f26;padding:24px;text-align:center;border-top:1px solid rgba(201,168,76,.2)">
  <p style="color:rgba(255,255,255,0.3);font-size:13px;line-height:1.8">Perfil 4D · Psicanalista Sérgio Soares · Psicanalista e Terapeuta de Família<br>+55 21 97401-3287 · Atendimento online e presencial<br>© 2026 Perfil 4D · Gerado em ${data}</p>
</div>

</div>
</body>
</html>`
}
