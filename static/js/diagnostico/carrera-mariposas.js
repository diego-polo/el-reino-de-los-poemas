/**
 * ==========================================================
 * 🦋 CARRERA DE MARIPOSAS – Nivel 2 del Pasadizo Secreto
 * ==========================================================
 * Juego de tipo "endless runner" lateral con mariposa.
 * Cuando aparece un obstáculo → pausa → pregunta quiz.
 * Si responde bien → avanza. Si falla → retroalimentación
 * con base al poema "La Mariposa" de María Elena Walsh.
 */

(function () {
    'use strict';

    // Polyfill para roundRect (compatibilidad con navegadores más viejos)
    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
            r = Math.min(r, w / 2, h / 2);
            this.beginPath();
            this.moveTo(x + r, y);
            this.lineTo(x + w - r, y);
            this.quadraticCurveTo(x + w, y, x + w, y + r);
            this.lineTo(x + w, y + h - r);
            this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            this.lineTo(x + r, y + h);
            this.quadraticCurveTo(x, y + h, x, y + h - r);
            this.lineTo(x, y + r);
            this.quadraticCurveTo(x, y, x + r, y);
            this.closePath();
        };
    }

    // ── PREGUNTAS QUIZ (basadas en el poema "Mariposa" de Canela, ©2004) ──
    const PREGUNTAS_QUIZ = [
        {
            emoji: '🌩️',
            obstaculoLabel: 'Tormenta',
            titulo: '¡Tormenta en el camino!',
            pregunta: '¿Dónde se esconde la pequeña mariposa al amanecer?',
            opciones: [
                { texto: 'En el centro de la rosa', correcto: true },
                { texto: 'Debajo de una hoja grande', correcto: false },
                { texto: 'En la copa de un árbol', correcto: false }
            ],
            feedback: '📜 El poema dice: "Al amanecer / se esconde / en el centro de la rosa / la pequeña mariposa". La mariposa busca refugio dentro de la rosa al comenzar el día.'
        },
        {
            emoji: '🌧️',
            obstaculoLabel: 'Lluvia',
            titulo: '¡Lluvia repentina!',
            pregunta: '¿A qué se parecen las alas de la mariposa según el poema?',
            opciones: [
                { texto: 'A hojas de un árbol', correcto: false },
                { texto: 'A pétalos que esperan muy quietos', correcto: true },
                { texto: 'A las nubes del cielo', correcto: false }
            ],
            feedback: '📜 El poema dice: "sus alas / son pétalos que esperan / muy quietos". Las alas de la mariposa se confunden con los pétalos de la rosa porque están muy quietas, ¡como si fueran parte de la flor!'
        },
        {
            emoji: '🌿',
            obstaculoLabel: 'Matorral',
            titulo: '¡Ramas en el camino!',
            pregunta: '¿Qué sueña la mariposa enamorada?',
            opciones: [
                { texto: 'Sueña con volar muy lejos', correcto: false },
                { texto: 'Sueña con ser parte de la rosa', correcto: true },
                { texto: 'Sueña con encontrar otra mariposa', correcto: false }
            ],
            feedback: '📜 El poema dice: "enamorada sueña / ser parte de la rosa". La mariposa quiere tanto a la rosa que sueña con pertenecer a ella, ¡estar juntas para siempre!'
        },
        {
            emoji: '🕸️',
            obstaculoLabel: 'Telaraña',
            titulo: '¡Telaraña peligrosa!',
            pregunta: '¿Por qué tiembla la rosa al final del día?',
            opciones: [
                { texto: 'Porque hace mucho frío', correcto: false },
                { texto: 'Porque sopla el viento fuerte', correcto: false },
                { texto: 'Porque es la mariposa que se cansa de estar presa', correcto: true }
            ],
            feedback: '📜 El poema dice: "la rosa tiembla / pero no es la rosa / es la mariposa / que se cansa de estar presa". ¡No es la rosa la que tiembla, sino la mariposa que se mueve porque quiere ser libre!'
        },
        {
            emoji: '⛅',
            obstaculoLabel: 'Nube oscura',
            titulo: '¡Nube oscura al frente!',
            pregunta: '¿Qué recuerda la mariposa al final del poema?',
            opciones: [
                { texto: 'Que debe quedarse en la rosa para siempre', correcto: false },
                { texto: 'Que si vuela ya no será parte de la rosa, pero será otra vez mariposa', correcto: true },
                { texto: 'Que las rosas son más importantes que volar', correcto: false }
            ],
            feedback: '📜 El poema dice: "y recuerda / que si vuela / ya no será parte de la rosa / pero será otra vez / mariposa." La mariposa elige ser libre: aunque deje la rosa, recupera su identidad. ¡Ser uno mismo es lo más valioso!'
        }
    ];

    // ── ESTADO DEL JUEGO ──
    let juegoActivo = false;
    let juegoEnPausa = false;
    let animFrameId = null;

    let mariposax = 80;
    let mariposay = 150;
    let velocidadY = 0;
    const GRAVEDAD = 0.35;
    const FUERZA_VUELO = -7;

    let obstaculos = [];
    let nubes = [];
    let flores = [];
    let distancia = 0;
    let velocidadJuego = 2.5;

    let obstaculosRespondidos = 0;
    const TOTAL_OBSTACULOS = 5;
    let preguntaActualIdx = 0;
    let puntosCarrera = 0;
    let vidasCarrera = 3;

    let nivelCompletado = false;

    // ── CANVAS ──
    const canvas = document.getElementById('canvasCarrera');
    const ctx = canvas ? canvas.getContext('2d') : null;

    const btnIniciar = document.getElementById('btnIniciarCarrera');
    const ptsEl = document.getElementById('ptsCarrera');
    const obsEl = document.getElementById('obsCarrera');
    const vidasEl = document.getElementById('vidasCarrera');

    // COLORES DE FONDO
    const COLORES_CIELO = ['#c8e6fa', '#b3d9f7', '#a8d5f5'];
    let colorCielo = 0;

    // Mariposa: alas animadas
    let alaAngle = 0;

    // ── INICIALIZAR JUEGO ──
    function iniciarJuego() {
        if (!canvas || !ctx) return;

        juegoActivo = true;
        juegoEnPausa = false;
        nivelCompletado = false;

        mariposax = 80;
        mariposay = canvas.height / 2;
        velocidadY = 0;

        obstaculos = [];
        nubes = generarNubesIniciales();
        flores = [];
        distancia = 0;
        velocidadJuego = 2.5;

        obstaculosRespondidos = 0;
        puntosCarrera = 0;
        vidasCarrera = 3;
        preguntaActualIdx = 0;

        actualizarHUD();

        if (btnIniciar) {
            btnIniciar.disabled = true;
            btnIniciar.textContent = '🦋 ¡Volando!';
        }

        cancelAnimationFrame(animFrameId);
        loop();
    }

    function generarNubesIniciales() {
        const lista = [];
        for (let i = 0; i < 4; i++) {
            lista.push({
                x: 100 + i * 180,
                y: 20 + Math.random() * 60,
                w: 70 + Math.random() * 50,
                h: 30 + Math.random() * 20,
                vel: 0.5 + Math.random() * 0.5
            });
        }
        return lista;
    }

    function generarNube() {
        return {
            x: canvas.width + 60,
            y: 10 + Math.random() * 80,
            w: 70 + Math.random() * 60,
            h: 28 + Math.random() * 18,
            vel: 0.5 + Math.random() * 0.6
        };
    }

    function generarObstaculo() {
        const tipos = ['tormenta', 'lluvia', 'matorral', 'telara', 'nube'];
        const tipo = tipos[obstaculosRespondidos % tipos.length];
        const alturaHueco = 120;
        const posYTop = 20 + Math.random() * (canvas.height - alturaHueco - 40);

        return {
            x: canvas.width,
            tipo,
            posYTop,
            alturaHueco,
            anchoObst: 45,
            preguntaIdx: obstaculosRespondidos % PREGUNTAS_QUIZ.length,
            disparada: false
        };
    }

    // ── LOOP PRINCIPAL ──
    function loop() {
        if (!juegoActivo) return;
        if (!juegoEnPausa) {
            actualizar();
        }
        dibujar();
        animFrameId = requestAnimationFrame(loop);
    }

    function actualizar() {
        distancia += velocidadJuego;
        alaAngle += 0.15;

        // Mariposa física
        velocidadY += GRAVEDAD;
        mariposay += velocidadY;

        // Límites verticales
        if (mariposay < 15) { mariposay = 15; velocidadY = 0; }
        if (mariposay > canvas.height - 30) {
            mariposay = canvas.height - 30;
            perderVida();
        }

        // Nubes
        nubes.forEach(n => { n.x -= n.vel; });
        nubes = nubes.filter(n => n.x > -100);
        if (nubes.length < 4 && Math.random() < 0.01) nubes.push(generarNube());

        // Obstáculos
        const distObstMin = 320 + (obstaculosRespondidos * 20);
        const ultimoObst = obstaculos[obstaculos.length - 1];
        if (!ultimoObst || ultimoObst.x < canvas.width - distObstMin) {
            if (obstaculosRespondidos < TOTAL_OBSTACULOS) {
                obstaculos.push(generarObstaculo());
            }
        }

        obstaculos.forEach(obs => { obs.x -= velocidadJuego; });

        // Colisión con obstáculos
        obstaculos.forEach(obs => {
            if (!obs.disparada && obs.x < mariposax + 25 && obs.x + obs.anchoObst > mariposax - 20) {
                // Detectar si choca (fuera del hueco)
                const enHueco = mariposay > obs.posYTop + 10 && mariposay < obs.posYTop + obs.alturaHueco - 10;
                if (!enHueco && obs.x < mariposax + 20) {
                    obs.disparada = true;
                    juegoEnPausa = true;
                    mostrarQuiz(obs.preguntaIdx);
                }
                // Activar quiz si llega al punto de obstáculo (sin colisionar – opción preventiva)
                if (!obs.disparada && obs.x + obs.anchoObst / 2 <= mariposax - 5 && obs.x > mariposax - 60) {
                    // No colisiona, pasó por el hueco: recompensar
                    obs.disparada = true;
                    puntosCarrera += 10;
                    actualizarHUD();
                }
            }
        });

        // Flores decorativas
        if (Math.random() < 0.02) {
            flores.push({
                x: canvas.width,
                y: canvas.height - 15 - Math.random() * 25,
                emoji: ['🌸', '🌼', '🌺', '🌻'][Math.floor(Math.random() * 4)]
            });
        }
        flores.forEach(f => { f.x -= velocidadJuego * 0.7; });
        flores = flores.filter(f => f.x > -20);
    }

    // ── DIBUJO ──
    function dibujar() {
        if (!ctx) return;
        const W = canvas.width;
        const H = canvas.height;

        // Cielo degradado
        const gradCielo = ctx.createLinearGradient(0, 0, 0, H);
        gradCielo.addColorStop(0, '#c8e6fa');
        gradCielo.addColorStop(0.6, '#dff6c8');
        gradCielo.addColorStop(1, '#b8e8a0');
        ctx.fillStyle = gradCielo;
        ctx.fillRect(0, 0, W, H);

        // Pasto inferior
        ctx.fillStyle = '#6dbf44';
        ctx.fillRect(0, H - 18, W, 18);
        ctx.fillStyle = '#4da628';
        ctx.fillRect(0, H - 12, W, 12);

        // Nubes
        nubes.forEach(n => dibujarNube(n));

        // Flores decorativas
        flores.forEach(f => {
            ctx.font = '18px serif';
            ctx.fillText(f.emoji, f.x, f.y);
        });

        // Obstáculos
        obstaculos.forEach(obs => dibujarObstaculo(obs));

        // Mariposa
        dibujarMariposa(mariposax, mariposay);

        // HUD en canvas (pequeño)
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.roundRect(8, 8, 150, 28, 8);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.font = 'bold 13px Lexend, sans-serif';
        ctx.fillText(`🦋 Dist: ${Math.floor(distancia / 10)}m`, 14, 26);

        // Mensaje inicio
        if (!juegoActivo || (juegoActivo && distancia < 5)) {
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 22px Poppins, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🦋 ¡Presiona el botón para volar!', W / 2, H / 2 - 10);
            ctx.font = '15px Lexend, sans-serif';
            ctx.fillText('Haz clic en el canvas o Espacio para subir', W / 2, H / 2 + 20);
            ctx.textAlign = 'left';
        }

        // Mensaje de pausa
        if (juegoEnPausa && juegoActivo) {
            ctx.fillStyle = 'rgba(194,24,91,0.25)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#c2185b';
            ctx.font = 'bold 20px Poppins, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⏸ Responde la pregunta para continuar', W / 2, H / 2);
            ctx.textAlign = 'left';
        }
    }

    function dibujarNube(n) {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.ellipse(n.x, n.y, n.w / 2, n.h / 2, 0, 0, Math.PI * 2);
        ctx.ellipse(n.x - n.w * 0.2, n.y + n.h * 0.15, n.w * 0.35, n.h * 0.45, 0, 0, Math.PI * 2);
        ctx.ellipse(n.x + n.w * 0.2, n.y + n.h * 0.15, n.w * 0.3, n.h * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    function dibujarObstaculo(obs) {
        const colores = {
            tormenta: { main: '#546e7a', dark: '#263238', emoji: '🌩️' },
            lluvia:   { main: '#5c6bc0', dark: '#283593', emoji: '🌧️' },
            matorral: { main: '#388e3c', dark: '#1b5e20', emoji: '🌿' },
            telara:   { main: '#8d6e63', dark: '#4e342e', emoji: '🕸️' },
            nube:     { main: '#90a4ae', dark: '#546e7a', emoji: '⛅' }
        };
        const c = colores[obs.tipo] || colores.tormenta;

        // Parte superior
        const gradT = ctx.createLinearGradient(obs.x, 0, obs.x + obs.anchoObst, 0);
        gradT.addColorStop(0, c.main);
        gradT.addColorStop(1, c.dark);
        ctx.fillStyle = gradT;
        ctx.fillRect(obs.x, 0, obs.anchoObst, obs.posYTop);

        // Parte inferior
        const posYBot = obs.posYTop + obs.alturaHueco;
        ctx.fillStyle = gradT;
        ctx.fillRect(obs.x, posYBot, obs.anchoObst, canvas.height - posYBot);

        // Borde brillante
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, 0, obs.anchoObst, obs.posYTop);
        ctx.strokeRect(obs.x, posYBot, obs.anchoObst, canvas.height - posYBot);

        // Emoji del tipo de obstáculo
        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.fillText(c.emoji, obs.x + obs.anchoObst / 2, obs.posYTop - 8);
        ctx.fillText(c.emoji, obs.x + obs.anchoObst / 2, posYBot + 28);
        ctx.textAlign = 'left';
    }

    function dibujarMariposa(x, y) {
        const t = alaAngle;
        const alas = Math.sin(t) * 0.5 + 0.5; // 0..1 oscila

        ctx.save();
        ctx.translate(x, y);

        // Ala superior izquierda
        ctx.save();
        ctx.scale(-1 + alas * 0.5, 1);
        ctx.fillStyle = 'rgba(240, 98, 146, 0.85)';
        ctx.beginPath();
        ctx.ellipse(-14 * (1 - alas * 0.6), -10, 18 - alas * 4, 13, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,180,200,0.5)';
        ctx.beginPath();
        ctx.ellipse(-10 * (1 - alas * 0.5), -8, 8, 6, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Ala superior derecha
        ctx.save();
        ctx.scale(1 - alas * 0.5, 1);
        ctx.fillStyle = 'rgba(240, 98, 146, 0.85)';
        ctx.beginPath();
        ctx.ellipse(14 * (1 - alas * 0.6), -10, 18 - alas * 4, 13, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,180,200,0.5)';
        ctx.beginPath();
        ctx.ellipse(10 * (1 - alas * 0.5), -8, 8, 6, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Ala inferior izquierda
        ctx.save();
        ctx.scale(-1 + alas * 0.5, 1);
        ctx.fillStyle = 'rgba(186, 104, 200, 0.75)';
        ctx.beginPath();
        ctx.ellipse(-10 * (1 - alas * 0.5), 8, 13 - alas * 3, 9, -Math.PI / 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Ala inferior derecha
        ctx.save();
        ctx.scale(1 - alas * 0.5, 1);
        ctx.fillStyle = 'rgba(186, 104, 200, 0.75)';
        ctx.beginPath();
        ctx.ellipse(10 * (1 - alas * 0.5), 8, 13 - alas * 3, 9, Math.PI / 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Cuerpo
        ctx.fillStyle = '#4a1942';
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cabeza
        ctx.fillStyle = '#6a1b9a';
        ctx.beginPath();
        ctx.arc(0, -13, 5, 0, Math.PI * 2);
        ctx.fill();

        // Antenas
        ctx.strokeStyle = '#4a1942';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-2, -17);
        ctx.quadraticCurveTo(-12, -28, -8, -32);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(2, -17);
        ctx.quadraticCurveTo(12, -28, 8, -32);
        ctx.stroke();

        // Ojos
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.arc(-2, -14, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(2, -14, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath(); ctx.arc(-2, -14, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(2, -14, 1, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
    }

    function perderVida() {
        if (!juegoActivo) return;
        vidasCarrera--;
        actualizarHUD();
        velocidadY = FUERZA_VUELO * 0.5;
        mariposay = Math.min(mariposay, canvas.height - 50);

        if (vidasCarrera <= 0) {
            juegoActivo = false;
            cancelAnimationFrame(animFrameId);
            setTimeout(() => {
                mostrarFinJuego(false);
            }, 300);
        }
    }

    function actualizarHUD() {
        if (ptsEl) ptsEl.textContent = puntosCarrera;
        if (obsEl) obsEl.textContent = `${obstaculosRespondidos}/${TOTAL_OBSTACULOS}`;
        if (vidasEl) vidasEl.textContent = '❤️'.repeat(Math.max(0, vidasCarrera));
    }

    // ── QUIZ DE OBSTÁCULOS ──
    function mostrarQuiz(idx) {
        const pregunta = PREGUNTAS_QUIZ[idx % PREGUNTAS_QUIZ.length];
        const modal = document.getElementById('quizModal');
        const emojiEl = document.getElementById('quizEmoji');
        const tituloEl = document.getElementById('quizTitulo');
        const preguntaEl = document.getElementById('quizPregunta');
        const opcionesEl = document.getElementById('quizOpciones');
        const feedbackEl = document.getElementById('quizFeedback');
        const btnContinuar = document.getElementById('quizBtnContinuar');

        if (!modal) return;

        emojiEl.textContent = pregunta.emoji;
        tituloEl.textContent = `${pregunta.emoji} ${pregunta.titulo}`;
        preguntaEl.textContent = pregunta.pregunta;
        feedbackEl.textContent = '';
        feedbackEl.className = 'quiz-feedback-box';
        btnContinuar.className = 'quiz-btn-continuar';

        // Generar opciones (mezcladas con letras A, B, C)
        opcionesEl.innerHTML = '';
        const opcionesOrden = [...pregunta.opciones].sort(() => Math.random() - 0.5);
        const letras = ['A', 'B', 'C', 'D'];
        opcionesOrden.forEach((op, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'quiz-opcion-btn';
            btn.innerHTML = `<strong>${letras[idx]})</strong> ${op.texto}`;
            btn.addEventListener('click', () => manejarRespuesta(btn, op.correcto, pregunta.feedback, opcionesEl, feedbackEl, btnContinuar));
            opcionesEl.appendChild(btn);
        });

        modal.style.display = 'flex';
    }

    function manejarRespuesta(btn, esCorrecta, feedback, opcionesEl, feedbackEl, btnContinuar) {
        // Deshabilitar todos los botones
        opcionesEl.querySelectorAll('.quiz-opcion-btn').forEach(b => {
            b.disabled = true;
            b.style.cursor = 'default';
        });

        if (esCorrecta) {
            btn.classList.add('correcta');
            puntosCarrera += 20;
            obstaculosRespondidos++;
            feedbackEl.innerHTML = `<strong>✅ ¡Correcto!</strong> +20 puntos.<br><br>📜 <em>${feedback}</em>`;
        } else {
            btn.classList.add('incorrecta');
            // Marcar la correcta
            opcionesEl.querySelectorAll('.quiz-opcion-btn').forEach(b => {
                // Encontrar la opción correcta por texto
            });
            feedbackEl.innerHTML = `<strong>❌ ¡Incorrecto!</strong> Pero aprendamos juntos:<br><br>📜 <em>${feedback}</em><br><br>🦋 La mariposa sigue adelante. ¡Tú también puedes!`;
            obstaculosRespondidos++;
        }

        feedbackEl.classList.add('visible');
        btnContinuar.classList.add('visible');
        actualizarHUD();

        // Verificar si terminó
        if (obstaculosRespondidos >= TOTAL_OBSTACULOS) {
            btnContinuar.textContent = '🏆 ¡Ver resultado final!';
            btnContinuar.addEventListener('click', () => {
                cerrarQuiz();
                mostrarFinJuego(true);
            }, { once: true });
        } else {
            btnContinuar.addEventListener('click', () => {
                cerrarQuiz();
                reanudarJuego();
            }, { once: true });
        }
    }

    function cerrarQuiz() {
        const modal = document.getElementById('quizModal');
        if (modal) modal.style.display = 'none';
    }

    function reanudarJuego() {
        juegoEnPausa = false;
        // Limpiar obstáculos disparados
        obstaculos = obstaculos.filter(o => !o.disparada);
        velocidadY = FUERZA_VUELO * 0.5;
    }

    function mostrarFinJuego(ganado) {
        juegoActivo = false;
        cancelAnimationFrame(animFrameId);

        if (ganado) {
            // Bonificación final
            puntosCarrera += 30;
            actualizarHUD();

            // Registrar en la DB
            if (window.ReinoDB) {
                window.ReinoDB.registrarPuntos('pasadizo_secreto', puntosCarrera, {
                    nivel2: true,
                    distancia: Math.floor(distancia / 10)
                });
            }

            // Mostrar aviso de completado
            const aviso = document.getElementById('avisoPasadizo');
            const ptsTxt = document.getElementById('ptsTotalesCarrera');
            if (aviso) aviso.style.display = 'block';
            if (ptsTxt) ptsTxt.textContent = puntosCarrera;
            aviso.scrollIntoView({ behavior: 'smooth' });

            // Actualizar puntos de nivel 2
            if (document.getElementById('puntoNivel2')) {
                document.getElementById('puntoNivel2').classList.add('completado');
            }
        } else {
            // Juego perdido
            if (btnIniciar) {
                btnIniciar.disabled = false;
                btnIniciar.textContent = '🔄 ¡Intentar de nuevo!';
            }
            // Dibujar mensaje de fin
            if (ctx) {
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#ffd700';
                ctx.font = 'bold 24px Poppins, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🦋 ¡Sin vidas! Inténtalo de nuevo', canvas.width / 2, canvas.height / 2 - 15);
                ctx.fillStyle = 'white';
                ctx.font = '16px Lexend, sans-serif';
                ctx.fillText(`Puntos obtenidos: ${puntosCarrera}`, canvas.width / 2, canvas.height / 2 + 18);
                ctx.textAlign = 'left';
            }
        }
    }

    // ── CONTROLES ──
    function volar() {
        if (!juegoActivo || juegoEnPausa) return;
        velocidadY = FUERZA_VUELO;
    }

    if (canvas) {
        canvas.addEventListener('click', volar);
    }

    document.addEventListener('keydown', (e) => {
        // No interceptar si el usuario está escribiendo en un input, textarea o elemento editable
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
            return;
        }
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            if (juegoActivo && !juegoEnPausa) {
                e.preventDefault();
                volar();
            }
        }
    });

    if (btnIniciar) {
        btnIniciar.addEventListener('click', iniciarJuego);
    }

    // Dibujar pantalla de espera inicial
    function dibujarPantallaEspera() {
        if (!ctx) return;
        const W = canvas.width;
        const H = canvas.height;
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#c8e6fa');
        grad.addColorStop(0.6, '#dff6c8');
        grad.addColorStop(1, '#b8e8a0');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#6dbf44';
        ctx.fillRect(0, H - 18, W, 18);

        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.roundRect(W / 2 - 200, H / 2 - 50, 400, 95, 18);
        ctx.fill();

        ctx.fillStyle = '#c2185b';
        ctx.font = 'bold 20px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🦋 Carrera de Mariposas', W / 2, H / 2 - 20);
        ctx.fillStyle = '#555';
        ctx.font = '14px Lexend, sans-serif';
        ctx.fillText('Presiona el botón para iniciar', W / 2, H / 2 + 5);
        ctx.fillText('Haz clic o presiona Espacio para volar', W / 2, H / 2 + 25);
        ctx.textAlign = 'left';
    }

    // Exponer función para uso externo
    window.CarreraMariposas = { iniciarJuego };

    // Dibujar pantalla inicial al cargar
    if (ctx) {
        setTimeout(dibujarPantallaEspera, 100);
    }

})();
