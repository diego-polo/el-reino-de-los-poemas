/**
 * ==========================================================================
 * LÓGICA INTERACTIVA - LA POBRE VIEJECITA (Rafael Pombo)
 * 1. Rompecabezas 12 piezas (4x3) con imagen y diseño fiel a la guía
 * 2. Quiz Millonario (5 preguntas con comodines y diseño millonario)
 * 3. Juego de Memory (Encuentra las parejas basado en la viejecita)
 * 4. Súper Viejecita Bros (Recreación de Mario Bros 1 con poderes de medicina)
 * ==========================================================================
 */

(function () {
    // Polyfill seguro de roundRect para Canvas
    if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
            if (typeof r === 'undefined') r = 0;
            if (typeof r === 'number') r = [r, r, r, r];
            const rad = r[0] || 0;
            this.beginPath();
            this.moveTo(x + rad, y);
            this.arcTo(x + w, y, x + w, y + h, rad);
            this.arcTo(x + w, y + h, x, y + h, rad);
            this.arcTo(x, y + h, x, y, rad);
            this.arcTo(x, y, x + w, y, rad);
            this.closePath();
            return this;
        };
    }

    // Helper de sonido seguro
    function sonidoPop() {
        if (window.GameJuice && typeof window.GameJuice.playPop === 'function') {
            window.GameJuice.playPop();
        }
    }
    function sonidoAcierto() {
        if (window.GameJuice && typeof window.GameJuice.playCorrect === 'function') {
            window.GameJuice.playCorrect();
        }
    }
    function sonidoError() {
        if (window.GameJuice && typeof window.GameJuice.playWrong === 'function') {
            window.GameJuice.playWrong();
        }
    }
    function lanzarConfeti() {
        if (window.GameJuice && typeof window.GameJuice.lanzarConfeti === 'function') {
            window.GameJuice.lanzarConfeti(60);
        }
    }

    // ==========================================================================
    // 1. EXPLORACIÓN: ROMPECABEZAS (12 PIEZAS, 4 COLUMNAS x 3 FILAS)
    // ==========================================================================
    const PUZZLE_COLS = 4;
    const PUZZLE_ROWS = 3;
    const PUZZLE_TOTAL = PUZZLE_COLS * PUZZLE_ROWS; // 12
    const PUZZLE_IMG_SRC = '/assets/img/poemas/la-pobre-viejecita.jpeg';

    let puzzleImg = new Image();
    puzzleImg.crossOrigin = 'anonymous';
    puzzleImg.src = PUZZLE_IMG_SRC;

    let puzzleColocadas = new Array(PUZZLE_TOTAL).fill(false);
    let piezaSeleccionadaIdx = null;
    let mostrarGuia = false;

    // Matriz de pestañas (tabs: +1 afuera, -1 adentro, 0 plano)
    // Reproduce la configuración exacta de rompecabezas-guia.jpg
    const verticalEdges = [
        [1, 1, 1],   // fila 0: col0-1 -> derecha, col1-2 -> derecha, col2-3 -> derecha
        [-1, -1, -1], // fila 1: col0-1 -> izquierda, col1-2 -> izquierda, col2-3 -> izquierda
        [1, 1, 1]    // fila 2: col0-1 -> derecha, col1-2 -> derecha, col2-3 -> derecha
    ];
    const horizontalEdges = [
        [1, -1, 1, -1], // fila 0 a 1: col0 -> abajo, col1 -> arriba, col2 -> abajo, col3 -> arriba
        [1, -1, 1, -1]  // fila 1 a 2: col0 -> abajo, col1 -> arriba, col2 -> abajo, col3 -> arriba
    ];

    function obtenerBordesPieza(col, row) {
        // top, right, bottom, left
        let top = 0;
        let right = 0;
        let bottom = 0;
        let left = 0;

        if (row > 0) top = -horizontalEdges[row - 1][col];
        if (row < PUZZLE_ROWS - 1) bottom = horizontalEdges[row][col];
        if (col < PUZZLE_COLS - 1) right = verticalEdges[row][col];
        if (col > 0) left = -verticalEdges[row][col - 1];

        return { top, right, bottom, left };
    }

    // Trazar el camino de una pieza con curvas de rompecabezas
    function trazarCaminoPieza(ctx, x, y, w, h, bordes) {
        const { top, right, bottom, left } = bordes;
        const tabSizeX = w * 0.22;
        const tabSizeY = h * 0.22;

        ctx.beginPath();
        ctx.moveTo(x, y);

        // Borde Superior (x, y) -> (x + w, y)
        if (top === 0) {
            ctx.lineTo(x + w, y);
        } else {
            const dir = top; // +1 hacia afuera (arriba, -Y), -1 hacia adentro (+Y)
            ctx.lineTo(x + w * 0.38, y);
            ctx.bezierCurveTo(
                x + w * 0.36, y - dir * tabSizeY * 0.3,
                x + w * 0.30, y - dir * tabSizeY,
                x + w * 0.50, y - dir * tabSizeY
            );
            ctx.bezierCurveTo(
                x + w * 0.70, y - dir * tabSizeY,
                x + w * 0.64, y - dir * tabSizeY * 0.3,
                x + w * 0.62, y
            );
            ctx.lineTo(x + w, y);
        }

        // Borde Derecho (x + w, y) -> (x + w, y + h)
        if (right === 0) {
            ctx.lineTo(x + w, y + h);
        } else {
            const dir = right; // +1 hacia afuera (derecha, +X), -1 hacia adentro (-X)
            ctx.lineTo(x + w, y + h * 0.38);
            ctx.bezierCurveTo(
                x + w + dir * tabSizeX * 0.3, y + h * 0.36,
                x + w + dir * tabSizeX, y + h * 0.30,
                x + w + dir * tabSizeX, y + h * 0.50
            );
            ctx.bezierCurveTo(
                x + w + dir * tabSizeX, y + h * 0.70,
                x + w + dir * tabSizeX * 0.3, y + h * 0.64,
                x + w, y + h * 0.62
            );
            ctx.lineTo(x + w, y + h);
        }

        // Borde Inferior (x + w, y + h) -> (x, y + h)
        if (bottom === 0) {
            ctx.lineTo(x, y + h);
        } else {
            const dir = bottom; // +1 hacia afuera (abajo, +Y), -1 hacia adentro (-Y)
            ctx.lineTo(x + w * 0.62, y + h);
            ctx.bezierCurveTo(
                x + w * 0.64, y + h + dir * tabSizeY * 0.3,
                x + w * 0.70, y + h + dir * tabSizeY,
                x + w * 0.50, y + h + dir * tabSizeY
            );
            ctx.bezierCurveTo(
                x + w * 0.30, y + h + dir * tabSizeY,
                x + w * 0.36, y + h + dir * tabSizeY * 0.3,
                x + w * 0.38, y + h
            );
            ctx.lineTo(x, y + h);
        }

        // Borde Izquierdo (x, y + h) -> (x, y)
        if (left === 0) {
            ctx.lineTo(x, y);
        } else {
            const dir = left; // +1 hacia afuera (izquierda, -X), -1 hacia adentro (+X)
            ctx.lineTo(x, y + h * 0.62);
            ctx.bezierCurveTo(
                x - dir * tabSizeX * 0.3, y + h * 0.64,
                x - dir * tabSizeX, y + h * 0.70,
                x - dir * tabSizeX, y + h * 0.50
            );
            ctx.bezierCurveTo(
                x - dir * tabSizeX, y + h * 0.30,
                x - dir * tabSizeX * 0.3, y + h * 0.36,
                x, y + h * 0.38
            );
            ctx.lineTo(x, y);
        }

        ctx.closePath();
    }

    function dibujarTablero() {
        const canvas = document.getElementById('puzzleBoardCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        const cellW = W / PUZZLE_COLS;
        const cellH = H / PUZZLE_ROWS;

        ctx.clearRect(0, 0, W, H);

        // Fondo oscuro del tablero
        ctx.fillStyle = '#2d1e18';
        ctx.fillRect(0, 0, W, H);

        // Si la guía está activa o para dar ayuda suave
        if (puzzleImg.complete && puzzleImg.naturalWidth > 0) {
            ctx.save();
            ctx.globalAlpha = mostrarGuia ? 0.35 : 0.08;
            ctx.drawImage(puzzleImg, 0, 0, W, H);
            ctx.restore();
        }

        // Dibujar cada celda del tablero
        for (let r = 0; r < PUZZLE_ROWS; r++) {
            for (let c = 0; c < PUZZLE_COLS; c++) {
                const idx = r * PUZZLE_COLS + c;
                const bx = c * cellW;
                const by = r * cellH;
                const bordes = obtenerBordesPieza(c, r);

                if (puzzleColocadas[idx]) {
                    // Pieza correctamente colocada: dibujarla con su recorte
                    ctx.save();
                    trazarCaminoPieza(ctx, bx, by, cellW, cellH, bordes);
                    ctx.clip();
                    if (puzzleImg.complete && puzzleImg.naturalWidth > 0) {
                        ctx.drawImage(puzzleImg, 0, 0, W, H);
                    } else {
                        ctx.fillStyle = '#ffb74d';
                        ctx.fillRect(0, 0, W, H);
                    }
                    ctx.restore();

                    // Trazo sutil de unión
                    ctx.save();
                    trazarCaminoPieza(ctx, bx, by, cellW, cellH, bordes);
                    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    ctx.restore();
                } else {
                    // Celda vacía: dibujar silueta punteada
                    ctx.save();
                    trazarCaminoPieza(ctx, bx, by, cellW, cellH, bordes);
                    ctx.strokeStyle = (piezaSeleccionadaIdx === idx) ? '#ffd54f' : 'rgba(255, 204, 128, 0.4)';
                    ctx.lineWidth = (piezaSeleccionadaIdx === idx) ? 3 : 1.5;
                    if (piezaSeleccionadaIdx === idx) {
                        ctx.fillStyle = 'rgba(255, 213, 79, 0.15)';
                        ctx.fill();
                    }
                    ctx.setLineDash([4, 4]);
                    ctx.stroke();

                    // Número suave de guía
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                    ctx.font = 'bold 16px Poppins, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText((idx + 1).toString(), bx + cellW / 2, by + cellH / 2);
                    ctx.restore();
                }
            }
        }
    }

    // Crear un canvas para una pieza individual en el banco
    function crearCanvasPieza(idx) {
        const r = Math.floor(idx / PUZZLE_COLS);
        const c = idx % PUZZLE_COLS;
        const bordes = obtenerBordesPieza(c, r);

        const canvas = document.createElement('canvas');
        canvas.className = 'puzzle-piece-canvas';
        canvas.dataset.idx = idx.toString();
        canvas.draggable = true;

        // Dimensiones base de la pieza (con margen para lengüetas)
        const baseW = 100;
        const baseH = 75;
        const padX = baseW * 0.35;
        const padY = baseH * 0.35;

        canvas.width = baseW + padX * 2;
        canvas.height = baseH + padY * 2;
        canvas.style.width = `${Math.round(canvas.width * 0.72)}px`;
        canvas.style.height = `${Math.round(canvas.height * 0.72)}px`;

        const ctx = canvas.getContext('2d');

        // Dibujar pieza recortada
        ctx.save();
        trazarCaminoPieza(ctx, padX, padY, baseW, baseH, bordes);
        ctx.clip();

        if (puzzleImg.complete && puzzleImg.naturalWidth > 0) {
            // Coordenadas en la imagen fuente completa
            const srcCellW = puzzleImg.naturalWidth / PUZZLE_COLS;
            const srcCellH = puzzleImg.naturalHeight / PUZZLE_ROWS;
            const srcPadX = srcCellW * 0.35;
            const srcPadY = srcCellH * 0.35;

            ctx.drawImage(
                puzzleImg,
                c * srcCellW - srcPadX,
                r * srcCellH - srcPadY,
                srcCellW + srcPadX * 2,
                srcCellH + srcPadY * 2,
                0,
                0,
                canvas.width,
                canvas.height
            );
        } else {
            ctx.fillStyle = '#ffab91';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.restore();

        // Borde oscuro estilo rompecabezas
        ctx.save();
        trazarCaminoPieza(ctx, padX, padY, baseW, baseH, bordes);
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();

        // Eventos: Clic para seleccionar
        canvas.addEventListener('click', (e) => {
            e.stopPropagation();
            seleccionarPieza(idx);
        });

        // Eventos Drag & Drop
        canvas.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', idx.toString());
            canvas.classList.add('dragging');
            seleccionarPieza(idx);
        });
        canvas.addEventListener('dragend', () => {
            canvas.classList.remove('dragging');
        });

        return canvas;
    }

    function seleccionarPieza(idx) {
        if (puzzleColocadas[idx]) return;

        if (piezaSeleccionadaIdx === idx) {
            // Deseleccionar
            piezaSeleccionadaIdx = null;
        } else {
            piezaSeleccionadaIdx = idx;
            sonidoPop();
        }

        actualizarPiezasBancoUI();
        dibujarTablero();
    }

    function actualizarPiezasBancoUI() {
        const tray = document.getElementById('puzzleTray');
        if (!tray) return;

        tray.querySelectorAll('.puzzle-piece-canvas').forEach((c) => {
            const pIdx = parseInt(c.dataset.idx, 10);
            if (pIdx === piezaSeleccionadaIdx) {
                c.classList.add('seleccionada');
            } else {
                c.classList.remove('seleccionada');
            }
        });
    }

    function poblarBancoPiezas() {
        const tray = document.getElementById('puzzleTray');
        if (!tray) return;
        tray.innerHTML = '';

        // Índices no colocados barajados
        const disponibles = [];
        for (let i = 0; i < PUZZLE_TOTAL; i++) {
            if (!puzzleColocadas[i]) disponibles.push(i);
        }

        // Barajar aleatoriamente
        for (let i = disponibles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [disponibles[i], disponibles[j]] = [disponibles[j], disponibles[i]];
        }

        if (disponibles.length === 0) {
            tray.innerHTML = '<span class="puzzle-tray-placeholder">🎉 ¡Todas las piezas han sido colocadas con éxito!</span>';
            return;
        }

        disponibles.forEach((idx) => {
            const pCanvas = crearCanvasPieza(idx);
            tray.appendChild(pCanvas);
        });

        actualizarPiezasBancoUI();
    }

    async function colocarPieza(idx) {
        if (puzzleColocadas[idx]) return;

        puzzleColocadas[idx] = true;
        piezaSeleccionadaIdx = null;
        sonidoAcierto();

        // Actualizar contador
        const colocadasCount = puzzleColocadas.filter(Boolean).length;
        const contadorEl = document.getElementById('puzzleContador');
        if (contadorEl) contadorEl.textContent = `${colocadasCount} / ${PUZZLE_TOTAL}`;

        poblarBancoPiezas();
        dibujarTablero();

        // Verificar si completó el rompecabezas
        if (colocadasCount === PUZZLE_TOTAL) {
            const msg = document.getElementById('msgPuzzle');
            if (msg) {
                msg.textContent = '🎉 ¡Increíble! Has armado completamente el rompecabezas de La Pobre Viejecita (+30 pts).';
                msg.className = 'msg-feedback exito';
            }
            lanzarConfeti();
            if (window.ReinoDB && typeof window.ReinoDB.registrarPuntos === 'function') {
                await window.ReinoDB.registrarPuntos('viejecita_puzzle', 30);
            }
        }
    }

    function inicializarRompecabezas() {
        const canvas = document.getElementById('puzzleBoardCanvas');
        if (!canvas) return;

        // Tamaño de alta resolución
        canvas.width = 640;
        canvas.height = 480;

        puzzleImg.onload = () => {
            dibujarTablero();
            poblarBancoPiezas();
        };
        if (puzzleImg.complete && puzzleImg.naturalWidth > 0) {
            dibujarTablero();
            poblarBancoPiezas();
        }

        // Clic en el tablero: ubicar pieza seleccionada
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.clientX - rect.left;
            const clientY = e.clientY - rect.top;

            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const clickX = clientX * scaleX;
            const clickY = clientY * scaleY;

            const cellW = canvas.width / PUZZLE_COLS;
            const cellH = canvas.height / PUZZLE_ROWS;

            const col = Math.floor(clickX / cellW);
            const row = Math.floor(clickY / cellH);

            if (col >= 0 && col < PUZZLE_COLS && row >= 0 && row < PUZZLE_ROWS) {
                const targetIdx = row * PUZZLE_COLS + col;

                if (piezaSeleccionadaIdx !== null) {
                    if (piezaSeleccionadaIdx === targetIdx) {
                        colocarPieza(targetIdx);
                    } else {
                        sonidoError();
                        const msg = document.getElementById('msgPuzzle');
                        if (msg) {
                            msg.textContent = '🔍 Esa pieza no va en esa casilla. ¡Busca la forma y los colores adecuados!';
                            msg.className = 'msg-feedback error';
                            setTimeout(() => { if (msg.textContent.includes('no va')) msg.textContent = ''; }, 2500);
                        }
                    }
                } else if (!puzzleColocadas[targetIdx]) {
                    // Seleccionar automáticamente si está en el banco
                    seleccionarPieza(targetIdx);
                }
            }
        });

        // Soporte Drag & Drop sobre el canvas del tablero
        canvas.addEventListener('dragover', (e) => e.preventDefault());
        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
            if (isNaN(draggedIdx)) return;

            const rect = canvas.getBoundingClientRect();
            const clientX = e.clientX - rect.left;
            const clientY = e.clientY - rect.top;
            const cellW = canvas.width / PUZZLE_COLS;
            const cellH = canvas.height / PUZZLE_ROWS;
            const col = Math.floor((clientX * (canvas.width / rect.width)) / cellW);
            const row = Math.floor((clientY * (canvas.height / rect.height)) / cellH);
            const targetIdx = row * PUZZLE_COLS + col;

            if (draggedIdx === targetIdx) {
                colocarPieza(targetIdx);
            } else {
                sonidoError();
                const msg = document.getElementById('msgPuzzle');
                if (msg) {
                    msg.textContent = '🔍 Esa pieza pertenece a otra posición del rompecabezas.';
                    msg.className = 'msg-feedback error';
                    setTimeout(() => { if (msg.textContent.includes('pertenece')) msg.textContent = ''; }, 2500);
                }
            }
        });

        // Botón: Ver Guía
        const btnGuia = document.getElementById('btnPuzzleGuia');
        if (btnGuia) {
            btnGuia.addEventListener('click', () => {
                mostrarGuia = !mostrarGuia;
                btnGuia.textContent = mostrarGuia ? '👁️ Ocultar Guía' : '👁️ Ver Guía';
                dibujarTablero();
            });
        }

        // Botón: Mezclar
        const btnMezclar = document.getElementById('btnPuzzleMezclar');
        if (btnMezclar) {
            btnMezclar.addEventListener('click', () => {
                piezaSeleccionadaIdx = null;
                poblarBancoPiezas();
                dibujarTablero();
                sonidoPop();
            });
        }

        // Botón: Pista (máximo 2 pistas por juego)
        let pistasPuzzleRestantes = 2;
        const btnPista = document.getElementById('btnPuzzlePista');
        if (btnPista) {
            btnPista.textContent = `💡 Pista (${pistasPuzzleRestantes} disp.)`;
            btnPista.addEventListener('click', () => {
                const msg = document.getElementById('msgPuzzle');
                if (pistasPuzzleRestantes <= 0) {
                    sonidoError();
                    if (msg) {
                        msg.textContent = '⚠️ Ya has usado tus 2 pistas. ¡Tú puedes completar el rompecabezas!';
                        msg.className = 'msg-feedback';
                        setTimeout(() => { if (msg.textContent.includes('usado')) msg.textContent = ''; }, 3000);
                    }
                    return;
                }

                const pendientes = [];
                for (let i = 0; i < PUZZLE_TOTAL; i++) {
                    if (!puzzleColocadas[i]) pendientes.push(i);
                }
                if (pendientes.length > 0) {
                    const randomIdx = pendientes[Math.floor(Math.random() * pendientes.length)];
                    colocarPieza(randomIdx);
                    pistasPuzzleRestantes--;
                    btnPista.textContent = pistasPuzzleRestantes > 0 
                        ? `💡 Pista (${pistasPuzzleRestantes} disp.)` 
                        : '💡 Pista (Agotadas)';
                    if (pistasPuzzleRestantes <= 0) {
                        btnPista.disabled = true;
                    }
                }
            });
        }
    }

    // ==========================================================================
    // 2. ESTRUCTURACIÓN: QUIZ MILLONARIO (5 PREGUNTAS ALEATORIAS CON A, B, C, D)
    // ==========================================================================
    const BANCO_QUIZ_MILLONARIO = [
        {
            pregunta: "¿Por qué el autor dice con ironía que \"no tenía qué comer\"?",
            opciones: [
                { texto: "Porque comía carnes, frutas, dulces y tortas en abundancia", correcta: true },
                { texto: "Porque pasaba mucha hambre en su casa", correcta: false },
                { texto: "Porque no tenía platos ni cocina en su hogar", correcta: false },
                { texto: "Porque no le gustaban las frutas ni el pan", correcta: false }
            ],
            pista: "Recuerda los versos: 'sino carnes, frutas, dulces, tortas, huevos, pan y pez...'",
            premio: "$100.000 pts"
        },
        {
            pregunta: "¿De qué se quejaba la viejecita con respecto a su ropa y vestidos?",
            opciones: [
                { texto: "Que no tenía qué ponerse, ¡aunque tenía mil vestidos y calzado fino!", correcta: true },
                { texto: "Que su ropa estaba rota y llena de remiendos", correcta: false },
                { texto: "Que sus vestidos eran de colores feos", correcta: false },
                { texto: "Que no tenía zapatos para salir al jardín", correcta: false }
            ],
            pista: "El poema cuenta que no tenía qué ponerse sino telas finas, sedas y mil vestidos en sus baúles.",
            premio: "$250.000 pts"
        },
        {
            pregunta: "¿En qué tipo de vivienda habitaba la pobre viejecita según el poema?",
            opciones: [
                { texto: "En una gran casa con huerto, jardín y criados que la atendían", correcta: true },
                { texto: "En una pequeña choza de paja sin ventanas", correcta: false },
                { texto: "En un barco abandonado en la orilla del río", correcta: false },
                { texto: "En una cueva fría en lo alto de la colina", correcta: false }
            ],
            pista: "Tenía una linda morada espaciosa con sirvientes que cuidaban cada rincón.",
            premio: "$500.000 pts"
        },
        {
            pregunta: "¿De qué murió finalmente la viejecita al terminar el poema?",
            opciones: [
                { texto: "Murió de achaques y de vieja, quejándose siempre hasta el final", correcta: true },
                { texto: "Murió de frío en una noche de invierno", correcta: false },
                { texto: "Murió de hambre porque nadie le cocinaba", correcta: false },
                { texto: "Se enfermó por comer demasiados postres", correcta: false }
            ],
            pista: "Pombo concluye que murió de vieja y achaques, lamentándose a pesar de tenerlo todo.",
            premio: "$750.000 pts"
        },
        {
            pregunta: "¿Cuál es la gran lección o moraleja que nos transmite este famoso poema?",
            opciones: [
                { texto: "Agradecer y valorar lo que tenemos en vez de vivir quejándonos", correcta: true },
                { texto: "Que entre más cosas tengamos, más debemos quejarnos", correcta: false },
                { texto: "Que no debemos tomar chocolate ni comer pasteles", correcta: false },
                { texto: "Que es mejor vivir en una choza humilde", correcta: false }
            ],
            pista: "La ironía de Pombo nos invita a mirar con gratitud y alegría nuestra vida diaria.",
            premio: "🏆 $1.000.000 pts (Premio Mayor)"
        }
    ];

    let preguntasQuizMillonario = [...BANCO_QUIZ_MILLONARIO].sort(() => Math.random() - 0.5);
    let quizActualIndex = 0;
    let quizRespondida = false;
    let comodin50Usado = false;
    let comodinPistaUsado = false;

    function renderizarPreguntaQuiz() {
        const container = document.getElementById('quizMillonarioContainer');
        if (!container) return;

        const data = preguntasQuizMillonario[quizActualIndex];
        quizRespondida = false;

        // Opciones aleatorias con letras A), B), C), D)
        const opcionesMezcladas = [...data.opciones].sort(() => Math.random() - 0.5);
        const letrasOpciones = ['A', 'B', 'C', 'D'];

        container.innerHTML = `
            <div class="quiz-header-top">
                <span class="quiz-etapa-badge">Pregunta ${quizActualIndex + 1} de ${preguntasQuizMillonario.length}</span>
                <span class="quiz-premio-badge">💰 ${data.premio}</span>
            </div>

            <div class="quiz-comodines">
                <button type="button" class="btn-comodin" id="btnComodin50" ${comodin50Usado ? 'disabled' : ''}>
                    ⚖️ 50:50 (${comodin50Usado ? 'Usado' : 'Disponible'})
                </button>
                <button type="button" class="btn-comodin" id="btnComodinPista" ${comodinPistaUsado ? 'disabled' : ''}>
                    📜 Pista del Poema (${comodinPistaUsado ? 'Usada' : 'Disponible'})
                </button>
            </div>

            <p class="quiz-pregunta-texto">${data.pregunta}</p>

            <div class="opciones-millonario-grid" id="gridOpcionesQuiz">
                ${opcionesMezcladas.map((opc, idx) => `
                    <button type="button" class="btn-quiz-opcion" data-opt-idx="${idx}" data-correcta="${opc.correcta}">
                        <span class="opcion-letra">${letrasOpciones[idx]})</span>
                        <span>${opc.texto}</span>
                    </button>
                `).join('')}
            </div>

            <div id="quizFeedbackBox" class="quiz-feedback-box"></div>

            <button type="button" id="btnSiguienteQuiz" class="btn-siguiente-quiz">
                ${quizActualIndex < preguntasQuizMillonario.length - 1 ? 'Siguiente Pregunta ➔' : '🏆 Finalizar Quiz y Reclamar Premio (+35 pts)'}
            </button>
        `;

        // Eventos en botones de opción
        container.querySelectorAll('.btn-quiz-opcion').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (quizRespondida) return;
                verificarRespuestaQuiz(btn);
            });
        });

        // Comodín 50:50
        const btn50 = document.getElementById('btnComodin50');
        if (btn50 && !comodin50Usado) {
            btn50.addEventListener('click', () => {
                comodin50Usado = true;
                btn50.disabled = true;
                btn50.textContent = '⚖️ 50:50 (Usado)';
                sonidoPop();

                // Descartar 2 incorrectas al azar
                const incorrectosBtns = Array.from(container.querySelectorAll('.btn-quiz-opcion'))
                    .filter(b => b.dataset.correcta !== 'true');
                const descartar = incorrectosBtns.sort(() => Math.random() - 0.5).slice(0, 2);
                descartar.forEach(b => {
                    b.classList.add('descartada');
                    b.disabled = true;
                });
            });
        }

        // Comodín Pista
        const btnPista = document.getElementById('btnComodinPista');
        if (btnPista && !comodinPistaUsado) {
            btnPista.addEventListener('click', () => {
                comodinPistaUsado = true;
                btnPista.disabled = true;
                btnPista.textContent = '📜 Pista del Poema (Usada)';
                sonidoPop();

                const fbox = document.getElementById('quizFeedbackBox');
                if (fbox) {
                    fbox.innerHTML = `<span style="color: #80cbc4;">💡 Pista de Rafael Pombo: "${data.pista}"</span>`;
                }
            });
        }

        // Botón Siguiente
        const btnSig = document.getElementById('btnSiguienteQuiz');
        if (btnSig) {
            btnSig.addEventListener('click', async () => {
                if (quizActualIndex < preguntasQuizMillonario.length - 1) {
                    quizActualIndex++;
                    renderizarPreguntaQuiz();
                } else {
                    // Finalización del Quiz
                    container.innerHTML = `
                        <div style="padding: 25px 15px; text-align: center;">
                            <div style="font-size: 3.5rem; margin-bottom: 10px;">🏆🎉</div>
                            <h3 style="color: #ffd54f; font-size: 1.6rem; margin-bottom: 10px;">¡ERES EL GRAN GANADOR DEL QUIZ MILLONARIO!</h3>
                            <p style="color: #e0f2f1; font-size: 1.1rem; margin-bottom: 20px;">
                                Has respondido correctamente las 5 preguntas sobre la ironía y moraleja de Rafael Pombo. ¡Ganaste +35 puntos para tu castillo!
                            </p>
                            <button type="button" id="btnReiniciarQuiz" class="btn-siguiente-quiz" style="display: inline-block;">
                                🔄 Repasar Quiz Millonario
                            </button>
                        </div>
                    `;
                    lanzarConfeti();
                    sonidoAcierto();
                    if (window.ReinoDB && typeof window.ReinoDB.registrarPuntos === 'function') {
                        await window.ReinoDB.registrarPuntos('viejecita_quiz_millonario', 35);
                    }
                    document.getElementById('btnReiniciarQuiz')?.addEventListener('click', () => {
                        preguntasQuizMillonario = [...BANCO_QUIZ_MILLONARIO].sort(() => Math.random() - 0.5);
                        quizActualIndex = 0;
                        comodin50Usado = false;
                        comodinPistaUsado = false;
                        renderizarPreguntaQuiz();
                    });
                }
            });
        }
    }

    function verificarRespuestaQuiz(botonClicado) {
        quizRespondida = true;
        const data = preguntasQuizMillonario[quizActualIndex];
        const fbox = document.getElementById('quizFeedbackBox');
        const btnSig = document.getElementById('btnSiguienteQuiz');
        const esCorrecta = (botonClicado.dataset.correcta === 'true');

        if (esCorrecta) {
            botonClicado.classList.add('correcta');
            sonidoAcierto();
            if (fbox) {
                fbox.innerHTML = `<span style="color: #81c784;">🌟 ¡Respuesta Correcta! Has ganado ${data.premio}.</span>`;
            }
            if (btnSig) btnSig.style.display = 'block';
        } else {
            botonClicado.classList.add('incorrecta');
            sonidoError();
            // Marcar también la correcta
            document.querySelectorAll('.btn-quiz-opcion').forEach((b) => {
                if (b.dataset.correcta === 'true') {
                    b.classList.add('correcta');
                }
            });
            if (fbox) {
                fbox.innerHTML = `<span style="color: #ef9a9a;">❌ Respuesta incorrecta. La opción correcta era la resaltada en verde.</span>`;
            }
            if (btnSig) {
                btnSig.textContent = 'Intentar de nuevo esta pregunta 🔄';
                btnSig.style.display = 'block';
                btnSig.onclick = () => renderizarPreguntaQuiz();
            }
        }
    }

    // ==========================================================================
    // 3. ESTRUCTURACIÓN: JUEGO DE MEMORY (ENCUENTRA LAS PAREJAS)
    // ==========================================================================
    const cartasMemoryData = [
        { id: 'viejita', nombre: 'La Viejecita', icono: '👵', bg: '#ffe0b2' },
        { id: 'gato', nombre: 'El Gato', icono: '🐱', bg: '#bbdefb' },
        { id: 'tetera', nombre: 'La Tetera', icono: '🫖', bg: '#c8e6c9' },
        { id: 'tazas', nombre: 'Taza de Té', icono: '☕', bg: '#fff9c4' },
        { id: 'dulces', nombre: 'Tortas y Dulces', icono: '🍰', bg: '#f8bbd0' },
        { id: 'botas', nombre: 'botas', icono: '👢', bg: '#e1bee7' },
        { id: 'jardin', nombre: 'jardín', icono: '🏡', bg: '#ffe082' },
        { id: 'sofa', nombre: 'sofá', icono: '🛋️', bg: '#b2dfdb' }
    ];

    let cartasMemory = [];
    let primeraCarta = null;
    let segundaCarta = null;
    let bloqueandoTableroMemory = false;
    let parejasEncontradas = 0;
    let intentosMemory = 0;
    let timerMemorySec = 0;
    let intervaloMemory = null;

    function iniciarJuegoMemory() {
        const grid = document.getElementById('memoryGrid');
        if (!grid) return;

        // Limpiar temporizador previo
        if (intervaloMemory) clearInterval(intervaloMemory);
        timerMemorySec = 0;
        parejasEncontradas = 0;
        intentosMemory = 0;
        primeraCarta = null;
        segundaCarta = null;
        bloqueandoTableroMemory = false;

        actualizarMarcadoresMemory();

        intervaloMemory = setInterval(() => {
            timerMemorySec++;
            const m = Math.floor(timerMemorySec / 60).toString().padStart(2, '0');
            const s = (timerMemorySec % 60).toString().padStart(2, '0');
            const el = document.getElementById('memoryTiempo');
            if (el) el.textContent = `${m}:${s}`;
        }, 1000);

        // Crear baraja duplicada (8 parejas = 16 cartas)
        cartasMemory = [];
        cartasMemoryData.forEach((item) => {
            cartasMemory.push({ ...item, uid: item.id + '_1' });
            cartasMemory.push({ ...item, uid: item.id + '_2' });
        });

        // Barajar Fisher-Yates
        for (let i = cartasMemory.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cartasMemory[i], cartasMemory[j]] = [cartasMemory[j], cartasMemory[i]];
        }

        grid.innerHTML = '';
        cartasMemory.forEach((carta) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'memory-card';
            cardEl.dataset.id = carta.id;
            cardEl.dataset.uid = carta.uid;

            cardEl.innerHTML = `
                <div class="memory-card-face memory-card-back"></div>
                <div class="memory-card-face memory-card-front" style="background: ${carta.bg};">
                    <span class="memory-icono">${carta.icono}</span>
                    <span class="memory-nombre">${carta.nombre}</span>
                </div>
            `;

            cardEl.addEventListener('click', () => voltearCartaMemory(cardEl));
            grid.appendChild(cardEl);
        });
    }

    function voltearCartaMemory(cardEl) {
        if (bloqueandoTableroMemory) return;
        if (cardEl === primeraCarta) return;
        if (cardEl.classList.contains('volteada') || cardEl.classList.contains('emparejada')) return;

        sonidoPop();
        cardEl.classList.add('volteada');

        if (!primeraCarta) {
            primeraCarta = cardEl;
            return;
        }

        segundaCarta = cardEl;
        intentosMemory++;
        actualizarMarcadoresMemory();

        // Comprobar coincidencia
        if (primeraCarta.dataset.id === segundaCarta.dataset.id) {
            // ¡Pareja encontrada!
            sonidoAcierto();
            primeraCarta.classList.add('emparejada');
            segundaCarta.classList.add('emparejada');
            parejasEncontradas++;
            actualizarMarcadoresMemory();

            primeraCarta = null;
            segundaCarta = null;

            if (parejasEncontradas === cartasMemoryData.length) {
                // Victoria en Memory
                clearInterval(intervaloMemory);
                setTimeout(async () => {
                    lanzarConfeti();
                    sonidoAcierto();
                    const msg = document.getElementById('msgMemory');
                    if (msg) {
                        msg.innerHTML = `🎉 ¡Completado! Encontraste todas las parejas de la Pobre Viejecita en ${intentosMemory} intentos (+30 pts).`;
                        msg.className = 'msg-feedback exito';
                    }
                    if (window.ReinoDB && typeof window.ReinoDB.registrarPuntos === 'function') {
                        await window.ReinoDB.registrarPuntos('viejecita_memory', 30);
                    }
                }, 500);
            }
        } else {
            // No coinciden
            bloqueandoTableroMemory = true;
            sonidoError();
            setTimeout(() => {
                if (primeraCarta) primeraCarta.classList.remove('volteada');
                if (segundaCarta) segundaCarta.classList.remove('volteada');
                primeraCarta = null;
                segundaCarta = null;
                bloqueandoTableroMemory = false;
            }, 900);
        }
    }

    function actualizarMarcadoresMemory() {
        const elP = document.getElementById('memoryParejas');
        const elI = document.getElementById('memoryIntentos');
        if (elP) elP.textContent = `${parejasEncontradas} / ${cartasMemoryData.length}`;
        if (elI) elI.textContent = intentosMemory.toString();
    }

    // ==========================================================================
    // 4. TRANSFERENCIA: SÚPER VIEJECITA BROS (MARIO BROS 1 CON 5 NIVELES Y JEFE)
    // ==========================================================================
    let marioCanvas = null;
    let marioCtx = null;
    let marioLoopId = null;
    let marioJuegoIniciado = false;

    // Dimensiones y física base
    const M_ANCHO = 760;
    const M_ALTO = 380;
    const M_SUELO_Y = 320;
    const M_GRAVEDAD = 0.55;

    // Estado general del juego
    let nivelActual = 1;
    let camX = 0;
    let scoreMario = 0;
    let monedasMario = 0;
    let vidasMario = 3;
    let nivelCompletado = false;
    let tickMario = 0;

    // Teclas pulsadas
    const teclas = {
        left: false,
        right: false,
        jump: false,
        attack: false
    };

    // La Viejecita (Jugador Principal)
    const viejita = {
        x: 60,
        y: M_SUELO_Y - 45,
        w: 36,
        h: 48,
        vx: 0,
        vy: 0,
        velCaminar: 3.6,
        fuerzaSalto: -11.5,
        enSuelo: true,
        mirandoDerecha: true,
        poder: 'normal', // 'normal' | 'cafe' | 'te' | 'jarabe' | 'vitamina' | 'mentolin'
        timerPoder: 0,
        invulnerable: false,
        timerInvulnerable: 0,
        frameAnim: 0,
        animDisparo: 0,
        escala: 1
    };

    // Entidades del mundo
    let bloquesMario = [];
    let monedasItems = [];
    let medicinasItems = [];
    let proyectiles = [];
    let enemigos = [];
    let particulasMario = [];
    let metaNivel = { x: 2300, y: M_SUELO_Y - 140, w: 100, h: 140, astaX: 2240, banderaY: M_SUELO_Y - 160 };
    let ultimoSueloSeguro = { x: 60, y: M_SUELO_Y - 48 };

    // Jefe Final: La Sombra de la Soledad (Nivel 5)
    let sombraJefe = {
        activo: false,
        x: 900,
        y: 120,
        w: 75,
        h: 100,
        vx: -2.5,
        vy: 0,
        vida: 5,
        maxVida: 5,
        fase: 'flotar', // 'flotar' | 'picada' | 'retroceso'
        timerFase: 0,
        invulnerableTimer: 0,
        derrotado: false
    };

    // Nombres y detalles de los 5 niveles
    const NIVELES_INFO = {
        1: { nombre: 'El Jardín Florido', fondo: 'jardin', longitud: 2300 },
        2: { nombre: 'La Despensa de Manjares', fondo: 'despensa', longitud: 2400 },
        3: { nombre: 'El Gran Salón de Relojes', fondo: 'salon', longitud: 2500 },
        4: { nombre: 'Tejado Bajo las Estrellas', fondo: 'noche', longitud: 2600 },
        5: { nombre: 'La Torre del Olvido (Jefe)', fondo: 'castillo', longitud: 1400 }
    };

    // ==========================================================================
    // PROGRESIÓN Y GENERADOR DE NIVELES (1 A 5 CON DESBLOQUEO SECUENCIAL)
    // ==========================================================================
    let nivelMaximoDesbloqueado = 1;

    function actualizarPestanasNivelesUI() {
        document.querySelectorAll('.btn-nivel-tab').forEach((b) => {
            const n = parseInt(b.dataset.nivel, 10);
            if (n === nivelActual) {
                b.classList.add('activo');
            } else {
                b.classList.remove('activo');
            }

            if (n > nivelMaximoDesbloqueado) {
                b.classList.add('bloqueado');
                b.title = `🔒 Bloqueado: Supera el Nivel ${n - 1} primero`;
                if (!b.textContent.includes('🔒')) {
                    b.innerHTML = `🔒 ${b.textContent.trim()}`;
                }
            } else {
                b.classList.remove('bloqueado');
                b.removeAttribute('title');
                if (b.textContent.includes('🔒')) {
                    b.innerHTML = b.textContent.replace('🔒', '').trim();
                }
            }
        });
    }

    function cargarNivel(numNivel) {
        nivelActual = numNivel;
        nivelCompletado = false;
        camX = 0;
        proyectiles = [];
        particulasMario = [];
        monedasItems = [];
        medicinasItems = [];
        enemigos = [];
        bloquesMario = [];

        // Reset Viejita
        viejita.x = 60;
        viejita.y = M_SUELO_Y - 48;
        viejita.vx = 0;
        viejita.vy = 0;
        viejita.enSuelo = true;
        viejita.escala = (viejita.poder === 'jarabe') ? 1.32 : 1;
        ultimoSueloSeguro = { x: 60, y: M_SUELO_Y - 48 };

        actualizarPestanasNivelesUI();

        const info = NIVELES_INFO[nivelActual];

        // --- NIVEL 1: EL JARDÍN FLORIDO ---
        if (numNivel === 1) {
            sombraJefe.activo = false;
            metaNivel = { x: 2120, y: M_SUELO_Y - 140, w: 100, h: 140, astaX: 2040, banderaY: M_SUELO_Y - 160 };

            bloquesMario = [
                // Suelo con pozo seguro (entre x=980 y x=1090)
                { x: 0, y: M_SUELO_Y, w: 980, h: 60, tipo: 'suelo' },
                { x: 1090, y: M_SUELO_Y, w: 1300, h: 60, tipo: 'suelo' },

                // Tuberías bien espaciadas
                { x: 440, y: M_SUELO_Y - 45, w: 50, h: 45, tipo: 'tuberia' },
                { x: 740, y: M_SUELO_Y - 60, w: 50, h: 60, tipo: 'tuberia' },
                { x: 1380, y: M_SUELO_Y - 55, w: 50, h: 55, tipo: 'tuberia' },

                // Bloques iniciales con altura libre (-115px) para que la viejita pase sin chocar
                { x: 180, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'cafe', desc: 'Café Expreso' },
                { x: 226, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'ladrillo' },
                { x: 258, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'moneda' },
                { x: 290, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'ladrillo' },
                { x: 322, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'jarabe', desc: 'Jarabe Fortificante' },

                // Bloques intermedios
                { x: 840, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'ladrillo' },
                { x: 872, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'cafe', desc: 'Café Expreso' },
                { x: 904, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'ladrillo' },

                // Puente sobre pozo (con paso superior e inferior totalmente libre)
                { x: 1005, y: M_SUELO_Y - 65, w: 65, h: 16, tipo: 'puente' },

                // Racha de bloques flotantes bien elevados
                { x: 1500, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'moneda' },
                { x: 1545, y: M_SUELO_Y - 165, w: 32, h: 32, tipo: 'lucky', poderItem: 'jarabe', desc: 'Jarabe Fortificante' },
                { x: 1590, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'ladrillo' },

                // Escalera piramidal clásica estilo SMB1 antes de la meta
                { x: 1820, y: M_SUELO_Y - 32, w: 32, h: 32, tipo: 'bloqueSolido' },
                { x: 1852, y: M_SUELO_Y - 64, w: 32, h: 64, tipo: 'bloqueSolido' },
                { x: 1884, y: M_SUELO_Y - 96, w: 32, h: 96, tipo: 'bloqueSolido' },
                { x: 1916, y: M_SUELO_Y - 128, w: 32, h: 128, tipo: 'bloqueSolido' }
            ];

            // Enemigos: Gatitos traviesos (estilo Goomba)
            enemigos = [
                { x: 530, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.2, tipo: 'gatito', vivo: true },
                { x: 890, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.2, tipo: 'gatito', vivo: true },
                { x: 1220, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.4, tipo: 'gatito', vivo: true },
                { x: 1680, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.5, tipo: 'gatito', vivo: true }
            ];

            // Monedas
            [180, 258, 530, 872, 1150, 1500, 1720, 1850].forEach((mx) => {
                monedasItems.push({ x: mx, y: M_SUELO_Y - 60, r: 10, recogida: false });
            });
        }

        // --- NIVEL 2: LA DESPENSA DE LOS MANJARES ---
        else if (numNivel === 2) {
            sombraJefe.activo = false;
            metaNivel = { x: 2200, y: M_SUELO_Y - 140, w: 100, h: 140, astaX: 2120, banderaY: M_SUELO_Y - 160 };

            bloquesMario = [
                { x: 0, y: M_SUELO_Y, w: 850, h: 60, tipo: 'suelo' },
                { x: 940, y: M_SUELO_Y, w: 600, h: 60, tipo: 'suelo' },
                { x: 1620, y: M_SUELO_Y, w: 900, h: 60, tipo: 'suelo' },

                // Estantes de pasteles elevados (-115px de altura)
                { x: 200, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'te', desc: 'Té de Manzanilla' },
                { x: 232, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'ladrillo' },
                { x: 264, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'cafe', desc: 'Café Expreso' },

                // Tazas y teteras
                { x: 420, y: M_SUELO_Y - 50, w: 50, h: 50, tipo: 'tuberia' },
                { x: 760, y: M_SUELO_Y - 65, w: 52, h: 65, tipo: 'tuberia' },

                // Plataformas altas de repostería (ESPACIO 100% LIBRE, SIN BLOQUE ENCIMA)
                { x: 530, y: M_SUELO_Y - 95, w: 80, h: 18, tipo: 'puente' },
                { x: 670, y: M_SUELO_Y - 130, w: 80, h: 18, tipo: 'puente' },
                // Caja lucky flotando en el aire entre los dos puentes (completamente libre, sin obstruir el paso)
                { x: 620, y: M_SUELO_Y - 95, w: 32, h: 32, tipo: 'lucky', poderItem: 'te', desc: 'Té de Manzanilla' },

                // Zona intermedia
                { x: 1060, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'jarabe', desc: 'Jarabe Fortificante' },
                { x: 1110, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'ladrillo' },
                { x: 1160, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'moneda' },

                // Pirámide de escalones clásica
                { x: 1850, y: M_SUELO_Y - 32, w: 32, h: 32, tipo: 'bloqueSolido' },
                { x: 1882, y: M_SUELO_Y - 64, w: 32, h: 64, tipo: 'bloqueSolido' },
                { x: 1914, y: M_SUELO_Y - 96, w: 32, h: 96, tipo: 'bloqueSolido' },
                { x: 1946, y: M_SUELO_Y - 128, w: 32, h: 128, tipo: 'bloqueSolido' }
            ];

            // Enemigos: Gatitos y Tortugas con ovillo
            enemigos = [
                { x: 340, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.3, tipo: 'gatito', vivo: true },
                { x: 540, y: M_SUELO_Y - 120, w: 32, h: 30, vx: -1.0, tipo: 'tortuga', vivo: true, ovillo: false },
                { x: 990, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.4, tipo: 'gatito', vivo: true },
                { x: 1250, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.1, tipo: 'tortuga', vivo: true, ovillo: false },
                { x: 1680, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.5, tipo: 'gatito', vivo: true }
            ];

            [200, 264, 530, 620, 1060, 1160, 1680, 1850].forEach((mx) => {
                monedasItems.push({ x: mx, y: M_SUELO_Y - 60, r: 10, recogida: false });
            });
        }

        // --- NIVEL 3: EL GRAN SALÓN DE LOS RELOJES Y LIBROS ---
        else if (numNivel === 3) {
            sombraJefe.activo = false;
            metaNivel = { x: 2320, y: M_SUELO_Y - 140, w: 100, h: 140, astaX: 2240, banderaY: M_SUELO_Y - 160 };

            bloquesMario = [
                { x: 0, y: M_SUELO_Y, w: 700, h: 60, tipo: 'suelo' },
                { x: 800, y: M_SUELO_Y, w: 700, h: 60, tipo: 'suelo' },
                { x: 1580, y: M_SUELO_Y, w: 1000, h: 60, tipo: 'suelo' },

                // Pilares de libros y estantes elevados (paso 100% libre)
                { x: 200, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'vitamina', desc: 'Vitamina B Planeadora' },
                { x: 260, y: M_SUELO_Y - 100, w: 80, h: 20, tipo: 'puente' },
                { x: 380, y: M_SUELO_Y - 140, w: 80, h: 20, tipo: 'puente' },
                // Caja lucky en espacio abierto entre plataformas
                { x: 480, y: M_SUELO_Y - 110, w: 32, h: 32, tipo: 'lucky', poderItem: 'te', desc: 'Té de Manzanilla' },

                { x: 570, y: M_SUELO_Y - 55, w: 50, h: 55, tipo: 'tuberia' },

                // Zona de péndulos
                { x: 920, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'ladrillo' },
                { x: 952, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'cafe', desc: 'Café Expreso' },
                { x: 984, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'ladrillo' },

                { x: 1120, y: M_SUELO_Y - 110, w: 90, h: 20, tipo: 'puente' },
                // Caja lucky colocada tras el puente en espacio abierto
                { x: 1240, y: M_SUELO_Y - 110, w: 32, h: 32, tipo: 'lucky', poderItem: 'vitamina', desc: 'Vitamina B Planeadora' },

                { x: 1720, y: M_SUELO_Y - 70, w: 50, h: 70, tipo: 'tuberia' },
                { x: 1840, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'te', desc: 'Té de Manzanilla' },

                // Pirámide final
                { x: 1980, y: M_SUELO_Y - 32, w: 32, h: 32, tipo: 'bloqueSolido' },
                { x: 2012, y: M_SUELO_Y - 64, w: 32, h: 64, tipo: 'bloqueSolido' },
                { x: 2044, y: M_SUELO_Y - 96, w: 32, h: 96, tipo: 'bloqueSolido' },
                { x: 2076, y: M_SUELO_Y - 128, w: 32, h: 128, tipo: 'bloqueSolido' }
            ];

            enemigos = [
                { x: 300, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.3, tipo: 'gatito', vivo: true },
                { x: 620, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.2, tipo: 'tortuga', vivo: true, ovillo: false },
                { x: 860, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.5, tipo: 'gatito', vivo: true },
                { x: 1220, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.6, tipo: 'raton', vivo: true },
                { x: 1800, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.3, tipo: 'tortuga', vivo: true, ovillo: false }
            ];

            [200, 300, 480, 700, 952, 1120, 1240, 1750, 1840].forEach((mx) => {
                monedasItems.push({ x: mx, y: M_SUELO_Y - 60, r: 10, recogida: false });
            });
        }

        // --- NIVEL 4: TEJADO BAJO LAS ESTRELLAS ---
        else if (numNivel === 4) {
            sombraJefe.activo = false;
            metaNivel = { x: 2420, y: M_SUELO_Y - 140, w: 100, h: 140, astaX: 2340, banderaY: M_SUELO_Y - 160 };

            bloquesMario = [
                { x: 0, y: M_SUELO_Y, w: 600, h: 60, tipo: 'suelo' },
                { x: 700, y: M_SUELO_Y, w: 600, h: 60, tipo: 'suelo' },
                { x: 1380, y: M_SUELO_Y, w: 1300, h: 60, tipo: 'suelo' },

                // Nubes flotantes (espacio totalmente libre encima de cada nube)
                { x: 180, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'mentolin', desc: 'Mentolín Invencible' },
                { x: 260, y: M_SUELO_Y - 105, w: 80, h: 18, tipo: 'nube' },
                { x: 380, y: M_SUELO_Y - 145, w: 80, h: 18, tipo: 'nube' },
                // Caja lucky flotando en el cielo abierto
                { x: 480, y: M_SUELO_Y - 110, w: 32, h: 32, tipo: 'lucky', poderItem: 'cafe', desc: 'Café Expreso' },

                { x: 550, y: M_SUELO_Y - 50, w: 50, h: 50, tipo: 'tuberia' },

                // Zona media nocturna elevada
                { x: 820, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'te', desc: 'Té de Manzanilla' },
                { x: 852, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'ladrillo' },
                { x: 884, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'jarabe', desc: 'Jarabe Fortificante' },

                { x: 1020, y: M_SUELO_Y - 110, w: 75, h: 18, tipo: 'nube' },
                { x: 1140, y: M_SUELO_Y - 145, w: 75, h: 18, tipo: 'nube' },

                { x: 1560, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'mentolin', desc: 'Mentolín Invencible' },
                { x: 1760, y: M_SUELO_Y - 60, w: 50, h: 60, tipo: 'tuberia' },
                { x: 1950, y: M_SUELO_Y - 115, w: 32, h: 32, tipo: 'lucky', poderItem: 'te', desc: 'Té de Manzanilla' },

                // Escalera final clásica
                { x: 2100, y: M_SUELO_Y - 32, w: 32, h: 32, tipo: 'bloqueSolido' },
                { x: 2132, y: M_SUELO_Y - 64, w: 32, h: 64, tipo: 'bloqueSolido' },
                { x: 2164, y: M_SUELO_Y - 96, w: 32, h: 96, tipo: 'bloqueSolido' },
                { x: 2196, y: M_SUELO_Y - 128, w: 32, h: 128, tipo: 'bloqueSolido' }
            ];

            enemigos = [
                { x: 350, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.6, tipo: 'gatito', vivo: true },
                { x: 740, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.4, tipo: 'tortuga', vivo: true, ovillo: false },
                { x: 920, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.7, tipo: 'raton', vivo: true },
                { x: 1450, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.8, tipo: 'gatito', vivo: true },
                { x: 1650, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.5, tipo: 'tortuga', vivo: true, ovillo: false },
                { x: 1900, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.7, tipo: 'gatito', vivo: true }
            ];

            [180, 260, 380, 820, 884, 1020, 1560, 1800, 1950].forEach((mx) => {
                monedasItems.push({ x: mx, y: M_SUELO_Y - 60, r: 10, recogida: false });
            });
        }

        // --- NIVEL 5: LA TORRE DEL OLVIDO Y LA SOMBRA DE LA SOLEDAD (JEFE) ---
        else if (numNivel === 5) {
            sombraJefe = {
                activo: true,
                x: 850,
                y: 110,
                w: 75,
                h: 100,
                vx: -2.2,
                vy: 0,
                vida: 5,
                maxVida: 5,
                fase: 'flotar',
                timerFase: 0,
                invulnerableTimer: 0,
                derrotado: false
            };

            // Arena cerrada sin salida hasta vencerlo
            metaNivel = { x: 1200, y: M_SUELO_Y - 140, w: 100, h: 140, astaX: 1140, banderaY: M_SUELO_Y - 160 };

            bloquesMario = [
                // Suelo completo de la arena
                { x: 0, y: M_SUELO_Y, w: 1300, h: 60, tipo: 'suelo' },

                // Muros laterales
                { x: 0, y: 0, w: 20, h: M_SUELO_Y, tipo: 'bloqueSolido' },
                { x: 1280, y: 0, w: 20, h: M_SUELO_Y, tipo: 'bloqueSolido' },

                // Plataformas flotantes para saltar y alcanzar al jefe (todas con cielo totalmente despejado)
                { x: 160, y: M_SUELO_Y - 75, w: 90, h: 18, tipo: 'puente' },
                { x: 320, y: M_SUELO_Y - 125, w: 90, h: 18, tipo: 'puente' },
                { x: 500, y: M_SUELO_Y - 165, w: 110, h: 18, tipo: 'puente' },
                { x: 710, y: M_SUELO_Y - 125, w: 90, h: 18, tipo: 'puente' },
                { x: 870, y: M_SUELO_Y - 75, w: 90, h: 18, tipo: 'puente' },

                // Cajas lucky [?] de auxilio flotando en el aire entre plataformas
                { x: 265, y: M_SUELO_Y - 100, w: 32, h: 32, tipo: 'lucky', poderItem: 'te', desc: 'Té de Manzanilla' },
                { x: 630, y: M_SUELO_Y - 140, w: 32, h: 32, tipo: 'lucky', poderItem: 'cafe', desc: 'Café Expreso' },
                { x: 980, y: M_SUELO_Y - 100, w: 32, h: 32, tipo: 'lucky', poderItem: 'te', desc: 'Té de Manzanilla' }
            ];

            // 2 gatitos sombra de escolta
            enemigos = [
                { x: 300, y: M_SUELO_Y - 30, w: 32, h: 30, vx: -1.4, tipo: 'gatito', vivo: true },
                { x: 750, y: M_SUELO_Y - 30, w: 32, h: 30, vx: 1.4, tipo: 'gatito', vivo: true }
            ];

            [265, 360, 630, 740, 980].forEach((mx) => {
                monedasItems.push({ x: mx, y: M_SUELO_Y - 50, r: 10, recogida: false });
            });
        }

        actualizarHUDMario();
    }

    function cambiarNivel(num) {
        if (num > nivelMaximoDesbloqueado) {
            sonidoError();
            const msg = document.getElementById('msgMario');
            if (msg) {
                msg.textContent = `🔒 ¡El Nivel ${num} está bloqueado! Debes superar el Nivel ${num - 1} para desbloquearlo.`;
                msg.className = 'msg-feedback error';
                setTimeout(() => { if (msg.textContent.includes('bloqueado')) msg.textContent = ''; }, 3000);
            }
            return;
        }
        cargarNivel(num);
        sonidoPop();
        const msg = document.getElementById('msgMario');
        if (msg) msg.textContent = '';
    }

    function actualizarHUDMario() {
        const sEl = document.getElementById('marioScore');
        const cEl = document.getElementById('marioCoins');
        const vEl = document.getElementById('marioLives');
        const nEl = document.getElementById('marioNivel');
        const pEl = document.getElementById('marioPoderNombre');

        if (sEl) sEl.textContent = scoreMario.toString().padStart(6, '0');
        if (cEl) cEl.textContent = monedasMario.toString().padStart(2, '0');
        if (vEl) vEl.textContent = '❤️'.repeat(Math.max(0, vidasMario));
        if (nEl) {
            const info = NIVELES_INFO[nivelActual];
            nEl.textContent = `${nivelActual} / 5: ${info.nombre}`;
        }
        if (pEl) {
            const nombresPoderes = {
                normal: 'Normal',
                cafe: '☕ Café Turbo',
                te: '🍵 Té Mágico',
                jarabe: '💊 Súper Jarabe',
                vitamina: '🧪 Vitamina Planeadora',
                mentolin: '🩹 Mentolín Invencible'
            };
            pEl.textContent = nombresPoderes[viejita.poder] || 'Normal';
        }
    }

    // ==========================================================================
    // DISPARO DE PROYECTIL DE TÉ (PODER: TÉ DE MANZANILLA)
    // ==========================================================================
    function dispararTe() {
        if (viejita.poder !== 'te') return;

        viejita.animDisparo = 15;
        const dir = viejita.mirandoDerecha ? 1 : -1;
        proyectiles.push({
            x: viejita.x + (viejita.mirandoDerecha ? viejita.w + 4 : -12),
            y: viejita.y + viejita.h * 0.4,
            vx: dir * 7.5,
            vy: -1.5,
            tipo: 'te',
            rebotes: 0,
            vida: 80
        });

        sonidoPop();
        crearParticulas(viejita.x + viejita.w / 2, viejita.y + viejita.h / 2, '#81c784', 6);
    }

    // ==========================================================================
    // DIBUJAR A LA VIEJECITA (GRÁFICOS MEJORADOS EN CANVAS)
    // ==========================================================================
    function dibujarViejita(ctx, x, y, w, h, mirandoDer, poder, enSuelo, animDisparo) {
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        if (!mirandoDer) ctx.scale(-1, 1);

        // Si tiene Jarabe: escala gigante
        if (poder === 'jarabe') {
            ctx.scale(1.28, 1.28);
        }

        // Parpadeo de invulnerabilidad
        if (viejita.invulnerable && Math.floor(Date.now() / 90) % 2 === 0) {
            ctx.globalAlpha = 0.45;
        }

        // --- EFECTOS Y AURAS DE PODERES ---
        if (poder === 'mentolin') {
            // Aura arcoíris caleidoscópica
            const colores = ['#ff1744', '#ffd600', '#00e676', '#00b0ff', '#d500f9'];
            const colorAura = colores[Math.floor(Date.now() / 70) % colores.length];
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(w, h) * 0.72, 0, Math.PI * 2);
            ctx.fillStyle = colorAura;
            ctx.globalAlpha = 0.35 + 0.15 * Math.sin(Date.now() / 60);
            ctx.fill();
            ctx.restore();
        } else if (poder === 'cafe') {
            // Aura ámbar con vapor humeante
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(w, h) * 0.65, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 179, 0, 0.3)';
            ctx.fill();
            // Nube de aroma a café
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '12px sans-serif';
            ctx.fillText('♨️', -18, -h * 0.45);
            ctx.restore();
        } else if (poder === 'te') {
            // Aura verde primaveral con flores
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(w, h) * 0.65, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(129, 199, 132, 0.35)';
            ctx.fill();
            ctx.restore();
        } else if (poder === 'vitamina') {
            // Alas / parasol flotante
            ctx.save();
            ctx.fillStyle = '#ff80ab';
            ctx.beginPath();
            ctx.arc(0, -h * 0.55, 20, Math.PI, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // --- 1. CUERPO Y VESTIDO ELEGANTE CON PLIEGUES ---
        // Color de vestido según poder
        let colorVestido = '#8e24aa'; // púrpura estándar
        if (poder === 'cafe') colorVestido = '#d84315';
        if (poder === 'te') colorVestido = '#2e7d32';
        if (poder === 'jarabe') colorVestido = '#b71c1c';
        if (poder === 'mentolin') colorVestido = '#0091ea';

        ctx.fillStyle = colorVestido;
        ctx.beginPath();
        ctx.moveTo(-w * 0.36, h * 0.42);
        ctx.lineTo(-w * 0.26, -h * 0.08);
        ctx.lineTo(w * 0.26, -h * 0.08);
        ctx.lineTo(w * 0.36, h * 0.42);
        ctx.closePath();
        ctx.fill();

        // Pliegues y sombra de la falda
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-w * 0.12, -h * 0.05); ctx.lineTo(-w * 0.15, h * 0.42);
        ctx.moveTo(w * 0.12, -h * 0.05); ctx.lineTo(w * 0.15, h * 0.42);
        ctx.stroke();

        // Delantal blanco con bolsillo
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-w * 0.2, h * 0.02, w * 0.4, h * 0.36, 6);
        ctx.fill();
        // Detalle flor en el bolsillo
        ctx.fillStyle = '#ff4081';
        ctx.beginPath();
        ctx.arc(0, h * 0.24, 3, 0, Math.PI * 2);
        ctx.fill();

        // Chal tejido de lana con patrón y flecos
        ctx.fillStyle = (poder === 'cafe') ? '#ffe082' : '#f3e5f5';
        ctx.beginPath();
        ctx.arc(0, -h * 0.02, w * 0.32, 0, Math.PI);
        ctx.fill();
        // Flecos del chal
        ctx.strokeStyle = '#ce93d8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let fx = -w * 0.3; fx <= w * 0.3; fx += 6) {
            ctx.moveTo(fx, h * 0.12);
            ctx.lineTo(fx, h * 0.18 + Math.sin(Date.now() / 90 + fx) * 2);
        }
        ctx.stroke();

        // Pies y zapatitos negros con hebilla
        ctx.fillStyle = '#212121';
        const paso = enSuelo ? Math.sin(Date.now() / 80) * 4 : 0;
        ctx.beginPath();
        ctx.ellipse(-w * 0.16 + paso, h * 0.45, 6, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(w * 0.16 - paso, h * 0.45, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Hebillas doradas
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(-w * 0.18 + paso, h * 0.43, 4, 3);
        ctx.fillRect(w * 0.14 - paso, h * 0.43, 4, 3);

        // --- 2. CABEZA, ROSTRO TIERNO Y PEINADO ---
        // Cuello y rostro
        ctx.fillStyle = '#ffe0b2';
        ctx.beginPath();
        ctx.arc(0, -h * 0.24, w * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Mejillas rosadas difuminadas
        ctx.fillStyle = 'rgba(239, 83, 80, 0.45)';
        ctx.beginPath();
        ctx.arc(-w * 0.12, -h * 0.18, 4.5, 0, Math.PI * 2);
        ctx.arc(w * 0.16, -h * 0.18, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Cabello plateado rizado con textura
        ctx.fillStyle = '#eeeeee';
        // Copete rizado
        ctx.beginPath();
        ctx.arc(0, -h * 0.34, w * 0.28, Math.PI, Math.PI * 2);
        ctx.arc(-w * 0.18, -h * 0.30, 8, 0, Math.PI * 2);
        ctx.arc(w * 0.18, -h * 0.30, 8, 0, Math.PI * 2);
        ctx.fill();

        // Moño / chongo esponjoso
        ctx.beginPath();
        ctx.arc(-w * 0.22, -h * 0.38, w * 0.16, 0, Math.PI * 2);
        ctx.fill();
        // Horquilla dorada con perla brillante
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-w * 0.32, -h * 0.46);
        ctx.lineTo(-w * 0.12, -h * 0.30);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-w * 0.32, -h * 0.46, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Gafas doradas redondas y ojos
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(w * 0.08, -h * 0.24, 5.5, 0, Math.PI * 2);
        ctx.stroke();

        // Ojo dulce con pestañas (parpadea periódicamente)
        const parpadeando = (Math.floor(Date.now() / 2500) % 2 === 0) && (Date.now() % 2500 < 120);
        if (parpadeando) {
            ctx.strokeStyle = '#3e2723';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(w * 0.04, -h * 0.24);
            ctx.lineTo(w * 0.12, -h * 0.24);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#3e2723';
            ctx.beginPath();
            ctx.arc(w * 0.08, -h * 0.24, 2.2, 0, Math.PI * 2);
            ctx.fill();
            // Reflejo blanco en el lente
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(w * 0.09, -h * 0.26, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sonrisa tierna
        ctx.strokeStyle = '#c2185b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(w * 0.06, -h * 0.16, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // --- 3. BASTÓN DE MADERA TALLADA ---
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 3.2;
        ctx.beginPath();

        if (animDisparo > 0) {
            // Apuntando con el bastón hacia adelante como una varita mágica
            ctx.moveTo(w * 0.15, -h * 0.08);
            ctx.lineTo(w * 0.52, -h * 0.12);
            ctx.arc(w * 0.48, -h * 0.18, 4.5, 0, Math.PI, true);
        } else if (!enSuelo) {
            // Levantando el bastón en alto al saltar
            ctx.moveTo(w * 0.18, -h * 0.08);
            ctx.lineTo(w * 0.44, -h * 0.36);
            ctx.arc(w * 0.40, -h * 0.40, 4.5, 0, Math.PI, true);
        } else {
            // Caminando apoyada en su bastón
            ctx.moveTo(w * 0.20, h * 0.04);
            ctx.lineTo(w * 0.32, h * 0.44);
            ctx.arc(w * 0.28, h * 0.02, 4, 0, Math.PI, true);
        }
        ctx.stroke();

        // Punta del bastón (brillo dorado o mágico si tiene té)
        ctx.fillStyle = (poder === 'te') ? '#00e676' : '#ffd54f';
        ctx.beginPath();
        if (animDisparo > 0) {
            ctx.arc(w * 0.52, -h * 0.12, 5, 0, Math.PI * 2);
        } else if (!enSuelo) {
            ctx.arc(w * 0.44, -h * 0.36, 4, 0, Math.PI * 2);
        } else {
            ctx.arc(w * 0.32, h * 0.44, 3, 0, Math.PI * 2);
        }
        ctx.fill();

        ctx.restore();
    }

    // ==========================================================================
    // DIBUJAR ENEMIGOS (GATITOS, TORTUGAS, RATONES)
    // ==========================================================================
    function dibujarEnemigo(ctx, e) {
        if (!e.vivo) return;

        ctx.save();
        ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
        if (e.vx > 0) ctx.scale(-1, 1);

        if (e.tipo === 'gatito') {
            // Gatito travieso (estilo Goomba con bigotes)
            ctx.fillStyle = '#ff8f00'; // naranja
            ctx.beginPath();
            ctx.ellipse(0, 2, 14, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Orejitas puntiagudas
            ctx.fillStyle = '#e65100';
            ctx.beginPath();
            ctx.moveTo(-10, -8); ctx.lineTo(-14, -18); ctx.lineTo(-4, -10);
            ctx.moveTo(10, -8); ctx.lineTo(14, -18); ctx.lineTo(4, -10);
            ctx.fill();

            // Ojos grandes curiosos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-5, -1, 3.5, 0, Math.PI * 2);
            ctx.arc(5, -1, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.arc(-5, -1, 1.8, 0, Math.PI * 2);
            ctx.arc(5, -1, 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Nariz y bigotes
            ctx.fillStyle = '#d81b60';
            ctx.fillRect(-1.5, 3, 3, 2);
            ctx.strokeStyle = '#212121';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-4, 4); ctx.lineTo(-12, 2);
            ctx.moveTo(-4, 5); ctx.lineTo(-12, 6);
            ctx.moveTo(4, 4); ctx.lineTo(12, 2);
            ctx.moveTo(4, 5); ctx.lineTo(12, 6);
            ctx.stroke();

            // Patitas caminando
            ctx.fillStyle = '#e65100';
            const paso = Math.sin(Date.now() / 80) * 3;
            ctx.beginPath();
            ctx.arc(-7 + paso, 12, 3.5, 0, Math.PI * 2);
            ctx.arc(7 - paso, 12, 3.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (e.tipo === 'tortuga') {
            if (e.ovillo) {
                // Ovillo de lana rodando 🧶
                ctx.fillStyle = '#e91e63';
                ctx.beginPath();
                ctx.arc(0, 0, 13, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(0, 0, 9, 0, Math.PI);
                ctx.stroke();
            } else {
                // Tortuguita verde con caparazón de lana
                ctx.fillStyle = '#43a047';
                ctx.beginPath();
                ctx.ellipse(0, 2, 14, 11, 0, 0, Math.PI * 2);
                ctx.fill();

                // Cabeza de tortuga
                ctx.fillStyle = '#81c784';
                ctx.beginPath();
                ctx.arc(-11, -3, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#212121';
                ctx.beginPath();
                ctx.arc(-12, -4, 1.5, 0, Math.PI * 2);
                ctx.fill();

                // Patitas
                ctx.fillStyle = '#2e7d32';
                ctx.beginPath();
                ctx.arc(-6, 12, 3, 0, Math.PI * 2);
                ctx.arc(6, 12, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (e.tipo === 'raton') {
            // Ratoncito travieso
            ctx.fillStyle = '#9e9e9e';
            ctx.beginPath();
            ctx.ellipse(0, 2, 12, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            // Orejotas
            ctx.fillStyle = '#f48fb1';
            ctx.beginPath();
            ctx.arc(-8, -6, 5, 0, Math.PI * 2);
            ctx.arc(4, -6, 5, 0, Math.PI * 2);
            ctx.fill();
            // Ojito y cola
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.arc(-4, -1, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#f48fb1';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(10, 3);
            ctx.quadraticCurveTo(18, 0, 16, -8);
            ctx.stroke();
        }

        ctx.restore();
    }

    // ==========================================================================
    // DIBUJAR AL JEFE FINAL: "LA SOMBRA DE LA SOLEDAD"
    // ==========================================================================
    function dibujarJefeSombra(ctx, jefe) {
        if (!jefe.activo) return;

        ctx.save();
        ctx.translate(jefe.x + jefe.w / 2, jefe.y + jefe.h / 2);

        // Parpadeo de daño
        if (jefe.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Manto de sombra etérea con vapor oscuro
        const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 55);
        grad.addColorStop(0, '#4a148c');
        grad.addColorStop(0.6, '#1a0033');
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 58 + Math.sin(Date.now() / 100) * 4, 0, Math.PI * 2);
        ctx.fill();

        // Silueta principal de espectro
        ctx.fillStyle = '#120024';
        ctx.beginPath();
        ctx.moveTo(-jefe.w * 0.4, jefe.h * 0.4);
        ctx.quadraticCurveTo(-jefe.w * 0.5, -jefe.h * 0.2, 0, -jefe.h * 0.45);
        ctx.quadraticCurveTo(jefe.w * 0.5, -jefe.h * 0.2, jefe.w * 0.4, jefe.h * 0.4);
        // Borde inferior ondulante
        for (let ix = jefe.w * 0.4; ix >= -jefe.w * 0.4; ix -= 12) {
            ctx.lineTo(ix, jefe.h * 0.4 + Math.sin(Date.now() / 90 + ix) * 6);
        }
        ctx.closePath();
        ctx.fill();

        // Corona de espinas / niebla
        ctx.fillStyle = '#7b1fa2';
        ctx.beginPath();
        ctx.moveTo(-18, -jefe.h * 0.42);
        ctx.lineTo(-12, -jefe.h * 0.58);
        ctx.lineTo(-4, -jefe.h * 0.44);
        ctx.lineTo(0, -jefe.h * 0.62);
        ctx.lineTo(4, -jefe.h * 0.44);
        ctx.lineTo(12, -jefe.h * 0.58);
        ctx.lineTo(18, -jefe.h * 0.42);
        ctx.closePath();
        ctx.fill();

        // Ojos penetrantes violetas brillantes
        ctx.fillStyle = '#e040fb';
        ctx.shadowColor = '#e040fb';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(-12, -10, 6, 8, -0.2, 0, Math.PI * 2);
        ctx.ellipse(12, -10, 6, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Pupilas estrechas
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-12, -10, 2, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(12, -10, 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Manos fantasmales flotantes
        ctx.fillStyle = '#311b92';
        const manoOsc = Math.sin(Date.now() / 120) * 8;
        ctx.beginPath();
        ctx.arc(-jefe.w * 0.45, 10 + manoOsc, 10, 0, Math.PI * 2);
        ctx.arc(jefe.w * 0.45, 10 - manoOsc, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // ==========================================================================
    // FÍSICA Y LÓGICA DE ACTUALIZACIÓN
    // ==========================================================================
    function actualizarMarioLogica() {
        if (!marioJuegoIniciado || nivelCompletado) return;
        tickMario++;

        // Temporizador de Poderes
        if (viejita.timerPoder > 0) {
            viejita.timerPoder--;
            if (viejita.timerPoder <= 0 && viejita.poder !== 'normal') {
                viejita.poder = 'normal';
                viejita.escala = 1;
                actualizarHUDMario();
                crearTextoFlotante(viejita.x, viejita.y - 10, 'Poder agotado');
            }
        }

        // Temporizador de invulnerabilidad
        if (viejita.invulnerable) {
            viejita.timerInvulnerable--;
            if (viejita.timerInvulnerable <= 0) {
                viejita.invulnerable = false;
            }
        }

        // Animación de disparo
        if (viejita.animDisparo > 0) viejita.animDisparo--;

        // Velocidad horizontal
        let velMax = (viejita.poder === 'cafe') ? 5.8 : 3.6;
        if (viejita.poder === 'mentolin') velMax = 4.8;

        if (teclas.right) {
            viejita.vx = velMax;
            viejita.mirandoDerecha = true;
        } else if (teclas.left) {
            viejita.vx = -velMax;
            viejita.mirandoDerecha = false;
        } else {
            viejita.vx *= 0.76;
            if (Math.abs(viejita.vx) < 0.1) viejita.vx = 0;
        }

        // Salto y planeo con Vitamina
        if (teclas.jump) {
            if (viejita.enSuelo) {
                viejita.vy = (viejita.poder === 'cafe') ? -12.5 : -11.5;
                viejita.enSuelo = false;
                sonidoPop();
            } else if (viejita.poder === 'vitamina' && viejita.vy > 0.5) {
                // Planeo suave con chal/parasol
                viejita.vy = 1.0;
            }
        }

        // Disparo con tecla attack
        if (teclas.attack && viejita.animDisparo === 0) {
            dispararTe();
        }

        // Gravedad
        viejita.vy += M_GRAVEDAD;
        if (viejita.vy > 10) viejita.vy = 10;

        // Mover en X y resolver colisiones con bloques
        viejita.x += viejita.vx;
        const curW = viejita.w * viejita.escala;
        const curH = viejita.h * viejita.escala;

        if (viejita.x < 5) viejita.x = 5;

        bloquesMario.forEach((b) => {
            if (
                viejita.x + curW > b.x &&
                viejita.x < b.x + b.w &&
                viejita.y + curH > b.y &&
                viejita.y < b.y + b.h
            ) {
                if (viejita.vx > 0) viejita.x = b.x - curW;
                else if (viejita.vx < 0) viejita.x = b.x + b.w;
            }
        });

        // Mover en Y y colisiones
        viejita.y += viejita.vy;
        viejita.enSuelo = false;

        bloquesMario.forEach((b) => {
            if (
                viejita.x + curW > b.x &&
                viejita.x < b.x + b.w &&
                viejita.y + curH >= b.y &&
                viejita.y <= b.y + b.h
            ) {
                // Cabeceando el bloque desde abajo
                if (viejita.vy < 0) {
                    viejita.y = b.y + b.h;
                    viejita.vy = 0;
                    golpearBloque(b);
                }
                // Cayendo de pie sobre el bloque
                else if (viejita.vy > 0) {
                    viejita.y = b.y - curH;
                    viejita.vy = 0;
                    viejita.enSuelo = true;
                    // Guardar suelo seguro si es suelo o bloque sólido firme
                    if (b.tipo === 'suelo' || b.tipo === 'bloqueSolido') {
                        ultimoSueloSeguro.x = Math.max(30, viejita.x);
                        ultimoSueloSeguro.y = b.y - curH;
                    }
                }
            }
        });

        // Caída al vacío (pozo): pierde 1 vida y regresa al último suelo seguro antes del pozo
        if (viejita.y > M_ALTO + 25) {
            caerAlPozo();
        }

        // Cámara bidireccional (sigue a la viejita adelante y hacia atrás para que nunca quede fuera de pantalla)
        const targetCamX = viejita.x - M_ANCHO * 0.38;
        const infoNivel = NIVELES_INFO[nivelActual];
        const maxCamX = Math.max(0, infoNivel.longitud - M_ANCHO);
        camX = Math.max(0, Math.min(maxCamX, targetCamX));

        // Monedas flotantes
        monedasItems.forEach((m) => {
            if (!m.recogida && Math.hypot(viejita.x + curW / 2 - m.x, viejita.y + curH / 2 - m.y) < m.r + 18) {
                m.recogida = true;
                monedasMario++;
                scoreMario += 100;
                sonidoPop();
                actualizarHUDMario();
                crearTextoFlotante(m.x, m.y, '+100 🪙');
            }
        });

        // Medicinas y Cafés que salieron de bloques [?]
        for (let i = medicinasItems.length - 1; i >= 0; i--) {
            const med = medicinasItems[i];
            if (!med.recogida) {
                med.y += med.vy;
                med.vy += 0.2;
                if (med.vy > 3) med.vy = 3;

                // Colisión con la viejita
                if (
                    viejita.x + curW > med.x - 14 &&
                    viejita.x < med.x + 14 &&
                    viejita.y + curH > med.y - 14 &&
                    viejita.y < med.y + 14
                ) {
                    med.recogida = true;
                    scoreMario += 500;
                    activarPoder(med.poder, med.desc);
                    medicinasItems.splice(i, 1);
                }
            }
        }

        // --- ACTUALIZAR PROYECTILES DE TÉ ---
        for (let i = proyectiles.length - 1; i >= 0; i--) {
            const p = proyectiles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.25; // gravedad del té
            p.vida--;

            // Rebote en el suelo o bloques
            bloquesMario.forEach((b) => {
                if (p.x > b.x && p.x < b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
                    p.y = b.y - 2;
                    p.vy = -3.5;
                    p.rebotes++;
                }
            });

            // Impacto con enemigos
            enemigos.forEach((e) => {
                if (e.vivo && Math.hypot(p.x - (e.x + e.w / 2), p.y - (e.y + e.h / 2)) < 24) {
                    e.vivo = false;
                    scoreMario += 300;
                    sonidoAcierto();
                    crearParticulas(e.x + e.w / 2, e.y + e.h / 2, '#4caf50', 10);
                    crearTextoFlotante(e.x, e.y, '+300 🍵 ¡Calmado!');
                    p.vida = 0;
                }
            });

            // Impacto con el Jefe Sombra
            if (sombraJefe.activo && !sombraJefe.derrotado && sombraJefe.invulnerableTimer === 0) {
                if (
                    p.x > sombraJefe.x && p.x < sombraJefe.x + sombraJefe.w &&
                    p.y > sombraJefe.y && p.y < sombraJefe.y + sombraJefe.h
                ) {
                    golpearJefeSombra();
                    p.vida = 0;
                }
            }

            if (p.vida <= 0 || p.rebotes > 5) {
                proyectiles.splice(i, 1);
            }
        }

        // --- ACTUALIZAR ENEMIGOS ---
        enemigos.forEach((e) => {
            if (!e.vivo) return;

            // Movimiento horizontal y detección de pozos
            // Evita que floten o caminen sobre el vacío: al detectar el borde del pozo, dan la vuelta
            const pieX = (e.vx > 0) ? (e.x + e.w + 6) : (e.x - 6);
            const pieY = e.y + e.h + 8;
            const tieneSueloDebajo = bloquesMario.some((b) =>
                pieX >= b.x && pieX <= b.x + b.w &&
                pieY >= b.y && pieY <= b.y + b.h + 20
            );
            if (!tieneSueloDebajo && !e.ovillo) {
                e.vx = -e.vx;
            }

            e.x += e.vx;
            bloquesMario.forEach((b) => {
                if (e.x + e.w > b.x && e.x < b.x + b.w && e.y + e.h > b.y && e.y < b.y + b.h) {
                    e.vx = -e.vx;
                }
            });

            // Interacción Viejita vs Enemigo
            if (
                viejita.x + curW > e.x &&
                viejita.x < e.x + e.w &&
                viejita.y + curH > e.y &&
                viejita.y < e.y + e.h
            ) {
                // Caso 1: Viejita invencible con Mentolín
                if (viejita.poder === 'mentolin') {
                    e.vivo = false;
                    scoreMario += 400;
                    sonidoAcierto();
                    crearParticulas(e.x + e.w / 2, e.y + e.h / 2, '#ffeb3b', 12);
                    crearTextoFlotante(e.x, e.y, '+400 💥 ¡Mentolín!');
                }
                // Caso 2: Saltar encima del enemigo (pisotón estilo Mario)
                else if (viejita.vy > 0 && viejita.y + curH - viejita.vy <= e.y + 16) {
                    viejita.vy = -9.5; // rebote
                    sonidoPop();

                    if (e.tipo === 'tortuga' && !e.ovillo) {
                        e.ovillo = true;
                        e.vx = 0;
                        crearTextoFlotante(e.x, e.y, '🧶 ¡Ovillo!');
                    } else if (e.tipo === 'tortuga' && e.ovillo) {
                        // Patear ovillo
                        e.vx = (viejita.mirandoDerecha ? 9 : -9);
                        crearTextoFlotante(e.x, e.y, '¡Pateado!');
                    } else {
                        e.vivo = false;
                        scoreMario += 200;
                        crearParticulas(e.x + e.w / 2, e.y + e.h / 2, '#ff9800', 8);
                        crearTextoFlotante(e.x, e.y, '+200 🐱 ¡Gatito feliz!');
                    }
                }
                // Caso 3: Recibir daño lateral
                else if (!viejita.invulnerable) {
                    danoViejita();
                }
            }
        });

        // --- ACTUALIZAR JEFE FINAL: LA SOMBRA DE LA SOLEDAD ---
        if (sombraJefe.activo && !sombraJefe.derrotado) {
            sombraJefe.timerFase++;
            if (sombraJefe.invulnerableTimer > 0) sombraJefe.invulnerableTimer--;

            // Fases de movimiento
            if (sombraJefe.fase === 'flotar') {
                sombraJefe.x += sombraJefe.vx;
                sombraJefe.y = 110 + Math.sin(tickMario / 20) * 45;

                // Límites de la arena
                if (sombraJefe.x < 150) sombraJefe.vx = 2.4;
                if (sombraJefe.x > 950) sombraJefe.vx = -2.4;

                // Cada 160 frames, hacer picada rasante
                if (sombraJefe.timerFase > 160) {
                    sombraJefe.fase = 'picada';
                    sombraJefe.timerFase = 0;
                    sombraJefe.vy = 4.2;
                }
            } else if (sombraJefe.fase === 'picada') {
                sombraJefe.y += sombraJefe.vy;
                sombraJefe.x += (sombraJefe.vx * 0.7);

                if (sombraJefe.y > M_SUELO_Y - sombraJefe.h - 10) {
                    // Toca fondo y regresa arriba
                    sombraJefe.vy = -3.8;
                }
                if (sombraJefe.vy < 0 && sombraJefe.y <= 110) {
                    sombraJefe.fase = 'flotar';
                    sombraJefe.timerFase = 0;
                    sombraJefe.vy = 0;
                }
            }

            // Colisión Viejita vs Jefe Sombra
            if (
                viejita.x + curW > sombraJefe.x &&
                viejita.x < sombraJefe.x + sombraJefe.w &&
                viejita.y + curH > sombraJefe.y &&
                viejita.y < sombraJefe.y + sombraJefe.h
            ) {
                // Si la viejita cae encima de la cabeza del jefe
                if (viejita.vy > 0 && viejita.y + curH - viejita.vy <= sombraJefe.y + 25) {
                    viejita.vy = -10.5;
                    golpearJefeSombra();
                } else if (!viejita.invulnerable && sombraJefe.invulnerableTimer === 0) {
                    danoViejita();
                }
            }
        }

        // --- COMPROBAR LLEGADA A LA META ---
        if (numNivelValidoMeta() && !nivelCompletado) {
            completarNivelActual();
        }
    }

    function numNivelValidoMeta() {
        if (nivelActual === 5) {
            // Nivel 5 requiere vencer a la Sombra de la Soledad
            return sombraJefe.derrotado && viejita.x >= metaNivel.astaX - 10;
        }
        return viejita.x >= metaNivel.astaX - 10;
    }

    function golpearJefeSombra() {
        if (sombraJefe.invulnerableTimer > 0 || sombraJefe.derrotado) return;

        sombraJefe.vida--;
        sombraJefe.invulnerableTimer = 65;
        sonidoAcierto();
        crearParticulas(sombraJefe.x + sombraJefe.w / 2, sombraJefe.y + sombraJefe.h / 2, '#d500f9', 20);
        crearTextoFlotante(sombraJefe.x + 20, sombraJefe.y - 15, `💔 ¡Golpe a la Soledad! (Vidas: ${sombraJefe.vida})`);

        if (sombraJefe.vida <= 0) {
            // ¡Jefe derrotado!
            sombraJefe.derrotado = true;
            sombraJefe.activo = false;
            lanzarConfeti();
            sonidoAcierto();
            scoreMario += 5000;
            actualizarHUDMario();

            setTimeout(async () => {
                const msg = document.getElementById('msgMario');
                if (msg) {
                    msg.innerHTML = '🎉 ¡VICTORIA TOTAL! Has vencido a la <strong>Sombra de la Soledad</strong>. ¡La Pobre Viejecita aprendió a ser inmensamente feliz y agradecida con la vida! (+50 pts).';
                    msg.className = 'msg-feedback exito';
                }
                if (window.ReinoDB && typeof window.ReinoDB.registrarPuntos === 'function') {
                    await window.ReinoDB.registrarPuntos('viejecita_mario', 50);
                }
            }, 600);
        }
    }

    function completarNivelActual() {
        nivelCompletado = true;
        sonidoAcierto();
        lanzarConfeti();
        scoreMario += 1500;

        if (nivelActual >= nivelMaximoDesbloqueado && nivelMaximoDesbloqueado < 5) {
            nivelMaximoDesbloqueado = nivelActual + 1;
        }
        actualizarPestanasNivelesUI();
        actualizarHUDMario();

        const msg = document.getElementById('msgMario');
        if (nivelActual < 5) {
            if (msg) {
                msg.innerHTML = `🌟 ¡NIVEL ${nivelActual} SUPERADO! Has desbloqueado el Nivel ${nivelActual + 1}. Preparando el viaje...`;
                msg.className = 'msg-feedback exito';
            }
            setTimeout(() => {
                cargarNivel(nivelActual + 1);
            }, 2000);
        } else {
            if (msg) {
                msg.innerHTML = '🏆 ¡ERES EL CAMPEÓN DEL REINO! Superaste todos los 5 niveles y derrotaste a la Sombra de la Soledad.';
                msg.className = 'msg-feedback exito';
            }
        }
    }

    function caerAlPozo() {
        vidasMario--;
        sonidoError();
        actualizarHUDMario();

        if (vidasMario > 0) {
            viejita.x = ultimoSueloSeguro.x;
            viejita.y = ultimoSueloSeguro.y;
            viejita.vx = 0;
            viejita.vy = 0;
            viejita.enSuelo = true;
            viejita.invulnerable = true;
            viejita.timerInvulnerable = 80;
            crearTextoFlotante(viejita.x, viejita.y - 15, '💔 ¡Cuidado con el pozo!');
        } else {
            // Reiniciar vidas y nivel
            vidasMario = 3;
            viejita.poder = 'normal';
            viejita.escala = 1;
            cargarNivel(nivelActual);
            const msg = document.getElementById('msgMario');
            if (msg) {
                msg.innerHTML = '🔄 ¡Te has quedado sin vidas! Intenta de nuevo este nivel.';
                msg.className = 'msg-feedback';
            }
        }
    }

    function danoViejita() {
        if (viejita.poder !== 'normal') {
            // Pierde el poder en vez de la vida
            viejita.poder = 'normal';
            viejita.escala = 1;
            viejita.invulnerable = true;
            viejita.timerInvulnerable = 75;
            sonidoError();
            actualizarHUDMario();
            crearTextoFlotante(viejita.x, viejita.y - 15, '⚠️ ¡Poder perdido!');
            return;
        }

        vidasMario--;
        sonidoError();
        actualizarHUDMario();

        if (vidasMario > 0) {
            viejita.x = Math.max(60, viejita.x - 200);
            viejita.y = M_SUELO_Y - 50;
            viejita.vy = 0;
            viejita.invulnerable = true;
            viejita.timerInvulnerable = 90;
        } else {
            // Reiniciar vidas y nivel
            vidasMario = 3;
            viejita.poder = 'normal';
            cargarNivel(nivelActual);
            const msg = document.getElementById('msgMario');
            if (msg) {
                msg.innerHTML = '🔄 ¡Ánimo! Intenta de nuevo este nivel.';
                msg.className = 'msg-feedback';
            }
        }
    }

    function activarPoder(tipo, nombre) {
        viejita.poder = tipo;
        viejita.timerPoder = 600; // 10 segundos
        sonidoAcierto();
        lanzarConfeti();

        if (tipo === 'jarabe') viejita.escala = 1.32;
        else viejita.escala = 1;

        actualizarHUDMario();
        crearTextoFlotante(viejita.x, viejita.y - 20, `✨ ¡${nombre}!`);
    }

    function golpearBloque(bloque) {
        if (bloque.tipo === 'lucky' && !bloque.golpeado) {
            bloque.golpeado = true;
            bloque.animBounce = 8;
            sonidoPop();

            if (bloque.poderItem && bloque.poderItem !== 'moneda') {
                medicinasItems.push({
                    x: bloque.x + bloque.w / 2,
                    y: bloque.y - 12,
                    vy: -4,
                    poder: bloque.poderItem,
                    desc: bloque.desc || 'Medicina Mágica',
                    recogida: false
                });
            } else {
                monedasMario++;
                scoreMario += 200;
                actualizarHUDMario();
                crearTextoFlotante(bloque.x + 10, bloque.y - 20, '+200 🪙');
            }
        } else if (bloque.tipo === 'ladrillo') {
            // Si la viejita es grande (con Jarabe o escala > 1), rompe el bloque como Super Mario
            if (viejita.poder === 'jarabe' || viejita.escala > 1) {
                sonidoAcierto();
                scoreMario += 50;
                actualizarHUDMario();
                crearEscombrosLadrillo(bloque.x, bloque.y);
                crearTextoFlotante(bloque.x + 10, bloque.y - 15, '+50 🧱 ¡Roto!');
                const idx = bloquesMario.indexOf(bloque);
                if (idx !== -1) bloquesMario.splice(idx, 1);
            } else {
                bloque.animBounce = 6;
                sonidoPop();
            }
        }
    }

    function crearEscombrosLadrillo(bx, by) {
        const velocidades = [
            { vx: -2.8, vy: -6 },
            { vx: 2.8, vy: -6 },
            { vx: -1.6, vy: -4 },
            { vx: 1.6, vy: -4 }
        ];
        velocidades.forEach((v) => {
            particulasMario.push({
                x: bx + 16,
                y: by + 16,
                vx: v.vx,
                vy: v.vy,
                rot: 0,
                vRot: (Math.random() - 0.5) * 0.4,
                color: '#c84c0c',
                tipo: 'escombro',
                vida: 45
            });
        });
    }

    function crearTextoFlotante(x, y, texto) {
        particulasMario.push({ x, y, texto, alpha: 1, vy: -1.2, vida: 45, tipo: 'texto' });
    }

    function crearParticulas(x, y, color, cantidad) {
        for (let i = 0; i < cantidad; i++) {
            particulasMario.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5 - 2,
                color,
                radio: 3 + Math.random() * 3,
                vida: 30,
                tipo: 'particula'
            });
        }
    }

    // ==========================================================================
    // RENDERIZADO DEL JUEGO (CANVAS)
    // ==========================================================================
    function renderizarMarioJuego() {
        if (!marioCtx) return;
        marioCtx.clearRect(0, 0, M_ANCHO, M_ALTO);

        const info = NIVELES_INFO[nivelActual];

        // --- 1. FONDOS TEMÁTICOS SEGÚN NIVEL ---
        if (info.fondo === 'jardin') {
            // Cielo celeste día
            marioCtx.fillStyle = '#5c94fc';
            marioCtx.fillRect(0, 0, M_ANCHO, M_ALTO);
            // Nubes y colinas verdes
            dibujarFondoColinas('#00a800', '#80d010');
        } else if (info.fondo === 'despensa') {
            // Cocina / despensa cálida dorada
            marioCtx.fillStyle = '#fff9c4';
            marioCtx.fillRect(0, 0, M_ANCHO, M_ALTO);
            // Estantes y alacenas de fondo
            marioCtx.fillStyle = 'rgba(215, 204, 200, 0.4)';
            for (let s = 0; s < M_ANCHO; s += 80) {
                marioCtx.fillRect(s, 60, 60, 180);
            }
        } else if (info.fondo === 'salon') {
            // Gran salón púrpura Pombo
            marioCtx.fillStyle = '#311b92';
            marioCtx.fillRect(0, 0, M_ANCHO, M_ALTO);
            // Relojes de péndulo en la pared
            dibujarFondoRelojes();
        } else if (info.fondo === 'noche') {
            // Cielo nocturno estrellado
            marioCtx.fillStyle = '#0d1b2a';
            marioCtx.fillRect(0, 0, M_ANCHO, M_ALTO);
            dibujarEstrellasNoche();
        } else if (info.fondo === 'castillo') {
            // Fortaleza de la Sombra
            marioCtx.fillStyle = '#1a0033';
            marioCtx.fillRect(0, 0, M_ANCHO, M_ALTO);
            dibujarColumnasCastillo();
        }

        // --- 2. DIBUJAR MUNDO (APLICANDO CÁMARA) ---
        marioCtx.save();
        marioCtx.translate(-camX, 0);

        // Bloques y plataformas
        bloquesMario.forEach((b) => {
            const bounceY = b.animBounce ? -b.animBounce : 0;
            if (b.animBounce) b.animBounce -= 1;

            if (b.tipo === 'suelo') {
                marioCtx.fillStyle = (nivelActual === 4 || nivelActual === 5) ? '#263238' : '#c84c0c';
                marioCtx.fillRect(b.x, b.y, b.w, b.h);
                marioCtx.fillStyle = (nivelActual === 4 || nivelActual === 5) ? '#455a64' : '#fc9838';
                for (let px = b.x; px < b.x + b.w; px += 24) {
                    marioCtx.fillRect(px, b.y, 22, 4);
                }
            } else if (b.tipo === 'tuberia') {
                marioCtx.fillStyle = '#00a800';
                marioCtx.fillRect(b.x, b.y, b.w, b.h);
                marioCtx.fillStyle = '#80d010';
                marioCtx.fillRect(b.x + 4, b.y, 8, b.h);
                marioCtx.fillStyle = '#008800';
                marioCtx.fillRect(b.x - 3, b.y, b.w + 6, 12);
            } else if (b.tipo === 'lucky') {
                if (b.golpeado) {
                    marioCtx.fillStyle = '#8d6e63';
                    marioCtx.fillRect(b.x, b.y + bounceY, b.w, b.h);
                    marioCtx.strokeStyle = '#3e2723';
                    marioCtx.strokeRect(b.x, b.y + bounceY, b.w, b.h);
                } else {
                    marioCtx.fillStyle = '#fc9838';
                    marioCtx.fillRect(b.x, b.y + bounceY, b.w, b.h);
                    marioCtx.strokeStyle = '#a81000';
                    marioCtx.lineWidth = 2;
                    marioCtx.strokeRect(b.x, b.y + bounceY, b.w, b.h);
                    marioCtx.fillStyle = '#ffffff';
                    marioCtx.font = 'bold 20px monospace';
                    marioCtx.textAlign = 'center';
                    marioCtx.textBaseline = 'middle';
                    marioCtx.fillText('?', b.x + b.w / 2, b.y + bounceY + b.h / 2);
                }
            } else if (b.tipo === 'ladrillo') {
                marioCtx.fillStyle = '#c84c0c';
                marioCtx.fillRect(b.x, b.y + bounceY, b.w, b.h);
                marioCtx.strokeStyle = '#000000';
                marioCtx.strokeRect(b.x, b.y + bounceY, b.w, b.h);
            } else if (b.tipo === 'puente' || b.tipo === 'nube') {
                marioCtx.fillStyle = (b.tipo === 'nube') ? '#ffffff' : '#8d6e63';
                marioCtx.beginPath();
                marioCtx.roundRect(b.x, b.y, b.w, b.h, 6);
                marioCtx.fill();
            } else if (b.tipo === 'bloqueSolido') {
                marioCtx.fillStyle = '#455a64';
                marioCtx.fillRect(b.x, b.y, b.w, b.h);
                marioCtx.strokeStyle = '#263238';
                marioCtx.strokeRect(b.x, b.y, b.w, b.h);
            }
        });

        // Monedas flotantes
        monedasItems.forEach((m) => {
            if (!m.recogida) {
                marioCtx.fillStyle = '#ffd700';
                marioCtx.beginPath();
                marioCtx.arc(m.x, m.y + Math.sin(Date.now() / 150) * 3, m.r, 0, Math.PI * 2);
                marioCtx.fill();
                marioCtx.strokeStyle = '#e65100';
                marioCtx.stroke();
            }
        });

        // Medicinas y Cafés que brotan de lucky blocks
        medicinasItems.forEach((med) => {
            marioCtx.save();
            marioCtx.translate(med.x, med.y);
            if (med.poder === 'cafe') {
                marioCtx.font = '22px sans-serif';
                marioCtx.fillText('☕', -10, 8);
            } else if (med.poder === 'te') {
                marioCtx.font = '22px sans-serif';
                marioCtx.fillText('🍵', -10, 8);
            } else if (med.poder === 'mentolin') {
                marioCtx.font = '22px sans-serif';
                marioCtx.fillText('🩹', -10, 8);
            } else if (med.poder === 'vitamina') {
                marioCtx.font = '22px sans-serif';
                marioCtx.fillText('🧪', -10, 8);
            } else {
                marioCtx.font = '22px sans-serif';
                marioCtx.fillText('💊', -10, 8);
            }
            marioCtx.restore();
        });

        // Proyectiles de té
        proyectiles.forEach((p) => {
            marioCtx.save();
            marioCtx.fillStyle = '#81c784';
            marioCtx.beginPath();
            marioCtx.arc(p.x, p.y, 7, 0, Math.PI * 2);
            marioCtx.fill();
            marioCtx.fillStyle = '#ffffff';
            marioCtx.font = '12px sans-serif';
            marioCtx.fillText('🍵', p.x - 7, p.y + 4);
            marioCtx.restore();
        });

        // Enemigos
        enemigos.forEach((e) => dibujarEnemigo(marioCtx, e));

        // Jefe Sombra (si aplica)
        if (sombraJefe.activo) {
            dibujarJefeSombra(marioCtx, sombraJefe);
        }

        // Meta del nivel (Asta y casita)
        marioCtx.strokeStyle = '#ffffff';
        marioCtx.lineWidth = 5;
        marioCtx.beginPath();
        marioCtx.moveTo(metaNivel.astaX, M_SUELO_Y - 180);
        marioCtx.lineTo(metaNivel.astaX, M_SUELO_Y);
        marioCtx.stroke();

        marioCtx.fillStyle = '#ffd700';
        marioCtx.beginPath();
        marioCtx.arc(metaNivel.astaX, M_SUELO_Y - 180, 8, 0, Math.PI * 2);
        marioCtx.fill();

        marioCtx.fillStyle = '#00e676';
        marioCtx.beginPath();
        marioCtx.moveTo(metaNivel.astaX, metaNivel.banderaY);
        marioCtx.lineTo(metaNivel.astaX - 35, metaNivel.banderaY + 15);
        marioCtx.lineTo(metaNivel.astaX, metaNivel.banderaY + 30);
        marioCtx.closePath();
        marioCtx.fill();

        // Castillo clásico retro estilo SMB1 al final
        const cx = metaNivel.x;
        const cy = metaNivel.y;
        dibujarCastilloSMB1(cx, cy, metaNivel.w, 140);

        // La Viejecita (Protagonista)
        dibujarViejita(
            marioCtx,
            viejita.x,
            viejita.y,
            viejita.w,
            viejita.h,
            viejita.mirandoDerecha,
            viejita.poder,
            viejita.enSuelo,
            viejita.animDisparo
        );

        // Partículas y textos flotantes
        for (let i = particulasMario.length - 1; i >= 0; i--) {
            const p = particulasMario[i];
            p.vida--;
            if (p.tipo === 'texto') {
                p.y += p.vy;
                marioCtx.save();
                marioCtx.fillStyle = '#ffff00';
                marioCtx.font = 'bold 14px Poppins, sans-serif';
                marioCtx.fillText(p.texto, p.x, p.y);
                marioCtx.restore();
            } else if (p.tipo === 'particula') {
                p.x += p.vx;
                p.y += p.vy;
                marioCtx.save();
                marioCtx.fillStyle = p.color;
                marioCtx.beginPath();
                marioCtx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
                marioCtx.fill();
                marioCtx.restore();
            } else if (p.tipo === 'escombro') {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.35; // gravedad
                p.rot += p.vRot;
                marioCtx.save();
                marioCtx.translate(p.x, p.y);
                marioCtx.rotate(p.rot);
                marioCtx.fillStyle = p.color;
                marioCtx.fillRect(-7, -7, 14, 14);
                marioCtx.strokeStyle = '#263238';
                marioCtx.lineWidth = 1.5;
                marioCtx.strokeRect(-7, -7, 14, 14);
                marioCtx.restore();
            }
            if (p.vida <= 0) particulasMario.splice(i, 1);
        }

        marioCtx.restore(); // Fin cámara

        // --- 3. BARRA DE SALUD DEL JEFE EN NIVEL 5 (PANTALLA FIJA) ---
        if (nivelActual === 5 && sombraJefe.activo && !sombraJefe.derrotado) {
            marioCtx.save();
            marioCtx.fillStyle = 'rgba(26, 0, 51, 0.85)';
            marioCtx.roundRect(M_ANCHO / 2 - 160, 10, 320, 38, 12);
            marioCtx.fill();
            marioCtx.strokeStyle = '#e040fb';
            marioCtx.lineWidth = 2;
            marioCtx.stroke();

            marioCtx.fillStyle = '#ffffff';
            marioCtx.font = 'bold 13px Poppins, sans-serif';
            marioCtx.textAlign = 'center';
            marioCtx.fillText('👤 Sombra de la Soledad: ' + '❤️'.repeat(Math.max(0, sombraJefe.vida)), M_ANCHO / 2, 34);
            marioCtx.restore();
        }
    }

    // Funciones auxiliares de fondos
    function dibujarFondoColinas(c1, c2) {
        marioCtx.save();
        marioCtx.translate(-camX * 0.35, 0);

        // Nubes sonrientes estilo Super Mario Bros 1
        for (let nc = 0; nc < 12; nc++) {
            const ncx = nc * 280 + 50;
            const ncy = 35 + (nc % 3) * 20;
            dibujarNubeMarioSMB(ncx, ncy);
        }

        // Colinas redondeadas estilo SMB1
        for (let i = 0; i < 15; i++) {
            const hx = i * 300 + 60;
            marioCtx.fillStyle = c1;
            marioCtx.beginPath();
            marioCtx.arc(hx, M_SUELO_Y + 10, 55, Math.PI, Math.PI * 2);
            marioCtx.fill();
            marioCtx.fillStyle = c2;
            marioCtx.beginPath();
            marioCtx.arc(hx + 110, M_SUELO_Y, 24, Math.PI, Math.PI * 2);
            marioCtx.fill();
        }

        // Arbustos pixel en el suelo estilo SMB1
        for (let b = 0; b < 15; b++) {
            const bx = b * 260 + 120;
            dibujarArbustoMarioSMB(bx, M_SUELO_Y);
        }

        marioCtx.restore();
    }

    function dibujarNubeMarioSMB(x, y) {
        marioCtx.save();
        marioCtx.fillStyle = '#ffffff';
        marioCtx.beginPath();
        marioCtx.arc(x, y, 16, 0, Math.PI * 2);
        marioCtx.arc(x + 18, y - 6, 20, 0, Math.PI * 2);
        marioCtx.arc(x + 38, y, 16, 0, Math.PI * 2);
        marioCtx.fill();
        marioCtx.strokeStyle = '#b0bec5';
        marioCtx.lineWidth = 1.5;
        marioCtx.stroke();
        // Ojitos clásicos SMB1
        marioCtx.fillStyle = '#000000';
        marioCtx.fillRect(x + 13, y - 4, 3, 7);
        marioCtx.fillRect(x + 23, y - 4, 3, 7);
        marioCtx.restore();
    }

    function dibujarArbustoMarioSMB(x, groundY) {
        marioCtx.save();
        marioCtx.fillStyle = '#00a800';
        marioCtx.beginPath();
        marioCtx.arc(x, groundY, 14, Math.PI, Math.PI * 2);
        marioCtx.arc(x + 16, groundY, 18, Math.PI, Math.PI * 2);
        marioCtx.arc(x + 32, groundY, 14, Math.PI, Math.PI * 2);
        marioCtx.fill();
        marioCtx.fillStyle = '#80d010';
        marioCtx.beginPath();
        marioCtx.arc(x + 16, groundY - 4, 12, Math.PI, Math.PI * 2);
        marioCtx.fill();
        marioCtx.restore();
    }

    function dibujarCastilloSMB1(x, y, w, h) {
        marioCtx.save();
        // Base de ladrillos del castillo retro
        marioCtx.fillStyle = '#b71c1c';
        marioCtx.fillRect(x, y + 30, w, h - 30);
        // Torre superior
        marioCtx.fillRect(x + 18, y, w - 36, 30);
        // Almenas al tope
        marioCtx.fillStyle = '#7f0000';
        for (let bx = x; bx < x + w - 10; bx += 24) {
            marioCtx.fillRect(bx, y - 8, 14, 8);
        }
        // Puerta arqueada clásica
        marioCtx.fillStyle = '#000000';
        marioCtx.beginPath();
        marioCtx.arc(x + w / 2, y + h - 38, 18, Math.PI, 0);
        marioCtx.lineTo(x + w / 2 + 18, y + h);
        marioCtx.lineTo(x + w / 2 - 18, y + h);
        marioCtx.closePath();
        marioCtx.fill();

        // Mástil y banderita en el castillo
        marioCtx.fillStyle = '#ffffff';
        marioCtx.fillRect(x + w / 2 - 2, y - 24, 4, 16);
        marioCtx.fillStyle = '#00e676';
        marioCtx.beginPath();
        marioCtx.moveTo(x + w / 2 + 2, y - 24);
        marioCtx.lineTo(x + w / 2 + 18, y - 16);
        marioCtx.lineTo(x + w / 2 + 2, y - 8);
        marioCtx.closePath();
        marioCtx.fill();

        marioCtx.fillStyle = '#ffffff';
        marioCtx.font = 'bold 11px Poppins, sans-serif';
        marioCtx.textAlign = 'center';
        marioCtx.fillText('🏰 Fin de Nivel', x + w / 2, y + 20);
        marioCtx.restore();
    }

    function dibujarFondoRelojes() {
        marioCtx.save();
        marioCtx.translate(-camX * 0.25, 0);
        for (let i = 0; i < 12; i++) {
            const rx = i * 260 + 80;
            marioCtx.fillStyle = '#4a148c';
            marioCtx.fillRect(rx, 80, 40, 90);
            marioCtx.fillStyle = '#ffd54f';
            marioCtx.beginPath();
            marioCtx.arc(rx + 20, 105, 14, 0, Math.PI * 2);
            marioCtx.fill();
        }
        marioCtx.restore();
    }

    function dibujarEstrellasNoche() {
        marioCtx.save();
        marioCtx.fillStyle = '#ffffff';
        for (let i = 0; i < 40; i++) {
            const sx = (i * 67 + (camX * 0.1)) % M_ANCHO;
            const sy = (i * 29) % 220;
            marioCtx.fillRect(sx, sy, 2, 2);
        }
        // Luna brillante
        marioCtx.fillStyle = '#fff59d';
        marioCtx.beginPath();
        marioCtx.arc(M_ANCHO - 80, 50, 26, 0, Math.PI * 2);
        marioCtx.fill();
        marioCtx.restore();
    }

    function dibujarColumnasCastillo() {
        marioCtx.save();
        marioCtx.translate(-camX * 0.15, 0);
        marioCtx.fillStyle = '#311b92';
        for (let c = 0; c < 15; c++) {
            const cx = c * 180 + 30;
            marioCtx.fillRect(cx, 40, 35, M_SUELO_Y - 40);
            // Antorcha violeta
            marioCtx.fillStyle = '#e040fb';
            marioCtx.beginPath();
            marioCtx.arc(cx + 17, 120, 7, 0, Math.PI * 2);
            marioCtx.fill();
            marioCtx.fillStyle = '#311b92';
        }
        marioCtx.restore();
    }

    function loopMarioJuego() {
        actualizarMarioLogica();
        renderizarMarioJuego();
        marioLoopId = requestAnimationFrame(loopMarioJuego);
    }

    function inicializarMarioJuego() {
        marioCanvas = document.getElementById('marioCanvas');
        if (!marioCanvas) return;
        marioCtx = marioCanvas.getContext('2d');
        marioCanvas.width = M_ANCHO;
        marioCanvas.height = M_ALTO;

        // Cargar Nivel 1 por defecto
        cargarNivel(1);
        marioJuegoIniciado = true;

        if (marioLoopId) cancelAnimationFrame(marioLoopId);
        marioLoopId = requestAnimationFrame(loopMarioJuego);

        // Teclado (ignorar controles del juego cuando el usuario escribe en campos de texto)
        function esElementoDeTexto(el) {
            if (!el) return false;
            const tag = el.tagName;
            return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
        }

        window.addEventListener('keydown', (e) => {
            if (esElementoDeTexto(document.activeElement)) return;

            if (['ArrowLeft', 'KeyA'].includes(e.code)) teclas.left = true;
            if (['ArrowRight', 'KeyD'].includes(e.code)) teclas.right = true;
            if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
                teclas.jump = true;
                if (document.getElementById('etapa-transferencia')?.classList.contains('activo')) {
                    e.preventDefault();
                }
            }
            if (['KeyX', 'KeyR', 'KeyZ', 'KeyF'].includes(e.code)) {
                teclas.attack = true;
                dispararTe();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (esElementoDeTexto(document.activeElement)) return;

            if (['ArrowLeft', 'KeyA'].includes(e.code)) teclas.left = false;
            if (['ArrowRight', 'KeyD'].includes(e.code)) teclas.right = false;
            if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) teclas.jump = false;
            if (['KeyX', 'KeyR', 'KeyZ', 'KeyF'].includes(e.code)) teclas.attack = false;
        });

        // Controles táctiles
        const btnL = document.getElementById('btnTouchLeft');
        const btnR = document.getElementById('btnTouchRight');
        const btnJ = document.getElementById('btnTouchJump');
        const btnA = document.getElementById('btnTouchAttack');

        if (btnL) {
            const startL = (e) => { e.preventDefault(); teclas.left = true; btnL.classList.add('pressed'); };
            const endL = () => { teclas.left = false; btnL.classList.remove('pressed'); };
            btnL.addEventListener('mousedown', startL);
            btnL.addEventListener('mouseup', endL);
            btnL.addEventListener('mouseleave', endL);
            btnL.addEventListener('touchstart', startL, { passive: false });
            btnL.addEventListener('touchend', endL);
            btnL.addEventListener('touchcancel', endL);
        }

        if (btnR) {
            const startR = (e) => { e.preventDefault(); teclas.right = true; btnR.classList.add('pressed'); };
            const endR = () => { teclas.right = false; btnR.classList.remove('pressed'); };
            btnR.addEventListener('mousedown', startR);
            btnR.addEventListener('mouseup', endR);
            btnR.addEventListener('mouseleave', endR);
            btnR.addEventListener('touchstart', startR, { passive: false });
            btnR.addEventListener('touchend', endR);
            btnR.addEventListener('touchcancel', endR);
        }

        if (btnJ) {
            const startJ = (e) => { e.preventDefault(); teclas.jump = true; btnJ.classList.add('pressed'); };
            const endJ = () => { teclas.jump = false; btnJ.classList.remove('pressed'); };
            btnJ.addEventListener('mousedown', startJ);
            btnJ.addEventListener('mouseup', endJ);
            btnJ.addEventListener('mouseleave', endJ);
            btnJ.addEventListener('touchstart', startJ, { passive: false });
            btnJ.addEventListener('touchend', endJ);
            btnJ.addEventListener('touchcancel', endJ);
        }

        if (btnA) {
            const actA = (e) => {
                e.preventDefault();
                teclas.attack = true;
                dispararTe();
                btnA.classList.add('pressed');
            };
            const endA = () => { teclas.attack = false; btnA.classList.remove('pressed'); };
            btnA.addEventListener('mousedown', actA);
            btnA.addEventListener('mouseup', endA);
            btnA.addEventListener('mouseleave', endA);
            btnA.addEventListener('touchstart', actA, { passive: false });
            btnA.addEventListener('touchend', endA);
            btnA.addEventListener('touchcancel', endA);
        }

        // Pestañas selectoras de nivel
        document.querySelectorAll('.btn-nivel-tab').forEach((b) => {
            b.addEventListener('click', () => {
                const n = parseInt(b.dataset.nivel, 10);
                cambiarNivel(n);
            });
        });

        // Botón reiniciar partida
        document.getElementById('btnReiniciarMario')?.addEventListener('click', () => {
            cambiarNivel(nivelActual);
        });
    }

    // ==========================================================================
    // INICIALIZACIÓN GLOBAL CUANDO CARGA LA PÁGINA
    // ==========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        // Inicializar rompecabezas
        inicializarRompecabezas();

        // Inicializar quiz millonario
        renderizarPreguntaQuiz();

        // Inicializar juego de memoria
        iniciarJuegoMemory();
        document.getElementById('btnReiniciarMemory')?.addEventListener('click', () => {
            iniciarJuegoMemory();
            sonidoPop();
        });

        // Inicializar Mario Bros 1 con la Viejecita
        inicializarMarioJuego();
    });

})();
