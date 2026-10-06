// Voice Command Event Bus
// Permite que cualquier componente activo (App, GameRunner, TeacherDashboard, Lobby)
// responda inmediatamente a las órdenes de voz del docente.

class VoiceCommandBus {
  constructor() {
    this.listeners = new Map();
  }

  // Registrar un manejador para una acción específica
  on(action, callback) {
    if (!this.listeners.has(action)) {
      this.listeners.set(action, new Set());
    }
    this.listeners.get(action).add(callback);

    // Retorna función para desuscribir limpiamente en useEffect
    return () => {
      const set = this.listeners.get(action);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.listeners.delete(action);
      }
    };
  }

  // Emitir una orden de voz con parámetros opcionales
  emit(action, payload = null) {
    const set = this.listeners.get(action);
    if (!set || set.size === 0) {
      return false;
    }
    set.forEach(callback => {
      try {
        callback(payload);
      } catch (err) {
        console.error(`Error ejecutando comando de voz '${action}':`, err);
      }
    });
    return true;
  }
}

export const voiceBus = new VoiceCommandBus();
export default voiceBus;
