# 🎓 Software-Clases: AprendePlus & Gamificación Escolar

Plataforma educativa integral diseñada para dinamizar clases en colegios e instituciones educativas a través de gamificación interactiva, retos tipo ICFES, mapas satelitales en tiempo real, esquemas conceptuales y panel docente para seguimiento y calificaciones.

---

## 📂 Estructura del Repositorio

- **`educa-games-react/`**: Aplicación web SPA completa desarrollada con **React 18 + Vite + Tailwind CSS + Leaflet (Google Maps) + Lucide Icons + Canvas Confetti**.
  - **8 Materias Escolares con Retos Interactivos:**
    1. 🇨🇴 **Geografía de Colombia y el Mundo:** Exploración con Google Maps (capas de satélite, callejero y relieve topográfico) y puntos de interés nacional.
    2. 🏛️ **Historia de Colombia (Ruta Libertadora):** Batalla de Boyacá, Pantano de Vargas y eventos independentistas con fotos de alta resolución y datos clave.
    3. 📖 **Lenguaje y Literatura:** Comprensión de lectura en 3 niveles (literal, inferencial y crítico/convivencia), leyendas colombianas y Gabriel García Márquez.
    4. 📐 **Matemáticas y Finanzas Escolares:** Cálculo de presupuestos, áreas geométricas y fracciones con esquemas visuales interactivos (estilo Khan Academy).
    5. 🌿 **Ciencias Naturales y Medio Ambiente:** Biodiversidad colombiana, ciclos ecológicos y fotosíntesis.
    6. 🇺🇸 **Inglés (Reading Comprehension B1):** Historias contextualizadas con **síntesis de voz humana y pronunciación nativa (US/UK)**.
    7. 💻 **Tecnología e Informática:** Pensamiento computacional, algoritmos y ciberseguridad escolar.
    8. 🕊️ **Ética y Convivencia Ciudadana:** Resolución pacífica de conflictos, empatía e inclusión social.

  - **Características y Herramientas del Sistema:**
    - 🎙️ **Motor de Voz Humana Natural (`naturalSpeech.js`):** Pronunciación pedagógica clara para inglés y español sin distorsiones mecánicas, con selector de velocidad y tono cálido.
    - 🏆 **Podio y Leaderboard Estudiantil:** Clasificación en vivo por porcentaje de aciertos/errores y visualización clara de desempeño.
    - 👨‍🏫 **Panel Docente & Administrador:**
      - Monitoreo en vivo de todas las respuestas de los estudiantes (con indicación de aciertos y fallos).
      - Exportación de planilla de calificaciones según dimensiones curriculares (Saber Conocer 30%, Saber Hacer 40%, Saber Ser 30%).
      - Generador de códigos QR para acceso en el aula desde celulares y tablets.
      - Botón de reinicio y depuración para comenzar nuevas jornadas de clase.
    - 🎟️ **Sistema de Recompensas:** Vales de cafetería escolares canjeables al acumular 100 puntos.

- **`FORMATO PLANILLA CALIFICACIÓN GENERAL.xlsx`**: Formato de planilla oficial de calificaciones para el seguimiento del docente.

---

## 🚀 Puesta en Marcha (Instalación y Uso)

### Requisitos previos:
- [Node.js](https://nodejs.org/) (versión 18 o superior)
- `npm`

### Pasos de ejecución:

1. Entra a la carpeta del proyecto:
   ```bash
   cd educa-games-react
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre en tu navegador:
   - Local: `http://localhost:5173/`
   - O mediante el script `./iniciar.sh` para iniciar Vite junto con el túnel público de Cloudflare.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 18, Vite 6, Tailwind CSS
- **Mapas:** Leaflet, Google Maps Tiles API (Callejero, Satélite Híbrido, Relieve)
- **Audio & Voz:** Web Speech API optimizada (`SpeechSynthesisUtterance` con voces neuronales) y Web Audio API para efectos de sonido
- **Iconografía y Animaciones:** Lucide React, Canvas Confetti
