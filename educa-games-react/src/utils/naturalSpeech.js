// High-Quality Human-Like Speech Synthesis Utility (Powered by Alexa Neural TTS)
// Optimizado para una pronunciación natural, pedagógica y cálida con la voz de Alexa (Salomé Neural)

class NaturalSpeechService {
  constructor() {
    this.currentAudio = null;
    this.onStateChange = null;
  }

  // Detect language from text or subject category
  detectLanguage(text = '', category = '', subject = '') {
    const isEnglishContext = 
      category === 'ingles' || 
      subject?.toLowerCase().includes('inglés') || 
      subject?.toLowerCase().includes('english') ||
      /\b(the|and|with|student|school|passage|question|morning|yesterday|because)\b/i.test(text);

    return isEnglishContext ? 'en-US' : 'es-CO';
  }

  // Get available voices list for UI selectors
  getVoices() {
    return [
      { name: 'Alexa Neuronal (Salomé • Colombia)', lang: 'es-CO', voiceURI: 'alexa-salome' },
      { name: 'Alexa Neuronal (Dalia • México)', lang: 'es-MX', voiceURI: 'alexa-dalia' },
      { name: 'Alexa English (Jenny • US)', lang: 'en-US', voiceURI: 'alexa-jenny' }
    ];
  }

  findBestVoice(lang = 'es-CO') {
    return this.getVoices()[0];
  }

  // Pre-process text to make pronunciation smooth and pedagogically pleasant
  cleanTextForSpeech(text, isEnglish) {
    if (!text) return '';

    let cleaned = text
      // Replace markdown symbols and newlines
      .replace(/[*#_`~[\]]/g, '')
      .replace(/\\n/g, '. ')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ');

    if (isEnglish) {
      cleaned = cleaned
        .replace(/Reading Passage:/gi, 'Reading Passage. ')
        .replace(/Short Story:/gi, 'Short Story. ')
        .replace(/Question:/gi, 'Question: ')
        .replace(/8°/g, 'eighth')
        .replace(/(\d+)%/g, '$1 percent')
        .replace(/\$(\d+[\d.,]*)/g, '$1 dollars ')
        .replace(/km\/h/gi, 'kilometers per hour')
        .replace(/e\.g\./gi, 'for example')
        .replace(/i\.e\./gi, 'that is');
    } else {
      cleaned = cleaned
        .replace(/Bitácora del Explorador:/gi, 'Bitácora del explorador. ')
        .replace(/Bitácora Andina:/gi, 'Bitácora andina. ')
        .replace(/Situación Problema:/gi, 'Situación problema. ')
        .replace(/Pregunta:/gi, 'Pregunta: ')
        .replace(/8°/g, 'octavo')
        .replace(/(\d+)%/g, '$1 por ciento')
        .replace(/\$(\d+[\d.,]*)/g, '$1 pesos ')
        .replace(/m²/g, 'metros cuadrados')
        .replace(/1\/2/g, 'un medio')
        .replace(/1\/4/g, 'un cuarto')
        .replace(/3\/4/g, 'tres cuartos');
    }

    return cleaned.trim();
  }

  // Pre-cargar audio en segundo plano para que suene de inmediato al presionar el botón o pedir por voz
  preload(text = '', category = '', subject = '') {
    if (!text || typeof window === 'undefined') return;
    try {
      const lang = this.detectLanguage(text, category, subject);
      const isEnglish = lang.startsWith('en');
      const cleanedText = this.cleanTextForSpeech(text, isEnglish);
      if (!cleanedText) return;

      const audioUrl = `/api/tts?text=${encodeURIComponent(cleanedText)}&lang=${lang}`;
      fetch(audioUrl, { method: 'GET' }).catch(() => {});
    } catch (e) {}
  }

  // Speak with Alexa-style high-definition neural voice
  speak({
    text = '',
    category = '',
    subject = '',
    customRate = null,
    onStart = () => {},
    onEnd = () => {},
    onError = () => {}
  }) {
    this.stop();

    const lang = this.detectLanguage(text, category, subject);
    const isEnglish = lang.startsWith('en');
    const cleanedText = this.cleanTextForSpeech(text, isEnglish);

    if (!cleanedText) return false;

    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(cleanedText)}&lang=${lang}`;
      const audio = new Audio();
      this.currentAudio = audio;

      let started = false;

      audio.onplay = () => {
        started = true;
        if (this.onStateChange) this.onStateChange(true);
        onStart();
      };

      audio.onended = () => {
        this.currentAudio = null;
        if (this.onStateChange) this.onStateChange(false);
        onEnd();
      };

      audio.onerror = (e) => {
        console.warn('Audio streaming error:', e);
        this.currentAudio = null;
        if (this.onStateChange) this.onStateChange(false);
        if (onError) onError('Error al cargar la narración de Alexa');
      };

      // Iniciar reproducción tan pronto el búfer esté listo
      const tryPlay = () => {
        if (!started && this.currentAudio === audio) {
          audio.play().catch(err => {
            console.warn('Playback error:', err);
          });
        }
      };

      audio.addEventListener('canplay', tryPlay, { once: true });
      audio.addEventListener('loadeddata', tryPlay, { once: true });

      audio.src = audioUrl;
      audio.load();

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Si el audio está cargando, canplay lo reproducirá
        });
      }

      return true;
    } catch (e) {
      console.warn('Speech invocation error:', e);
      if (onError) onError(e.message);
      return false;
    }
  }

  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    if (this.onStateChange) this.onStateChange(false);
  }

  isSpeaking() {
    return Boolean(this.currentAudio && !this.currentAudio.paused);
  }
}

export const naturalSpeech = new NaturalSpeechService();
export default naturalSpeech;
