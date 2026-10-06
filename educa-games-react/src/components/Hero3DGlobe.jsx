import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Compass, RotateCw, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

/**
 * Hero3DGlobe: Réplica fotorrealista 3D del Planeta Tierra (NASA Blue Marble)
 * - Texturas satelitales oficiales de alta resolución de la NASA (continentes, océanos, nubes)
 * - Mapeo especular de océanos (reflejo de luz solar en el agua) y relieve normal 3D
 * - Capa dinámica de nubes con rotación atmosférica independiente
 * - Resplandor atmosférico sutil en el borde (efecto Fresnel espacial)
 * - Orientación inicial con América del Norte y del Sur al frente
 * - Control interactivo 360° con ratón y pantalla táctil
 */
export default function Hero3DGlobe({ height = 300 }) {
  const mountRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const globeControlsRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Escena, Cámara y Renderizador WebGL
    const scene = new THREE.Scene();
    const width = container.clientWidth || 340;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. Iluminación Espacial Fotorrealista (Sol en ángulo superior izquierdo)
    // Luz ambiental suave para no oscurecer del todo el lado nocturno
    const ambientLight = new THREE.AmbientLight(0x223344, 0.35);
    scene.add(ambientLight);

    // Sol directo como en la foto de la NASA
    const sunLight = new THREE.DirectionalLight(0xffffff, 3.2);
    sunLight.position.set(-6, 4, 6.5);
    scene.add(sunLight);

    // Luz de contorno celeste para la atmósfera en el limbo
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(5, -2, -3);
    scene.add(rimLight);

    // 3. Grupo Raíz Planetario con Inclinación Axial Terrestre (-23.4°)
    const rootGroup = new THREE.Group();
    rootGroup.rotation.z = THREE.MathUtils.degToRad(-15);
    scene.add(rootGroup);

    // 4. Carga de Texturas Satelitales de la NASA
    const textureLoader = new THREE.TextureLoader();
    const earthDayMap = textureLoader.load('/textures/earth_daymap.jpg');
    const earthCloudsMap = textureLoader.load('/textures/earth_clouds.png');
    const earthSpecularMap = textureLoader.load('/textures/earth_specular.jpg');
    const earthNormalMap = textureLoader.load('/textures/earth_normal.jpg');

    // 5. Esfera de la Tierra Fotorrealista
    const planetRadius = 2.25;
    const planetGeo = new THREE.SphereGeometry(planetRadius, 64, 64);
    const planetMat = new THREE.MeshPhongMaterial({
      map: earthDayMap,
      specularMap: earthSpecularMap,
      normalMap: earthNormalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      specular: new THREE.Color(0x223344),
      shininess: 18
    });
    const earthMesh = new THREE.Mesh(planetGeo, planetMat);
    
    // Rotar para mostrar las Américas al frente (igual a la foto de referencia)
    earthMesh.rotation.y = THREE.MathUtils.degToRad(-105);
    rootGroup.add(earthMesh);

    // 6. Capa de Nubes Dinámicas en Rotación
    const cloudsGeo = new THREE.SphereGeometry(planetRadius + 0.028, 64, 64);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: earthCloudsMap,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    cloudsMesh.rotation.y = THREE.MathUtils.degToRad(-105);
    rootGroup.add(cloudsMesh);

    // 7. Halo Atmosférico Exterior Fotorrealista (Atmospheric Limb Glow)
    const glowGeo = new THREE.SphereGeometry(planetRadius + 0.065, 64, 64);
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(0.35, 0.65, 1.0, 1.0) * intensity * 1.6;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    rootGroup.add(glowMesh);

    // 8. Campo de Estrellas en el Espacio Profundo (Fondo Negro con Estrellas Tenues)
    const starCount = 200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let p = 0; p < starCount * 3; p += 3) {
      starPos[p] = (Math.random() - 0.5) * 20;
      starPos[p + 1] = (Math.random() - 0.5) * 20;
      starPos[p + 2] = -5 - Math.random() * 8; // Ubicadas detrás del planeta
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.045,
      color: 0xffffff,
      transparent: true,
      opacity: 0.75
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 9. CONTROLES DE ROTACIÓN INTERACTIVA 360° (MOUSE / TOUCH)
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

      rotY += deltaX * 0.007;
      rotX += deltaY * 0.007;

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
        camera.position.z = THREE.MathUtils.clamp(camera.position.z + delta, 4.2, 9.5);
      },
      reset: () => {
        camera.position.set(0, 0, 6.6);
        rotX = 0;
        rotY = 0;
        rootGroup.rotation.set(0, 0, THREE.MathUtils.degToRad(-15));
        earthMesh.rotation.y = THREE.MathUtils.degToRad(-105);
        cloudsMesh.rotation.y = THREE.MathUtils.degToRad(-105);
      }
    };

    // 10. Bucle de Animación Continuo
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Rotación suave del planeta sobre su propio eje
      if (autoRotate && !isDragging) {
        earthMesh.rotation.y += delta * 0.18;
      }

      // Nubes rotan a velocidad independiente simulando corrientes atmosféricas
      cloudsMesh.rotation.y += delta * 0.24;

      // Inclinación y rotación interactiva con arrastre
      rootGroup.rotation.y += (rotY - rootGroup.rotation.y) * 0.1;
      rootGroup.rotation.x += (rotX - rootGroup.rotation.x) * 0.1;

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
      glowGeo.dispose();
      glowMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      earthDayMap.dispose();
      earthCloudsMap.dispose();
      earthSpecularMap.dispose();
      earthNormalMap.dispose();
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
          onClick={() => globeControlsRef.current?.zoom(-1.0)}
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs"
          title="Acercar la Tierra (+)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => globeControlsRef.current?.zoom(1.0)}
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs"
          title="Alejar la Tierra (-)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => globeControlsRef.current?.reset()}
          className="p-1 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition text-xs"
          title="Centrar posición (Américas)"
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
