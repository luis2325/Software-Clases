import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TeacherDashboard from './components/TeacherDashboard';
import ClassroomLobby from './components/ClassroomLobby';
import StudentMobileView from './components/StudentMobileView';
import GameRunner from './components/GameRunner';
import GameModalQR from './components/GameModalQR';
import CafeteriaModal from './components/CafeteriaModal';
import CreateGameModal from './components/CreateGameModal';
import { INITIAL_GAMES } from './data/initialGames';

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramPin = urlParams.get('pin');
  const paramGameId = urlParams.get('game');
  const paramMode = urlParams.get('mode');

  // Detect student access: query parameters OR mobile screen size
  const isStudentScan = Boolean(paramPin || paramGameId || paramMode === 'student');
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;

  // Views: 'teacher', 'lobby', 'student_join', 'playing'
  const [currentView, setCurrentView] = useState(() => {
    if (isStudentScan || isMobileDevice) return 'student_join';
    return 'teacher';
  });

  const [activeGame, setActiveGame] = useState(null);
  const [currentRoomPin, setCurrentRoomPin] = useState(paramPin || '4821');

  // Live Connected Students for current room
  const [connectedStudents, setConnectedStudents] = useState([
    { name: 'Valentina Morales', grade: '8°' },
    { name: 'Mateo Gómez', grade: '8°' }
  ]);

  // Modals
  const [qrModalGame, setQrModalGame] = useState(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);

  // Games State
  const [games, setGames] = useState(() => {
    const saved = localStorage.getItem('aprende_react_games');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const customGames = parsed.filter(g => !INITIAL_GAMES.some(ig => ig.id === g.id));
        return [...INITIAL_GAMES, ...customGames];
      } catch (e) {}
    }
    return INITIAL_GAMES;
  });

  // Student Profile State
  const [student, setStudent] = useState(() => {
    return {
      name: localStorage.getItem('aprende_student_name') || '',
      grade: localStorage.getItem('aprende_student_grade') || '8°'
    };
  });

  // Scores History
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('aprende_react_scores');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Cafeteria Vouchers
  const [vouchers, setVouchers] = useState(() => {
    const saved = localStorage.getItem('aprende_react_vouchers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('aprende_react_games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('aprende_react_scores', JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem('aprende_react_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  // Handle when URL has a specific game or PIN
  useEffect(() => {
    if (paramGameId) {
      const found = games.find(g => g.id === paramGameId);
      if (found) setActiveGame(found);
    }
  }, [paramGameId, games]);

  // Calculate points
  const studentScores = scores.filter(
    s => (s.studentName || '').toLowerCase().trim() === (student.name || '').toLowerCase().trim()
  );
  const totalStudentPoints = studentScores.reduce((sum, s) => sum + (s.score || 0), 0);

  const studentVouchers = vouchers.filter(
    v => (v.studentName || '').toLowerCase().trim() === (student.name || '').toLowerCase().trim()
  );
  const redeemedPoints = studentVouchers.reduce((sum, v) => sum + (v.points || 100), 0);
  const availablePoints = Math.max(0, totalStudentPoints - redeemedPoints);

  // Host a game room (Teacher projection)
  const handleHostLobby = (game) => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setCurrentRoomPin(randomPin);
    setActiveGame(game);
    setCurrentView('lobby');
  };

  // Real-time synchronization with server API (for live student joins and scores)
  useEffect(() => {
    const fetchSync = async () => {
      try {
        const resSc = await fetch('/api/scores');
        if (resSc.ok) {
          const serverScores = await resSc.json();
          if (Array.isArray(serverScores) && serverScores.length > 0) {
            setScores(prev => {
              const combined = [...serverScores];
              prev.forEach(p => {
                if (!combined.some(c => c.id === p.id || (c.studentName === p.studentName && c.gameId === p.gameId && c.submittedAt === p.submittedAt))) {
                  combined.push(p);
                }
              });
              return combined;
            });
          }
        }

        const resSt = await fetch('/api/students');
        if (resSt.ok) {
          const serverStudents = await resSt.json();
          if (Array.isArray(serverStudents) && serverStudents.length > 0) {
            setConnectedStudents(prev => {
              const merged = [...prev];
              serverStudents.forEach(st => {
                if (!merged.some(m => m.name.toLowerCase() === st.name.toLowerCase())) {
                  merged.push(st);
                }
              });
              return merged;
            });
          }
        }
      } catch (err) {}
    };

    fetchSync();
    const interval = setInterval(fetchSync, 2500);
    return () => clearInterval(interval);
  }, []);

  // Student joins successfully from mobile view
  const handleStudentJoinSuccess = async ({ name, grade, pin, game }) => {
    const newStudent = { name, grade };
    setStudent(newStudent);
    
    // Add to connected students in room
    setConnectedStudents(prev => {
      if (!prev.some(s => s.name.toLowerCase() === name.toLowerCase())) {
        return [...prev, newStudent];
      }
      return prev;
    });

    try {
      await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
    } catch (e) {}

    setActiveGame(game || activeGame || games[0]);
    setCurrentView('playing');
  };

  // Score save
  const handleSaveScore = async (scoreRecord) => {
    setScores(prev => [scoreRecord, ...prev]);

    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreRecord)
      });
    } catch (e) {}
  };

  // Cafeteria voucher redemption
  const handleClaimReward = () => {
    if (availablePoints < 100) return null;
    const newCode = 'CAF-' + Math.floor(1000 + Math.random() * 9000);
    const newVoucher = {
      code: newCode,
      studentName: student.name,
      grade: student.grade,
      reward: 'Refrigerio Escolar Especial / Premio de Sabiduría',
      points: 100,
      status: 'GENERADO',
      date: new Date().toISOString()
    };
    setVouchers(prev => [...prev, newVoucher]);
    return newVoucher;
  };

  const handleClaimVoucherByTeacher = (code) => {
    setVouchers(prev => prev.map(v => {
      if (v.code === code) {
        return { ...v, status: 'CANJEADO', redeemedAt: new Date().toISOString() };
      }
      return v;
    }));
  };

  const handleSaveNewGame = (newGame) => {
    setGames(prev => [newGame, ...prev]);
  };

  const handleDeleteGame = (gameId) => {
    if (confirm('¿Seguro(a) que deseas eliminar este juego?')) {
      setGames(prev => prev.filter(g => g.id !== gameId));
    }
  };

  // Teacher unlock helper for desktop/testing
  const handleTeacherUnlock = () => {
    const pin = prompt('Ingresa el PIN de acceso docente (predeterminado: 1234):');
    if (pin === '1234' || pin === 'admin') {
      setCurrentView('teacher');
    } else if (pin !== null) {
      alert('PIN de docente incorrecto.');
    }
  };

  const handleResetAllData = async () => {
    localStorage.removeItem('aprende_react_scores');
    localStorage.removeItem('aprende_react_vouchers');
    setScores([]);
    setVouchers([]);
    setConnectedStudents([]);
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch (e) {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* Navbar: Only shows when not in pure student mobile join screen */}
      {currentView !== 'student_join' && (
        <Navbar 
          currentView={currentView}
          setCurrentView={setCurrentView}
          student={student}
          availablePoints={availablePoints}
          onOpenVoucherModal={() => setIsVoucherModalOpen(true)}
        />
      )}

      {/* Main View Manager */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">

        {/* 1. TEACHER DASHBOARD (For Teacher on Laptop/Desktop) */}
        {currentView === 'teacher' && (
          <TeacherDashboard 
            games={games}
            scores={scores}
            vouchers={vouchers}
            onShowQR={(game) => setQrModalGame(game)}
            onHostLobby={handleHostLobby}
            onPlayGame={(game) => {
              setActiveGame(game);
              setCurrentView('playing');
            }}
            onDeleteGame={handleDeleteGame}
            onOpenCreateGame={() => setIsCreateGameOpen(true)}
            onClaimVoucher={handleClaimVoucherByTeacher}
            onResetAll={handleResetAllData}
          />
        )}

        {/* 2. CLASSROOM PROJECTION LOBBY (Giant PIN & QR Code Screen) */}
        {currentView === 'lobby' && activeGame && (
          <ClassroomLobby 
            game={activeGame}
            roomPin={currentRoomPin}
            connectedStudents={connectedStudents}
            onStartGame={() => setCurrentView('playing')}
            onBackToDashboard={() => setCurrentView('teacher')}
          />
        )}

        {/* 3. STUDENT MOBILE JOIN SCREEN (Protected: Requires QR or PIN, never shows game catalog) */}
        {currentView === 'student_join' && (
          <StudentMobileView 
            initialPin={paramPin || (currentView === 'lobby' ? currentRoomPin : '')}
            initialGameId={paramGameId || activeGame?.id}
            games={games}
            onJoinSuccess={handleStudentJoinSuccess}
          />
        )}

        {/* 4. ACTIVE GAME RUNNER (Reading Comprehension, Satellite Map & Trivia) */}
        {currentView === 'playing' && activeGame && (
          <GameRunner 
            game={activeGame}
            student={student}
            availablePoints={availablePoints}
            allScores={scores}
            onExit={() => setCurrentView(isStudentScan || isMobileDevice ? 'student_join' : 'teacher')}
            onSaveScore={handleSaveScore}
            onClaimVoucher={handleClaimReward}
          />
        )}

      </main>

      {/* Footer with Discreet Teacher Unlock */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>AprendePlus Escolar • Dinámica de Aula con Código QR, PIN de Clase y Evaluación Integral</p>
        
        {currentView === 'student_join' && (
          <button 
            onClick={handleTeacherUnlock}
            className="text-slate-600 hover:text-slate-400 text-[11px] underline mt-1.5 transition"
          >
            🔒 Acceso exclusivo para el docente
          </button>
        )}
      </footer>

      {/* Modals */}
      {qrModalGame && (
        <GameModalQR 
          game={qrModalGame}
          onClose={() => setQrModalGame(null)}
          onPlay={(game) => {
            setActiveGame(game);
            setCurrentView('playing');
          }}
        />
      )}

      {isVoucherModalOpen && (
        <CafeteriaModal 
          student={student}
          totalPoints={totalStudentPoints}
          availablePoints={availablePoints}
          vouchers={studentVouchers}
          onClose={() => setIsVoucherModalOpen(false)}
          onClaimReward={handleClaimReward}
        />
      )}

      {isCreateGameOpen && (
        <CreateGameModal 
          onClose={() => setIsCreateGameOpen(false)}
          onSave={handleSaveNewGame}
        />
      )}

    </div>
  );
}
