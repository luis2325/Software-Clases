import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Hero3DGlobe: Esfera interactiva WebGL 3D para la página principal.
 * Representa el mundo del conocimiento escolar con anillos orbitales,
 * satélites de materias y partículas flotantes reactivas al cursor.
 */
export default function Hero3DGlobe({ height = 240 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 320;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 2.8);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 2.2);
    dirLight2.position.set(-5, -3, -3);
    scene.add(dirLight2);

    const coreLight = new THREE.PointLight(0xf59e0b, 3, 10);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // 3. Grupo Central
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Esfera Central de Neón / Globo terráqueo estilizado
    const globeGeo = new THREE.SphereGeometry(2.1, 32, 32);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      emissive: 0x312e81,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.7,
      wireframe: false
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    rootGroup.add(globe);

    // Malla alámbrica tecnológica sobre el globo
    const wireGeo = new THREE.SphereGeometry(2.14, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireSphere = new THREE.Mesh(wireGeo, wireMat);
    rootGroup.add(wireSphere);

    // 4. Anillos Orbitales Planetarios
    const ring1Geo = new THREE.TorusGeometry(3.1, 0.04, 16, 64);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.8
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    rootGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(3.5, 0.035, 16, 64);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.8
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 3.5;
    ring2.rotation.z = Math.PI / 4;
    rootGroup.add(ring2);

    // 5. Satélites flotantes de Materias (Esferitas en órbita)
    const satellites = [];
    const colors = [0xef4444, 0x10b981, 0x3b82f6, 0xf59e0b, 0xa855f7];
    for (let i = 0; i < 5; i++) {
      const satGeo = new THREE.DodecahedronGeometry(0.24);
      const satMat = new THREE.MeshStandardMaterial({
        color: colors[i],
        emissive: colors[i],
        emissiveIntensity: 0.7,
        roughness: 0.2
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      rootGroup.add(sat);
      satellites.push({
        mesh: sat,
        angle: (i * Math.PI * 2) / 5,
        speed: 0.7 + i * 0.15,
        radius: 3.1 + (i % 2) * 0.4
      });
    }

    // 6. Nube de Partículas Estelares
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount * 3; p++) {
      pos[p] = (Math.random() - 0.5) * 12;
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

    // 7. Parallax con el cursor del mouse
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 0.8;
      targetY = y * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Bucle de Animación
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Rotación suave del globo
      globe.rotation.y += delta * 0.25;
      wireSphere.rotation.y -= delta * 0.15;
      ring1.rotation.z += delta * 0.3;
      ring2.rotation.z -= delta * 0.25;

      // Órbita de los satélites
      satellites.forEach((sat) => {
        sat.angle += delta * sat.speed;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
        sat.mesh.position.z = Math.sin(sat.angle) * sat.radius;
        sat.mesh.position.y = Math.sin(sat.angle * 2 + elapsedTime) * 0.6;
        sat.mesh.rotation.x += delta * 1.5;
        sat.mesh.rotation.y += delta * 2;
      });

      // Efecto Parallax inercial
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      rootGroup.rotation.y = elapsedTime * 0.15 + mouseX;
      rootGroup.rotation.x = mouseY * 0.8;

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
      globeGeo.dispose();
      globeMat.dispose();
    };
  }, [height]);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none pointer-events-none">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}
