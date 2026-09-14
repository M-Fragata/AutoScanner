import type { DtcDefinition } from '../types/scanner';

export const OFFLINE_DTC_CATALOG: DtcDefinition[] = [
  // ================= POWERTRAIN (P0xxx / P1xxx) =================
  {
    code: 'P0011',
    category: 'Powertrain',
    title: 'Posição do Comando de Válvulas - Avanço Excessivo (VVT Banco 1)',
    description: 'O sincronismo do comando de admissão está mais adiantado do que o comandado pela ECU através da solenoide de comando variável.',
    severity: 'ALTA',
    commonCauses: [
      'Nível baixo ou degradação do óleo lubrificante do motor',
      'Válvula solenoide do VVT travada ou suja com borra',
      'Atuador hidráulico/polia variadora desgastada',
      'Passagens de óleo do cabeçote obstruídas',
    ],
  },
  {
    code: 'P0016',
    category: 'Powertrain',
    title: 'Correlação Virabrequim / Comando de Válvulas (Sincronismo Fora de Ponto)',
    description: 'A relação angular entre o sensor de rotação (CKP) e o sensor de fase (CMP) do Banco 1 está fora da tolerância da central.',
    severity: 'CRÍTICA',
    commonCauses: [
      'Corrente ou correia dentada de distribuição esticada ou com dentes pulados',
      'Tensor hidráulico da corrente sem pressão ou travado',
      'Sensor de fase (CMP) ou sensor de rotação (CKP) com defeito',
      'Chaveta da engrenagem do virabrequim danificada',
    ],
  },
  {
    code: 'P0087',
    category: 'Powertrain',
    title: 'Pressão da Linha de Combustível Baixa Demais (Common Rail / GDI)',
    description: 'A pressão no tubo distribuidor de combustível (rail) está abaixo do valor alvo calculado pela ECU sob demanda.',
    severity: 'CRÍTICA',
    commonCauses: [
      'Bomba de combustível de alta pressão (HPFP) desgastada',
      'Bomba elétrica do tanque (baixa pressão) com vazão insuficiente',
      'Sensor de pressão do rail (FRP) descalibrado',
      'Válvula reguladora de pressão de combustível travada aberta',
    ],
  },
  {
    code: 'P0100',
    category: 'Powertrain',
    title: 'Mau Funcionamento no Circuito do Medidor de Fluxo de Massa de Ar (MAF)',
    description: 'A centralina não consegue ler o sinal analógico ou de frequência do sensor MAF instalado na admissão.',
    severity: 'MÉDIA',
    commonCauses: [
      'Conector do sensor MAF frouxo, oxidado ou rompido',
      'Filamento quente do sensor MAF contaminado por óleo ou poeira',
      'Entrada falsa de ar entre o sensor e a borboleta TBI',
      'Falha interna de alimentação 5V ou 12V do sensor',
    ],
  },
  {
    code: 'P0102',
    category: 'Powertrain',
    title: 'Sinal Baixo no Circuito do Sensor MAF (Fluxo de Massa de Ar)',
    description: 'A voltagem informada pelo sensor de fluxo de ar está abaixo da faixa operacional mínima (geralmente < 0.2V).',
    severity: 'MÉDIA',
    commonCauses: [
      'Sensor MAF desconectado ou sujo',
      'Rompimento no chicote elétrico de sinal ou alimentação',
      'Obstrução severa na caixa de filtro de ar',
    ],
  },
  {
    code: 'P0113',
    category: 'Powertrain',
    title: 'Sensor de Temperatura do Ar de Admissão (IAT) - Entrada Alta no Circuito',
    description: 'A ECU registrou voltagem máxima no sensor IAT, indicando circuito aberto ou termistor rompido (temperatura de -40°C simulada).',
    severity: 'BAIXA',
    commonCauses: [
      'Conector do sensor IAT desconectado ou pinos tortos',
      'Fio de sinal ou terra do sensor rompido no chicote',
      'Sensor IAT danificado termicamente',
    ],
  },
  {
    code: 'P0115',
    category: 'Powertrain',
    title: 'Mau Funcionamento no Circuito de Temperatura do Motor (ECT)',
    description: 'Sinal intermitente ou fora de escala vindo do sensor de temperatura do líquido de arrefecimento.',
    severity: 'ALTA',
    commonCauses: [
      'Sensor ECT defeituoso ou com fiação quebrada',
      'Oxidação nos terminais do conector',
      'Curto-circuito na linha de referência 5V da central',
    ],
  },
  {
    code: 'P0120',
    category: 'Powertrain',
    title: 'Mau Funcionamento no Sensor de Posição da Borboleta (TPS)',
    description: 'A pista resistiva A do corpo de borboleta eletrônico não responde linearmente ao acionamento do acelerador.',
    severity: 'ALTA',
    commonCauses: [
      'Trilhas resistivas do corpo de borboleta (TBI) desgastadas',
      'Chicote com interferência ou mau contato no conector',
      'Corpo de borboleta carbonizado travando o movimento da aleta',
    ],
  },
  {
    code: 'P0128',
    category: 'Powertrain',
    title: 'Temperatura do Líquido de Arrefecimento Abaixo da Faixa Operacional',
    description: 'O motor não atinge a temperatura ideal de funcionamento (85°C - 95°C) no tempo estipulado pela ECU.',
    severity: 'BAIXA',
    commonCauses: [
      'Válvula termostática travada aberta',
      'Sensor de temperatura do líquido de arrefecimento (ECT) defeituoso',
      'Nível incorreto ou aditivo degradado',
    ],
  },
  {
    code: 'P0130',
    category: 'Powertrain',
    title: 'Mau Funcionamento no Circuito da Sonda Lambda (Banco 1 Sensor 1)',
    description: 'A sonda pré-catalisador não está oscilando entre 0.1V e 0.9V conforme as variações estequiométricas do motor.',
    severity: 'MÉDIA',
    commonCauses: [
      'Sonda lambda contaminada por chumbo, fuligem ou óleo',
      'Fiação de sinal ou aquecedor danificada',
      'Vazamento no coletor de escape antes da sonda',
    ],
  },
  {
    code: 'P0135',
    category: 'Powertrain',
    title: 'Circuito do Aquecedor da Sonda Lambda com Falha (Banco 1 Sensor 1)',
    description: 'A resistência interna de aquecimento da sonda lambda pré-catalisador está aberta ou em curto, demorando para entrar em malha fechada.',
    severity: 'MÉDIA',
    commonCauses: [
      'Resistência de aquecimento da sonda queimada internamente',
      'Fusível ou relé de alimentação dos aquecedores queimado',
      'Chicote rompido próximo ao escapamento quente',
    ],
  },
  {
    code: 'P0171',
    category: 'Powertrain',
    title: 'Mistura Ar/Combustível Excessivamente Pobre (Banco 1)',
    description: 'A proporção ar/combustível está com excesso de oxigênio em relação ao combustível injetado, ultrapassando o ajuste de combustível (LTFT > +20%).',
    severity: 'MÉDIA',
    commonCauses: [
      'Entrada falsa de ar após o sensor MAF/TBI (juntas ou mangueiras furadas)',
      'Sensor MAF sujo ou descalibrado',
      'Filtro de combustível obstruído ou bomba fraca',
      'Injetores com vazão irregular',
    ],
  },
  {
    code: 'P0172',
    category: 'Powertrain',
    title: 'Mistura Ar/Combustível Excessivamente Rica (Banco 1)',
    description: 'A central está reduzindo o tempo de injeção ao limite mínimo (LTFT < -20%) devido a excesso de vapor ou líquido de combustível.',
    severity: 'MÉDIA',
    commonCauses: [
      'Bicos injetores gotejando ou travados abertos',
      'Válvula de purga do cânister (EVAP) travada aberta puxando vapor contínuo',
      'Regulador de pressão de combustível furado vazando para o vácuo',
      'Filtro de ar completamente entupido',
    ],
  },
  {
    code: 'P0201',
    category: 'Powertrain',
    title: 'Mau Funcionamento no Circuito do Injetor do Cilindro 1',
    description: 'A ECU não detecta o pulso elétrico ou a corrente indutiva esperada ao acionar a solenoide do bico injetor 1.',
    severity: 'ALTA',
    commonCauses: [
      'Solenoide do bico injetor 1 queimada ou em curto',
      'Conector do injetor solto ou quebrado',
      'Transistor (driver) de injeção da centralina ECU queimado',
    ],
  },
  {
    code: 'P0299',
    category: 'Powertrain',
    title: 'Subalimentação do Turbocompressor (Baixa Pressão de Boost)',
    description: 'A pressão absoluta no coletor de admissão medida pelo sensor MAP está significativamente abaixo da pressão solicitada pelo pedal.',
    severity: 'ALTA',
    commonCauses: [
      'Válvula wastegate travada aberta ou atuador desregulado',
      'Válvula de alívio/diverter valve (DV) com diafragma rasgado',
      'Mangueira ou tubulação do intercooler rompida ou frouxa',
      'Folga excessiva no rotor da turbina ou rotor travado',
    ],
  },
  {
    code: 'P0300',
    category: 'Powertrain',
    title: 'Falha de Ignição Múltipla/Aleatória Detectada (Random Misfire)',
    description: 'A ECU detectou aceleração angular irregular no virabrequim, indicando que múltiplos cilindros falharam na queima.',
    severity: 'ALTA',
    commonCauses: [
      'Velas de ignição desgastadas ou danificadas',
      'Bobinas de ignição com fuga de corrente',
      'Bicos injetores entupidos ou defeituosos',
      'Baixa pressão de combustível',
    ],
  },
  {
    code: 'P0301',
    category: 'Powertrain',
    title: 'Falha de Ignição Detectada no Cilindro 1 (Misfire Cilindro 1)',
    description: 'Aceleração angular deficiente atribuída unicamente ao tempo de expansão do cilindro número 1.',
    severity: 'ALTA',
    commonCauses: [
      'Vela de ignição do cilindro 1 desgastada ou carbonizada',
      'Bobina de ignição individual do cilindro 1 em falha',
      'Bico injetor do cilindro 1 com giclê travado',
      'Baixa compressão mecânica no cilindro 1 (válvulas ou anéis)',
    ],
  },
  {
    code: 'P0302',
    category: 'Powertrain',
    title: 'Falha de Ignição Detectada no Cilindro 2 (Misfire Cilindro 2)',
    description: 'A central registrou falha de combustão no cilindro número 2.',
    severity: 'ALTA',
    commonCauses: [
      'Vela do cilindro 2 danificada',
      'Bobina de ignição do cilindro 2',
      'Injetor 2 com restrição de fluxo',
      'Problema mecânico de compressão no cilindro 2',
    ],
  },
  {
    code: 'P0303',
    category: 'Powertrain',
    title: 'Falha de Ignição Detectada no Cilindro 3 (Misfire Cilindro 3)',
    description: 'A central registrou falha de combustão no cilindro número 3.',
    severity: 'ALTA',
    commonCauses: [
      'Vela de ignição do cilindro 3',
      'Bobina de ignição do cilindro 3',
      'Injetor do cilindro 3',
      'Vedação de válvula ou junta de cabeçote queimada',
    ],
  },
  {
    code: 'P0304',
    category: 'Powertrain',
    title: 'Falha de Ignição Detectada no Cilindro 4 (Misfire Cilindro 4)',
    description: 'A central registrou falha de combustão no cilindro número 4.',
    severity: 'ALTA',
    commonCauses: [
      'Vela de ignição do cilindro 4',
      'Bobina do cilindro 4',
      'Injetor do cilindro 4',
      'Problema de vedação no cilindro 4',
    ],
  },
  {
    code: 'P0335',
    category: 'Powertrain',
    title: 'Mau Funcionamento no Circuito do Sensor de Posição da Árvore de Manivelas (CKP)',
    description: 'A ECU não recebe pulsos da roda fônica ou o sinal de dente de sincronismo está inconsistente.',
    severity: 'CRÍTICA',
    commonCauses: [
      'Sensor de rotação CKP avariado termicamente',
      'Roda fônica com dentes amassados, quebrados ou sujeira magnética',
      'Chicote elétrico quebrado ou encostado no bloco quente',
    ],
  },
  {
    code: 'P0340',
    category: 'Powertrain',
    title: 'Mau Funcionamento no Circuito do Sensor de Posição do Comando (CMP)',
    description: 'Sinal elétrico intermitente ou ausente vindo do sensor de comando de válvulas.',
    severity: 'ALTA',
    commonCauses: [
      'Sensor de fase (CMP) com falha interna',
      'Chicote elétrico danificado ou com mau contato',
      'Sincronismo da correia ou corrente de comando desalinhado',
    ],
  },
  {
    code: 'P0400',
    category: 'Powertrain',
    title: 'Mau Funcionamento no Fluxo da Válvula EGR',
    description: 'A quantidade de gases recirculados do escapamento para a admissão não causou a variação esperada de pressão no sensor MAP.',
    severity: 'MÉDIA',
    commonCauses: [
      'Válvula EGR emperrada com acúmulo de fuligem/carbonização',
      'Galerias de passagem da EGR no coletor entupidas',
      'Solenoide de vácuo da EGR inoperante',
    ],
  },
  {
    code: 'P0420',
    category: 'Powertrain',
    title: 'Eficiência do Catalisador Abaixo do Limite (Banco 1)',
    description: 'O conversor catalítico não está operando com a eficiência mínima exigida para redução de emissões.',
    severity: 'MÉDIA',
    commonCauses: [
      'Catalisador degradado, quebrado ou contaminado',
      'Sensor de oxigênio pós-catalisador defeituoso',
      'Vazamento no escapamento antes do catalisador',
      'Combustão rica prolongada danificando a cerâmica',
    ],
  },
  {
    code: 'P0442',
    category: 'Powertrain',
    title: 'Vazamento Pequeno Detectado no Sistema de Controle de Emissões EVAP',
    description: 'O autoteste de vácuo do tanque de combustível detectou um vazamento fino (~1.0 mm) de vapores de hidrocarbonetos.',
    severity: 'BAIXA',
    commonCauses: [
      'Vedação da tampa do tanque de combustível ressecada ou suja',
      'Microfissura nas mangueiras plásticas de retorno do cânister',
      'Válvula de ventilação do cânister com fechamento imperfeito',
    ],
  },
  {
    code: 'P0455',
    category: 'Powertrain',
    title: 'Vazamento Grande Detectado no Sistema EVAP',
    description: 'O sistema de controle de vapores de combustível não conseguiu reter o vácuo gerado durante o autoteste.',
    severity: 'BAIXA',
    commonCauses: [
      'Tampa do tanque de combustível frouxa, esquecida aberta ou danificada',
      'Válvula de purga do cânister travada aberta',
      'Mangueira de vácuo do EVAP desconectada ou rachada',
    ],
  },
  {
    code: 'P0500',
    category: 'Powertrain',
    title: 'Mau Funcionamento no Sensor de Velocidade do Veículo (VSS)',
    description: 'A ECU não recebe leituras válidas de velocidade do veículo.',
    severity: 'MÉDIA',
    commonCauses: [
      'Sensor VSS danificado na transmissão ou cubo de roda',
      'Falha de comunicação no barramento CAN com o módulo ABS',
      'Fiação rompida ou oxidada',
    ],
  },
  {
    code: 'P0505',
    category: 'Powertrain',
    title: 'Mau Funcionamento no Sistema de Controle da Marcha Lenta',
    description: 'A rotação do motor em repouso oscila ou difere da marcha lenta alvo programada na centralina.',
    severity: 'MÉDIA',
    commonCauses: [
      'Corpo de borboleta (TBI) com crosta de sujeira obstruindo o fluxo mínimo',
      'Válvula IAC / atuador de marcha lenta engripado',
      'Entrada falsa de ar por juntas ou mangueiras de respiro',
    ],
  },
  {
    code: 'P0562',
    category: 'Powertrain',
    title: 'Tensão do Sistema Elétrico do Veículo Abaixo do Limite (< 11.5V)',
    description: 'A tensão fornecida à ECU durante o funcionamento do motor está baixa, comprometendo o acionamento de atuadores.',
    severity: 'ALTA',
    commonCauses: [
      'Alternador com regulador de voltagem com defeito ou escovas gastas',
      'Correia de acessórios frouxa ou arrebentada',
      'Bateria com célula em curto ou em fim de vida útil',
      'Cabo de aterramento principal do motor oxidado',
    ],
  },
  {
    code: 'P0606',
    category: 'Powertrain',
    title: 'Falha Interna no Processador do Módulo de Controle (ECU/PCM)',
    description: 'O microprocessador principal da ECU falhou no teste interno de checksum ou no watchdog de segurança.',
    severity: 'CRÍTICA',
    commonCauses: [
      'Problema elétrico interno na placa da centralina (curto ou queima de componente)',
      'Queda severa de tensão durante a partida desestabilizando o microcontrolador',
      'Infiltração de água no conector ou carcaça da ECU',
    ],
  },
  {
    code: 'P0700',
    category: 'Powertrain',
    title: 'Falha no Sistema de Controle da Transmissão (TCM)',
    description: 'A central de transmissão automática solicitou acendimento da luz de injeção (MIL) devido a código de falha gravado no câmbio.',
    severity: 'CRÍTICA',
    commonCauses: [
      'Pressão hidráulica irregular da transmissão',
      'Solenoide de troca de marcha travado',
      'Fluido de transmissão degradado ou em nível crítico',
    ],
  },
  {
    code: 'P0740',
    category: 'Powertrain',
    title: 'Mau Funcionamento no Circuito da Embreagem do Conversor de Torque (TCC)',
    description: 'A embreagem lock-up do conversor de torque não consegue travar mecanicamente em velocidades de cruzeiro.',
    severity: 'ALTA',
    commonCauses: [
      'Solenoide do TCC queimada ou entupida com limalha',
      'Desgaste do revestimento de atrito da embreagem do conversor',
      'Canais hidráulicos do corpo de válvulas do câmbio obstruídos',
    ],
  },

  // ================= CHASSIS (C0xxx) =================
  {
    code: 'C0035',
    category: 'Chassis',
    title: 'Mau Funcionamento no Sensor de Velocidade da Roda Dianteira Esquerda',
    description: 'O módulo de controle dos freios ABS não recebe leitura coerente de rotação da roda dianteira esquerda.',
    severity: 'ALTA',
    commonCauses: [
      'Sensor de rotação da roda dianteira esquerda quebrado ou sujo',
      'Rolamento de roda com anel magnético danificado ou invertido',
      'Chicote flexível da suspensão rompido pelo movimento da direção',
    ],
  },
  {
    code: 'C0040',
    category: 'Chassis',
    title: 'Mau Funcionamento no Sensor de Velocidade da Roda Dianteira Direita',
    description: 'O módulo ABS detectou ausência de sinal de pulso na roda dianteira direita.',
    severity: 'ALTA',
    commonCauses: [
      'Sensor de roda dianteira direita danificado',
      'Fiação exposta ou com infiltração de água',
      'Folga excessiva no rolamento de cubo de roda',
    ],
  },
  {
    code: 'C0050',
    category: 'Chassis',
    title: 'Mau Funcionamento no Sensor de Velocidade da Roda Traseira Direita',
    description: 'Sinal irregular ou ausente do sensor de velocidade traseiro direito do sistema ABS.',
    severity: 'ALTA',
    commonCauses: [
      'Sensor de rotação traseiro danificado',
      'Oxidação no conector do sensor próximo ao eixo traseiro',
      'Lona ou tambor de freio acumulando pó metálico sobre o sensor',
    ],
  },
  {
    code: 'C0110',
    category: 'Chassis',
    title: 'Mau Funcionamento no Motor da Bomba Hidráulica do Módulo ABS/ESC',
    description: 'O motor elétrico da bomba de recirculação do bloco de válvulas hidráulicas do ABS não responde ao acionamento.',
    severity: 'CRÍTICA',
    commonCauses: [
      'Escovas do motor da bomba hidráulica desgastadas',
      'Relé de alimentação principal da bomba ABS colado ou queimado',
      'Fusível de alta corrente (30A-40A) do ABS rompido',
    ],
  },
  {
    code: 'C0121',
    category: 'Chassis',
    title: 'Circuito do Relé da Válvula Solenoide do ABS Inoperante',
    description: 'A central do ABS não consegue energizar as solenoides de modulação de pressão das rodas.',
    severity: 'CRÍTICA',
    commonCauses: [
      'Relé interno do módulo ABS queimado',
      'Perda de terra de potência do chicote do módulo',
      'Oxidação grave na régua de conectores do ABS',
    ],
  },
  {
    code: 'C0245',
    category: 'Chassis',
    title: 'Frequência do Sinal do Sensor de Velocidade de Roda Fora da Faixa',
    description: 'Discrepância acentuada entre as leituras de velocidade das quatro rodas em linha reta.',
    severity: 'MÉDIA',
    commonCauses: [
      'Pneus com medidas diferentes ou calibragem severamente divergente',
      'Anel magnético de rotação com dente quebrado',
      'Sensor com distância incorreta (entreferro excessivo)',
    ],
  },
  {
    code: 'C0561',
    category: 'Chassis',
    title: 'Desativação do Sistema de Controle de Tração / Estabilidade (ESP/TCS)',
    description: 'O módulo de freios desativou o controle de estabilidade devido a falhas ativas no motor (ex: corte de torque indisponível).',
    severity: 'ALTA',
    commonCauses: [
      'Falha de combustão ativa no motor (código P0300 gravado na ECU)',
      'Sensor de ângulo da coluna de direção (SAS) descalibrado',
      'Comunicação CAN instável entre motor e transmissão',
    ],
  },

  // ================= BODY / CARROCERIA (B0xxx / B1xxx) =================
  {
    code: 'B0001',
    category: 'Body',
    title: 'Circuito de Disparo do Airbag Frontal do Motorista (Estágio 1)',
    description: 'A central do airbag detectou resistência fora da especificação (normalmente entre 2.0 e 3.2 Ohms) na bolsa do volante.',
    severity: 'CRÍTICA',
    commonCauses: [
      'Cinta do volante (Hardwire / Cinta Flat do Airbag) rompida por esterçamento',
      'Conector do airbag solto ou com trava amarela violada',
      'Espoleta detonadora da bolsa com circuito aberto',
    ],
  },
  {
    code: 'B0020',
    category: 'Body',
    title: 'Circuito do Airbag Lateral Esquerdo (Bolsa do Banco do Motorista)',
    description: 'Resistência anômala no circuito do airbag lateral instalado na lateral do assento do condutor.',
    severity: 'ALTA',
    commonCauses: [
      'Conector sob o banco do motorista frouxo ou esmagado por objetos',
      'Fio do chicote do assento rompido por ajuste frequente do trilho',
      'Módulo lateral detonador avariado',
    ],
  },
  {
    code: 'B0090',
    category: 'Body',
    title: 'Mau Funcionamento no Sensor de Impacto Frontal do Airbag',
    description: 'O módulo SRS não consegue comunicar-se com o acelerômetro de impacto montado na travessa dianteira.',
    severity: 'CRÍTICA',
    commonCauses: [
      'Sensor de impacto frontal oxidado ou quebrado por colisão prévia',
      'Chicote exposto na frente do radiador rompido',
      'Aterramento do sensor com ferrugem',
    ],
  },
  {
    code: 'B1000',
    category: 'Body',
    title: 'Falha de Comunicação Interna no Módulo de Controle da Carroceria (BCM)',
    description: 'O módulo de conforto e carroceria falhou nos testes internos de memória ROM/RAM.',
    severity: 'ALTA',
    commonCauses: [
      'Subtensão severa provocada por partida com bateria esgotada',
      'Infiltração de água através do para-brisa sobre o módulo BCM',
      'Curto-circuito na fiação das travas elétricas ou iluminação interna',
    ],
  },
  {
    code: 'B1325',
    category: 'Body',
    title: 'Tensão de Alimentação dos Módulos de Carroceria Abaixo de 10.5V',
    description: 'A rede de módulos de conforto registrou queda na linha 30/15 de alimentação positiva.',
    severity: 'MÉDIA',
    commonCauses: [
      'Bateria com carga residual fraca',
      'Mau contato no fusível principal do compartimento do painel',
      'Consumo parasitário descarregando o veículo desligado',
    ],
  },
  {
    code: 'B1440',
    category: 'Body',
    title: 'Mau Funcionamento no Comutador de Ignição / Botão Start-Stop',
    description: 'Incongruência de sinais entre as posições de Acessório, Ignição e Partida.',
    severity: 'ALTA',
    commonCauses: [
      'Comutador elétrico da chave de ignição desgastado',
      'Botão Start/Stop com teclas resistivas falhando',
      'Antena receptora do transponder imobilizador com sinal fraco',
    ],
  },

  // ================= NETWORK / REDE CAN (U0xxx / U1xxx) =================
  {
    code: 'U0001',
    category: 'Network',
    title: 'Barramento de Comunicação CAN de Alta Velocidade Inoperante (CAN Bus Off)',
    description: 'O controlador CAN detectou nível lógico contínuo de erro, desativando o nó do barramento para proteção.',
    severity: 'CRÍTICA',
    commonCauses: [
      'Linhas CAN-H ou CAN-L em curto entre si, com o terra ou com positivo 12V',
      'Resistores de terminação de 120 Ohms rompidos (resistência fora dos 60 Ohms)',
      'Módulo elétrico queimado derrubando o barramento compartilhado',
    ],
  },
  {
    code: 'U0100',
    category: 'Network',
    title: 'Perda de Comunicação com o Módulo de Controle do Motor (ECM/PCM)',
    description: 'Os demais módulos do veículo (Painel, BCM, ABS) deixaram de receber as mensagens periódicas da central do motor.',
    severity: 'CRÍTICA',
    commonCauses: [
      'ECU sem alimentação (fusível do relé principal da injeção queimado)',
      'Linha de aterramento da central rompida',
      'Ruptura dos pares trançados da rede CAN no chicote do cofre',
    ],
  },
  {
    code: 'U0101',
    category: 'Network',
    title: 'Perda de Comunicação com o Módulo da Transmissão Automática (TCM)',
    description: 'A central do motor e o painel de instrumentos não conseguem se comunicar com o módulo do câmbio automático.',
    severity: 'CRÍTICA',
    commonCauses: [
      'Módulo da transmissão (mechatronic) sem alimentação 12V',
      'Infiltração de óleo de transmissão no conector elétrico da TCM',
      'Fusível da linha de transmissão queimado',
    ],
  },
  {
    code: 'U0121',
    category: 'Network',
    title: 'Perda de Comunicação com o Módulo do Sistema Antibloqueio de Freios (ABS)',
    description: 'Nenhum dado de velocidade de rodas ou status de frenagem está sendo transmitido pelo módulo ABS para a rede do veículo.',
    severity: 'ALTA',
    commonCauses: [
      'Fusível principal da centralina ABS queimado',
      'Conector de 38 vias do bloco hidráulico do ABS desconectado',
      'Quebra dos fios da rede CAN que chegam à torre do ABS',
    ],
  },
  {
    code: 'U0140',
    category: 'Network',
    title: 'Perda de Comunicação com o Módulo de Controle da Carroceria (BCM / Gateway)',
    description: 'O módulo central de controle de carroceria deixou de rotear mensagens entre a rede de alta velocidade (powertrain) e a de baixa (conforto).',
    severity: 'ALTA',
    commonCauses: [
      'Fusível de alimentação do Gateway / BCM queimado',
      'Pinos tortos ou oxidados no chicote de entrada do painel',
      'Módulo BCM travado por transiente de voltagem',
    ],
  },
  {
    code: 'U0155',
    category: 'Network',
    title: 'Perda de Comunicação com o Painel de Instrumentos (Cluster)',
    description: 'O quadro de instrumentos não envia nem recebe mensagens CAN, impossibilitando exibição de velocidade, RPM e avisos de advertência.',
    severity: 'MÉDIA',
    commonCauses: [
      'Solda fria nos pinos do conector traseiro do painel de instrumentos',
      'Queda de alimentação 12V contínua do painel',
      'Microcontrolador do cluster inoperante',
    ],
  },
  {
    code: 'U0401',
    category: 'Network',
    title: 'Dados Inválidos Recebidos do Módulo de Controle do Motor (ECM)',
    description: 'A central de freios ABS ou da transmissão recebeu pacotes de dados corrompidos ou com checksum inválido emitidos pela ECU.',
    severity: 'MÉDIA',
    commonCauses: [
      'Interferência eletromagnética gerada por velas ou bobinas não resistivas',
      'Software da central com calibração corrompida',
      'Instabilidade na linha de dados do barramento CAN',
    ],
  },
];

export function searchOfflineDtc(
  query: string,
  categoryFilter?: 'ALL' | 'Powertrain' | 'Chassis' | 'Body' | 'Network'
): DtcDefinition[] {
  const normalized = query.trim().toUpperCase();

  return OFFLINE_DTC_CATALOG.filter((item) => {
    if (categoryFilter && categoryFilter !== 'ALL' && item.category !== categoryFilter) {
      return false;
    }

    if (!normalized) return true;

    const matchesCode = item.code.toUpperCase().includes(normalized);
    const matchesTitle = item.title.toUpperCase().includes(normalized);
    const matchesDescription = item.description.toUpperCase().includes(normalized);
    const matchesCauses = item.commonCauses.some((c) =>
      c.toUpperCase().includes(normalized)
    );

    return matchesCode || matchesTitle || matchesDescription || matchesCauses;
  });
}
