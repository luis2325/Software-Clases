// High-Quality Human-Like Speech Synthesis Utility
// Optimizado para una pronunciación natural, pedagógica y cálida (sin voces robóticas espeluznantes)

class NaturalSpeechService {
  constructor() {
    this.voices = [];
    this.currentUtterance = null;
    this.currentAudio = null;
    this.selectedVoice = null;
    this.rate = 0.96;
    this.pitch = 1.04;
    this.onStateChange = null;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices() || [];
  }

  getVoices() {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices() || [];
    }
    return this.voices;
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

  // Find best available human-like voice for target language
  findBestVoice(lang = 'es-CO') {
    const allVoices = this.getVoices();
    if (!allVoices || allVoices.length === 0) return null;

    const isEnglish = lang.startsWith('en');
    const targetPrefix = isEnglish ? 'en' : 'es';

    // Filter matching language
    const langVoices = allVoices.filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(targetPrefix));
    const pool = langVoices.length > 0 ? langVoices : allVoices;

    // Score voices: prioritize Natural, Neural, Google, Apple, Microsoft Online
    const scored = pool.map(voice => {
      let score = 0;
      const name = voice.name.toLowerCase();
      const voiceLang = (voice.lang || '').toLowerCase().replace('_', '-');

      // Heavy penalty for crude Linux espeak/festival robotic engines
      if (name.includes('espeak') || name.includes('klatt') || name.includes('mbrola')) {
        score -= 100;
      }

      // Premium online / neural / natural voices
      if (name.includes('natural') || name.includes('neural') || name.includes('online')) score += 50;
      if (name.includes('google')) score += 35;
      if (name.includes('apple') || name.includes('siri')) score += 30;

      // High-quality English voice names
      if (isEnglish) {
        if (name.includes('jenny') || name.includes('guy') || name.includes('aria') || name.includes('ana')) score += 25;
        if (name.includes('samantha') || name.includes('alex') || name.includes('karen') || name.includes('daniel')) score += 20;
        if (voiceLang.includes('en-us')) score += 10;
        else if (voiceLang.includes('en-gb')) score += 8;
      } else {
        // High-quality Spanish voice names
        if (name.includes('salma') || name.includes('sabina') || name.includes('dalia') || name.includes('jorge')) score += 25;
        if (name.includes('paulina') || name.includes('monica') || name.includes('soledad') || name.includes('diego')) score += 20;
        if (voiceLang.includes('es-co')) score += 15;
        else if (voiceLang.includes('es-419') || voiceLang.includes('es-mx') || voiceLang.includes('es-us')) score += 10;
      }

      return { voice, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.voice || allVoices[0] || null;
  }

  // Pre-process text to make pronunciation smooth and pedagogically pleasant
  cleanTextForSpeech(text, isEnglish) {
    if (!text) return '';

    let cleaned = text
      // Replace markdown symbols
      .replace(/[*#_`~[\]]/g, '')
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

  // Speak with Alexa-style high-definition neural voice (with local fallback)
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

    // 1. Motor Principal: Voz Neuronal Estudio Estilo Alexa (/api/tts)
    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(cleanedText)}&lang=${lang}`;
      const audio = new Audio();
      this.currentAudio = audio;

      audio.onplay = () => {
        if (this.onStateChange) this.onStateChange(true);
        onStart();
      };

      audio.onended = () => {
        this.currentAudio = null;
        if (this.onStateChange) this.onStateChange(false);
        onEnd();
      };

      audio.onerror = (e) => {
        console.warn('TTS streaming failed, falling back to local speech synthesis:', e);
        this.currentAudio = null;
        this.speakFallbackLocal({ cleanedText, lang, isEnglish, customRate, onStart, onEnd, onError });
      };

      audio.src = audioUrl;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Neural audio play prevented, falling back to local:', err);
          this.currentAudio = null;
          this.speakFallbackLocal({ cleanedText, lang, isEnglish, customRate, onStart, onEnd, onError });
        });
      }
      return true;
    } catch (e) {
      return this.speakFallbackLocal({ cleanedText, lang, isEnglish, customRate, onStart, onEnd, onError });
    }
  }

  // Motor Secundario: Síntesis local del navegador (fallback de seguridad)
  speakFallbackLocal({
    cleanedText,
    lang,
    isEnglish,
    customRate,
    onStart,
    onEnd,
    onError
  }) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onError) onError('Tu navegador no cuenta con soporte de síntesis de voz.');
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = lang;

    const bestVoice = this.selectedVoice || this.findBestVoice(lang);
    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang || lang;
    }

    utterance.pitch = isEnglish ? 1.06 : 1.02;
    utterance.rate = customRate || (isEnglish ? 0.94 : 0.96);
    utterance.volume = 1.0;

    utterance.onstart = () => {
      if (this.onStateChange) this.onStateChange(true);
      onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (this.onStateChange) this.onStateChange(false);
      onEnd();
    };

    utterance.onerror = (err) => {
      this.currentUtterance = null;
      if (this.onStateChange) this.onStateChange(false);
      onError(err);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
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
    this.currentUtterance = null;
    if (this.onStateChange) this.onStateChange(false);
  }

  isSpeaking() {
    if (this.currentAudio && !this.currentAudio.paused) return true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }
    return false;
  }
}

export const naturalSpeech = new NaturalSpeechService();
export default naturalSpeech;
