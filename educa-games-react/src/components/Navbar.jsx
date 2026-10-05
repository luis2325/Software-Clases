import React from 'react';
import { Gamepad2, Coins, Presentation, GraduationCap, Shield } from 'lucide-react';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  student, 
  availablePoints, 
  onOpenVoucherModal 
}) {
  const isTeacherSession = currentView === 'teacher' || currentView === 'lobby';

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <div 
          onClick={() => {
            if (isTeacherSession) setCurrentView('teacher');
            else setCurrentView('student_join');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold font-heading bg-gradient-to-r from-white via-slate-200 to-amber-300 bg-clip-text text-transparent">
              AprendePlus <span className="text-xs text-indigo-400 font-mono">Colegio</span>
            </span>
            <span className="text-xs block text-slate-400">
              {isTeacherSession ? 'Panel de Control del Docente' : 'Dinámica Interactiva de Clase'}
            </span>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">
          
          {/* Points badge (only shown if student has points) */}
          {student.name && (
            <div 
              onClick={onOpenVoucherModal}
              className="cursor-pointer flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 hover:border-amber-400/60 px-3 py-1.5 rounded-full transition"
              title="Ver estado de mis puntos y vales"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-300 hidden sm:inline">Puntos:</span>
              <span className="text-sm font-bold text-amber-300">{availablePoints}</span>
            </div>
          )}

          {/* Teacher control button (only shown when teacher is managing) */}
          {isTeacherSession && (
            <button
              onClick={() => setCurrentView('student_join')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="Ver cómo lo ve un estudiante en su celular"
            >
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Simular Celular Estudiante</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
