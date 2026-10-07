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
  Sparkles,
  Clock,
  Settings,
  Edit3
} from 'lucide-react';
import StudentAnswersModal from './StudentAnswersModal';
import Hero3DGlobe from './Hero3DGlobe';
import voiceBus from '../utils/voiceCommandBus';

export default function TeacherDashboard({ 
  games, 
  scores, 
  vouchers, 
  onShowQR, 
  onPlayGame, 
  onUpdateGame,
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
  const [editingTimerGame, setEditingTimerGame] = useState(null); // Game currently configuring timer
  const [customTimerSeconds, setCustomTimerSeconds] = useState(35);
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
    const rawName = (s.studentName || '').trim();
    const displayName = rawName || 'Estudiante en Aula';
    const key = displayName.toLowerCase();
    if (!studentMap[key]) {
      studentMap[key] = {
        name: displayName,
        grade: s.grade || '8°',
        totalPoints: 0,
        gamesPlayed: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        percentages: [],
        attempts: []
      };
    }
    const correct = s.correctAnswers ?? 0;
    const totalQ = s.totalQuestions || 5;
    const pct = s.percentage ?? Math.round((correct / totalQ) * 100);

    studentMap[key].totalPoints += (s.score || 0);
    studentMap[key].gamesPlayed += 1;
    studentMap[key].correctAnswers += correct;
    studentMap[key].totalQuestions += totalQ;
    studentMap[key].percentages.push(pct);
    studentMap[key].attempts.push(s);
  });

  const studentsList = Object.values(studentMap).map(st => {
    const avgPct = st.percentages.length > 0 
      ? Math.round(st.percentages.reduce((a, b) => a + b, 0) / st.percentages.length) 
      : 0;

    // Escala Colombiana MEN 1.0 a 5.0 (0% = 1.0, 100% = 5.0)
    const grade5 = (1.0 + (avgPct / 100) * 4.0).toFixed(1);

    // Dimensiones Formativas Institucionales
    const saberConocer = avgPct; // Dominio cognitivo y conceptual
    const saberHacer = Math.min(100, Math.round((st.totalPoints / Math.max(1, st.gamesPlayed * 100)) * 100) || avgPct); // Aplicación y destreza
    const saberSer = Math.min(100, 70 + st.gamesPlayed * 10); // Responsabilidad, honestidad y participación

    let performanceLevel = 'Básico';
    const numGrade = Number(grade5);
    if (numGrade >= 4.6) performanceLevel = 'Superior';
    else if (numGrade >= 4.0) performanceLevel = 'Alto';
    else if (numGrade >= 3.0) performanceLevel = 'Básico';
    else performanceLevel = 'Bajo';

    return {
      ...st,
      avgPct,
      grade5,
      saberConocer,
      saberHacer,
      saberSer,
      performanceLevel
    };
  });

  const totalPlays = scores.length;
  const totalVouchers = vouchers.length;
  const vouchersDelivered = vouchers.filter(v => v.status === 'CANJEADO').length;

  // LAN info
  const lanUrl = window.location.origin;

  // 1. Export Excel (.xls) compatible con Microsoft Excel en Windows (con formato, estilos y tablas)
  const exportToExcelXLS = () => {
    const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
    
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Planilla_Calificaciones</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
          .title { font-size: 16pt; font-weight: bold; color: #1e3a8a; }
          .subtitle { font-size: 10.5pt; color: #475569; margin-bottom: 12px; }
          .section-title { font-size: 12.5pt; font-weight: bold; color: #0f172a; background-color: #e2e8f0; padding: 6px 10px; margin-top: 15px; }
          table { border-collapse: collapse; width: 100%; margin-top: 6px; margin-bottom: 25px; }
          th { background-color: #1e293b; color: #ffffff; font-weight: bold; border: 1px solid #475569; padding: 8px 12px; text-align: center; }
          td { border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10.5pt; }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .font-bold { font-weight: bold; }
          .badge-sup { background-color: #dcfce7; color: #166534; font-weight: bold; text-align: center; }
          .badge-alt { background-color: #e0e7ff; color: #3730a3; font-weight: bold; text-align: center; }
          .badge-bas { background-color: #fef3c7; color: #92400e; font-weight: bold; text-align: center; }
          .badge-baj { background-color: #fee2e2; color: #991b1b; font-weight: bold; text-align: center; }
        </style>
      </head>
      <body>
        <div class="title">INSTITUCIÓN EDUCATIVA • REPORTE INTEGRAL DE DESEMPEÑOS Y CALIFICACIONES</div>
        <div class="subtitle">Generado el: ${today} | Plataforma Pedagógica AprendePlus</div>

        <div class="section-title">1. PLANILLA CONSOLIDADA DE ESTUDIANTES (ESCALA 1.0 - 5.0)</div>
        <table>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Grado</th>
              <th>Partidas</th>
              <th>Puntos Totales</th>
              <th>Acierto Promedio (%)</th>
              <th>Saber Conocer (30%)</th>
              <th>Saber Hacer (40%)</th>
              <th>Saber Ser (30%)</th>
              <th>Nota Definitiva (1.0 - 5.0)</th>
              <th>Nivel de Desempeño</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (studentsList.length === 0) {
      html += `<tr><td colspan="10" class="text-center" style="padding: 18px; color: #64748b;">No hay registros de estudiantes aún.</td></tr>`;
    } else {
      studentsList.forEach(s => {
        const numG = Number(s.grade5);
        const badgeClass = numG >= 4.6 ? 'badge-sup' : (numG >= 4.0 ? 'badge-alt' : (numG >= 3.0 ? 'badge-bas' : 'badge-baj'));
        html += `
          <tr>
            <td class="font-bold text-left">${s.name}</td>
            <td class="text-center">${s.grade}</td>
            <td class="text-center">${s.gamesPlayed}</td>
            <td class="text-center font-bold">${s.totalPoints} pts</td>
            <td class="text-center">${s.avgPct}%</td>
            <td class="text-center">${s.saberConocer}%</td>
            <td class="text-center">${s.saberHacer}%</td>
            <td class="text-center">${s.saberSer}%</td>
            <td class="text-center font-bold">${s.grade5} / 5.0</td>
            <td class="${badgeClass}">${s.performanceLevel}</td>
          </tr>
        `;
      });
    }

    html += `
          </tbody>
        </table>

        <div class="section-title">2. DETALLE DE CADA PARTIDA E INTENTO DE ESTUDIANTES</div>
        <table>
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Estudiante</th>
              <th>Grado</th>
              <th>Reto Pedagógico</th>
              <th>Aciertos</th>
              <th>Total Preguntas</th>
              <th>% Acierto</th>
              <th>Puntos Ganados</th>
              <th>Nota (1.0 - 5.0)</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (scores.length === 0) {
      html += `<tr><td colspan="10" class="text-center" style="padding: 18px; color: #64748b;">No hay intentos de estudiantes registrados aún.</td></tr>`;
    } else {
      scores.forEach(sc => {
        const correct = sc.correctAnswers ?? 0;
        const total = sc.totalQuestions ?? 5;
        const pct = sc.percentage ?? Math.round((correct / total) * 100);
        const attemptGrade = (1.0 + (pct / 100) * 4.0).toFixed(1);
        const timeStr = sc.submittedAt ? new Date(sc.submittedAt).toLocaleString('es-CO') : 'Reciente';
        const numG = Number(attemptGrade);
        const badgeClass = numG >= 4.6 ? 'badge-sup' : (numG >= 4.0 ? 'badge-alt' : (numG >= 3.0 ? 'badge-bas' : 'badge-baj'));

        html += `
          <tr>
            <td class="text-center">${timeStr}</td>
            <td class="font-bold text-left">${sc.studentName || 'Estudiante en Aula'}</td>
            <td class="text-center">${sc.grade || '8°'}</td>
            <td class="text-left">${sc.gameTitle || 'Reto Escolar'}</td>
            <td class="text-center font-bold">${correct}</td>
            <td class="text-center">${total}</td>
            <td class="text-center">${pct}%</td>
            <td class="text-center font-bold">${sc.score} pts</td>
            <td class="text-center font-bold">${attemptGrade}</td>
            <td class="${badgeClass}">${pct >= 60 ? 'Aprobado' : 'Requiere Refuerzo'}</td>
          </tr>
        `;
      });
    }

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF', html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Planilla_Calificaciones_Colegio_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
  };

  // 2. Export CSV con UTF-8 BOM y delimitador ';' 100% compatible con Microsoft Excel en español/Windows
  const exportToCSV = () => {
    let csv = '\uFEFFsep=;\r\n';
    csv += 'PLANILLA CONSOLIDADA DE CALIFICACIONES - COLEGIO APRENDEPLUS\r\n';
    csv += `Fecha:;${new Date().toLocaleDateString('es-CO')}\r\n\r\n`;
    csv += 'Estudiante;Grado;Partidas Jugadas;Puntos Totales;% Acierto Promedio;Saber Conocer (30%);Saber Hacer (40%);Saber Ser (30%);Nota Definitiva (1.0-5.0);Nivel de Desempeño\r\n';
    
    studentsList.forEach(s => {
      csv += `"${s.name}";"${s.grade}";${s.gamesPlayed};${s.totalPoints};"${s.avgPct}%";"${s.saberConocer}%";"${s.saberHacer}%";"${s.saberSer}%";"${s.grade5}";"${s.performanceLevel}"\r\n`;
    });

    csv += '\r\n\r\n';
    csv += 'REGISTRO DETALLADO DE PARTIDAS E INTENTOS\r\n';
    csv += 'Fecha / Hora;Estudiante;Grado;Reto Pedagógico;Aciertos;Total Preguntas;% Acierto;Puntos;Nota (1.0-5.0);Estado\r\n';
    
    scores.forEach(sc => {
      const correct = sc.correctAnswers ?? 0;
      const total = sc.totalQuestions ?? 5;
      const pct = sc.percentage ?? Math.round((correct / total) * 100);
      const attemptGrade = (1.0 + (pct / 100) * 4.0).toFixed(1);
      const timeStr = sc.submittedAt ? new Date(sc.submittedAt).toLocaleString('es-CO') : 'Reciente';
      csv += `"${timeStr}";"${sc.studentName || 'Estudiante en Aula'}";"${sc.grade || '8°'}";"${sc.gameTitle || 'Reto Escolar'}";${correct};${total};"${pct}%";${sc.score};"${attemptGrade}";"${pct >= 60 ? 'Aprobado' : 'Requiere Refuerzo'}"\r\n`;
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

      {/* Teacher Header Info with Hero 3D Globe */}
      <div className="relative overflow-hidden glass-panel p-6 sm:p-7 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 shadow-2xl animate-pop-in">
        {/* Glow ambient background circles */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 right-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Plataforma Pedagógica AprendePlus 3D</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white leading-tight">
              Aprende Jugando en el Aula <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-indigo-300 bg-clip-text text-transparent">en Tiempo Real</span>
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Proyecta retos interactivos con códigos QR, acompaña a tus estudiantes con pistas visuales de alta definición y exporta sus desempeños a tu planilla escolar.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs text-emerald-300 shadow-sm">
                <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Servidor en Red: <strong className="font-mono">{lanUrl}</strong></span>
              </div>

              <button
                onClick={() => voiceBus.emit('TOGGLE_MIC')}
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/50 hover:border-purple-500/80 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
                title="Tocar para encender/apagar el micrófono del Asistente de Voz"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                <span>🎙️ Modo "Alexa" Profe (Activar Micrófono)</span>
              </button>

              <button
                onClick={() => setShowResetConfirmModal(true)}
                className="bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 hover:border-rose-500/60 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
                title="Borrar todas las notas, intentos y estudiantes para reiniciar la clase"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Reiniciar Aula</span>
              </button>
            </div>
          </div>

          {/* 🌐 3D Interactive World Hero Canvas */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 shrink-0 relative flex items-center justify-center">
            <Hero3DGlobe height={300} />
            <div className="absolute bottom-1 px-3 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-indigo-500/40 text-[10px] text-cyan-300 font-mono font-bold pointer-events-none shadow-lg">
              🌍 Planeta Tierra NASA 3D
            </div>
          </div>
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
            {filteredGames.map((game, gIdx) => (
              <div 
                key={game.id} 
                style={{ animationDelay: `${gIdx * 60}ms` }}
                className="card-3d-interactive glass-panel p-5 rounded-3xl border border-slate-800/80 hover:border-indigo-500/50 flex flex-col justify-between transition-all duration-300 animate-slide-up group"
              >
                <div>
                  {/* Thumbnail Cover with Badge */}
                  <div className="relative h-32 rounded-2xl overflow-hidden mb-3.5 border border-slate-800 bg-slate-900">
                    <img 
                      src={game.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'} 
                      alt={game.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 font-extrabold border border-amber-400/40 flex items-center gap-1 shadow">
                        <span>📸</span>
                        <span>{game.type === 'map' ? 'Mapa & Fotos' : 'Fotos & Pistas'}</span>
                      </span>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow ${
                        game.type === 'map' ? 'bg-emerald-500/90 text-slate-950' : (game.type === 'reading' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-500 text-white')
                      }`}>
                        {game.type === 'map' ? 'Satelital' : (game.type === 'reading' ? 'Lectura' : 'Trivia')}
                      </span>
                    </div>

                    <span className="absolute bottom-2 left-2.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 drop-shadow">
                      {game.subject || 'Competencia'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="text-base font-bold text-white leading-snug group-hover:text-indigo-200 transition-colors">
                      {game.title}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {game.description}
                  </p>

                  {/* Timer Settings Indicator Bar */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] font-medium">Tiempo por pregunta:</span>
                      <strong className={`text-[11px] font-bold ${
                        game.timerSeconds === 0 ? 'text-emerald-400' : 'text-amber-300'
                      }`}>
                        {game.timerSeconds === 0 ? 'Sin límite (Pausado)' : `${game.timerSeconds || 35} segundos`}
                      </strong>
                    </div>

                    <button
                      onClick={() => {
                        setEditingTimerGame(game);
                        setCustomTimerSeconds(game.timerSeconds ?? 35);
                      }}
                      className="px-2 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold transition flex items-center gap-1"
                      title="Modificar o quitar el tiempo de este juego"
                    >
                      <Settings className="w-3 h-3 text-indigo-300" />
                      <span>Ajustar</span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <button
                    onClick={() => onHostLobby ? onHostLobby(game) : onShowQR(game)}
                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <QrCode className="w-4 h-4 text-amber-300" />
                    <span>CÓDIGO QR Y PIN DE CLASE</span>
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

          {/* ⏱️ MODAL: AJUSTE DE TIEMPO DEL JUEGO (PONER O QUITAR TIEMPO) */}
          {editingTimerGame && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-pop-in">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">Configurar Tiempo de Preguntas</h4>
                      <span className="text-[11px] text-slate-400 line-clamp-1">{editingTimerGame.title}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingTimerGame(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Como docente, puedes decidir el ritmo de la clase: dar un tiempo específico por pregunta o quitar el tiempo por completo para lectura pausada.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Option: Sin Límite de Tiempo */}
                    <button
                      onClick={() => setCustomTimerSeconds(0)}
                      className={`p-3 rounded-2xl border text-left transition ${
                        customTimerSeconds === 0
                          ? 'bg-emerald-600/30 border-emerald-500 text-white shadow-lg ring-2 ring-emerald-500/50'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xl mb-1">🕊️</div>
                      <strong className="block text-xs font-bold text-emerald-300">Sin Límite de Tiempo</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Lectura libre y sin presión de reloj.</span>
                    </button>

                    {/* Option: Con Tiempo Dinámico */}
                    <button
                      onClick={() => {
                        if (customTimerSeconds === 0) setCustomTimerSeconds(35);
                      }}
                      className={`p-3 rounded-2xl border text-left transition ${
                        customTimerSeconds > 0
                          ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg ring-2 ring-amber-500/50'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xl mb-1">⏱️</div>
                      <strong className="block text-xs font-bold text-amber-300">Con Tiempo Activo</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Desafío ágil estilo Kahoot / Saber.</span>
                    </button>
                  </div>

                  {/* Seconds selector (Only when timer is active) */}
                  {customTimerSeconds > 0 && (
                    <div className="space-y-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-semibold">Segundos por pregunta:</span>
                        <span className="text-amber-400 font-black text-sm bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/30">
                          {customTimerSeconds} seg
                        </span>
                      </div>

                      {/* Quick Presets */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        {[20, 35, 60, 90].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => setCustomTimerSeconds(preset)}
                            className={`py-1.5 rounded-xl font-bold text-[11px] transition border ${
                              customTimerSeconds === preset
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {preset}s
                          </button>
                        ))}
                      </div>

                      {/* Slider */}
                      <input
                        type="range"
                        min="15"
                        max="180"
                        step="5"
                        value={customTimerSeconds}
                        onChange={(e) => setCustomTimerSeconds(Number(e.target.value))}
                        className="w-full accent-amber-400 mt-2 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>15s (Rápido)</span>
                        <span>60s (1 minuto)</span>
                        <span>180s (3 minutos)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Save and Cancel buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setEditingTimerGame(null)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (onUpdateGame) {
                        onUpdateGame({
                          ...editingTimerGame,
                          timerSeconds: customTimerSeconds
                        });
                      }
                      setEditingTimerGame(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar Configuración</span>
                  </button>
                </div>
              </div>
            </div>
          )}
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
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={exportToExcelXLS}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95"
                title="Descargar archivo .xls formateado con colores, tablas y columnas para Microsoft Excel en Windows"
              >
                <Download className="w-4 h-4" />
                <span>Descargar en Excel (.xls)</span>
              </button>

              <button
                onClick={exportToCSV}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 active:scale-95"
                title="Descargar en formato CSV con punto y coma (;) compatible con Windows"
              >
                <span>Descargar CSV (Windows)</span>
              </button>
            </div>
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
                    <th className="py-3 px-4 text-center">Nota Definitiva (1.0-5.0)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {studentsList.length > 0 ? (
                    studentsList.map(s => {
                      const numGrade = Number(s.grade5);
                      return (
                        <tr key={s.name} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                          <td className="py-3 px-4 text-slate-400">{s.grade}</td>
                          <td className="py-3 px-4 text-center text-slate-300">{s.gamesPlayed}</td>
                          <td className="py-3 px-4 text-center font-bold text-amber-400">{s.totalPoints} pts</td>
                          <td className="py-3 px-4 text-center font-semibold text-indigo-300">{s.saberConocer}%</td>
                          <td className="py-3 px-4 text-center font-semibold text-emerald-300">{s.saberHacer}%</td>
                          <td className="py-3 px-4 text-center font-semibold text-amber-300">{s.saberSer}%</td>
                          <td className={`py-3 px-4 text-center font-black ${numGrade >= 4.0 ? 'text-emerald-400' : (numGrade >= 3.0 ? 'text-amber-400' : 'text-rose-400')}`}>
                            <div className="flex flex-col items-center">
                              <span>{s.grade5} / 5.0</span>
                              <span className="text-[10px] font-medium text-slate-400">{s.performanceLevel}</span>
                            </div>
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
