import { NOMES } from './perguntas'

// Banco de dados de comportamentos com textos customizados para cada fase
const COMPORTAMENTOS_DATA = {
  comunicativo: {
    nome: "Comunicação Assertiva",
    fase1: {
      conceito: "A autopercepção da fala e do silêncio. Comunicação saudável inicia no monitoramento de impulsos e reações imediatas.",
      comoHoje: "Tendência a usar tons ásperos ou a se calar completamente durante desentendimentos, guardando mágoas.",
      visao: "Diálogos calmos, claros e sem ruídos, onde ambos se expressam de forma livre e segura.",
      acoes: [
        "Monitore seu tom de voz em conversas cotidianas hoje e perceba se soa defensivo(a).",
        "Anote se você sentiu o impulso de interromper seu parceiro hoje enquanto ele(a) falava.",
        "Identifique um assunto que você evitou hoje por medo de gerar discussão."
      ]
    },
    fase2: {
      conceito: "O ajuste ativo da fala. Substituição de acusações genéricas ('Você sempre faz isso') por declarações de vulnerabilidade.",
      comoHoje: "Uso de críticas reativas que colocam o cônjuge imediatamente na defensiva.",
      visao: "Expressar sentimentos sem atacar, focando na construção de acordos mútuos.",
      acoes: [
        "Inicie uma conversa hoje usando a frase: 'Eu me sinto... quando acontece...' em vez de apontar dedos.",
        "Se notar qualquer aspereza na sua voz hoje, pare imediatamente e peça desculpas.",
        "Ouça um desabafo do seu cônjuge sem oferecer conselhos ou soluções imediatas, apenas acolha."
      ]
    },
    fase3: {
      conceito: "A consolidação do diálogo. Rituais permanentes que impedem o acúmulo de ruídos e estresse na relação.",
      comoHoje: "Conversas profundas ocorrem apenas em momentos de crise extrema.",
      visao: "Um canal de comunicação robusto, contínuo e integrado ao dia a dia do casal.",
      acoes: [
        "Estabeleça um check-in diário de 10 minutos de diálogo exclusivo, sem nenhuma tela por perto.",
        "Defina com seu parceiro uma palavra-chave de segurança para interromper conversas que comecem a se inflamar.",
        "Compartilhe de forma vulnerável com o outro um aprendizado profundo que teve sobre si mesmo esta semana."
      ]
    }
  },
  socializante: {
    nome: "Conexão Social Equilibrada",
    fase1: {
      conceito: "A influência do círculo externo. Entender se o convívio social drena ou enriquece a relação.",
      comoHoje: "Dificuldade em equilibrar momentos a dois com a vida social externa, gerando isolamento ou dispersão.",
      visao: "Relações externas saudáveis que trazem novidade ao casal sem invadir a intimidade.",
      acoes: [
        "Observe se as visitas de familiares ou amigos trazem harmonia ou estresse direto para sua relação hoje.",
        "Identifique se vocês estão se isolando excessivamente da comunidade ao redor.",
        "Reflita sobre como as opiniões externas afetam as decisões internas do casal."
      ]
    },
    fase2: {
      conceito: "Ajustando fronteiras. Estabelecer limites claros com amigos e familiares, fortalecendo a blindagem do casal.",
      comoHoje: "Permissão para que palpites externos interfiram na dinâmica conjugal diária.",
      visao: "Fronteiras consolidadas onde o relacionamento é sempre a prioridade máxima.",
      acoes: [
        "Alinhe com seu cônjuge um convite social que vocês farão juntos esta semana, decidindo as regras de horário juntos.",
        "Diga de forma gentil, mas firme, um limite sobre assuntos do casal para um familiar intrometido.",
        "Escolha uma atividade social externa onde o foco principal ainda seja a parceria de vocês."
      ]
    },
    fase3: {
      conceito: "Integração comunitária madura. O casal transita socialmente sem comprometer a conexão e os rituais íntimos.",
      comoHoje: "Desgaste ou ciúmes associados a saídas sociais ou atenção dividida com terceiros.",
      visao: "Convivência social harmônica, na qual o casal funciona como um porto seguro e parceiro unificado.",
      acoes: [
        "Planejem juntos uma recepção simples em casa para amigos, cooperando na organização.",
        "Criem uma tradição de casal que seja preservada mesmo durante eventos familiares maiores.",
        "Faça um elogio sincero e público ao seu parceiro(a) durante um encontro com amigos."
      ]
    }
  },
  analitico: {
    nome: "Pausa e Planejamento Racional",
    fase1: {
      conceito: "Racionalização de reações. Entender o valor de desacelerar as respostas emocionais para evitar impulsos destrutivos.",
      comoHoje: "Tendência a reagir impulsivamente em momentos de crise, decidindo sem medir as consequências.",
      visao: "Tomada de decisão prudente, reflexiva e com respeito aos sentimentos de ambos.",
      acoes: [
        "Observe hoje se você tem o hábito de tomar decisões rápidas sob pressão emocional.",
        "Antes de responder a qualquer provocação hoje, force uma pausa de 10 segundos em silêncio.",
        "Identifique uma área onde faltou planejamento do casal nesta última semana."
      ]
    },
    fase2: {
      conceito: "Ajuste na reatividade. Substituir a reatividade impulsiva por uma análise compartilhada de dados e sentimentos.",
      comoHoje: "Desentendimentos recorrentes motivados por atitudes precipitadas ou falta de clareza.",
      visao: "Uso da lógica e da temperança para organizar as prioridades e a convivência cotidiana.",
      acoes: [
        "Monte uma lista simples com os prós e contras de uma decisão pendente do casal e discuta de forma calma.",
        "Quando surgir um problema hoje, em vez de apontar culpados, ajude a documentar os fatos objetivos.",
        "Defina um teto máximo de gastos diários simples que não exija comunicação prévia."
      ]
    },
    fase3: {
      conceito: "Consolidação de processos. Estruturar a vida do casal com regras claras que evitam surpresas e trazem paz.",
      comoHoje: "Sensação de instabilidade constante devido à falta de rotinas claras e planejadas.",
      visao: "Rotina organizada que proporciona segurança psicológica e previsibilidade saudável.",
      acoes: [
        "Criem uma agenda compartilhada simples com as atividades fixas da semana de ambos.",
        "Estruturem juntos um plano simples de metas familiares para os próximos três meses.",
        "Dediquem 15 minutos para organizar e revisar as pendências operacionais da casa sem discussões afetivas."
      ]
    }
  },
  determinante: {
    nome: "Firmeza, Resiliência e Liderança",
    fase1: {
      conceito: "A força da constância. Compreender se há desistência fácil diante de crises ou imposição unilateral de desejos.",
      comoHoje: "Oscilação de atitudes sob estresse conjugal ou tendência a controlar a relação de forma rígida.",
      visao: "Liderança equilibrada que protege o relacionamento e divide responsabilidades sem dominar.",
      acoes: [
        "Observe se você tem a inclinação de impor suas vontades sem ouvir os desejos do outro.",
        "Monitore se você sente vontade de desistir ou se afastar emocionalmente diante de barreiras bobas.",
        "Reflita sobre como você lida com a quebra de expectativas no dia a dia."
      ]
    },
    fase2: {
      conceito: "Ajuste na determinação. Direcionar a energia de liderança para a superação de problemas conjuntos, em vez de competir.",
      comoHoje: "Disputas de poder que transformam a vida a dois em um jogo de quem ganha ou perde.",
      visao: "Parceria onde ambos tomam rédeas e se apoiam mutuamente nas decisões difíceis.",
      acoes: [
        "Ceda intencionalmente em uma decisão secundária hoje, permitindo que a escolha do outro prevaleça com alegria.",
        "Demonstre firmeza em manter um compromisso que fez com seu cônjuge, mesmo estando cansado(a).",
        "Assuma uma tarefa de responsabilidade compartilhada que normalmente sobrecarrega seu parceiro."
      ]
    },
    fase3: {
      conceito: "Consolidação do porto seguro. O casal consolida um pacto de firmeza e estabilidade, sabendo que podem contar um com o outro.",
      comoHoje: "Instabilidade de atitudes que cria desconfiança ou sobrecarga em um dos cônjuges.",
      visao: "Um relacionamento resiliente, protegido por acordos firmes e duradouros.",
      acoes: [
        "Escreva um compromisso de três linhas declarando seu suporte incondicional ao outro nas próximas semanas.",
        "Estabeleça um pacto claro de resolução rápida de divergências maiores.",
        "Celebrem juntos a superação de uma barreira recente que vocês enfrentaram de mãos dadas."
      ]
    }
  },
  empatia: {
    nome: "Empatia Acolhedora",
    fase1: {
      conceito: "A sintonia emocional silenciosa. Entrar no mundo interno do outro sem julgamentos prévios.",
      comoHoje: "Desatenção aos sentimentos do parceiro, focando apenas na própria interpretação dos acontecimentos.",
      visao: "Ambiente conjugal de acolhimento mútuo, livre de julgamentos defensivos.",
      acoes: [
        "Observe as expressões corporais do seu cônjuge hoje e tente identificar o humor dele(a) sem perguntar.",
        "Evite julgar, corrigir ou interromper quando seu parceiro estiver contando um aborrecimento.",
        "Force-se a pensar nos sentimentos do outro antes de iniciar uma cobrança doméstica hoje."
      ]
    },
    fase2: {
      conceito: "Validação ativa do outro. Prática consciente de reconhecer a dor e o cansaço do parceiro.",
      comoHoje: "Minimização dos sentimentos do outro ('Você está exagerando') gerando solidão emocional.",
      visao: "Parceria afetuosa que atua como o principal suporte de cura e descompressão do estresse.",
      acoes: [
        "Valide uma queixa do seu parceiro hoje dizendo: 'Eu entendo perfeitamente o seu cansaço/tristeza'.",
        "Pergunte ativamente: 'O que eu posso fazer para aliviar o peso do seu dia hoje?' e execute.",
        "Envie uma mensagem carinhosa de apoio no meio do dia sabendo que o outro está sob tensão."
      ]
    },
    fase3: {
      conceito: "Conexão empática incondicional. A empatia torna-se um ritual natural, construindo uma blindagem emocional.",
      comoHoje: "Ausência de validação diária, fazendo com que o outro guarde dores para si.",
      visao: "Sintonia profunda e escuta ativa fluida no dia a dia do casamento.",
      acoes: [
        "Criem um ritual semanal onde cada um compartilha sua maior vulnerabilidade da semana com acolhimento total.",
        "Substitua reações defensivas por gestos de aproximação física (abraço, toque) nos momentos de tensão.",
        "Escreva uma carta de gratidão destacando a sensibilidade e o valor da presença dele(a) em sua vida."
      ]
    }
  },
  expressividade: {
    nome: "Expressão Afetiva e Validação",
    fase1: {
      conceito: "O valor da manifestação pública e privada de afeto. Perceber a frequência dos elogios e carinhos.",
      comoHoje: "Postura reservada e economia de elogios, criando uma falsa sensação de indiferença na relação.",
      visao: "Clima afetivo aquecido e seguro por meio de demonstrações claras e sinceras de carinho.",
      acoes: [
        "Anote quantas vezes você elogiou genuinamente seu cônjuge hoje.",
        "Observe se você se sente constrangido(a) ao demonstrar afeto físico em público ou na frente de familiares.",
        "Reflita se sua infância teve demonstrações explícitas de afeto e como isso afeta você hoje."
      ]
    },
    fase2: {
      conceito: "Ajuste na validação ativa. Criar o hábito intencional de expressar amor por múltiplos canais cotidianos.",
      comoHoje: "Demonstrações afetivas raras, restritas apenas a datas comemorativas.",
      visao: "Relacionamento alimentado por elogios constantes e expressões autênticas de admiração.",
      acoes: [
        "Elogie uma característica física ou de caráter do seu cônjuge logo pela manhã.",
        "Faça uma demonstração física de carinho em público hoje (mãos dadas ou abraço espontâneo).",
        "Fale para alguém da família ou amigo o quanto você tem orgulho de uma atitude do seu cônjuge, na presença dele(a)."
      ]
    },
    fase3: {
      conceito: "Consolidação da cultura do afeto. A expressão verbal e física do amor se torna a identidade estável do casal.",
      comoHoje: "Sensação de distanciamento gerada pelo silêncio ou falta de carinho espontâneo.",
      visao: "Um lar inundado de palavras gentis, validação mútua e toque afetivo livre.",
      acoes: [
        "Criem o ritual do 'Elogio do Dia' antes de dormirem, listando algo bom do outro.",
        "Escreva e esconda um pequeno bilhete de amor nas coisas dele(a) para ser achado no meio do dia.",
        "Dedique um tempo para olhar nos olhos do seu parceiro em silêncio por 1 minuto completo, expressando carinho apenas no olhar."
      ]
    }
  },
  resiliencia: {
    nome: "Regeneração Emocional e Perdão",
    fase1: {
      conceito: "O tempo de cura. Monitorar quanto tempo você leva para restabelecer a conexão após uma briga.",
      comoHoje: "Acúmulo de mágoas e ressentimentos antigos que voltam à tona a cada nova discussão.",
      visao: "Capacidade de curar feridas emocionais rapidamente, voltando a sorrir juntos no mesmo dia.",
      acoes: [
        "Monitore sua mente hoje para perceber se você fica remoendo ressentimentos de brigas passadas.",
        "Identifique qual assunto gera em você a maior barreira para perdoar.",
        "Observe se você usa o silêncio punitivo como arma após um desentendimento."
      ]
    },
    fase2: {
      conceito: "Desarmando o rancor. Prática ativa de acalmar os ânimos e estender a bandeira branca sem orgulho.",
      comoHoje: "Prolongamento de tensões por dias, gerando um clima gelado e tenso na casa.",
      visao: "Diálogo reconstrutivo e liberação sincera de perdão, zerando as pendências do dia.",
      acoes: [
        "Após um desentendimento leve hoje, dê o primeiro passo para quebrar o gelo em até 2 horas.",
        "Escreva em um papel um ressentimento antigo que você guarda e queime/rasgue-o como ato simbólico de liberação.",
        "Peça desculpas sinceras por sua parcela de responsabilidade em um atrito recente."
      ]
    },
    fase3: {
      conceito: "Consolidação da regeneração. Acordos de perdão rápido que impedem que novos atritos virem mágoas crônicas.",
      comoHoje: "Ciclos repetitivos de conflito sem resolução definitiva.",
      visao: "Um relacionamento resiliente que extrai aprendizado das crises e se fortalece.",
      acoes: [
        "Definam a regra de 'Nunca dormir brigados', conversando ou firmando um pacto de trégua antes de deitar.",
        "Criem um ritual de reconciliação físico (como um abraço longo e silencioso) para encerrar discussões.",
        "Façam uma lista de aprendizados gerados pela última crise que superaram juntos."
      ]
    }
  },
  proatividade: {
    nome: "Iniciativa e Investimento Conjugal",
    fase1: {
      conceito: "A atitude ativa vs reativa. Observar se você investe na relação ou apenas espera o outro cobrar.",
      comoHoje: "Postura de acomodação ou passividade, gerando sobrecarga de planejamento no cônjuge.",
      visao: "União dinâmica, onde ambos buscam enriquecer e cuidar ativamente do casamento voluntariamente.",
      acoes: [
        "Identifique uma pendência do casal que você está adiando e que sobrecarrega o outro hoje.",
        "Observe se você tem a tendência de esperar seu cônjuge tomar todas as decisões de passeios ou programas.",
        "Anote se a rotina engoliu a iniciativa de surpreender o parceiro(a)."
      ]
    },
    fase2: {
      conceito: "Iniciativa prática. Agir intencionalmente para resolver pendências e criar momentos especiais espontâneos.",
      comoHoje: "Investimento apenas sob cobrança constante, gerando frustração no parceiro.",
      visao: "Parceria equilibrada com surpresas constantes e atitude realizadora de ambos os lados.",
      acoes: [
        "Resolva uma pendência doméstica ou administrativa hoje sem que o outro precise pedir.",
        "Planeje e execute uma surpresa simples (comida favorita, passeio rápido) para hoje à noite.",
        "Proponha uma conversa importante sobre melhorias no relacionamento por iniciativa própria."
      ]
    },
    fase3: {
      conceito: "Cultura de investimento constante. A proatividade torna-se um pilar natural de manutenção da paixão e do lar.",
      comoHoje: "Sensação de que apenas um dos cônjuges luta ou investe no crescimento da relação.",
      visao: "Casamento ativo com crescimento mútuo e renovação constante de energia afetiva.",
      acoes: [
        "Criem o 'Dia do Investimento', onde alternam quinzenalmente quem planeja um encontro surpresa do casal.",
        "Estabeleçam uma rotina de cuidado mútuo preventivo das obrigações da casa.",
        "Planeje um projeto ou curso de desenvolvimento pessoal para fazerem juntos nos próximos meses."
      ]
    }
  },
  espiritualidade: {
    nome: "Propósito de Vida e Valores Transcendentes",
    fase1: {
      conceito: "Alinhamento ético profundo. Compreender os valores intangíveis que sustentam a sua união conjugal.",
      comoHoje: "Desconexão de valores existenciais, lidando com o casamento apenas no nível prático ou mercantil.",
      visao: "Um relacionamento guiado por um forte compromisso moral e propósito existencial unificado.",
      acoes: [
        "Identifique os três valores morais ou espirituais mais importantes para você hoje.",
        "Observe se você desconta problemas pessoais ou frustrações cotidianas no seu parceiro(a).",
        "Reflita sobre qual legado de valores vocês estão construindo juntos."
      ]
    },
    fase2: {
      conceito: "Ajuste ético cotidiano. Prática de paciência, integridade e autorregulação focados no bem comum.",
      comoHoje: "Posturas individualistas que desgastam o pacto moral de apoio mútuo.",
      visao: "Integridade nas atitudes, servindo de norte e suporte nos dias difíceis e transições.",
      acoes: [
        "Pratique o silêncio bondoso quando estiver estressado(a) externamente, protegendo seu cônjuge da sua irritabilidade.",
        "Tenha uma conversa de 15 minutos sobre as crenças e o propósito existencial de cada um hoje, sem julgamentos.",
        "Realize um ato voluntário de sacrifício de preferência em prol do bem-estar do outro hoje."
      ]
    },
    fase3: {
      conceito: "Consolidação do propósito conjugal. O casamento é enxergado como um projeto de vida transcendente e inabalável.",
      comoHoje: "Fragilidade no compromisso sob crises, gerando discussões de separação por motivos bobos.",
      visao: "Aliança sólida e madura, blindada por valores éticos profundos compartilhados.",
      acoes: [
        "Criem uma declaração simples escrita com a 'Missão e Valores do Nosso Casamento'.",
        "Estabeleçam um ritual de gratidão ou oração/meditação conjunta de 5 minutos semanais.",
        "Planejem uma ação social ou ato de ajuda ao próximo que realizarão como casal."
      ]
    }
  },
  financeiro: {
    nome: "Alinhamento Financeiro e Transparência",
    fase1: {
      conceito: "Transparência e sentimentos sobre o dinheiro. Mapear a ansiedade ou controle gerado pela vida material.",
      comoHoje: "Conflitos silenciosos ou abertos causados por compras ocultas, desorganização ou visões divergentes de gastos.",
      visao: "Cumplicidade material total, onde o dinheiro é uma ferramenta de projetos comuns e liberdade.",
      acoes: [
        "Identifique qual a sua maior preocupação ou medo financeiro hoje.",
        "Anote se você escondeu ou minimizou algum gasto do seu cônjuge recentemente.",
        "Observe como seus pais lidavam com dinheiro e como você repete esse padrão hoje."
      ]
    },
    fase2: {
      conceito: "Planejamento prático compartilhado. Trazer o diálogo financeiro para a mesa sem tom de acusação.",
      comoHoje: "Conversas sobre dinheiro acontecem apenas em momentos de escassez ou de faturas estouradas.",
      visao: "Organização clara das contas, com metas de poupança e consumo alinhadas ativamente.",
      acoes: [
        "Montem hoje uma planilha ou lista simples com todas as contas fixas e receitas do casal.",
        "Defina um objetivo financeiro de curto prazo (ex: uma viagem de casal em 3 meses) e planeje o orçamento.",
        "Tenha uma conversa tranquila sobre como equilibrar os gastos pessoais de cada um."
      ]
    },
    fase3: {
      conceito: "Maturidade e transparência consolidada. Rotinas financeiras integradas e tranquilas no cotidiano conjugal.",
      comoHoje: "Desorganização financeira contínua gerando desconfiança e estresse na rotina doméstica.",
      visao: "Segurança futura, investimento conjunto e harmonia na gestão patrimonial do casal.",
      acoes: [
        "Criem o ritual do 'Conselho de Administração do Lar' (reunião mensal de 30 minutos para alinhar investimentos e contas).",
        "Revisem juntos a reserva de emergência e os planos de previdência/futuro do casal.",
        "Comemorem juntos o atingimento de uma meta financeira recente por menor que seja."
      ]
    }
  },
  sinergia: {
    nome: "Sinergia e Divisão de Responsabilidades",
    fase1: {
      conceito: "Parceria prática vs Sobrecarga. Mapear o equilíbrio das atividades diárias da casa e dos filhos.",
      comoHoje: "Sensação de sobrecarga física e mental em um dos lados, gerando ressentimento silencioso.",
      visao: "Divisão justa e colaborativa, onde o casal funciona como um time de alta performance cooperativa.",
      acoes: [
        "Observe e anote honestamente a divisão de tarefas domésticas da sua casa hoje.",
        "Identifique se você sente que seu parceiro é um aliado cooperativo ou um adversário doméstico.",
        "Reflita sobre sua disposição em apoiar os sonhos de carreira do outro."
      ]
    },
    fase2: {
      conceito: "Ajuste na colaboração ativa. Redistribuição prática de obrigações sem necessidade de cobranças.",
      comoHoje: "Cobranças estressantes para que o outro faça sua parte em casa ou apoie decisões.",
      visao: "Execução voluntária e divisão equilibrada de deveres, aliviando o cansaço do casal.",
      acoes: [
        "Proponha uma nova divisão de 3 tarefas domésticas para equilibrar a balança esta semana.",
        "Assuma voluntariamente uma obrigação que normalmente gera sobrecarga no outro hoje.",
        "Tenha uma conversa de apoio de 10 minutos sobre os planos de carreira individuais de cada um."
      ]
    },
    fase3: {
      conceito: "Consolidação da sinergia sistêmica. Cooperação doméstica fluida com suporte constante aos projetos do parceiro.",
      comoHoje: "Falta de apoio prático crônico, desgastando o sentimento de cumplicidade.",
      visao: "Cooperação ativa estável, com celebração conjunta e progresso mútuo nos projetos de vida.",
      acoes: [
        "Estabeleçam o 'Ritual do Domingo' para planejar e dividir os deveres e cardápio da semana.",
        "Escreva um compromisso claro de suporte a um grande objetivo pessoal do seu cônjuge.",
        "Criem uma regra de ouro para a tomada de decisões importantes compartilhadas."
      ]
    }
  },
  sexualidade: {
    nome: "Sexualidade Afetiva e Intimidade",
    fase1: {
      conceito: "Carinho físico continuado e sem pressões. Mapear a presença de toques não sexuais no dia a dia.",
      comoHoje: "Toque físico condicionado apenas ao ato íntimo, ou distanciamento corporal gerando frieza.",
      visao: "Ambiente conjugal aquecido por toques gentis, beijos sinceros e diálogo respeitoso sobre desejo.",
      acoes: [
        "Observe se vocês mantêm contato físico (mãos dadas, abraço de 20s, carinho) sem finalidade sexual hoje.",
        "Identifique se há barreiras na comunicação sobre desejos e intimidade.",
        "Reflita se o cansaço cotidiano tem sido o principal sabotador da intimidade de vocês."
      ]
    },
    fase2: {
      conceito: "Reconexão afetiva diária. Trazer gestos de carinho espontâneos sem cobranças para o cotidiano.",
      comoHoje: "Falta de contato íntimo frequente gerando insegurança ou sentimentos de rejeição.",
      visao: "Conexão física saudável, segura, baseada no desejo recíproco e na amizade corporal.",
      acoes: [
        "Dê um abraço longo (20 a 30 segundos) no seu cônjuge hoje sem pressa.",
        "Sente-se próximo(a) o suficiente para se tocarem no sofá enquanto assistem a algo hoje.",
        "Andem de mãos dadas ou faça um carinho rápido no ombro/cabelo dele(a) durante o dia."
      ]
    },
    fase3: {
      conceito: "Consolidação da intimidade contínua. Proteção da esfera íntima das tensões cotidianas, mantendo o fogo do afeto vivo.",
      comoHoje: "Indiferença física crônica afetando o vínculo afetivo geral.",
      visao: "Cumplicidade sexual e afetiva estável, enriquecida por diálogo honesto e frequente.",
      acoes: [
        "Planejem um momento exclusivo do casal (encontro íntimo reservado) livre de telas e pressões.",
        "Criem um ritual diário de despedida e recepção com beijos demorados e sinceros.",
        "Fale abertamente sobre o que você mais admira no corpo e na intimidade dele(a)."
      ]
    }
  }
}

// Banco de dados de Linguagens do Amor com ações e descrições customizadas
const LINGUAGENS_DATA = {
  palavras_afirmacao: {
    nome: "Palavras de Afirmação",
    fase1: {
      conceito: "A palavra que edifica. A importância de expressar gratidão, admiração e encorajamento verbal frequente.",
      comoHoje: "Silêncio verbal ou excesso de comentários corretivos que drenam a autoconfiança do cônjuge.",
      visao: "Um relacionamento onde o cônjuge sente-se profundamente validado e encorajado diariamente.",
      acoes: [
        "Observe se suas palavras diárias com seu parceiro tendem a ser críticas ou neutras.",
        "Evite tecer qualquer reclamação ou correção menor sobre o outro durante o dia de hoje.",
        "Escreva três características do caráter do seu cônjuge que você admira."
      ]
    },
    fase2: {
      conceito: "Ajuste na validação verbal. A prática deliberada de expressar elogios intencionais no cotidiano.",
      comoHoje: "Elogios raros que deixam o parceiro na insegurança de seu valor na relação.",
      visao: "Hábito contínuo de verbalizar admiração, criando um escudo contra as inseguranças.",
      acoes: [
        "Diga ao seu cônjuge hoje um elogio específico sobre o esforço dele(a) na família.",
        "Envie uma mensagem de texto inesperada no meio do dia apenas para dizer: 'Obrigado por ser meu(minha) parceiro(a)'.",
        "Agradeça verbalmente por um pequeno favor ou atitude diária dele(a) com um olhar atento."
      ]
    },
    fase3: {
      conceito: "Cultura do encorajamento permanente. As palavras de afirmação são consolidadas como o canal primário de nutrição.",
      comoHoje: "Falta de validação verbal crônica que esfria o sentimento de admiração mútua.",
      visao: "Comunicação verbal calorosa, onde os cônjuges são os maiores incentivadores um do outro.",
      acoes: [
        "Escreva uma carta detalhada expressando o impacto positivo que ele(a) tem na sua história.",
        "Criem o ritual do 'Elogio da Noite' nas refeições ou antes de deitar.",
        "Elogie seu parceiro em público ou diante dos filhos/familiares com orgulho sincero."
      ]
    }
  },
  tempo_qualidade: {
    nome: "Tempo de Qualidade",
    fase1: {
      conceito: "Presença com atenção plena. Momentos compartilhados sem a interferência de ruídos ou telas.",
      comoHoje: "Tempo compartilhado concorrente com celulares, trabalho ou conversas operacionais de rotina.",
      visao: "Momentos íntimos com foco total no outro, aprofundando a amizade e a cumplicidade.",
      acoes: [
        "Monitore o tempo que passam juntos hoje e veja quanto dele é gasto olhando para telas.",
        "Fique 10 minutos ouvindo o outro falar sobre o dia dele(a) sem interrupções.",
        "Identifique uma atividade simples que vocês costumavam fazer juntos e deixaram de lado."
      ]
    },
    fase2: {
      conceito: "Encontros intencionais. Agendar e executar momentos exclusivos com foco em conversas profundas e lazer.",
      comoHoje: "Falta de tempo a dois planejado, empurrando o casal para o distanciamento afetivo.",
      visao: "Rotina com espaços semanais blindados para a diversão e a conexão exclusiva do casal.",
      acoes: [
        "Combine um passeio a dois simples (caminhada, café) para esta semana, guardando os celulares na bolsa.",
        "Preparem e comam uma refeição juntos hoje, concentrando-se em uma conversa leve.",
        "Dediquem 20 minutos hoje à noite apenas para rir e conversar sobre memórias boas do início do namoro."
      ]
    },
    fase3: {
      conceito: "Blindagem do tempo a dois. O tempo de qualidade torna-se um pilar inegociável na rotina semanal do casal.",
      comoHoje: "Marasmo conjugal causado pela rotina mecânica de trabalho e afazeres domésticos.",
      visao: "Conexão constante revigorada por momentos de alta cumplicidade e atenção plena.",
      acoes: [
        "Instituam o 'Dia do Casal' semanal (uma noite blindada para namorarem).",
        "Realizem um passeio de fim de semana completo apenas vocês dois, sem terceiros.",
        "Criem uma rotina diária curta de conexão matinal ou noturna sem distrações."
      ]
    }
  },
  presentes: {
    nome: "Receber Presentes",
    fase1: {
      conceito: "O valor visual do afeto. Entender mimos e surpresas físicas como símbolos tangíveis de lembrança constante.",
      comoHoje: "Falta de pequenos gestos visuais de lembrança, fazendo a relação cair na monotonia operacional.",
      visao: "Relação alimentada por pequenos marcos físicos que dizem 'pensei em você hoje'.",
      acoes: [
        "Observe se pequenos mimos ou surpresas despertam sentimentos positivos no seu parceiro(a).",
        "Reflita sobre como você reage ao receber um presente espontâneo.",
        "Identifique um pequeno item ou doce que seu parceiro adora e que custa muito pouco."
      ]
    },
    fase2: {
      conceito: "Intencionalidade em presentear. Criar pequenos marcos visuais de afeto no dia a dia.",
      comoHoje: "Troca de presentes limitada estritamente a datas obrigatórias (aniversário, natal).",
      visao: "Presença constante de pequenos símbolos visuais de amor, mantendo o afeto aquecido.",
      acoes: [
        "Compre ou monte um pequeno mimo (um chocolate, uma flor colhida, uma fruta favorita) e entregue hoje com carinho.",
        "Faça uma surpresa física simples hoje, deixando um pequeno presente na mesa de trabalho ou no carro do outro.",
        "Traga algo simples de um passeio ou viagem a trabalho mostrando que se lembrou dele(a)."
      ]
    },
    fase3: {
      conceito: "Cultura do mimo espontâneo. Surpresas materiais simbólicas tornam-se parte da engrenagem de afeto.",
      comoHoje: "Sensação de que o outro nunca pensa ou se planeja para agradar espontaneamente.",
      visao: "Vínculo enriquecido por pequenos gestos físicos frequentes de consideração e carinho.",
      acoes: [
        "Planejem juntos uma caixa ou mural de recordações físicas dos melhores momentos de vocês.",
        "Dê um presente de maior significado emocional (feito à mão ou planejado com antecedência) sem data comemorativa.",
        "Crie um ritual mensal de trocar pequenas surpresas simbólicas do casal."
      ]
    }
  },
  atos_servico: {
    nome: "Atos de Serviço",
    fase1: {
      conceito: "O amor traduzido em suporte prático. Identificar o peso de tarefas compartilhadas para o alívio emocional.",
      comoHoje: "Desatenção às necessidades operacionais do outro, gerando cansaço e irritabilidade doméstica.",
      visao: "Suporte operacional mútuo que alivia cargas mentais e físicas no cotidiano do lar.",
      acoes: [
        "Observe qual tarefa doméstica ou pessoal mais estressa seu parceiro hoje.",
        "Monitore sua atitude ao ajudar: você faz com alegria ou reclamando?",
        "Identifique uma pequena ação que você poderia fazer para facilitar a rotina matinal dele(a)."
      ]
    },
    fase2: {
      conceito: "Ação de auxílio ativo. Executar tarefas práticas voluntariamente, demonstrando cuidado ativo.",
      comoHoje: "Ajuda apenas sob cobrança exaustiva, anulando o valor emocional da tarefa realizada.",
      visao: "Clima doméstico colaborativo de cooperação, reduzindo o cansaço do final de semana.",
      acoes: [
        "Realize hoje uma tarefa doméstica que seu cônjuge detesta fazer, sem que ele(a) peça.",
        "Prepare o café da manhã ou arrume a cama de forma voluntária hoje.",
        "Ofereça suporte prático imediato ao ver que o parceiro(a) está sobrecarregado(a) com trabalho ou filhos."
      ]
    },
    fase3: {
      conceito: "Parceria operacional estável. O auxílio prático é integrado como forma constante de demonstrar amor e cuidado.",
      comoHoje: "Sentimento crônico de sobrecarga e isolamento operacional nas tarefas domésticas.",
      visao: "Equipe coordenada de cooperação e suporte mútuo na rotina familiar.",
      acoes: [
        "Revisem e dividam as tarefas domésticas fixas para que ambos tenham tempos iguais de descanso.",
        "Criem um ritual semanal de organização onde cooperam de mãos dadas para agilizar a casa.",
        "Substitua cobranças por uma atitude de 'Como posso te ajudar agora?' nos dias estressantes."
      ]
    }
  },
  toque_fisico: {
    nome: "Toque Físico",
    fase1: {
      conceito: "A linguagem do contato corporal. A proximidade corporal diária como sinalizador primário de segurança.",
      comoHoje: "Escassez de abraços, mãos dadas ou proximidade corporal no dia a dia do lar.",
      visao: "Um lar aquecido por toques afetuosos, abraços longos e proximidade segura frequente.",
      acoes: [
        "Monitore quantas vezes vocês se tocaram fisicamente (carinho, abraço, beijo) hoje.",
        "Observe se você se afasta corporalmente do outro quando está cansado(a) ou chateado(a).",
        "Tente perceber a importância do contato tátil para recarregar sua energia emocional."
      ]
    },
    fase2: {
      conceito: "Ajuste na proximidade física. Introduzir de forma intencional toques carinhosos sem segundas intenções no dia a dia.",
      comoHoje: "Toque físico condicionado exclusivamente a momentos reservados de intimidade.",
      visao: "Ambiente de aconchego tátil constante, blindando a relação contra friezas cotidianas.",
      acoes: [
        "Dê um abraço longo (20 a 30 segundos) no seu cônjuge hoje sem pressa.",
        "Sente-se próximo(a) o suficiente para se tocarem no sofá enquanto assistem a algo hoje.",
        "Andem de mãos dadas ou faça um carinho rápido no ombro/cabelo dele(a) durante o dia."
      ]
    },
    fase3: {
      conceito: "Consolidação da intimidade tátil. O toque carinhoso e espontâneo torna-se parte estável da rotina diária.",
      comoHoje: "Indiferença física crônica que cria a sensação de serem apenas amigos de quarto.",
      visao: "Amizade corporal profunda, com toque afetivo continuado que transmite segurança e acolhimento.",
      acoes: [
        "Criem a rotina do abraço de recepção de 30 segundos ao chegar em casa.",
        "Dediquem 15 minutos semanais para carinho tátil consciente (massagem curta, cafuné).",
        "Mantenham contato físico constante ao dormirem ou conversarem assuntos calmos."
      ]
    }
  }
}

// Mapeador das chaves do banco para português legível
const NOMES_AMIGAVEIS = {
  comunicativo: "Comunicação Assertiva",
  socializante: "Conexão Social",
  analitico: "Pausa e Planejamento",
  determinante: "Firmeza e Liderança",
  empatia: "Empatia Acolhedora",
  expressividade: "Expressão Afetiva",
  resiliencia: "Regeneração Emocional",
  proatividade: "Iniciativa e Investimento",
  espiritualidade: "Propósito e Valores",
  financeiro: "Alinhamento Financeiro",
  sinergia: "Sinergia e Cooperação",
  sexualidade: "Sexualidade Afetiva",
  palavras_afirmacao: "Palavras de Afirmação",
  tempo_qualidade: "Tempo de Qualidade",
  presentes: "Receber Presentes",
  atos_servico: "Atos de Serviço",
  toque_fisico: "Toque Físico"
}

// Lista de Temas progressivos para os 90 Dias
const TEMAS_DIAS = [
  // FASE 1: Consciência (Dias 1-30)
  // Ciclo A (Dias 1-15): Foco no Comportamento Limitante
  { dia: 1, tema: "Identificando o Gatilho Primário", reflexao: "Qual é o primeiro sinal físico que indica que estou perdendo a paciência?" },
  { dia: 2, tema: "O Espaço entre o Estímulo e a Resposta", reflexao: "O que acontece se eu pausar 10 segundos antes de reagir hoje?" },
  { dia: 3, tema: "Identificando Padrões de Defesa", reflexao: "Qual é a minha defesa favorita quando me sinto criticado(a)?" },
  { dia: 4, tema: "Mapeando Pensamentos Automáticos", reflexao: "Que mentira minha mente conta sobre o parceiro quando estamos em conflito?" },
  { dia: 5, tema: "O Peso das Expectativas Irracionais", reflexao: "Estou cobrando do outro algo que eu mesmo não consigo entregar?" },
  { dia: 6, tema: "Escuta com Presença Plena", reflexao: "Consigo ouvir o outro sem formular minha defesa enquanto ele fala?" },
  { dia: 7, tema: "Identificando Projeções do Passado", reflexao: "Estou descontando no outro mágoas de relacionamentos passados ou da infância?" },
  { dia: 8, tema: "A Influência do Histórico Familiar", reflexao: "Como meus pais resolviam conflitos e como estou imitando ou rejeitando isso hoje?" },
  { dia: 9, tema: "Vulnerabilidade Consciente", reflexao: "O que me impede de confessar minhas reais fraquezas para o outro?" },
  { dia: 10, tema: "As Necessidades Por Trás das Queixas", reflexao: "Qual necessidade emocional real está por trás da minha última reclamação?" },
  { dia: 11, tema: "A Autodefesa do Ego", reflexao: "Prefiro estar certo(a) ou estar em paz e conectado(a) com meu parceiro(a)?" },
  { dia: 12, tema: "O Ritmo do Diálogo Conjugal", reflexao: "Nossas conversas parecem um monólogo ou uma dança equilibrada de escuta?" },
  { dia: 13, tema: "Reconhecendo Nossos Limites Clínicos", reflexao: "Em qual área sinto que preciso de ajuda profissional externa para avançar?" },
  { dia: 14, tema: "O Silêncio Construtivo vs Punitivo", reflexao: "Meu silêncio hoje serve para acalmar a mente ou para punir meu parceiro?" },
  { dia: 15, tema: "Revisão do Ciclo de Consciência Comportamental", reflexao: "Qual foi a principal mudança de comportamento que notei em mim nestes 15 dias?" },
  
  // Ciclo B (Dias 16-30): Foco na Linguagem do Amor Limitante
  { dia: 16, tema: "Mapeando Meu Tanque de Afeto", reflexao: "Como está meu nível de energia emocional hoje e o que o recarregaria?" },
  { dia: 17, tema: "Observando as Linguagens do Outro", reflexao: "Como meu parceiro demonstra afeto naturalmente no dia a dia?" },
  { dia: 18, tema: "Pequenos Sinais de Desconexão", reflexao: "Que sinais meu parceiro dá quando o tanque afetivo dele(a) está vazio?" },
  { dia: 19, tema: "Barreiras Internas de Expressão", reflexao: "Qual barreira interna sinto ao usar a linguagem de amor do outro?" },
  { dia: 20, tema: "A Arte de Falar Outro Idioma Afetivo", reflexao: "Estou amando o outro do meu jeito ou do jeito que ele(a) precisa?" },
  { dia: 21, tema: "O Valor da Intencionalidade Conjugal", reflexao: "Demonstrar amor deve depender de inspiração ou de decisão deliberada?" },
  { dia: 22, tema: "Acolhendo as Diferenças Necessárias", reflexao: "Consigo respeitar que o outro sinta amor de forma diferente de mim?" },
  { dia: 23, tema: "Expressões Espontâneas de Consideração", reflexao: "Qual foi a última vez que demonstrei afeto sem nenhuma obrigação comercial?" },
  { dia: 24, tema: "Superando o Egoísmo Afetivo", reflexao: "Estou mais focado(a) em receber afeto ou em doar ativamente hoje?" },
  { dia: 25, tema: "Sintonia de Expectativas Diárias", reflexao: "O que meu cônjuge espera de mim hoje que não está claro?" },
  { dia: 26, tema: "Identificando Ruídos na Comunicação Afetiva", reflexao: "Minhas tentativas de fazer carinho/agradar estão gerando o efeito correto?" },
  { dia: 27, tema: "A Arte de Validar o Esforço do Outro", reflexao: "Tenho o hábito de reconhecer as pequenas coisas ou apenas cobro o que falta?" },
  { dia: 28, tema: "Presença sem Distração Tecnológica", reflexao: "O celular tem sido um terceiro elemento intrusivo na nossa intimidade?" },
  { dia: 29, tema: "Gestos Mínimos de Grande Impacto", reflexao: "Que micro-atitude afetiva simples eu sei que muda o dia do meu cônjuge?" },
  { dia: 30, tema: "Revisão do Ciclo de Consciência Afetiva", reflexao: "Como compreender a linguagem do amor mudou minha percepção de afeto?" },

  // FASE 2: Ajuste (Dias 31-60)
  // Ciclo C (Dias 31-45): Foco no Comportamento Limitante (Ajuste Ativo)
  { dia: 31, tema: "Substituindo Críticas por Pedidos Claros", reflexao: "Como posso transformar minha última crítica em um pedido gentil?" },
  { dia: 32, tema: "A Técnica Prática do 'Eu Sinto'", reflexao: "Qual a diferença ao falar de mim em vez de apontar defeitos no outro?" },
  { dia: 33, tema: "Gerenciando a Impulsividade no Estresse", reflexao: "Consegui respirar fundo e pausar hoje na hora do estresse?" },
  { dia: 34, tema: "Assumindo Minha Parcela de Culpa", reflexao: "Qual é a minha responsabilidade real no atrito mais comum que temos?" },
  { dia: 35, tema: "Desarmando Minhas Defesas Reativas", reflexao: "Consigo abaixar os escudos quando meu parceiro quer conversar seriamente?" },
  { dia: 36, tema: "Validação Ativa Diante de Divergências", reflexao: "Consigo dizer 'Você tem razão nessa parte' mesmo discordando do resto?" },
  { dia: 37, tema: "Negociação Saudável de Limites", reflexao: "Onde preciso colocar um limite e onde preciso ceder pelo bem da relação?" },
  { dia: 38, tema: "O Pedido de Desculpas Sem Justificativas", reflexao: "Consigo pedir desculpas sem acrescentar um 'mas você também fez isso'?" },
  { dia: 39, tema: "Alinhamento Operacional e Equilíbrio", reflexao: "Onde a sobrecarga física está gerando atrito comportamental no lar?" },
  { dia: 40, tema: "Confrontação Gentil e Amorosa", reflexao: "Como falar a verdade com amor, sem agressividade nem omissão?" },
  { dia: 41, tema: "Respeitando Espaços Individuais", reflexao: "Damos espaço para a individualidade saudável de cada um respirar?" },
  { dia: 42, tema: "Decisões Compartilhadas Sem Imposição", reflexao: "Nossas decisões de casal refletem o desejo de ambos ou de apenas um?" },
  { dia: 43, tema: "Flexibilidade na Prática Diária", reflexao: "Consigo mudar meus planos pelo bem comum sem guardar ressentimento?" },
  { dia: 44, tema: "Zerando Mágoas Recentes com Diálogo", reflexao: "Há alguma pendência desta semana que precisamos sentar e resolver hoje?" },
  { dia: 45, tema: "Revisão do Ciclo de Ajuste Comportamental", reflexao: "Em qual situação esta semana consegui agir diferente do meu padrão antigo?" },

  // Ciclo D (Dias 46-60): Foco na Linguagem do Amor Limitante (Ajuste Ativo)
  { dia: 46, tema: "Ação Direta na Linguagem do Cônjuge", reflexao: "Como me sinto ao agir intencionalmente na linguagem do outro hoje?" },
  { dia: 47, tema: "Nutrição Verbal Intencional", reflexao: "Minhas palavras hoje edificaram ou apenas apontaram falhas?" },
  { dia: 48, tema: "Tempo de Qualidade Planejado e Blindado", reflexao: "Nosso tempo a dois esta semana foi de qualidade ou concorrente?" },
  { dia: 49, tema: "Gestos Simples de Serviço Voluntário", reflexao: "Onde o amor prático aliviou a carga mental do outro hoje?" },
  { dia: 50, tema: "Toque Físico Conectivo Sem Pressão", reflexao: "Nosso toque diário transmite acolhimento ou apenas busca sexual?" },
  { dia: 51, tema: "Pequenos Mimos e Lembranças Simbólicas", reflexao: "O que o pequeno mimo de hoje comunicou ao coração do meu parceiro?" },
  { dia: 52, tema: "Rompendo a Rotina Afetiva", reflexao: "Como podemos trazer mais dinamismo e afeto para os dias de semana?" },
  { dia: 53, tema: "Vulnerabilidade em Parceria Segura", reflexao: "Consigo chorar ou mostrar fraqueza diante dele(a) sem medo?" },
  { dia: 54, tema: "Surpresas Espontâneas do Cotidiano", reflexao: "A surpresa de hoje ajudou a quebrar o automatismo da rotina?" },
  { dia: 55, tema: "Acolhendo Reclamações com Atitudes de Amor", reflexao: "Ao ouvir uma queixa, reagi com agressividade ou com disposição para amar?" },
  { dia: 56, tema: "Eliminando Distrações Digitais na Mesa", reflexao: "Como foi a sensação de jantar olhando no olho em vez de olhar no celular?" },
  { dia: 57, tema: "Massagem e Descompressão Física", reflexao: "Como o relaxamento corporal ajudou a desinflamar o clima do casal?" },
  { dia: 58, tema: "Validação Escrita Duradoura", reflexao: "Que impacto um bilhete físico de amor causa no dia dele(a)?" },
  { dia: 59, tema: "Apoio Operacional Voluntário", reflexao: "Onde meu cônjuge mais precisa do meu suporte prático esta semana?" },
  { dia: 60, tema: "Revisão do Ciclo de Ajuste Afetivo", reflexao: "Qual linguagem do amor o outro tem demonstrado com mais clareza para mim?" },

  // FASE 3: Consolidação (Dias 61-90)
  // Ciclo E (Dias 61-75): Integração Sistêmica (Ambas as Áreas)
  { dia: 61, tema: "Criando Rituais de Conexão Diários", reflexao: "Quais micro-rituais de conexão de 5 minutos manteremos diariamente?" },
  { dia: 62, tema: "O Encontro Semanal de Alinhamento", reflexao: "Como nossa reunião semanal ajudará a prevenir brigas operacionais?" },
  { dia: 63, tema: "Alinhamento Conjugal de Longo Prazo", reflexao: "Onde nos vemos como casal nos próximos 5 anos?" },
  { dia: 64, tema: "Finanças com Parceria e Transparência", reflexao: "Dinheiro em nosso lar une nossos projetos ou gera controle?" },
  { dia: 65, tema: "Sexualidade e Intimidade Continuada", reflexao: "Como mantemos nossa atração protegida do estresse diário?" },
  { dia: 66, tema: "Sinergia Doméstica Permanente", reflexao: "Temos um sistema de cooperação justo que funciona sem cobranças?" },
  { dia: 67, tema: "Propósito e Valores Compartilhados", reflexao: "Que propósito ético maior dá sentido e sustenta nossa aliança conjugal?" },
  { dia: 68, tema: "Apoiando Projetos de Vida Individuais", reflexao: "Como posso ser o maior patrocinador(a) dos sonhos pessoais do outro?" },
  { dia: 69, tema: "Descanso e Recarga em Parceria", reflexao: "Sabemos descansar e nos divertir juntos, sem pressões ou pendências?" },
  { dia: 70, tema: "Celebrando Vitórias de Mãos Dadas", reflexao: "Temos o hábito de comemorar nossas conquistas de equipe?" },
  { dia: 71, tema: "Maturidade Conjugal e Perdão Consolidado", reflexao: "O perdão em nossa relação é real ou apenas uma trégua temporária?" },
  { dia: 72, tema: "O Lar como Santuário de Paz", reflexao: "Nossa casa transmite leveza e segurança quando entramos pela porta?" },
  { dia: 73, tema: "Comunidade e Suporte Externo Seguro", reflexao: "Nosso círculo de amizades protege e apoia a nossa aliança?" },
  { dia: 74, tema: "Planejamento Familiar Conjunto", reflexao: "Nossos planos estão sincronizados ou cada um corre para um lado?" },
  { dia: 75, tema: "Revisão do Ciclo de Integração Sistêmica", reflexao: "Qual área prática do casamento está mais organizada e harmônica hoje?" },

  // Ciclo F (Dias 76-90): Consolidação da Nova Identidade
  { dia: 76, tema: "Consolidando Nossa Nova Identidade Conjugal", reflexao: "Eu me vejo hoje como um parceiro melhor do que há 75 dias?" },
  { dia: 77, tema: "O Hábito Diário da Gratidão Conjugal", reflexao: "Consigo agradecer por ter meu cônjuge em minha vida todos os dias?" },
  { dia: 80, tema: "Resolução Imediata de Pequenos Atritos", reflexao: "Consigo resolver divergências em poucos minutos, sem acumular gelo?" },
  { dia: 81, tema: "Nutrição Afetiva Fluida e Automática", reflexao: "O afeto entre nós tornou-se a nossa atmosfera natural?" },
  { dia: 82, tema: "Construindo Nosso Legado Familiar", reflexao: "O que as pessoas mais admiram na parceria e união do nosso casal?" },
  { dia: 83, tema: "Sonhando Juntos com Olhar no Futuro", reflexao: "Qual é o próximo grande projeto que construiremos juntos?" },
  { dia: 84, tema: "Superação Consolidada de Crises Antigas", reflexao: "Olhamos para as dores do passado como feridas curadas ou cicatrizes abertas?" },
  { dia: 85, tema: "Autoestima Pessoal e Casamento Maduro", reflexao: "Como meu desenvolvimento pessoal fortaleceu o nosso casamento?" },
  { dia: 86, tema: "Renovação Diária do Pacto Conjugal", reflexao: "Escolho amar e apoiar meu cônjuge hoje com a mesma convicção?" },
  { dia: 87, tema: "Blindagem de Estresse Clínico Externo", reflexao: "Sabemos separar os problemas de trabalho do nosso ambiente de casal?" },
  { dia: 88, tema: "A Arte de Construir o Futuro Juntos", reflexao: "O que significa 'envelhecer juntos' com cumplicidade para nós?" },
  { dia: 89, tema: "A Carta de Compromisso de Longo Prazo", reflexao: "Quais promessas renovamos hoje para guiar nossos próximos anos?" },
  { dia: 90, tema: "Formatura Conjugal e Futuro Promissor", reflexao: "Quais são as três maiores lições que levaremos desta jornada de 90 dias?" }
]

// Certificar que temos exatamente 90 entradas (preencher buracos se houver pulo de index)
const TEMAS_MAP = {}
TEMAS_DIAS.forEach(t => { TEMAS_MAP[t.dia] = t })

function obterTemaDia(dia) {
  if (TEMAS_MAP[dia]) return TEMAS_MAP[dia]
  // Fallbacks de segurança para índices ausentes (ex: 78, 79)
  if (dia === 78) return { dia: 78, tema: "Vínculo Seguro e Proteção Mútua", reflexao: "Como nos sentimos protegidos e seguros dentro do abraço um do outro?" }
  if (dia === 79) return { dia: 79, tema: "Comunicação Não-Verbal e Sintonia", reflexao: "Consigo decifrar o silêncio do meu parceiro e responder com carinho silencioso?" }
  return { dia: dia, tema: `Consolidando Hábitos Conjugais - Dia ${dia}`, reflexao: "O que esta prática diária está nos ensinando sobre persistência conjugal?" }
}

/**
 * Identifica o comportamento com menor score (abaixo de 100)
 */
export function identificarMenorComportamento(scores) {
  const areas = ['comunicativo', 'socializante', 'analitico', 'determinante', 'empatia', 'expressividade', 'resiliencia', 'proatividade', 'espiritualidade', 'financeiro', 'sinergia', 'sexualidade']
  let menorKey = 'comunicativo'
  let menorVal = 100
  areas.forEach(a => {
    const val = scores[a] !== undefined ? scores[a] : 50
    if (val < menorVal) {
      menorVal = val
      menorKey = a
    }
  })
  return { key: menorKey, score: menorVal }
}

/**
 * Identifica a linguagem do amor com menor score
 */
export function identificarMenorLinguagem(scores) {
  const lings = ['palavras_afirmacao', 'tempo_qualidade', 'presentes', 'atos_servico', 'toque_fisico']
  let menorKey = 'palavras_afirmacao'
  let menorVal = 100
  lings.forEach(l => {
    const val = scores[l] !== undefined ? scores[l] : 50
    if (val < menorVal) {
      menorVal = val
      menorKey = l
    }
  })
  return { key: menorKey, score: menorVal }
}

/**
 * Função principal para gerar o guia completo de 90 dias
 */
export function gerarGuia90Dias(nome, conjuge, nomeParceiro, scores) {
  const { key: menorComp, score: scoreComp } = identificarMenorComportamento(scores)
  const { key: menorLing, score: scoreLing } = identificarMenorLinguagem(scores)
  
  const nomeComp = NOMES_AMIGAVEIS[menorComp] || menorComp
  const nomeLing = NOMES_AMIGAVEIS[menorLing] || menorLing
  
  const compData = COMPORTAMENTOS_DATA[menorComp] || COMPORTAMENTOS_DATA.comunicativo
  const lingData = LINGUAGENS_DATA[menorLing] || LINGUAGENS_DATA.palavras_afirmacao
  
  const guia = []
  
  for (let dia = 1; dia <= 90; dia++) {
    let fase = "Fase 1: Consciência"
    let faseIndex = "fase1"
    let foco = "comportamento"
    
    if (dia > 30 && dia <= 60) {
      fase = "Fase 2: Ajuste"
      faseIndex = "fase2"
    } else if (dia > 60) {
      fase = "Fase 3: Consolidação"
      faseIndex = "fase3"
    }
    
    // Rotação de Foco:
    // Dias 1-15, 31-45: Comportamento
    // Dias 16-30, 46-60: Linguagem do Amor
    // Dias 61-90: Integração mista (dias ímpares comportamento, pares linguagem)
    if (dia <= 30) {
      foco = dia <= 15 ? "comportamento" : "linguagem"
    } else if (dia <= 60) {
      foco = dia <= 45 ? "comportamento" : "linguagem"
    } else {
      foco = dia % 2 === 1 ? "comportamento" : "linguagem"
    }
    
    const metaDia = obterTemaDia(dia)
    const refData = foco === "comportamento" ? compData[faseIndex] : lingData[faseIndex]
    const areaNome = foco === "comportamento" ? nomeComp : nomeLing
    const scoreVal = foco === "comportamento" ? scoreComp : scoreLing
    
    // Diagnósticos dinâmicos baseados no score real
    let diagnostico = ""
    if (foco === "comportamento") {
      diagnostico = `Seu resultado de ${scoreVal}% em ${areaNome} aponta que esta área é seu principal foco de desenvolvimento comportamental na relação.`
      if (scoreVal <= 33) {
        diagnostico += ` Com score em nível de Alerta (${scoreVal}%), os padrões automáticos tendem a se sobrepor nos dias de estresse, gerando ruídos diretos.`
      } else if (scoreVal <= 65) {
        diagnostico += ` Com score Médio (${scoreVal}%), embora você consiga manter a harmonia em dias calmos, sob pressão pode oscilar para reações impulsivas.`
      }
    } else {
      diagnostico = `Seu score de ${scoreVal}% em ${areaNome} indica que esta linguagem afetiva necessita ser intencionalmente ativada para nutrir o casal.`
      if (scoreVal <= 33) {
        diagnostico += ` Por estar em nível baixo (${scoreVal}%), gestos nesta linguagem podem parecer não naturais de início, demandando treino consciente.`
      } else {
        diagnostico += ` Por estar em nível moderado (${scoreVal}%), pequenos ajustes diários ajudarão a consolidar esta conexão de forma mais regular.`
      }
    }
    
    guia.push({
      dia,
      fase,
      tema: metaDia.tema,
      foco: foco === "comportamento" ? "Comportamento" : "Linguagem do Amor",
      focoDetalhe: areaNome,
      leitura: refData.conceito,
      diagnostico,
      comoHoje: refData.comoHoje,
      visao: refData.visao,
      acoes: refData.acoes.map(acao => acao.replace(/{parceiro}/g, nomeParceiro)),
      reflexao: metaDia.reflexao
    })
  }
  
  return {
    conjuge,
    nome,
    nomeParceiro,
    menorComportamento: nomeComp,
    scoreComportamento: scoreComp,
    menorLinguagem: nomeLing,
    scoreLinguagem: scoreLing,
    dias: guia
  }
}

/**
 * Gera o HTML formatado para impressão ou salvamento de PDF
 */
export function gerarImpressaoGuiaHTML(dadosGuia) {
  const { nome, conjuge, nomeParceiro, menorComportamento, scoreComportamento, menorLinguagem, scoreLinguagem, dias } = dadosGuia
  const dataStr = new Date().toLocaleDateString('pt-BR')
  const tituloConjuge = conjuge === 'esposo' ? 'Esposo' : 'Esposa'
  const corTema = conjuge === 'esposo' ? '#1565C0' : '#6A1B9A'
  
  const listaDiasHTML = dias.map(d => `
    <div class="day-card">
      <div class="day-header" style="border-left: 4px solid ${corTema}">
        <span class="day-number">DIA ${d.dia}</span>
        <span class="day-title">— ${d.tema}</span>
        <span class="day-fase">${d.fase}</span>
      </div>
      
      <div class="meta-row">
        <strong>Foco:</strong> ${d.foco} (${d.focoDetalhe})
      </div>
      
      <div class="grid-content">
        <div class="section-box">
          <div class="section-title">Leitura do Dia</div>
          <p>${d.leitura}</p>
        </div>
        <div class="section-box">
          <div class="section-title">Diagnóstico Pessoal</div>
          <p>${d.diagnostico}</p>
        </div>
        <div class="section-box">
          <div class="section-title">Como está hoje</div>
          <p>${d.comoHoje}</p>
        </div>
        <div class="section-box">
          <div class="section-title">Visão de Futuro</div>
          <p>${d.visao}</p>
        </div>
      </div>
      
      <div class="tasks-box">
        <div class="section-title">Ações de Hoje (Prática Deliberada)</div>
        <ul>
          ${d.acoes.map(a => `<li><span class="checkbox">☐</span> ${a}</li>`).join('')}
        </ul>
      </div>
      
      <div class="reflection-box">
        <strong>Pergunta de Reflexão:</strong> <em>"${d.reflexao}"</em>
      </div>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Reprogramação Comportamental — Guia do Cônjuge (${nome})</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #fff; color: #333; line-height: 1.5; padding: 40px; }
    .header { text-align: center; border-bottom: 2px solid ${corTema}; padding-bottom: 24px; margin-bottom: 30px; }
    .header h1 { font-family: Georgia, serif; font-size: 28px; color: #0D1B3E; margin-bottom: 6px; letter-spacing: 2px; }
    .header h2 { font-size: 16px; color: ${corTema}; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; }
    .header p { font-size: 13px; color: #666; }
    
    .intro-box { background: #F5F7FA; border-left: 4px solid #C9A84C; padding: 18px 24px; margin-bottom: 30px; border-radius: 4px; font-size: 13.5px; }
    .intro-box p { margin-bottom: 8px; }
    .intro-box p:last-child { margin-bottom: 0; }
    
    .day-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px; margin-bottom: 30px; page-break-inside: avoid; background: #FFF; box-shadow: 0 1px 4px rgba(0,0,0,0.02); }
    .day-header { display: flex; align-items: center; gap: 10px; padding-bottom: 10px; border-bottom: 1px solid #F3F4F6; margin-bottom: 12px; }
    .day-number { font-weight: bold; color: ${corTema}; font-size: 16px; }
    .day-title { font-family: Georgia, serif; font-size: 16px; color: #0D1B3E; font-weight: bold; }
    .day-fase { margin-left: auto; font-size: 11px; text-transform: uppercase; background: #E2E8F0; color: #4A5568; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
    
    .meta-row { font-size: 12px; color: #6B7280; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .grid-content { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .section-box { background: #FAFAFA; border: 1px solid #F0F0F0; border-radius: 6px; padding: 12px; font-size: 13px; }
    .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #4B5563; margin-bottom: 6px; letter-spacing: 0.5px; }
    
    .tasks-box { background: #F9FAFB; border: 1px dashed #D1D5DB; border-radius: 6px; padding: 14px; margin-bottom: 14px; }
    .tasks-box ul { list-style: none; padding-left: 0; }
    .tasks-box li { font-size: 13px; display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px; color: #374151; }
    .tasks-box li:last-child { margin-bottom: 0; }
    .checkbox { font-family: monospace; font-size: 14px; color: #9CA3AF; cursor: default; }
    
    .reflection-box { background: ${corTema}10; border-left: 3px solid ${corTema}; padding: 10px 14px; border-radius: 4px; font-size: 13px; color: #0D1B3E; }
    
    @media print {
      body { padding: 0; }
      .day-card { border: 1px solid #ccc; box-shadow: none; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>PERFIL 4D</h1>
    <h2>Programa de Reprogramação Comportamental (90 Dias)</h2>
    <p>Cônjuge: <strong>${nome} (${tituloConjuge})</strong> · Parceiro(a): <strong>${nomeParceiro}</strong> · Gerado em: ${dataStr}</p>
  </div>
  
  <div class="intro-box">
    <p><strong>Olá, ${nome}.</strong> Este é o seu plano de 90 dias de treinamento deliberado.</p>
    <p>O Perfil 4D revelou que o seu maior ponto de adjustment comportamental é <strong>${menorComportamento} (Score: ${scoreComportamento}%)</strong> e sua linguagem do amor com menor pontuação ativa é <strong>${menorLinguagem} (Score: ${scoreLinguagem}%)</strong>.</p>
    <p>Este guia foi montado especificamente para ajudar você a reconhecer seus gatilhos automáticos (Dias 1-30), treinar ativamente respostas maduras (Dias 31-60) e consolidar novos hábitos de união e sinergia (Dias 61-90). Realize as pequenas tarefas diariamente e anote suas reflexões.</p>
  </div>
  
  <div class="dias-container">
    ${listaDiasHTML}
  </div>
</body>
</html>`
}
