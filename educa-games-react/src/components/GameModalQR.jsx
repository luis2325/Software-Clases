import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Printer, ExternalLink, QrCode } from 'lucide-react';
import { getPhoneNetworkUrl } from '../utils/networkUrl';

export default function GameModalQR({ game, onClose, onPlay }) {
  const [urlMode, setUrlModeState] = useState(() => {
    return typeof localStorage !== 'undefined' ? (localStorage.getItem('aprende_url_mode') || 'tunnel') : 'tunnel';
  });
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Build the game link URL
  const gameLink = getPhoneNetworkUrl(`/?game=${game?.id}`, urlMode);

  useEffect(() => {
    if (game) {
      QRCode.toDataURL(gameLink, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }).then(url => setQrUrl(url));
    }
  }, [game, gameLink]);

  if (!game) return null;

  const handleSelectMode = (mode) => {
    setUrlModeState(mode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aprende_url_mode', mode);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(gameLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-2xl relative text-center">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 block mb-1">
          Código QR para Celulares y Tablets
        </span>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2">
          {game.title}
        </h3>
        {/* Mode Selector */}
        <div className="flex items-center justify-center gap-2 mb-4 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => handleSelectMode('tunnel')}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition ${
              urlMode === 'tunnel' 
                ? 'bg-emerald-500 text-slate-950 shadow' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🌐 Nube HTTPS (Recomendado)
          </button>
          <button
            onClick={() => handleSelectMode('lan')}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition ${
              urlMode === 'lan' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            📶 Wi-Fi Local
          </button>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl mx-auto mb-5 border-4 border-indigo-500/20">
          {qrUrl ? (
            <img src={qrUrl} alt={`QR Code ${game.title}`} className="w-60 h-60 mx-auto" />
          ) : (
            <div className="w-60 h-60 flex items-center justify-center text-slate-400 text-xs">
              Generando código...
            </div>
          )}
        </div>

        {/* Link Bar */}
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between gap-2 mb-5">
          <input 
            type="text" 
            readOnly 
            value={gameLink}
            className="bg-transparent border-none text-xs text-slate-300 w-full focus:outline-none select-all font-mono truncate"
          />
          <button 
            onClick={handleCopy}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1 shadow"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2.5 rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir QR</span>
          </button>

          <button 
            onClick={() => {
              onClose();
              onPlay(game);
            }}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Jugar Ahora</span>
          </button>
        </div>

      </div>
    </div>
  );
}
