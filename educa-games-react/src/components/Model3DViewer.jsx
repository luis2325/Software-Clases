import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RefreshCw, Move3d, Sparkles } from 'lucide-react';

/**
 * Interactive 3D Model Visualizer Component
 * Every 3D model is specifically tailored to the exact reading passage,
 * historical facts, mathematical problems, scientific concepts, and questions.
 */
export default function Model3DViewer({ modelType = 'book', title = 'Modelo 3D', subject = '' }) {
  const [rotX, setRotX] = useState(14);
  const [rotY, setRotY] = useState(-18);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Auto-rotate tick
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const interval = setInterval(() => {
      setRotY((prev) => (prev + 0.7) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  // Mouse Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastPosRef.current.x;
    const deltaY = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => prev + deltaX * 0.7);
    setRotX((prev) => Math.max(-60, Math.min(60, prev - deltaY * 0.7)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Drag handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastPosRef.current.x;
    const deltaY = e.touches[0].clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    setRotY((prev) => prev + deltaX * 0.8);
    setRotX((prev) => Math.max(-60, Math.min(60, prev - deltaY * 0.8)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setRotX(14);
    setRotY(-18);
    setAutoRotate(true);
  };

  // Render story-specific 3D scenes
  const renderModelContent = () => {
    switch (modelType) {
      // 1. GEOTURISMO: CAÑO CRISTALES (Macarenia clavigera & Río de 7 Colores)
      case 'cano-cristales':
        return (
          <div className="relative w-48 h-40 preserve-3d flex items-center justify-center">
            {/* Rocky Riverbed Base */}
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-amber-950/80 via-stone-800 to-amber-900/60 rounded-2xl border border-amber-600/50 shadow-2xl"
              style={{ transform: 'rotateX(55deg) translateZ(-15px)' }}
            >
              {/* Shimmering Water Flow */}
              <div className="w-full h-full bg-cyan-400/20 rounded-2xl backdrop-blur-xs flex items-center justify-around p-2 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>

            {/* Aquatic Macarenia clavigera plants in 7 colors */}
            <div className="relative w-36 h-28 preserve-3d flex items-center justify-around" style={{ transform: 'translateZ(15px)' }}>
              {/* Fuchsia Colony */}
              <div className="flex flex-col items-center animate-float-3d">
                <div className="w-7 h-16 bg-gradient-to-t from-pink-600 via-rose-500 to-fuchsia-400 rounded-full border border-pink-300 shadow-[0_0_15px_#ec4899] animate-flame" />
                <span className="text-[8px] font-bold text-pink-300 mt-1">Fucsia</span>
              </div>
              {/* Emerald Colony */}
              <div className="flex flex-col items-center animate-float-3d" style={{ animationDelay: '0.4s' }}>
                <div className="w-6 h-14 bg-gradient-to-t from-emerald-700 via-green-500 to-teal-300 rounded-full border border-emerald-300 shadow-[0_0_15px_#10b981] animate-flame" />
                <span className="text-[8px] font-bold text-emerald-300 mt-1">Verde</span>
              </div>
              {/* Yellow/Amber Colony */}
              <div className="flex flex-col items-center animate-float-3d" style={{ animationDelay: '0.8s' }}>
                <div className="w-6 h-15 bg-gradient-to-t from-amber-700 via-yellow-400 to-orange-300 rounded-full border border-amber-200 shadow-[0_0_15px_#f59e0b] animate-flame" />
                <span className="text-[8px] font-bold text-amber-300 mt-1">Ocre</span>
              </div>
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-fuchsia-500/50 text-fuchsia-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              🌿 Macarenia clavigera • Río de 7 Colores
            </div>
          </div>
        );

      // 2. GEOTURISMO: VALLE DEL COCORA (Palma de Cera & Loro Orejiamarillo)
      case 'palma-cera':
        return (
          <div className="relative w-44 h-44 preserve-3d flex items-center justify-center">
            {/* Andean Mountain Slope */}
            <div 
              className="absolute bottom-2 w-36 h-12 bg-gradient-to-r from-emerald-950 to-green-900 rounded-full border border-emerald-600/40"
              style={{ transform: 'rotateX(60deg) translateZ(-20px)' }}
            />

            {/* Slender 60m Wax Palm Trunk */}
            <div className="relative h-36 w-3 bg-gradient-to-b from-stone-200 via-stone-400 to-stone-600 rounded-full border border-white/60 shadow-lg flex flex-col justify-between items-center">
              {/* Wax rings */}
              <div className="w-4 h-0.5 bg-stone-700/60" />
              <div className="w-4 h-0.5 bg-stone-700/60" />
              <div className="w-4 h-0.5 bg-stone-700/60" />
              <div className="w-4 h-0.5 bg-stone-700/60" />

              {/* Loro Orejiamarillo perched */}
              <div 
                className="absolute top-12 -right-5 bg-amber-400 border border-amber-200 px-1 py-0.5 rounded text-[8px] font-bold text-slate-950 shadow animate-bounce"
                style={{ transform: 'translateZ(10px)' }}
              >
                🦜 Loro
              </div>

              {/* Palm Fronds Crown */}
              <div className="absolute -top-5 -left-8 w-20 h-10 flex items-center justify-center">
                <span className="text-3xl filter drop-shadow">🌴</span>
              </div>
            </div>

            {/* Mountain Mist Ring */}
            <div className="absolute w-36 h-20 rounded-full border border-white/30 border-dashed animate-orbit-1 pointer-events-none" />

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              🌴 Palma de Cera (60 m) & Loro Orejiamarillo
            </div>
          </div>
        );

      // 3. GEOTURISMO: CASTILLO SAN FELIPE (Túneles Acústicos y Fortaleza)
      case 'castillo-san-felipe':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Fortress Hill & Stone Ramparts */}
            <div 
              className="w-32 h-24 bg-gradient-to-br from-amber-800 via-stone-700 to-stone-900 border-2 border-amber-600/70 rounded-xl shadow-2xl p-2 flex flex-col justify-between preserve-3d"
              style={{ transform: 'rotateX(20deg)' }}
            >
              <div className="flex justify-between items-center border-b border-amber-500/40 pb-1">
                <span className="text-[8px] font-mono font-bold text-amber-300">San Lázaro</span>
                <span className="text-xs">🏰</span>
              </div>

              {/* Underground Tunnel Cutout */}
              <div className="bg-black/80 border border-amber-400/60 rounded p-1.5 text-center my-auto">
                <div className="flex items-center justify-center gap-1 text-[9px] font-mono text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>Túnel Acústico 50m</span>
                </div>
                <div className="text-[7px] text-slate-300 mt-0.5 font-sans">
                  "Oyen susurros y pasos enemigos"
                </div>
              </div>

              <div className="flex justify-between text-[7px] text-amber-400 font-bold">
                <span>1536 Colonial</span>
                <span>Inexpugnable</span>
              </div>
            </div>

            {/* Bronze Cannon floating */}
            <div 
              className="absolute top-2 right-4 text-xl filter drop-shadow animate-float-3d"
              style={{ transform: 'translateZ(35px)' }}
            >
              💣
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              🏰 Fortaleza & Ingeniería Acústica de Túneles
            </div>
          </div>
        );

      // 4. GEOTURISMO: PÁRAMO DE CHINGAZA (Frailejón & Fábrica de Agua)
      case 'frailejon-water':
        return (
          <div className="relative w-44 h-44 preserve-3d flex items-center justify-center">
            {/* Sponge Moss Ground */}
            <div 
              className="absolute bottom-2 w-36 h-12 bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-950 rounded-full border border-teal-500/40"
              style={{ transform: 'rotateX(60deg) translateZ(-20px)' }}
            />

            {/* 3D Frailejón Plant */}
            <div className="relative flex flex-col items-center preserve-3d" style={{ transform: 'translateZ(10px)' }}>
              {/* Velvety Silver Leaves Rosette */}
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-200 via-stone-300 to-emerald-200 border-2 border-white/80 shadow-xl flex items-center justify-center animate-spin-3d-slow">
                <span className="text-3xl filter drop-shadow">🌻</span>
              </div>

              {/* Trunk with sponge hair */}
              <div className="w-5 h-14 bg-gradient-to-b from-amber-900 to-stone-900 rounded-b-md border border-amber-700/60 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] animate-bounce" />
              </div>
            </div>

            {/* Condensing Water Droplets */}
            <div 
              className="absolute top-4 left-6 text-cyan-300 text-xs font-mono font-bold bg-slate-900/90 border border-cyan-400/50 px-2 py-0.5 rounded-full animate-float-3d"
              style={{ transform: 'translateZ(35px)' }}
            >
              💧 Atrapa Neblina
            </div>
            <div 
              className="absolute top-10 right-4 text-emerald-300 text-xs font-mono font-bold bg-slate-900/90 border border-emerald-400/50 px-2 py-0.5 rounded-full animate-float-3d"
              style={{ transform: 'translateZ(35px)', animationDelay: '0.6s' }}
            >
              🌊 70% Agua Bogotá
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              🌱 Frailejón Espeletia • Fábrica Natural de Agua
            </div>
          </div>
        );

      // 5. GEOTURISMO: MACHU PICCHU (Andenes Agrícolas & Drenaje)
      case 'machu-picchu-terraces':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Stepped Terraces (Andenes) */}
            <div className="relative w-36 h-32 preserve-3d flex flex-col justify-between">
              {/* Tier 1 (Top) */}
              <div 
                className="w-20 h-7 mx-auto bg-gradient-to-r from-emerald-600 to-green-700 border border-stone-300 rounded shadow-md flex items-center justify-center text-[8px] font-mono text-white font-bold"
                style={{ transform: 'translateZ(30px)' }}
              >
                Andén 1 (Maíz)
              </div>
              {/* Tier 2 (Middle) */}
              <div 
                className="w-28 h-8 mx-auto bg-gradient-to-r from-emerald-700 to-green-800 border-2 border-stone-400 rounded shadow-lg flex items-center justify-center text-[8px] font-mono text-white font-bold"
                style={{ transform: 'translateZ(15px)' }}
              >
                Andén 2 (Hojas de Coca)
              </div>
              {/* Tier 3 (Base - Drainage) */}
              <div 
                className="w-36 h-9 mx-auto bg-gradient-to-r from-stone-800 to-stone-900 border-2 border-stone-500 rounded shadow-xl flex items-center justify-between px-2 text-[8px] font-mono text-cyan-300 font-bold"
              >
                <span>Ashlar antisísmico</span>
                <span>💧 Acueducto</span>
              </div>
            </div>

            {/* Inti Sun floating */}
            <div 
              className="absolute -top-3 right-6 text-xl filter drop-shadow animate-float-3d"
              style={{ transform: 'translateZ(45px)' }}
            >
              ☀️
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              ⛰️ Andenes Incas • Drenaje de Lluvias & Resistencia
            </div>
          </div>
        );

      // 6. HISTORIA: PUENTE DE BOYACÁ (Río Teatinos & Pedro Pascasio)
      case 'puente-boyaca':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Rio Teatinos water flowing below */}
            <div 
              className="absolute w-40 h-14 bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 rounded-full border border-cyan-400/50 shadow-inner"
              style={{ transform: 'rotateX(55deg) translateZ(-20px)' }}
            />

            {/* Historic Stone Arch Bridge */}
            <div 
              className="relative w-36 h-20 bg-gradient-to-b from-stone-300 via-stone-400 to-stone-600 rounded-t-xl border-2 border-stone-200 shadow-2xl p-2 flex flex-col justify-between preserve-3d"
              style={{ transform: 'translateZ(15px)' }}
            >
              <div className="text-center border-b border-stone-500/50 pb-0.5">
                <span className="text-[9px] font-extrabold text-slate-950 uppercase tracking-wider">
                  Puente de Boyacá
                </span>
              </div>

              {/* Arch cutout */}
              <div className="w-16 h-8 mx-auto bg-slate-950 rounded-t-full border border-stone-500 flex items-center justify-center text-[7px] font-mono text-cyan-300">
                Río Teatinos
              </div>

              <div className="flex justify-between items-center text-[7px] font-bold text-slate-900">
                <span>7 de Agosto</span>
                <span>1819</span>
              </div>
            </div>

            {/* Pedro Pascasio Integrity Badge */}
            <div 
              className="absolute -top-3 left-4 bg-amber-400 text-slate-950 border border-amber-200 px-2 py-0.5 rounded-full text-[9px] font-black shadow-lg animate-float-3d"
              style={{ transform: 'translateZ(40px)' }}
            >
              🎖️ Pedro Pascasio (Rechazo al Soborno)
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              ⚔️ Batalla de Boyacá • Honradez y Causa Justa
            </div>
          </div>
        );

      // 7. HISTORIA: PANTANO DE VARGAS (Los 14 Lanceros & Juan José Rondón)
      case 'lanceros-vargas':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Uphill Swamp Slope */}
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-amber-950 via-stone-800 to-stone-900 rounded-2xl border border-amber-700/50"
              style={{ transform: 'rotateX(55deg) rotateZ(-15deg) translateZ(-15px)' }}
            />

            {/* Heroic Wooden Lance with Forged Iron Tip */}
            <div 
              className="relative w-36 h-24 preserve-3d flex items-center justify-center"
              style={{ transform: 'rotateZ(-25deg) translateZ(20px)' }}
            >
              {/* Wooden shaft */}
              <div className="w-32 h-2.5 bg-gradient-to-r from-amber-800 via-amber-700 to-stone-800 rounded-full border border-amber-500/60 shadow-lg flex items-center justify-end pr-1">
                {/* Iron spear tip */}
                <div className="w-7 h-5 bg-gradient-to-r from-stone-300 via-slate-100 to-stone-400 rounded-r-full border border-white shadow-[0_0_12px_#ffffff]" />
              </div>
            </div>

            {/* Rondón's Charge Callout */}
            <div 
              className="absolute -top-3 right-2 bg-rose-600 text-white border border-rose-300 px-2 py-0.5 rounded-full text-[9px] font-black shadow-lg animate-bounce"
              style={{ transform: 'translateZ(45px)' }}
            >
              "¡Coronel, salve la patria!"
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              🐎 14 Lanceros • Carga Sorpresa Cuesta Arriba
            </div>
          </div>
        );

      // 8. LENGUAJE / MITO: EL MOHÁN (Río Magdalena & Remolinos)
      case 'mohan-river':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Swirling River Whirlpool */}
            <div 
              className="w-32 h-32 rounded-full border-4 border-cyan-400/60 border-dashed animate-spin-3d-slow flex items-center justify-center bg-gradient-to-tr from-blue-950 via-teal-950 to-blue-900 shadow-2xl"
              style={{ transform: 'rotateX(55deg)' }}
            >
              <div className="w-16 h-16 rounded-full border-2 border-teal-300/80 animate-spin" />
            </div>

            {/* El Mohán Figure */}
            <div 
              className="absolute w-20 h-24 bg-gradient-to-b from-amber-900 via-stone-800 to-slate-950 rounded-2xl border-2 border-amber-600 shadow-[0_0_25px_rgba(245,158,11,0.5)] flex flex-col items-center justify-between p-2 animate-float-3d"
              style={{ transform: 'translateZ(25px)' }}
            >
              {/* Glowing red ember eyes */}
              <div className="flex gap-3 mt-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-ping" />
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-ping" />
              </div>

              {/* Tobacco smoke */}
              <div className="text-center">
                <span className="text-lg">💨</span>
                <span className="text-[7px] font-mono text-amber-300 block">Tabaco aromático</span>
              </div>

              {/* Golden fish */}
              <span className="text-xs">🐟</span>
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-teal-500/50 text-teal-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(35px)' }}
            >
              🌊 El Mohán • Guardián y Justicia Ambiental del Río
            </div>
          </div>
        );

      // 9. LENGUAJE / MITO: LA LLORONA (Bosques Andinos & Lamento)
      case 'llorona-mist':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Andean Forest mist */}
            <div className="absolute w-36 h-36 rounded-full border border-white/20 border-dashed animate-orbit-1 pointer-events-none" />

            {/* Spirit enveloped in white mist */}
            <div 
              className="w-24 h-28 bg-gradient-to-b from-white/90 via-slate-200/50 to-transparent backdrop-blur-md rounded-t-3xl border border-white/80 shadow-[0_0_35px_rgba(255,255,255,0.4)] flex flex-col items-center justify-between p-2 animate-float-3d"
              style={{ transform: 'translateZ(20px)' }}
            >
              <span className="text-2xl filter drop-shadow">🌫️</span>
              <span className="text-[8px] font-serif italic text-slate-800 font-bold text-center">
                "¡Aaaay, mis hijos...!"
              </span>
              <div className="flex items-center gap-1 text-[8px] font-bold text-rose-600 bg-white/90 px-1.5 py-0.5 rounded shadow">
                <span>❤️</span>
                <span>Familia</span>
              </div>
            </div>

            {/* Raindrops on forest branches */}
            <div className="absolute top-2 left-4 text-xs animate-bounce" style={{ transform: 'translateZ(30px)' }}>
              🌧️
            </div>
            <div className="absolute top-4 right-4 text-xs animate-bounce" style={{ transform: 'translateZ(30px)', animationDelay: '0.5s' }}>
              💧
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-indigo-400/50 text-indigo-200 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(35px)' }}
            >
              🌲 Llorona • Respeto Familiar y Dolor de la Selva
            </div>
          </div>
        );

      // 10. LENGUAJE / MITO: EL SOMBRERÓN (Sombrero Gigante & Conciencia)
      case 'sombreron-hat':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Cobblestone path base */}
            <div 
              className="absolute bottom-2 w-36 h-12 bg-gradient-to-r from-stone-800 to-stone-950 rounded-full border border-stone-600/50"
              style={{ transform: 'rotateX(60deg) translateZ(-20px)' }}
            />

            {/* Giant Wide-Brimmed Black Hat in 3D */}
            <div className="relative flex flex-col items-center preserve-3d animate-float-3d" style={{ transform: 'translateZ(15px)' }}>
              {/* Hat Crown */}
              <div className="w-14 h-12 bg-gradient-to-t from-black via-stone-900 to-black rounded-t-lg border-t-2 border-stone-600 shadow-2xl flex items-center justify-center">
                <span className="w-10 h-1 bg-amber-500/80 rounded-full" />
              </div>
              {/* Wide Brim */}
              <div className="w-32 h-6 bg-gradient-to-r from-black via-stone-900 to-black rounded-full border border-stone-700 shadow-2xl flex items-center justify-center">
                <span className="text-[7px] font-mono text-slate-400">Sombra Protectora</span>
              </div>
            </div>

            {/* Conscience Lantern */}
            <div 
              className="absolute top-3 right-6 bg-slate-900/90 border border-amber-400/60 px-2 py-0.5 rounded-full text-[8px] font-mono font-bold text-amber-300 animate-pulse"
              style={{ transform: 'translateZ(35px)' }}
            >
              👁️ Voz de la Conciencia
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              🎩 El Sombrerón • Autorregulación Ética & Diálogo
            </div>
          </div>
        );

      // 11. LENGUAJE CRÍTICO: CEREBRO VS PANTALLAS (Lectura Profunda)
      case 'brain-screens':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Deep Reading Brain Hemisphere */}
            <div 
              className="w-18 h-24 bg-gradient-to-br from-indigo-700 via-purple-600 to-indigo-950 rounded-l-3xl border-2 border-indigo-400/80 shadow-[0_0_20px_#6366f1] p-1.5 flex flex-col justify-between text-white"
              style={{ transform: 'rotateY(15deg) translateZ(15px)' }}
            >
              <span className="text-xl">🧠</span>
              <span className="text-[7px] font-mono font-bold text-indigo-200">
                Empatía & Análisis
              </span>
              <span className="text-[6px] text-emerald-300 font-black">Prefrontal Activa</span>
            </div>

            {/* Smartphone Screen with Notification Distraction */}
            <div 
              className="w-18 h-24 bg-gradient-to-bl from-slate-900 via-rose-950 to-slate-950 rounded-r-3xl border-2 border-rose-500/80 shadow-[0_0_20px_#f43f5e] p-1.5 flex flex-col justify-between text-white"
              style={{ transform: 'rotateY(-15deg) translateZ(15px)' }}
            >
              <div className="text-right">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-ping" />
              </div>
              <span className="text-center text-xs">📱🔔</span>
              <span className="text-[7px] font-mono text-rose-300 text-center">
                Dispersión Inmediata
              </span>
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-indigo-500/50 text-indigo-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              📖 Lectura Profunda • Armadura Intelectual
            </div>
          </div>
        );

      // 12. LENGUAJE CRÍTICO: MARIPOSAS AMARILLAS DE MACONDO
      case 'macondo-butterflies':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Open Book of Macondo */}
            <div 
              className="w-28 h-20 bg-gradient-to-r from-amber-100 to-amber-200 rounded border-2 border-amber-700/60 shadow-xl p-1.5 flex flex-col justify-between text-slate-800"
              style={{ transform: 'rotateX(30deg) translateZ(5px)' }}
            >
              <div className="text-[7px] font-serif font-black text-amber-900 border-b border-amber-400 pb-0.5">
                Cien Años de Soledad
              </div>
              <div className="text-[6px] font-serif italic text-slate-600">
                "La realidad supera la fantasía..."
              </div>
              <div className="text-[6px] text-right font-mono font-bold text-amber-800">
                Gabo 1982
              </div>
            </div>

            {/* Swarm of Yellow Butterflies in 3D orbit */}
            <div className="absolute w-36 h-36 rounded-full border border-yellow-400/40 border-dashed animate-orbit-1 pointer-events-none">
              <span className="text-xl absolute -top-3 left-1/2 -ml-2 filter drop-shadow">🦋</span>
            </div>
            <div className="absolute w-36 h-36 rounded-full border border-amber-300/40 border-dashed animate-orbit-2 pointer-events-none">
              <span className="text-xl absolute top-1/2 -right-3 -mt-2 filter drop-shadow">🦋</span>
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-amber-400/50 text-amber-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(35px)' }}
            >
              🦋 Realismo Mágico • Memoria contra el Olvido
            </div>
          </div>
        );

      // 13. LENGUAJE CRÍTICO: BALLENA JOROBADA & SONAR EN BAHÍA SOLANO
      case 'whale-sonar':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Pacific Waves Base */}
            <div 
              className="absolute w-36 h-12 bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-950 rounded-full border border-blue-400/40"
              style={{ transform: 'rotateX(55deg) translateZ(-20px)' }}
            />

            {/* Breaching Humpback Whale */}
            <div className="relative flex flex-col items-center animate-float-3d" style={{ transform: 'translateZ(15px)' }}>
              <span className="text-4xl filter drop-shadow">🐋</span>
            </div>

            {/* Acoustic Sonar Rings (Whale song) */}
            <div className="absolute w-32 h-32 rounded-full border-2 border-cyan-400/60 border-dashed animate-orbit-1 pointer-events-none" />
            <div className="absolute w-40 h-40 rounded-full border border-cyan-300/30 border-dashed animate-orbit-2 pointer-events-none" />

            {/* Warning tag */}
            <div 
              className="absolute top-2 right-2 bg-rose-950/90 border border-rose-500/50 px-2 py-0.5 rounded-full text-[8px] font-mono text-rose-300 animate-pulse"
              style={{ transform: 'translateZ(35px)' }}
            >
              ⚠️ Ruido de Motores
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              🌊 Cantos de Ballena Jorobada • 8.000 km
            </div>
          </div>
        );

      // 14. LENGUAJE CRÍTICO: PUENTE DE CONECTORES LÓGICOS
      case 'logic-bridge':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Idea Block A */}
            <div 
              className="w-14 h-16 bg-indigo-900/80 border border-indigo-400 rounded-lg p-1 text-center flex flex-col justify-between text-[8px] font-mono text-indigo-200"
              style={{ transform: 'translateX(-40px) translateZ(10px)' }}
            >
              <span>Premisa</span>
              <span className="text-xs">🧱</span>
              <span>"Estudió"</span>
            </div>

            {/* Connector Keystone Bridge */}
            <div 
              className="w-24 h-10 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-xl border-2 border-amber-200 shadow-xl flex flex-col items-center justify-center text-slate-950 font-black text-[9px] animate-float-3d"
              style={{ transform: 'translateZ(30px)' }}
            >
              <span>Sin embargo</span>
              <span className="text-[6px] tracking-tight uppercase font-mono">Contraste</span>
            </div>

            {/* Idea Block B */}
            <div 
              className="w-14 h-16 bg-teal-900/80 border border-teal-400 rounded-lg p-1 text-center flex flex-col justify-between text-[8px] font-mono text-teal-200"
              style={{ transform: 'translateX(40px) translateZ(10px)' }}
            >
              <span>Resultado</span>
              <span className="text-xs">🎯</span>
              <span>"Inesperado"</span>
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(35px)' }}
            >
              🌉 Conectores Lógicos • Cohesión Textual
            </div>
          </div>
        );

      // 15. ORTOGRAFÍA: LOS CUATRO PORQUÉS (Prisma de 4 Caras)
      case 'four-porques':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* 4-Sided Revolving Prism */}
            <div className="w-24 h-24 relative preserve-3d animate-spin-3d">
              {/* Face 1: El porqué (Sustantivo) */}
              <div 
                className="absolute inset-0 bg-amber-500/80 border-2 border-amber-200 rounded-lg flex flex-col items-center justify-center p-1 text-slate-950 font-black text-[10px]"
                style={{ transform: 'translateZ(48px)' }}
              >
                <span>El Porqué</span>
                <span className="text-[7px] font-normal">Sustantivo = Motivo</span>
              </div>
              {/* Face 2: ¿Por qué? (Pregunta) */}
              <div 
                className="absolute inset-0 bg-blue-600/80 border-2 border-blue-200 rounded-lg flex flex-col items-center justify-center p-1 text-white font-black text-[10px]"
                style={{ transform: 'rotateY(90deg) translateZ(48px)' }}
              >
                <span>¿Por qué?</span>
                <span className="text-[7px] font-normal">Interrogativo</span>
              </div>
              {/* Face 3: Porque (Explicación) */}
              <div 
                className="absolute inset-0 bg-emerald-600/80 border-2 border-emerald-200 rounded-lg flex flex-col items-center justify-center p-1 text-white font-black text-[10px]"
                style={{ transform: 'rotateY(180deg) translateZ(48px)' }}
              >
                <span>Porque</span>
                <span className="text-[7px] font-normal">Causa explicativa</span>
              </div>
              {/* Face 4: Por que (Relativo) */}
              <div 
                className="absolute inset-0 bg-purple-600/80 border-2 border-purple-200 rounded-lg flex flex-col items-center justify-center p-1 text-white font-black text-[10px]"
                style={{ transform: 'rotateY(-90deg) translateZ(48px)' }}
              >
                <span>Por que</span>
                <span className="text-[7px] font-normal">Por el cual</span>
              </div>
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-amber-400/50 text-amber-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(35px)' }}
            >
              ✍️ Prisma de los 4 "Porqués" • Acento Diacrítico
            </div>
          </div>
        );

      // 16. ORTOGRAFÍA / POESÍA: METÁFORA Y SÍMIL (Luceros & Golondrina)
      case 'poetry-metaphor':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Twin Shining Stars (Metáfora: Ojos = Luceros) */}
            <div 
              className="w-16 h-20 bg-gradient-to-b from-amber-300 to-yellow-600 rounded-xl border border-amber-100 shadow-[0_0_20px_#f59e0b] p-1 flex flex-col items-center justify-between text-slate-950 font-black animate-float-3d"
              style={{ transform: 'translateX(-30px) translateZ(20px)' }}
            >
              <span className="text-xl">✨</span>
              <span className="text-[7px] font-mono">Luceros</span>
              <span className="text-[6px] bg-slate-900 text-amber-300 px-1 rounded">Metáfora</span>
            </div>

            {/* Swallow in Flight (Símil: Vuela como una golondrina) */}
            <div 
              className="w-16 h-20 bg-gradient-to-b from-sky-400 to-blue-700 rounded-xl border border-sky-100 shadow-[0_0_20px_#0284c7] p-1 flex flex-col items-center justify-between text-white font-black animate-float-3d"
              style={{ transform: 'translateX(30px) translateZ(20px)', animationDelay: '0.5s' }}
            >
              <span className="text-xl">🕊️</span>
              <span className="text-[7px] font-mono">Golondrina</span>
              <span className="text-[6px] bg-slate-900 text-sky-300 px-1 rounded">Símil ("Como")</span>
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-amber-400/50 text-amber-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(35px)' }}
            >
              🎭 Metáfora (Directa) & Símil (Nexo Comparativo)
            </div>
          </div>
        );

      // 17. MATEMÁTICAS: PRESUPUESTO & DESCUENTO DE CAFETERÍA
      case 'cash-discount':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Cafeteria Register Screen */}
            <div 
              className="w-36 h-24 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500 rounded-xl shadow-2xl p-2 flex flex-col justify-between text-white font-mono"
              style={{ transform: 'rotateX(15deg) translateZ(10px)' }}
            >
              <div className="flex justify-between text-[8px] text-slate-400 border-b border-slate-800 pb-1">
                <span>Cafetería Escolar</span>
                <span>Desc: 10%</span>
              </div>
              <div className="text-center my-0.5">
                <span className="text-[9px] text-slate-400 line-through">$16.000</span>
                <span className="text-xs font-black text-emerald-400 block">$14.400 Total</span>
              </div>
              <div className="flex justify-between items-center text-[8px] bg-slate-800/80 px-1.5 py-0.5 rounded text-amber-300 font-bold">
                <span>Pagó: $20.000</span>
                <span className="text-emerald-300">Cambio: $5.600</span>
              </div>
            </div>

            {/* Floating Gold Coin */}
            <div 
              className="absolute -top-3 right-4 w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border-2 border-amber-100 shadow-lg flex items-center justify-center text-slate-950 font-black text-xs animate-coin-3d"
              style={{ transform: 'translateZ(35px)' }}
            >
              $
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              💵 $20.000 - $14.400 = $5.600 de Cambio
            </div>
          </div>
        );

      // 18. MATEMÁTICAS: CANCHA POLIDEPORTIVA (Área = 420 m²)
      case 'court-geometry':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* 3D Court Floor */}
            <div 
              className="w-36 h-28 bg-emerald-950/80 border-2 border-emerald-400 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex flex-col justify-between p-2 relative"
              style={{ transform: 'rotateX(55deg) translateZ(-10px)' }}
            >
              <div className="w-full h-full border border-white/60 rounded flex items-center justify-center relative">
                <div className="w-12 h-12 rounded-full border border-white/60" />
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/60" />
              </div>

              {/* Dimension Callouts */}
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-amber-300 bg-slate-900/90 px-1 rounded border border-amber-400/50">
                Largo: 28 m
              </span>
              <span className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-mono font-bold text-emerald-300 bg-slate-900/90 px-1 rounded border border-emerald-400/50">
                15 m
              </span>
            </div>

            {/* Formula Floating Tag */}
            <div 
              className="absolute top-2 bg-slate-950/90 border border-cyan-400 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold text-cyan-300 animate-float-3d"
              style={{ transform: 'translateZ(35px)' }}
            >
              28 m × 15 m = 420 m²
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              📐 Área = 420 m² | Perímetro = 86 m
            </div>
          </div>
        );

      // 19. MATEMÁTICAS: HUERTA ESCOLAR Y FRACCIONES
      case 'huerta-fractions':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Raised Garden Bed (Quadrants) */}
            <div 
              className="w-32 h-32 bg-stone-900 border-2 border-amber-700 rounded-xl grid grid-cols-2 grid-rows-2 gap-1 p-1 shadow-2xl"
              style={{ transform: 'rotateX(55deg)' }}
            >
              {/* 1/2 Carrots (Left Half) */}
              <div className="row-span-2 bg-gradient-to-b from-orange-600 to-amber-700 rounded-md border border-orange-300 flex flex-col items-center justify-center text-white font-black text-[9px] p-1">
                <span>🥕 1/2</span>
                <span className="text-[7px] font-mono">Zanahorias</span>
              </div>
              {/* 1/4 Lettuce (Top Right) */}
              <div className="bg-gradient-to-b from-green-600 to-emerald-700 rounded-md border border-emerald-300 flex flex-col items-center justify-center text-white font-black text-[8px] p-1">
                <span>🥬 1/4</span>
                <span className="text-[6px] font-mono">Lechuga</span>
              </div>
              {/* 1/4 Aromatics (Bottom Right - Elevated in 3D!) */}
              <div 
                className="bg-gradient-to-b from-purple-600 to-indigo-700 rounded-md border-2 border-purple-300 flex flex-col items-center justify-center text-white font-black text-[8px] p-1 shadow-xl animate-float-3d"
                style={{ transform: 'translateZ(20px)' }}
              >
                <span>🌿 1/4</span>
                <span className="text-[6px] font-mono">Aromáticas</span>
              </div>
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-purple-500/50 text-purple-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              🌱 Parcela: 1/2 + 1/4 + 1/4 = 1 Parcela Completa
            </div>
          </div>
        );

      // 20. CIENCIAS: AVES DE COLOMBIA & CÓNDOR DE LOS ANDES
      case 'condor-birds':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Three Andean Mountain Tiers */}
            <div 
              className="absolute bottom-2 w-36 h-12 bg-gradient-to-r from-emerald-950 via-stone-800 to-teal-950 rounded-full border border-emerald-600/40"
              style={{ transform: 'rotateX(60deg) translateZ(-20px)' }}
            />

            {/* Andean Condor & Hummingbird in flight */}
            <div className="relative flex flex-col items-center animate-float-3d" style={{ transform: 'translateZ(20px)' }}>
              <span className="text-4xl filter drop-shadow">🦅</span>
              <span className="text-[8px] font-mono font-bold text-amber-300">Cóndor Andino</span>
            </div>

            {/* Tiny Hummingbird orbiting */}
            <div className="absolute w-36 h-36 rounded-full border border-emerald-400/40 border-dashed animate-orbit-1 pointer-events-none">
              <span className="text-base absolute -top-2 left-1/2 -ml-2 filter drop-shadow">🦜</span>
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-amber-400/50 text-amber-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              🇨🇴 Colombia #1 en Aves • 1.950+ Especies & 3 Cordilleras
            </div>
          </div>
        );

      // 21. CIENCIAS: FOTOSÍNTESIS Y CLOROPLASTO
      case 'photosynthesis-leaf':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Green Leaf Cell Cross-section */}
            <div 
              className="w-28 h-28 rounded-full bg-gradient-to-br from-green-500 via-emerald-600 to-teal-800 border-2 border-emerald-200 shadow-[0_0_25px_#10b981] flex flex-col items-center justify-between p-2 text-white font-mono preserve-3d"
              style={{ transform: 'rotateX(20deg)' }}
            >
              <div className="text-[8px] text-yellow-300 font-black flex items-center gap-1">
                <span>☀️</span>
                <span>Luz Solar + CO2</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-300 flex items-center justify-center text-xs font-black">
                🌿
              </div>
              <div className="text-[8px] text-cyan-200 font-black flex items-center gap-1">
                <span>💧</span>
                <span>O2 + Glucosa</span>
              </div>
            </div>

            {/* Pure Oxygen Bubbles floating */}
            <div 
              className="absolute top-2 right-4 text-cyan-300 text-[9px] font-mono font-bold bg-slate-900/90 border border-cyan-400 px-2 py-0.5 rounded-full animate-float-3d"
              style={{ transform: 'translateZ(35px)' }}
            >
              🫧 Oxígeno Puro
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              🌱 Fotosíntesis: Luz + CO2 + H2O ➔ Oxígeno (O2)
            </div>
          </div>
        );

      // 22. INGLÉS: LUCAS & VIAJE DE INTERCAMBIO A CANADÁ
      case 'vancouver-flight':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Airplane on Flight Path */}
            <div className="relative flex flex-col items-center animate-float-3d" style={{ transform: 'translateZ(25px)' }}>
              <span className="text-4xl filter drop-shadow">✈️</span>
              <span className="text-[8px] font-mono font-bold text-sky-300 mt-1">Medellín ➔ Vancouver</span>
            </div>

            {/* Canadian Maple Leaf & Sustainability Tree */}
            <div 
              className="absolute top-2 right-4 bg-red-950/90 border border-red-500 text-red-200 text-[8px] font-bold px-2 py-0.5 rounded-full"
              style={{ transform: 'translateZ(40px)' }}
            >
              🍁 Canada Scholarship
            </div>
            <div 
              className="absolute bottom-6 left-4 bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-[8px] font-bold px-2 py-0.5 rounded-full"
              style={{ transform: 'translateZ(40px)' }}
            >
              🌳 Urban Tree Project
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-sky-500/50 text-sky-200 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              🇨🇦 Exchange Program • Leadership & English
            </div>
          </div>
        );

      // 23. INGLÉS: RUTINA SALUDABLE DE SARAH
      case 'healthy-routine':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Oatmeal & Strawberries Bowl */}
            <div 
              className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400 shadow-xl flex flex-col items-center justify-center text-slate-950 font-bold p-1 animate-float-3d"
              style={{ transform: 'translateZ(15px)' }}
            >
              <span className="text-2xl">🥣🍓</span>
              <span className="text-[7px] font-mono">Oatmeal & Fruit</span>
            </div>

            {/* 20 min walk badge */}
            <div 
              className="absolute top-2 right-2 bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-[8px] font-mono font-bold px-2 py-0.5 rounded-full animate-pulse"
              style={{ transform: 'translateZ(35px)' }}
            >
              🚶‍♀️ 20 min Walk
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              💧 Healthy Morning • Energy for Math & Biology
            </div>
          </div>
        );

      // 24. TECNOLOGÍA: ¿QUÉ ES UN ALGORITMO? (Flujo de Pasos Lógicos)
      case 'algorithm-flow':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Sequential Flowchart Steps in 3D */}
            <div className="relative w-36 h-28 preserve-3d flex flex-col justify-between items-center">
              {/* Step 1: Input */}
              <div 
                className="w-24 h-6 bg-cyan-900/80 border border-cyan-400 rounded-md flex items-center justify-center text-[8px] font-mono font-bold text-cyan-200"
                style={{ transform: 'translateZ(25px)' }}
              >
                1. Entrada / Problema
              </div>
              <div className="w-0.5 h-3 bg-cyan-400 animate-pulse" />
              {/* Step 2: Instructions */}
              <div 
                className="w-28 h-7 bg-indigo-900/80 border border-indigo-400 rounded-md flex items-center justify-center text-[8px] font-mono font-bold text-indigo-200"
                style={{ transform: 'translateZ(15px)' }}
              >
                2. Pasos Lógicos Finitos
              </div>
              <div className="w-0.5 h-3 bg-indigo-400 animate-pulse" />
              {/* Step 3: Result */}
              <div 
                className="w-24 h-6 bg-emerald-900/80 border border-emerald-400 rounded-md flex items-center justify-center text-[8px] font-mono font-bold text-emerald-200"
              >
                3. Resultado Exacto 🎯
              </div>
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              💻 Algoritmo: Secuencia Ordenada, Lógica y Finita
            </div>
          </div>
        );

      // 25. TECNOLOGÍA: CIBERSEGURIDAD Y HUELLA DIGITAL
      case 'cyber-vault':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Digital Footprint & Vault Lock */}
            <div 
              className="w-24 h-28 bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 border-2 border-cyan-400 rounded-2xl shadow-[0_0_25px_#06b6d4] flex flex-col items-center justify-between p-2 animate-float-3d"
              style={{ transform: 'translateZ(20px)' }}
            >
              <span className="text-2xl filter drop-shadow">👣</span>
              <span className="text-[7px] font-mono font-bold text-cyan-300">Huella Digital</span>
              <div className="bg-slate-800 border border-emerald-400 px-2 py-0.5 rounded text-[8px] font-mono text-emerald-300 font-bold">
                🔒 Clave: A-z, 0-9, #$
              </div>
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              🛡️ Ciberseguridad • Privacidad & Claves Fuertes
            </div>
          </div>
        );

      // 26. ÉTICA: MESA DE MEDIACIÓN Y CONVIVENCIA ESCOLAR
      case 'peace-mediation-table':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Round Mediation Table */}
            <div 
              className="w-32 h-20 bg-gradient-to-r from-amber-700 to-amber-900 rounded-full border-2 border-amber-400 shadow-2xl flex items-center justify-around px-2"
              style={{ transform: 'rotateX(55deg) translateZ(-5px)' }}
            >
              {/* Side A: Maqueta */}
              <span className="text-[7px] font-mono font-bold text-amber-200">Maqueta 📦</span>
              {/* Agreement Bulb */}
              <span className="text-xs">💡</span>
              {/* Side B: Digital */}
              <span className="text-[7px] font-mono font-bold text-cyan-200">Digital 💻</span>
            </div>

            {/* Floating Handshake */}
            <div 
              className="absolute text-3xl filter drop-shadow animate-float-3d"
              style={{ transform: 'translateZ(30px)' }}
            >
              🤝
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-amber-400/50 text-amber-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(35px)' }}
            >
              🕊️ Mediación Escolar • Diálogo & Escucha Activa
            </div>
          </div>
        );

      // 27. ÉTICA: INCLUSIÓN DE CARLOS Y AULA SIN BARRERAS (BAP)
      case 'inclusion-ramp':
        return (
          <div className="relative w-44 h-40 preserve-3d flex items-center justify-center">
            {/* Access Ramp & Integrated Playground */}
            <div 
              className="w-32 h-20 bg-gradient-to-r from-emerald-800 to-teal-950 rounded-xl border-2 border-emerald-400 shadow-2xl flex flex-col justify-between p-1.5"
              style={{ transform: 'rotateX(50deg) translateZ(-10px)' }}
            >
              <div className="flex justify-between text-[7px] font-mono font-bold text-emerald-200">
                <span>Rampa de Acceso</span>
                <span>Decreto 1421</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[8px] font-bold text-amber-300">
                <span>♿ Carlos</span>
                <span>+</span>
                <span>🏃 Equipo</span>
              </div>
            </div>

            {/* Heart symbol floating */}
            <div 
              className="absolute -top-3 text-2xl filter drop-shadow animate-bounce"
              style={{ transform: 'translateZ(35px)' }}
            >
              ❤️
            </div>

            {/* Educational Badge */}
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-emerald-400/50 text-emerald-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full shadow"
              style={{ transform: 'translateZ(30px)' }}
            >
              🤝 Inclusión (BAP) • Entorno Adaptado con Igualdad
            </div>
          </div>
        );

      // Default Gem / Book
      default:
        return (
          <div className="relative w-40 h-40 preserve-3d flex items-center justify-center">
            <div 
              className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 border-2 border-white/70 rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.5)] flex items-center justify-center animate-spin-3d"
            >
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div 
              className="absolute -bottom-2 bg-slate-900/90 border border-purple-500/40 text-purple-300 px-3 py-0.5 rounded-full text-[10px] font-bold"
              style={{ transform: 'translateZ(25px)' }}
            >
              Exploración Interactiva 3D
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-64 sm:h-72 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing perspective-1000 shadow-inner"
    >
      {/* 3D Atmospheric Grid in background */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80 pointer-events-none" />

      {/* Floating 3D Stage Container */}
      <div 
        className="preserve-3d transition-transform duration-75 ease-out"
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        }}
      >
        {renderModelContent()}
      </div>

      {/* Interactive Controls Overlay */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setAutoRotate(!autoRotate);
          }}
          className={`p-1.5 rounded-lg text-xs font-bold transition ${
            autoRotate ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
          title={autoRotate ? 'Pausar auto-rotación' : 'Activar auto-rotación'}
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Restablecer posición inicial"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Drag instructions prompt at bottom */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-slate-300 shadow">
          <Move3d className="w-3 h-3 text-cyan-400 animate-spin" />
          <span>Arrastra con el dedo o mouse para rotar en 360°</span>
        </span>
      </div>
    </div>
  );
}
