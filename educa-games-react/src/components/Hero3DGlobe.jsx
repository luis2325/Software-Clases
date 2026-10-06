import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Hero3DGlobe: Espectacular Planeta 3D interactivo para la página principal.
 * Diseñado con continentes en relieve, atmósfera brillante de neón,
 * nubes atmosféricas giratorias, anillos tipo Saturno con textura de partículas,
 * satélites poliédricos orbitando con estelas y lluvia de cometas.
 */
export default function Hero3DGlobe({ height = 280 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 340;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 9.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. Sistema de Iluminación de Estudio Cinematográfico
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    // Sol principal potente en diagonal
    const sunLight = new THREE.DirectionalLight(0x60a5fa, 3.2);
    sunLight.position.set(6, 6, 6);
    scene.add(sunLight);

    // Luz trasera de contorno (Rim light) en cian brillante
    const rimLight = new THREE.DirectionalLight(0x06b6d4, 2.8);
    rimLight.position.set(-6, -4, -5);
    scene.add(rimLight);

    // Luz cálida dorada desde abajo
    const goldLight = new THREE.PointLight(0xf59e0b, 3.5, 15);
    goldLight.position.set(0, -3, 3);
    scene.add(goldLight);

    // 3. Grupo Raíz con Inclinación Axial Planetaria (23.5°)
    const rootGroup = new THREE.Group();
    rootGroup.rotation.z = THREE.MathUtils.degToRad(-23.5);
    scene.add(rootGroup);

    // 4. GENERACIÓN DE TEXTURAS PROCEDURALES PARA EL PLANETA
    // Textura realista de continentes y océanos generada dinámicamente en canvas
    const createEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Océano azul profundo con gradiente
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
      oceanGrad.addColorStop(0, '#0f172a');
      oceanGrad.addColorStop(0.3, '#1e1b4b');
      oceanGrad.addColorStop(0.5, '#0c4a6e');
      oceanGrad.addColorStop(0.7, '#1e1b4b');
      oceanGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Red de meridianos y paralelos sutiles
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1024; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y < 512; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }

      // Dibujar masas continentales estilizadas
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 12;

      // Manchas continentales orgánicas
      const drawContinent = (cx, cy, rx, ry) => {
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.25) {
          const rOffset = Math.sin(a * 4) * 15 + Math.cos(a * 7) * 8;
          const x = cx + Math.cos(a) * (rx + rOffset);
          const y = cy + Math.sin(a) * (ry + rOffset);
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      };

      // América del Sur y Norte
      drawContinent(280, 170, 75, 90);
      drawContinent(330, 330, 60, 100);

      // Europa y África
      drawContinent(560, 150, 70, 60);
      drawContinent(580, 290, 75, 110);

      // Asia y Oceanía
      drawContinent(780, 180, 120, 85);
      drawContinent(860, 370, 50, 45);

      // Luces de ciudades doradas nocturnas
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 6;
      for (let i = 0; i < 90; i++) {
        const lx = 200 + Math.random() * 700;
        const ly = 100 + Math.random() * 320;
        ctx.beginPath();
        ctx.arc(lx, ly, Math.random() * 2 + 1, 0, Math.PI * 2);
        ctx.fill();
      }

      return new THREE.CanvasTexture(canvas);
    };

    // Textura de nubes atmosféricas
    const createCloudsTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 1024, 512);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 45; i++) {
        const cx = Math.random() * 1024;
        const cy = 60 + Math.random() * 380;
        const rad = 25 + Math.random() * 55;
        const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, rad);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
        grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.25)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const earthTexture = createEarthTexture();
    const cloudsTexture = createCloudsTexture();

    // 5. Esfera Planetaria Principal
    const planetRadius = 2.15;
    const planetGeo = new THREE.SphereGeometry(planetRadius, 48, 48);
    const planetMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.5,
      metalness: 0.25,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.35
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    rootGroup.add(planet);

    // 6. Capa Atmosférica de Nubes Giratorias
    const cloudsGeo = new THREE.SphereGeometry(planetRadius + 0.05, 40, 40);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const clouds = new THREE.Mesh(cloudsGeo, cloudsMat);
    rootGroup.add(clouds);

    // 7. Halo Atmosférico Luminoso Exterior (Glow)
    const glowGeo = new THREE.SphereGeometry(planetRadius + 0.28, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosphereGlow = new THREE.Mesh(glowGeo, glowMat);
    rootGroup.add(atmosphereGlow);

    // 8. Anillos Planetarios Multicapa Estilo Saturno
    // Anillo Principal Ancho con gradiente
    const ringGeo = new THREE.RingGeometry(2.7, 4.3, 64);
    // Orientar anillo plano al ecuador
    ringGeo.rotateX(Math.PI / 2);

    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      roughness: 0.3
    });
    const mainRing = new THREE.Mesh(ringGeo, ringMat);
    rootGroup.add(mainRing);

    // Anillo Exterior Fino Dorado
    const outerRingGeo = new THREE.TorusGeometry(4.45, 0.04, 16, 96);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.9,
      metalness: 0.8
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    rootGroup.add(outerRing);

    // Anillo Inclinado de Alta Energía Cruzado
    const crossedRingGeo = new THREE.TorusGeometry(3.6, 0.035, 16, 96);
    const crossedRingMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x9333ea,
      emissiveIntensity: 0.8
    });
    const crossedRing = new THREE.Mesh(crossedRingGeo, crossedRingMat);
    crossedRing.rotation.x = Math.PI / 3.5;
    crossedRing.rotation.y = Math.PI / 5;
    rootGroup.add(crossedRing);

    // 9. Satélites Científicos Flotantes Orbitando en Diferentes Planos
    const satellites = [];
    const satConfigs = [
      { color: 0xef4444, radius: 3.2, speed: 1.1, size: 0.28, yOffset: 0.3 }, // Ciencias (Rojo)
      { color: 0x10b981, radius: 3.7, speed: 0.8, size: 0.24, yOffset: -0.4 }, // Naturaleza (Verde)
      { color: 0x3b82f6, radius: 4.1, speed: 0.65, size: 0.3, yOffset: 0.5 },  // Tecnología (Azul)
      { color: 0xfacc15, radius: 4.6, speed: 0.5, size: 0.26, yOffset: -0.2 },  // Geografía (Oro)
      { color: 0xec4899, radius: 3.5, speed: 0.95, size: 0.22, yOffset: 0.7 }   // Humanidades (Rosa)
    ];

    satConfigs.forEach((cfg, i) => {
      const satGroup = new THREE.Group();

      // Núcleo poliédrico brillante
      const satGeo = new THREE.IcosahedronGeometry(cfg.size, 0);
      const satMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.6
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satGroup.add(satMesh);

      // Micro aureola de luz pulsante alrededor del satélite
      const satHaloGeo = new THREE.SphereGeometry(cfg.size * 1.5, 12, 12);
      const satHaloMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      const satHalo = new THREE.Mesh(satHaloGeo, satHaloMat);
      satGroup.add(satHalo);

      rootGroup.add(satGroup);

      satellites.push({
        group: satGroup,
        mesh: satMesh,
        angle: (i * Math.PI * 2) / satConfigs.length,
        speed: cfg.speed,
        radius: cfg.radius,
        yOffset: cfg.yOffset
      });
    });

    // 10. Polvo de Partículas Estelares y Cometas en Movimiento
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSpeeds = [];

    for (let p = 0; p < particleCount; p++) {
      particlePos[p * 3] = (Math.random() - 0.5) * 14;
      particlePos[p * 3 + 1] = (Math.random() - 0.5) * 10;
      particlePos[p * 3 + 2] = (Math.random() - 0.5) * 12;
      particleSpeeds.push((Math.random() * 0.5 + 0.2) * (Math.random() > 0.5 ? 1 : -1));
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.09,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const starField = new THREE.Points(particleGeo, particleMat);
    scene.add(starField);

    // 11. Control Interactivo Parallax con Mouse y Touch
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 1.1;
      targetY = y * 1.1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 12. Bucle de Animación Continuo y Fluido
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Rotación del planeta sobre su propio eje
      planet.rotation.y += delta * 0.35;

      // Nubes rotan ligeramente más rápido simulando corrientes atmosféricas
      clouds.rotation.y += delta * 0.42;

      // Rotación de los anillos
      mainRing.rotation.z += delta * 0.2;
      outerRing.rotation.z -= delta * 0.15;
      crossedRing.rotation.z += delta * 0.3;

      // Satélites orbitando alrededor del planeta
      satellites.forEach((sat) => {
        sat.angle += delta * sat.speed;
        sat.group.position.x = Math.cos(sat.angle) * sat.radius;
        sat.group.position.z = Math.sin(sat.angle) * sat.radius;
        sat.group.position.y = Math.sin(sat.angle * 2 + elapsedTime) * 0.5 + sat.yOffset;
        sat.mesh.rotation.x += delta * 2;
        sat.mesh.rotation.y += delta * 2.5;
      });

      // Animación suave de partículas de fondo
      const positions = starField.geometry.attributes.position.array;
      for (let p = 0; p < particleCount; p++) {
        positions[p * 3 + 1] += Math.sin(elapsedTime + p) * 0.003;
      }
      starField.geometry.attributes.position.needsUpdate = true;

      // Inclinación reactiva al cursor con amortiguación
      mouseX += (targetX - mouseX) * 0.06;
      mouseY += (targetY - mouseY) * 0.06;

      rootGroup.rotation.y = elapsedTime * 0.18 + mouseX;
      rootGroup.rotation.x = THREE.MathUtils.degToRad(-15) + mouseY * 0.7;

      // Pulso suave en la luz dorada
      goldLight.intensity = 3 + Math.sin(elapsedTime * 3) * 0.8;

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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      planetGeo.dispose();
      planetMat.dispose();
      cloudsGeo.dispose();
      cloudsMat.dispose();
      earthTexture.dispose();
      cloudsTexture.dispose();
    };
  }, [height]);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none pointer-events-none">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}
