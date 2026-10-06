import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import L from 'leaflet';
import { 
  ArrowLeft, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Trophy, 
  Ticket, 
  ExternalLink, 
  Lightbulb, 
  BookOpen, 
  Atom, 
  RotateCcw,
  Volume2,
  VolumeX,
  Type,
  MapPin,
  Sparkles,
  HelpCircle,
  Flame,
  Clock,
  Scissors,
  Pause,
  Play,
  Layers,
  Award,
  Coffee,
  Check,
  Zap,
  Medal,
  ListOrdered,
  Box,
  Globe,
  Maximize2,
  Minimize2,
  Compass
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import naturalSpeech from '../utils/naturalSpeech';
import voiceBus from '../utils/voiceCommandBus';
import InteractiveVisualStage from './InteractiveVisualStage';

export default function GameRunner({ 
  game, 
  student, 
  onExit, 
  onSaveScore, 
  onClaimVoucher, 
  availablePoints,
  allScores = []
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState(null);
  const [resultsTab, setResultsTab] = useState('podium'); // 'podium' | 'answers' | 'voucher'

  // Gamification: Streaks & Combos
  const [streak, setStreak] = useState(0);
  const [lastBonus, setLastBonus] = useState(0);

  // Lifelines (Comodines)
  const [lifeline5050Used, setLifeline5050Used] = useState(false);
  const [lifelineHintUsed, setLifelineHintUsed] = useState(false);
  const [lifelineTimeUsed, setLifelineTimeUsed] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [showHintModal, setShowHintModal] = useState(false);

  // Countdown Timer: Honoring game settings (if game.timerSeconds === 0, timer is disabled!)
  const hasTimer = game.timerSeconds !== 0;
  const TIMER_SECONDS = game.timerSeconds || 35;
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(hasTimer);

  // Map layer: 'satellite' (Planet Earth HD Google Hybrid), 'earth_hd' (NASA/Esri pure Earth), 'terrain', 'streets'
  const [mapLayer, setMapLayer] = useState('satellite');
  const [mapViewMode, setMapViewMode] = useState('map'); // 'map' | 'photo'
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isFlying, setIsFlying] = useState(false);

  // Accessibility & Reading preferences (BAP) & Natural Speech
  const [fontSize, setFontSize] = useState('text-sm'); // 'text-xs', 'text-sm', 'text-base'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoiceConfig, setShowVoiceConfig] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.95);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState('');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const feedbackCardRef = useRef(null);

  const [answersHistory, setAnswersHistory] = useState([]);

  // Dynamically shuffle options so correct answer is randomly A, B, C, or D (never always A!)
  const [shuffledItems] = useState(() => {
    const raw = game.questions || [];
    return raw.map(q => {
      const indexed = (q.options || []).map((opt, idx) => ({
        text: opt,
        isCorrect: idx === q.answer
      }));
      // Fisher-Yates shuffle
      for (let i = indexed.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
      }
      const newOptions = indexed.map(o => o.text);
      const newAnswer = indexed.findIndex(o => o.isCorrect);
      return {
        ...q,
        options: newOptions,
        answer: newAnswer >= 0 ? newAnswer : 0
      };
    });
  });

  const totalSteps = shuffledItems.length;
  const currentItem = shuffledItems[currentStep] || {};

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      naturalSpeech.stop();
    };
  }, []);

  // Initialize available human voices and select the best one
  useEffect(() => {
    const loadVoices = () => {
      const voices = naturalSpeech.getVoices();
      setAvailableVoices(voices);
      const isEnglish = game.category === 'ingles';
      const best = naturalSpeech.findBestVoice(isEnglish ? 'en-US' : 'es-CO');
      if (best) {
        setSelectedVoiceUri(best.voiceURI || best.name);
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [game.category]);

  // Countdown Timer Interval
  useEffect(() => {
    if (isAnswered || gameFinished || !timerActive) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 6 && prev > 1) {
          soundFx.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, gameFinished, timerActive]);

  // Handle Timeout
  const handleTimeout = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(-1); // -1 indicates timeout
    setStreak(0);
    setLastBonus(0);
    soundFx.playIncorrect();

    const answerRecord = {
      step: currentStep + 1,
      question: currentItem.question,
      storyTitle: currentItem.storyTitle || currentItem.placeName,
      placeName: currentItem.placeName,
      selectedOption: 'Tiempo Agotado (Sin responder)',
      selectedLetter: '⏰',
      correctOption: currentItem.options[currentItem.answer],
      correctLetter: String.fromCharCode(65 + currentItem.answer),
      isCorrect: false,
      pointsEarned: 0,
      level: currentItem.level || 'Comprensión Lectora'
    };
    setAnswersHistory(prev => [...prev, answerRecord]);
  };

  const hasCoordinates = Boolean(currentItem?.lat && currentItem?.lng);
  const showMap = game.type === 'map' || hasCoordinates;

  // Unified Leaflet Map Controller
  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;

    const lat = currentItem?.lat || 4.5709;
    const lng = currentItem?.lng || -74.2973;
    const zoom = currentItem?.zoom || 14;

    let map = mapInstanceRef.current;

    const getMapTileConfig = (layer) => {
      switch (layer) {
        case 'earth_hd':
          return {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            options: {
              maxZoom: 19,
              attribution: '© Esri • NASA Earth Observations'
            }
          };
        case 'terrain':
          return {
            url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
            options: {
              subdomains: ['0', '1', '2', '3'],
              maxZoom: 20,
              attribution: '© Google Terreno'
            }
          };
        case 'streets':
          return {
            url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            options: {
              subdomains: ['0', '1', '2', '3'],
              maxZoom: 20,
              attribution: '© Google Maps'
            }
          };
        case 'satellite':
        default:
          return {
            url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
            options: {
              subdomains: ['0', '1', '2', '3'],
              maxZoom: 20,
              attribution: '© Google Earth Satélite HD'
            }
          };
      }
    };

    try {
      // 1. Initialize Map if not present
      if (!map) {
        if (mapContainerRef.current._leaflet_id) {
          delete mapContainerRef.current._leaflet_id;
        }

        map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([lat, lng], Math.max(3, zoom - 5)); // Vista inicial espacial

        const tileCfg = getMapTileConfig(mapLayer);
        tileLayerRef.current = L.tileLayer(tileCfg.url, tileCfg.options).addTo(map);
        mapInstanceRef.current = map;

        // Vuelo cinematográfico descendiendo desde el espacio
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 2.2, easeLinearity: 0.25 });
          }
        }, 120);
      } else {
        // Vuelo suave hacia el nuevo destino
        map.flyTo([lat, lng], zoom, { duration: 1.8, easeLinearity: 0.25 });
      }

      // Force recalculation of container size after render
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      // 2. Marcador Satelital 3D con Baliza de Radar Concéntrico
      if (markerRef.current && map) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }

      const googlePinHtml = `
        <div style="position:relative; width:52px; height:52px; display:flex; align-items:center; justify-content:center;">
          <!-- Ondas de radar satelital concéntricas en tiempo real -->
          <div class="radar-wave-1" style="position:absolute; width:48px; height:48px; border-radius:50%; background:rgba(6,182,212,0.4); border:2px solid #06b6d4; top:2px; left:2px; pointer-events:none;"></div>
          <div class="radar-wave-2" style="position:absolute; width:48px; height:48px; border-radius:50%; background:rgba(16,185,129,0.35); border:2px solid #10b981; top:2px; left:2px; pointer-events:none;"></div>
          
          <!-- Baliza GPS 3D con sombra flotante -->
          <div style="position:relative; z-index:2; filter: drop-shadow(0 8px 14px rgba(0,0,0,0.65)); transform: translateY(-4px);">
            <svg width="34" height="46" viewBox="0 0 34 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 0C7.61 0 0 7.61 0 17C0 29.75 17 46 17 46C17 46 34 29.75 34 17C34 7.61 26.39 0 17 0Z" fill="#EA4335"/>
              <path d="M17 2C8.71 2 2 8.71 2 17C2 28.5 17 43.5 17 43.5C17 43.5 32 28.5 32 17C32 8.71 25.29 2 17 2Z" fill="#FF5252"/>
              <circle cx="17" cy="17" r="8" fill="#B31412"/>
              <circle cx="17" cy="17" r="6" fill="#FFFFFF"/>
            </svg>
          </div>
        </div>
      `;

      const googleIcon = L.divIcon({
        className: 'google-maps-pin',
        html: googlePinHtml,
        iconSize: [52, 52],
        iconAnchor: [26, 46],
        popupAnchor: [0, -46]
      });

      const placeTitle = currentItem.placeName || 'Ubicación Geográfica';
      const regionTitle = currentItem.region || currentItem.country || 'Colombia';
      const placeImg = currentItem.image;

      const popupContent = `
        <div style="font-family:system-ui, -apple-system, sans-serif; padding:4px; min-width:210px; max-width:240px; text-align:left;">
          ${placeImg ? `
            <div style="position:relative; width:100%; height:110px; border-radius:10px; overflow:hidden; margin-bottom:8px; box-shadow:0 2px 6px rgba(0,0,0,0.15);">
              <img src="${placeImg}" alt="${placeTitle}" style="width:100%; height:100%; object-fit:cover; display:block;" />
              <div style="position:absolute; bottom:4px; right:4px; background:rgba(0,0,0,0.75); color:#fff; font-size:9px; padding:2px 6px; border-radius:4px; font-weight:bold;">
                📸 Foto del Sitio
              </div>
            </div>
          ` : ''}
          <div style="display:flex; align-items:flex-start; gap:6px; margin-bottom:3px;">
            <span style="font-size:16px; line-height:1;">📍</span>
            <div>
              <strong style="font-size:13px; font-weight:800; color:#0f172a; line-height:1.2; display:block;">${placeTitle}</strong>
              <span style="font-size:11px; color:#64748b; font-weight:600; display:block; margin-top:2px;">${regionTitle}</span>
            </div>
          </div>
          <div style="margin-top:6px; padding-top:6px; border-top:1px solid #f1f5f9; display:flex; align-items:center; justify-content:space-between; gap:6px;">
            <span style="font-size:10px; background:#eff6ff; color:#1d4ed8; padding:2px 7px; border-radius:6px; font-weight:700; border:1px solid #bfdbfe;">
              🛰️ ${lat.toFixed(4)}, ${lng.toFixed(4)}
            </span>
            <span style="font-size:10px; background:#f0fdf4; color:#15803d; padding:2px 6px; border-radius:6px; font-weight:700; border:1px solid #bbf7d0;">
              ⭐ Destino
            </span>
          </div>
        </div>
      `;

      markerRef.current = L.marker([lat, lng], { icon: googleIcon })
        .addTo(map)
        .bindPopup(popupContent, { autoClose: false, closeOnClick: false })
        .openPopup();

    } catch (err) {
      console.error('Error rendering Leaflet map:', err);
    }
  }, [currentStep, currentItem, showMap, isAnswered, mapLayer]);

  // Cambiar capa satelital o topográfica
  const toggleMapLayer = (layerType) => {
    setMapLayer(layerType);
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      
      const getMapTileConfig = (layer) => {
        switch (layer) {
          case 'earth_hd':
            return {
              url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
              options: { maxZoom: 19, attribution: '© Esri • NASA Earth' }
            };
          case 'terrain':
            return {
              url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
              options: { subdomains: ['0', '1', '2', '3'], maxZoom: 20, attribution: '© Google Terreno' }
            };
          case 'streets':
            return {
              url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
              options: { subdomains: ['0', '1', '2', '3'], maxZoom: 20, attribution: '© Google Maps' }
            };
          case 'satellite':
          default:
            return {
              url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
              options: { subdomains: ['0', '1', '2', '3'], maxZoom: 20, attribution: '© Google Earth Satélite HD' }
            };
        }
      };

      const newCfg = getMapTileConfig(layerType);
      tileLayerRef.current = L.tileLayer(newCfg.url, newCfg.options).addTo(mapInstanceRef.current);
    }
  };

  // Text-To-Speech Natural y Humano (Inglés Nativo & Español Cálido)
  const toggleSpeech = () => {
    if (isSpeaking) {
      naturalSpeech.stop();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${currentItem.storyTitle || ''}. ${currentItem.storyText || ''}. Pregunta: ${currentItem.question || ''}`;
    
    // Assign specific chosen voice if selected
    if (selectedVoiceUri && availableVoices.length > 0) {
      const chosen = availableVoices.find(v => (v.voiceURI || v.name) === selectedVoiceUri);
      if (chosen) naturalSpeech.selectedVoice = chosen;
    }

    const started = naturalSpeech.speak({
      text: textToRead,
      category: game.category,
      subject: game.subject,
      customRate: speechRate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: (err) => {
        console.warn('Speech error:', err);
        setIsSpeaking(false);
      }
    });

    if (!started) {
      setFeedbackToast('Voz no disponible en este dispositivo');
      setTimeout(() => setFeedbackToast(null), 2500);
    }
  };

  // Test Natural Voice sample
  const handleTestVoice = () => {
    naturalSpeech.stop();
    const isEnglish = game.category === 'ingles';
    const sampleText = isEnglish 
      ? 'Hello students! English pronunciation is natural, clear, and friendly. Good luck on your reading challenge!'
      : '¡Hola estudiantes! Esta es la voz humana pedagógica del aula interactiva. ¡Mucho éxito en tu reto!';

    if (selectedVoiceUri && availableVoices.length > 0) {
      const chosen = availableVoices.find(v => (v.voiceURI || v.name) === selectedVoiceUri);
      if (chosen) naturalSpeech.selectedVoice = chosen;
    }

    naturalSpeech.speak({
      text: sampleText,
      category: game.category,
      subject: game.subject,
      customRate: speechRate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false)
    });
  };

  // Lifeline: 50/50
  const handleUse5050 = () => {
    if (lifeline5050Used || isAnswered) return;
    setLifeline5050Used(true);
    soundFx.playLifeline();

    const correctAnswer = currentItem.answer;
    const incorrectIndices = currentItem.options
      .map((_, idx) => idx)
      .filter(idx => idx !== correctAnswer);

    // Shuffle and pick 2 to eliminate
    const shuffled = [...incorrectIndices].sort(() => 0.5 - Math.random());
    const toEliminate = shuffled.slice(0, 2);
    setEliminatedOptions(toEliminate);
  };

  // Lifeline: Pista del Sabio
  const handleUseHint = () => {
    if (lifelineHintUsed || isAnswered) return;
    setLifelineHintUsed(true);
    soundFx.playLifeline();
    setShowHintModal(true);
  };

  // Lifeline: Extra Time (+15s)
  const handleUseTimeLifeline = () => {
    if (lifelineTimeUsed || isAnswered) return;
    setLifelineTimeUsed(true);
    setTimeLeft(prev => prev + 15);
    soundFx.playLifeline();
    setFeedbackToast('⏳ +15s Tiempo Extra Agregado');
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  // Map Controls & Cinematic Orbital Flights
  const handleMapZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };
  const handleMapZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };
  const handleMapCenter = () => {
    if (mapInstanceRef.current && currentItem) {
      mapInstanceRef.current.flyTo(
        [currentItem.lat || 4.5709, currentItem.lng || -74.2973], 
        currentItem.zoom || 14, 
        { duration: 1.4, easeLinearity: 0.25 }
      );
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  // Vuelo supersónico desde la órbita espacial del Planeta Tierra hacia el destino
  const handleFlyFromOrbit = () => {
    if (!mapInstanceRef.current || !currentItem) return;
    setIsFlying(true);
    const targetLat = currentItem.lat || 4.5709;
    const targetLng = currentItem.lng || -74.2973;
    const targetZoom = currentItem.zoom || 14;

    // 1. Aleja la cámara al espacio exterior (zoom 3 para ver todo el planeta Tierra y el continente)
    mapInstanceRef.current.setView([targetLat, targetLng], 3);
    soundFx.playCoin();

    // 2. Desciende en vuelo supersónico suave hacia la Tierra
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([targetLat, targetLng], targetZoom, {
          duration: 3.2,
          easeLinearity: 0.2
        });
      }
      setTimeout(() => {
        setIsFlying(false);
        if (markerRef.current) markerRef.current.openPopup();
      }, 3400);
    }, 250);
  };

  // Ver Planeta Tierra completo desde el espacio exterior (Órbita)
  const handleMapOrbitView = () => {
    if (!mapInstanceRef.current || !currentItem) return;
    const targetLat = currentItem.lat || 4.5709;
    const targetLng = currentItem.lng || -74.2973;
    mapInstanceRef.current.flyTo([targetLat, targetLng], 3, {
      duration: 2.0,
      easeLinearity: 0.25
    });
  };

  // Expandir o reducir tamaño del mapa para proyección
  const toggleMapExpand = () => {
    setIsMapExpanded(prev => !prev);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 180);
  };

  // Ensure Leaflet recalculates dimensions when toggling back from photo view
  useEffect(() => {
    if (mapViewMode === 'map' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      }, 120);
    }
  }, [mapViewMode, currentStep]);

  // Auto-scroll to feedback card when answered
  useEffect(() => {
    if (isAnswered && feedbackCardRef.current) {
      setTimeout(() => {
        feedbackCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [isAnswered]);

  // Keyboard navigation: 1, 2, 3, 4 / A, B, C, D to answer, Enter to advance
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameFinished) return;

      if (isAnswered) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNextStep();
        }
        return;
      }

      const keyMap = {
        '1': 0, 'a': 0, 'A': 0,
        '2': 1, 'b': 1, 'B': 1,
        '3': 2, 'c': 2, 'C': 2,
        '4': 3, 'd': 3, 'D': 3,
      };

      if (e.key in keyMap) {
        const optIdx = keyMap[e.key];
        if (currentItem?.options && optIdx < currentItem.options.length) {
          handleSelectOption(optIdx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, gameFinished, currentStep, currentItem, eliminatedOptions]);

  // Answer selection
  const handleSelectOption = (index) => {
    if (isAnswered || eliminatedOptions.includes(index)) return;
    if (isSpeaking) {
      naturalSpeech.stop();
      setIsSpeaking(false);
    }

    setSelectedAnswer(index);
    setIsAnswered(true);

    const isCorrect = index === currentItem.answer;
    let bonus = 0;
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);

      // Streak combo bonus calculation
      if (newStreak >= 3) bonus = 10;
      else if (newStreak >= 2) bonus = 5;
      setLastBonus(bonus);

      const pointsEarned = (game.pointsPerSuccess || 20) + bonus;
      setSessionScore(prev => prev + pointsEarned);
      setCorrectCount(prev => prev + 1);

      if (newStreak >= 2) {
        soundFx.playStreak();
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
      } else {
        soundFx.playCorrect();
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
      }
    } else {
      setStreak(0);
      setLastBonus(0);
      soundFx.playIncorrect();
    }

    // Record question details and whether answer was correct
    const answerRecord = {
      step: currentStep + 1,
      question: currentItem.question,
      storyTitle: currentItem.storyTitle || currentItem.placeName,
      placeName: currentItem.placeName,
      selectedOption: currentItem.options[index],
      selectedLetter: String.fromCharCode(65 + index),
      correctOption: currentItem.options[currentItem.answer],
      correctLetter: String.fromCharCode(65 + currentItem.answer),
      isCorrect,
      pointsEarned: isCorrect ? ((game.pointsPerSuccess || 20) + bonus) : 0,
      level: currentItem.level || 'Comprensión Lectora'
    };

    setAnswersHistory(prev => [...prev, answerRecord]);
  };

  const handleNextStep = () => {
    if (isSpeaking) {
      naturalSpeech.stop();
      setIsSpeaking(false);
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setEliminatedOptions([]);
      setTimeLeft(TIMER_SECONDS);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setGameFinished(true);
    soundFx.playVictory();
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });

    const resolvedStudentName = (student?.name && student.name.trim())
      ? student.name.trim()
      : (localStorage.getItem('aprende_student_name') || 'Estudiante en Aula');

    const resolvedGrade = student?.grade || localStorage.getItem('aprende_student_grade') || '8°';

    onSaveScore({
      id: 'score_' + Date.now(),
      studentName: resolvedStudentName,
      grade: resolvedGrade,
      gameId: game.id,
      gameTitle: game.title,
      score: sessionScore,
      maxScore: totalSteps * (game.pointsPerSuccess || 20),
      correctAnswers: correctCount,
      totalQuestions: totalSteps,
      percentage: Math.round((correctCount / totalSteps) * 100),
      answersHistory: answersHistory,
      submittedAt: new Date().toISOString()
    });
  };

  const handleClaim = () => {
    const voucher = onClaimVoucher();
    setGeneratedVoucher(voucher);
    soundFx.playCoin();
    confetti({ particleCount: 150, spread: 100 });
  };

  // In-Game Voice Commands Listener (Voice Control for Teachers)
  useEffect(() => {
    const unsubNext = voiceBus.on('NEXT_QUESTION', () => {
      handleNextStep();
    });

    const unsubPrev = voiceBus.on('PREV_QUESTION', () => {
      if (currentStep > 0) {
        if (isSpeaking) {
          naturalSpeech.stop();
          setIsSpeaking(false);
        }
        setCurrentStep(prev => prev - 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setEliminatedOptions([]);
        setTimeLeft(TIMER_SECONDS);
      }
    });

    const unsubRead = voiceBus.on('READ_QUESTION', () => {
      if (!isSpeaking) {
        toggleSpeech();
      }
    });

    const unsubStopSpeech = voiceBus.on('STOP_SPEECH', () => {
      naturalSpeech.stop();
      setIsSpeaking(false);
    });

    const unsubPauseTimer = voiceBus.on('PAUSE_TIMER', () => {
      setTimerActive(false);
      setFeedbackToast('⏱️ Cronómetro pausado por voz');
      setTimeout(() => setFeedbackToast(null), 3000);
    });

    const unsubResumeTimer = voiceBus.on('RESUME_TIMER', () => {
      setTimerActive(true);
      setFeedbackToast('⏱️ Cronómetro reanudado');
      setTimeout(() => setFeedbackToast(null), 2500);
    });

    const unsubAddTime = voiceBus.on('ADD_TIME', () => {
      setTimeLeft(prev => prev + 30);
      setFeedbackToast('⏱️ +30 segundos agregados por voz');
      setTimeout(() => setFeedbackToast(null), 2500);
    });

    const unsubShowPhoto = voiceBus.on('SHOW_PHOTO', () => {
      setMapViewMode('photo');
    });

    const unsubShowMap = voiceBus.on('SHOW_MAP', () => {
      setMapViewMode('map');
    });

    const unsubFullscreen = voiceBus.on('FULLSCREEN', () => {
      setIsMapExpanded(prev => !prev);
    });

    return () => {
      unsubNext();
      unsubPrev();
      unsubRead();
      unsubStopSpeech();
      unsubPauseTimer();
      unsubResumeTimer();
      unsubAddTime();
      unsubShowPhoto();
      unsubShowMap();
      unsubFullscreen();
    };
  }, [currentStep, totalSteps, isSpeaking, isAnswered, TIMER_SECONDS]);

  const progressPct = Math.round(((currentStep + (isAnswered ? 1 : 0)) / totalSteps) * 100);
  const timerPct = Math.round((timeLeft / TIMER_SECONDS) * 100);

  // Timer Color indicator
  const getTimerColor = () => {
    if (timeLeft > 15) return 'bg-emerald-500';
    if (timeLeft > 6) return 'bg-amber-400';
    return 'bg-rose-500 animate-pulse';
  };

  // Kahoot color themes for options with 3D tactile bottom bevel
  const optionThemes = [
    { bg: 'bg-rose-500/15 border-rose-500/40 border-b-rose-600/80 text-rose-300 hover:bg-rose-500/25', iconBg: 'bg-rose-500 text-white shadow-md', shape: '▲' },
    { bg: 'bg-blue-500/15 border-blue-500/40 border-b-blue-600/80 text-blue-300 hover:bg-blue-500/25', iconBg: 'bg-blue-500 text-white shadow-md', shape: '◆' },
    { bg: 'bg-amber-500/15 border-amber-500/40 border-b-amber-600/80 text-amber-300 hover:bg-amber-500/25', iconBg: 'bg-amber-500 text-white shadow-md', shape: '●' },
    { bg: 'bg-emerald-500/15 border-emerald-500/40 border-b-emerald-600/80 text-emerald-300 hover:bg-emerald-500/25', iconBg: 'bg-emerald-500 text-white shadow-md', shape: '■' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-pop-in">

      {/* Top Header Controls */}
      <div className="flex items-center justify-between glass-panel p-3 sm:p-4 rounded-2xl border border-slate-800">
        
        {/* Left: Exit & Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (isSpeaking) naturalSpeech.stop();
              onExit();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{game.title}</h2>
            <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block">
              Reto {currentStep + 1} de {totalSteps}
            </span>
          </div>
        </div>

        {/* Center: Streak Counter (If any) */}
        {streak >= 2 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-amber-300 text-xs font-black animate-flame">
            <Flame className="w-4 h-4 text-orange-400 fill-current" />
            <span>¡RACHA x{streak}! (+{lastBonus || (streak >= 3 ? 10 : 5)} pts)</span>
          </div>
        )}

        {/* Right: Accessibility Toolbar & Score */}
        <div className="flex items-center gap-2">
          
          {/* Natural Human TTS Audio Narration with Settings Dropdown */}
          <div className="relative">
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-full p-0.5 shadow-sm">
              <button
                onClick={toggleSpeech}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                  isSpeaking 
                    ? 'bg-rose-500 text-white animate-pulse shadow-md'
                    : 'text-indigo-300 hover:text-white hover:bg-slate-800'
                }`}
                title={isSpeaking ? "Pausar narración" : "Escuchar narración con pronunciación natural"}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-white" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
                <span className="hidden sm:inline">
                  {isSpeaking ? 'Pausar' : (game.category === 'ingles' ? '🎙️ English Audio' : '🎙️ Voz Humana')}
                </span>
              </button>

              <button
                onClick={() => setShowVoiceConfig(!showVoiceConfig)}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-full transition text-[11px]"
                title="Ajustar acento, velocidad y tipo de voz humana"
              >
                ⚙️
              </button>
            </div>

            {/* Voice Settings Popover */}
            {showVoiceConfig && (
              <div className="absolute right-0 top-10 mt-1 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl z-50 animate-pop-in space-y-3 text-xs text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{game.category === 'ingles' ? '🇺🇸' : '🎙️'}</span>
                    <strong className="text-xs font-bold text-slate-100">
                      {game.category === 'ingles' ? 'Acento de Inglés Natural' : 'Voz Humana Pedagógica'}
                    </strong>
                  </div>
                  <button 
                    onClick={() => setShowVoiceConfig(false)}
                    className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded-lg hover:bg-slate-800"
                  >
                    ✕
                  </button>
                </div>

                {/* Language Info */}
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Idioma activo:</span>
                  <span className="font-bold text-indigo-300">
                    {game.category === 'ingles' ? '🇺🇸 Inglés (US/UK Nativo)' : '🇨🇴 Español (Latinoamérica)'}
                  </span>
                </div>

                {/* Speed Presets */}
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-semibold block text-[11px]">Velocidad de Lectura:</span>
                  <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setSpeechRate(0.85)}
                      className={`py-1 rounded-lg font-bold text-[11px] transition ${
                        speechRate === 0.85 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Pausada (0.85x)
                    </button>
                    <button
                      onClick={() => setSpeechRate(0.95)}
                      className={`py-1 rounded-lg font-bold text-[11px] transition ${
                        speechRate === 0.95 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Natural (0.95x)
                    </button>
                    <button
                      onClick={() => setSpeechRate(1.10)}
                      className={`py-1 rounded-lg font-bold text-[11px] transition ${
                        speechRate === 1.10 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Fluida (1.1x)
                    </button>
                  </div>
                </div>

                {/* Available Voices Dropdown (If browser provides multiple) */}
                {availableVoices.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-slate-400 font-semibold block text-[11px]">Voz del Sistema:</span>
                    <select
                      value={selectedVoiceUri}
                      onChange={(e) => setSelectedVoiceUri(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {availableVoices
                        .filter(v => {
                          const isEnglish = game.category === 'ingles';
                          const prefix = isEnglish ? 'en' : 'es';
                          return v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(prefix);
                        })
                        .map(v => (
                          <option key={v.voiceURI || v.name} value={v.voiceURI || v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))
                      }
                      {/* Fallback option if filtered is empty */}
                      <option value="">Voz Óptima Automática (Recomendada)</option>
                    </select>
                  </div>
                )}

                {/* Test Voice Sample Button */}
                <div className="pt-1">
                  <button
                    onClick={handleTestVoice}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold py-1.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>🔊</span>
                    <span>Probar Pronunciación Natural</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 italic text-center">
                  ✨ Filtramos voces mecánicas para garantizar una pronunciación cálida, clara y humana.
                </p>
              </div>
            )}
          </div>

          {/* Font Size controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-full px-2 py-0.5 text-xs">
            <button 
              onClick={() => setFontSize('text-xs')}
              className={`px-1.5 py-0.5 rounded text-[11px] ${fontSize === 'text-xs' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
            >
              A-
            </button>
            <button 
              onClick={() => setFontSize('text-sm')}
              className={`px-1.5 py-0.5 rounded text-[11px] ${fontSize === 'text-sm' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
            >
              A
            </button>
            <button 
              onClick={() => setFontSize('text-base')}
              className={`px-1.5 py-0.5 rounded text-[11px] ${fontSize === 'text-base' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
            >
              A+
            </button>
          </div>

          {/* Score Counter */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-black text-amber-300 text-xs sm:text-sm">+{sessionScore}</span>
            <span className="text-[10px] text-amber-400/80">pts</span>
          </div>
        </div>

      </div>

      {/* Progress & Dynamic Timer Bars */}
      <div className="space-y-2">
        {/* Game Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 h-2 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Step Indicator Nodes (Súper Intuitivo) */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-0.5 scrollbar-none">
          {Array.from({ length: totalSteps }).map((_, sIdx) => {
            const isPast = sIdx < currentStep;
            const isCurrent = sIdx === currentStep;
            const pastAnswer = answersHistory[sIdx];
            const isPastCorrect = pastAnswer?.isCorrect;

            let nodeStyle = 'bg-slate-900/60 text-slate-500 border-slate-800';
            let label = `${sIdx + 1}`;

            if (isPast) {
              if (isPastCorrect) {
                nodeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm';
                label = '✓';
              } else {
                nodeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm';
                label = '✗';
              }
            } else if (isCurrent) {
              nodeStyle = 'bg-indigo-600 text-white font-black border-indigo-400 ring-2 ring-indigo-400/40 shadow-md animate-pulse';
            }

            return (
              <div 
                key={sIdx}
                className={`flex-1 min-w-[28px] h-6 rounded-lg border flex items-center justify-center text-[11px] font-bold transition-all ${nodeStyle}`}
                title={`Reto #${sIdx + 1}`}
              >
                <span>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Countdown Bar (Only if timer is enabled by teacher) */}
        {!isAnswered && !gameFinished && (
          hasTimer ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-1.5 transition-all duration-1000 ${getTimerColor()}`}
                  style={{ width: `${timerPct}%` }}
                />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-400 shrink-0">
                <Clock className={`w-3.5 h-3.5 ${timeLeft <= 5 ? 'text-rose-400 animate-spin' : 'text-slate-400'}`} />
                <span className={timeLeft <= 5 ? 'text-rose-400 font-black' : ''}>{timeLeft}s</span>
                <button 
                  onClick={() => setTimerActive(!timerActive)}
                  className="ml-1 text-slate-500 hover:text-slate-300"
                  title={timerActive ? 'Pausar tiempo' : 'Reanudar tiempo'}
                >
                  {timerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300">
              <span className="flex items-center gap-1 font-semibold">
                <span>🕊️</span>
                <span>Modo Lectura Sin Límite de Tiempo: Responde con calma</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md">
                Sin reloj
              </span>
            </div>
          )
        )}

        {/* Floating feedback toast alert */}
        {feedbackToast && (
          <div className="bg-amber-400 text-slate-950 px-3 py-1 rounded-xl text-xs font-black text-center animate-bounce shadow-lg shadow-amber-400/20">
            {feedbackToast}
          </div>
        )}
      </div>

      {/* Lifelines Toolbar (Poderes Especiales del Aula) */}
      {!isAnswered && !gameFinished && (
        <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Poderes del Aula:</span>
          </span>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 50/50 Lifeline */}
            <button
              disabled={lifeline5050Used}
              onClick={handleUse5050}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition border ${
                lifeline5050Used 
                  ? 'bg-slate-800 text-slate-500 border-slate-700/50 cursor-not-allowed opacity-50'
                  : 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/50 active:scale-95 shadow'
              }`}
              title="Elimina 2 respuestas incorrectas (1 uso)"
            >
              <Scissors className="w-3 h-3 text-indigo-400" />
              <span>50/50 {lifeline5050Used ? '(Usado)' : ''}</span>
            </button>

            {/* Extra Time Lifeline (+15s) */}
            <button
              disabled={lifelineTimeUsed}
              onClick={handleUseTimeLifeline}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition border ${
                lifelineTimeUsed 
                  ? 'bg-slate-800 text-slate-500 border-slate-700/50 cursor-not-allowed opacity-50'
                  : 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/50 active:scale-95 shadow'
              }`}
              title="Añadir 15 segundos extra para responder con calma (1 uso)"
            >
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>+15s {lifelineTimeUsed ? '(Usado)' : ''}</span>
            </button>

            {/* Pista del Sabio */}
            <button
              disabled={lifelineHintUsed}
              onClick={handleUseHint}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition border ${
                lifelineHintUsed 
                  ? 'bg-slate-800 text-slate-500 border-slate-700/50 cursor-not-allowed opacity-50'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 active:scale-95 shadow'
              }`}
              title="Ver una pista clave para deducir la respuesta"
            >
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>Pista {lifelineHintUsed ? '(Usada)' : ''}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Playing Stage */}
      {!gameFinished ? (
        <div className="space-y-5">

          {/* 🗺️ GOOGLE MAPS DISPLAY (GeoTurismo & Geografía) */}
          {showMap && (
            <div className="glass-panel p-4 rounded-3xl border border-slate-800 relative space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                {/* Place Name and Brand Badge */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-extrabold text-white text-xs sm:text-sm tracking-tight flex items-center gap-1">
                      <span>📍</span>
                      <span>{currentItem.placeName || 'Ubicación'}</span>
                    </span>
                  </div>
                  {currentItem.region && (
                    <span className="hidden md:inline-block px-2.5 py-1 rounded-xl bg-slate-800/80 text-slate-300 text-[11px] font-medium border border-slate-700">
                      {currentItem.region}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Visual Mode: Map vs Fotografía & Pistas */}
                  <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5 shadow-sm">
                    <button
                      onClick={() => setMapViewMode('map')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                        mapViewMode === 'map' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Planeta Satelital</span>
                    </button>
                    {(currentItem.image || currentItem.model3d) && (
                      <button
                        onClick={() => setMapViewMode('photo')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                          mapViewMode === 'photo' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>📸</span>
                        <span>Fotografía & Pistas</span>
                      </button>
                    )}
                  </div>

                  {/* Planet Earth Layer Selector: Satélite Real, Tierra Pura NASA, Relieve 3D, Calles */}
                  {mapViewMode === 'map' && (
                    <div className="flex flex-wrap items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5 shadow-sm">
                      <button
                        onClick={() => toggleMapLayer('satellite')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                          mapLayer === 'satellite' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Google Satélite HD con relieve, selvas y límites"
                      >
                        <span>🛰️</span>
                        <span>Satélite Real</span>
                      </button>
                      <button
                        onClick={() => toggleMapLayer('earth_hd')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                          mapLayer === 'earth_hd' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Fotografía satelital orbital pura de la Tierra (NASA / Esri)"
                      >
                        <span>🌍</span>
                        <span>Tierra NASA</span>
                      </button>
                      <button
                        onClick={() => toggleMapLayer('terrain')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                          mapLayer === 'terrain' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Relieve topográfico 3D de montañas y cordilleras"
                      >
                        <span>🏔️</span>
                        <span>Relieve 3D</span>
                      </button>
                      <button
                        onClick={() => toggleMapLayer('streets')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                          mapLayer === 'streets' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Mapa callejero estándar"
                      >
                        <span>🗺️</span>
                        <span>Calles</span>
                      </button>
                    </div>
                  )}

                  {/* Cinematic Orbital Flight & Zoom Controls */}
                  {mapViewMode === 'map' && (
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl p-0.5">
                      <button
                        onClick={handleFlyFromOrbit}
                        disabled={isFlying}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition flex items-center gap-1 shadow-sm ${
                          isFlying 
                            ? 'bg-amber-500/20 text-amber-300 animate-pulse' 
                            : 'bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white active:scale-95'
                        }`}
                        title="Desciende en vuelo supersónico desde la órbita del planeta Tierra hasta este punto"
                      >
                        <span>🚀</span>
                        <span>{isFlying ? 'Descendiendo...' : 'Vuelo Espacial'}</span>
                      </button>

                      <button
                        onClick={handleMapOrbitView}
                        className="px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition flex items-center gap-1"
                        title="Alejar la cámara al espacio exterior para ver el planeta Tierra completo"
                      >
                        <span>🪐</span>
                        <span className="hidden sm:inline">Ver Planeta</span>
                      </button>

                      <button
                        onClick={handleMapCenter}
                        className="px-2 py-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition flex items-center gap-1"
                        title="Centrar en el destino exacto"
                      >
                        <MapPin className="w-3 h-3 text-red-400" />
                        <span className="hidden sm:inline">Centrar</span>
                      </button>

                      <button
                        onClick={handleMapZoomIn}
                        className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                        title="Acercar mapa (+)"
                      >
                        +
                      </button>
                      <button
                        onClick={handleMapZoomOut}
                        className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                        title="Alejar mapa (-)"
                      >
                        -
                      </button>

                      <button
                        onClick={toggleMapExpand}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                        title={isMapExpanded ? "Reducir tamaño del mapa" : "Expandir mapa a pantalla panorámica"}
                      >
                        {isMapExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentItem.placeName || '')}+${currentItem.lat || 4.5709},${currentItem.lng || -74.2973}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-slate-900/80 hover:bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-xl border border-indigo-500/30 flex items-center gap-1 font-semibold text-[11px] transition shrink-0"
                  >
                    <span>Google Maps Oficial</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* VIEW: Interactive Visual Stage with Hotspot Discovery Pins */}
              {mapViewMode === 'photo' && (
                <div className="w-full animate-pop-in">
                  <InteractiveVisualStage 
                    item={currentItem} 
                    subject={game.subject}
                    gameType={game.type}
                  />
                </div>
              )}

              {/* VIEW: Google Maps & NASA Planet Earth interactive Leaflet container */}
              <div 
                className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl transition-all duration-300"
                style={{ display: mapViewMode === 'map' ? 'block' : 'none' }}
              >
                <div 
                  ref={mapContainerRef} 
                  style={{ 
                    height: isMapExpanded ? '520px' : '360px', 
                    minHeight: isMapExpanded ? '520px' : '360px', 
                    width: '100%', 
                    zIndex: 0 
                  }}
                  className="w-full transition-all duration-300"
                />

                {/* Floating Telemetry & Orbit Coordinates Bar */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                  <div className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-indigo-500/40 text-[10px] text-cyan-300 font-mono font-bold shadow-lg flex items-center gap-1.5 pointer-events-auto">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                    <span>🛰️ Coordenadas: <strong>{(currentItem.lat || 4.5709).toFixed(4)}° N, {(currentItem.lng || -74.2973).toFixed(4)}° O</strong></span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-[10px] text-slate-300 font-semibold shadow-lg pointer-events-auto">
                    <Compass className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                    <span>{currentItem.placeName || 'Ubicación'} • {mapLayer === 'earth_hd' ? 'Capa Fotográfica NASA' : (mapLayer === 'satellite' ? 'Satélite Google HD' : (mapLayer === 'terrain' ? 'Relieve 3D' : 'Cartografía'))}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🖼️ INTERACTIVE VISUAL STAGE & DISCOVERY HOTSPOTS (For all school subjects) */}
          {!showMap && (currentItem.image || currentItem.model3d) && (
            <div className="w-full animate-pop-in">
              <InteractiveVisualStage 
                item={currentItem} 
                subject={game.subject} 
                gameType={game.type} 
              />
            </div>
          )}

          {/* 📖 READING COMPREHENSION PASSAGE */}
          <div 
            key={`passage-${currentStep}`}
            className="glass-panel p-5 sm:p-7 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 space-y-4 animate-slide-up"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 animate-pulse" /> Lectura Comprensiva del Reto #{currentStep + 1}
              </span>
              
              {/* Question Level Badge */}
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold shadow-sm">
                {currentItem.level || 'Comprensión Lectora'}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold font-heading text-white flex flex-wrap items-center gap-2">
              {currentItem.placeName && (
                <span className="text-amber-400 font-extrabold flex items-center gap-1">
                  <MapPin className="w-4 h-4 inline text-amber-400 shrink-0" />
                  <span>{currentItem.placeName} —</span>
                </span>
              )}
              <span>{currentItem.storyTitle || `Lectura y Análisis #${currentStep + 1}`}</span>
            </h3>

            {/* Paragraphs with adjustable font size */}
            <div className={`${fontSize} text-slate-200 leading-relaxed space-y-3 font-serif bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-slate-800/80 max-h-64 overflow-y-auto pr-3`}>
              {(currentItem.storyText || currentItem.clue || '').split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx} className="leading-relaxed selection:bg-amber-400 selection:text-slate-950">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* ❓ COMPREHENSION QUESTION & COLORFUL INTERACTIVE OPTIONS */}
          <div 
            key={`question-${currentStep}`}
            className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 animate-question-in"
          >
            <div className="flex items-center justify-between gap-2 text-xs text-indigo-400 font-semibold">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400 animate-bounce" />
                <span>Pregunta de Evaluación de la Lectura:</span>
              </div>
              <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono">
                Puedes responder con las teclas [1] [2] [3] [4] o [A] [B] [C] [D]
              </span>
            </div>
            
            <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
              {currentItem.question}
            </h4>

            {/* Options Grid (Kahoot / Duolingo Style with 3D tactile buttons) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentItem.options?.map((opt, idx) => {
                const theme = optionThemes[idx % optionThemes.length];
                const isEliminated = eliminatedOptions.includes(idx);
                
                let cardStyle = `${theme.bg} cursor-pointer`;
                let badgeStyle = theme.iconBg;

                if (isEliminated) {
                  cardStyle = 'bg-slate-900/40 border-slate-800 text-slate-600 line-through opacity-40 cursor-not-allowed';
                  badgeStyle = 'bg-slate-800 text-slate-600';
                } else if (isAnswered) {
                  if (selectedAnswer === -1) {
                    // Time ran out! The student did NOT answer.
                    // DO NOT reveal or highlight the correct answer
                    cardStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed';
                    badgeStyle = 'bg-slate-800 text-slate-600';
                  } else if (idx === currentItem.answer) {
                    cardStyle = 'bg-emerald-600/30 border-emerald-500 border-b-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-600/20';
                    badgeStyle = 'bg-emerald-500 text-slate-950 font-black';
                  } else if (idx === selectedAnswer) {
                    cardStyle = 'bg-rose-600/30 border-rose-500 border-b-rose-500 text-rose-200 animate-shake';
                    badgeStyle = 'bg-rose-500 text-white font-bold';
                  } else {
                    cardStyle = 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60';
                    badgeStyle = 'bg-slate-800 text-slate-600';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered || isEliminated}
                    onClick={() => handleSelectOption(idx)}
                    className={`btn-3d border-b-4 text-left p-4 rounded-2xl border transition-all text-xs sm:text-sm font-medium flex items-center gap-3.5 transform active:scale-98 shadow-md ${
                      isAnswered && selectedAnswer === idx ? 'animate-card-flip-3d' : ''
                    } ${cardStyle}`}
                  >
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-md ${badgeStyle}`}>
                        {theme.shape}
                      </span>
                      <span className="hidden sm:inline-block text-[10px] font-mono font-bold bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
                        {String.fromCharCode(65 + idx)}
                      </span>
                    </div>

                    <span className="leading-snug flex-1">{opt}</span>
                    {isAnswered && selectedAnswer !== -1 && idx === currentItem.answer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
                    )}
                    {isAnswered && selectedAnswer !== -1 && idx === selectedAnswer && idx !== currentItem.answer && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 animate-shake" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 🌟 POST-ANSWER EDUCATIONAL CARD & NEXT BUTTON */}
          {isAnswered && (
            <div 
              ref={feedbackCardRef}
              className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all animate-pop-in ${
                selectedAnswer === -1
                  ? 'border-amber-500/40 bg-amber-950/30 shadow-xl shadow-amber-500/10'
                  : (selectedAnswer === currentItem.answer
                      ? 'border-emerald-500/40 bg-emerald-950/40 shadow-xl shadow-emerald-500/10'
                      : 'border-rose-500/40 bg-rose-950/40 shadow-xl shadow-rose-500/10')
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow ${
                  selectedAnswer === -1
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : (selectedAnswer === currentItem.answer 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30')
                }`}>
                  {selectedAnswer === -1 ? (
                    <Clock className="w-7 h-7 text-amber-400" />
                  ) : (
                    selectedAnswer === currentItem.answer ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      {selectedAnswer === -1 
                        ? '⏰ ¡Se acabó el tiempo! (0 pts)' 
                        : (selectedAnswer === currentItem.answer 
                            ? `¡Excelente Deducción! (+${(game.pointsPerSuccess || 20) + lastBonus} pts)` 
                            : '¡Buen intento! Aprende con la retroalimentación:')}
                    </h4>
                    {lastBonus > 0 && selectedAnswer !== -1 && (
                      <span className="text-[10px] font-black bg-orange-500 text-slate-950 px-2 py-0.5 rounded-full animate-bounce">
                        +{lastBonus} Combo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
                    {selectedAnswer === -1 
                      ? 'El tiempo para responder terminó y no marcaste ninguna opción. Este reto cuenta como no superado (0 puntos). ¡Sigue adelante con el próximo reto!' 
                      : (currentItem.curiosity || 'Continúa con el siguiente desafío para seguir acumulando puntos escolares.')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleNextStep}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm px-7 py-3 rounded-2xl transition shadow-xl shadow-emerald-500/25 shrink-0 flex items-center justify-center gap-2 transform active:scale-95 animate-pulse"
              >
                <span>{currentStep < totalSteps - 1 ? 'Siguiente Desafío' : 'Ver Resultados Finales'}</span>
                <ArrowRight className="w-4 h-4" />
                <span className="hidden sm:inline text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded font-mono font-bold text-slate-900">
                  [Enter]
                </span>
              </button>
            </div>
          )}

        </div>
      ) : (() => {
        const incorrectCount = Math.max(0, totalSteps - correctCount);
        const correctPct = totalSteps > 0 ? Math.round((correctCount / totalSteps) * 100) : 0;
        const incorrectPct = 100 - correctPct;

        const currentStudentRecord = {
          id: 'current_session',
          studentName: student.name || 'Tú',
          grade: student.grade || '8°',
          score: sessionScore,
          correctAnswers: correctCount,
          totalQuestions: totalSteps,
          percentage: correctPct,
          isCurrentStudent: true,
          submittedAt: new Date().toISOString()
        };

        const existingGameScores = (allScores || [])
          .filter(s => s.gameId === game.id && s.studentName)
          .filter(s => (s.studentName || '').toLowerCase().trim() !== (student.name || '').toLowerCase().trim());

        const rankedScores = [currentStudentRecord, ...existingGameScores].sort((a, b) => {
          if ((b.score || 0) !== (a.score || 0)) {
            return (b.score || 0) - (a.score || 0);
          }
          return (b.percentage || 0) - (a.percentage || 0);
        });

        const studentRankIndex = rankedScores.findIndex(s => s.isCurrentStudent);
        const studentRank = studentRankIndex !== -1 ? studentRankIndex + 1 : 1;
        const totalCompetitors = rankedScores.length;

        const top1 = rankedScores[0] || null;
        const top2 = rankedScores[1] || null;
        const top3 = rankedScores[2] || null;

        return (
          /* VICTORY, PODIUM & DETAILED RESULTS SCREEN */
          <div className="max-w-2xl mx-auto w-full space-y-6 py-4 animate-pop-in">
            
            {/* Header Card */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-indigo-500/30 text-center relative overflow-hidden shadow-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950">
              
              {/* Podium Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-lg border animate-bounce ${
                studentRank === 1 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/30' 
                  : (studentRank === 2 
                    ? 'bg-slate-300 text-slate-950 border-white shadow-slate-300/30' 
                    : (studentRank === 3 
                      ? 'bg-amber-700 text-white border-amber-600 shadow-amber-700/30' 
                      : 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'))
              }`}>
                {studentRank === 1 && '🥇 ¡1º PUESTO - CAMPEÓN DE LA SALA!'}
                {studentRank === 2 && '🥈 ¡2º PUESTO - SUBCAMPEÓN!'}
                {studentRank === 3 && '🥉 ¡3º PUESTO - MEDALLA DE BRONCE!'}
                {studentRank > 3 && `🎖️ PUESTO #${studentRank} DE ${totalCompetitors} PARTICIPANTES`}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
                ¡Gran Desempeño, {student.name || 'Estudiante'}!
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Tu resultado ha sido registrado y sincronizado en tiempo real con la planilla del docente.
              </p>

              {/* Exact Scores with "/" and Percentages */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 my-5 text-left">
                {/* Aciertos */}
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 sm:p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Aciertos</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {correctCount} <span className="text-slate-500 text-base font-normal">/ {totalSteps}</span>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-400 mt-0.5">
                    {correctPct}% Correctas
                  </div>
                </div>

                {/* Incorrectas */}
                <div className="bg-rose-950/40 border border-rose-500/30 p-3 sm:p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Fallos</span>
                    <XCircle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {incorrectCount} <span className="text-slate-500 text-base font-normal">/ {totalSteps}</span>
                  </div>
                  <div className="text-[11px] font-bold text-rose-400 mt-0.5">
                    {incorrectPct}% Incorrectas
                  </div>
                </div>

                {/* Puntaje */}
                <div className="bg-amber-950/40 border border-amber-500/30 p-3 sm:p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Puntos</span>
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-300">
                    +{sessionScore}
                  </div>
                  <div className="text-[11px] text-amber-400/80 font-bold mt-0.5">
                    pts ganados
                  </div>
                </div>
              </div>

              {/* Accuracy Visual Progress Bar (Aciertos vs Errores) */}
              <div className="space-y-1.5 text-left mb-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    {correctCount} Aciertos ({correctPct}%)
                  </span>
                  <span className="text-rose-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                    {incorrectCount} Fallos ({incorrectPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden flex shadow-inner">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-700" 
                    style={{ width: `${correctPct}%` }}
                    title={`Aciertos: ${correctPct}%`}
                  />
                  <div 
                    className="bg-rose-500 h-full transition-all duration-700" 
                    style={{ width: `${incorrectPct}%` }}
                    title={`Errores: ${incorrectPct}%`}
                  />
                </div>
              </div>

            </div>

            {/* Navigation Tabs for Post-Game Review */}
            <div className="flex items-center justify-center gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setResultsTab('podium')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  resultsTab === 'podium' 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>🏆 Gran Podio de la Sala</span>
              </button>

              <button
                onClick={() => setResultsTab('answers')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  resultsTab === 'answers' 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>📋 Mis Respuestas ({correctCount}/{totalSteps})</span>
              </button>

              <button
                onClick={() => setResultsTab('voucher')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  resultsTab === 'voucher' 
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30' 
                    : 'bg-slate-800 text-amber-400 hover:text-white'
                }`}
              >
                <Coffee className="w-4 h-4" />
                <span>☕ Cafetería ({availablePoints} pts)</span>
              </button>
            </div>

            {/* TAB 1: PODIUM AND LEADERBOARD */}
            {resultsTab === 'podium' && (
              <div className="space-y-6 animate-pop-in">
                
                {/* 3D Olympic Podium */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950">
                  <h3 className="text-center text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-6">
                    Podio de Honor del Reto Escolar
                  </h3>

                  <div className="flex items-end justify-center gap-2 sm:gap-4 pt-8 pb-2">
                    
                    {/* 🥈 2º PUESTO (Izquierda) */}
                    <div className="flex-1 max-w-[130px] flex flex-col items-center">
                      <div className="text-center mb-2">
                        <span className="text-2xl block">🥈</span>
                        <span className="text-xs font-bold text-white truncate max-w-[110px] block">
                          {top2 ? top2.studentName : 'Disponible'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {top2 ? `${top2.score} pts` : '-'}
                        </span>
                        {top2 && (
                          <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold">
                            {top2.correctAnswers ?? 0}/{top2.totalQuestions ?? totalSteps}
                          </span>
                        )}
                        {top2?.isCurrentStudent && (
                          <span className="text-[9px] bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block">
                            ¡Tú!
                          </span>
                        )}
                      </div>
                      <div className={`w-full h-28 sm:h-36 rounded-t-2xl flex flex-col items-center justify-center border-t-4 shadow-xl ${
                        top2?.isCurrentStudent 
                          ? 'bg-slate-700/80 border-slate-300 ring-2 ring-indigo-400' 
                          : 'bg-slate-800/80 border-slate-400'
                      }`}>
                        <span className="text-2xl sm:text-3xl font-black text-slate-300">2</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Plata</span>
                      </div>
                    </div>

                    {/* 🥇 1º PUESTO (Centro - Más Alto) */}
                    <div className="flex-1 max-w-[140px] flex flex-col items-center -mt-6">
                      <div className="text-center mb-2 relative">
                        <span className="text-xs font-bold text-amber-300 absolute -top-4 left-1/2 -translate-x-1/2">
                          👑
                        </span>
                        <span className="text-3xl block">🥇</span>
                        <span className="text-xs sm:text-sm font-extrabold text-amber-300 truncate max-w-[130px] block">
                          {top1 ? top1.studentName : 'Disponible'}
                        </span>
                        <span className="text-[11px] text-amber-400 font-black font-mono block">
                          {top1 ? `${top1.score} pts` : '-'}
                        </span>
                        {top1 && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
                            {top1.correctAnswers ?? 0}/{top1.totalQuestions ?? totalSteps} ({top1.percentage}%)
                          </span>
                        )}
                        {top1?.isCurrentStudent && (
                          <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full mt-1 inline-block animate-pulse">
                            ¡Eres Tú! 🌟
                          </span>
                        )}
                      </div>
                      <div className={`w-full h-36 sm:h-48 rounded-t-2xl flex flex-col items-center justify-center border-t-4 shadow-2xl relative ${
                        top1?.isCurrentStudent 
                          ? 'bg-gradient-to-b from-amber-500/30 to-amber-600/10 border-amber-400 ring-4 ring-amber-400/50' 
                          : 'bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-400'
                      }`}>
                        <span className="text-3xl sm:text-4xl font-black text-amber-400">1</span>
                        <span className="text-[10px] text-amber-300 font-black uppercase tracking-wider">Oro</span>
                      </div>
                    </div>

                    {/* 🥉 3º PUESTO (Derecha) */}
                    <div className="flex-1 max-w-[130px] flex flex-col items-center">
                      <div className="text-center mb-2">
                        <span className="text-2xl block">🥉</span>
                        <span className="text-xs font-bold text-white truncate max-w-[110px] block">
                          {top3 ? top3.studentName : 'Disponible'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {top3 ? `${top3.score} pts` : '-'}
                        </span>
                        {top3 && (
                          <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold">
                            {top3.correctAnswers ?? 0}/{top3.totalQuestions ?? totalSteps}
                          </span>
                        )}
                        {top3?.isCurrentStudent && (
                          <span className="text-[9px] bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block">
                            ¡Tú!
                          </span>
                        )}
                      </div>
                      <div className={`w-full h-20 sm:h-28 rounded-t-2xl flex flex-col items-center justify-center border-t-4 shadow-lg ${
                        top3?.isCurrentStudent 
                          ? 'bg-amber-900/40 border-amber-600 ring-2 ring-indigo-400' 
                          : 'bg-slate-800/80 border-amber-700'
                      }`}>
                        <span className="text-xl sm:text-2xl font-black text-amber-600">3</span>
                        <span className="text-[10px] text-amber-600 font-bold uppercase">Bronce</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Complete Room Leaderboard */}
                <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4 text-indigo-400" />
                      <span>Tabla de Clasificación General ({rankedScores.length})</span>
                    </h4>
                    <span className="text-[11px] text-indigo-400 font-semibold">
                      Tu puesto: #{studentRank}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/70 max-h-60 overflow-y-auto pr-1">
                    {rankedScores.map((player, idx) => {
                      const isMe = player.isCurrentStudent;
                      return (
                        <div 
                          key={player.id || idx}
                          className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition ${
                            isMe 
                              ? 'bg-indigo-600/20 border border-indigo-500/40 text-white font-bold' 
                              : 'hover:bg-slate-800/40 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                              idx === 0 
                                ? 'bg-amber-400 text-slate-950' 
                                : (idx === 1 
                                  ? 'bg-slate-300 text-slate-950' 
                                  : (idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'))
                            }`}>
                              {idx + 1}
                            </span>
                            <div className="truncate max-w-[180px] sm:max-w-xs">
                              <span className="text-xs sm:text-sm font-semibold truncate block">
                                {player.studentName} {isMe && '(Tú)'}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Grado {player.grade || '8°'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-right">
                            <div className="text-[11px] text-slate-400">
                              <span className="font-bold text-white">{player.correctAnswers ?? 0}</span> / {player.totalQuestions ?? totalSteps}
                            </div>
                            <div className="font-black text-xs sm:text-sm text-amber-400 font-mono min-w-[60px]">
                              +{player.score} pts
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: DETAILED QUESTION ANSWERS (Estudiante revisa todas sus respuestas) */}
            {resultsTab === 'answers' && (
              <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 animate-pop-in text-left">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>📝 Revisión Pregunta por Pregunta</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {correctCount} / {totalSteps} Aciertos ({correctPct}%)
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Compara tu respuesta con la solución oficial correcta y lee la retroalimentación.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {answersHistory.map((item, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.isCorrect 
                          ? 'border-emerald-500/40 bg-emerald-950/20' 
                          : 'border-rose-500/40 bg-rose-950/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          {item.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span>Reto #{item.step || (idx + 1)}: {item.storyTitle || item.placeName || 'Pregunta de Lectura'}</span>
                        </span>

                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          item.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {item.isCorrect ? `+${item.pointsEarned || 20} pts` : '0 pts'}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-white mb-3">
                        {item.question}
                      </h4>

                      {/* Your Answer */}
                      <div className="space-y-2 text-xs">
                        <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                          item.isCorrect 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        }`}>
                          <span className="font-bold shrink-0">Tu Selección:</span>
                          <span className="flex-1">{item.selectedLetter}) {item.selectedOption}</span>
                          <span className="font-bold shrink-0">{item.isCorrect ? '✅ ¡Correcta!' : '❌ Incorrecta'}</span>
                        </div>

                        {/* Official Correct Answer (if student was wrong) */}
                        {!item.isCorrect && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 flex items-center gap-2">
                            <span className="font-bold text-emerald-300 shrink-0">🎯 Respuesta Correcta:</span>
                            <span className="flex-1 font-semibold">{item.correctLetter}) {item.correctOption}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: CAFETERIA REWARD */}
            {resultsTab === 'voucher' && (
              <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-4 animate-pop-in">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl border border-amber-500/30">
                  <Coffee className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-bold text-white text-center">Canje de Cafetería Escolar</h3>
                
                <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-2xl text-left">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                    <span>Tu saldo acumulado escolar:</span>
                    <span className="font-bold text-amber-300 text-sm">{availablePoints} / 100 pts</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-yellow-300 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, availablePoints)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {availablePoints >= 100 
                      ? '🎉 ¡Tienes puntos suficientes para canjear un vale de cafetería!' 
                      : `Te faltan solo ${100 - availablePoints} puntos para tu vale de refrigerio`}
                  </span>
                </div>

                {availablePoints >= 100 && !generatedVoucher && (
                  <button
                    onClick={handleClaim}
                    className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm py-4 px-6 rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 hover:scale-102 transition transform active:scale-95 pulse-badge"
                  >
                    <Coffee className="w-5 h-5" />
                    <span>☕ ¡GENERAR CÓDIGO DE VALE AHORA!</span>
                  </button>
                )}

                {generatedVoucher && (
                  <div className="p-5 bg-amber-500/10 border-2 border-dashed border-amber-400 rounded-2xl text-center space-y-2">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">Tu Código de Vale Escolar</span>
                    <div className="text-3xl font-black font-mono tracking-widest text-amber-300">
                      {generatedVoucher.code}
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Muestra este código al docente o en la cafetería escolar para recibir tu refrigerio.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onExit}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm py-3.5 rounded-2xl transition border border-slate-700"
              >
                Terminar y Salir
              </button>
            </div>

          </div>
        );
      })()}

      {/* Pista del Sabio Modal */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 max-w-sm w-full p-6 rounded-3xl shadow-2xl text-center space-y-4 animate-pop-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">💡 Pista del Sabio Explorador</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              Observa con atención: <em>"{currentItem.curiosity || 'Relee el segundo párrafo de la bitácora para encontrar la causa principal.'}"</em>
            </p>
            <button
              onClick={() => setShowHintModal(false)}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition shadow"
            >
              ¡Entendido, volver a responder!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
