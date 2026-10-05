export const INITIAL_GAMES = [
  // 1. CIENCIAS SOCIALES / GEOGRAFÍA Y TURISMO (Satelital)
  {
    id: 'geo-colombia-mundo',
    title: 'GeoTurismo: Crónicas y Bitácoras de Expedición por Colombia y el Mundo',
    category: 'geografia',
    subject: 'Ciencias Sociales • Geografía & Mapas Satelitales',
    description: 'Lee las bitácoras de viaje de exploradores, examina el terreno en alta resolución con el mapa satelital interactivo y deduce la ubicación de los tesoros naturales y culturales.',
    coverImage: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80',
    badge: 'Gran Explorador Satelital',
    type: 'map',
    pointsPerSuccess: 20,
    questions: [
      {
        id: 1,
        placeName: 'Caño Cristales (El Río de los Siete Colores)',
        country: 'Colombia',
        region: 'Serranía de la Macarena, Meta',
        image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
        model3d: 'cano-cristales',
        lat: 2.2619,
        lng: -73.7916,
        zoom: 14,
        storyTitle: 'Bitácora del Explorador: El Río que Escapó del Paraíso',
        storyText: `Avanzamos por senderos de piedra arenisca bajo el sol llanero. La Serranía de la Macarena se levanta como un escudo rocoso que data de hace más de mil millones de años. Al llegar al lecho de Caño Cristales, la corriente transparente parece suspendida en el aire. No es el agua la que posee color, sino las colonias de 'Macarenia clavigera', una planta acuática endémica que se aferra con tenacidad a las rocas.\n\nDurante la época de lluvias, entre junio y noviembre, la planta florece en tonalidades fucsia, escarlata, ocre y verde esmeralda. Los biólogos nos explican que el agua es tan pura y carente de nutrientes que no alberga peces; sin embargo, este equilibrio es extremadamente frágil. Una sola gota de repelente químico o protector solar arrojada por un turista desprevenido puede marchitar hectáreas enteras de estas plantas vivas.`,
        question: 'Según la bitácora del explorador, ¿cuál es la razón científica por la cual Caño Cristales adquiere sus intensos colores fucsias y verdes?',
        options: [
          'Por las colonias de la planta acuática endémica Macarenia clavigera adheridas a las rocas',
          'Porque el agua contiene tintes minerales disueltos provenientes de volcanes',
          'Por el reflejo del sol sobre peces multicolores que habitan en el fondo',
          'Porque los pobladores vierten pigmentos naturales durante las festividades'
        ],
        answer: 0,
        level: 'Comprensión Literal (Información explícita)',
        curiosity: '¡Correcto! La Macarenia clavigera es una planta endémica única en el planeta que solo crece en este ecosistema rocoso protegido.'
      },
      {
        id: 2,
        placeName: 'Valle del Cocora y la Palma de Cera',
        country: 'Colombia',
        region: 'Salento, Quindío - Cordillera Central',
        image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
        model3d: 'palma-cera',
        lat: 4.6369,
        lng: -75.4859,
        zoom: 14,
        storyTitle: 'Bitácora Andina: Los Gigantes Verdes entre la Niebla',
        storyText: `El aire frío de la cordillera cala en los huesos mientras la neblina desciende suavemente sobre las colinas verdes de Salento. De repente, entre la bruma, emergen columnas esbeltas que desafían la gravedad: son las Palmas de Cera del Quindío, los árboles nacionales de Colombia, capaces de superar los sesenta metros de altura y vivir más de dos siglos.\n\nAntiguamente, los campesinos extraían la cera de su tronco para fabricar velas y talaban sus hojas tiernas durante el Domingo de Ramos. Esta práctica casi lleva a la extinción al loro orejiamarillo, un ave que depende exclusivamente de los troncos huecos de estas palmas para anidar y alimentarse. Hoy, gracias a leyes de protección ambiental y al ecoturismo comunitario, el valle se ha convertido en un aula viva donde cada visitante comprende que proteger la flora es salvar a la fauna.`,
        question: '¿Qué relación de interdependencia ecológica se deduce entre la Palma de Cera y el loro orejiamarillo?',
        options: [
          'El loro necesita exclusivamente los troncos y frutos de la palma para nidificar y sobrevivir, por lo que talar la palma destruye a la especie',
          'El loro ayuda a talar las palmas enfermas para que crezcan nuevos bosques',
          'La palma utiliza el plumaje del loro para protegerse de los vientos fríos',
          'No existe ninguna relación entre ambas especies en el bosque de niebla'
        ],
        answer: 0,
        level: 'Comprensión Inferencial (Relación causa-efecto)',
        curiosity: '¡Brillante deducción! En 1985 la Palma de Cera fue declarada árbol nacional de Colombia mediante la Ley 61, salvando al loro orejiamarillo.'
      },
      {
        id: 3,
        placeName: 'Castillo San Felipe de Barajas',
        country: 'Colombia',
        region: 'Cartagena de Indias, Bolívar',
        image: 'https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=800&q=80',
        model3d: 'castillo-san-felipe',
        lat: 10.4225,
        lng: -75.5392,
        zoom: 16,
        storyTitle: 'Crónica Colonial: El Fuerte Inexpugnable del Caribe',
        storyText: `Bajo el ardiente sol caribeño, la mole de roca coralina y ladrillo del cerro San Lázaro domina la bahía de Cartagena. Iniciada su construcción en 1536 y ampliada durante siglos por ingenieros militares y manos de trabajadores afrodescendientes e indígenas, esta fortaleza fue diseñada para resistir asedios marítimos y terrestres.\n\nAl internarnos en su laberinto de túneles subterráneos, el guía nos pide guardar absoluto silencio. Susurra a cincuenta metros de distancia y su voz resuena clara junto a nuestro oído. Este ingenio acústico permitía a los centinelas españoles detectar las pisadas de los invasores o las vibraciones de zapadores ingleses intentando colocar pólvora bajo los muros. En 1741, el almirante inglés Edward Vernon atacó la ciudad con una flota descomunal, pero la estrategia defensiva del castillo selló una de las mayores resistencias militares de la historia americana.`,
        question: 'A partir de la lectura de la crónica, ¿qué valor histórico y arquitectónico representan los túneles subterráneos del castillo?',
        options: [
          'Constituyen un sistema defensivo con ingeniería acústica para anticipar invasiones y ataques enemigos',
          'Eran depósitos donde los comerciantes guardaban alimentos para vender a los barcos',
          'Servían únicamente como prisiones secretas para piratas capturados',
          'Eran acueductos diseñados para llevar agua dulce a la playa'
        ],
        answer: 0,
        level: 'Comprensión Crítica e Interpretativa',
        curiosity: 'Los túneles fueron diseñados con pendientes estratégicas y trampas sonoras que permitían neutralizar al enemigo en completa oscuridad.'
      },
      {
        id: 4,
        placeName: 'Páramo de Chingaza y Lagunas Sagradas',
        country: 'Colombia',
        region: 'Cundinamarca y Meta - Cordillera Oriental',
        image: 'https://images.unsplash.com/photo-1619546952812-520e98074a52?auto=format&fit=crop&w=800&q=80',
        model3d: 'frailejon-water',
        lat: 4.6750,
        lng: -73.7667,
        zoom: 12,
        storyTitle: 'Bitácora del Agua: Donde Nace la Vida de Millones',
        storyText: `Caminamos a más de tres mil ochocientos metros sobre el nivel del mar, en un reino donde el silencio solo es interrumpido por el silbido del viento helado. El páramo parece un tapiz acolchado de musgos esfagno y miles de frailejones ('Espeletia') vestidos con vellosidades blanquecinas que protegen sus hojas del frío extremo.\n\nLos guías nos muestran cómo las hojas esponjosas del frailejón atrapan las microscópicas gotas de agua de la neblina andina. Esas gotas se deslizan por el tallo hasta el suelo de turba, filtrándose lentamente hacia arroyos cristalinos que nutren el embalse de Chuza. De este ecosistema proviene más del setenta por ciento del agua potable que consumen millones de habitantes en Bogotá y municipios vecinos. El páramo no es una tierra yerma; es una colosal fábrica natural de vida que debemos proteger de la minería y la ganadería.`,
        question: '¿Qué compromiso ambiental (Saber Ser) se desprende fundamentalmente de la lectura sobre el Páramo de Chingaza?',
        options: [
          'Reconocer el páramo como fuente vital de agua y asumir el deber de ahorrar y cuidar este recurso desde el colegio y el hogar',
          'Promover la construcción de fábricas y carreteras en las alturas de la cordillera',
          'Arrancar frailejones para llevarlos como recuerdo a la casa',
          'Ignorar la procedencia del agua potable que llega a nuestros grifos'
        ],
        answer: 0,
        level: 'Comprensión Crítica / Dimensión Actitudinal',
        curiosity: '¡Exacto! Los páramos solo existen en las zonas ecuatoriales de alta montaña, y Colombia tiene el privilegio de albergar más del 50% de los páramos del mundo.'
      },
      {
        id: 5,
        placeName: 'Ciudadela Sagrada de Machu Picchu',
        country: 'Mundo (Perú)',
        region: 'Valle Sagrado de los Incas, Cusco',
        image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
        model3d: 'machu-picchu-terraces',
        lat: -13.1631,
        lng: -72.5450,
        zoom: 15,
        storyTitle: 'Crónica del Imperio del Sol: La Joya de las Alturas',
        storyText: `Enclavada sobre un promontorio rocoso entre los picos Machu Picchu y Huayna Picchu, a más de dos mil cuatrocientos metros de altitud, la ciudadela de piedra parece flotar sobre las nubes que ascienden del cañón del río Urubamba. Construida en el siglo XV durante el reinado del emperador inca Pachacútec, funcionó como centro ceremonial, astronómico y residencia de descanso real.\n\nLo que más asombra a los arqueólogos modernos es la técnica del 'ashlar': bloques de granito tallados con tal perfección geométrica que encajan sin necesidad de argamasa o cemento, resistiendo terremotos de gran magnitud durante siglos. Las terrazas agrícolas escalonadas no solo proveían maíz y hojas de coca a la comunidad, sino que prevenían la erosión de las laderas y canalizaban las abundantes lluvias andinas a través de un sofisticado acueducto de piedra que aún hoy continúa fluyendo.`,
        question: 'De acuerdo con el texto, ¿qué función ingenieril cumplían las terrazas agrícolas escalonadas en Machu Picchu?',
        options: [
          'Proveían alimentos, evitaban la erosión de las laderas montañosas y drenaban el agua de las lluvias',
          'Servían como murallas defensivas para disparar flechas a los barcos',
          'Eran asientos para que el pueblo presenciara juegos atléticos',
          'Eran tumbas subterráneas donde se guardaban tesoros de oro'
        ],
        answer: 0,
        level: 'Comprensión Inferencial y Textual',
        curiosity: 'Las terrazas contaban con capas de grava y arena bajo la tierra fértil para crear un sistema de drenaje antisísmico insuperable.'
      }
    ]
  },

  // 2. CIENCIAS SOCIALES / HISTORIA DE COLOMBIA & RUTA LIBERTADORA
  {
    id: 'historia-ruta-libertadora',
    title: 'Ruta Libertadora y Raíces Precolombinas: Historia de Colombia',
    category: 'historia',
    subject: 'Ciencias Sociales • Historia & Identidad Nacional',
    description: 'Viaja por los sitios históricos donde se forjó la libertad de Colombia. Descubre cómo las comunidades indígenas, campesinas y afrodescendientes construyeron nuestra nación.',
    coverImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    badge: 'Historiador Insigne',
    type: 'map',
    pointsPerSuccess: 20,
    questions: [
      {
        id: 1,
        placeName: 'Puente de Boyacá',
        country: 'Colombia',
        region: 'Ventaquemada y Tunja, Boyacá',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        model3d: 'puente-boyaca',
        lat: 5.4533,
        lng: -73.4022,
        zoom: 15,
        storyTitle: '7 de Agosto de 1819: La Batalla Crucial de la Libertad',
        storyText: `Sobre el pequeño puente de piedra que cruza el río Teatinos se selló el destino de la Nueva Granada. El ejército patriota, liderado por Simón Bolívar y Francisco de Paula Santander, venía de una hazaña sobrehumana: cruzar las cumbres heladas del Páramo de Pisba con campesinos descalzos, mujeres patriotas y la caballería llanera.\n\nEn una maniobra táctica fulminante que duró menos de dos horas, las tropas republicanas dividieron en dos al poderoso ejército realista del general Barreiro, cortándoles el paso hacia Santa Fe de Bogotá. La valentía del joven corneta Pedro Pascasio Martínez, de solo doce años, quien apresó al comandante enemigo sin dejarse sobornar con monedas de oro, quedó grabada como un ejemplo imborrable de lealtad y rectitud juvenil.`,
        question: '¿Qué valor cívico y ético personificó el joven Pedro Pascasio Martínez durante la Batalla de Boyacá?',
        options: [
          'La honradez y el rechazo al soborno en defensa de la causa justa de su patria',
          'La búsqueda de riquezas materiales a cualquier costo',
          'El miedo a los soldados que venían a caballo',
          'El deseo de rendirse ante los enemigos para recibir regalos'
        ],
        answer: 0,
        level: 'Comprensión Crítica e Histórica',
        curiosity: 'El Libertador Simón Bolívar ascendió a Pedro Pascasio al grado de sargento y le otorgó una condecoración nacional por su inquebrantable integridad moral.'
      },
      {
        id: 2,
        placeName: 'Monumento a los Catorce Lanceros del Pantano de Vargas',
        country: 'Colombia',
        region: 'Paipa, Boyacá',
        image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
        model3d: 'lanceros-vargas',
        lat: 5.7411,
        lng: -73.0803,
        zoom: 15,
        storyTitle: '¡Coronel, salve usted la patria!: El Pantano de Vargas',
        storyText: `El 25 de julio de 1819, en las colinas cenagosas de Paipa, la causa independentista parecía perdida. Las tropas patriotas estaban exhaustas y arrinconadas bajo el fuego implacable de los españoles. En ese instante supremo, Bolívar miró al coronel llanero Juan José Rondón y pronunció su famosa frase: '¡Coronel, salve usted la patria!'.\n\nRondón espoleó su caballo gritando: '¡Camaradas, los que sean valientes síganme!'. Catorce lanceros llaneros, montando a pelo y armados con lanzas de madera con puntas forjadas en fogones de campaña, cargaron cuesta arriba rompiendo las líneas enemigas con un arrojo que cambió el rumbo de la historia suramericana.`,
        question: '¿Cuál fue el elemento determinante que permitió a los lanceros ganar la contienda en el Pantano de Vargas?',
        options: [
          'La determinación heroica, la disciplina ecuestre y la audaz carga sorpresa cuesta arriba de la caballería llanera',
          'Tener armas de fuego automáticas y cañones de largo alcance',
          'Que el ejército contrario se retiró sin combatir para ir a cenar',
          'Que recibieron refuerzos en barcos de guerra por el pantano'
        ],
        answer: 0,
        level: 'Comprensión Textual e Histórica',
        curiosity: 'La colosal escultura de los 14 Lanceros, creada por el maestro Rodrigo Arenas Betancourt, es una de las obras de arte en bronce más grandes de Latinoamérica (33 metros de altura).'
      }
    ]
  },

  // 3. LENGUAJE / MITOS, LEYENDAS Y TRADICIÓN ORAL
  {
    id: 'lectura-mitos-misterio',
    title: 'Mitos, Misterios y Leyendas de Colombia: Comprensión Lectora Integral',
    category: 'lenguaje',
    subject: 'Lenguaje • Literatura & Tradición Oral',
    description: 'Historias de misterio y leyendas vivas de nuestra tierra. Lee con detenimiento, escucha la narración y resuelve desafíos de comprensión en 3 niveles cognitivos.',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    badge: 'Maestro de las Letras',
    type: 'reading',
    pointsPerSuccess: 20,
    questions: [
      {
        id: 'mohan-rio',
        placeName: 'Río Grande de la Magdalena',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        model3d: 'mohan-river',
        storyTitle: 'El Enigma del Mohán: Guardián de los Remolinos y las Aguas',
        storyText: `En las orillas tibias del gran Río Magdalena, cuando la luna llena se refleja como un espejo de plata sobre la corriente, los ancianos pescadores apagan sus lámparas de gas y hablan en voz baja. Dicen que en las profundidades rocosas, en cavernas donde el agua hierve en remolinos silenciosos, habita el Mohán.\n\nLo describen como un anciano corpulento de piel curtida por el barro y el sol, cabellera larga y marañosa que le llega hasta los talones, y ojos encendidos como brasas vivas en medio de la penumbra. En su boca siempre humea un grueso tabaco aromático cuyo humo azulado se confunde con la neblina que sube de las ciénagas al amanecer.\n\nPara los pescadores humildes que echan la atarraya solo para alimentar a sus hijos, el Mohán es un amigo invisible. Con un suave movimiento de sus brazos gigantes conduce cardúmenes de bocachico y bagre hacia las canoas. Sin embargo, su furia estalla cuando aparecen hombres codiciosos que talan los sauces de la ribera, arrojan venenos químicos o pescan con dinamita haciendo sangrar las aguas. En esas noches sin estrellas, el Mohán desata tempestades, arrastra las lanchas hacia el fondo del lecho y esconde la vida del río hasta que el ser humano aprenda a convivir con respeto y gratitud.`,
        question: '¿Qué rasgo esencial demuestra que el Mohán representa una figura de justicia ambiental en la tradición oral?',
        options: [
          'Premia a los pescadores que respetan el río y castiga con fuerza a quienes contaminan o destruyen el ecosistema',
          'Es un monstruo que ataca a todas las personas sin importar lo que hagan',
          'Regala monedas de oro a los comerciantes que talan árboles',
          'Vive escondido porque le teme al sol y al agua dulce'
        ],
        answer: 0,
        level: 'Comprensión Inferencial y Ética',
        curiosity: 'Las leyendas tradicionales cumplían una función comunitaria vital: inculcar en las nuevas generaciones el respeto sagrado por las cuencas hídricas.'
      },
      {
        id: 'llorona-niebla',
        placeName: 'Bosques de la Cordillera Andina',
        image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
        model3d: 'llorona-mist',
        storyTitle: 'El Eco de la Llorona y el Lamento de la Selva Herida',
        storyText: `Cuentan los abuelos que en las noches tempestuosas de los Andes, cuando las ramas de los robles crujen bajo la lluvia torrencial, se escucha un gemido desgarrador que eriza la piel de los viajeros: '¡Aaaay, mis hijos...!'. Es la Llorona, un alma errante que vaga vestida de harapos blancos manchados de lodo.\n\nLa leyenda relata que fue una mujer que perdió a sus pequeños en la crecida de un río caudaloso. Desde aquel fatídico instante no ha encontrado reposo, recorriendo las quebradas y los barrancos buscando lo que jamás volverá a abrazar. Su rostro jamás puede verse con claridad, pues flota envuelta en un manto de niebla helada.\n\nNo obstante, los campesinos sabios afirman que el llanto de la Llorona también simboliza el dolor de la propia tierra cuando ve talados sus montes sagrados y secadas sus fuentes de agua. Quienes la han escuchado aseguran que el miedo que produce no es para enloquecer, sino para despertar la compasión, valorar a la familia y no caminar jamás por el sendero del desamor o la indiferencia hacia el dolor ajeno.`,
        question: 'A partir de la reflexión final del texto, ¿qué significado profundo adquiere el mito de la Llorona para nuestra convivencia escolar?',
        options: [
          'Nos invita a reflexionar sobre el amor por la familia, el cuidado mutuo y la compasión frente al sufrimiento de los demás',
          'Nos enseña que debemos asustar a los compañeros que lloran en el recreo',
          'Indica que nunca debemos salir de la casa cuando llueve',
          'Significa que los cuentos solo sirven para no poder dormir de noche'
        ],
        answer: 0,
        level: 'Comprensión Crítica y Socioemocional (Saber Ser)',
        curiosity: 'El mito de la Llorona se extiende por toda América Latina con variaciones, pero en todas las culturas sirve como un llamado a la protección de la niñez y la responsabilidad afectiva.'
      },
      {
        id: 'sombreron-caminos',
        placeName: 'Caminos de Herradura de Antioquia y Boyacá',
        image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80',
        model3d: 'sombreron-hat',
        storyTitle: 'El Jinete del Sombrerón: La Sombra de la Conciencia',
        storyText: `Al caer el crepúsculo en los caminos empinados de la cordillera, cuando el aire huele a leña quemada y tierra húmeda, se divisa la silueta de un jinete singular. Viste chaqueta negra de paño, calza botas de cuero y monta un imponente caballo azabache cuyos cascos no hacen el menor ruido al chocar contra las piedras del camino. Pero lo más sorprendente es su gigantesco sombrero negro de ala ancha, tan desmesurado que proyecta una sombra que oculta completamente su mirada.\n\nEl Sombrerón no pronuncia palabra ni empuña armas. Nunca molesta a los jóvenes estudiosos, a las maestras que regresan de la escuela ni a los campesinos que laboran con honradez la tierra. Su paso silencioso busca a quienes siembran peleas en el pueblo, a quienes dicen calumnias contra sus vecinos o a los que maltratan a los animales del campo.\n\nEl jinete simplemente los escolta a tres pasos de distancia durante horas. Un frío polar invade la espalda del trasnochador pendenciero, haciéndole comprender en la soledad del sendero la gravedad de sus malas acciones. Aquellos que han sido seguidos por el Sombrerón regresan de rodillas a sus hogares, piden perdón a quienes ofendieron y prometen enmendar su conducta para siempre.`,
        question: '¿Qué simboliza la presencia silenciosa del Sombrerón según el sentido pedagógico de la historia?',
        options: [
          'La voz de la propia conciencia que interpela a quien ha actuado mal y lo impulsa a corregirse mediante el diálogo y el arrepentimiento',
          'Un bandido que busca quitarle los caballos y la ropa a los campesinos',
          'Un fantasma que busca amigos para jugar carreras nocturnas',
          'Un inspector que vigila la moda de los sombreros en el pueblo'
        ],
        answer: 0,
        level: 'Comprensión Inferencial y Convivencia Escolar',
        curiosity: 'En la tradición pedagógica popular, esta figura representaba la autorregulación ética: la capacidad de evaluar nuestras propias acciones antes de que causen daño a la comunidad.'
      }
    ]
  },

  // 3B. LENGUAJE / COMPRENSIÓN LECTORA CRÍTICA (PRUEBAS SABER)
  {
    id: 'lenguaje-comprension-critica',
    title: 'Taller Maestro: Comprensión Lectora Crítica & Tipologías Textuales',
    category: 'lenguaje',
    subject: 'Lenguaje • Comprensión Lectora (Literal, Inferencial y Crítica)',
    description: 'Textos argumentativos, científicos y narrativos para ejercitar la inferencia de intenciones, identificación de tesis y juicio crítico (Nivel Saber 11 / Saber 9).',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    badge: 'Lector Crítico Experto',
    type: 'reading',
    pointsPerSuccess: 20,
    questions: [
      {
        id: 'lect-ia-humano',
        image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
        model3d: 'brain-screens',
        storyTitle: 'Ensayo Argumentativo: La Lectura Profunda en la Era de las Pantallas',
        storyText: `Vivimos sumergidos en un océano de estímulos visuales inmediatos. Los videos de pocos segundos y las notificaciones incesantes han moldeado cerebros habituados a la dispersión. Sin embargo, leer una obra literaria o un ensayo filosófico no es simplemente descifrar grafías; es un ejercicio de inmersión cognitiva que activa circuitos neuronales vinculados con la empatía, el pensamiento analítico y la capacidad de sostener la atención.\n\nCuando leemos un texto complejo, no solo recibimos información: dialogamos con la mente del autor, cuestionamos sus premisas y construimos mundos simbólicos propios. Quien abandona la lectura prolongada pierde poco a poco la paciencia para comprender matices, volviéndose vulnerable a la desinformación y a los discursos simplistas. La lectura no es un pasatiempo del pasado, sino la más poderosa armadura intelectual de la juventud contemporánea.`,
        question: '¿Cuál es la tesis principal defendida por el autor en este texto argumentativo?',
        options: [
          'La lectura profunda es una práctica indispensable para desarrollar pensamiento crítico, empatía y resistencia mental frente a la dispersión digital',
          'Las pantallas de celular deben ser prohibidas en todas las escuelas y colegios',
          'Los libros de papel son más pesados que las tabletas digitales',
          'Las notificaciones de redes sociales mejoran la memoria a largo plazo'
        ],
        answer: 0,
        level: 'Comprensión Crítica (Identificación de Tesis Central)',
        curiosity: 'La neurociencia cognitiva ha demostrado que la lectura profunda activa la corteza prefrontal, fortaleciendo el pensamiento abstracto y la teoría de la mente.'
      },
      {
        id: 'lect-gabo-realismo',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        model3d: 'macondo-butterflies',
        storyTitle: 'Texto Literario: El Espejo de Macondo y la Memoria de América',
        storyText: `Gabriel García Márquez afirmaba que en la cuenca del Caribe la realidad supera con creces cualquier artificio de la imaginación. En 'Cien años de soledad', los muertos regresan a conversar con los vivos no para asustar, sino porque no soportan el olvido; las mariposas amarillas anuncian amores apasionados y una peste de insomnio borra el nombre y la utilidad de las cosas cotidianas.\n\nEste realismo mágico no es un simple capricho estético: es la crónica poética de una región que ha padecido guerras civiles interminables, despojos territoriales y amores desmesurados. Al nombrar lo inverosímil con naturalidad, García Márquez logró que el mundo entero contemplara la soledad de América Latina y comprendiera que nuestra historia solo tiene salvación si aprendemos a recordar para no repetir nuestras tragedias.`,
        question: 'De acuerdo con el texto, ¿cuál es el sentido profundo del realismo mágico en la obra de García Márquez?',
        options: [
          'Representar a través de lo fantástico la memoria histórica, el dolor y la identidad de América Latina para no repetir sus tragedias',
          'Inventar cuentos de miedo para ahuyentar a los turistas en Aracataca',
          'Explicar fórmulas científicas mediante metáforas con mariposas',
          'Demostrar que en el Caribe nunca existieron guerras ni conflictos'
        ],
        answer: 0,
        level: 'Comprensión Inferencial e Intertextual',
        curiosity: 'En su discurso del Premio Nobel (1982), "La soledad de América Latina", Gabo enfatizó que el desafío de nuestra literatura era hacer creíble una realidad que parecía desaforada.'
      },
      {
        id: 'lect-ciencia-ballenas',
        image: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=800&q=80',
        model3d: 'whale-sonar',
        storyTitle: 'Artículo de Divulgación Científica: Los Cantos del Océano en Bahía Solano',
        storyText: `Cada año, entre julio y noviembre, las aguas cálidas del Pacífico colombiano se convierten en la sala de maternidad de miles de ballenas jorobadas ('Megaptera novaeangliae') que viajan más de ocho mil kilómetros desde la Antártida. Los biólogos marinos sumergen hidrófonos en el agua y registran complejas melodías que pueden durar hasta treinta minutos y repetirse durante horas enteras.\n\nEstos cantos no son sonidos azarosos: poseen rima, métrica y estructuras que evolucionan de temporada en temporada. Los machos entonan estas complejas composiciones para comunicarse en la penumbra oceánica, atraer a las hembras y delimitar sus rutas de navegación. No obstante, el incremento del ruido generado por embarcaciones a motor y sonares submarinos amenaza con ensordecer estas serenatas milenarias, interrumpiendo un ciclo reproductivo vital para la salud de los océanos.`,
        question: '¿Qué relación de causa-efecto se expone con respecto a la supervivencia de las ballenas jorobadas?',
        options: [
          'La contaminación acústica marina provocada por motores y sonares interfiere con sus cantos, poniendo en riesgo su comunicación y reproducción',
          'Las ballenas cantan para calentarse del frío extremo de la Antártida',
          'Las aguas cálidas de Bahía Solano provocan que las ballenas pierdan la voz',
          'Los barcos a motor ayudan a las ballenas a encontrar comida más rápido'
        ],
        answer: 0,
        level: 'Comprensión Literal e Inferencial (Causa-Efecto)',
        curiosity: 'Las ballenas jorobadas comparten sus cantos culturalmente: si un grupo inventa una nueva frase musical, las demás la aprenden y la replican por todo el hemisferio.'
      },
      {
        id: 'lect-conectores-logica',
        image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
        model3d: 'logic-bridge',
        storyTitle: 'Reflexión Lingüística: El Secreto de Escribir con Claridad y Coherencia',
        storyText: `Escribir bien no consiste en utilizar palabras rebuscadas para impresionar, sino en tender puentes transparentes entre las ideas. Los conectores lógicos son los pilares de esos puentes: permiten al lector saber si estamos agregando una razón ('además'), contrastando una postura ('sin embargo'), o deduciendo una conclusión inevitable ('por lo tanto').\n\nUn párrafo sin conectores es como una pared de ladrillos sin cemento: cualquier ráfaga de duda lo derrumba. Cuando un estudiante aprende a ordenar sus pensamientos mediante causas, consecuencias y contraargumentos, adquiere la capacidad de convencer con la fuerza de la razón y no con el volumen de los gritos.`,
        question: '¿Cuál conector lógico es el más adecuado para unir estas dos oraciones con sentido de contraste?: "Estudió con dedicación toda la semana; _______, el examen presentó preguntas inesperadas."',
        options: [
          'Sin embargo',
          'Por consiguiente',
          'Además',
          'En primer lugar'
        ],
        answer: 0,
        level: 'Competencia Gramatical y Cohesión Textual',
        curiosity: 'Los conectores adversativos como "sin embargo", "no obstante" y "pero" son fundamentales en el ensayo argumentativo para matizar posturas.'
      }
    ]
  },

  // 3C. LENGUAJE / ORTOGRAFÍA, SEMÁNTICA Y VOCABULARIO
  {
    id: 'lenguaje-ortografia-vocabulario',
    title: 'El Guardián de las Letras: Ortografía, Semántica y Figuras Retóricas',
    category: 'lenguaje',
    subject: 'Lenguaje • Ortografía, Acentuación & Semántica',
    description: 'Distingue acentos diacríticos (por qué / porque / porqué), detecta metáforas y analogías, y fortalece tu vocabulario para expresarte como un verdadero maestro.',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    badge: 'Erudito del Idioma',
    type: 'reading',
    pointsPerSuccess: 20,
    questions: [
      {
        id: 'ort-1',
        placeName: 'Taller de Redacción y Gramática',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
        model3d: 'four-porques',
        storyTitle: 'El Dilema de los Cuatro "Porqués"',
        storyText: `En la sala de redacción del periódico escolar, Juan redacta una editorial. Quiere explicar las causas de la puntualidad y tiene dudas sobre cómo escribir correctamente: 'No entiendo el ________ de su tardanza; no llegó a clase ________ se le hizo tarde'.\n\nLa profesora de español le recuerda la regla de oro: 'porqué' (sustantivo que equivale a causa o motivo), 'por qué' (interrogativo o exclamativo), 'porque' (conjunción causal explicativa) y 'por que' (relativo o con preposición).`,
        question: '¿Cuál es la combinación ortográfica correcta para completar las dos frases del texto?',
        options: [
          'porqué / porque',
          'por qué / porqué',
          'porque / por qué',
          'por que / por qué'
        ],
        answer: 0,
        level: 'Ortografía Diacrítica y Semántica',
        curiosity: '"El porqué" lleva tilde y va junto porque va precedido de un artículo o determinante (equivale a "el motivo").'
      },
      {
        id: 'ort-2',
        placeName: 'Recital Poético y Letras Vivas',
        image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
        model3d: 'poetry-metaphor',
        storyTitle: 'Taller de Poesía: Reconociendo Figuras Retóricas',
        storyText: `En el recital de poesía del colegio, una estudiante de 9° grado declama los siguientes versos:\n\n'Tus ojos son dos luceros que iluminan la noche de mi alma,\ny el tiempo vuela como una golondrina asustada'.\n\nEl profesor de literatura pregunta al salón qué figuras literarias destacan en estos dos versos para enriquecer el lenguaje poético.`,
        question: '¿Qué figuras retóricas se encuentran presentes respectivamente en "Tus ojos son dos luceros" y "vuela como una golondrina"?',
        options: [
          'Metáfora (identificación directa sin nexo) y Símil o Comparación (con el nexo "como")',
          'Hipérbole y Onomatopeya',
          'Personificación y Anáfora',
          'Pleonasmo y Aliteración'
        ],
        answer: 0,
        level: 'Figuras Literarias y Análisis Poético',
        curiosity: 'El símil siempre utiliza nexos comparativos como "como", "cual", "igual que", mientras que la metáfora asume la identidad directamente.'
      }
    ]
  },

  // 4. MATEMÁTICAS / LÓGICA, GEOMETRÍA Y FINANZAS COTIDIANAS
  {
    id: 'matematicas-desafio-logico',
    title: 'Desafío Matemático: Lógica, Finanzas Cotidianas y Geometría en el Aula',
    category: 'matematicas',
    subject: 'Matemáticas • Pensamiento Lógico, Métrico y Financiero',
    description: 'Resuelve problemas prácticos de la vida real: presupuestos en la tienda escolar, cálculo de áreas de la cancha, fracciones en recetas y acertijos de lógica deductiva.',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    badge: 'Mente Brillante',
    type: 'reading',
    pointsPerSuccess: 20,
    questions: [
      {
        id: 'mate-tienda',
        placeName: 'Cafetería & Finanzas Escolares',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        model3d: 'cash-discount',
        storyTitle: 'Situación Problema: El Presupuesto de la Tienda Escolar',
        storyText: `Tres compañeros de 8° grado deciden reunir su dinero para compartir un refrigerio saludable durante el descanso escolar. Valentina aporta $5.000, Mateo aporta $7.000 y Sofía aporta $8.000, reuniendo un total de $20.000.\n\nEn la tienda escolar deciden comprar una jarra de jugo natural de mandarina por $6.000 y una canasta de sándwiches integrales que cuesta $10.000. La dependienta de la cafetería les informa además que hoy hay un descuento especial del 10% sobre el valor total de su compra antes de pagar.`,
        question: 'Si la compra total de $16.000 recibe un 10% de descuento ($1.600 menos), ¿cuánto dinero les queda de cambio de los $20.000 que tenían?',
        options: [
          'Les sobran $5.600 de cambio',
          'Les sobran $4.000 de cambio',
          'Les sobran $2.500 de cambio',
          'No les alcanza el dinero'
        ],
        answer: 0,
        level: 'Pensamiento Numérico y Financiero',
        curiosity: '¡Correcto! Total con descuento: $16.000 - $1.600 = $14.400. Cambio: $20.000 - $14.400 = $5.600. El cálculo de porcentajes es una habilidad clave para la economía personal.'
      },
      {
        id: 'mate-cancha',
        placeName: 'Cancha Polideportiva de Baloncesto',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
        model3d: 'court-geometry',
        storyTitle: 'Situación Problema: El Área de la Cancha Múltiple del Colegio',
        storyText: `El comité deportivo de la institución necesita pintar las líneas reglamentarias de la cancha múltiple para el torneo intercolegiado. El profesor de educación física informa que la cancha es un rectángulo que mide 28 metros de largo y 15 metros de ancho.\n\nPara cotizar la pintura especial antideslizante, el rector solicita calcular el área total del piso de la cancha en metros cuadrados y el perímetro total que rodeará la malla protectora.`,
        question: '¿Cuál es el área total en metros cuadrados (Área = base × altura) de la cancha deportiva del colegio?',
        options: [
          '420 metros cuadrados (28 m × 15 m)',
          '86 metros cuadrados (28 + 15 + 28 + 15)',
          '350 metros cuadrados',
          '560 metros cuadrados'
        ],
        answer: 0,
        level: 'Pensamiento Espacial y Sistemas Geométricos',
        curiosity: '¡Excelente! El área es 28 × 15 = 420 m². En cambio, el perímetro (la suma de todos sus lados) es 28 + 15 + 28 + 15 = 86 metros lineales.'
      },
      {
        id: 'mate-fracciones',
        placeName: 'Parcela de Huerta Agroecológica',
        image: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80',
        model3d: 'huerta-fractions',
        storyTitle: 'Situación Problema: La Huerta Escolar y las Fracciones',
        storyText: `En la huerta comunitaria del colegio se ha destinado una parcela cuadrada para sembrar hortalizas. El profesor de ciencias indica dividir la parcela de la siguiente manera:\n\nSe sembrará 1/2 de la parcela con zanahorias, 1/4 con lechuga fresca y el resto del terreno con plantas aromáticas como menta y romero para repeler plagas de forma natural.`,
        question: '¿Qué fracción de la parcela total corresponde al cultivo de las plantas aromáticas?',
        options: [
          '1/4 de la parcela (porque 1/2 + 1/4 = 3/4, restando 1/4)',
          '1/3 de la parcela',
          '1/8 de la parcela',
          'La mitad de la parcela'
        ],
        answer: 0,
        level: 'Pensamiento Fraccionario y Proporcional',
        curiosity: '¡Exacto! 1/2 equivale a 2/4. Sumando las lechugas (1/4) da 3/4. Por tanto, queda exactamente 1/4 para las hierbas aromáticas.'
      }
    ]
  },

  // 5. CIENCIAS NATURALES / BIOLOGÍA, ECOLOGÍA Y FÍSICA
  {
    id: 'ciencias-pequenos-genios',
    title: 'Pequeños Genios: Biodiversidad Colombiana y Desafíos Ecológicos',
    category: 'ciencias',
    subject: 'Ciencias Naturales • Biología, Química & Medio Ambiente',
    description: 'Explora crónicas científicas sobre ecosistemas, fotosíntesis, adaptaciones biológicas de la fauna y los principios fundamentales de la materia y la energía.',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    badge: 'Científico de Oro',
    type: 'reading',
    pointsPerSuccess: 20,
    questions: [
      {
        id: 1,
        placeName: 'Santuarios de Aves y Biodiversidad',
        image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=800&q=80',
        model3d: 'condor-birds',
        storyTitle: 'Crónica Científica: El Reino de las Mil y Una Plumas',
        storyText: `Con apenas el cero punto siete por ciento de la superficie continental de la Tierra, Colombia alberga un fenómeno biológico incomparable: es el hogar de más de mil novecientas cincuenta especies de aves registradas, ocupando el primer puesto absoluto en todo el planeta.\n\nEsta asombrosa riqueza se debe a su geografía privilegiada: tres cordilleras andinas independientes, dos océanos (Pacífico y Atlántico), la llanura amazónica, la selva del Chocó y el macizo aislado de la Sierra Nevada de Santa Marta. Cada piso térmico crea 'islas biológicas' donde han evolucionado colibríes minúsculos de apenas dos gramos, tucanes de picos irisados y el majestuoso Cóndor de los Andes.`,
        question: 'A partir de la lectura de la crónica científica, ¿cuál es el factor geográfico principal que explica por qué Colombia es el país número 1 en aves del mundo?',
        options: [
          'La confluencia de tres cordilleras andinas, dos océanos y diversas regiones biogeográficas con múltiples pisos térmicos',
          'Porque en Colombia los campesinos alimentan a todas las aves con semillas en los parques',
          'Porque las aves de todos los países migraron a Colombia para escapar del frío permanentemente',
          'Porque es el país más plano y uniforme del continente sudamericano'
        ],
        answer: 0,
        level: 'Comprensión Lectora Científica',
        curiosity: '¡En Colombia vive el 20% de todas las especies de aves que habitan la Tierra! Más de 80 de ellas son endémicas.'
      },
      {
        id: 2,
        placeName: 'Reserva Biológica de la Amazonía',
        image: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=800&q=80',
        model3d: 'photosynthesis-leaf',
        storyTitle: 'Crónica Botánica: La Danza de las Hojas y la Fotosíntesis',
        storyText: `En lo más denso de la selva amazónica colombiana, donde los árboles alcanzan los cincuenta metros de altura y sus copas entrelazadas filtran el mediodía en una penumbra verde, ocurre el milagro bioquímico más crucial para la existencia humana: la fotosíntesis.\n\nCada hoja viva contiene millones de cloroplastos cargados de clorofila. Durante el día, estos orgánulos absorben los fotones de la luz solar y, combinándolos con el agua absorbida por las raíces y el dióxido de carbono ('CO2') capturado del aire, rompen las moléculas químicas para sintetizar glucosa que alimenta al árbol y liberar oxígeno puro a la atmósfera.`,
        question: '¿Qué consecuencia directa sobre el clima global se infiere de la deforestación de bosques según la lectura?',
        options: [
          'Se destruye la captura de CO2 y se liberan gases de efecto invernadero, acelerando el cambio climático y disminuyendo el oxígeno',
          'Hace que llueva mucho más en las ciudades y baje la temperatura del planeta',
          'Permite que los animales tengan más espacio libre para correr',
          'No genera ningún impacto medible en la atmósfera terrestre'
        ],
        answer: 0,
        level: 'Comprensión Inferencial Causa-Efecto',
        curiosity: 'La cuenca amazónica genera aproximadamente el 16% del oxígeno producido por la fotosíntesis terrestre del planeta.'
      }
    ]
  },

  // 6. INGLÉS / ENGLISH EXPLORERS (Lengua Extranjera)
  {
    id: 'ingles-english-explorer',
    title: 'English Explorers: Reading, Daily Life & Global Communication',
    category: 'ingles',
    subject: 'Inglés • Habilidades Comunicativas & Lectura B1',
    description: 'Mejora tu vocabulario y comprensión en inglés a través de historias cotidianas, diálogos y descripciones culturales del mundo globalizado.',
    coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
    badge: 'Bilingual Star',
    type: 'reading',
    pointsPerSuccess: 20,
    questions: [
      {
        id: 'eng-1',
        placeName: 'The International School Exchange',
        image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
        model3d: 'vancouver-flight',
        storyTitle: 'Reading Passage: Lucas and his Dream Trip to Canada',
        storyText: `Lucas is an eighth-grade student from Medellín who loves learning languages and science. Last month, his school announced an international exchange program with a secondary school in Vancouver, Canada.\n\nTo qualify for the scholarship, students had to write an essay explaining how they can contribute to their community and demonstrate good communication in English. Lucas wrote about his school recycling club and how planting trees in city neighborhoods reduces temperature and creates habitats for urban birds. Yesterday morning, Lucas received an email from the committee: 'Congratulations Lucas, your leadership in sustainability and your clear ideas in English earned you the scholarship!'. He smiled, hugged his mother, and began preparing his winter jacket for his journey across North America.`,
        question: 'According to the text, why did the selection committee award the scholarship to Lucas?',
        options: [
          'Because of his leadership in school sustainability and his clear communication in English',
          'Because he bought an expensive ticket to travel as a tourist',
          'Because he won a video game championship in Medellín',
          'Because he was the only student who applied to the program'
        ],
        answer: 0,
        level: 'Reading Comprehension (Literal & Main Idea)',
        curiosity: 'Vancouver is famous for its multicultural environment and its temperate rainforests surrounded by the Pacific Ocean.'
      },
      {
        id: 'eng-2',
        placeName: 'Everyday School Routine & Wellness',
        image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
        model3d: 'healthy-routine',
        storyTitle: 'Short Story: A Healthy Morning at School',
        storyText: `Every weekday morning, Sarah wakes up at 6:00 AM. Before going to school, she drinks a glass of fresh water, eats oatmeal with fresh strawberries, and packs her backpack with books and a reusable bottle.\n\nShe usually walks to school with her best friend Carlos because their house is only four blocks away from the campus. Sarah believes that walking every morning keeps her mind focused and gives her energy for her math and biology classes. During recess, instead of eating processed chips, she shares green apples with her classmates.`,
        question: 'What habit does Sarah practice in the morning to stay focused and have energy for her classes?',
        options: [
          'She eats a healthy breakfast with oatmeal and fruit, and walks to school every day',
          'She sleeps during the entire first period of class',
          'She drinks soda and eats candy before leaving home',
          'She takes a taxi to avoid doing any physical activity'
        ],
        answer: 0,
        level: 'Reading Inference & Vocabulary',
        curiosity: 'Walking for just 20 minutes a day increases oxygen flow to the brain, enhancing memory and academic performance.'
      }
    ]
  },

  // 7. TECNOLOGÍA E INFORMÁTICA / PENSAMIENTO COMPUTACIONAL
  {
    id: 'tecnologia-mundo-digital',
    title: 'TecnoKids: Pensamiento Computacional, Algoritmos y Ciberseguridad Escolar',
    category: 'tecnologia',
    subject: 'Tecnología e Informática • Ciberseguridad & Algoritmos',
    description: 'Descubre cómo piensan los computadores, aprende a proteger tu privacidad digital en redes sociales y comprende las bases de la inteligencia artificial ética.',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    badge: 'Ciberdefensor Digital',
    type: 'reading',
    pointsPerSuccess: 20,
    questions: [
      {
        id: 'tec-1',
        placeName: 'Algoritmos y Código Digital',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        model3d: 'algorithm-flow',
        storyTitle: 'Lectura Técnica: ¿Qué es realmente un Algoritmo?',
        storyText: `En el lenguaje cotidiano escuchamos hablar de algoritmos en redes sociales, motores de búsqueda y videojuegos. Pero en su esencia más pura, un algoritmo no es una máquina mágica: es simplemente un conjunto ordenado, lógico y finito de instrucciones paso a paso diseñadas para resolver un problema o alcanzar un objetivo específico.\n\nCuando sigues una receta para hornear un pastel, cuando resuelves paso a paso una división o cuando armas un mueble siguiendo un manual ilustrado, estás ejecutando un algoritmo. En la programación informática, los desarrolladores traducen estas secuencias lógicas a lenguajes como Python o JavaScript para que el procesador pueda ejecutar millones de cálculos por segundo con absoluta precisión.`,
        question: 'De acuerdo con la lectura, ¿cuál es la mejor definición de un algoritmo?',
        options: [
          'Una serie ordenada, lógica y finita de pasos o instrucciones para resolver un problema determinado',
          'Un robot con forma humana que habla en inglés',
          'Un virus informático que daña las pantallas de los celulares',
          'Un tipo de pantalla con luces de colores para jugar'
        ],
        answer: 0,
        level: 'Pensamiento Computacional y Lógica',
        curiosity: 'La palabra algoritmo proviene del nombre del matemático persa del siglo IX Al-Juarismi, pionero universal del álgebra.'
      },
      {
        id: 'tec-2',
        placeName: 'Seguridad en Redes y Privacidad',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
        model3d: 'cyber-vault',
        storyTitle: 'Guía de Convivencia Digital: Tu Huella y la Ciberseguridad Escolar',
        storyText: `Cada vez que un estudiante publica una foto, da un 'like', descarga una aplicación o ingresa a un sitio web, va dejando un rastro permanente conocido como 'Huella Digital'. Muchos jóvenes cometen el error de compartir contraseñas con amigos, usar claves obvias como '123456' o publicar información sensible como su dirección, el uniforme del colegio o su número de teléfono.\n\nLos expertos en seguridad informática advierten que la información compartida en internet puede ser guardada, capturada en capturas de pantalla o usada indebidamente por desconocidos. Crear contraseñas robustas (combinando letras mayúsculas, minúsculas, números y símbolos), no aceptar a extraños en redes y reportar el ciberacoso escolar son pilares de la ciudadanía digital responsable.`,
        question: '¿Cuál de las siguientes acciones es una práctica segura de ciberseguridad para un estudiante?',
        options: [
          'Usar contraseñas complejas que combinen letras, números y símbolos, y no compartir datos personales con desconocidos',
          'Compartir la contraseña del correo institucional con todos los amigos del recreo',
          'Aceptar solicitudes de amistad de perfiles desconocidos sin foto',
          'Publicar la foto del carnet escolar mostrando el documento de identidad'
        ],
        answer: 0,
        level: 'Ciudadanía Digital y Ética Tecnológica (Saber Ser)',
        curiosity: 'Una contraseña de 8 letras minúsculas puede ser descifrada por un computador moderno en segundos, mientras que una frase de 12 caracteres combinados tarda siglos.'
      }
    ]
  },

  // 8. ÉTICA, CÁTEDRA DE PAZ Y COMPETENCIAS CIUDADANAS
  {
    id: 'etica-paz-ciudadana',
    title: 'Cátedra de la Paz y Valores: Convivencia Escolar y Resolución de Conflictos',
    category: 'etica',
    subject: 'Ética y Valores • Cátedra de Paz & Convivencia (Saber Ser)',
    description: 'Desarrolla habilidades socioemocionales para el diálogo asertivo, la empatía frente a las diferencias y la participación democrática en el gobierno escolar.',
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
    badge: 'Constructor de Paz',
    type: 'reading',
    pointsPerSuccess: 20,
    questions: [
      {
        id: 'etica-1',
        placeName: 'Mesa de Mediación y Convivencia',
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
        model3d: 'peace-mediation-table',
        storyTitle: 'Estudio de Caso: El Conflicto en el Trabajo en Equipo',
        storyText: `En una clase de ciencias, el profesor organiza grupos de cuatro estudiantes para realizar un proyecto sobre energías renovables. Dos integrantes del equipo proponen hacer una maqueta física con materiales reciclados, mientras que los otros dos prefieren crear una presentación digital interactiva.\n\nEn lugar de escucharse, los ánimos se calientan y comienzan a lanzarse burlas y reproches personales: '¡Tu idea es aburrida!', '¡Tú nunca quieres trabajar!'. La discusión se estanca y el proyecto corre el riesgo de no presentarse.\n\nUn quinto estudiante del salón, capacitado como mediador escolar de paz, se acerca al grupo y les propone una pausa. Les pide respirar hondo, escuchar los argumentos del otro sin interrumpir y buscar una solución integradora: usar la presentación digital para proyectar el funcionamiento y construir un pequeño prototipo reciclado en clase.`,
        question: '¿Qué principio de resolución pacífica de conflictos aplicó exitosamente el mediador escolar en este caso?',
        options: [
          'La escucha activa, el diálogo sin agresiones y la búsqueda de un acuerdo colaborativo donde ambas partes aporten',
          'Obligar a todos a callarse y no presentar nada al profesor',
          'Hacer una votación secreta y burlarse del grupo perdedor',
          'Acudir a los gritos para que gane quien hable más fuerte'
        ],
        answer: 0,
        level: 'Competencias Ciudadanas y Mediación de Paz (Saber Ser)',
        curiosity: 'La mediación escolar entre pares es una de las herramientas más efectivas del Ministerio de Educación de Colombia para erradicar el acoso escolar y construir aulas solidarias.'
      },
      {
        id: 'etica-2',
        placeName: 'Aula Abierta y Diversidad Humana',
        image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
        model3d: 'inclusion-ramp',
        storyTitle: 'Reflexión Ciudadana: La Inclusión y el Respeto a las Diferencias (BAP)',
        storyText: `A un salón de 7° grado llega Carlos, un nuevo compañero que utiliza silla de ruedas y tiene dificultades para hablar con rapidez debido a una condición motora. Durante las primeras semanas, algunos compañeros lo miraban con extrañeza y evitaban incluirlo en los juegos del patio.\n\nAl notar la situación, el personero estudiantil y la docente titular dedicaron una sesión de ética para reflexionar sobre las Barreras de Aprendizaje y Participación ('BAP'). Explicaron que la discapacidad no está en la persona, sino en el entorno cuando la sociedad no construye rampas, no adapta los juegos o excluye con la indiferencia.\n\nA partir de ese día, el curso transformó las reglas del juego de relevos para que todos pudieran participar en igualdad de condiciones, descubriendo que Carlos es un estratega brillante para diseñar las jugadas en equipo.`,
        question: '¿Qué aprendizaje ético y ciudadano fundamental nos deja la historia de inclusión de Carlos?',
        options: [
          'Que la verdadera empatía consiste en derribar barreras y adaptar el entorno para que todas las personas participen con dignidad e igualdad',
          'Que las personas con alguna dificultad física no deben asistir a la escuela ordinaria',
          'Que solo se debe jugar con las personas que se parezcan exactamente a nosotros',
          'Que las diferencias entre seres humanos son un obstáculo insuperable'
        ],
        answer: 0,
        level: 'Ética de la Inclusión y Derechos Humanos (Saber Ser)',
        curiosity: 'El Decreto 1421 de inclusión educativa en Colombia garantiza que todos los niños, niñas y jóvenes tengan derecho a una educación sin discriminación.'
      }
    ]
  }
];
