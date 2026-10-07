import React, { useState } from 'react';
import { Sparkles, Info, Eye, CheckCircle2, MapPin, ExternalLink, Lightbulb, Compass, Maximize2, Box } from 'lucide-react';
import Real3DScene from './Real3DScene';

export default function InteractiveVisualStage({ 
  item = {}, 
  subject = '',
  gameType = 'reading'
}) {
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [stageViewMode, setStageViewMode] = useState('photo'); // 'photo' (Default HD Realistic Photo with Hotspots) | 'diagram'
  const [fullscreenImage, setFullscreenImage] = useState(false);

  const modelKey = item.model3d || item.id || '';

  // Hotspots definitions directly linked to the story & questions
  const getHotspotsForModel = (key) => {
    switch (key) {
      // 1. Caño Cristales
      case 'cano-cristales':
        return [
          { x: 30, y: 65, title: 'Macarenia clavigera', text: 'Planta acuática endémica que tiñe las rocas de fucsia y verde.', icon: '🌿' },
          { x: 68, y: 40, title: 'Agua Pura Cristalina', text: 'El agua es transparente y carece de nutrientes; no tiene peces.', icon: '💧' },
          { x: 82, y: 75, title: 'Equilibrio Frágil', text: 'Químicos y bronceadores pueden marchitar hectáreas enteras.', icon: '⚠️' }
        ];

      // 2. Valle del Cocora
      case 'palma-cera':
        return [
          { x: 45, y: 25, title: 'Palma de Cera (60 m)', text: 'Árbol nacional de Colombia; vive más de dos siglos entre la niebla.', icon: '🌴' },
          { x: 75, y: 45, title: 'Loro Orejiamarillo', text: 'Ave que depende exclusivamente de los troncos huecos para anidar.', icon: '🦜' },
          { x: 25, y: 70, title: 'Salento, Quindío', text: 'Reserva protegida de la Cordillera Central de los Andes.', icon: '⛰️' }
        ];

      // 3. Castillo San Felipe
      case 'castillo-san-felipe':
        return [
          { x: 35, y: 55, title: 'Roca Coralina', text: 'Mole defensiva construida para resistir cañones invasores.', icon: '🏰' },
          { x: 65, y: 72, title: 'Túneles Acústicos', text: 'Ingeniería para oír pisadas y susurros de enemigos a 50 metros.', icon: '🔊' },
          { x: 78, y: 35, title: 'Defensa de 1741', text: 'Resistencia heroica frente a la descomunal flota inglesa de Vernon.', icon: '⚔️' }
        ];

      // 4. Páramo de Chingaza
      case 'frailejon-water':
        return [
          { x: 35, y: 45, title: 'Frailejón Espeletia', text: 'Hojas vellosas que atrapan microscópicas gotas de neblina.', icon: '🌱' },
          { x: 70, y: 65, title: '70% del Agua de Bogotá', text: 'El páramo filtra agua pura hacia los embalses de millones de personas.', icon: '💧' },
          { x: 20, y: 75, title: 'Suelo de Turba y Musgo', text: 'Colosal esponja natural que regula el ciclo hídrico andino.', icon: '🌧️' }
        ];

      // 5. Machu Picchu
      case 'machu-picchu-terraces':
        return [
          { x: 30, y: 60, title: 'Andenes Agrícolas', text: 'Terrazas escalonadas que evitan la erosión de las laderas.', icon: '🌾' },
          { x: 65, y: 45, title: 'Drenaje Pluvial', text: 'Capas subterráneas de grava que canalizan lluvias torrenciales.', icon: '🌧️' },
          { x: 75, y: 25, title: 'Piedra Ashlar', text: 'Bloques de granito tallados que encajan sin cemento ni argamasa.', icon: '🧱' }
        ];

      // 5B. Santuario de Las Lajas
      case 'santuario-las-lajas':
        return [
          { x: 45, y: 40, title: 'Basílica Neogótica', text: 'Templo de 50 m de altura edificado directamente sobre el abismo rocoso.', icon: '⛪' },
          { x: 60, y: 75, title: 'Puente sobre el Cañón', text: 'Estructura monumental de dos arcos de 100 m que une las montañas del Guáitara.', icon: '🌉' },
          { x: 25, y: 60, title: 'Topografía Volcánica', text: 'Desafío arquitectónico en el cañón de más de 100 metros de profundidad.', icon: '⛰️' }
        ];

      // 6. Puente de Boyacá
      case 'puente-boyaca':
        return [
          { x: 48, y: 60, title: 'Puente sobre Río Teatinos', text: 'Paso estratégico donde se dividió en dos al ejército realista.', icon: '🌉' },
          { x: 22, y: 45, title: 'Pedro Pascasio (12 años)', text: 'Joven patriota que apresó a Barreiro y rechazó sobornos de oro.', icon: '🎖️' },
          { x: 78, y: 30, title: '7 de Agosto de 1819', text: 'Batalla culminante que selló la independencia definitiva.', icon: '🇨🇴' }
        ];

      // 7. Pantano de Vargas
      case 'lanceros-vargas':
        return [
          { x: 50, y: 40, title: 'Carga Cuesta Arriba', text: '14 lanceros montando a pelo que sorprendieron al enemigo.', icon: '🐎' },
          { x: 25, y: 65, title: 'Lanzas de Madera y Hierro', text: 'Puntas forjadas en fogones de campaña con arrojo heroico.', icon: '🗡️' },
          { x: 75, y: 30, title: 'Juan José Rondón', text: 'Coronel llanero que escuchó el clamor: ¡Salve usted la patria!', icon: '🗣️' }
        ];

      // 8. El Mohán
      case 'mohan-river':
        return [
          { x: 45, y: 60, title: 'Remolinos del Magdalena', text: 'Cavernas rocosas subacuáticas donde habita el anciano guardián.', icon: '🌊' },
          { x: 25, y: 35, title: 'Humo de Tabaco', text: 'Niebla azulada que guía cardúmenes de bocachico a canoas humildes.', icon: '💨' },
          { x: 75, y: 45, title: 'Justicia Ambiental', text: 'Desata tempestades contra quienes pescan con dinamita o talan.', icon: '⚖️' }
        ];

      // 9. La Llorona
      case 'llorona-mist':
        return [
          { x: 48, y: 45, title: 'Espíritu entre Niebla', text: 'Manto blanco errante que busca lo que jamás volverá a abrazar.', icon: '🌫️' },
          { x: 25, y: 65, title: 'Dolor de la Selva', text: 'Simboliza el sufrimiento de la tierra cuando talan sus bosques.', icon: '🌲' },
          { x: 75, y: 35, title: 'Protección Familiar', text: 'Despierta la compasión y el cuidado de los niños en la comunidad.', icon: '❤️' }
        ];

      // 10. El Sombrerón
      case 'sombreron-hat':
        return [
          { x: 45, y: 30, title: 'Sombrero Desmesurado', text: 'Ala ancha que proyecta una sombra que oculta completamente su rostro.', icon: '🎩' },
          { x: 25, y: 60, title: 'Caballo Silencioso', text: 'Cascos azabache que no hacen ningún ruido sobre las piedras.', icon: '🐎' },
          { x: 75, y: 50, title: 'La Conciencia', text: 'Escoltar en silencio impulsa al ofensor a enmendar sus malas acciones.', icon: '👁️' }
        ];

      // 11. Lectura Profunda vs Pantallas
      case 'brain-screens':
        return [
          { x: 30, y: 45, title: 'Corteza Prefrontal', text: 'La inmersión lectora activa circuitos de empatía y pensamiento crítico.', icon: '🧠' },
          { x: 70, y: 55, title: 'Dispersión Digital', text: 'Videos cortos y notificaciones continuas fragmentan la atención.', icon: '📱' },
          { x: 50, y: 75, title: 'Armadura Intelectual', text: 'La lectura prolongada protege a la juventud contra engaños y noticias falsas.', icon: '🛡️' }
        ];

      // 12. Macondo
      case 'macondo-butterflies':
        return [
          { x: 40, y: 35, title: 'Mariposas Amarillas', text: 'Presagios de amor y misterio en el universo de García Márquez.', icon: '🦋' },
          { x: 65, y: 55, title: 'Realismo Mágico', text: 'Crónica poética donde lo inverosímil refleja la historia de América.', icon: '📜' },
          { x: 25, y: 70, title: 'Memoria Histórica', text: 'Recordar para no repetir 100 años de soledad ni tragedias bélicas.', icon: '🕯️' }
        ];

      // 13. Ballenas en Bahía Solano
      case 'whale-sonar':
        return [
          { x: 45, y: 40, title: 'Canto con Métrica', text: 'Melodías de hasta 30 minutos transmitidas culturalmente entre manadas.', icon: '🎶' },
          { x: 25, y: 65, title: 'Migración Antártica', text: 'Viajan más de 8.000 km al Pacífico para su sala de maternidad.', icon: '🐋' },
          { x: 75, y: 55, title: 'Ruido de Motores', text: 'Sonares y embarcaciones ensordecen e interfieren con su reproducción.', icon: '⚠️' }
        ];

      // 14. Conectores Lógicos
      case 'logic-bridge':
        return [
          { x: 25, y: 45, title: 'Premisa A', text: '"Estudió con dedicación toda la semana..."', icon: '📝' },
          { x: 50, y: 40, title: 'Nexo de Contraste', text: '"Sin embargo", "no obstante" y "pero" introducen un matiz contrario.', icon: '🌉' },
          { x: 75, y: 50, title: 'Resultado Inesperado', text: '"...el examen presentó preguntas imprevistas."', icon: '🎯' }
        ];

      // 15. Los Cuatro Porqués
      case 'four-porques':
        return [
          { x: 30, y: 40, title: 'Redacción y Sintaxis', text: 'Analiza el rol gramatical de cada término en la oración según la intención comunicativa del texto.', icon: '✍️' },
          { x: 70, y: 45, title: 'Taller de Estilo', text: 'La precisión en el uso de tildes y enlaces enriquece la claridad en el periodismo escolar.', icon: '📰' }
        ];

      // 16. Metáfora y Símil
      case 'poetry-metaphor':
        return [
          { x: 30, y: 45, title: 'Imágenes Poéticas', text: 'Los recursos expresivos enriquecen la emotividad y belleza de un poema.', icon: '✨' },
          { x: 70, y: 45, title: 'Cadencia y Ritmo', text: 'Identifica la estructura lírica comparando ambos versos de la declamación.', icon: '🕊️' }
        ];

      // 17. Presupuesto Cafetería
      case 'cash-discount':
        return [
          { x: 30, y: 40, title: 'Economía Cotidiana', text: 'La planificación financiera escolar promueve el consumo consciente y responsable.', icon: '💰' },
          { x: 70, y: 55, title: 'Cálculo Aplicado', text: 'Aplica el cálculo numérico para verificar cuentas y presupuestos en el día a día.', icon: '🧾' }
        ];

      // 18. Cancha Escolar (Geometría)
      case 'court-geometry':
        return [
          { x: 30, y: 40, title: 'Espacio Deportivo', text: 'Las dimensiones reglamentarias organizan la convivencia y el juego limpio.', icon: '🏀' },
          { x: 70, y: 55, title: 'Magnitudes Físicas', text: 'Distingue entre la superficie interior de un terreno y el contorno que lo bordea.', icon: '📐' }
        ];

      // 19. Huerta Escolar y Fracciones
      case 'huerta-fractions':
        return [
          { x: 30, y: 45, title: 'Cultivo Escolar', text: 'La huerta pedagógica fomenta el trabajo en equipo y el cuidado de la tierra.', icon: '🌱' },
          { x: 70, y: 50, title: 'Distribución del Terreno', text: 'Las partes de un terreno representan proporciones de un proyecto común.', icon: '🌿' }
        ];

      // 20. Aves de Colombia
      case 'condor-birds':
        return [
          { x: 30, y: 40, title: 'País #1 en Aves', text: 'Más de 1.950 especies (20% mundial) en 0.7% del planeta.', icon: '👑' },
          { x: 70, y: 35, title: 'Cóndor de los Andes', text: 'Ave insignia que vuela sobre las cumbres de los páramos.', icon: '🦅' },
          { x: 50, y: 70, title: '3 Cordilleras y 2 Océanos', text: 'Múltiples pisos térmicos crean islas biológicas únicas.', icon: '🏔️' }
        ];

      // 21. Fotosíntesis
      case 'photosynthesis-leaf':
        return [
          { x: 30, y: 35, title: 'Cloroplastos con Clorofila', text: 'Orgánulos que absorben los fotones de la luz solar.', icon: '☀️' },
          { x: 70, y: 40, title: 'Entrada: CO2 + Agua', text: 'Absorben dióxido de carbono del aire y agua por las raíces.', icon: '🌱' },
          { x: 50, y: 70, title: 'Salida: Oxígeno (O2) + Glucosa', text: 'Alimento para el árbol y liberación del oxígeno vital a la atmósfera.', icon: '💨' }
        ];

      // 22. Lucas a Canadá
      case 'vancouver-flight':
        return [
          { x: 30, y: 40, title: 'Reforestación Urbana', text: 'El club de reciclaje y siembra de árboles de Lucas en Medellín.', icon: '🌳' },
          { x: 70, y: 40, title: 'Vancouver Exchange', text: 'Comité otorgó la beca por su liderazgo ecológico e inglés.', icon: '🇨🇦' }
        ];

      // 23. Rutina de Sarah
      case 'healthy-routine':
        return [
          { x: 30, y: 45, title: 'Desayuno Saludable', text: 'Avena con fresas y agua pura antes de ir a clase.', icon: '🥣' },
          { x: 70, y: 45, title: 'Caminata de 20 min', text: 'Caminar 4 cuadras oxigena el cerebro para matemáticas y biología.', icon: '🚶‍♀️' }
        ];

      // 24. Algoritmos
      case 'algorithm-flow':
        return [
          { x: 25, y: 45, title: 'Instrucciones Finitas', text: 'Secuencia ordenada paso a paso para resolver un problema.', icon: '📋' },
          { x: 75, y: 45, title: 'Precisión Lógica', text: 'Como una receta de cocina o un cálculo matemático exacto.', icon: '💡' }
        ];

      // 25. Ciberseguridad
      case 'cyber-vault':
        return [
          { x: 30, y: 45, title: 'Huella Digital', text: 'Rastro permanente que dejas al publicar fotos y usar redes.', icon: '👣' },
          { x: 70, y: 45, title: 'Contraseña Robusta', text: 'Combinar mayúsculas, minúsculas, números y símbolos sin compartirla.', icon: '🔐' }
        ];

      // 26. Mediación de Paz
      case 'peace-mediation-table':
        return [
          { x: 30, y: 45, title: 'Mediador de Paz', text: 'Estudiante que guía la pausa reflexiva y la escucha sin gritos.', icon: '🤝' },
          { x: 70, y: 45, title: 'Acuerdo Integrador', text: 'Unir la maqueta reciclada con la presentación digital.', icon: '💡' }
        ];

      // 27. Inclusión Carlos
      case 'inclusion-ramp':
        return [
          { x: 30, y: 45, title: 'Estratega del Equipo', text: 'Carlos en silla de ruedas propone jugadas brillantes.', icon: '♿' },
          { x: 70, y: 45, title: 'Derribar Barreras (BAP)', text: 'Adaptar las reglas del juego para que todos participen con dignidad.', icon: '🌈' }
        ];

      default:
        return [
          { x: 50, y: 50, title: 'Punto de Exploración', text: 'Observa la fotografía y relaciona los elementos con la lectura.', icon: '🔍' }
        ];
    }
  };

  const hotspots = getHotspotsForModel(modelKey);

  // Check if this question has a specialized mathematical / scientific schematic
  const hasSchematic = [
    'court-geometry', 
    'huerta-fractions', 
    'cash-discount', 
    'photosynthesis-leaf', 
    'four-porques',
    'poetry-metaphor'
  ].includes(modelKey);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 group">
      
      {/* Top Header Bar */}
      <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700 text-xs text-white shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-extrabold tracking-tight truncate max-w-[200px] sm:max-w-xs">
            {item.placeName || item.storyTitle || 'Exploración Visual'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg">
            <button
              onClick={() => setStageViewMode('photo')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
                stageViewMode === 'photo'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📸</span>
              <span>Fotografía Real</span>
            </button>

            {hasSchematic && (
              <button
                onClick={() => setStageViewMode('diagram')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
                  stageViewMode === 'diagram'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>📐</span>
                <span>Esquema Guía</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setFullscreenImage(!fullscreenImage)}
            className="p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs transition shadow-md"
            title="Expandir imagen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* VIEW 2: Clean Concept Schematic Diagram (For Math & Science) */}
      {stageViewMode === 'diagram' && hasSchematic && (
        <div className="w-full h-64 sm:h-80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 flex items-center justify-center animate-pop-in">
          {/* Cancha Geometría */}
          {modelKey === 'court-geometry' && (
            <div className="w-full max-w-md bg-emerald-950/80 border-2 border-emerald-400 rounded-xl p-4 flex flex-col items-center justify-between text-white font-mono relative shadow-2xl">
              <div className="w-full text-center border-b border-emerald-400/40 pb-1 text-xs font-bold text-amber-300">
                Plano de la Cancha Polideportiva
              </div>
              <div className="my-3 w-4/5 h-28 border-2 border-white/80 rounded flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-full border-2 border-white/80" />
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/80" />
                {/* Dimensions */}
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-amber-300 bg-slate-900 px-2 rounded border border-amber-400">
                  Largo = 28 m
                </span>
                <span className="absolute -left-7 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-emerald-300 bg-slate-900 px-1 rounded border border-emerald-400">
                  15 m
                </span>
              </div>
              <div className="flex items-center justify-around w-full text-xs font-extrabold bg-slate-900/90 py-1.5 px-3 rounded-lg border border-emerald-500/50">
                <span className="text-amber-300">Superficie Interior (m²)</span>
                <span className="text-slate-400">|</span>
                <span className="text-emerald-300">Contorno del Terreno (m)</span>
              </div>
            </div>
          )}

          {/* Huerta Fracciones */}
          {modelKey === 'huerta-fractions' && (
            <div className="w-full max-w-sm bg-stone-900 border-2 border-amber-600 rounded-xl p-3 flex flex-col items-center justify-between text-white shadow-2xl">
              <div className="text-xs font-bold text-amber-300 border-b border-stone-700 pb-1 w-full text-center">
                Distribución de la Parcela Comunitaria (1 Entero)
              </div>
              <div className="my-2 w-48 h-48 grid grid-cols-2 grid-rows-2 gap-1.5 p-1 bg-stone-950 rounded-lg border border-stone-600">
                <div className="row-span-2 bg-gradient-to-br from-orange-600 to-amber-700 rounded-md border border-orange-300 flex flex-col items-center justify-center p-2 text-center shadow-lg">
                  <span className="text-xl">🥕</span>
                  <strong className="text-sm">1/2 Parcela</strong>
                  <span className="text-[10px] text-orange-200">Zanahorias</span>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-md border border-emerald-300 flex flex-col items-center justify-center p-1 text-center shadow-lg">
                  <span className="text-lg">🥬</span>
                  <strong className="text-xs">1/4</strong>
                  <span className="text-[9px] text-emerald-200">Lechuga</span>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-md border-2 border-purple-300 flex flex-col items-center justify-center p-1 text-center shadow-xl ring-2 ring-purple-400 animate-pulse">
                  <span className="text-lg">🌿</span>
                  <strong className="text-xs text-purple-200">¿Fracción Restante?</strong>
                  <span className="text-[9px] text-purple-300 font-bold">Aromáticas</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-amber-200 font-bold">
                Distribución Proporcional de la Parcela (1 Entero)
              </span>
            </div>
          )}

          {/* Finanzas Cafetería */}
          {modelKey === 'cash-discount' && (
            <div className="w-full max-w-sm bg-slate-900 border-2 border-emerald-500 rounded-xl p-4 flex flex-col justify-between text-white font-mono shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2 text-xs">
                <span className="text-amber-300 font-bold">Recibo Cafetería Escolar</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">-10% Descuento</span>
              </div>
              <div className="my-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Jugo de Mandarina:</span>
                  <span>$6.000</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Sándwiches integrales:</span>
                  <span>$10.000</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Subtotal Compra:</span>
                  <span className="font-bold text-white">$16.000</span>
                </div>
                <div className="flex justify-between text-amber-300 text-xs">
                  <span>Descuento aplicado:</span>
                  <span>-10% del subtotal</span>
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-emerald-500/40 flex justify-between items-center text-xs">
                <span className="text-slate-300">Pagaron con: $20.000</span>
                <span className="text-emerald-400 font-bold text-xs">¿Cuánto sobra de cambio?</span>
              </div>
            </div>
          )}

          {/* Fotosíntesis */}
          {modelKey === 'photosynthesis-leaf' && (
            <div className="w-full max-w-md bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-400 rounded-xl p-4 flex flex-col items-center justify-between text-white shadow-2xl">
              <div className="text-xs font-bold text-emerald-300 border-b border-emerald-400/30 pb-1 w-full text-center">
                Esquema Bioquímico de la Fotosíntesis
              </div>
              <div className="my-3 flex items-center justify-around w-full gap-2">
                <div className="flex flex-col items-center bg-yellow-950/40 border border-yellow-500/40 p-2 rounded-lg text-center">
                  <span className="text-2xl">☀️</span>
                  <span className="text-[10px] font-bold text-yellow-300 mt-1">Luz Solar</span>
                  <span className="text-[9px] text-slate-300">+ CO2 + H2O</span>
                </div>
                <div className="text-2xl text-emerald-400 font-black animate-pulse">➔</div>
                <div className="flex flex-col items-center bg-emerald-950/60 border-2 border-emerald-300 p-2.5 rounded-xl shadow-[0_0_15px_#10b981]">
                  <span className="text-2xl">🌿</span>
                  <span className="text-[11px] font-black text-white">Cloroplasto</span>
                  <span className="text-[9px] text-emerald-200">Fotosíntesis</span>
                </div>
                <div className="text-2xl text-emerald-400 font-black animate-pulse">➔</div>
                <div className="flex flex-col items-center bg-cyan-950/40 border border-cyan-500/40 p-2 rounded-lg text-center">
                  <span className="text-2xl">🫧</span>
                  <span className="text-[10px] font-bold text-cyan-300 mt-1">Oxígeno (O2)</span>
                  <span className="text-[9px] text-slate-300">+ Glucosa viva</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-300 font-bold bg-slate-950 px-3 py-1 rounded-full border border-emerald-500/40">
                La deforestación destruye la captura de CO2 y disminuye el oxígeno
              </span>
            </div>
          )}

          {/* Cuatro Porqués */}
          {modelKey === 'four-porques' && (
            <div className="w-full max-w-md bg-slate-900 border-2 border-indigo-500 rounded-xl p-3 flex flex-col justify-between text-white shadow-2xl">
              <div className="text-xs font-bold text-indigo-300 border-b border-slate-700 pb-1 w-full text-center">
                Cuadro Comparativo: La Regla de Oro de los Cuatro "Porqués"
              </div>
              <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                <div className="bg-amber-950/40 border border-amber-400/50 p-2 rounded-lg">
                  <strong className="text-amber-300 block">1. El porqué</strong>
                  <span className="text-[11px] text-slate-300">Sustantivo. Equivale a "el motivo" o "la causa".</span>
                </div>
                <div className="bg-blue-950/40 border border-blue-400/50 p-2 rounded-lg">
                  <strong className="text-blue-300 block">2. ¿Por qué?</strong>
                  <span className="text-[11px] text-slate-300">Interrogativo o exclamativo. Para preguntas.</span>
                </div>
                <div className="bg-emerald-950/40 border border-emerald-400/50 p-2 rounded-lg">
                  <strong className="text-emerald-300 block">3. Porque</strong>
                  <span className="text-[11px] text-slate-300">Conjunción explicativa. Responde ("ya que").</span>
                </div>
                <div className="bg-purple-950/40 border border-purple-400/50 p-2 rounded-lg">
                  <strong className="text-purple-300 block">4. Por que</strong>
                  <span className="text-[11px] text-slate-300">Relativo. Equivale a "por el cual" o "por la que".</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-center text-slate-400">
                Ejemplo Guía: "Explica el <strong>porqué</strong> de tu idea; triunfaremos <strong>porque</strong> perseveramos."
              </span>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Full-HD High-Definition Realistic Photograph with Interactive Clue Hotspots */}
      {stageViewMode === 'photo' && (
        <div className={`relative w-full ${fullscreenImage ? 'h-96' : 'h-64 sm:h-72'} overflow-hidden transition-all duration-300`}>
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.placeName || 'Fotografía del reto'} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center">
              <span className="text-5xl opacity-40">📖</span>
            </div>
          )}

          {/* Cinematic Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-black/20 to-black/40 pointer-events-none" />

          {/* Interactive Discovery Hotspots (Puntos Clave con Pistas de la Lectura) */}
          {hotspots.map((spot, idx) => (
            <div 
              key={idx}
              className="absolute z-20"
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <button
                onClick={() => setActiveHotspot(activeHotspot === idx ? null : idx)}
                onMouseEnter={() => setActiveHotspot(idx)}
                className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all transform hover:scale-115 active:scale-95 shadow-xl ${
                  activeHotspot === idx 
                    ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/40 scale-110' 
                    : 'bg-slate-900/90 text-white border-amber-400/80 hover:bg-amber-400 hover:text-slate-950'
                }`}
                title="Toca para ver el dato clave"
              >
                <span className="text-xs font-bold leading-none">{spot.icon || '📍'}</span>
                <span className="absolute -inset-1 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
              </button>

              {/* Hotspot Floating Tooltip Popup */}
              {activeHotspot === idx && (
                <div 
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-56 sm:w-64 bg-slate-900/95 backdrop-blur-md border border-amber-400/60 rounded-xl p-2.5 text-white shadow-2xl z-30 animate-pop-in pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 border-b border-slate-700 pb-1 mb-1.5">
                    <span className="text-sm">{spot.icon}</span>
                    <strong className="text-xs font-extrabold text-amber-300">{spot.title}</strong>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug font-sans">
                    {spot.text}
                  </p>
                  <button 
                    onClick={() => setActiveHotspot(null)}
                    className="text-[9px] text-slate-400 hover:text-white mt-1.5 block text-right w-full font-bold"
                  >
                    Entendido ✓
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Bottom Bar: Instructions & Subject Tag */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[10px] font-semibold text-slate-300 shadow">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Toca los círculos 📍 para descubrir datos clave</span>
            </span>

            {subject && (
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-slate-900/80 text-[10px] font-mono text-slate-400 border border-slate-700/60">
                {subject}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
