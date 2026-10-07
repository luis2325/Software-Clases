import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Volume2, 
  HelpCircle, 
  X, 
  CheckCircle2, 
  Radio, 
  ChevronRight,
  Compass,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';
import teacherVoice from '../utils/voiceAssistant';
import voiceBus from '../utils/voiceCommandBus';

export default function TeacherVoiceAssistant({ 
  currentView = 'teacher',
  onHelp = null
}) {
  const [isListening, setIsListening] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionError, setPermissionError] = useState(null);
  const hideToastTimeoutRef = useRef(null);

  useEffect(() => {
    setIsSupported(teacherVoice.isSupported());

    teacherVoice.onStateChange = (listening) => {
      setIsListening(listening);
    };

    teacherVoice.onTranscript = (transcript, isFinal) => {
      setLiveTranscript(transcript);
    };

    teacherVoice.onCommandDetected = (info) => {
      if (info.intent) {
        setLastCommand({
          transcript: info.transcript,
          label: info.intent.label,
          action: info.intent.action,
          time: new Date()
        });
      } else {
        setLastCommand({
          transcript: info.transcript,
          label: 'Comando no reconocido. Di "¿Qué puedo decir?" para ver la lista.',
          action: 'UNKNOWN',
          time: new Date()
        });
      }

      // Auto-hide pill after 4.5 seconds
      if (hideToastTimeoutRef.current) clearTimeout(hideToastTimeoutRef.current);
      hideToastTimeoutRef.current = setTimeout(() => {
        setLastCommand(null);
        setLiveTranscript('');
      }, 4500);
    };

    teacherVoice.onError = (err) => {
      setPermissionError(err);
      setTimeout(() => setPermissionError(null), 6000);
    };

    // Listen to SHOW_HELP voice event
    const unsubscribeHelp = voiceBus.on('SHOW_HELP', () => {
      setShowHelpModal(true);
    });

    // Listen to TOGGLE_MIC event (from top header button or external trigger)
    const unsubscribeToggle = voiceBus.on('TOGGLE_MIC', () => {
      setPermissionError(null);
      teacherVoice.toggle(continuousMode);
    });

    return () => {
      unsubscribeHelp();
      unsubscribeToggle();
      if (hideToastTimeoutRef.current) clearTimeout(hideToastTimeoutRef.current);
    };
  }, []);

  const [showBrowserModal, setShowBrowserModal] = useState(false);

  const handleToggleMic = () => {
    if (!isSupported) {
      setShowBrowserModal(true);
      return;
    }
    setPermissionError(null);
    teacherVoice.toggle(continuousMode);
  };

  const handleToggleContinuous = () => {
    if (!isSupported) {
      setShowBrowserModal(true);
      return;
    }
    const nextMode = !continuousMode;
    setContinuousMode(nextMode);
    if (isListening) {
      teacherVoice.stop();
      setTimeout(() => teacherVoice.start(nextMode), 200);
    }
  };

  return (
    <>
      {/* Unsupported Browser Alert Modal (Firefox / Safari sin Speech) */}
      {showBrowserModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowBrowserModal(false)}
        >
          <div 
            className="bg-slate-900 border border-purple-500/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-2xl shadow-lg">
                  🦊
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Navegador Actual: Mozilla Firefox</h3>
                  <p className="text-xs text-amber-300 font-semibold">El reconocimiento de voz de "Alexa" requiere Chrome o Edge</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBrowserModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Firefox no incluye por defecto el motor de reconocimiento de voz nativo (Web Speech API). Por esa razón el micrófono no se activa aquí.
              </p>

              <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-3.5 space-y-2">
                <p className="font-extrabold text-purple-300 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>¿Cómo activarlo fácilmente?</span>
                </p>
                <ul className="space-y-2 text-slate-200">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">1.</span>
                    <span><strong>En tu celular (Android o iPhone):</strong> Abre el enlace en Chrome o Safari. ¡Ahí el micrófono funciona inmediatamente con solo tocarlo!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">2.</span>
                    <span><strong>En tu computador:</strong> Abre este mismo enlace en <strong>Google Chrome</strong> o <strong>Microsoft Edge</strong>.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => setShowBrowserModal(false)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
              >
                Entendido ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Teacher Voice Dock (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2.5 pointer-events-auto">
        
        {/* Permission Error Warning Banner */}
        {permissionError && (
          <div className="max-w-xs bg-rose-950/95 border border-rose-500/80 text-rose-200 p-3 rounded-2xl shadow-2xl text-xs backdrop-blur-md animate-fade-in flex items-start gap-2">
            <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-white">Micrófono Bloqueado</p>
              <p className="text-[11px] mt-0.5">{permissionError}</p>
            </div>
            <button 
              onClick={() => setPermissionError(null)}
              className="text-rose-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Live Feedback Toast: What the teacher just said */}
        {(isListening || liveTranscript || lastCommand) && (
          <div className="max-w-sm sm:max-w-md bg-slate-900/95 border border-purple-500/50 backdrop-blur-xl p-3 rounded-2xl shadow-2xl text-white animate-fade-in flex items-center gap-3">
            
            {/* Wave Animation Icon */}
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${
              isListening ? 'bg-purple-600 text-white' : 'bg-slate-800 text-purple-400'
            }`}>
              {isListening ? (
                <>
                  <Mic className="w-5 h-5 animate-pulse" />
                  <span className="absolute -inset-1 rounded-xl bg-purple-500/40 animate-ping pointer-events-none" />
                </>
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>

            {/* Transcript & Interpretation */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {isListening ? 'Escuchando la orden del profe...' : 'Comando Ejecutado'}
                </span>
                {continuousMode && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-950 border border-purple-700/60 text-purple-300">
                    Manos Libres
                  </span>
                )}
              </div>

              <p className="text-xs font-semibold text-slate-100 truncate mt-0.5">
                "{liveTranscript || lastCommand?.transcript || 'Habla ahora...'}"
              </p>

              {lastCommand && (
                <p className={`text-[11px] font-bold flex items-center gap-1 mt-0.5 ${
                  lastCommand.action === 'UNKNOWN' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  <ArrowRight className="w-3 h-3" />
                  <span>{lastCommand.label}</span>
                </p>
              )}
            </div>

            <button 
              onClick={() => {
                setLastCommand(null);
                setLiveTranscript('');
              }}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Floating Controller Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-900/98 backdrop-blur-xl border border-slate-700/80 shadow-2xl transition-all duration-300">
          
          {/* Hands-Free Mode Toggle Button */}
          <button
            onClick={handleToggleContinuous}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              continuousMode
                ? 'bg-purple-950/80 border border-purple-500/80 text-purple-200'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title={continuousMode ? 'Modo Manos Libres Activado (Escucha continua en el aula)' : 'Activar Modo Manos Libres'}
          >
            <Radio className={`w-3.5 h-3.5 ${continuousMode ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="hidden sm:inline text-[11px]">
              {continuousMode ? 'Manos Libres' : 'Modo Aula'}
            </span>
          </button>

          {/* Quick Help Cheat Sheet Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition"
            title="Ver qué órdenes de voz puedes dar"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Main Giant Glowing Mic Button */}
          <button
            onClick={handleToggleMic}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl font-black text-xs transition-all transform active:scale-95 shadow-xl ${
              isListening
                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white ring-4 ring-purple-500/40 animate-pulse'
                : 'bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white'
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>Escuchando...</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Asistente de Voz</span>
              </>
            )}
          </button>

        </div>
      </div>

      {/* Voice Commands Cheat Sheet Modal for Teachers */}
      {showHelpModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowHelpModal(false)}
        >
          <div 
            className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden relative text-white max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>Asistente de Voz para Docentes</span>
                    <span className="text-[10px] bg-purple-950 border border-purple-500 text-purple-300 px-2 py-0.5 rounded-full uppercase font-bold">
                      Control por Voz
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Habla de forma natural como con "Alexa". No necesitas tocar el teclado ni el ratón.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Command Categories */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">

              {/* 1. Proyección & Sala */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-purple-400 font-extrabold text-xs mb-2">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <span>Para Iniciar la Clase y Conectar a los Estudiantes</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-200">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <strong className="text-amber-300 block font-mono">🗣️ "Lanzar sala" / "Código QR"</strong>
                    <span className="text-[11px] text-slate-400">Proyecta la pantalla gigante con el código QR y PIN.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <strong className="text-amber-300 block font-mono">🗣️ "Iniciar partida"</strong>
                    <span className="text-[11px] text-slate-400">Arranca el juego para todos los estudiantes conectados.</span>
                  </div>
                </div>
              </div>

              {/* 2. Durante el Juego */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs mb-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Durante la Proyección de Preguntas</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-200">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <strong className="text-emerald-300 block font-mono">🗣️ "Siguiente pregunta" / "Avanzar"</strong>
                    <span className="text-[11px] text-slate-400">Pasa al siguiente reto sin ir al computador.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <strong className="text-emerald-300 block font-mono">🗣️ "Léeme la historia" / "Leer pregunta"</strong>
                    <span className="text-[11px] text-slate-400">El narrador lee la bitácora con voz humana clara.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <strong className="text-emerald-300 block font-mono">🗣️ "Quitar tiempo" / "Pausar tiempo"</strong>
                    <span className="text-[11px] text-slate-400">Detiene el reloj para dar tiempo al debate escolar.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <strong className="text-emerald-300 block font-mono">🗣️ "Más tiempo"</strong>
                    <span className="text-[11px] text-slate-400">Suma 30 segundos adicionales al cronómetro.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <strong className="text-emerald-300 block font-mono">🗣️ "Mostrar foto" / "Ver fotografía"</strong>
                    <span className="text-[11px] text-slate-400">Muestra la foto real del lugar (Caño Cristales, Las Lajas, etc.).</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <strong className="text-emerald-300 block font-mono">🗣️ "Ver mapa satelital"</strong>
                    <span className="text-[11px] text-slate-400">Regresa a la vista del planeta tierra interactivo.</span>
                  </div>
                </div>
              </div>

              {/* 3. Abrir Asignaturas Directamente */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs mb-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Para Abrir Asignaturas Directamente</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { cmd: '🗣️ "Abrir Geografía"', desc: 'GeoTurismo Colombia' },
                    { cmd: '🗣️ "Abrir Historia"', desc: 'Ruta Libertadora' },
                    { cmd: '🗣️ "Abrir Lenguaje"', desc: 'Lectura Crítica' },
                    { cmd: '🗣️ "Abrir Mitos"', desc: 'Mitos y Leyendas' },
                    { cmd: '🗣️ "Abrir Matemáticas"', desc: 'Desafío Lógico' },
                    { cmd: '🗣️ "Abrir Ciencias"', desc: 'Biodiversidad' },
                    { cmd: '🗣️ "Abrir Inglés"', desc: 'English Explorers' },
                    { cmd: '🗣️ "Abrir Tecnología"', desc: 'Ciberseguridad' },
                    { cmd: '🗣️ "Abrir Cátedra de Paz"', desc: 'Ética y Valores' },
                  ].map((item, idx) => (
                    <div key={idx} className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-[11px] text-slate-300">
                      <strong className="text-cyan-300 font-mono">{item.cmd}</strong> ➔ {item.desc}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Reportes en Excel y Salida */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs mb-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span>Reportes en Excel y Navegación</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-200">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <strong className="text-amber-300 block font-mono">🗣️ "Descargar Excel" / "Descargar notas"</strong>
                    <span className="text-[11px] text-slate-400">Genera y descarga la planilla completa en Excel compatible con Windows.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <strong className="text-amber-300 block font-mono">🗣️ "Volver al inicio" / "Salir"</strong>
                    <span className="text-[11px] text-slate-400">Regresa al catálogo principal de retos.</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-slate-800 pt-3 mt-3 flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Consejo: Activa <strong>Modo Aula / Manos Libres</strong> para hablar mientras caminas por el salón.</span>
              </span>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white text-xs transition"
              >
                ¡Entendido!
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
