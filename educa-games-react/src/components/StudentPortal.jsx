import React, { useState } from 'react';
import { 
  GraduationCap, 
  MapPin, 
  BookOpen, 
  Atom, 
  Coins, 
  QrCode, 
  Play, 
  Sparkles, 
  Coffee, 
  Check, 
  Medal,
  Compass
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export default function StudentPortal({ 
  games, 
  student, 
  setStudent, 
  onPlayGame, 
  onShowQR, 
  availablePoints, 
  onOpenVoucherModal 
}) {
  const [nameInput, setNameInput] = useState(student.name || '');
  const [gradeInput, setGradeInput] = useState(student.grade || '8°');

  const handleSaveStudent = () => {
    if (!nameInput.trim()) {
      alert('Por favor ingresa tu nombre y apellido para guardar tus puntos');
      return;
    }
    const updated = { name: nameInput.trim(), grade: gradeInput };
    setStudent(updated);
    localStorage.setItem('aprende_student_name', updated.name);
    localStorage.setItem('aprende_student_grade', updated.grade);
    soundFx.playCoin();
    alert(`¡Hola, ${updated.name}! Tus puntos se acumularán automáticamente.`);
  };

  const handleStartGame = (game) => {
    if (!student.name) {
      alert('Por favor escribe tu nombre en la barra de arriba antes de jugar para que tus puntos queden registrados.');
      return;
    }
    soundFx.playCoin();
    onPlayGame(game);
  };

  return (
    <div className="space-y-10">
      
      {/* Hero Welcome */}
      <div className="text-center max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Aprende Jugando • Colombia y el Mundo
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight mb-4 leading-tight">
          ¡Explora el Mundo y Gana Premios en la <span className="text-amber-400">Cafetería Escolar</span>!
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Supera los retos de mapas satelitales, enigmas científicos y mitos colombianos. Acumula <strong className="text-amber-300">100 puntos</strong> y canjea tu vale de refrigerio.
        </p>
      </div>

      {/* Student Registration Bar */}
      <div className="max-w-2xl mx-auto glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tu Nombre y Apellido:</span>
            </label>
            <input 
              type="text" 
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ej: Valentina Morales" 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="w-full sm:w-36">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Grado:</label>
            <select 
              value={gradeInput}
              onChange={(e) => setGradeInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="6°">6° Grado</option>
              <option value="7°">7° Grado</option>
              <option value="8°">8° Grado</option>
              <option value="9°">9° Grado</option>
              <option value="10°">10° Grado</option>
              <option value="11°">11° Grado</option>
              <option value="Primaria">Primaria</option>
            </select>
          </div>
          <div className="w-full sm:w-auto self-end">
            <button 
              onClick={handleSaveStudent}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </div>

        {student.name && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span>
              Sesión activa: <strong className="text-indigo-300">{student.name}</strong> ({student.grade})
            </span>
            <button 
              onClick={onOpenVoucherModal}
              className="text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
            >
              <Coffee className="w-3.5 h-3.5" /> Ver mis vales de cafetería
            </button>
          </div>
        )}
      </div>

      {/* Available Games Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" /> Desafíos Listos para Jugar
            </h2>
            <p className="text-xs text-slate-400">Escoge un juego o pide a tus compañeros que escaneen el código QR</p>
          </div>
          <span className="text-xs bg-slate-800 text-indigo-300 border border-slate-700 px-3 py-1 rounded-full">
            {games.length} Retos Disponibles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map(game => {
            let badgeColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
            let IconComponent = Compass;
            let typeLabel = 'Desafío Escolar';

            if (game.type === 'map') {
              badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
              IconComponent = MapPin;
              typeLabel = 'Mapa Satelital Real';
            } else if (game.type === 'reading') {
              badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
              IconComponent = BookOpen;
              typeLabel = 'Comprensión Lectora';
            } else if (game.type === 'quiz') {
              badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
              IconComponent = Atom;
              typeLabel = 'Ciencias Naturales';
            }

            const totalPoints = ((game.questions?.length || 5) * (game.pointsPerSuccess || 20));

            return (
              <div 
                key={game.id} 
                className="glass-card rounded-2xl overflow-hidden flex flex-col border border-slate-800"
              >
                <div className="relative h-44 overflow-hidden group">
                  <img 
                    src={game.coverImage} 
                    alt={game.title} 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeColor} backdrop-blur-md flex items-center gap-1`}>
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{typeLabel}</span>
                  </span>

                  <span className="absolute bottom-3 left-3 text-xs text-amber-300 font-bold bg-slate-900/80 px-2.5 py-0.5 rounded-lg border border-amber-500/30 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>+{totalPoints} pts</span>
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold tracking-wide uppercase text-indigo-400 block mb-1">
                      {game.subject || 'Competencia Escolar'}
                    </span>
                    <h3 className="text-base font-bold text-white mb-2 leading-snug line-clamp-2">
                      {game.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                      {game.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onShowQR(game)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-700"
                      title="Proyectar o ver código QR"
                    >
                      <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                      <span>QR</span>
                    </button>

                    <button 
                      onClick={() => handleStartGame(game)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
                    >
                      <span>Jugar Ahora</span>
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cafeteria Reward Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl shrink-0">
              <Coffee className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-white">¿Cómo reclamar tu refrigerio en la Cafetería Escolar?</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                Por cada acierto ganas <strong>+20 puntos</strong>. Al llegar a <strong>100 puntos</strong> se desbloquea tu <strong>Vale Oficial</strong> con código único digital para presentarle a tu docente o en la cafetería.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-center sm:text-right">
            <div className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-1">Meta de Canje</div>
            <div className="text-3xl font-black font-heading text-amber-300">100 PUNTOS</div>
            <span className="text-[11px] text-slate-400 block mt-1">Refrigerio o Bonificación</span>
          </div>
        </div>
      </div>

    </div>
  );
}
