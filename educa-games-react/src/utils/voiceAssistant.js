// Voice Assistant Engine (Reconocimiento Inteligente de Voz para Docentes)
// Basado en Web Speech API nativa (Chrome, Edge, Safari, Android)
// Diseñado para profesores sin conocimientos informáticos ("Efecto Alexa")

import naturalSpeech from './naturalSpeech';
import voiceBus from './voiceCommandBus';

class TeacherVoiceAssistantService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.continuousMode = false;
    this.audioContext = null;
    
    // Fallback universal MediaRecorder (Firefox, Safari y navegadores sin Web Speech)
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.analyserContext = null;
    this.volumeCheckAnimId = null;
    this.maxRecordingTimer = null;
    this.isProcessingSpeech = false;

    // Callbacks de estado para la interfaz React
    this.onStateChange = null;       // (isListening) => void
    this.onTranscript = null;        // (transcript, isFinal) => void
    this.onCommandDetected = null;   // (commandInfo) => void
    this.onError = null;             // (errorMessage) => void

    if (this.hasNativeSpeech()) {
      this.initRecognition();
    }
  }

  isSupported() {
    if (typeof window === 'undefined') return false;
    // Soporte universal: cualquier navegador con reconocimiento nativo o con acceso a micrófono
    return Boolean(
      window.SpeechRecognition || 
      window.webkitSpeechRecognition || 
      (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    );
  }

  hasNativeSpeech() {
    if (typeof window === 'undefined') return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  initRecognition() {
    if (!this.hasNativeSpeech()) return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRec();
    this.recognition.lang = 'es-CO';
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.playChime('start');
      if (this.onStateChange) this.onStateChange(true);
    };

    this.recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      const activeText = (final || interim).trim();
      if (this.onTranscript) {
        this.onTranscript(activeText, Boolean(final));
      }

      if (final) {
        this.processSpokenCommand(final.trim());
      }
    };

    this.recognition.onerror = (event) => {
      // Ignorar errores benignos como 'no-speech' o 'aborted'
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      console.warn('Speech recognition error:', event.error);
      if (this.onError) {
        if (event.error === 'not-allowed') {
          this.onError('Permiso de micrófono denegado. Haz clic en el candado o micrófono de la barra del navegador para permitirlo.');
        } else {
          this.onError(`Aviso de voz: ${event.error}`);
        }
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onStateChange) this.onStateChange(false);

      // Si el modo manos libres / continuo está activo, reiniciar escucha
      if (this.continuousMode) {
        try {
          this.recognition.start();
        } catch (e) {}
      }
    };
  }

  // Sonidos de retroalimentación inmediata (Web Audio API nativa sin archivos externos)
  playChime(type = 'success') {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.audioContext = new AudioCtx();
      }
      if (!this.audioContext) return;
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'start') {
        // Tono ascendente suave al empezar a escuchar
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'success') {
        // Doble tono positivo de confirmación ("orden recibida")
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'error') {
        // Tono grave bajo si no se entendió
        osc.frequency.setValueAtTime(260, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      // Ignorar restricciones de audio policy
    }
  }

  // Iniciar escucha del micrófono (Modo dual: Chrome/Edge o Firefox/Universal)
  async start(continuous = false) {
    if (!this.isSupported()) {
      if (this.onError) this.onError('Tu navegador no permite acceso al micrófono.');
      return false;
    }

    this.continuousMode = continuous;

    // Opción A: Motor Nativo si está disponible (Chrome, Edge, etc.)
    if (this.hasNativeSpeech()) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(t => t.stop());
        } catch (err) {
          console.warn('Microphone permission error:', err);
          if (this.onError) {
            this.onError('Permiso de micrófono bloqueado. Haz clic en el ícono del candado o micrófono en la barra de tu navegador y elige "Permitir micrófono".');
          }
          return false;
        }
      }

      if (!this.recognition) this.initRecognition();
      if (!this.recognition) return false;

      try {
        this.recognition.continuous = continuous;
        this.recognition.start();
        return true;
      } catch (err) {
        try {
          this.recognition.stop();
          setTimeout(() => this.recognition.start(), 150);
        } catch (e) {}
        return true;
      }
    }

    // Opción B: Motor Universal vía MediaRecorder (Firefox, Safari, Linux/Android/iOS)
    return await this.startRecordingFallback(continuous);
  }

  // Motor Fallback Universal (Firefox, Safari)
  async startRecordingFallback(continuous = false) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (this.onError) this.onError('Tu navegador no admite grabación de audio.');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      this.mediaStream = stream;

      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      this.audioChunks = [];
      this.mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        this.isListening = true;
        this.playChime('start');
        if (this.onStateChange) this.onStateChange(true);
        if (this.onTranscript) this.onTranscript('🎤 Escuchando... Di un comando (ej: siguiente pregunta)', false);
      };

      this.mediaRecorder.onerror = (err) => {
        console.warn('MediaRecorder error:', err);
      };

      this.mediaRecorder.onstop = async () => {
        const recordedBlob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder.mimeType || 'audio/webm' 
        });

        // Limpiar pistas de micrófono
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach(t => t.stop());
          this.mediaStream = null;
        }

        // Si el audio es insignificante (menos de 600 bytes), ignorar
        if (recordedBlob.size < 600) {
          if (this.continuousMode && !this.isProcessingSpeech) {
            setTimeout(() => this.start(true), 300);
          }
          return;
        }

        this.isProcessingSpeech = true;
        if (this.onTranscript) {
          this.onTranscript('⏳ Procesando comando de voz...', false);
        }

        try {
          const response = await fetch('/api/speech', {
            method: 'POST',
            headers: {
              'Content-Type': recordedBlob.type
            },
            body: recordedBlob
          });

          const data = await response.json();
          if (data.ok && data.transcript && data.transcript.trim()) {
            const finalTranscript = data.transcript.trim();
            if (this.onTranscript) this.onTranscript(finalTranscript, true);
            this.processSpokenCommand(finalTranscript);
          } else {
            if (this.onTranscript) this.onTranscript('(No se detectó voz clara)', true);
            this.playChime('error');
            if (this.onCommandDetected) {
              this.onCommandDetected({ transcript: '', intent: null, unrecognized: true });
            }
          }
        } catch (fetchErr) {
          console.warn('Speech API error:', fetchErr);
          if (this.onTranscript) this.onTranscript('Error al conectar con el servidor de voz.', true);
        } finally {
          this.isProcessingSpeech = false;
        }

        // Si el modo continuo (manos libres) sigue activo, reiniciar escucha automáticamente
        if (this.continuousMode) {
          setTimeout(() => {
            if (this.continuousMode) this.start(true);
          }, 600);
        }
      };

      // Iniciar captura recolectando fragmentos cada 200ms
      this.mediaRecorder.start(200);
      this.isListening = true;
      if (this.onStateChange) this.onStateChange(true);

      // Detección de silencio inteligente por Web Audio
      this.setupSilenceDetection(stream);

      return true;
    } catch (err) {
      console.warn('getUserMedia error:', err);
      if (this.onError) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          this.onError('Permiso de micrófono bloqueado. Haz clic en el ícono del candado o micrófono en la barra de direcciones de Firefox y elige "Permitir".');
        } else {
          this.onError('No se pudo acceder al micrófono: ' + (err.message || 'Error desconocido'));
        }
      }
      this.isListening = false;
      if (this.onStateChange) this.onStateChange(false);
      return false;
    }
  }

  setupSilenceDetection(stream) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.analyserContext = new AudioCtx();
      const source = this.analyserContext.createMediaStreamSource(stream);
      const analyser = this.analyserContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let speechDetected = false;
      let silenceStartTime = 0;

      const checkAudio = () => {
        if (!this.isListening || !this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
          if (this.analyserContext && this.analyserContext.state !== 'closed') {
            try { this.analyserContext.close(); } catch (e) {}
          }
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Umbral de voz (cuando la persona empieza a hablar)
        if (average > 14) {
          speechDetected = true;
          silenceStartTime = 0;
        } else if (speechDetected) {
          if (!silenceStartTime) {
            silenceStartTime = Date.now();
          } else if (Date.now() - silenceStartTime > 1400) {
            // 1.4 segundos de silencio luego de hablar -> auto-enviar comando
            this.stopRecordingFallback();
            return;
          }
        }

        this.volumeCheckAnimId = requestAnimationFrame(checkAudio);
      };

      this.volumeCheckAnimId = requestAnimationFrame(checkAudio);

      // Tiempo límite máximo de 7 segundos para evitar grabaciones infinitas
      this.maxRecordingTimer = setTimeout(() => {
        if (this.isListening && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.stopRecordingFallback();
        }
      }, 7000);
    } catch (e) {
      console.warn('Silence detection init warning:', e);
    }
  }

  stopRecordingFallback() {
    if (this.volumeCheckAnimId) {
      cancelAnimationFrame(this.volumeCheckAnimId);
      this.volumeCheckAnimId = null;
    }
    if (this.maxRecordingTimer) {
      clearTimeout(this.maxRecordingTimer);
      this.maxRecordingTimer = null;
    }
    if (this.analyserContext && this.analyserContext.state !== 'closed') {
      try { this.analyserContext.close(); } catch (e) {}
      this.analyserContext = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }

    this.isListening = false;
    if (this.onStateChange) this.onStateChange(false);
  }

  // Detener escucha (Chrome o Firefox)
  stop() {
    this.continuousMode = false;
    if (this.hasNativeSpeech()) {
      if (this.recognition && this.isListening) {
        try {
          this.recognition.stop();
        } catch (e) {}
      }
      this.isListening = false;
      if (this.onStateChange) this.onStateChange(false);
    } else {
      this.stopRecordingFallback();
    }
  }

  async toggle(continuous = false) {
    if (this.isListening) {
      this.stop();
    } else {
      await this.start(continuous);
    }
  }

  // Motor Inteligente de Emparejamiento Semántico (Procesamiento de Lenguaje Natural en Español)
  matchIntent(rawText = '') {
    const text = rawText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes para máxima tolerancia
      .replace(/[.,;:¿?¡!]/g, '')
      .trim();

    // 1. NAVEGACIÓN Y AVANCE DE PREGUNTAS
    if (
      text.includes('siguiente') || 
      text.includes('avanzar') || 
      text.includes('continuar') || 
      text.includes('pasa la pregunta') || 
      text.includes('pasar pregunta') ||
      text.includes('proxima') ||
      text.includes('siguiente reto')
    ) {
      return {
        action: 'NEXT_QUESTION',
        label: 'Avanzar a la siguiente pregunta',
        reply: 'Pasando a la siguiente pregunta, profesor.'
      };
    }

    if (
      text.includes('anterior') || 
      text.includes('atras') || 
      text.includes('retroceder') || 
      text.includes('pregunta anterior')
    ) {
      return {
        action: 'PREV_QUESTION',
        label: 'Volver a la pregunta anterior',
        reply: 'Regresando a la pregunta anterior.'
      };
    }

    // 2. LECTURA EN VOZ ALTA / NARRADOR
    if (
      text.includes('lee la pregunta') || 
      text.includes('leeme la pregunta') || 
      text.includes('leer pregunta') || 
      text.includes('leer historia') || 
      text.includes('leeme la historia') || 
      text.includes('narrar') || 
      text.includes('leer en voz alta') ||
      text.includes('lee la bitacora') ||
      text.includes('leeme el texto') ||
      text.includes('leer texto')
    ) {
      return {
        action: 'READ_QUESTION',
        label: 'Leer bitácora y pregunta en voz alta',
        reply: 'Leyendo la bitácora y pregunta para el salón.'
      };
    }

    if (
      text.includes('silencio') || 
      text.includes('detener voz') || 
      text.includes('pausar voz') || 
      text.includes('para de hablar') || 
      text.includes('callar') ||
      text.includes('detener lectura')
    ) {
      return {
        action: 'STOP_SPEECH',
        label: 'Detener lectura de voz',
        reply: 'Lectura pausada.'
      };
    }

    // 3. CONTROL DEL TIEMPO / CRONÓMETRO
    if (
      text.includes('quitar tiempo') || 
      text.includes('sin tiempo') || 
      text.includes('desactivar tiempo') || 
      text.includes('pausar tiempo') || 
      text.includes('pausa el tiempo') || 
      text.includes('detener reloj') || 
      text.includes('pausar cronometro') || 
      text.includes('tiempo libre') ||
      text.includes('congelar tiempo')
    ) {
      return {
        action: 'PAUSE_TIMER',
        label: 'Pausar o quitar cronómetro',
        reply: 'Cronómetro pausado para que el salón pueda debatir con calma.'
      };
    }

    if (
      text.includes('reanudar tiempo') || 
      text.includes('activar tiempo') || 
      text.includes('poner tiempo') || 
      text.includes('continuar tiempo') || 
      text.includes('iniciar reloj') ||
      text.includes('reanudar reloj')
    ) {
      return {
        action: 'RESUME_TIMER',
        label: 'Reanudar cronómetro',
        reply: 'Cronómetro reanudado.'
      };
    }

    if (
      text.includes('mas tiempo') || 
      text.includes('dame mas tiempo') || 
      text.includes('anadir tiempo') || 
      text.includes('sumar tiempo') || 
      text.includes('tiempo extra')
    ) {
      return {
        action: 'ADD_TIME',
        label: 'Dar 30 segundos más de tiempo',
        reply: 'Treinta segundos adicionales añadidos al reto.'
      };
    }

    // 4. CAMBIO DE VISTAS (FOTO REAL VS PLANETA SATELITAL)
    if (
      text.includes('mostrar foto') || 
      text.includes('ver foto') || 
      text.includes('fotografia') || 
      text.includes('ver imagen') || 
      text.includes('mostrar fotografia') || 
      text.includes('pistas')
    ) {
      return {
        action: 'SHOW_PHOTO',
        label: 'Ver fotografía real y pistas',
        reply: 'Mostrando la fotografía real en alta definición.'
      };
    }

    if (
      text.includes('mostrar mapa') || 
      text.includes('ver mapa') || 
      text.includes('ver satelite') || 
      text.includes('planeta') || 
      text.includes('globo terraqueo') || 
      text.includes('mapa satelital')
    ) {
      return {
        action: 'SHOW_MAP',
        label: 'Ver mapa satelital',
        reply: 'Cambiando a la vista del mapa satelital.'
      };
    }

    if (
      text.includes('pantalla completa') || 
      text.includes('maximizar') || 
      text.includes('ampliar') || 
      text.includes('expandir')
    ) {
      return {
        action: 'FULLSCREEN',
        label: 'Expandir a pantalla completa',
        reply: 'Ampliando visualización.'
      };
    }

    // 5. LANZAR SALA Y PROYECCIÓN DE CÓDIGO QR
    if (
      text.includes('lanzar sala') || 
      text.includes('crear sala') || 
      text.includes('proyectar sala') || 
      text.includes('codigo qr') || 
      text.includes('mostrar qr') || 
      text.includes('conectar estudiantes') || 
      text.includes('unir alumnos') ||
      text.includes('proyectar codigo')
    ) {
      return {
        action: 'HOST_LOBBY',
        label: 'Proyectar sala con código QR',
        reply: 'Abriendo sala con código QR y PIN para los estudiantes.'
      };
    }

    if (
      text.includes('iniciar partida') || 
      text.includes('empezar juego') || 
      text.includes('comenzar partida') || 
      text.includes('iniciar juego') ||
      text.includes('empezar clase')
    ) {
      return {
        action: 'START_GAME',
        label: 'Iniciar partida de clase',
        reply: '¡Iniciando la partida con los estudiantes conectados!'
      };
    }

    // 6. APERTURA DE JUEGOS Y ASIGNATURAS ESPECÍFICAS
    if (
      text.includes('geografia') || 
      text.includes('geoturismo') || 
      text.includes('colombia') || 
      text.includes('cano cristales') ||
      text.includes('mapa satelital')
    ) {
      return {
        action: 'OPEN_GAME',
        gameId: 'geo-colombia-mundo',
        label: 'Abrir GeoTurismo Colombia y el Mundo',
        reply: 'Abriendo GeoTurismo Colombia y el Mundo, profesor.'
      };
    }

    if (
      text.includes('historia') || 
      text.includes('ruta libertadora') || 
      text.includes('puente de boyaca') || 
      text.includes('pantano de vargas')
    ) {
      return {
        action: 'OPEN_GAME',
        gameId: 'historia-ruta-libertadora',
        label: 'Abrir Ruta Libertadora e Historia',
        reply: 'Abriendo la Ruta Libertadora e Historia de Colombia.'
      };
    }

    if (
      text.includes('mitos') || 
      text.includes('leyendas') || 
      text.includes('mohan') || 
      text.includes('llorona')
    ) {
      return {
        action: 'OPEN_GAME',
        gameId: 'lectura-mitos-misterio',
        label: 'Abrir Mitos y Leyendas',
        reply: 'Abriendo Mitos y Leyendas de Colombia.'
      };
    }

    if (
      text.includes('lectura critica') || 
      text.includes('comprension lectora') || 
      text.includes('lenguaje') || 
      text.includes('espanol')
    ) {
      return {
        action: 'OPEN_GAME',
        gameId: 'lenguaje-comprension-critica',
        label: 'Abrir Taller de Comprensión Lectora Crítica',
        reply: 'Abriendo el taller de comprensión lectora crítica.'
      };
    }

    if (
      text.includes('matematica') || 
      text.includes('matematicas') || 
      text.includes('desafio logico') || 
      text.includes('geometria') ||
      text.includes('fracciones')
    ) {
      return {
        action: 'OPEN_GAME',
        gameId: 'matematicas-desafio-logico',
        label: 'Abrir Desafío Matemático',
        reply: 'Abriendo Desafío Matemático y resolución de problemas.'
      };
    }

    if (
      text.includes('ciencia') || 
      text.includes('ciencias') || 
      text.includes('biodiversidad') || 
      text.includes('biologia') ||
      text.includes('naturales')
    ) {
      return {
        action: 'OPEN_GAME',
        gameId: 'ciencias-pequenos-genios',
        label: 'Abrir Ciencias Naturales y Biodiversidad',
        reply: 'Abriendo Ciencias Naturales y Biodiversidad.'
      };
    }

    if (
      text.includes('ingles') || 
      text.includes('english') || 
      text.includes('bilingual')
    ) {
      return {
        action: 'OPEN_GAME',
        gameId: 'ingles-english-explorer',
        label: 'Abrir English Explorers',
        reply: 'Opening English Explorers challenge, teacher.'
      };
    }

    if (
      text.includes('tecnologia') || 
      text.includes('informatica') || 
      text.includes('algoritmo') || 
      text.includes('ciberseguridad')
    ) {
      return {
        action: 'OPEN_GAME',
        gameId: 'tecnologia-mundo-digital',
        label: 'Abrir Tecnología y Algoritmos',
        reply: 'Abriendo Tecnología y Pensamiento Computacional.'
      };
    }

    if (
      text.includes('etica') || 
      text.includes('catedra de paz') || 
      text.includes('convivencia') || 
      text.includes('valores')
    ) {
      return {
        action: 'OPEN_GAME',
        gameId: 'etica-paz-ciudadana',
        label: 'Abrir Cátedra de Paz y Valores',
        reply: 'Abriendo Cátedra de la Paz y Convivencia Escolar.'
      };
    }

    // 7. REPORTES INSTITUCIONALES Y EXCEL
    if (
      text.includes('descargar excel') || 
      text.includes('descargar notas') || 
      text.includes('bajar notas') || 
      text.includes('reporte de notas') || 
      text.includes('planilla de notas') || 
      text.includes('bajar excel') ||
      text.includes('descargar informe') ||
      text.includes('exportar excel')
    ) {
      return {
        action: 'EXPORT_EXCEL',
        label: 'Descargar reporte de notas en Excel',
        reply: 'Generando y descargando la planilla de calificaciones en Excel para Windows.'
      };
    }

    if (
      text.includes('ver notas') || 
      text.includes('ver calificaciones') || 
      text.includes('panel de notas') || 
      text.includes('ver resultados')
    ) {
      return {
        action: 'VIEW_SCORES',
        label: 'Ver planilla de notas en pantalla',
        reply: 'Mostrando la planilla de resultados del salón.'
      };
    }

    if (
      text.includes('ver juegos') || 
      text.includes('ver retos') || 
      text.includes('catalogo')
    ) {
      return {
        action: 'VIEW_GAMES',
        label: 'Ver catálogo de juegos',
        reply: 'Mostrando el catálogo de retos educativos.'
      };
    }

    // 8. SALIDA Y MENÚ PRINCIPAL
    if (
      text.includes('volver al inicio') || 
      text.includes('menu principal') || 
      text.includes('inicio') || 
      text.includes('salir del juego') || 
      text.includes('salir') ||
      text.includes('regresar')
    ) {
      return {
        action: 'GO_HOME',
        label: 'Volver al menú principal',
        reply: 'Regresando al menú principal del profesor.'
      };
    }

    // 9. AYUDA Y ASISTENCIA
    if (
      text.includes('ayuda') || 
      text.includes('que puedo decir') || 
      text.includes('comandos') || 
      text.includes('como funciona')
    ) {
      return {
        action: 'SHOW_HELP',
        label: 'Ver lista de comandos de voz',
        reply: 'Aquí tienes los comandos de voz que puedes usar en cualquier momento.'
      };
    }

    if (
      text.includes('quien eres') || 
      text.includes('hola') || 
      text.includes('buenos dias') || 
      text.includes('buenas tardes')
    ) {
      return {
        action: 'GREETING',
        label: 'Saludo del Asistente',
        reply: '¡Hola, profesor! Soy tu asistente de voz. Dime qué deseas hacer: puedes pedirme abrir un juego, pasar preguntas, pausar el tiempo o descargar las notas en Excel.'
      };
    }

    return null;
  }

  // Procesar el texto final reconocido
  processSpokenCommand(transcript) {
    if (!transcript) return;

    const matched = this.matchIntent(transcript);

    if (matched) {
      this.playChime('success');

      if (this.onCommandDetected) {
        this.onCommandDetected({
          transcript,
          intent: matched
        });
      }

      // Respuesta de audio humana al docente
      if (matched.reply) {
        naturalSpeech.speak({
          text: matched.reply,
          category: 'sociales',
          customRate: 1.02
        });
      }

      // Emitir evento al bus para que la vista activa reaccione de inmediato
      voiceBus.emit(matched.action, matched);
    } else {
      this.playChime('error');
      if (this.onCommandDetected) {
        this.onCommandDetected({
          transcript,
          intent: null,
          unrecognized: true
        });
      }
    }
  }
}

export const teacherVoice = new TeacherVoiceAssistantService();
export default teacherVoice;
