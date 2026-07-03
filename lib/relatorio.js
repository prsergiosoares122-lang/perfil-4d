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
        medio: "O score intermediário aponta que o toque é apreciado em momentos normais, mas pode perder relevância em momentos de cansaço ou discussões acaloradas.",
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
  const nomePartner = conjuge === 'esposo' ? casal.nome_esposa : casal.nome_esposo
  const corPrincipal = conjuge === 'esposo' ? '#1565C0' : '#6A1B9A'
  const corBg = conjuge === 'esposo' ? '#E8F0FA' : '#F3E8FC'
  const pct = conjuge === 'esposo' ? pctEsposo : pctEsposa
  const pctOther = conjuge === 'esposo' ? pctEsposa : pctEsposo
  const data = new Date().toLocaleDateString('pt-BR')

  const disc = BLOCOS.bloco1.map(c => ({
    nome: NOMES[c], pct: pct[c], cor: CORES_DISC[c]
  })).sort((a,b) => b.pct - a.pct)

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
  <div style="font-family:Georgia,serif;font-size:22px;color:#0D1B3E;margin-bottom:24px">Análise das Áreas Comportamentais e Linguagens do Amor</div>
  ${[...BLOCOS.bloco1, ...BLOCOS.bloco2, ...BLOCOS.linguagens].map(c => barraIndividual(c)).join('')}
</div>

<div id="psicanalista" style="padding:40px;background:#0D1B3E;text-align:center">
  <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;margin-bottom:12px">Próximo passo recomendado</div>
  <h2 style="font-family:Georgia,serif;color:#fff;font-size:26px;margin-bottom:20px">${funcaoProfissional} ${nomeProfissional}</h2>
  <div style="background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.35);border-radius:10px;padding:22px 24px;max-width:600px;margin:0 auto 28px;text-align:left">
    <p style="color:#C9A84C;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Orientação clínica</p>
    <p style="color:rgba(255,255,255,0.9);font-size:15px;line-height:1.85;margin-bottom:0">Diante do quadro apresentado nesta análise, a recomendação mais aconselhada é marcar <strong style="color:#C9A84C">uma sessão de terapia para melhor entender o quadro de vocês</strong> — com acolhimento, sem julgamentos e com direcionamento profissional.</p>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:600px;margin:0 auto 28px;text-align:left">
    <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:20px">
      <p style="color:#C9A84C;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Quem é ${nomeProfissional}</p>
      <p style="color:rgba(255,255,255,0.75);font-size:14px;line-height:1.8;margin:0">${funcaoProfissional} clínico especializado em relações conjugais e dinâmicas familiares. Com anos de atuação dedicados à escuta e ao cuidado de casais, desenvolveu uma abordagem própria que une rigor e acolhimento humano.</p>
    </div>
    <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:20px">
      <p style="color:#C9A84C;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Atendimento e acompanhamento</p>
      <p style="color:rgba(255,255,255,0.75);font-size:14px;line-height:1.8;margin:0">Para orientação personalizada, leitura aprofundada do casal e direcionamento terapêutico, toque no botão abaixo e envie a sua mensagem pelo WhatsApp.</p>
    </div>
  </div>
  <a href="https://wa.me/5521974013287?text=Desejo%20uma%20sess%C3%A3o%20de%20terapia%20para%20melhor%20entender%20nossa%20situa%C3%A7%C3%A3o" style="display:block;background:#C9A84C;color:#0D1B3E;text-align:center;padding:18px 28px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;max-width:420px;margin:0 auto 8px">Falar com o ${funcaoProfissional} ${nomeProfissional}</a>
  <div style="color:rgba(255,255,255,0.4);font-size:13px;text-align:center">Atendimento online e presencial</div>
</div>

<div style="background:#060f26;padding:24px;text-align:center;border-top:1px solid rgba(201,168,76,.2)">
  <p style="color:rgba(255,255,255,0.3);font-size:13px;line-height:1.8">Perfil 4D · ${funcaoProfissional} ${nomeProfissional} · ${funcaoProfissional}<br>+55 21 97401-3287 · Atendimento online e presencial<br>© 2026 Perfil 4D · Gerado em ${data}</p>
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

  const data = new Date().toLocaleDateString('pt-BR')
  const todos = [...BLOCOS.bloco1, ...BLOCOS.bloco2, ...BLOCOS.linguagens]

  const barras = todos.map(c => `
    <div style="margin-bottom:20px;background:#fff;border-radius:8px;padding:18px;border:1px solid #e0d8cc">
      <div style="font-size:14px;font-weight:bold;color:#0D1B3E;margin-bottom:10px">${NOMES[c]}</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <span style="font-size:12px;color:#666;width:70px">${casal.nome_esposo}</span>
        <div style="flex:1;background:#e8e0d4;border-radius:4px;height:22px;overflow:hidden">
          <div style="width:${pctEsposo[c]}%;height:100%;background:#1565C0;display:flex;align-items:center;padding-left:8px">
            <span style="font-size:11px;font-weight:bold;color:#fff">${pctEsposo[c]}%</span>
          </div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:12px;color:#666;width:70px">${casal.nome_esposa}</span>
        <div style="flex:1;background:#e8e0d4;border-radius:4px;height:22px;overflow:hidden">
          <div style="width:${pctEsposa[c]}%;height:100%;background:#6A1B9A;display:flex;align-items:center;padding-left:8px">
            <span style="font-size:11px;font-weight:bold;color:#fff">${pctEsposa[c]}%</span>
          </div>
        </div>
      </div>
      <div style="margin-top:8px;font-size:12px;color:#888">Distância: ${Math.abs(pctEsposo[c]-pctEsposa[c]).toFixed(0)} pontos</div>
    </div>`).join('')

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Perfil 4D — Consultor</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;background:#F8F4ED}@media print{body{background:#fff}}</style>
  </head><body>
  <div style="max-width:800px;margin:0 auto;padding:0 0 60px">
  <div style="background:#0D1B3E;padding:50px 40px;text-align:center">
    <h1 style="font-family:Georgia,serif;color:#C9A84C;font-size:40px;letter-spacing:4px;margin-bottom:8px">PERFIL 4D</h1>
    <h2 style="color:#fff;font-size:18px;font-weight:300;margin-bottom:6px">Relatório Consultor</h2>
    <h3 style="color:rgba(255,255,255,0.6);font-size:14px;font-weight:300;letter-spacing:2px;text-transform:uppercase">${casal.nome_esposo} & ${casal.nome_esposa}</h3>
  </div>
  <div style="padding:20px 28px;background:#E8F5E9;border-left:4px solid #2E7D32;margin:0">
    <p style="font-size:13px;color:#1B5E20;line-height:1.7"><strong>Nota metodológica:</strong> Os resultados refletem autopercepção comportamental do momento atual. Não representam diagnóstico clínico. Comportamento é dinâmico. Recomenda-se reaplicar após 6 meses.</p>
  </div>
  <div style="padding:36px 40px">
    <div style="font-family:Georgia,serif;font-size:22px;color:#0D1B3E;margin-bottom:8px">Análise comparativa completa</div>
    <div style="display:flex;gap:16px;font-size:13px;color:#555;margin-bottom:24px">
      <span><span style="width:12px;height:12px;border-radius:50%;background:#1565C0;display:inline-block;margin-right:4px;vertical-align:middle"></span>${casal.nome_esposo}</span>
      <span><span style="width:12px;height:12px;border-radius:50%;background:#6A1B9A;display:inline-block;margin-right:4px;vertical-align:middle"></span>${casal.nome_esposa}</span>
    </div>
    ${barras}
  </div>
  <div style="background:#060f26;padding:24px;text-align:center">
    <p style="color:rgba(255,255,255,0.3);font-size:13px;line-height:1.8">Perfil 4D · ${funcaoProfissional} ${nomeProfissional} · +55 21 97401-3287<br>© 2026 · Gerado em ${data}</p>
  </div>
  </div></body></html>`
}
