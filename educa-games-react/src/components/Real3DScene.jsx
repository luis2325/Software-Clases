import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Minimize2, Eye, Sparkles, RefreshCw, Compass } from 'lucide-react';

/**
 * Real3DScene: Motor 3D interactivo WebGL desarrollado con Three.js
 * Crea modelos tridimensionales interactivos, iluminados y animados
 * adaptados específicamente a cada materia y pregunta escolar.
 */
export default function Real3DScene({ 
  modelType = 'default',
  title = '',
  subject = '',
  height = 360
}) {
  const mountRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [active3DClue, setActive3DClue] = useState(null);
  const sceneContextRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.035);

    const width = container.clientWidth || 600;
    const currentHeight = isFullscreen ? window.innerHeight - 100 : height;

    const camera = new THREE.PerspectiveCamera(45, width / currentHeight, 0.1, 1000);
    camera.position.set(0, 3, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, currentHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Clear previous children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. Iluminación Cinematográfica
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x6366f1, 2.2);
    mainLight.position.set(6, 12, 8);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const secondaryLight = new THREE.DirectionalLight(0x06b6d4, 1.6);
    secondaryLight.position.set(-6, -4, -6);
    scene.add(secondaryLight);

    const pointLight = new THREE.PointLight(0xf59e0b, 2.5, 20);
    pointLight.position.set(0, 4, 2);
    scene.add(pointLight);

    // 3. Grid y Partículas de Ambiente 3D
    const gridHelper = new THREE.GridHelper(16, 16, 0x312e81, 0x1e1b4b);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Partículas estelares flotantes
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 18;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Grupo Principal de Modelo 3D
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Variable para animaciones por frame
    const animators = [];

    // ========================================================
    // CONSTRUCCIÓN DE MODELOS SEGÚN LA MATERIA Y PREGUNTA
    // ========================================================
    switch (modelType) {
      // 🌿 1. Caño Cristales (Río de los 7 Colores)
      case 'cano-cristales': {
        // Terreno rocoso base
        const rockGeo = new THREE.CylinderGeometry(4.2, 4.6, 0.8, 32);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.y = -1.5;
        modelGroup.add(rock);

        // Canales del río con plantas acuáticas (Macarenia clavigera)
        const colors = [0xec4899, 0xd946ef, 0x10b981, 0x06b6d4, 0xf59e0b];
        const riverStrips = [];
        for (let i = 0; i < 5; i++) {
          const stripGeo = new THREE.TorusGeometry(1.6 + i * 0.45, 0.16, 16, 64, Math.PI * 1.5);
          const stripMat = new THREE.MeshStandardMaterial({
            color: colors[i],
            roughness: 0.3,
            metalness: 0.2,
            emissive: colors[i],
            emissiveIntensity: 0.35
          });
          const strip = new THREE.Mesh(stripGeo, stripMat);
          strip.rotation.x = Math.PI / 2;
          strip.rotation.z = i * 0.4;
          strip.position.y = -1.0 + (i % 2) * 0.1;
          modelGroup.add(strip);
          riverStrips.push(strip);
        }

        // Cascada central cristalina
        const waterGeo = new THREE.CylinderGeometry(0.8, 1.4, 2.2, 24, 1, true);
        const waterMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.75,
          roughness: 0.1,
          metalness: 0.1
        });
        const waterfall = new THREE.Mesh(waterGeo, waterMat);
        waterfall.position.y = 0.2;
        modelGroup.add(waterfall);

        animators.push((time) => {
          waterfall.rotation.y = time * 0.6;
          riverStrips.forEach((st, idx) => {
            st.rotation.z += Math.sin(time * 2 + idx) * 0.002;
          });
        });
        break;
      }

      // 🌴 2. Palma de Cera & Valle del Cocora
      case 'palma-cera': {
        // Terreno montañoso verde
        const hillGeo = new THREE.ConeGeometry(4, 1.8, 32);
        const hillMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
        const hill = new THREE.Mesh(hillGeo, hillMat);
        hill.position.y = -1.2;
        modelGroup.add(hill);

        // Tronco ultra esbelto de Palma de Cera (60m)
        const trunkGeo = new THREE.CylinderGeometry(0.08, 0.16, 5.5, 16);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.6;
        modelGroup.add(trunk);

        // Corona de palmas en la cima
        const crownGroup = new THREE.Group();
        crownGroup.position.y = 4.3;
        for (let j = 0; j < 8; j++) {
          const frondGeo = new THREE.ConeGeometry(0.4, 1.6, 6);
          const frondMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });
          const frond = new THREE.Mesh(frondGeo, frondMat);
          frond.rotation.z = Math.PI / 3;
          frond.rotation.y = (j * Math.PI) / 4;
          crownGroup.add(frond);
        }
        modelGroup.add(crownGroup);

        animators.push((time) => {
          crownGroup.rotation.y = Math.sin(time * 0.8) * 0.08;
          crownGroup.rotation.z = Math.cos(time * 1.2) * 0.04;
        });
        break;
      }

      // 🏰 3. Castillo San Felipe / Fortaleza Histórica
      case 'castillo-san-felipe': {
        // Base de colina de San Lázaro
        const baseGeo = new THREE.BoxGeometry(4.8, 1, 4.8);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -1.2;
        modelGroup.add(base);

        // Baluartes y murallas escalonadas
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.7 });
        for (let level = 0; level < 3; level++) {
          const size = 3.6 - level * 0.9;
          const tierGeo = new THREE.BoxGeometry(size, 0.7, size);
          const tier = new THREE.Mesh(tierGeo, wallMat);
          tier.position.y = -0.5 + level * 0.8;
          modelGroup.add(tier);
        }

        // Torres defensivas con antorchas
        const towerGeo = new THREE.CylinderGeometry(0.35, 0.4, 1.6, 12);
        const towerMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.6 });
        const positions = [[-1.4, 1.4], [1.4, 1.4], [-1.4, -1.4], [1.4, -1.4]];
        positions.forEach(([tx, tz]) => {
          const tower = new THREE.Mesh(towerGeo, towerMat);
          tower.position.set(tx, 0.6, tz);
          modelGroup.add(tower);
        });

        // Banderín en la cima
        const flagPoleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
        const flagPole = new THREE.Mesh(flagPoleGeo, new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
        flagPole.position.set(0, 2.2, 0);
        modelGroup.add(flagPole);

        const flagGeo = new THREE.PlaneGeometry(0.8, 0.45);
        const flagMat = new THREE.MeshStandardMaterial({ color: 0xef4444, side: THREE.DoubleSide });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(0.4, 2.8, 0);
        modelGroup.add(flag);

        animators.push((time) => {
          flag.rotation.y = Math.sin(time * 3) * 0.25;
        });
        break;
      }

      // 🌉 4. Batalla de Boyacá & Ruta Libertadora
      case 'puente-boyaca':
      case 'lanceros-vargas': {
        // Río Teatinos debajo
        const riverGeo = new THREE.BoxGeometry(5.2, 0.2, 2.5);
        const riverMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.5 });
        const river = new THREE.Mesh(riverGeo, riverMat);
        river.position.y = -1.4;
        modelGroup.add(river);

        // Arco del Puente de Boyacá de piedra
        const bridgeArchGeo = new THREE.TorusGeometry(1.6, 0.35, 16, 32, Math.PI);
        const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
        const arch = new THREE.Mesh(bridgeArchGeo, bridgeMat);
        arch.position.y = -0.4;
        arch.rotation.z = Math.PI;
        modelGroup.add(arch);

        // Calzada del puente
        const roadGeo = new THREE.BoxGeometry(4.2, 0.25, 1.2);
        const road = new THREE.Mesh(roadGeo, bridgeMat);
        road.position.y = 0.1;
        modelGroup.add(road);

        // Obelisco conmemorativo en honor a la Independencia
        const obeliskGeo = new THREE.ConeGeometry(0.5, 2.8, 4);
        const obeliskMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.4, roughness: 0.3 });
        const obelisk = new THREE.Mesh(obeliskGeo, obeliskMat);
        obelisk.position.set(0, 1.6, 0);
        modelGroup.add(obelisk);

        animators.push((time) => {
          obelisk.rotation.y = time * 0.4;
        });
        break;
      }

      // 📖 5. Lenguaje & Literatura (Libro Mágico de Macondo / Mitos)
      case 'mohan-river':
      case 'macondo-butterflies':
      case 'llorona-mist':
      case 'sombreron-hat':
      case 'poetry-metaphor':
      case 'four-porques': {
        // Tomo Encantado de Cuero
        const coverGeo = new THREE.BoxGeometry(3.6, 0.35, 2.6);
        const coverMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.6 });
        const cover = new THREE.Mesh(coverGeo, coverMat);
        cover.position.y = -0.6;
        modelGroup.add(cover);

        // Hojas doradas de pergamino
        const pagesGeo = new THREE.BoxGeometry(3.4, 0.45, 2.4);
        const pagesMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
        const pages = new THREE.Mesh(pagesGeo, pagesMat);
        pages.position.y = -0.3;
        modelGroup.add(pages);

        // Mariposas amarillas flotantes de Macondo
        const butterflyGroup = new THREE.Group();
        const bColors = [0xfacc15, 0xfbbf24, 0xf59e0b];
        for (let b = 0; b < 6; b++) {
          const wingGeo = new THREE.PlaneGeometry(0.35, 0.25);
          const wingMat = new THREE.MeshStandardMaterial({
            color: bColors[b % 3],
            side: THREE.DoubleSide,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.4
          });
          const bFly = new THREE.Mesh(wingGeo, wingMat);
          const angle = (b * Math.PI) / 3;
          bFly.position.set(Math.cos(angle) * 1.6, 1.2 + (b % 3) * 0.5, Math.sin(angle) * 1.6);
          butterflyGroup.add(bFly);
        }
        modelGroup.add(butterflyGroup);

        animators.push((time) => {
          butterflyGroup.rotation.y = time * 0.8;
          butterflyGroup.children.forEach((bf, idx) => {
            bf.rotation.x = Math.sin(time * 6 + idx) * 0.6;
            bf.position.y += Math.sin(time * 2 + idx) * 0.004;
          });
        });
        break;
      }

      // 📐 6. Matemáticas (Cancha 3D, Fracciones y Finanzas)
      case 'court-geometry':
      case 'huerta-fractions':
      case 'cash-discount':
      case 'logic-bridge': {
        // Cancha Isométrica con medidas oficiales 28x15
        const courtFloorGeo = new THREE.BoxGeometry(4.8, 0.2, 3.0);
        const courtFloorMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.3 });
        const court = new THREE.Mesh(courtFloorGeo, courtFloorMat);
        court.position.y = -0.8;
        modelGroup.add(court);

        // Líneas de cancha reglamentarias
        const lineGeo = new THREE.RingGeometry(0.7, 0.78, 32);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const centerCircle = new THREE.Mesh(lineGeo, lineMat);
        centerCircle.rotation.x = Math.PI / 2;
        centerCircle.position.y = -0.68;
        modelGroup.add(centerCircle);

        // Tablero y Aro de Baloncesto 3D
        const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8);
        const pole = new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
        pole.position.set(-2.1, 0.3, 0);
        modelGroup.add(pole);

        const hoopGeo = new THREE.TorusGeometry(0.24, 0.04, 8, 24);
        const hoop = new THREE.Mesh(hoopGeo, new THREE.MeshStandardMaterial({ color: 0xf97316 }));
        hoop.rotation.x = Math.PI / 2;
        hoop.position.set(-1.8, 1.2, 0);
        modelGroup.add(hoop);

        // Monedas de ahorro y cálculo financiero que orbitan
        const coinGroup = new THREE.Group();
        for (let c = 0; c < 4; c++) {
          const coinGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24);
          const coinMat = new THREE.MeshStandardMaterial({
            color: 0xfbbf24,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0xd97706,
            emissiveIntensity: 0.3
          });
          const coin = new THREE.Mesh(coinGeo, coinMat);
          coin.rotation.x = Math.PI / 2;
          coin.position.set(Math.cos(c * 1.5) * 1.5, 1.8 + c * 0.3, Math.sin(c * 1.5) * 1.5);
          coinGroup.add(coin);
        }
        modelGroup.add(coinGroup);

        animators.push((time) => {
          coinGroup.rotation.y = time * 0.7;
          coinGroup.children.forEach((c, idx) => {
            c.rotation.z = time * 2 + idx;
          });
        });
        break;
      }

      // 🌿 7. Ciencias Naturales (ADN y Célula Vegetal Fotosintética)
      case 'photosynthesis-leaf':
      case 'frailejon-water':
      case 'condor-birds':
      case 'whale-sonar': {
        // Hélice de ADN 3D animada
        const dnaGroup = new THREE.Group();
        const baseColors = [0x3b82f6, 0xef4444, 0x10b981, 0xf59e0b];
        for (let i = 0; i < 28; i++) {
          const angle = i * 0.35;
          const yPos = -2.2 + i * 0.16;

          // Esferas de los dos extremos
          const sphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
          const sphere1 = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
          sphere1.position.set(Math.cos(angle) * 1.1, yPos, Math.sin(angle) * 1.1);
          dnaGroup.add(sphere1);

          const sphere2 = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ color: 0xa855f7 }));
          sphere2.position.set(Math.cos(angle + Math.PI) * 1.1, yPos, Math.sin(angle + Math.PI) * 1.1);
          dnaGroup.add(sphere2);

          // Barra de unión entre bases nitrogenadas
          const barGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8);
          const barMat = new THREE.MeshStandardMaterial({ color: baseColors[i % 4], roughness: 0.3 });
          const bar = new THREE.Mesh(barGeo, barMat);
          bar.position.set(0, yPos, 0);
          bar.rotation.z = Math.PI / 2;
          bar.rotation.y = -angle;
          dnaGroup.add(bar);
        }
        modelGroup.add(dnaGroup);

        // Molécula de Cloroplasto brillante central
        const coreGeo = new THREE.IcosahedronGeometry(0.65, 2);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0x22c55e,
          wireframe: true,
          emissive: 0x15803d,
          emissiveIntensity: 0.6
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 0;
        modelGroup.add(core);

        animators.push((time) => {
          dnaGroup.rotation.y = time * 0.9;
          core.rotation.x = time * 0.6;
          core.rotation.y = time * 0.8;
        });
        break;
      }

      // 💻 8. Tecnología & Informática (Bóveda Ciberseguridad & Algoritmos)
      case 'algorithm-flow':
      case 'cyber-vault': {
        // Escudo Criptográfico Holográfico
        const shieldGeo = new THREE.CylinderGeometry(1.4, 0.4, 2.4, 6);
        const shieldMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          wireframe: true,
          emissive: 0x0891b2,
          emissiveIntensity: 0.8
        });
        const shield = new THREE.Mesh(shieldGeo, shieldMat);
        shield.position.y = 0.2;
        modelGroup.add(shield);

        // Núcleo binario seguro central
        const lockGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const lockMat = new THREE.MeshStandardMaterial({
          color: 0x6366f1,
          roughness: 0.2,
          metalness: 0.8,
          emissive: 0x4f46e5,
          emissiveIntensity: 0.4
        });
        const lock = new THREE.Mesh(lockGeo, lockMat);
        lock.position.y = 0.2;
        modelGroup.add(lock);

        // Anillos orbitales de cifrado AES-256
        const ringsGroup = new THREE.Group();
        for (let r = 0; r < 3; r++) {
          const ringGeo = new THREE.TorusGeometry(1.6 + r * 0.4, 0.05, 12, 48);
          const ringMat = new THREE.MeshStandardMaterial({
            color: r === 0 ? 0x38bdf8 : r === 1 ? 0x818cf8 : 0xec4899,
            emissive: 0x38bdf8,
            emissiveIntensity: 0.5
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = Math.PI / (2 + r);
          ring.rotation.y = r * 0.5;
          ringsGroup.add(ring);
        }
        modelGroup.add(ringsGroup);

        animators.push((time) => {
          shield.rotation.y = time * 0.5;
          lock.rotation.x = time * 0.8;
          lock.rotation.y = time * 0.9;
          ringsGroup.rotation.y = -time * 0.7;
          ringsGroup.children[0].rotation.z = time * 1.2;
          ringsGroup.children[1].rotation.x = time * 1.0;
        });
        break;
      }

      // 🇺🇸 9. Inglés (Vuelo Internacional & Brújula Bilingüe)
      case 'vancouver-flight':
      case 'healthy-routine': {
        // Avión Jet Comercial 3D
        const planeGroup = new THREE.Group();

        // Fuselaje
        const fuselageGeo = new THREE.CylinderGeometry(0.35, 0.35, 3.2, 16);
        const fuselageMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.3 });
        const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
        fuselage.rotation.x = Math.PI / 2;
        planeGroup.add(fuselage);

        // Alas delta
        const wingGeo = new THREE.BoxGeometry(4.2, 0.06, 1.2);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 });
        const wings = new THREE.Mesh(wingGeo, wingMat);
        wings.position.set(0, 0, 0.1);
        planeGroup.add(wings);

        // Cola vertical
        const tailGeo = new THREE.BoxGeometry(0.1, 0.9, 0.7);
        const tail = new THREE.Mesh(tailGeo, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        tail.position.set(0, 0.5, -1.2);
        planeGroup.add(tail);

        planeGroup.position.set(0, 0.6, 0);
        modelGroup.add(planeGroup);

        // Nubes tridimensionales esponjosas
        const cloudsGroup = new THREE.Group();
        for (let cl = 0; cl < 5; cl++) {
          const puffGeo = new THREE.SphereGeometry(0.6 + (cl % 2) * 0.2, 12, 12);
          const puffMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.75 });
          const puff = new THREE.Mesh(puffGeo, puffMat);
          puff.position.set((cl - 2) * 1.5, -1.2, (cl % 2) * 1.2);
          cloudsGroup.add(puff);
        }
        modelGroup.add(cloudsGroup);

        animators.push((time) => {
          planeGroup.position.y = 0.6 + Math.sin(time * 2) * 0.2;
          planeGroup.rotation.z = Math.sin(time * 1.5) * 0.12;
          planeGroup.rotation.x = Math.cos(time * 1.2) * 0.08;
          cloudsGroup.position.x = ((time * 0.8) % 4) - 2;
        });
        break;
      }

      // 🕊️ 10. Ética & Convivencia (Mesa de Mediación & Símbolo de Paz)
      case 'peace-mediation-table':
      case 'inclusion-ramp':
      default: {
        // Globo de Unidad Terrestre con Aureola Dorada
        const sphereGeo = new THREE.SphereGeometry(1.6, 32, 32);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.4,
          metalness: 0.2,
          emissive: 0x0369a1,
          emissiveIntensity: 0.25
        });
        const earthSphere = new THREE.Mesh(sphereGeo, sphereMat);
        modelGroup.add(earthSphere);

        // Anillos concéntricos de tolerancia y empatía
        const ringGeo = new THREE.TorusGeometry(2.3, 0.08, 16, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0xd97706,
          emissiveIntensity: 0.5
        });
        const peaceRing = new THREE.Mesh(ringGeo, ringMat);
        peaceRing.rotation.x = Math.PI / 3;
        modelGroup.add(peaceRing);

        const heartGeo = new THREE.DodecahedronGeometry(0.7, 1);
        const heartMat = new THREE.MeshStandardMaterial({
          color: 0xec4899,
          emissive: 0xdb2777,
          emissiveIntensity: 0.6
        });
        const heart = new THREE.Mesh(heartGeo, heartMat);
        heart.position.y = 0;
        modelGroup.add(heart);

        animators.push((time) => {
          earthSphere.rotation.y = time * 0.35;
          peaceRing.rotation.z = time * 0.5;
          heart.rotation.x = time * 0.6;
          heart.rotation.y = time * 0.7;
          heart.scale.setScalar(1 + Math.sin(time * 3) * 0.12); // Latido de corazón
        });
        break;
      }
    }

    // ========================================================
    // INTERACCIÓN MOUSE / TOUCH DRAG (ROTACIÓN 360 LIBRE)
    // ========================================================
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotY += deltaX * 0.008;
      targetRotX += deltaY * 0.008;
      targetRotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotX));
    };

    const onMouseUp = () => { isDragging = false; };

    // Soporte Touch para Celulares y Tablets
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      targetRotY += deltaX * 0.008;
      targetRotX += deltaY * 0.008;
    };

    const onTouchEnd = () => { isDragging = false; };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // ========================================================
    // BUCLE DE RENDERIZADO Y ANIMACIÓN
    // ========================================================
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Ejecutar animadores de este modelo
      animators.forEach(fn => fn(elapsedTime));

      // Partículas flotando suavemente
      particles.rotation.y = elapsedTime * 0.04;

      // Rotación suave del usuario o auto-rotación continua
      if (autoRotate && !isDragging) {
        targetRotY += 0.005;
      }

      modelGroup.rotation.y += (targetRotY - modelGroup.rotation.y) * 0.08;
      modelGroup.rotation.x += (targetRotX - modelGroup.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // Guardar referencia para control de zoom y reset
    sceneContextRef.current = {
      camera,
      renderer,
      modelGroup,
      resetView: () => {
        targetRotX = 0;
        targetRotY = 0;
        camera.position.set(0, 3, 10);
      },
      zoom: (delta) => {
        camera.position.z = Math.max(4, Math.min(18, camera.position.z + delta));
      }
    };

    // Redimensionar responsivo
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = isFullscreen ? window.innerHeight - 100 : height;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [modelType, height, isFullscreen]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-indigo-500/30 bg-slate-950/90 shadow-2xl transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : 'w-full'
    }`}>
      {/* 3D Stage Top Toolbar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        
        {/* Model Title & Subject Badge */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg pointer-events-auto flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <div className="text-left">
            <span className="text-xs sm:text-sm font-extrabold text-white block line-clamp-1">
              🎮 {title || 'Escenario 3D Interactivo'}
            </span>
            <span className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider block">
              {subject || 'Modelo WebGL en Vivo'}
            </span>
          </div>
        </div>

        {/* 3D Action Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg pointer-events-auto">
          {/* Toggle Auto-Rotate */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              autoRotate 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={autoRotate ? "Pausar rotación automática" : "Girar automáticamente"}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>

          {/* Zoom In */}
          <button
            onClick={() => sceneContextRef.current?.zoom(-1.5)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs"
            title="Acercar objeto 3D"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => sceneContextRef.current?.zoom(1.5)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs"
            title="Alejar objeto 3D"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={() => sceneContextRef.current?.resetView()}
            className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition text-xs"
            title="Centrar perspectiva"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition text-xs"
            title={isFullscreen ? "Restaurar tamaño" : "Pantalla completa 3D"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* WebGL Canvas Container */}
      <div 
        ref={mountRef} 
        style={{ height: isFullscreen ? 'calc(100vh - 120px)' : `${height}px` }}
        className="w-full cursor-grab active:cursor-grabbing flex-1 select-none"
      />

      {/* Interactive Bottom Touch Hint */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
        <span className="text-[11px] text-slate-400/90 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700/60 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          <span>Arrastra con el mouse o dedo para girar 360° en cualquier dirección</span>
        </span>
        <span className="hidden sm:inline-block text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
          ⚡ Three.js WebGL Activo
        </span>
      </div>
    </div>
  );
}
