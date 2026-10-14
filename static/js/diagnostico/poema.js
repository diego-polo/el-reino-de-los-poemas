// ==========================================
// ✨ COFRE MÁGICO Y DESBLOQUEO DEL PASADIZO SECRETO
// Nivel 1: Estructuración | Nivel 2: Transferencia
// ==========================================

// ── NAVEGACIÓN DE NIVELES ──────────────────────────
let nivel1Completado = false;

window.mostrarNivel = function (num) {
    const tab1 = document.getElementById('tabNivel1');
    const tab2 = document.getElementById('tabNivel2');
    const sec1 = document.getElementById('nivel1-estructuracion');
    const sec2 = document.getElementById('nivel2-carrera');

    if (num === 2) {
        if (!nivel1Completado) {
            // Efecto de sacudida en el tab bloqueado
            tab2.classList.add('reino-shake');
            setTimeout(() => tab2.classList.remove('reino-shake'), 600);

            // Mostrar aviso suave
            const aviso = document.createElement('div');
            aviso.style.cssText = `
                position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
                background: #c2185b; color: white; padding: 12px 22px;
                border-radius: 20px; font-weight: bold; z-index: 300000;
                box-shadow: 0 6px 20px rgba(0,0,0,0.3); font-size: 14px;
                animation: floatUp 3s ease-out forwards;
            `;
            aviso.textContent = '🔒 Completa el Nivel 1 primero para desbloquear la Carrera';
            document.body.appendChild(aviso);
            setTimeout(() => aviso.remove(), 3000);
            return;
        }
        tab2.classList.add('activo');
        tab1.classList.remove('activo');
        sec2.classList.add('activo');
        sec1.classList.remove('activo');

        // Actualizar puntos de navegación
        document.getElementById('puntoNivel1').classList.remove('activo-p');
        document.getElementById('puntoNivel1').classList.add('completado');
        document.getElementById('puntoNivel2').classList.add('activo-p');
    } else {
        tab1.classList.add('activo');
        tab2.classList.remove('activo');
        sec1.classList.add('activo');
        sec2.classList.remove('activo');

        document.getElementById('puntoNivel1').classList.add('activo-p');
        document.getElementById('puntoNivel2').classList.remove('activo-p');
    }
};

window.desbloquearYMostrarNivel2 = function () {
    nivel1Completado = true;
    const tab2 = document.getElementById('tabNivel2');
    if (tab2) tab2.classList.remove('bloqueado-tab');
    mostrarNivel(2);
};

// ── LÓGICA NIVEL 1 ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const cofre         = document.getElementById('cofre');
    const mensaje       = document.getElementById('mensaje');
    const encuesta      = document.getElementById('encuesta');
    const botonEnviar   = document.getElementById('enviar');
    const respuesta     = document.getElementById('respuesta');
    const desbloqueoAv  = document.getElementById('desbloqueoAviso1');
    const opinionArea   = document.getElementById('opinion');

    // 1. Abrir el cofre
    if (cofre) {
        cofre.addEventListener('click', () => {
            cofre.classList.toggle('abierto');
            if (cofre.classList.contains('abierto')) {
                mensaje.textContent = '🔓 ¡El cofre se ha abierto! Lee el poema y responde las preguntas.';
                mensaje.style.color = '#2e7d32';
                encuesta.classList.add('visible');
                encuesta.scrollIntoView({ behavior: 'smooth' });
            } else {
                mensaje.textContent = '🔐 Haz clic en el cofre para abrirlo';
                mensaje.style.color = '#e91e63';
            }
        });
    }

    // 2. Selección de opciones en preguntas (aleatorizadas con A, B, C)
    const letrasABC = ['A', 'B', 'C', 'D'];
    document.querySelectorAll('.pregunta .opciones').forEach(grupo => {
        const botones = Array.from(grupo.querySelectorAll('button'));
        if (botones.length > 1) {
            // Barajar aleatoriamente
            for (let i = botones.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [botones[i], botones[j]] = [botones[j], botones[i]];
            }
            botones.forEach((btn, idx) => {
                const letra = letrasABC[idx] || '';
                const textoOriginal = btn.textContent.replace(/^[A-D]\)\s*/, '');
                btn.textContent = `${letra}) ${textoOriginal}`;
                grupo.appendChild(btn);
            });
        }

        botones.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                botones.forEach(b => b.classList.remove('seleccionado'));
                btn.classList.add('seleccionado');
            });
        });
    });

    // 3. Semáforo de emociones
    const semaforos = document.querySelectorAll('.semaforo-btn');
    semaforos.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            semaforos.forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
        });
    });

    // 4. Completar Nivel 1
    if (botonEnviar) {
        botonEnviar.addEventListener('click', async () => {
            const contestadas = document.querySelectorAll('.pregunta .opciones button.seleccionado').length;
            const emocionSel  = document.querySelector('.semaforo-btn.activo');

            if (contestadas < 2) {
                respuesta.textContent = '⚠️ ¡Por favor responde al menos las preguntas sobre la mariposa!';
                respuesta.style.color = '#f44336';
                return;
            }
            if (!emocionSel) {
                respuesta.textContent = '⚠️ ¡Elige cómo te sentiste en el semáforo de las emociones!';
                respuesta.style.color = '#f44336';
                return;
            }

            // Guardar +25 pts por Nivel 1
            await window.ReinoDB.registrarPuntos('pasadizo_nivel1', 25, {
                emocion: emocionSel.dataset.emocion,
                opinion: opinionArea ? opinionArea.value.trim() : ''
            });

            botonEnviar.disabled = true;
            botonEnviar.textContent = '✅ ¡Nivel 1 Completado!';
            respuesta.textContent = '';
            nivel1Completado = true;

            // Desbloquear tab del Nivel 2
            const tab2 = document.getElementById('tabNivel2');
            if (tab2) tab2.classList.remove('bloqueado-tab');

            // Marcar punto 1 completado
            const punto1 = document.getElementById('puntoNivel1');
            if (punto1) {
                punto1.classList.remove('activo-p');
                punto1.classList.add('completado');
            }
            document.getElementById('puntoNivel2').classList.add('activo-p');

            if (desbloqueoAv) {
                desbloqueoAv.style.display = 'block';
                desbloqueoAv.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Si el nivel 1 ya fue completado previamente
    if (window.ReinoDB && window.ReinoDB.estaActividadCompletada('pasadizo_nivel1')) {
        nivel1Completado = true;
        const tab2 = document.getElementById('tabNivel2');
        if (tab2) tab2.classList.remove('bloqueado-tab');
        const punto1 = document.getElementById('puntoNivel1');
        if (punto1) { punto1.classList.remove('activo-p'); punto1.classList.add('completado'); }
        if (document.getElementById('puntoNivel2')) {
            document.getElementById('puntoNivel2').classList.add('activo-p');
        }
    }

    // Si el pasadizo completo ya fue superado
    if (window.ReinoDB && window.ReinoDB.estaActividadCompletada('pasadizo_secreto')) {
        nivel1Completado = true;
        const tab2 = document.getElementById('tabNivel2');
        if (tab2) tab2.classList.remove('bloqueado-tab');
        const aviso = document.getElementById('avisoPasadizo');
        if (aviso) {
            aviso.style.display = 'block';
            aviso.querySelector('h3').textContent = '✅ ¡Pasadizo ya superado! Puedes repasar.';
        }
        const punto1 = document.getElementById('puntoNivel1');
        const punto2 = document.getElementById('puntoNivel2');
        if (punto1) { punto1.classList.add('completado'); punto1.classList.remove('activo-p'); }
        if (punto2) { punto2.classList.add('completado'); punto2.classList.remove('activo-p'); }
    }
});
