import { NOMES, CORES_DISC, classificar, BLOCOS } from './perguntas'

function obterDadosArea(comportamento, pct) {
  const nivel = pct <= 33 ? 'baixo' : pct <= 65 ? 'medio' : 'elevado'
  const banco = {
    comunicativo: {
      explicacao: "O perfil Comunicativo avalia a capacidade individual de transmitir emoções, necessidades e pensamentos de forma clara, assertiva e não violenta dentro do convívio do casal. Analisa a clareza verbal, o timing da fala, a escuta ativa e a propensão a admitir erros, visando a construção de pontes seguras para o diálogo construtivo e livre de ruídos.",
      interpretacao: {
        elevado: "Seu percentual elevado sugere uma facilidade em manter canais abertos de diálogo, o que pode favorecer a resolução pacífica de conflitos no casamento.",
        medio: "Seu percentual médio pode indicar que, embora consiga se comunicar na maioria das vezes, em situações estressantes pode haver uma tendência a se retrair ou polemizar.",
        baixo: "Seu percentual baixo sinaliza a possibilidade de dificuldades em se fazer entender, sugerindo que ruídos ou defesas emocionais podem estar afetando a harmonia da relação."
      }
    },
    socializante: {
      explicacao: "O perfil Socializante mede o nível de abertura para o convívio externo do casal, incluindo amizades, familiares e eventos sociais. Examina como a extroversão individual interfere na dinâmica interna, equilibrando o tempo a dois com a necessária interação comunitária para que a relação não se isole e mantenha um fluxo saudável de novas vivências.",
      interpretacao: {
        elevado: "O alto percentual sugere que a interação social tende a trazer dinamismo e energia para o casal, possivelmente evitando o marasmo da rotina fechada.",
        medio: "O resultado intermediário pode apontar para uma busca por equilíbrio, onde momentos sociais e recolhimento íntimo se alternam conforme a conveniência.",
        baixo: "Seu baixo score pode indicar preferência pelo isolamento do casal, o que talvez crie uma dependência mútua excessiva ou limite o suporte externo do relacionamento."
      }
    },
    analitico: {
      explicacao: "O perfil Analítico analisa a tendência de pausar, planejar e racionalizar antes de tomar decisões ou reagir emocionalmente a conflitos conjugais. Focado no método, na lógica e na cautela, este comportamento busca assegurar que a vida comum seja baseada em critérios estruturados, prevenindo atitudes impulsivas que possam desestabilizar o casal.",
      interpretacao: {
        elevado: "A pontuação elevada pode indicar uma postura ponderada, o que tende a evitar decisões impulsivas, embora possa por vezes retardar a espontaneidade afetiva.",
        medio: "O percentual médio sugere uma alternância saudável entre a análise prudente e a intuição rápida, variando conforme a gravidade das circunstâncias conjugais.",
        baixo: "O score baixo indica uma possível inclinação para decisões imediatistas ou reações impulsivas, o que pode expor o casal a riscos financeiros ou desgastes emocionais."
      }
    },
    determinante: {
      explicacao: "O perfil Determinante investiga o foco em metas, a persistência diante de adversidades do casamento e a capacidade de assumir a liderança quando necessário. Avalia a firmeza de propósito e a estabilidade com que o indivíduo sustenta seus compromissos, garantindo segurança estrutural ao parceiro nos momentos de crise e transições importantes.",
      interpretacao: {
        elevado: "Seu nível elevado pode sugerir uma liderança firme e determinação em proteger a relação, contudo demanda atenção para não impor vontades unilateralmente.",
        medio: "O resultado médio pode indicar flexibilidade, demonstrando firmeza nas grandes decisões, mas permitindo concessões e divisão justa de liderança no cotidiano.",
        baixo: "O percentual baixo pode indicar menor resiliência em sustentar decisões sob pressão, criando possivelmente um sentimento de sobrecarga no cônjuge."
      }
    },
    empatia: {
      explicacao: "A Empatia mede a facilidade de sintonizar-se com o estado emocional do parceiro, suspendendo julgamentos para acolher sua dor ou vulnerabilidade. Analisa a sensibilidade de perceber sentimentos implícitos e a disposição de oferecer suporte incondicional, essencial para validar a segurança psicológica e a conexão íntima duradoura na vida a dois.",
      interpretacao: {
        elevado: "A alta empatia pode favorecer uma sintonia profunda, permitindo que seu cônjuge se sinta altamente compreendido e seguro para compartilhar fragilidades.",
        medio: "O nível intermediário sugere sensibilidade aos sentimentos alheios, contudo pode oscilar diante de desgastes cotidianos ou contrariedades pessoais.",
        baixo: "O baixo score indica possíveis dificuldades em ler ou validar as necessidades emocionais do parceiro, abrindo espaço para sentimentos de solidão na relação."
      }
    },
    expressividade: {
      explicacao: "A Expressividade foca na manifestação aberta de afeto, gratidão e admiração pelo parceiro no dia a dia, tanto de forma verbal quanto física ou em público. Avalia o fluxo de elogios e a celebração conjunta de vitórias, elementos determinantes para manter o vínculo afetivo aquecido e neutralizar a sensação de indiferença ou distanciamento.",
      interpretacao: {
        elevado: "A expressividade elevada tende a nutrir constantemente o relacionamento de validação afetiva, ajudando a blindar a parceria contra a sensação de frieza.",
        medio: "O score médio pode indicar demonstrações de afeto pontuais, as quais talvez fiquem restritas a momentos especiais ou dependam do humor do dia a dia.",
        baixo: "A pontuação baixa sugere uma postura reservada, o que pode dar margem a interpretações errôneas de desinteresse ou distanciamento por parte do outro."
      }
    },
    resiliencia: {
      explicacao: "A Resiliência analisa a velocidade de recuperação emocional do indivíduo após desentendimentos ou crises conjugais, mensurando a capacidade de perdoar sem guardar rancores prolongados. Focada no aprendizado com os erros e na manutenção da esperança ativa, define o quanto a relação consegue se reestruturar após passar por turbulências severas.",
      interpretacao: {
        elevado: "Sua alta resiliência sugere prontidão para superar conflitos rapidamente e perdoar, o que pode atuar como um forte regenerador das tensões acumuladas.",
        medio: "A resiliência intermediária indica que, embora busque a superação, o processo de cura emocional após desentendimentos pode demandar tempo e conversas extras.",
        baixo: "O baixo score pode favorecer o acúmulo de mágoas e ressentimentos crônicos, dificultando a superação de crises antigas e gerando ciclos repetitivos de brigas."
      }
    },
    proatividade: {
      explicacao: "A Proatividade avalia a iniciativa individual para enriquecer a relação e antecipar soluções práticas para problemas cotidianos, sem esperar cobranças do cônjuge. Examina o planejamento de surpresas, o engajamento ativo nas tarefas compartilhadas e o esforço voluntário para o crescimento mútuo, mantendo a dinâmica do casamento vibrante.",
      interpretacao: {
        elevado: "A proatividade elevada sugere disposição constante em investir na relação, o que tende a evitar o comodismo e a manter a união revitalizada.",
        medio: "O percentual médio pode indicar que as iniciativas acontecem, mas talvez se concentrem em áreas específicas ou dependam de solicitações do parceiro.",
        baixo: "O baixo score pode gerar uma postura reativa, onde o indivíduo aguarda a iniciativa do parceiro, podendo criar dinâmicas de cobrança ou desânimo."
      }
    },
    espiritualidade: {
      explicacao: "A Espiritualidade examina como valores profundos, integridade pessoal e propósitos de vida orientam o casamento. Não se limita a dogmas religiosos, mas foca no compromisso ético transcendental com o bem do outro e na busca por serenidade interior para não descontar meus problemas no cônjuge.",
      interpretacao: {
        elevado: "Valores elevados aqui sugerem um forte senso de compromisso moral e propósito existencial comum, servindo de norte ético em momentos difíceis.",
        medio: "O resultado médio pode indicar que os valores guiam a conduta em termos gerais, mas podem perder força reguladora em situações de estresse clínico severo.",
        baixo: "O baixo score indica a possibilidade de fragilidade no propósito comum ou desalinhamento de valores essenciais, dificultando consensos profundos."
      }
    },
    financeiro: {
      explicacao: "A Liberdade Financeira avalia o alinhamento do indivíduo com o planejamento, a transparência de gastos, a moderação no consumo e o respeito mútuo nas decisões econômicas do casal. Analisa a maturidade para lidar com dinheiro sem gerar dinâmicas de controle ou conflitos, focando na segurança futura e na cumplicidade nos projetos materiais.",
      interpretacao: {
        elevado: "A pontuação elevada aponta para maturidade financeira e alinhamento prático, reduzindo potenciais brigas ligadas a gastos ou desorganização material.",
        medio: "O nível intermediário sugere que o dinheiro é conversado, mas podem surgir divergências pontuais no que tange a prioridades de consumo ou poupança.",
        baixo: "O baixo score sinaliza riscos de desorganização ou omissões financeiras no relacionamento, o que costuma gerar desconfiança e instabilidade no lar."
      }
    },
    sinergia: {
      explicacao: "A Sinergia avalia a cooperação mútua na divisão de tarefas domésticas, a tomada de decisões compartilhadas e o apoio genuíno aos projetos individuais de cada cônjuge. Analisa a dinâmica de parceria cooperativa em oposição à postura competitiva, garantindo que ambos se sintam apoiados e fortalecidos para progredir juntos de forma equilibrada.",
      interpretacao: {
        elevado: "A sinergia elevada sugere um forte espírito de cooperação prática e apoio mútuo aos projetos de vida, minimizando sentimentos de injustiça ou solidão.",
        medio: "A cooperação média indica boa convivência, mas aponta para eventuais desequilíbrios na divisão de responsabilidades cotidianas ou suporte mútuo.",
        baixo: "O baixo score pode sinalizar uma dinâmica de competição silenciosa ou isolamento de tarefas, gerando sobrecarga física e exaustão emocional em um dos lados."
      }
    },
    sexualidade: {
      explicacao: "A Sexualidade Afetiva mede o carinho físico diário, a intimidade, o diálogo aberto sobre o desejo recíproco e a atenção às necessidades íntimas do parceiro de forma respeitosa e afetuosa. Analisa a habilidade de blindar a cumplicidade física das tensões cotidianas e manter a atração viva por meio de afeto físico continuado e sem pressões.",
      interpretacao: {
        elevado: "A alta pontuação sugere forte conexão afetivo-sexual e diálogo aberto nesta esfera, fortalecendo a intimidade e a cumplicidade íntima do casal.",
        medio: "O percentual médio aponta para uma sexualidade estável, mas que pode sofrer oscilações significativas conforme o cansaço físico ou estresse mental.",
        baixo: "O score baixo indica a possibilidade de barreiras na intimidade ou falta de comunicação íntima, o que tende a esfriar o vínculo afetivo geral."
      }
    },
    palavras_afirmacao: {
      explicacao: "A linguagem de Palavras de Afirmação envolve o uso de expressões verbalais ou escritas de elogio, gratidão, encorajamento e validação para nutrir a autoestima e a segurança do parceiro. Mede o poder das palavras gentis e sinceras para edificar o relacionamento, neutralizando críticas severas que geram sentimentos de inadequação no outro.",
      interpretacao: {
        elevado: "Seu percentual elevado sugere que a validação verbal é muito presente em suas atitudes, possivelmente elevando a segurança emocional do parceiro.",
        medio: "O nível intermediário indica uso moderado de elogios verbais, que podem se concentrar apenas quando há motivos evidentes ou em datas comemorativas.",
        baixo: "O baixo score pode apontar para escassez de elogios, o que talvez crie no parceiro uma sensação de não ser reconhecido ou valorizado no dia a dia."
      }
    },
    tempo_qualidade: {
      explicacao: "A linguagem de Tempo de Qualidade mede a dedicação de atenção plena e exclusiva ao parceiro, engajando-se em atividades compartilhadas significativas e conversas profundas sem distrações externas. Analisa a priorização de momentos íntimos e o foco na conexão real do olhar e do escutar, vitais para manter a proximidade afetiva do casal.",
      interpretacao: {
        elevado: "A pontuação elevada sugere grande valorização de momentos exclusivos a dois, facilitando o estreitamento contínuo de laços de cumplicidade.",
        medio: "O resultado intermediário aponta que o casal passa tempo junto, mas que este tempo pode ser concorrente com telas de celular, tarefas domésticas ou trabalho.",
        baixo: "O score baixo pode indicar que a falta de momentos dedicados está gerando um distanciamento silencioso, sugerindo a necessidade de programar encontros a dois."
      }
    },
    presentes: {
      explicacao: "A linguagem de Receber Presentes avalia o valor emocional atribuído a lembranças físicas, surpresas e mimos tangíveis como símbolos visuais de afeto e lembrança constante. Não se refere ao valor material do objeto, mas à sensibilidade do gesto que demonstra que o parceiro pensou em você e planejou agradá-lo espontaneamente no cotidiano.",
      interpretacao: {
        elevado: "O alto score sugere que pequenos gestos físicos e surpresas materiais representam para você marcos importantes de afeição e atenção continuada.",
        medio: "A pontuação intermediária mostra que surpresas agradam, mas não são a principal forma esperada de demonstração e validação do afeto.",
        baixo: "O baixo score pode indicar que símbolos físicos de afeto têm peso menor no seu vínculo, preferindo outras formas de conexão mais práticas ou verbais."
      }
    },
    atos_servico: {
      explicacao: "A linguagem de Atos de Serviço foca em ações práticas de auxílio e facilitação do dia a dia do parceiro como expressões de cuidado e alívio de cargas. Mede a dedicação em realizar tarefas, cozinhar, organizar ou ajudar voluntariamente nos momentos difíceis, demonstrando que o amor se traduz em atitudes prestativas e suporte operacional.",
      interpretacao: {
        elevado: "A pontuação elevada sugere que ações práticas de cuidado são para você a forma definitiva de se sentir amado(a) ou de demonstrar compromisso ativo.",
        medio: "O resultado médio indica que atos prestativos são valorizados, contudo podem ser vistos como deveres rotineiros se não forem acompanhados de afeto verbal.",
        baixo: "O score baixo pode indicar que tarefas práticas têm pouca relevância emocional direta, priorizando-se o afeto físico ou o diálogo no relacionamento."
      }
    },
    toque_fisico: {
      explicacao: "A linguagem de Toque Físico avalia a importância de gestos corporais de contato — como abraços, mãos dadas, massagens e proximidade corporal constante — para validar a conexão e a segurança afetiva. Analisa a sensibilidade táctil como canal primário de reasseguramento emocional e transmissão de carinho e consolo nos momentos de vulnerabilidade.",
      interpretacao: {
        elevado: "Seu percentual elevado sugere que o contato físico contínuo é fundamental para a sua estabilidade e recarga de energia emocional na vida a dois.",
        medio: "O score intermediário aponta que o toque é apreciado em normalidade, mas pode perder relevância em momentos de cansaço ou discussões acaloradas.",
        baixo: "O score baixo pode indicar menor necessidade de contato corporal constante, sugerindo uma preferência por intimidade restrita a momentos reservados."
      }
    }
  }

  const area = banco[comportamento] || {
    explicacao: "Área comportamental do casal.",
    interpretacao: { elevado: "Tendência a nível elevado.", medio: "Tendência a nível intermediário.", baixo: "Tendência a nível de alerta." }
  }

  return {
    explicacao: area.explicacao,
    interpretacao: area.interpretacao[nivel]
  }
}

export function gerarRelatorioHTML(casal, pctEsposo, pctEsposa, conjuge) {
  let nomeProfissional = "Sérgio Soares"
  let funcaoProfissional = "Psicanalista"

  if (typeof window !== 'undefined') {
    const savedNome = localStorage.getItem('perfil4d_perfil_nome')
    const savedFuncao = localStorage.getItem('perfil4d_perfil_funcao')
    if (savedNome) nomeProfissional = savedNome
    if (savedFuncao) funcaoProfissional = savedFuncao
  }

  const nome = conjuge === 'esposo' ? casal.nome_esposo : casal.nome_esposa
  const corPrincipal = conjuge === 'esposo' ? '#1565C0' : '#6A1B9A'
  const corBg = conjuge === 'esposo' ? '#E8F0FA' : '#F3E8FC'
  const pct = conjuge === 'esposo' ? pctEsposo : pctEsposa
  const data = new Date().toLocaleDateString('pt-BR')

  const disc = BLOCOS.bloco1.map(c => ({
    nome: NOMES[c], pct: pct[c], cor: CORES_DISC[c]
  })).sort((a, b) => b.pct - a.pct)

  function barraIndividual(comportamento) {
    const p1 = pct[comportamento] || 0
    const nivel = classificar(p1)
    const badgeColor = nivel === 'elevado' ? '#2E7D32' : nivel === 'medio' ? '#E65100' : '#C62828'
    const badgeBg = nivel === 'elevado' ? '#E8F5E9' : nivel === 'medio' ? '#FFF8E1' : '#FFEBEE'

    const info = obterDadosArea(comportamento, p1)

    return `
      <div style="background:#fff;border-radius:8px;padding:26px;border:1px solid #e0d8cc;margin-bottom:28px">
        <div style="font-size:16px;font-weight:bold;color:#0D1B3E;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #e8e0d4">${NOMES[comportamento]}</div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <span style="font-size:12px;color:#666;width:80px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${nome}</span>
          <div style="flex:1;background:#e8e0d4;border-radius:4px;height:24px;overflow:hidden">
            <div style="width:${p1}%;height:100%;background:${corPrincipal};border-radius:4px;display:flex;align-items:center;padding-left:8px">
              <span style="font-size:12px;font-weight:bold;color:#fff">${p1}%</span>
            </div>
          </div>
        </div>
        <div style="margin-bottom:14px">
          <span style="display:inline-block;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:bold;text-transform:uppercase;background:${badgeBg};color:${badgeColor}">${nivel === 'elevado' ? 'Elevado' : nivel === 'medio' ? 'Médio' : 'Baixo'} — ${p1}%</span>
        </div>
        <div style="background:#F9FAFB;border-left:3px solid #6B7280;padding:14px;margin-top:14px;border-radius:4px;font-size:13.5px;color:#4B5563;line-height:1.6">
          <strong>Explicação Técnica:</strong> ${info.explicacao}
        </div>
        <div style="background:#F5F7FA;border-left:3px solid ${corPrincipal};padding:14px;margin-top:10px;border-radius:4px;font-size:13.5px;color:#374151;line-height:1.6">
          <strong>Dinâmica no Relacionamento:</strong> ${info.interpretacao}
        </div>
      </div>`
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Perfil 4D — ${nome}</title>
<style>*{box-sizing:border-box;margin:0;padding:0} body{font-family:Arial,sans-serif;background:#F8F4ED;color:#1a1a1a} .page{max-width:800px;margin:0 auto;padding:0 0 60px} p{font-size:15px;line-height:1.85;color:#333;margin-bottom:12px}</style>
</head>
<body>
<div class="page">
<div class="header" style="background:#0D1B3E;padding:50px 40px;text-align:center">
  <h1 style="font-family:Georgia,serif;color:#C9A84C;font-size:44px;letter-spacing:4px;margin-bottom:8px">PERFIL 4D</h1>
  <h2 style="color:#fff;font-size:20px;font-weight:300;margin-bottom:6px">Relatório Individual</h2>
  <h3 style="color:rgba(255,255,255,0.6);font-size:14px;font-weight:300;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px">${nome} · Análise Comportamental</h3>
  <div style="width:60px;height:2px;background:#C9A84C;margin:0 auto"></div>
</div>
<div style="padding:36px 40px;border-bottom:1px solid #e0d8cc">
  <div style="background:${corBg};border-left:4px solid ${corPrincipal};border-radius:0 8px 8px 0;padding:24px 28px">
    <p>${nome}, o Perfil 4D é uma análise comportamental e reflete os seus padrões de agir e reagir no relacionamento hoje. Tudo o que aparece aqui pode mudar.</p>
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
  <div style="font-family:Georgia,serif;font-size:22px;color:#0D1B3E;margin-bottom:24px">Análise das Áreas Comportamentais</div>
  ${[...BLOCOS.bloco1, ...BLOCOS.bloco2, ...BLOCOS.linguagens].map(c => barraIndividual(c)).join('')}
</div>
<div style="background:#060f26;padding:24px;text-align:center">
  <p style="color:rgba(255,255,255,0.3);font-size:13px;line-height:1.8">Perfil 4D · ${funcaoProfissional} ${nomeProfissional} · +55 21 97401-3287<br>© 2026 Perfil 4D · Gerado em ${data}</p>
</div>
</div>
</body>
</html>`
}

export function gerarRelatorioConsultor(casal, pctEsposo, pctEsposa) {
  let nomeProfissional = "Sérgio Soares"
  let funcaoProfissional = "Psicanalista"

  if (typeof window !== 'undefined') {
    const savedNome = localStorage.getItem('perfil4d_perfil_nome')
    const savedFuncao = localStorage.getItem('perfil4d_perfil_funcao')
    if (savedNome) nomeProfissional = savedNome
    if (savedFuncao) funcaoProfissional = savedFuncao
  }

  const nH = casal.nome_esposo.split(' ')[0]
  const nM = casal.nome_esposa.split(' ')[0]

  // === CÁLCULOS DO MOTOR DE REGRAS ===
  const dimensoes = [...BLOCOS.bloco1, ...BLOCOS.bloco2]
  const linguagens = BLOCOS.linguagens

  // Médias Gerais
  const mediaEsposo = (dimensoes.reduce((a, b) => a + pctEsposo[b], 0) / dimensoes.length).toFixed(2)
  const mediaEsposa = (dimensoes.reduce((a, b) => a + pctEsposa[b], 0) / dimensoes.length).toFixed(2)

  // Perfil Principal (Top 2 do Bloco 1)
  const perfEsposo = BLOCOS.bloco1.map(k => ({ k, v: pctEsposo[k] })).sort((a, b) => b.v - a.v).slice(0, 2).map(x => NOMES[x.k].split(' ')[0]).join('-')
  const perfEsposa = BLOCOS.bloco1.map(k => ({ k, v: pctEsposa[k] })).sort((a, b) => b.v - a.v).slice(0, 2).map(x => NOMES[x.k].split(' ')[0]).join('-')

  // Divergências e Tema Central
  let somaDiv = 0
  const dadosDimensoes = dimensoes.map(key => {
    const div = Math.abs(pctEsposo[key] - pctEsposa[key])
    somaDiv += div
    return { key, nome: NOMES[key], esposo: pctEsposo[key], esposa: pctEsposa[key], div }
  }).sort((a, b) => b.div - a.div)

  const divergenciaMedia = (somaDiv / dimensoes.length).toFixed(2)
  const diagnostico = divergenciaMedia > 20 ? "Atenção Crítica" : divergenciaMedia > 12 ? "Atenção Necessária" : "Conexão Estável"

  const temaCentral = dadosDimensoes[0]
  const context1 = dadosDimensoes[1]
  const context2 = dadosDimensoes[2]

  const nomeMenorTema = temaCentral.esposo < temaCentral.esposa ? nH : nM
  const nomeMaiorTema = temaCentral.esposo > temaCentral.esposa ? nH : nM
  const valMenorTema = Math.min(temaCentral.esposo, temaCentral.esposa)
  const valMaiorTema = Math.max(temaCentral.esposo, temaCentral.esposa)

  // Linguagens e Âncora
  const domEsposo = linguagens.reduce((a, b) => pctEsposo[a] > pctEsposo[b] ? a : b)
  const domEsposa = linguagens.reduce((a, b) => pctEsposa[a] > pctEsposa[b] ? a : b)

  const dadosLinguagens = linguagens.map(key => {
    let label = NOMES[key]
    if (key === domEsposo) label += ' *H'
    if (key === domEsposa) label += ' *M'
    return { key, nome: label, esposo: pctEsposo[key], esposa: pctEsposa[key] }
  }).sort((a, b) => (b.esposo + b.esposa) - (a.esposo + a.esposa))

  // Helpers HTML
  const alertIcon = (val) => val < 50 ? ' <span style="color:#D32F2F;font-weight:bold">⚠️</span>' : ''
  const divBadge = (key) => key === temaCentral.key ? ' <span style="background:#D32F2F;color:#fff;padding:2px 5px;border-radius:3px;font-size:10px;margin-left:8px;font-weight:bold">DIV</span>' : ''

  const tableRowsLinguagens = dadosLinguagens.map(d => `
    <tr>
      <td style="padding:6px 14px;border-bottom:1px solid #eee;font-size:13px">${d.nome}</td>
      <td style="padding:6px 14px;border-bottom:1px solid #eee;color:#6A1B9A;font-weight:bold;font-size:13px">${d.esposa}%</td>
      <td style="padding:6px 14px;border-bottom:1px solid #eee;color:#1565C0;font-weight:bold;font-size:13px">${d.esposo}%</td>
    </tr>
  `).join('')

  const tableRowsDimensoes = dadosDimensoes.map(d => `
    <tr>
      <td style="padding:6px 14px;border-bottom:1px solid #eee;font-size:13px">${d.nome} — ${d.div.toFixed(2)}%${divBadge(d.key)}</td>
      <td style="padding:6px 14px;border-bottom:1px solid #eee;color:#6A1B9A;font-size:13px">${d.esposa}%${alertIcon(d.esposa)}</td>
      <td style="padding:6px 14px;border-bottom:1px solid #eee;color:#1565C0;font-size:13px">${d.esposo}%${alertIcon(d.esposo)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Roteiro de Devolutiva — ${nH} & ${nM}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;background:#fff;color:#111;padding:30px}
  .container{max-width:800px;margin:0 auto}
  .header{text-align:center;margin-bottom:30px}
  h1{font-size:20px;text-transform:uppercase;margin-bottom:5px}
  h2{font-size:14px;color:#555;margin-bottom:20px}
  .box-stats{display:flex;justify-content:center;gap:20px;font-size:13px;margin-bottom:20px}
  .stat-item{background:#f5f5f5;padding:8px 16px;border-radius:4px;border-left:3px solid #ccc}
  .stat-item.f{border-color:#6A1B9A}
  .stat-item.m{border-color:#1565C0}
  .summary{font-size:14px;background:#f9f9f9;padding:12px;border:1px solid #eee;text-align:center;margin-bottom:30px}
  .cola-rapida{background:#fff3e0;border:1px solid #ffe0b2;padding:20px;border-radius:4px;margin-bottom:30px}
  .cola-rapida h3{color:#e65100;font-size:14px;margin-bottom:10px}
  h4{font-size:15px;margin:20px 0 10px 0;background:#eee;padding:8px;border-left:4px solid #333}
  p, li{font-size:13.5px;line-height:1.6;margin-bottom:10px;color:#333}
  table{width:100%;border-collapse:collapse;margin-bottom:20px}
  th{background:#e8e0d4;text-align:left;padding:8px 14px;font-size:12px;color:#0D1B3E}
  .section-title{font-family:Georgia,serif;font-size:18px;color:#0D1B3E;border-bottom:2px solid #C9A84C;padding-bottom:5px;margin:30px 0 15px 0}
</style>
</head>
<body>
<div class="container">

  <div class="header">
    <h1>ROTEIRO DE DEVOLUTIVA — SESSÃO ONLINE</h1>
    <h2>Perfil 4D — Análise Comportamental & Linguagens do Amor</h2>
    <div class="box-stats">
      <div class="stat-item f"><strong style="color:#6A1B9A">${nM}</strong> | ${mediaEsposa}% | ${perfEsposa}</div>
      <div class="stat-item m"><strong style="color:#1565C0">${nH}</strong> | ${mediaEsposo}% | ${perfEsposo}</div>
    </div>
    <div class="summary">
      <strong>Diagnóstico:</strong> ${diagnostico} &nbsp;|&nbsp; 
      <strong>Divergência Média:</strong> ${divergenciaMedia}% &nbsp;|&nbsp; 
      <strong>Tema Central:</strong> ${temaCentral.nome}
    </div>
  </div>

  <div class="cola-rapida">
    <h3>🎯 COLA RÁPIDA — CONSULTA DURANTE A SESSÃO</h3>
    <p><strong>TEMA CENTRAL: ${temaCentral.nome} (${temaCentral.div.toFixed(2)}%) — ${nM} ${temaCentral.esposa}% | ${nH} ${temaCentral.esposo}%</strong><br>
    Maior divergência absoluta do casal E fator explicativo de quase todas as outras divergências. A métrica de ${temaCentral.nome} de ${nomeMenorTema} (${valMenorTema}%) é o elo perdido: quando esta dimensão falha, cria-se um ciclo de desgaste estrutural para ${nomeMaiorTema}.</p>
    
    <p><strong>3 PROTOCOLOS DE AÇÃO:</strong></p>
    <ul style="margin-left:20px">
      <li><strong>Protocolo de ${temaCentral.nome}:</strong> ${nomeMenorTema} estabelece um ritual estruturado de 48h para processar crises sem silêncio punitivo.</li>
      <li><strong>Expressividade Ativa:</strong> 1 gesto afetivo por dia de ${nomeMenorTema}, sem esperar o conflito resolver.</li>
      <li><strong>Alinhamento Prático:</strong> ${nomeMaiorTema} lidera uma conversa semanal de 30 minutos focada na gestão da rotina e finanças.</li>
    </ul>
    
    <p style="margin-top:15px;font-size:12px;color:#e65100"><strong>SE ${nomeMenorTema.toUpperCase()} SE FECHAR NA SESSÃO:</strong> não forçar. "Não precisa responder agora. Você pode só escutar."<br>
    <strong>SE ${nomeMaiorTema.toUpperCase()} PARECER CANSADO(A):</strong> "Carregar a estrutura sozinho(a) tem peso. É exatamente isso que viemos trabalhar."</p>
  </div>

  <h3 class="section-title">TELA ÚNICA — Compartilhar nas Fases 2 e 3</h3>
  
  <table>
    <thead><tr><th colspan="3">Bloco A — As 5 Linguagens do Amor</th></tr></thead>
    <tbody>${tableRowsLinguagens}</tbody>
  </table>

  <table>
    <thead><tr><th colspan="3">Bloco B — Dimensões-Chave da Sessão</th></tr></thead>
    <tbody>${tableRowsDimensoes}</tbody>
  </table>

  <h3 class="section-title">FASE 1 — ACOLHIMENTO (7 min)</h3>
  <p><strong>💻 ONLINE: CÂMERA ligada, SEM compartilhar tela.</strong> Criar segurança máxima antes de expor os dados.</p>
  <p><strong>Script de Abertura:</strong> "Obrigado por estarem aqui. Responderam com honestidade, e isso já é o passo mais importante. O que vamos explorar hoje não é um diagnóstico de problemas — é um mapa. Mapas mostram onde estamos, mas mais importante, mostram caminhos."</p>
  <p><strong>Perguntas de Aquecimento:</strong><br>
  1. O que cada um sentiu ao responder? Teve algo que surpreendeu?<br>
  2. O que vocês sentem que está funcionando bem no relacionamento hoje?<br>
  3. Como é para vocês depois de uma discussão — o que costuma acontecer?<br>
  4. O que você mais admira na forma como o(a) parceiro(a) demonstra que se importa?</p>

  <h3 class="section-title">FASE 2 — LINGUAGENS DO AMOR (8 min)</h3>
  <p><strong>💻 ONLINE: COMPARTILHE A TELA ÚNICA.</strong></p>
  <p>Analisar a dinâmica de entrega e recebimento. Notar que a linguagem dominante de ${nH} é ${NOMES[domEsposo]} e a de ${nM} é ${NOMES[domEsposa]}.</p>
  <p><strong>Pergunta de condução:</strong> "${nomeMenorTema}, depois de um momento difícil, o que acontece com sua capacidade de se aproximar e falar na linguagem de ${nomeMaiorTema}?" Explicar que a divergência não é falta de amor, mas um canal que se fecha sob pressão.</p>

  <h3 class="section-title">FASE 3 — PERFIS E DIVERGÊNCIAS (10 min)</h3>
  <p><strong>Script de Apresentação:</strong> "O que eu vejo neste mapa não é incompatibilidade. É um casal com forças reais que estão sendo contidas por um ponto específico."</p>
  <h4>Tema Central — ${temaCentral.nome} (${temaCentral.div.toFixed(2)}%)</h4>
  <p>Por que é o tema central: O score de ${valMenorTema}% de ${nomeMenorTema} afeta diretamente as demais áreas. <strong>Pergunta:</strong> "Quando vocês passam por uma crise focada em ${temaCentral.nome}, como ${nomeMaiorTema} vive esse período de espera?"</p>
  <h4>Contexto 1 — ${context1.nome} (${context1.div.toFixed(2)}%)</h4>
  <p>Como mediar a diferença entre os ${context1.esposo}% de ${nH} e os ${context1.esposa}% de ${nM}. Integrar com a regra dos gestos diários.</p>
  <h4>Contexto 2 — ${context2.nome} (${context2.div.toFixed(2)}%)</h4>
  <p>Explorar o impacto desta diferença estrutural na rotina do casal e introduzir o protocolo de alinhamento prático liderado por ${nomeMaiorTema}.</p>

  <h3 class="section-title">FASE 4 — ENCERRAMENTO (5 min)</h3>
  <p><strong>💻 ONLINE: FECHE o compartilhamento. CÂMERA.</strong></p>
  <p><strong>Frase Personalizada:</strong> "${nM} e ${nH}, vocês têm compromisso real. O que esse mapa revela é que há um ponto específico que, quando trabalhado, vai liberar o afeto que já está aí. ${nomeMenorTema}, a sua força pode ser usada para sustentar essa mudança. É isso que ${nomeMaiorTema} mais precisa sentir."</p>
  <p><strong>CTA — Próxima Sessão:</strong> "Exercício para casa separados: cada um escreve em 3 linhas: 'Qual é o momento do nosso relacionamento em que eu me senti mais amado(a)?' Não mostrem um ao outro."</p>
  <p style="text-align:center;margin-top:40px;font-size:11px;color:#aaa">Perfil 4D | Roteiro Dinâmico | ${funcaoProfissional} ${nomeProfissional} | © 2026</p>
</div>
</body>
</html>`
}