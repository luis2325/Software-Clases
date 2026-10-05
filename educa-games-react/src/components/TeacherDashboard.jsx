import React, { useState } from 'react';
import { 
  Dice5, 
  Play, 
  Users, 
  Ticket, 
  Layers, 
  TableProperties, 
  Coffee, 
  Plus, 
  QrCode, 
  Trash2, 
  Download, 
  Check, 
  Search, 
  Wifi,
  ExternalLink,
  Eye,
  CheckCircle2,
  XCircle,
  BookOpen,
  HelpCircle,
  Filter,
  Sparkles
} from 'lucide-react';
import StudentAnswersModal from './StudentAnswersModal';

export default function TeacherDashboard({ 
  games, 
  scores, 
  vouchers, 
  onShowQR, 
  onPlayGame, 
  onDeleteGame, 
  onOpenCreateGame, 
  onClaimVoucher,
  onHostLobby,
  onResetAll
}) {
  const [activeTab, setActiveTab] = useState('games');
  const [voucherSearch, setVoucherSearch] = useState('');
  const [selectedScoreToInspect, setSelectedScoreToInspect] = useState(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [selectedGameFilter, setSelectedGameFilter] = useState('all');
  const [answerViewMode, setAnswerViewMode] = useState('matrix'); // 'matrix' | 'by_question'
  const [activeQuestionStep, setActiveQuestionStep] = useState(1);

  const categories = [
    { id: 'all', label: 'Todos los Retos', icon: '🌟' },
    { id: 'geografia', label: 'Geografía (Mapa)', icon: '🛰️' },
    { id: 'historia', label: 'Historia', icon: '⚔️' },
    { id: 'lenguaje', label: 'Lenguaje & Lectura', icon: '📖' },
    { id: 'matematicas', label: 'Matemáticas', icon: '📐' },
    { id: 'ciencias', label: 'Ciencias Naturales', icon: '🔬' },
    { id: 'ingles', label: 'Inglés', icon: '🌍' },
    { id: 'tecnologia', label: 'Tecnología', icon: '💻' },
    { id: 'etica', label: 'Cátedra de Paz', icon: '🕊️' },
  ];

  const getCategoryCount = (catId) => {
    if (catId === 'all') return games.length;
    if (catId === 'geografia') return games.filter(g => g.category === 'geografia' || g.type === 'map').length;
    if (catId === 'lenguaje') return games.filter(g => g.category === 'lenguaje' || g.category === 'lectura').length;
    return games.filter(g => g.category === catId).length;
  };

  const filteredGames = subjectFilter === 'all' 
    ? games 
    : games.filter(g => 
        g.category === subjectFilter || 
        (subjectFilter === 'geografia' && g.type === 'map') ||
        (subjectFilter === 'lenguaje' && (g.category === 'lenguaje' || g.category === 'lectura'))
      );


  // Calculations for institutional spreadsheet
  const studentMap = {};
  scores.forEach(s => {
    const key = (s.studentName || '').toLowerCase().trim();
    if (!studentMap[key]) {
      studentMap[key] = {
        name: s.studentName,
        grade: s.grade || '8°',
        totalPoints: 0,
        gamesPlayed: 0,
        saberConocer: 0,
        saberHacer: 0,
        saberSer: 50 // Base actitudinal por participación activa en clase
      };
    }
    studentMap[key].totalPoints += (s.score || 0);
    studentMap[key].gamesPlayed += 1;
    studentMap[key].saberConocer += Math.round((s.score || 0) * 0.4);
    studentMap[key].saberHacer += Math.round((s.score || 0) * 0.4);
    studentMap[key].saberSer = Math.min(100, studentMap[key].saberSer + 10);
  });

  const studentsList = Object.values(studentMap);
  const totalPlays = scores.length;
  const totalVouchers = vouchers.length;
  const vouchersDelivered = vouchers.filter(v => v.status === 'CANJEADO').length;

  // LAN info
  const lanUrl = window.location.origin;

  // Export CSV matching institutional Excel format
  const exportToCSV = () => {
    let csv = 'Estudiante,Grado,Partidas,Puntos Totales,Saber Conocer (30%),Saber Hacer (40%),Saber Ser (30%),Nota Estimada (1.0-5.0)\n';
    studentsList.forEach(s => {
      const grade5 = Math.min(5.0, (2.5 + (s.totalPoints / 100) * 0.8)).toFixed(1);
      csv += `"${s.name}","${s.grade}",${s.gamesPlayed},${s.totalPoints},${Math.min(100, s.saberConocer)}%,${Math.min(100, s.saberHacer)}%,${s.saberSer}%,${grade5}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Planilla_Calificaciones_Colegio_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleClaim = (code) => {
    onClaimVoucher(code);
    alert(`¡Vale ${code} marcado como CANJEADO y entregado con éxito!`);
  };

  return (
    <div className="space-y-6">

      {/* Teacher Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 block mb-1">
            Gestión Académica Escolar
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Panel de Control del Docente
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Crea desafíos, proyecta códigos QR para celulares y exporta las notas a tu planilla.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs text-emerald-300">
            <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Dirección en Red: <strong className="font-mono">{lanUrl}</strong></span>
          </div>

          <button
            onClick={() => setShowResetConfirmModal(true)}
            className="bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 hover:border-rose-500/60 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Borrar todas las notas, intentos y estudiantes para reiniciar la clase"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Eliminar Todo</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Juegos Activos</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Dice5 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{games.length}</div>
          <span className="text-[11px] text-slate-500">Listos con QR</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Partidas Jugadas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Play className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalPlays}</div>
          <span className="text-[11px] text-slate-500">Participación total</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Estudiantes Activos</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{studentsList.length}</div>
          <span className="text-[11px] text-slate-500">En registro</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
            <span>Vales de Cafetería</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300 mt-2">{totalVouchers}</div>
          <span className="text-[11px] text-amber-400/80">{vouchersDelivered} entregados</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('games')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'games' 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Gestión de Juegos & Códigos QR</span>
        </button>

        <button
          onClick={() => setActiveTab('grades')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'grades' 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TableProperties className="w-4 h-4" />
          <span>Planilla de Calificaciones (Excel)</span>
        </button>

        <button
          onClick={() => setActiveTab('cafeteria')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'cafeteria' 
              ? 'border-amber-500 text-amber-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Coffee className="w-4 h-4 text-amber-400" />
          <span>Cafetería Escolar & Canjes</span>
        </button>

        <button
          onClick={() => setActiveTab('all_answers')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'all_answers' 
              ? 'border-emerald-500 text-emerald-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>📝 Respuestas del Grupo (Todas con Solución)</span>
        </button>
      </div>

      {/* TAB 1: GAMES */}
      {activeTab === 'games' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Catálogo de Actividades y Retos</h3>
              <p className="text-xs text-slate-400">Proyecta el código QR para que tus estudiantes jueguen en sus celulares o crea nuevos juegos</p>
            </div>
            <button
              onClick={onOpenCreateGame}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nuevo Juego</span>
            </button>
          </div>

          {/* Subject Filter Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSubjectFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  subjectFilter === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  subjectFilter === cat.id ? 'bg-indigo-500/40 text-white font-bold' : 'bg-slate-700 text-slate-400'
                }`}>
                  {getCategoryCount(cat.id)}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGames.map(game => (
              <div 
                key={game.id} 
                className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                      {game.subject || 'Competencia'}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      game.type === 'map' ? 'bg-emerald-500/20 text-emerald-300' : (game.type === 'reading' ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300')
                    }`}>
                      {game.type === 'map' ? 'Mapa Satelital' : (game.type === 'reading' ? 'Lectura' : 'Trivia')}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-2 leading-snug">{game.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">{game.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <button
                    onClick={() => onHostLobby ? onHostLobby(game) : onShowQR(game)}
                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <QrCode className="w-4 h-4 text-amber-300" />
                    <span>🚀 LANZAR SALA CON QR Y PIN</span>
                  </button>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => onPlayGame(game)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Probar Juego</span>
                    </button>

                    <button
                      onClick={() => onDeleteGame(game.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition border border-rose-500/30 flex items-center gap-1"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 2: GRADES SPREADSHEET */}
      {activeTab === 'grades' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Planilla de Desempeños y Calificaciones</h3>
              <p className="text-xs text-slate-400">Puntajes ajustados a la ponderación del Saber Conocer (30%), Saber Hacer (40%) y Saber Ser (30%)</p>
            </div>
            <button
              onClick={exportToCSV}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Planilla (CSV / Excel)</span>
            </button>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                    <th className="py-3 px-4">Estudiante</th>
                    <th className="py-3 px-4">Grado</th>
                    <th className="py-3 px-4 text-center">Partidas</th>
                    <th className="py-3 px-4 text-center">Puntos Totales</th>
                    <th className="py-3 px-4 text-center text-indigo-300">Saber Conocer (30%)</th>
                    <th className="py-3 px-4 text-center text-emerald-300">Saber Hacer (40%)</th>
                    <th className="py-3 px-4 text-center text-amber-300">Saber Ser (30%)</th>
                    <th className="py-3 px-4 text-center">Nota Estimada (1.0-5.0)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {studentsList.length > 0 ? (
                    studentsList.map(s => {
                      const grade5 = Math.min(5.0, (2.5 + (s.totalPoints / 100) * 0.8)).toFixed(1);
                      return (
                        <tr key={s.name} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                          <td className="py-3 px-4 text-slate-400">{s.grade}</td>
                          <td className="py-3 px-4 text-center text-slate-300">{s.gamesPlayed}</td>
                          <td className="py-3 px-4 text-center font-bold text-amber-400">{s.totalPoints} pts</td>
                          <td className="py-3 px-4 text-center font-semibold text-indigo-300">{Math.min(100, s.saberConocer)}%</td>
                          <td className="py-3 px-4 text-center font-semibold text-emerald-300">{Math.min(100, s.saberHacer)}%</td>
                          <td className="py-3 px-4 text-center font-semibold text-amber-300">{s.saberSer}%</td>
                          <td className={`py-3 px-4 text-center font-black ${grade5 >= 4.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {grade5} / 5.0
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-slate-500 text-xs">
                        Aún no hay registros de juego. Pide a los estudiantes que jueguen para ver sus notas aquí.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Question Answers Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>📝 Hojas de Respuestas y Corrección de Estudiantes ({scores.length})</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    En Tiempo Real
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Haz clic en "Ver Respuestas" en cualquier intento para ver qué marcó el estudiante pregunta por pregunta y si acertó o falló.
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                      <th className="py-3 px-4">Fecha / Hora</th>
                      <th className="py-3 px-4">Estudiante</th>
                      <th className="py-3 px-4">Grado</th>
                      <th className="py-3 px-4">Actividad Jugada</th>
                      <th className="py-3 px-4 text-center">Aciertos</th>
                      <th className="py-3 px-4 text-center">Puntos</th>
                      <th className="py-3 px-4 text-center">Resultado</th>
                      <th className="py-3 px-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {scores.length > 0 ? (
                      scores.map((sc, idx) => {
                        const correct = sc.correctAnswers ?? 0;
                        const total = sc.totalQuestions ?? 5;
                        const pct = sc.percentage ?? Math.round((correct / total) * 100);
                        const isPerfect = pct === 100;
                        const isPassing = pct >= 60;

                        return (
                          <tr key={sc.id || idx} className="hover:bg-slate-800/40 transition">
                            <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                              {sc.submittedAt ? new Date(sc.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente'}
                            </td>
                            <td className="py-3 px-4 font-bold text-white">
                              {sc.studentName}
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {sc.grade || '8°'}
                            </td>
                            <td className="py-3 px-4 text-indigo-300 font-semibold truncate max-w-xs">
                              {sc.gameTitle || 'Reto Escolar'}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-white">
                              {correct} / {total}
                            </td>
                            <td className="py-3 px-4 text-center font-black text-amber-400">
                              +{sc.score} pts
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                                isPerfect
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : (isPassing ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30')
                              }`}>
                                {isPerfect ? '100% Perfecto' : `${pct}% Acierto`}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => setSelectedScoreToInspect(sc)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 mx-auto shadow-md shadow-indigo-600/20"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver Respuestas</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-slate-500 text-xs">
                          Aún no hay partidas jugadas. Cuando tus estudiantes respondan desde sus celulares, verás aquí cada intento en vivo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: CAFETERIA */}
      {activeTab === 'cafeteria' && (
        <section className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Validar Vale de Cafetería Escolar</h3>
            <p className="text-xs text-slate-400">
              Escribe el código del vale presentado por el estudiante (ej: CAF-4921) para validarlo y marcarlo como entregado.
            </p>
            <div className="flex gap-2 max-w-md mx-auto pt-2">
              <input
                type="text"
                value={voucherSearch}
                onChange={(e) => setVoucherSearch(e.target.value.toUpperCase())}
                placeholder="Código (ej: CAF-1234)"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm uppercase text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => {
                  if (!voucherSearch.trim()) return alert('Escribe el código del vale');
                  handleClaim(voucherSearch.trim());
                  setVoucherSearch('');
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5 shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>Canjear Vale</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-3">Historial de Vales Emitidos</h4>
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Estudiante</th>
                      <th className="py-3 px-4">Grado</th>
                      <th className="py-3 px-4">Recompensa</th>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {vouchers.length > 0 ? (
                      vouchers.map(v => (
                        <tr key={v.code} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-bold text-amber-400">{v.code}</td>
                          <td className="py-3 px-4 font-semibold text-white">{v.studentName}</td>
                          <td className="py-3 px-4 text-slate-400">{v.grade || '8°'}</td>
                          <td className="py-3 px-4 text-slate-300">{v.reward}</td>
                          <td className="py-3 px-4 text-slate-400">{new Date(v.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              v.status === 'CANJEADO' 
                                ? 'bg-slate-700 text-slate-400' 
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {v.status === 'GENERADO' ? (
                              <button
                                onClick={() => handleClaim(v.code)}
                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1 rounded-lg transition"
                              >
                                Marcar Canjeado
                              </button>
                            ) : (
                              <span className="text-xs text-slate-500">Entregado</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-slate-500 text-xs">
                          No se han emitido vales todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: ALL STUDENT ANSWERS (VER TODAS LAS RESPUESTAS DE TODOS CON LA RESPUESTA CORRECTA) */}
      {activeTab === 'all_answers' && (() => {
        const activeGameData = games.find(g => g.id === selectedGameFilter) || null;
        const filteredScoresForAnswers = selectedGameFilter === 'all' 
          ? scores 
          : scores.filter(s => s.gameId === selectedGameFilter);

        const totalAttempts = filteredScoresForAnswers.length;
        const avgPercentage = totalAttempts > 0 
          ? Math.round(filteredScoresForAnswers.reduce((sum, s) => sum + (s.percentage ?? 0), 0) / totalAttempts) 
          : 0;

        const totalCorrectSum = filteredScoresForAnswers.reduce((sum, s) => sum + (s.correctAnswers ?? 0), 0);
        const totalQuestionsSum = filteredScoresForAnswers.reduce((sum, s) => sum + (s.totalQuestions ?? 5), 0);

        // Max steps to display across answers
        const maxSteps = activeGameData 
          ? (activeGameData.questions?.length || 5) 
          : Math.max(5, ...filteredScoresForAnswers.map(s => (s.answersHistory || []).length));

        // For "by_question" view:
        const currentTargetGame = activeGameData || games[0];
        const currentQuestion = currentTargetGame?.questions?.[activeQuestionStep - 1] || null;

        return (
          <section className="space-y-6">
            
            {/* Header & Controls Panel */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                      Evaluación Grupal en Vivo
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                      {totalAttempts} Intentos de Estudiantes
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    Matriz General de Respuestas de Todo el Grupo
                  </h3>
                  <p className="text-xs text-slate-400">
                    Inspecciona qué respondió cada estudiante en cada pregunta con su corrección y la <strong>respuesta correcta oficial</strong> siempre visible.
                  </p>
                </div>

                {/* Filter and Mode Switcher */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Game Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">Filtrar Reto:</span>
                    <select
                      value={selectedGameFilter}
                      onChange={(e) => {
                        setSelectedGameFilter(e.target.value);
                        setActiveQuestionStep(1);
                      }}
                      className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-indigo-500 max-w-xs truncate"
                    >
                      <option value="all">Todas las Actividades ({scores.length} intentos)</option>
                      {games.map(g => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Mode Buttons */}
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setAnswerViewMode('matrix')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        answerViewMode === 'matrix' 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📊 Matriz del Salón
                    </button>
                    <button
                      onClick={() => setAnswerViewMode('by_question')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        answerViewMode === 'by_question' 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🔍 Por Pregunta & Solución
                    </button>
                  </div>
                </div>
              </div>

              {/* Group Quick Performance Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Estudiantes Evaluados</span>
                  <span className="text-lg font-black text-white">{totalAttempts}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Promedio de Acierto</span>
                  <span className={`text-lg font-black ${avgPercentage >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {avgPercentage}%
                  </span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Aciertos del Salón</span>
                  <span className="text-lg font-black text-emerald-400">
                    {totalCorrectSum} / {totalQuestionsSum}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Fallos para Reforzar</span>
                  <span className="text-lg font-black text-rose-400">
                    {Math.max(0, totalQuestionsSum - totalCorrectSum)}
                  </span>
                </div>
              </div>
            </div>

            {/* MODO 1: MATRIZ DE ESTUDIANTES X PREGUNTAS */}
            {answerViewMode === 'matrix' && (
              <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-3">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Planilla Detallada: Respuestas Marcadas y Corrección de Cada Estudiante
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {filteredScoresForAnswers.length} filas
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="py-3 px-3 min-w-[140px] sticky left-0 bg-slate-900 z-10">Estudiante</th>
                        <th className="py-3 px-3 min-w-[130px]">Actividad</th>
                        <th className="py-3 px-3 text-center min-w-[110px]">Aciertos / Fallos</th>
                        <th className="py-3 px-3 text-center min-w-[80px]">Puntos</th>
                        
                        {/* Dynamic Question Headers with Official Correct Answer Snippet */}
                        {Array.from({ length: maxSteps }).map((_, stepIdx) => {
                          const questionRef = activeGameData?.questions?.[stepIdx];
                          const correctSnippet = questionRef 
                            ? `${String.fromCharCode(65 + questionRef.answer)}) ${questionRef.options[questionRef.answer]}`
                            : 'Ver Solución';

                          return (
                            <th key={stepIdx} className="py-3 px-3 min-w-[200px] border-l border-slate-800">
                              <div className="font-bold text-slate-200">Reto #{stepIdx + 1}</div>
                              {questionRef && (
                                <div className="text-[10px] text-emerald-400 normal-case font-semibold truncate max-w-[190px]" title={correctSnippet}>
                                  🎯 Correcta: {correctSnippet}
                                </div>
                              )}
                            </th>
                          );
                        })}

                        <th className="py-3 px-3 text-center min-w-[100px]">Hoja Completa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredScoresForAnswers.length > 0 ? (
                        filteredScoresForAnswers.map((sc, scIdx) => {
                          const answers = sc.answersHistory || [];
                          const correct = sc.correctAnswers ?? answers.filter(a => a.isCorrect).length;
                          const total = sc.totalQuestions ?? answers.length;
                          const incorrect = Math.max(0, total - correct);
                          const pct = sc.percentage ?? (total > 0 ? Math.round((correct / total) * 100) : 0);

                          return (
                            <tr key={sc.id || scIdx} className="hover:bg-slate-800/30 transition">
                              
                              {/* Student Name */}
                              <td className="py-3 px-3 font-bold text-white sticky left-0 bg-slate-950/90 z-10">
                                <div>{sc.studentName}</div>
                                <span className="text-[10px] text-slate-500 font-normal">Grado {sc.grade || '8°'}</span>
                              </td>

                              {/* Game Title */}
                              <td className="py-3 px-3 text-indigo-300 font-medium truncate max-w-[130px]">
                                {sc.gameTitle || 'Reto Escolar'}
                              </td>

                              {/* Correct / Incorrect Breakdown */}
                              <td className="py-3 px-3 text-center">
                                <div className="font-bold text-white">
                                  <span className="text-emerald-400">{correct}</span> / {total}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {pct}% ({incorrect} {incorrect === 1 ? 'fallo' : 'fallos'})
                                </div>
                              </td>

                              {/* Points */}
                              <td className="py-3 px-3 text-center font-black text-amber-400">
                                +{sc.score}
                              </td>

                              {/* Question Answer Cells */}
                              {Array.from({ length: maxSteps }).map((_, stepIdx) => {
                                const ans = answers[stepIdx];
                                if (!ans) {
                                  return (
                                    <td key={stepIdx} className="py-2 px-3 border-l border-slate-800/70 text-slate-600 text-center">
                                      -
                                    </td>
                                  );
                                }

                                return (
                                  <td key={stepIdx} className="py-2 px-3 border-l border-slate-800/70">
                                    <div className={`p-2 rounded-xl border text-[11px] leading-tight space-y-1 ${
                                      ans.isCorrect 
                                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' 
                                        : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                                    }`}>
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-bold">
                                          {ans.isCorrect ? '✅ Acertó:' : '❌ Marcó:'}
                                        </span>
                                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                                          ans.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                        }`}>
                                          {ans.isCorrect ? `+${ans.pointsEarned || 20}p` : '0p'}
                                        </span>
                                      </div>

                                      <div className="line-clamp-2" title={ans.selectedOption}>
                                        {ans.selectedLetter ? `(${ans.selectedLetter}) ` : ''}{ans.selectedOption}
                                      </div>

                                      {/* Show Correct Answer clearly if student failed */}
                                      {!ans.isCorrect && (
                                        <div className="text-[10px] font-bold text-emerald-300 pt-1 border-t border-rose-500/20 truncate" title={ans.correctOption}>
                                          🎯 Correcta: {ans.correctLetter ? `(${ans.correctLetter}) ` : ''}{ans.correctOption}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}

                              {/* Inspect Full Sheet Action */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => setSelectedScoreToInspect(sc)}
                                  className="bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition inline-flex items-center gap-1 shadow"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Ver Hoja</span>
                                </button>
                              </td>

                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={maxSteps + 5} className="text-center py-8 text-slate-500 text-xs">
                            No hay respuestas registradas para este filtro. Pide a tus estudiantes que completen el juego para ver sus respuestas aquí en vivo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODO 2: ANÁLISIS PREGUNTA POR PREGUNTA (CON RESPUESTA CORRECTA OFICIAL Y RESPUESTAS DEL GRUPO) */}
            {answerViewMode === 'by_question' && (
              <div className="space-y-6">
                
                {/* Step Selector Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {Array.from({ length: currentTargetGame?.questions?.length || 5 }).map((_, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => setActiveQuestionStep(qIdx + 1)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                        activeQuestionStep === qIdx + 1
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>Pregunta #{qIdx + 1}</span>
                      {currentQuestion && activeQuestionStep === qIdx + 1 && (
                        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                      )}
                    </button>
                  ))}
                </div>

                {currentQuestion ? (
                  <div className="space-y-4">
                    {/* Official Solution Card */}
                    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-slate-950 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" /> Reto #{activeQuestionStep}: {currentQuestion.storyTitle || currentQuestion.placeName || 'Lectura de Comprensión'}
                        </span>
                        <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/30">
                          {currentQuestion.level || 'Comprensión Lectora'}
                        </span>
                      </div>

                      {/* Story passage snippet */}
                      {(currentQuestion.storyText || currentQuestion.clue) && (
                        <div className="text-xs text-slate-300 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 font-serif leading-relaxed max-h-36 overflow-y-auto">
                          {currentQuestion.storyText || currentQuestion.clue}
                        </div>
                      )}

                      {/* Question */}
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        {currentQuestion.question}
                      </h4>

                      {/* Highlighted Official Correct Answer */}
                      <div className="p-4 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/60 flex items-start gap-3 shadow-lg shadow-emerald-500/10">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
                          ✓
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider block">
                            🎯 RESPUESTA CORRECTA OFICIAL:
                          </span>
                          <p className="text-sm font-bold text-white">
                            ({String.fromCharCode(65 + currentQuestion.answer)}) {currentQuestion.options[currentQuestion.answer]}
                          </p>
                          {currentQuestion.curiosity && (
                            <p className="text-xs text-emerald-300/90 pt-1">
                              💡 <strong>Justificación Pedagógica:</strong> {currentQuestion.curiosity}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* All Options Overview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {currentQuestion.options?.map((opt, oIdx) => {
                          const isTheCorrectOne = oIdx === currentQuestion.answer;
                          return (
                            <div 
                              key={oIdx}
                              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                                isTheCorrectOne 
                                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-bold' 
                                  : 'bg-slate-900/40 border-slate-800 text-slate-400'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isTheCorrectOne ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {isTheCorrectOne && (
                                <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-black">
                                  Correcta
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Table of What Each Student Answered on this Specific Question */}
                    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-3">
                      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Respuestas de los Estudiantes para la Pregunta #{activeQuestionStep}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {filteredScoresForAnswers.length} estudiantes
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                              <th className="py-3 px-4">Estudiante</th>
                              <th className="py-3 px-4">Grado</th>
                              <th className="py-3 px-4">Opción Seleccionada por el Estudiante</th>
                              <th className="py-3 px-4 text-center">Evaluación</th>
                              <th className="py-3 px-4 text-center">Puntos</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {filteredScoresForAnswers.length > 0 ? (
                              filteredScoresForAnswers.map((sc, sIdx) => {
                                const ans = sc.answersHistory?.[activeQuestionStep - 1];
                                if (!ans) {
                                  return (
                                    <tr key={sc.id || sIdx} className="hover:bg-slate-800/20">
                                      <td className="py-3 px-4 font-bold text-white">{sc.studentName}</td>
                                      <td className="py-3 px-4 text-slate-400">{sc.grade || '8°'}</td>
                                      <td colSpan="3" className="py-3 px-4 text-slate-500 italic">
                                        Sin datos de esta pregunta en este intento
                                      </td>
                                    </tr>
                                  );
                                }

                                return (
                                  <tr key={sc.id || sIdx} className="hover:bg-slate-800/20">
                                    <td className="py-3 px-4 font-bold text-white">{sc.studentName}</td>
                                    <td className="py-3 px-4 text-slate-400">{sc.grade || '8°'}</td>
                                    <td className="py-3 px-4">
                                      <span className={`font-semibold ${ans.isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                                        {ans.selectedLetter ? `(${ans.selectedLetter}) ` : ''}{ans.selectedOption}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                                        ans.isCorrect 
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      }`}>
                                        {ans.isCorrect ? '✅ Acertó' : '❌ Falló'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-center font-black text-amber-400">
                                      {ans.isCorrect ? `+${ans.pointsEarned || 20}` : '0'}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan="5" className="text-center py-6 text-slate-500 text-xs">
                                  Aún no hay respuestas registradas para esta pregunta.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
                    Selecciona una actividad para explorar sus preguntas y soluciones oficiales.
                  </div>
                )}
              </div>
            )}

          </section>
        );
      })()}


      {/* Student Answers Inspection Modal */}
      {selectedScoreToInspect && (
        <StudentAnswersModal 
          record={selectedScoreToInspect} 
          onClose={() => setSelectedScoreToInspect(null)} 
        />
      )}

      {/* Confirmation Modal to Delete Everything (Reiniciar Clase) */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-pop-in">
          <div className="bg-slate-900 border border-rose-500/40 max-w-md w-full p-6 sm:p-7 rounded-3xl shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-white">¿Eliminar todos los datos y reiniciar clase?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Esta acción restablecerá el aula para una nueva jornada o un nuevo grupo escolar. Se borrarán:
              </p>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>📝 Intentos y respuestas de estudiantes:</span>
                <span className="font-bold text-rose-400 font-mono">{scores.length} registros</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>☕ Vales de cafetería emitidos:</span>
                <span className="font-bold text-amber-400 font-mono">{vouchers.length} vales</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>👥 Estudiantes en la planilla:</span>
                <span className="font-bold text-indigo-400 font-mono">{studentsList.length} alumnos</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-400/90 text-center font-semibold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              💡 Tus juegos creados y retos educativos <strong>NO se borrarán</strong>; únicamente se limpian las calificaciones y respuestas de los alumnos.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition border border-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (onResetAll) onResetAll();
                  setShowResetConfirmModal(false);
                  alert('¡Todos los datos de la clase han sido eliminados con éxito! El aula está lista para un nuevo grupo.');
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar Todo</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
