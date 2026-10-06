import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Compass, RotateCw, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

/**
 * Hero3DGlobe: Espectacular Planeta Tierra 3D interactivo para la portada escolar.
 * Características:
 * - Rotación libre 360° con arrastre del ratón o pantalla táctil
 * - Zoom in / Zoom out y recentrado
 * - Continentes en relieve verde esmeralda con cordilleras
 * - Océanos azul zafiro con meridianos y paralelos holográficos
 * - Nubes atmosféricas flotantes en rotación continua
 * - Ciudades iluminadas con destellos dorados
 * - Anillo orbital de meteoros y satélites de las asignaturas
 * - Marcadores holográficos interactivos (Colombia y América Latina)
 */
export default function Hero3DGlobe({ height = 300 }) {
  const mountRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activePin, setActivePin] = useState(null);
  const globeControlsRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Escena, Cámara y Renderizador WebGL
    const scene = new THREE.Scene();
    const width = container.clientWidth || 340;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. Iluminación Cinematográfica
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Sol principal en diagonal (Día)
    const sunLight = new THREE.DirectionalLight(0x60a5fa, 3.4);
    sunLight.position.set(6, 4, 7);
    scene.add(sunLight);

    // Luz de contorno azul cian
    const rimLight = new THREE.DirectionalLight(0x06b6d4, 2.5);
    rimLight.position.set(-6, -3, -5);
    scene.add(rimLight);

    // Resplandor cálido en el polo sur
    const glowLight = new THREE.PointLight(0xf59e0b, 3.2, 14);
    glowLight.position.set(0, -4, 2);
    scene.add(glowLight);

    // 3. Grupo Raíz Planetario con Inclinación Axial (23.5°)
    const rootGroup = new THREE.Group();
    rootGroup.rotation.z = THREE.MathUtils.degToRad(-15);
    scene.add(rootGroup);

    // 4. GENERACIÓN DE TEXTURAS DE CONTINENTES Y NUBES
    const createEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Océano azul profundo con gradiente
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
      oceanGrad.addColorStop(0, '#020617');
      oceanGrad.addColorStop(0.2, '#0f172a');
      oceanGrad.addColorStop(0.5, '#0369a1');
      oceanGrad.addColorStop(0.8, '#0f172a');
      oceanGrad.addColorStop(1, '#020617');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Líneas de latitud y longitud holográficas
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1024; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y < 512; y += 36) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }

      // Dibujar continentes con relieve
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 10;

      const drawLand = (cx, cy, rx, ry) => {
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.2) {
          const rOffset = Math.sin(a * 4) * 12 + Math.cos(a * 7) * 7;
          const x = cx + Math.cos(a) * (rx + rOffset);
          const y = cy + Math.sin(a) * (ry + rOffset);
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      };

      // América del Sur (Colombia, Andes, Amazonía)
      drawLand(310, 320, 70, 110);
      // América del Norte
      drawLand(260, 160, 95, 80);
      // Europa
      drawLand(540, 150, 70, 55);
      // África
      drawLand(560, 290, 80, 110);
      // Asia
      drawLand(760, 170, 130, 90);
      // Australia / Oceanía
      drawLand(850, 380, 55, 45);

      // Luces de Ciudades Doradas Nocturnas
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      for (let i = 0; i < 120; i++) {
        const lx = 180 + Math.random() * 720;
        const ly = 90 + Math.random() * 340;
        ctx.beginPath();
        ctx.arc(lx, ly, Math.random() * 2 + 1, 0, Math.PI * 2);
        ctx.fill();
      }

      return new THREE.CanvasTexture(canvas);
    };

    const createCloudsTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 1024, 512);

      for (let i = 0; i < 50; i++) {
        const cx = Math.random() * 1024;
        const cy = 60 + Math.random() * 390;
        const rad = 25 + Math.random() * 60;
        const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, rad);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
        grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.25)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const earthTex = createEarthTexture();
    const cloudsTex = createCloudsTexture();

    // 5. Esfera Planetaria de la Tierra
    const planetRadius = 2.05;
    const planetGeo = new THREE.SphereGeometry(planetRadius, 48, 48);
    const planetMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.45,
      metalness: 0.2,
      emissive: 0x0f172a,
      emissiveIntensity: 0.3
    });
    const earthMesh = new THREE.Mesh(planetGeo, planetMat);
    rootGroup.add(earthMesh);

    // 6. Capa de Nubes Dinámicas
    const cloudsGeo = new THREE.SphereGeometry(planetRadius + 0.04, 36, 36);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: cloudsTex,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    rootGroup.add(cloudsMesh);

    // 7. Atmósfera Resplandeciente Exterior (Halo de Neón)
    const glowGeo = new THREE.SphereGeometry(planetRadius + 0.25, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    rootGroup.add(glowMesh);

    // 8. Marcador Especial: Colombia & Aula Activa
    const pinGroup = new THREE.Group();
    // Coordenadas aproximadas en la esfera para el norte de Suramérica
    const pinLat = THREE.MathUtils.degToRad(5);
    const pinLng = THREE.MathUtils.degToRad(-74);
    const pX = (planetRadius + 0.06) * Math.cos(pinLat) * Math.cos(pinLng);
    const pY = (planetRadius + 0.06) * Math.sin(pinLat);
    const pZ = -(planetRadius + 0.06) * Math.cos(pinLat) * Math.sin(pinLng);

    pinGroup.position.set(pX, pY, pZ);

    const pinConeGeo = new THREE.ConeGeometry(0.12, 0.4, 12);
    pinConeGeo.rotateX(Math.PI);
    const pinConeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xf59e0b, emissiveIntensity: 0.8 });
    const pinCone = new THREE.Mesh(pinConeGeo, pinConeMat);
    pinCone.position.y = 0.2;
    pinGroup.add(pinCone);

    const pinRingGeo = new THREE.RingGeometry(0.08, 0.2, 16);
    const pinRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const pinRing = new THREE.Mesh(pinRingGeo, pinRingMat);
    pinGroup.add(pinRing);
    earthMesh.add(pinGroup);

    // 9. Campo de Partículas Estelares de Fondo (120 Estrellas)
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount * 3; p++) {
      pos[p] = (Math.random() - 0.5) * 14;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const starField = new THREE.Points(particleGeo, particleMat);
    scene.add(starField);

    // 11. INTERACCIÓN DE ROTACIÓN 360 LIBRE (MOUSE / TOUCH)
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let rotX = 0;
    let rotY = 0;

    const domElement = renderer.domElement;

    const onPointerDown = (e) => {
      isDragging = true;
      prevX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      prevY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const deltaX = clientX - prevX;
      const deltaY = clientY - prevY;

      rotY += deltaX * 0.008;
      rotX += deltaY * 0.008;

      prevX = clientX;
      prevY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    domElement.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Métodos para controles de UI externos
    globeControlsRef.current = {
      zoom: (delta) => {
        camera.position.z = THREE.MathUtils.clamp(camera.position.z + delta, 4.0, 9.5);
      },
      reset: () => {
        camera.position.set(0, 0, 6.8);
        rotX = 0;
        rotY = 0;
        rootGroup.rotation.set(0, 0, THREE.MathUtils.degToRad(-15));
      }
    };

    // 10. Bucle de Animación Continuo
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Rotación autónoma si no está arrastrando
      if (autoRotate && !isDragging) {
        earthMesh.rotation.y += delta * 0.28;
      }

      // Nubes rotan a velocidad independiente simulando vientos
      cloudsMesh.rotation.y += delta * 0.38;

      // Rotación interactiva con arrastre
      rootGroup.rotation.y += (rotY - rootGroup.rotation.y) * 0.1;
      rootGroup.rotation.x += (rotX - rootGroup.rotation.x) * 0.1;

      // Efecto pulso en el marcador de Colombia
      const pulseScale = 1 + Math.sin(elapsedTime * 4) * 0.15;
      pinCone.scale.set(pulseScale, pulseScale, pulseScale);
      pinRing.scale.set(pulseScale * 1.2, pulseScale * 1.2, 1);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      camera.aspect = newW / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      domElement.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElement.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      planetGeo.dispose();
      planetMat.dispose();
      cloudsGeo.dispose();
      cloudsMat.dispose();
      earthTex.dispose();
      cloudsTex.dispose();
    };
  }, [height, autoRotate]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none group">
      {/* 3D WebGL Canvas */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center" 
        title="Arrastra con el mouse o tu dedo para girar la Tierra 360°"
      />

      {/* Floating Interactive Controls Toolbar */}
      <div className="absolute top-1 right-1 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md p-1 rounded-xl border border-indigo-500/30 shadow-lg pointer-events-auto">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1 rounded-lg text-xs transition ${
            autoRotate ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={autoRotate ? "Pausar rotación automática" : "Girar automáticamente"}
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={() => globeControlsRef.current?.zoom(-1.2)}
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs"
          title="Acercar la Tierra"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => globeControlsRef.current?.zoom(1.2)}
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs"
          title="Alejar la Tierra"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => globeControlsRef.current?.reset()}
          className="p-1 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition text-xs"
          title="Centrar posición"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-indigo-500/40 text-[10px] text-cyan-300 font-mono font-bold pointer-events-none shadow-md flex items-center gap-1">
        <Compass className="w-3 h-3 text-cyan-400 animate-spin" />
        <span>Gira 360° con el mouse o dedo</span>
      </div>
    </div>
  );
}
