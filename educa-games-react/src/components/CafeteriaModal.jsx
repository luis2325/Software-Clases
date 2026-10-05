import React from 'react';
import { X, Receipt, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CafeteriaModal({ onClose, student, totalPoints, availablePoints, vouchers, onClaimReward }) {
  const canRedeem = availablePoints >= 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 max-w-md w-full p-6 rounded-3xl shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 text-2xl">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Recompensas de Cafetería Escolar</h3>
          <p className="text-xs text-slate-400">Puntos acumulados y vales canjeados</p>
        </div>

        {/* Balance Card */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 mb-5">
          <div className="flex justify-between items-center mb-2 text-xs">
            <span className="text-slate-400">Puntos Totales Ganados:</span>
            <span className="font-bold text-white">{totalPoints} pts</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-300 font-semibold">Puntos Disponibles:</span>
            <span className="font-black text-amber-400 text-xl">{availablePoints} pts</span>
          </div>

          <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-amber-400 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (availablePoints % 100))}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block mt-1.5 text-right">
            {100 - (availablePoints % 100)} pts para el siguiente vale
          </span>
        </div>

        {/* Claim button if points >= 100 */}
        {canRedeem && (
          <button
            onClick={onClaimReward}
            className="w-full mb-5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm py-3 px-4 rounded-xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 pulse-badge transition"
          >
            <Ticket className="w-5 h-5" />
            <span>¡CANJEAR 100 PUNTOS POR UN VALE!</span>
          </button>
        )}

        {/* Vouchers List */}
        <div>
          <h4 className="font-semibold text-slate-200 text-xs uppercase mb-2">Tus Vales Emitidos</h4>
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {vouchers && vouchers.length > 0 ? (
              vouchers.map(v => (
                <div 
                  key={v.code} 
                  className="border border-amber-500/30 bg-amber-500/10 p-3 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-amber-300 text-sm block">{v.code}</span>
                    <span className="text-[11px] text-slate-300">{v.reward}</span>
                  </div>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                    v.status === 'CANJEADO' 
                      ? 'bg-slate-700 text-slate-400' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {v.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 bg-slate-900/50 rounded-xl border border-slate-800 text-xs text-slate-400 flex flex-col items-center gap-1">
                <AlertCircle className="w-4 h-4 text-slate-500" />
                <span>Aún no tienes vales. ¡Acumula 100 puntos jugando!</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
