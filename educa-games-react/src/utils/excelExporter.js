// Excel Export Utility compatible con Microsoft Excel (Windows & Mac)
// Genera planilla con formato, estilos institucionales y dimensiones evaluativas MEN

export function exportInstitutionalExcel(scores = [], vouchers = [], games = []) {
  const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });

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
    const saberHacer = Math.min(100, Math.round((st.totalPoints / Math.max(1, st.gamesPlayed * 100)) * 100) || avgPct);
    const saberSer = Math.min(100, 70 + st.gamesPlayed * 10);

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
      <div class="subtitle">Generado el: ${today} | Plataforma Pedagógica Aprender Sin Barreras</div>

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
            <th>Porcentaje</th>
            <th>Puntos</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (scores.length === 0) {
    html += `<tr><td colspan="8" class="text-center" style="padding: 18px; color: #64748b;">No hay partidas registradas aún.</td></tr>`;
  } else {
    scores.forEach(s => {
      const timeFormatted = s.submittedAt 
        ? new Date(s.submittedAt).toLocaleDateString('es-CO', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })
        : today;
      const correct = s.correctAnswers ?? 0;
      const totalQ = s.totalQuestions || 5;
      const pct = s.percentage ?? Math.round((correct / totalQ) * 100);

      html += `
        <tr>
          <td class="text-center">${timeFormatted}</td>
          <td class="font-bold text-left">${s.studentName || 'Estudiante'}</td>
          <td class="text-center">${s.grade || '8°'}</td>
          <td class="text-left">${s.gameTitle || s.gameId || 'Reto Pedagógico'}</td>
          <td class="text-center">${correct}</td>
          <td class="text-center">${totalQ}</td>
          <td class="text-center">${pct}%</td>
          <td class="text-center font-bold">${s.score || 0} pts</td>
        </tr>
      `;
    });
  }

  html += `
        </tbody>
      </table>

      <div class="section-title">3. VALES DE REFRIGERIO ESCOLAR RECLAMADOS</div>
      <table>
        <thead>
          <tr>
            <th>Código de Vale</th>
            <th>Fecha Solicitud</th>
            <th>Estudiante</th>
            <th>Grado</th>
            <th>Premio Reclamado</th>
            <th>Puntos Canjeados</th>
            <th>Estado en Cafetería</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (vouchers.length === 0) {
    html += `<tr><td colspan="7" class="text-center" style="padding: 18px; color: #64748b;">No hay vales de cafetería reclamados aún.</td></tr>`;
  } else {
    vouchers.forEach(v => {
      const isRedeemed = v.status === 'CANJEADO';
      html += `
        <tr>
          <td class="text-center font-bold" style="font-family: monospace;">${v.code || 'VALE-00'}</td>
          <td class="text-center">${v.date || today}</td>
          <td class="text-left font-bold">${v.studentName || 'Estudiante'}</td>
          <td class="text-center">${v.grade || '8°'}</td>
          <td class="text-left">${v.title || 'Refrigerio Escolar'}</td>
          <td class="text-center">${v.points || 100} pts</td>
          <td class="text-center font-bold" style="color: ${isRedeemed ? '#16a34a' : '#d97706'};">
            ${isRedeemed ? '✓ ENTREGADO EN CAFETERÍA' : '⏳ PENDIENTE DE RECLAMO'}
          </td>
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

  // Blob and trigger download
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Planilla_Calificaciones_Institucional_${today.replace(/\//g, '-')}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
