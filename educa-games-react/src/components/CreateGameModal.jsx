import React, { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

export default function CreateGameModal({ onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('quiz'); // quiz, map, reading
  const [subject, setSubject] = useState('Saber Conocer - Ciencias Naturales');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80');
  
  // Dynamic Questions
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: '¿Cuál es la idea principal o concepto clave?',
      placeName: 'Parque Nacional Natural Los Nevados',
      country: 'Colombia',
      region: 'Eje Cafetero',
      lat: 4.8872,
      lng: -75.3672,
      zoom: 13,
      clue: 'Ecosistema de glaciares andinos y volcanes activos.',
      options: ['Opción Correcta', 'Opción Alternativa 1', 'Opción Alternativa 2', 'Opción Alternativa 3'],
      answer: 0,
      curiosity: '¡Excelente análisis y deducción!'
    }
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: questions.length + 1,
        question: `Pregunta número ${questions.length + 1}...`,
        placeName: 'Lugar de Colombia o el Mundo',
        country: 'Colombia',
        region: 'Región Andina',
        lat: 4.5709,
        lng: -74.2973,
        zoom: 12,
        clue: 'Pista geográfica o histórica.',
        options: ['Opción A (Correcta)', 'Opción B', 'Opción C', 'Opción D'],
        answer: 0,
        curiosity: 'Dato curioso o moraleja didáctica.'
      }
    ]);
  };

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = value;
    setQuestions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor escribe un título para el juego');
      return;
    }

    const newGame = {
      id: 'juego-' + Date.now(),
      title: title.trim(),
      type,
      subject: subject.trim(),
      description: description.trim() || 'Desafío interactivo escolar.',
      coverImage: coverImage.trim(),
      badge: 'Medalla de Honor',
      pointsPerSuccess: 20,
      questions
    };

    onSave(newGame);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 max-w-2xl w-full p-6 sm:p-8 rounded-3xl shadow-2xl relative my-8">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 block mb-1">
            Panel de Creación Docente
          </span>
          <h3 className="text-xl font-bold text-white">Diseñar Nuevo Juego Educativo</h3>
          <p className="text-xs text-slate-400">Personaliza preguntas, coordenadas de mapas o lecturas para tus estudiantes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Título del Juego:</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Expedición por los Ríos y Páramos de Colombia" 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tipo de Juego:</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="quiz">Trivia / Ciencias (Saber Conocer)</option>
                <option value="map">Turismo con Mapa Satelital Real (Saber Hacer)</option>
                <option value="reading">Comprensión Lectora (Mitos y Misterios)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Asignatura / Dimensión:</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: Saber Conocer - Ciencias Naturales" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Descripción para el Estudiante:</label>
            <textarea 
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué aprenderán en este reto..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">URL de Imagen de Portada (Opcional):</label>
            <input 
              type="url" 
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          {/* Questions Section */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-white text-sm">Preguntas del Reto ({questions.length})</h4>
              <button
                type="button"
                onClick={addQuestion}
                className="text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 px-3 py-1 rounded-lg flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Pregunta
              </button>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {questions.map((q, qIdx) => (
                <div key={q.id || qIdx} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-400 text-xs">Pregunta #{qIdx + 1}</span>
                    {questions.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeQuestion(qIdx)}
                        className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </button>
                    )}
                  </div>

                  <input 
                    type="text"
                    value={q.question}
                    onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                    placeholder="Enunciado de la pregunta..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
                  />

                  {type === 'map' && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input 
                        type="text"
                        value={q.placeName}
                        onChange={(e) => handleQuestionChange(qIdx, 'placeName', e.target.value)}
                        placeholder="Nombre del Lugar..."
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white"
                      />
                      <input 
                        type="text"
                        value={q.clue}
                        onChange={(e) => handleQuestionChange(qIdx, 'clue', e.target.value)}
                        placeholder="Pista del lugar..."
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-1.5">
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${optIdx === q.answer ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-700 text-slate-300'}`}>
                          {optIdx === q.answer ? '✓' : String.fromCharCode(65 + optIdx)}
                        </span>
                        <input 
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          placeholder={`Opción ${String.fromCharCode(65 + optIdx)}`}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white"
                        />
                      </div>
                    ))}
                  </div>

                  <input 
                    type="text"
                    value={q.curiosity}
                    onChange={(e) => handleQuestionChange(qIdx, 'curiosity', e.target.value)}
                    placeholder="Dato curioso o retroalimentación..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-white text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
            >
              <Save className="w-4 h-4" />
              <span>Guardar y Publicar Reto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
