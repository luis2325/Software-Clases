import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Play, 
  Users, 
  QrCode, 
  Sparkles, 
  Share2, 
  GraduationCap, 
  ExternalLink 
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { getPhoneNetworkUrl } from '../utils/networkUrl';

export default function ClassroomLobby({ 
  game, 
  roomPin, 
  connectedStudents, 
  onStartGame, 
  onBackToDashboard 
}) {
  const [urlMode, setUrlModeState] = useState(() => {
    return typeof localStorage !== 'undefined' ? (localStorage.getItem('aprende_url_mode') || 'tunnel') : 'tunnel';
  });
  const [customIp, setCustomIp] = useState(() => localStorage.getItem('aprende_custom_ip') || '192.168.40.32');
  const [customTunnel, setCustomTunnel] = useState(() => localStorage.getItem('aprende_custom_tunnel') || '');
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Direct student link
  const studentJoinUrl = getPhoneNetworkUrl(`/?pin=${roomPin}&game=${game.id}`, urlMode);

  useEffect(() => {
    QRCode.toDataURL(studentJoinUrl, {
      width: 360,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    }).then(url => setQrUrl(url));
  }, [studentJoinUrl]);

  const handleSelectMode = (mode) => {
    setUrlModeState(mode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aprende_url_mode', mode);
    }
  };

  const handleSaveIp = (newIp) => {
    const trimmed = newIp.trim();
    localStorage.setItem('aprende_custom_ip', trimmed);
    setCustomIp(trimmed);
  };

  const handleSaveTunnel = (newTunnel) => {
    const trimmed = newTunnel.trim();
    localStorage.setItem('aprende_custom_tunnel', trimmed);
    setCustomTunnel(trimmed);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(studentJoinUrl);
    setCopied(true);
    soundFx.playCoin();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Top Bar for Teacher */}
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-slate-800">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 px-3.5 py-2 rounded-xl transition border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Panel</span>
        </button>

        <div className="text-center">
          <span className="text-[11px] uppercase font-bold tracking-widest text-indigo-400 block">
            Sala de Clase Activa • Videobeam / Pantalla
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">{game.title}</h2>
        </div>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl transition shadow"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? '¡Enlace Copiado!' : 'Copiar Link WhatsApp'}</span>
        </button>
      </div>

      {/* Centerpiece: Projection Card with Giant PIN & Giant QR */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden text-center">
        
        {/* Connection Mode Selector Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <span>Tipo de Conexión para Celulares:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectMode('tunnel')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                urlMode === 'tunnel'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>🌐 Enlace Nube HTTPS (Recomendado)</span>
            </button>

            <button
              onClick={() => handleSelectMode('lan')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                urlMode === 'lan'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>📶 Red Wi-Fi Local</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
          
          {/* Left: Giant PIN and Instructions */}
          <div className="text-left space-y-5">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Paso 1: Entra desde tu celular o escanea el QR
              </span>
              <p className="text-slate-300 text-sm">
                Abre la cámara de tu teléfono y apunta al código QR de la derecha.
              </p>
            </div>

            <div className="bg-slate-900/90 border-2 border-indigo-500/40 p-5 rounded-2xl">
              <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider block mb-1">
                CÓDIGO PIN DE LA CLASE
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-amber-300">
                {roomPin}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Los estudiantes también pueden ingresar escribiendo este PIN
              </span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-300 truncate">{studentJoinUrl}</span>
              <button
                onClick={handleCopyLink}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 shadow"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            {/* Network diagnostic notice */}
            {urlMode === 'lan' ? (
              <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span>IP Local Wi-Fi: <strong className="text-amber-300 font-mono">{customIp}</strong></span>
                  <button
                    onClick={() => {
                      const newIp = prompt('Ingresa la IP de tu computador en la red Wi-Fi:', customIp);
                      if (newIp) handleSaveIp(newIp);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 underline font-semibold ml-2"
                  >
                    Cambiar IP
                  </button>
                </div>
                <p className="text-[10px] text-amber-400/90">
                  Nota: Si en Wi-Fi local no carga en el celular, ejecuta en terminal: <code className="bg-slate-950 px-1 py-0.5 rounded text-white">sudo ufw allow 5173/tcp</code> o usa el botón 🌐 Enlace Nube HTTPS.
                </p>
              </div>
            ) : (
              <div className="text-[11px] text-emerald-400/90 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                ✅ Conexión HTTPS Activa: Funciona en celulares con datos móviles o Wi-Fi sin bloqueos de cortafuegos.
              </div>
            )}
          </div>

          {/* Right: Giant QR Code */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-2xl border-4 border-indigo-500/30 inline-block hover:scale-105 transition duration-300">
              {qrUrl ? (
                <img src={qrUrl} alt="QR Sala" className="w-64 h-64 sm:w-72 sm:h-72 object-contain" />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-slate-400 text-xs">
                  Generando Código QR...
                </div>
              )}
            </div>
            <span className="text-xs font-semibold text-slate-400 mt-3 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span>Escanea con la cámara del celular para unirte</span>
            </span>
          </div>

        </div>

        {/* Live Connected Students Banner */}
        <div className="mt-10 pt-8 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                Estudiantes en la Sala ({connectedStudents.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Esperando a que el profesor inicie el juego
            </span>
          </div>

          {connectedStudents.length > 0 ? (
            <div className="flex flex-wrap gap-2.5 justify-center max-h-40 overflow-y-auto p-2">
              {connectedStudents.map((st, idx) => (
                <div 
                  key={idx}
                  className="bg-indigo-500/20 border border-indigo-500/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-indigo-200 flex items-center gap-1.5 animate-bounce"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{st.name} ({st.grade || '8°'})</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 text-xs text-slate-400 max-w-md mx-auto">
              Aún no hay estudiantes conectados. Proyecta el código QR o comparte el link por el grupo de WhatsApp.
            </div>
          )}

          {/* Teacher Launch Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={onStartGame}
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base sm:text-lg py-4 px-8 rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center gap-3 transition transform hover:scale-105 active:scale-95 pulse-badge"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>▶️ ¡INICIAR JUEGO CON EL SALÓN AHORA!</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
