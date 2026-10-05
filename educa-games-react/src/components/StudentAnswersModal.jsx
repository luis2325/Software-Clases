import React from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Calendar, 
  Clock 
} from 'lucide-react';

export default function StudentAnswersModal({ record, onClose }) {
  if (!record) return null;

  const answers = record.answersHistory || [];
  const correctCount = record.correctAnswers ?? answers.filter(a => a.isCorrect).length;
  const totalCount = record.totalQuestions ?? answers.length;
  const pct = record.percentage ?? (totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-pop-in">
      <div className="bg-slate-900 border border-slate-700 max-w-2xl w-full max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{record.studentName}</span>
                <span className="text-xs bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-full border border-slate-700">
                  {record.grade || '8°'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {record.gameTitle || 'Actividad Evaluativa'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score Overview Bar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Puntuación</span>
            <span className="text-lg sm:text-xl font-black text-amber-300">+{record.score} pts</span>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Aciertos</span>
            <span className="text-lg sm:text-xl font-black text-emerald-400">{correctCount} de {totalCount}</span>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Efectividad</span>
            <span className={`text-lg sm:text-xl font-black ${pct >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {pct}%
            </span>
          </div>
        </div>

        {/* Question Answers Detailed List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {answers.length > 0 ? (
            answers.map((ans, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border transition-all ${
                  ans.isCorrect 
                    ? 'bg-emerald-950/20 border-emerald-500/30' 
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-mono flex items-center justify-center font-bold text-indigo-400">
                      #{ans.step || idx + 1}
                    </span>
                    <span className="text-slate-200">{ans.placeName || ans.storyTitle || `Pregunta ${idx + 1}`}</span>
                  </span>

                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    ans.isCorrect 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {ans.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Correcto (+{ans.pointsEarned || 20} pts)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-rose-400" />
                        <span>Incorrecto (0 pts)</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Question text */}
                <p className="text-xs font-semibold text-white mb-3 pl-1 leading-snug">
                  {ans.question}
                </p>

                {/* Answers breakdown */}
                <div className="space-y-2 text-xs">
                  {/* What student selected */}
                  <div className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                    ans.isCorrect
                      ? 'bg-emerald-900/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-900/30 border-rose-500/40 text-rose-200'
                  }`}>
                    <span className="font-bold shrink-0">
                      {ans.isCorrect ? '✅ Respuesta del estudiante:' : '❌ Respuesta del estudiante:'}
                    </span>
                    <span className="flex-1 font-medium">
                      {ans.selectedLetter ? `(${ans.selectedLetter}) ` : ''}{ans.selectedOption}
                    </span>
                    <span className="font-bold shrink-0 text-[11px]">
                      {ans.isCorrect ? '¡Acertó!' : '¡Falló!'}
                    </span>
                  </div>

                  {/* Always show official correct answer */}
                  <div className="p-2.5 rounded-xl border bg-emerald-950/40 border-emerald-500/40 text-emerald-300 flex items-start gap-2">
                    <span className="font-bold shrink-0 flex items-center gap-1 text-emerald-400">
                      <span>🎯 Respuesta Correcta Oficial:</span>
                    </span>
                    <span className="flex-1 font-semibold text-emerald-200">
                      {ans.correctLetter ? `(${ans.correctLetter}) ` : ''}{ans.correctOption}
                    </span>
                    {ans.isCorrect && (
                      <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-bold px-1.5 py-0.5 rounded shrink-0">
                        Coincide ✓
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/60 rounded-2xl border border-slate-800">
              Este intento se guardó antes de activar el historial detallado de respuestas. En las nuevas partidas que jueguen tus estudiantes, verás aquí el desglose completo pregunta por pregunta.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Fecha de entrega: {record.submittedAt ? new Date(record.submittedAt).toLocaleString() : 'Reciente'}</span>
          </span>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-xl border border-slate-700 font-semibold"
          >
            Cerrar Vista
          </button>
        </div>

      </div>
    </div>
  );
}
