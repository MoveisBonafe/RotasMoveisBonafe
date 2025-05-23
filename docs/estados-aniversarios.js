/**
 * DADOS OFICIAIS DE ANIVERSÁRIOS DE CIDADES
 * Lista completa e unificada de aniversários de cidades
 * dos estados de São Paulo e Minas Gerais
 */

// Dados de aniversários de cidades por estado e data
const aniversariosCidades = {
  // São Paulo - organizado por mês e dia
  // Correções oficiais (prioridade)
  'correcoes': {
    'Ribeirão Preto': { dia: '19', mes: '06' }
  },
  
  'SP': {
    '01': { // Janeiro
      '01': ['Uru'],
      '06': ['Morro Agudo', 'Dirce Reis'],
      '07': ['Teodoro Sampaio'],
      '09': ['Iaras', 'Motuca', 'Borebi', 'Embaúba'],
      '12': ['Iporanga'],
      '14': ['Miguelópolis'],
      '16': ['Quatá'],
      '19': ['Praia Grande'],
      '20': ['Braúna', 'Cardoso', 'Itaju', 'Parisi', 'Piraju', 'Sabino', 'Santa Cruz do Rio Pardo'],
      '22': ['São Vicente'],
      '25': ['São Paulo', 'Buri', 'Estrela D\'Oeste', 'Vera Cruz'],
      '26': ['Santos', 'Santo Antônio do Pinhal'],
      '30': ['Barbosa']
    },
    '02': { // Fevereiro
      '02': ['Itu'],
      '04': ['Dois Córregos'],
      '18': ['Cajamar', 'Cândido Rodrigues', 'Cássia dos Coqueiros', 'Colômbia', 'Embu', 'Itapevi', 'Luís Antônio', 'Luiziânia', 'Pardinho', 'Peruíbe', 'Salmorão', 'Sarutaiá', 'Taguaí', 'Bady Bassitt'],
      '19': ['Osasco', 'Severínia', 'Taboão da Serra', 'Tapiraí'],
      '20': ['São Pedro'],
      '21': ['Mira Estrela'],
      '22': ['Restinga', 'Salesópolis', 'Sebastianópolis do Sul', 'Silveiras'],
      '28': ['Paulínia']
    },
    '03': { // Março
      '02': ['Olímpia'],
      '04': ['Queluz'],
      '05': ['Ilha Comprida', 'Lourdes'],
      '06': ['Itaporanga'],
      '07': ['Pirangi'],
      '08': ['Tietê'],
      '09': ['Altinópolis', 'São José do Barreiro'],
      '10': ['Campos Novos Paulista', 'Eldorado', 'Monte Aprazível', 'Patrocínio Paulista'],
      '11': ['Angatuba'],
      '12': ['Itapirapuã Paulista', 'Nova Campinas'],
      '13': ['Sarapuí'],
      '14': ['Batatais', 'Cristina'],
      '16': ['Guareí', 'São Sebastião'],
      '17': ['Indiana'],
      '18': ['Jaborandi'],
      '19': ['Arandu', 'Aspásia', 'Barra Bonita', 'Caiuá', 'Corumbataí', 'Cravinhos', 'Flora Rica', 'João Ramalho', 'Meridiano', 'Panorama', 'Ribeirão Pires', 'São José do Rio Pardo', 'São José do Rio Preto', 'Taiaçu'],
      '20': ['Piquerobi'],
      '21': ['Américo Brasiliense', 'Barão de Antonina', 'Barra do Turvo', 'Biritiba Mirim', 'Borborema', 'Coronel Macedo', 'Dumont', 'Estrela do Norte', 'Francisco Morato'],
      '22': ['Aparecida D\'Oeste', 'Nova Granada', 'Onda Verde', 'Santa Adélia'],
      '23': ['Ouro Verde', 'Viradouro'],
      '24': ['Araras', 'Cabreúva', 'Ibiúna', 'Monte Mor'],
      '25': ['Getulina', 'Itirapina'],
      '26': ['Barueri', 'Carapicuíba', 'Ipuã', 'Poá', 'Riolândia', 'Santo Antônio do Jardim', 'Terra Roxa'],
      '27': ['Bento de Abreu', 'Itapuã', 'Presidente Epitácio'],
      '28': ['Dobrada', 'Embu-Guaçu', 'Guzolândia', 'Juquitiba', 'Queiroz', 'Uchôa'],
      '29': ['Campo Limpo Paulista', 'Pirajuí'],
      '30': ['Jambeiro', 'Orlândia'],
      '31': ['Borá', 'Fartura']
    },
    '04': { // Abril
      '01': ['Arealva', 'São Miguel Arcanjo'],
      '02': ['Alumínio', 'Capão Bonito', 'Cotia', 'Pacaembu', 'Pongaí', 'Suzano', 'Ubirajara', 'Vinhedo'],
      '03': ['Cerquilho', 'Jacareí', 'Planalto', 'Reginópolis', 'São José da Bela Vista'],
      '04': ['Aramina', 'Cruzália', 'Itajobi', 'Jaci', 'Marília'],
      '05': ['Mococa'],
      '06': ['Pedra Bela'],
      '07': ['Araçoiaba da Serra', 'Jeriquara', 'Óleo', 'Ribeirão Corrente', 'Torrinha'],
      '08': ['Amparo', 'Santo André', 'Pontes Gestal'],
      '09': ['Conchal', 'Cubatão', 'Itariri', 'Mogi-Guaçu', 'Pedro de Toledo', 'Pirapozinho'],
      '10': ['Ariranha', 'Artur Nogueira', 'Juquiá', 'Serrana'],
      '11': ['Cafelândia'],
      '14': ['Botucatu', 'Caçapava', 'Catanduva', 'Gália'],
      '15': ['Anhembi', 'Iacanga', 'Jales'],
      '17': ['Jarinu'],
      '20': ['Caraguatatuba', 'Cunha', 'Paranapanema', 'Águas de Santa Bárbara'],
      '21': ['Colina', 'Lins'],
      '22': ['Itanhaém'],
      '24': ['Oscar Bressane'],
      '25': ['Itaberá', 'Tejupá'],
      '26': ['Monteiro Lobato', 'Santo Expedito', 'Tabatinga'],
      '28': ['Lençóis Paulista'],
      '29': ['Campos do Jordão']
    },
    '05': { // Maio
      '01': ['Muritinga do Sul', 'Promissão'],
      '02': ['Guapira', 'Macaubal'],
      '03': ['Areiópolis', 'Bebedouro', 'Brotas', 'Catiguá', 'Cesário Lange', 'Iracemápolis', 'Pinhalzinho', 'Poloni', 'Redenção da Serra', 'Rio Grande da Serra', 'Santa Cruz da Conceição', 'Santa Cruz das Palmeiras', 'Santópolis do Aguapeí', 'São Francisco', 'Valentim Gentil'],
      '05': ['Garça'],
      '06': ['Irapuru'],
      '07': ['Boracéia'],
      '08': ['Itapecerica da Serra', 'Santo Antônio do Aracanguá', 'São Luíz do Paraitinga'],
      '12': ['Indiaporã'],
      '13': ['Cajobi'],
      '15': ['Monte Alto'],
      '18': ['Guaíra'],
      '19': ['Araçariguama', 'Arapeí', 'Barra do Chapéu', 'Bertioga', 'Canitar', 'Dourado', 'Estiva Gerbi', 'Novais', 'Hortolândia', 'Potim', 'Ribeirão Grande', 'Saltinho', 'Tuiuti'],
      '20': ['Piedade'],
      '22': ['Bom Jesus dos Perdões', 'Cássia dos Coqueiros', 'Fernandópolis', 'Iguarapava', 'Neves Paulista', 'Pederneiras', 'Santa Branca', 'Sales de Oliveira', 'Santa Rita D\'Oeste', 'Santa Rita do Passa Quatro'],
      '23': ['Bocaina'],
      '28': ['Valinhos'],
      '29': ['São Pedro do Turvo'],
      '30': ['Palestina', 'São Joaquim da Barra', 'Valparaíso']
    },
    '06': { // Junho
      '04': ['Porangaba'],
      '06': ['Osvaldo Cruz'],
      '08': ['Arujá'],
      '10': ['Adamantina', 'Cachoeira Paulista', 'Cordeirópolis', 'Coroados', 'Guaratinguetá', 'Itaí', 'Junquerirópolis', 'Macatuba', 'Martinópolis', 'Mirassolândia', 'Ocauçu', 'Paraibuna', 'Rancharia', 'Santo Antônio da Alegria', 'Santo Antônio de Posse', 'Suzanápolis', 'Taiúva', 'Urânia', 'Uru'],
      '13': ['Pradópolis'],
      '14': ['Balbinos'],
      '15': ['Piquete'],
      '16': ['Bariri', 'Piracaia'],
      '17': ['São Manuel'],
      '19': ['Ribeirão Preto'],
      '21': ['Analândia', 'Cedral', 'Iacri'],
      '23': ['Jacupiranga'],
      '24': ['Álvares Florence', 'Américo de Campos', 'Atibaia', 'Clementina', 'Gastão Vidigal', 'Ibaté', 'Joanópolis', 'José Bonifácio', 'Lucélia', 'Mirandópolis', 'Populina', 'Rio Claro', 'Santa Albertina', 'Santa Fé do Sul', 'São João da Boa Vista', 'São João das Duas Pontes', 'São João do Pau D\'Alho', 'Salto de Pirapora'],
      '27': ['Lavrinhas'],
      '28': ['Regente Feijó'],
      '29': ['Lucianópolis', 'Monte Azul Paulista', 'Morungaba', 'Nova Canaã Paulista', 'Paulicéia'],
      '30': ['Guarujá']
    },
    '07': { // Julho
      '01': ['Assis'],
      '02': ['Águas da Prata'],
      '04': ['Ibitinga'],
      '05': ['Fernandópolis'],
      '10': ['Bananal', 'Bariri', 'Pindamonhangaba', 'Rio das Pedras', 'Santa Izabel'],
      '11': ['Andradina'],
      '14': ['Campinas'],
      '16': ['Jaboticabal'],
      '18': ['Bastos'],
      '19': ['Turiúba'],
      '22': ['Boa Esperança do Sul'],
      '24': ['Itatinga', 'Alto Alegre'],
      '25': ['Águas de São Pedro'],
      '26': ['Areias', 'Sumaré'],
      '27': ['Agudos', 'Jardinópolis', 'Pitangueiras', 'São José dos Campos'],
      '28': ['São Caetano do Sul'],
      '29': ['Porto Ferreira']
    },
    '08': { // Agosto
      '01': ['Bauru', 'Piracicaba'],
      '06': ['Aguaí', 'Floreal', 'Monte Alegre do Sul', 'Pedranópolis', 'Pirapora do Bom Jesus', 'Pirassununga', 'Ribeirão Bonito', 'Turmalina', 'Mesópolis', 'Ponta Linda'],
      '08': ['Alvilândia', 'Votuporanga'],
      '09': ['Socorro'],
      '10': ['Castilho'],
      '11': ['Pereira Barreto', 'Tatuí'],
      '12': ['Cananéia'],
      '13': ['Natividade da Serra'],
      '14': ['Apiaí'],
      '15': ['Jaú', 'Paraíso', 'Sorocaba'],
      '16': ['Cristais Paulista', 'Pedregulho', 'Santa Gertrudes', 'São Bento do Sapucaí', 'São Roque', 'Taquaritinga', 'Taquarituba'],
      '18': ['Cajuru', 'Guarani D\'Oeste'],
      '20': ['Rincão', 'São Bernardo do Campo', 'Tambaú'],
      '22': ['Araraquara', 'Brodowski'],
      '24': ['Buritama', 'Rubiácea'],
      '25': ['Barretos'],
      '27': ['Americana', 'Itobi', 'Matão'],
      '28': ['Itararé', 'Tupi Paulista'],
      '29': ['Leme', 'Mineiros do Tietê']
    },
    '09': { // Setembro
      '01': ['Mogi das Cruzes'],
      '02': ['Presidente Venceslau'],
      '03': ['Ilhabela'],
      '04': ['Santa Rosa do Viterbo'],
      '05': ['Boituva', 'Ribeirão Branco'],
      '06': ['Buritizal', 'Descalvado', 'Itaquaquecetuba', 'Mirassol', 'Nipoã'],
      '09': ['Nuporanga'],
      '10': ['Sud Mennucci'],
      '11': ['Itapuí', 'Marabá Paulista'],
      '12': ['Jaguariúna'],
      '14': ['Presidente Prudente'],
      '15': ['Avaré', 'Guará', 'Limeira', 'Nova Odessa', 'Euclides da Cunha Paulista'],
      '17': ['Paranapuã', 'Pompéia'],
      '19': ['Guararema'],
      '20': ['Ipaussu', 'Itapeva'],
      '21': ['Guariba', 'Pedrinhas Paulista'],
      '22': ['Nuporanga'],
      '23': ['Serra Negra'],
      '24': ['Urupês'],
      '26': ['Vargem Grande do Sul']
    },
    '10': { // Outubro
      '02': ['Cruzeiro'],
      '03': ['Rubinéia', 'Magda'],
      '04': ['Capela do Alto'],
      '09': ['Bernardino de Campos'],
      '10': ['Cerqueira César', 'Cosmorama', 'Laranjal Paulista'],
      '12': ['Nova Aliança', 'Presidente Bernardes', 'Rinópolis', 'Três Fronteiras', 'Tupã', 'Guaraçaí'],
      '13': ['Porto Feliz'],
      '14': ['Ferraz de Vasconcelos'],
      '15': ['Ilha Solteira'],
      '18': ['Pontal'],
      '19': ['Igaraçu do Tietê', 'Dolcinópolis'],
      '20': ['Itápolis', 'Nova Guataporanga', 'Ribeira', 'Tarumã'],
      '22': ['Mogi Mirim'],
      '24': ['Itapira', 'Timburi'],
      '25': ['Casa Branca', 'Flórida Paulista']
    },
    '11': { // Novembro
      '01': ['Bilac', 'Franca', 'Presidente Alves'],
      '02': ['Divinolândia', 'Francisco Morato', 'Rafard'],
      '03': ['Birigui', 'Nova Europa', 'Pindorama', 'Urupês'],
      '05': ['Bragança Paulista', 'Cajati', 'Nazaré Paulista', 'Nova Luzitânia', 'Novo Horizonte'],
      '06': ['Santa Mercedes'],
      '07': ['Guarulhos', 'Fernando Prestes', 'Lucianópolis'],
      '08': ['Quintana', 'Monções'],
      '09': ['Duartina', 'Dracena', 'Santa Maria da Serra'],
      '10': ['Batatais'],
      '11': ['Guaiçara', 'Taquaral'],
      '12': ['Marapoama', 'Orindiúva'],
      '14': ['Guararapes'],
      '15': ['Álvaro de Carvalho', 'Guaraçaí', 'Lutécia'],
      '16': ['Bom Sucesso de Itararé'],
      '17': ['Mauá', 'Mirante do Paranapanema', 'Paulo de Faria'],
      '18': ['Franco da Rocha', 'Morro Agudo', 'Icém'],
      '19': ['Indaiatuba', 'Presidente Prudente', 'Santo Anastácio'],
      '20': ['Itapura', 'Mogi das Cruzes', 'Riversul'],
      '21': ['Monte Castelo', 'Pereiras', 'Salto Grande'],
      '22': ['Quatá', 'São Luiz do Paraitinga'],
      '23': ['Irapuã', 'Nipoã', 'Rancharia'],
      '24': ['Barrinha', 'Itapecerica da Serra', 'Manduri', 'Osvaldo Cruz'],
      '26': ['Macedônia', 'Mongaguá', 'Silveiras'],
      '27': ['Jundiaí', 'São José do Rio Preto'],
      '28': ['Ribeirão Bonito'],
      '29': ['Castilho', 'Espírito Santo do Pinhal', 'Guapiara', 'Laranjal Paulista', 'Palmital'],
      '30': ['Ariranha', 'Itapeva', 'Roseira', 'Santa Bárbara d\'Oeste']
    },
    '12': { // Dezembro
      '01': ['Álvares Machado', 'Araçatuba', 'Cafelândia', 'Diadema', 'Glicério', 'Lorena', 'Mariápolis', 'Narandiba', 'Palmares Paulista', 'Sabino', 'Tupã'],
      '02': ['Cândido Mota', 'Gavião Peixoto', 'Salto', 'Vargem'],
      '03': ['Auriflama', 'Estrela d\'Oeste', 'Holambra', 'Ibitinga', 'Louveira', 'Mombuca', 'Nova Castilho', 'Santa Rita do Passa Quatro'],
      '06': ['Mogi Mirim', 'Rio Grande da Serra'],
      '08': ['Cunha', 'São Sebastião da Grama'],
      '10': ['Ibirarema', 'Monções', 'Santo Antônio da Alegria', 'Viradouro'],
      '11': ['Anhumas', 'Pedregulho', 'Santa Cruz do Rio Pardo'],
      '12': ['Gabriel Monteiro', 'Narandiba', 'Nhandeara', 'Oscar Bressane', 'Parapuã', 'Presidente Epitácio', 'Quatá', 'São José do Rio Pardo'],
      '13': ['Agissê', 'Santo Anastácio', 'Ubatuba'],
      '14': ['Altair', 'Dolcinópolis', 'Santa Fé do Sul', 'São Simão', 'Vinhedo'],
      '15': ['Embu-Guaçu', 'Inúbia Paulista', 'Mariápolis', 'Pedreira', 'Sagres', 'São Carlos'],
      '17': ['Américo de Campos', 'Garça'],
      '18': ['Adolfo', 'Bady Bassitt', 'Bananal', 'Braúna', 'Guarantã', 'Herculândia', 'Itatiba', 'Mariápolis', 'Mendonça', 'Nova Independência', 'Ouroeste', 'Pontalinda', 'Presidente Venceslau', 'Santa Ernestina', 'Torrinha'],
      '19': ['Populina', 'Trabiju'],
      '20': ['Buri', 'Echaporã'],
      '21': ['Igaratá', 'Jumirim', 'Ribeirão dos Índios'],
      '22': ['Canas', 'Junqueirópolis', 'Ouro Verde', 'Paranapuã', 'Rosana', 'Rubinéia', 'Santana de Parnaíba'],
      '23': ['Bilac', 'Iguape', 'Itaoca', 'Pilar do Sul', 'Sandovalina'],
      '24': ['Águas de Lindóia', 'Cabrália Paulista', 'Indiana', 'Itatinga', 'Mirante do Paranapanema', 'São José dos Campos'],
      '25': ['Campina do Monte Alegre', 'Hortolândia', 'Itariri'],
      '26': ['Itapetininga', 'Potirendaba', 'Tuiuti', 'Vista Alegre do Alto'],
      '27': ['Garça'],
      '28': ['Bernardino de Campos', 'Franco da Rocha', 'Gália', 'Pracinha', 'Registro', 'Ribeirão Preto', 'Sales Oliveira', 'Santa Cruz da Conceição'],
      '29': ['Altinópolis', 'General Salgado', 'Indaiatuba', 'Irapuã', 'Registro', 'Salto'],
      '30': ['Araçoiaba da Serra', 'Caiuá', 'Ilha Comprida', 'Presidente Prudente', 'Ribeirão Pires', 'Santalúcia'],
      '31': ['Buritizal', 'Espírito Santo do Turvo', 'Nantes', 'Pindorama', 'Piquerobi', 'Quadra', 'Salmourão', 'Sete Barras', 'Votuporanga']
    }
  },
  
  // Minas Gerais - organizado por mês/dia
  'MG': {
    '01': { // Janeiro
    },
    '02': { // Fevereiro
    },
    '03': { // Março
      '14': ['Cristina']
    },
    '04': { // Abril
    },
    '05': { // Maio
    },
    '06': { // Junho
    },
    '07': { // Julho
    },
    '08': { // Agosto
    },
    '09': { // Setembro
      '01': ['Passa Quatro'],
      '05': ['Mutum'],
      '06': ['Muriaé'],
      '08': ['Baependi', 'Bom Sucesso', 'Buritis', 'Francisco Sá', 'Patrocínio'],
      '10': ['Areado', 'Nova Resende'],
      '13': ['Machado', 'Rio Novo'],
      '14': ['Carmo do Cajuru', 'Itanhomi', 'Jequeri', 'Malacacheta', 'Manhumirim', 'Matozinhos', 'Pratápolis', 'Tarumirim', 'Teixeiras'],
      '15': ['Açucena', 'Barbacena', 'Boa Esperança', 'Guaxupé', 'Ibiraci', 'Itaguara', 'Januária', 'Pará de Minas'],
      '16': ['Brazópolis', 'Campos Gerais', 'Carmo de Minas', 'Caxambu', 'Esmeraldas', 'Extrema', 'Guaranésia', 'Itaúna', 'Ituiutaba', 'Jacutinga', 'Lambari', 'Carmópolis de Minas'],
      '17': ['Morada Nova de Minas'],
      '18': ['Aimorés'],
      '19': ['Estrela do Sul', 'Oliveira', 'Raul Soares', 'Ubá'],
      '21': ['Araçuaí', 'Rio Preto', 'Santa Maria do Suaçuí'],
      '23': ['Campos Altos', 'Ferros', 'Três Corações', 'Três Pontas'],
      '24': ['Brumadinho', 'Mar de Espanha', 'Mercês'],
      '28': ['Além Paraíba', 'Campo Belo', 'Visconde do Rio Branco'],
      '29': ['Guanhães', 'Jequitinhonha', 'Nova Ponte', 'Rio Piracicaba', 'Santos Dumont'],
      '30': ['Viçosa', 'São Gotardo']
    },
    '10': { // Outubro
    },
    '11': { // Novembro
    },
    '12': { // Dezembro
    }
  }
};

// Exportar os dados para uso em outros scripts
window.aniversariosCidades = aniversariosCidades;