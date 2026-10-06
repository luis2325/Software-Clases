import React, { useState } from 'react';
import { Gamepad2, GraduationCap, ArrowRight, Sparkles, Coffee, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import Hero3DGlobe from './Hero3DGlobe';

export default function StudentMobileView({ 
  initialPin, 
  initialGameId, 
  games, 
  onJoinSuccess 
}) {
  const [pin, setPin] = useState(initialPin || '');
  const [name, setName] = useState(localStorage.getItem('aprende_student_name') || '');
  const [grade, setGrade] = useState(localStorage.getItem('aprende_student_grade') || '8°');

  // If initialGameId is passed via URL, find that specific game
  const assignedGame = games.find(g => g.id === initialGameId) || (initialPin ? games[0] : null);

  const [step, setStep] = useState(initialPin || initialGameId ? 'name' : 'pin');

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (!pin.trim() || pin.trim().length < 3) {
      alert('Por favor ingresa el código PIN de 4 dígitos que proyecta tu profesor.');
      return;
    }
    soundFx.playCoin();
    setStep('name');
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor escribe tu nombre y apellido para guardar tus puntos');
      return;
    }

    localStorage.setItem('aprende_student_name', name.trim());
    localStorage.setItem('aprende_student_grade', grade);

    soundFx.playCoin();
    const targetGame = assignedGame || games[0];
    onJoinSuccess({
      name: name.trim(),
      grade,
      pin: pin.trim() || initialPin || '4821',
      game: targetGame
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl text-center space-y-6">
        
        {/* 🌐 Brand 3D Globe */}
        <div className="w-28 h-28 mx-auto relative flex items-center justify-center">
          <Hero3DGlobe height={112} />
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 block mb-1">
            Plataforma Educativa del Colegio
          </span>
          <h2 className="text-2xl font-black font-heading text-white">
            {step === 'pin' ? 'Ingreso a la Clase' : '¡Bienvenido(a)!'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {step === 'pin' 
              ? 'Escribe el PIN de 4 dígitos que proyecta tu docente en el aula'
              : 'Ingresa tus datos para comenzar el reto asignado y sumar puntos'}
          </p>
        </div>

        {/* STEP 1: Enter PIN (Only shown if user did NOT scan a QR code with PIN/game) */}
        {step === 'pin' && (
          <form onSubmit={handleVerifyPin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Código PIN de la Clase:</span>
              </label>
              <input 
                type="text" 
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Ej: 4821" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-center font-mono font-black tracking-widest text-2xl text-amber-300 focus:outline-none focus:border-indigo-500 uppercase shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm py-3 px-5 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition transform active:scale-95"
            >
              <span>Continuar con el PIN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Name and Grade (Shown after scanning QR or entering PIN) */}
        {step === 'name' && (
          <>
            {/* Assigned Game Indicator */}
            {assignedGame ? (
              <div className="bg-slate-900/90 border border-indigo-500/30 p-3.5 rounded-2xl text-left flex items-center gap-3">
                <img 
                  src={assignedGame.coverImage} 
                  alt={assignedGame.title} 
                  className="w-12 h-12 rounded-xl object-cover shrink-0" 
                />
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block truncate">
                      Actividad Asignada por el Docente
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {assignedGame.title}
                  </h4>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-xs text-amber-300 font-semibold">
                PIN de Clase Conectado: <span className="font-mono font-bold">{pin || initialPin || '4821'}</span>
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-4 text-left">
              {/* Student Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tu Nombre Completo:</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Valentina Morales" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Grade */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tu Grado:</label>
                <select 
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
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

              {/* Enter Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm py-3.5 px-5 rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <span>🚀 ¡ENTRAR AL JUEGO AHORA!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Coffee className="w-3.5 h-3.5 text-amber-400" />
          <span>Cada acierto suma +20 pts para tu vale de cafetería</span>
        </div>

      </div>
    </div>
  );
}
