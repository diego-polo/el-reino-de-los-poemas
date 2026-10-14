# 🎨 Guía de Diseño, Estilos y Paleta de Colores
## Proyecto: *El Reino de los Poemas*

Este documento recopila y preserva **todos los colores, degradados, sombras, tipografías y efectos visuales** utilizados en el proyecto. 
También se encuentra disponible en formato CSS nativo en [`static/css/variables.css`](file:///D:/proyectos%20VsCode%20-%20copia/static/css/variables.css).

---

## 🌈 1. Fondos y Degradados Principales

| Elemento / Pantalla | Tipo | Código de Color / Estilo | Muestra Visual |
| :--- | :--- | :--- | :--- |
| **Fondo Global (El Reino)** | Radial Gradient con cuadrícula de puntos | `radial-gradient(rgba(0,0,0,0.15) 1.5px, transparent 1.5px)` + `radial-gradient(circle at center, #d6f5ff, #d6fff0)` | Celeste pastel a Menta pastel con trama de puntos |
| **Fondo Mona Jacinta** | Radial Gradient con cuadrícula de puntos | `radial-gradient(circle at center, #C3B1E1, #d6fff0)` | Lila suave a Menta pastel |
| **Fondo Actividades (Antes / Durante)** | Radial Gradient con cuadrícula de puntos | `radial-gradient(circle at center, #ffb5c0, #d6fff0)` | Rosa pastel a Menta pastel |
| **Juego: Alcanza una Estrella** | Linear Gradient nocturno espacial | `linear-gradient(135deg, #17134d, #302b82, #5d3fd3)` | Azul profundo a Violeta cósmico |
| **Juego: A jugar con las rimas** | Multi-radial + Linear Gradient | `radial-gradient(circle at top left, #fff7a8...)` + `linear-gradient(135deg, #7c4dff, #00bcd4)` | Violeta eléctrico a Cian vibrante con destellos amarillos |

---

## 🎴 2. Tarjetas de Poemas y Sombras Neón (`index.html`)

Cada tarjeta de poema tiene un color de fondo temático, una sombra neón característica y un color de texto exclusivo:

| Poema | Color de Tarjeta | Sombra Neón (Glow) | Color de Texto | Efecto de Texto |
| :--- | :--- | :--- | :--- | :--- |
| **El pasadizo secreto (Diagnóstico)** | `#f272ac` *(Rosa chicle)* | `rgba(34, 9, 157, 0.5)` | `#06402B` *(Verde pino)* | `text-shadow: 2px 2px 8px` con animación pulsante |
| **1. La Mona Jacinta** | `#bc4ed8` *(Púrpura)* | `1px 4px 20px #ff0000` *(Rojo neón)* | `#fffb00` *(Amarillo brillante)* | `text-shadow: 2px 2px 8px rgba(0,0,0,0.5)` |
| **2. De todos los animales** | `#329542` *(Verde bosque)* | `1px 4px 20px #953285` *(Magenta)* | `#ffeedb` *(Crema cálido)* | `text-shadow: 2px 2px 8px rgba(0,0,0,0.5)` |
| **3. Había un caldero lleno...** | `#DEBE42` *(Dorado ámbar)* | `1px 4px 20px #4262DE` *(Azul cobalto)* | `#2103e5` *(Azul eléctrico)* | `text-shadow: 0px 0px 4px rgba(0,0,0,0.5)` |
| **4. ¿Qué se pondrá osito?** | `#006DB2` *(Azul marino)* | `1px 4px 20px #B24500` *(Naranja quemado)* | `#ffe600` *(Amarillo oro)* | `text-shadow: 2px 2px 8px rgba(0,0,0,0.4)` |
| **5. La pobre viejecita** | `#e87f18` *(Naranja vivo)* | `1px 4px 20px #1881E8` *(Azul cielo)* | `#00f0ff` *(Cian neón)* | `text-shadow: 2px 2px 8px rgba(0,0,0,0.5)` |
| **Evaluación del entorno** | `#f272ac` *(Rosa chicle)* | `1px 4px 20px #72f2b8` *(Verde menta)* | `#800000` *(Granate / Vino)* | `text-shadow: 2px 2px 8px rgba(0,0,0,0.5)` |

---

## 🔘 3. Botones e Interacciones

### Botón Primario ("Ingresar" / "Mi Botón")
- **Fondo normal:** `#B2EBE0` *(Menta pastel)*
- **Color de texto:** `#000000` *(Negro)*
- **Borde:** `none`, `border-radius: 10px`
- **Fondo en hover:** `#00f0ff` *(Cian brillante)*
- **Transición:** `0.3s ease-in-out`

### Botón de Actividades ("Siguiente nivel" / "Siguiente juego")
- **Fondo normal:** `#b38cdc` *(Lavanda pastel)*
- **Color de texto:** `#000000` *(Negro)*
- **Fondo en hover:** `#27103f` *(Ciruela noche)*
- **Color de texto en hover:** `#ffffff` *(Blanco)*
- **Transición:** `0.3s ease-in-out`

### Botón Reiniciar Juego
- **Fondo normal:** `#ffffff` *(Blanco)*
- **Color de texto:** `#302b82` *(Azul medianoche)*
- **Fondo en hover:** `#eeeeee` *(Gris claro suave)*
- **Efecto active:** `transform: scale(0.96)`

---

## ⭐ 4. Juegos y Minijuegos

### Juego 1: Alcanza una Estrella
- **Contenedor:** Fondo degradado azul-violeta nocturno (`#17134d` -> `#302b82` -> `#5d3fd3`).
- **Frente de la estrella:** Degradado dorado `linear-gradient(145deg, #ffd700, #ff9f00)`.
- **Dorso de la tarjeta (Pregunta):** Fondo blanco `#ffffff` con texto azul oscuro `#25205f`.
- **Insignia numérica:** Círculo morado `#5d3fd3` con número blanco centrado.
- **Efecto de volteo 3D:** `perspective: 1000px`, `transform: rotateY(180deg)`, `transform-style: preserve-3d`.

### Juego 2: A Jugar con las Rimas
- **Caja principal:** Blanco translúcido `rgba(255, 255, 255, 0.96)` con esquinas curvas de `30px`.
- **Título:** Morado vibrante `#673ab7`.
- **Respuesta Correcta:** Verde `#4caf50` con animación de pulso y escala `scale(1.1)`.
- **Respuesta Incorrecta:** Rojo `#f44336` con animación `shake` (sacudida horizontal).
- **Mascota reactiva:** Emojis dinámicos (🐸, 😎, 🤔, 💡).

---

## 🔤 5. Tipografías del Sistema

1. **Titulares Principales:** `'Poppins', sans-serif` (pesos 600, 700)
2. **Subtítulos y Textos:** `'Lexend', sans-serif` (pesos 300, 400, 600)
3. **Versos y Poemas:** `'Gill Sans', 'Gill Sans MT', Calibri, sans-serif`
4. **Juegos y Marcadores:** `'Trebuchet MS', Arial, sans-serif` y `Verdana, Geneva, Tahoma`

---

## ✨ 6. Animaciones Definidas

- `@keyframes rotarFondos`: Carrusel automático de 25 segundos en el encabezado principal que rota secuencialmente las portadas de todos los poemas.
- `@keyframes pulsoSombra`: Pulso lumínico en los títulos principales alternando entre verde esmeralda (`#008000`) y azul real (`rgba(43, 1, 255, 0.85)`).
- `hover` general de tarjetas: `transform: scale(1.05); transition: 0.3s ease-in-out`.
- `hover` de video e imágenes: Elevación suave `scale(1.05)` con sombra difuminada.

---

## 🏆 7. Sistema de Gamificación, Base de Datos y Bloqueo Secuencial

### 🔐 Sistema de Bloqueo del Pasadizo Secreto
1. **Regla de oro:** Cuando un nuevo estudiante inicia sesión, todas las tarjetas de poemas en `index.html` están **bloqueadas con candado 🔒**.
2. **Desbloqueo obligatorio:** El estudiante debe ingresar primero a **"El pasadizo secreto"** (`template/diagnostico/poema.html`), abrir el Cofre Mágico, leer el poema diagnóstico *"La Mariposa"* de María Elena Walsh y responder las preguntas diagnósticas junto al Semáforo de Emociones.
3. **Recompensa:** Al completar el pasadizo, el estudiante gana **+50 puntos** y el sistema desbloquea automáticamente todos los poemas del Reino.

### 💾 Base de Datos (`IndexedDB` + `localStorage`)
- **Gestor:** [`static/js/db.js`](file:///D:/proyectos%20VsCode%20-%20copia/static/js/db.js)
- **Base de datos:** `ReinoPoemasDB`
- **Tabla `usuarios`:** Almacena nombre completo, usuario, contraseña, grado (2° o 3°) y avatar.
- **Tabla `progreso`:** Almacena puntos totales acumulados, estado del pasadizo (`true`/`false`), porcentaje de avance (0% a 100%) y desglose de actividades completadas con fecha.
- **Usuario Demo precargado:** `estudiante1` con contraseña `123`.

### ⭐ Sistema de Puntos por Actividad
- **Pasadizo Secreto:** `+50 pts`
- **La Mona Jacinta:**
  - Alcanza una estrella: `+20 pts`
  - Juego de rimas: `+10 a +100 pts` (según aciertos)
  - Encontrar rimas: `+25 pts`
  - Quiz de la mona: `+30 pts`
  - Transferencia (Crear verso): `+25 pts`
- **De todos los animales:**
  - Exploración (Sonidos de animales): `+20 pts`
  - Estructuración (Froggy Jumps): `+25 pts`
  - Transferencia (Escape Room de la Granja): `+30 pts`
- **Había un caldero lleno...:**
  - Exploración (Pócima mágica): `+20 pts`
  - Estructuración (Lectura con emociones): `+25 pts`
  - Transferencia (Crear caldero poético): `+30 pts`
- **La pobre viejecita:**
  - Exploración (Puzle del personaje): `+20 pts`
  - Estructuración (Quiz Millonario): `+30 pts`
  - Transferencia (Debate crítico): `+25 pts`
- **¿Qué se pondrá osito?:**
  - Exploración (Tréboles de la suerte): `+20 pts`
  - Estructuración (Cuento y comprensión): `+25 pts`
  - Transferencia (Viste a Osito y secuencia): `+30 pts`
- **Evaluación Final de la clase:** `+50 pts` + Diploma Caldista descargable e imprimible.

