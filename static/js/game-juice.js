/**
 * ==========================================================================
 * GAME JUICE & INTERACTIVE SOUND / PARTICLE ENGINE
 * El Reino de los Poemas - I.E.T.C. Caldas (Guamo - Tolima)
 * Sonidos sintetizados por Web Audio API y efectos de confeti / partículas
 * Diseñado para experiencias educativas interactivas de última generación.
 * ==========================================================================
 */

(function (window) {
    'use strict';

    // --- 1. SINTETIZADOR DE AUDIO WEB (Sin dependencias externas) ---
    let audioCtx = null;
    let soundEnabled = true;

    // Recuperar preferencia de sonido de localStorage
    try {
        const saved = localStorage.getItem('reino_sonido_activado');
        if (saved !== null) soundEnabled = JSON.parse(saved);
    } catch (e) {
        soundEnabled = true;
    }

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Efecto Pop suave (burbuja / toque)
    function playPop() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    // Efecto Correcto (Acorde triunfal brillante)
    function playCorrect() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);

            gain.gain.setValueAtTime(0, now + idx * 0.07);
            gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.07 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.35);
        });
    }

    // Efecto Error / Oops (tono amable, estilo caricatura)
    function playWrong() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.25);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Efecto Salto de Ranita / Boing
    function playJump() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.18);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
    }

    // Efecto Burbujas y Pócima del Caldero
    function playSplash() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Tres pequeñas burbujas
        [0, 0.06, 0.12].forEach((offset, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300 + i * 150, now + offset);
            osc.frequency.exponentialRampToValueAtTime(700 + i * 200, now + offset + 0.08);

            gain.gain.setValueAtTime(0.25, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.08);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + offset);
            osc.stop(now + offset + 0.08);
        });
    }

    // Efecto Mágico / Destello de Estrellas
    function playMagic() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const freqs = [600, 800, 1000, 1200, 1500, 1800];

        freqs.forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + idx * 0.04);

            gain.gain.setValueAtTime(0.18, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.2);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + idx * 0.04);
            osc.stop(now + idx * 0.04 + 0.2);
        });
    }

    // Fanfarria Final / Nivel Superado
    function playFanfare() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const fanfareNotes = [
            { f: 523.25, t: 0.0, d: 0.12 }, // Do
            { f: 523.25, t: 0.13, d: 0.12 }, // Do
            { f: 523.25, t: 0.26, d: 0.12 }, // Do
            { f: 659.25, t: 0.40, d: 0.35 }, // Mi
            { f: 783.99, t: 0.78, d: 0.55 }  // Sol largo
        ];

        fanfareNotes.forEach((n) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.f, now + n.t);

            gain.gain.setValueAtTime(0.3, now + n.t);
            gain.gain.exponentialRampToValueAtTime(0.01, now + n.t + n.d);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + n.t);
            osc.stop(now + n.t + n.d);
        });
    }

    // --- 2. SISTEMA DE CONFETI Y PARTÍCULAS CANVAS ---
    let confettiCanvas = null;
    let confettiCtx = null;
    let particles = [];
    let animationFrameId = null;

    function initConfettiCanvas() {
        if (confettiCanvas) return;
        confettiCanvas = document.createElement('canvas');
        confettiCanvas.id = 'reinoConfettiCanvas';
        confettiCanvas.style.position = 'fixed';
        confettiCanvas.style.top = '0';
        confettiCanvas.style.left = '0';
        confettiCanvas.style.width = '100vw';
        confettiCanvas.style.height = '100vh';
        confettiCanvas.style.pointerEvents = 'none';
        confettiCanvas.style.zIndex = '999999';
        document.body.appendChild(confettiCanvas);

        confettiCtx = confettiCanvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    function resizeCanvas() {
        if (!confettiCanvas) return;
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }

    const COLORES_CONFETI = [
        '#FF1744', '#FF5252', '#FF4081', '#E040FB', '#7C4DFF',
        '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA',
        '#69F0AE', '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40'
    ];

    function celebrate(count = 70) {
        initConfettiCanvas();
        playCorrect();

        const originX = window.innerWidth / 2;
        const originY = window.innerHeight * 0.45;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 6 + Math.random() * 12;
            particles.push({
                x: originX,
                y: originY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 5,
                size: 8 + Math.random() * 8,
                color: COLORES_CONFETI[Math.floor(Math.random() * COLORES_CONFETI.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 15,
                gravity: 0.35,
                alpha: 1,
                decay: 0.012 + Math.random() * 0.015,
                shape: Math.random() > 0.4 ? 'rect' : 'circle'
            });
        }

        if (!animationFrameId) {
            runConfettiLoop();
        }
    }

    function runConfettiLoop() {
        if (!confettiCtx) return;
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rotationSpeed;
            p.alpha -= p.decay;

            if (p.alpha <= 0 || p.y > confettiCanvas.height + 50) {
                particles.splice(i, 1);
                continue;
            }

            confettiCtx.save();
            confettiCtx.globalAlpha = p.alpha;
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate((p.rotation * Math.PI) / 180);
            confettiCtx.fillStyle = p.color;

            if (p.shape === 'circle') {
                confettiCtx.beginPath();
                confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                confettiCtx.fill();
            } else {
                confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            }

            confettiCtx.restore();
        }

        if (particles.length > 0) {
            animationFrameId = requestAnimationFrame(runConfettiLoop);
        } else {
            animationFrameId = null;
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    }

    // Efecto visual de monedas / XP flotante desde un elemento
    function floatingXP(puntos, targetEl) {
        if (!targetEl) return;
        const rect = targetEl.getBoundingClientRect();
        const badge = document.createElement('div');
        badge.className = 'reino-xp-popup';
        badge.innerHTML = `⭐ +${puntos} Pts`;
        badge.style.position = 'fixed';
        badge.style.left = `${rect.left + rect.width / 2}px`;
        badge.style.top = `${rect.top}px`;
        badge.style.transform = 'translate(-50%, 0)';
        badge.style.zIndex = '9999999';
        document.body.appendChild(badge);

        setTimeout(() => badge.remove(), 1800);
    }

    // Sacudida de pantalla / shake para errores
    function shakeElement(el) {
        if (!el) return;
        playWrong();
        el.classList.remove('reino-shake');
        void el.offsetWidth; // trigger reflow
        el.classList.add('reino-shake');
        setTimeout(() => el.classList.remove('reino-shake'), 600);
    }

    // Brillo / Pop en acierto
    function bounceElement(el) {
        if (!el) return;
        playCorrect();
        el.classList.remove('reino-bounce');
        void el.offsetWidth;
        el.classList.add('reino-bounce');
        setTimeout(() => el.classList.remove('reino-bounce'), 600);
    }

    // Control de silencio / sonido
    function toggleSound() {
        soundEnabled = !soundEnabled;
        try {
            localStorage.setItem('reino_sonido_activado', JSON.stringify(soundEnabled));
        } catch (e) {}
        if (soundEnabled) playPop();
        window.dispatchEvent(new CustomEvent('reino_sonido_cambiado', { detail: { soundEnabled } }));
        return soundEnabled;
    }

    function isSoundEnabled() {
        return soundEnabled;
    }

    // Auto-adjuntar sonido de clic suave a botones del reino
    document.addEventListener('DOMContentLoaded', () => {
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('button, .tab-btn, .btn-crear, .hoja-btn, .btn-prenda, .trebol-card, .btn-opcion-mil');
            if (btn && !btn.hasAttribute('data-sound-custom')) {
                playPop();
            }
        });
    });

    // Exponer API pública
    window.GameJuice = {
        playPop,
        playCorrect,
        playWrong,
        playJump,
        playSplash,
        playMagic,
        playFanfare,
        celebrate,
        floatingXP,
        shakeElement,
        bounceElement,
        toggleSound,
        isSoundEnabled
    };

})(window);
