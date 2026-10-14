/**
 * ==========================================================================
 * COMPONENTE VISUAL DE GAMIFICACIÓN, AUTENTICACIÓN Y BLOQUEO SECUENCIAL
 * ==========================================================================
 */

(function () {
    'use strict';

    if (!document.querySelector('link[href*="gamificacion.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/static/css/gamificacion.css';
        document.head.appendChild(link);
    }

    if (!window.GameJuice && !document.querySelector('script[src*="game-juice.js"]')) {
        const script = document.createElement('script');
        script.src = '/static/js/game-juice.js';
        document.head.appendChild(script);
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupTopBar();
        verificarAutenticacion();
        verificarSistemaBloqueoSecuencial();
        escucharEventosProgreso();
    });

    
    function setupTopBar() {
        if (document.querySelector('.reino-topbar')) return;

        const topbar = document.createElement('header');
        topbar.className = 'reino-topbar';
        topbar.innerHTML = `
            <div class="reino-brand">
                <div class="reino-escudo">🏰</div>
                <div class="reino-escuela-info">
                    <h4>I.E.T.C. Caldas - Sede El Carmen</h4>
                    <span>“Ser Caldista honor que enaltece”</span>
                </div>
            </div>
            <div class="reino-stats">
                <div id="reinoUserBadge" class="reino-user-badge">
                    <span id="reinoUserAvatar">🦁</span>
                    <span id="reinoUserName">Invitado</span>
                </div>
                <div id="reinoPuntosBadge" class="reino-puntos" title="Puntos ganados">
                    ⭐ <span id="reinoPuntosVal">0</span> pts
                </div>
                <div class="reino-progreso-box">
                    <span class="reino-progreso-txt">Progreso: <strong id="reinoProgresoTxt">0%</strong></span>
                    <div class="reino-barra-fondo">
                        <div id="reinoBarraProgreso" class="reino-barra-relleno"></div>
                    </div>
                </div>
                <button id="reinoBtnSound" class="reino-sound-btn" title="Activar/Desactivar Sonido">🔊</button>
                <button id="reinoBtnLogout" class="reino-btn-auth" title="Cerrar sesión">Salir 🚪</button>
            </div>
        `;

        document.body.prepend(topbar);

        const soundBtn = document.getElementById('reinoBtnSound');
        if (soundBtn) {
            const checkSoundState = () => {
                if (window.GameJuice) {
                    soundBtn.textContent = window.GameJuice.isSoundEnabled() ? '🔊' : '🔇';
                }
            };
            checkSoundState();
            soundBtn.addEventListener('click', () => {
                if (window.GameJuice) {
                    const enabled = window.GameJuice.toggleSound();
                    soundBtn.textContent = enabled ? '🔊' : '🔇';
                }
            });
        }

        document.getElementById('reinoBtnLogout').addEventListener('click', () => {
            if (confirm('¿Deseas cerrar sesión de tu cuenta de estudiante?')) {
                window.ReinoDB.cerrarSesion();
            }
        });

        actualizarTopBar();
    }

    // 2. ACTUALIZAR TOPBAR
    function actualizarTopBar() {
        const user = window.ReinoDB.getUsuarioActual();
        const prog = window.ReinoDB.getProgresoActual();

        const avatarEl = document.getElementById('reinoUserAvatar');
        const nameEl = document.getElementById('reinoUserName');
        const puntosEl = document.getElementById('reinoPuntosVal');
        const progresoTxt = document.getElementById('reinoProgresoTxt');
        const barra = document.getElementById('reinoBarraProgreso');

        if (user) {
            if (avatarEl) avatarEl.textContent = user.avatar || '🦁';
            if (nameEl) nameEl.textContent = `${user.nombre} (${user.grado})`;
        } else {
            if (avatarEl) avatarEl.textContent = '👤';
            if (nameEl) nameEl.textContent = 'Sin sesión';
        }

        if (puntosEl) puntosEl.textContent = prog.puntosTotales || 0;
        if (progresoTxt) progresoTxt.textContent = `${prog.porcentaje || 0}%`;
        if (barra) barra.style.width = `${prog.porcentaje || 0}%`;
    }

    // 3. AUTENTICACIÓN
    function verificarAutenticacion() {
        const user = window.ReinoDB.getUsuarioActual();
        if (!user) {
            mostrarModalAuth();
        }
    }

    function mostrarModalAuth() {
        if (document.getElementById('reinoModalAuth')) return;

        const overlay = document.createElement('div');
        overlay.id = 'reinoModalAuth';
        overlay.className = 'reino-modal-overlay';
        overlay.innerHTML = `
            <div class="reino-modal-card">
                <div class="reino-modal-header">
                    <span style="font-size: 45px;">🏰📖</span>
                    <h2>El Reino de los Poemas</h2>
                    <p>Ingresa con tu usuario para guardar tus puntos, desbloquear poemas en secuencia y ganar medallas.</p>
                </div>

                <div class="reino-tabs">
                    <button type="button" id="tabBtnLogin" class="reino-tab-btn activo">Iniciar Sesión</button>
                    <button type="button" id="tabBtnRegister" class="reino-tab-btn">Registrarse</button>
                </div>

                <!-- LOGIN -->
                <form id="formLogin">
                    <div class="reino-form-group">
                        <label for="loginUser">Usuario del estudiante:</label>
                        <input type="text" id="loginUser" placeholder="Ej: juanita123" required autocomplete="username">
                    </div>
                    <div class="reino-form-group">
                        <label for="loginPass">Contraseña:</label>
                        <input type="password" id="loginPass" placeholder="Tu contraseña" required autocomplete="current-password">
                    </div>
                    <button type="submit" class="reino-btn-submit">🚀 ¡Entrar al Reino!</button>
                    <p id="loginError" style="color: #d32f2f; font-weight: bold; margin-top: 10px; font-size: 13px;"></p>
                </form>

                <!-- REGISTRO -->
                <form id="formRegister" style="display: none;">
                    <div class="reino-form-group">
                        <label for="regNombre">Nombre y Apellido:</label>
                        <input type="text" id="regNombre" placeholder="Ej: Juanita Caldas" required>
                    </div>
                    <div class="reino-form-group">
                        <label for="regUser">Nombre de usuario (sin espacios):</label>
                        <input type="text" id="regUser" placeholder="Ej: juanita" required>
                    </div>
                    <div class="reino-form-group">
                        <label for="regPass">Contraseña:</label>
                        <input type="password" id="regPass" placeholder="Crea tu clave secreta" required>
                    </div>
                    <div class="reino-form-group">
                        <label for="regGrado">Grado escolar:</label>
                        <select id="regGrado">
                            <option value="Segundo">Segundo de Primaria</option>
                            <option value="Tercero" selected>Tercero de Primaria</option>
                        </select>
                    </div>
                    <div class="reino-form-group">
                        <label>Elige tu avatar:</label>
                        <div class="reino-avatars-grid">
                            <span class="reino-avatar-opt seleccionado" data-avatar="🦁">🦁</span>
                            <span class="reino-avatar-opt" data-avatar="🐻">🐻</span>
                            <span class="reino-avatar-opt" data-avatar="🐸">🐸</span>
                            <span class="reino-avatar-opt" data-avatar="🐵">🐵</span>
                            <span class="reino-avatar-opt" data-avatar="🦉">🦉</span>
                            <span class="reino-avatar-opt" data-avatar="🦋">🦋</span>
                        </div>
                    </div>
                    <button type="submit" class="reino-btn-submit">✨ ¡Crear mi cuenta!</button>
                    <p id="regError" style="color: #d32f2f; font-weight: bold; margin-top: 10px; font-size: 13px;"></p>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        const tabLogin = document.getElementById('tabBtnLogin');
        const tabReg = document.getElementById('tabBtnRegister');
        const formLogin = document.getElementById('formLogin');
        const formReg = document.getElementById('formRegister');

        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('activo');
            tabReg.classList.remove('activo');
            formLogin.style.display = 'block';
            formReg.style.display = 'none';
        });

        tabReg.addEventListener('click', () => {
            tabReg.classList.add('activo');
            tabLogin.classList.remove('activo');
            formReg.style.display = 'block';
            formLogin.style.display = 'none';
        });

        let avatarSeleccionado = '🦁';
        document.querySelectorAll('.reino-avatar-opt').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.reino-avatar-opt').forEach(o => o.classList.remove('seleccionado'));
                opt.classList.add('seleccionado');
                avatarSeleccionado = opt.dataset.avatar;
            });
        });

        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const u = document.getElementById('loginUser').value;
            const p = document.getElementById('loginPass').value;
            const res = await window.ReinoDB.login(u, p);
            if (res.success) {
                overlay.remove();
                actualizarTopBar();
                verificarSistemaBloqueoSecuencial();
            } else {
                document.getElementById('loginError').textContent = res.message;
            }
        });

        formReg.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nom = document.getElementById('regNombre').value;
            const u = document.getElementById('regUser').value;
            const p = document.getElementById('regPass').value;
            const grado = document.getElementById('regGrado').value;

            const res = await window.ReinoDB.registrar(nom, u, p, grado, avatarSeleccionado);
            if (res.success) {
                overlay.remove();
                actualizarTopBar();
                verificarSistemaBloqueoSecuencial();
            } else {
                document.getElementById('regError').textContent = res.message;
            }
        });
    }

    // 4. SISTEMA DE BLOQUEO SECUENCIAL NIVEL POR NIVEL
    function verificarSistemaBloqueoSecuencial() {
        const path = window.location.pathname.toLowerCase();

        // Si estamos en index.html
        if (path === '/' || path.endsWith('index.html') || path === '') {
            actualizarTarjetasIndexSecuencial();
            return;
        }

        // Si estamos en una página interna, identificar a qué poema pertenece
        const poemaIdActual = identificarPoemaDeUrl(path);

        if (poemaIdActual && poemaIdActual !== 'pasadizo') {
            const estaDesbloqueado = window.ReinoDB.estaPoemaDesbloqueado(poemaIdActual);
            if (!estaDesbloqueado) {
                const anterior = window.ReinoDB.getPoemaAnterior(poemaIdActual);
                mostrarModalBloqueoSecuencial(poemaIdActual, anterior);
            }
        }
    }

    function identificarPoemaDeUrl(path) {
        if (path.includes('diagnostico')) return 'pasadizo';
        if (path.includes('mona') || path.includes('mona-jacinta')) return 'mona_jacinta';
        if (path.includes('animales')) return 'animales';
        if (path.includes('caldero')) return 'caldero';
        if (path.includes('osito')) return 'osito';
        if (path.includes('viejecita')) return 'viejecita';
        if (path.includes('evaluacion-entorno')) return 'evaluacion';
        return null;
    }

    // Actualiza las tarjetas en index.html según el progreso secuencial
    function actualizarTarjetasIndexSecuencial() {
        const mapping = [
            { selector: '#cardMona', id: 'mona_jacinta', nombre: 'La Mona Jacinta' },
            { selector: '#cardAnimales', id: 'animales', nombre: 'De todos los animales' },
            { selector: '#cardCaldero', id: 'caldero', nombre: 'Había un caldero lleno...' },
            { selector: '#cardOsito', id: 'osito', nombre: '¿Qué se pondrá osito?' },
            { selector: '#cardViejecita', id: 'viejecita', nombre: 'La pobre viejecita' },
            { selector: '#cardEvaluacion', id: 'evaluacion', nombre: 'Evaluación de la clase' }
        ];

        // Estado del Pasadizo Secreto
        const tarjetaPasadizo = document.querySelector('.diagnostico .juego');
        if (tarjetaPasadizo) {
            const pasadizoCompletado = window.ReinoDB.estaPoemaCompletado('pasadizo');
            let badgePasadizo = tarjetaPasadizo.querySelector('.tarjeta-badge-status');
            if (!badgePasadizo) {
                badgePasadizo = document.createElement('span');
                badgePasadizo.className = 'tarjeta-badge-status';
                tarjetaPasadizo.style.position = 'relative';
                tarjetaPasadizo.prepend(badgePasadizo);
            }
            if (pasadizoCompletado) {
                badgePasadizo.className = 'tarjeta-badge-status tarjeta-completada-badge';
                badgePasadizo.textContent = '✅ ¡Pasadizo Superado!';
            } else {
                badgePasadizo.className = 'tarjeta-badge-status';
                badgePasadizo.style.background = '#e91e63';
                badgePasadizo.style.color = 'white';
                badgePasadizo.style.padding = '4px 10px';
                badgePasadizo.style.borderRadius = '12px';
                badgePasadizo.style.fontWeight = 'bold';
                badgePasadizo.style.position = 'absolute';
                badgePasadizo.style.top = '10px';
                badgePasadizo.style.right = '10px';
                badgePasadizo.textContent = '⭐ ¡Nivel 1: Empieza Aquí!';
            }
        }

        // Revisar cada tarjeta de la secuencia
        mapping.forEach((item) => {
            const tarjeta = document.querySelector(item.selector);
            if (!tarjeta) return;

            const desbloqueado = window.ReinoDB.estaPoemaDesbloqueado(item.id);
            const completado = window.ReinoDB.estaPoemaCompletado(item.id);
            const btn = tarjeta.querySelector('a');

            let badge = tarjeta.querySelector('.tarjeta-badge-status');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'tarjeta-badge-status';
                tarjeta.style.position = 'relative';
                tarjeta.prepend(badge);
            }

            if (!desbloqueado) {
                // BLOQUEADO
                tarjeta.classList.add('tarjeta-bloqueada');
                tarjeta.style.border = 'none';
                badge.className = 'tarjeta-badge-status tarjeta-candado-badge';
                badge.textContent = '🔒 Bloqueado';

                if (btn) {
                    if (!btn.getAttribute('data-original-href')) {
                        btn.setAttribute('data-original-href', btn.getAttribute('href'));
                    }
                    btn.removeAttribute('href');
                    btn.textContent = '🔒 Bloqueado';
                    btn.onclick = (e) => {
                        e.preventDefault();
                        const anterior = window.ReinoDB.getPoemaAnterior(item.id);
                        mostrarModalAdvertenciaSecuencia(item.nombre, anterior ? anterior.nombre : 'el anterior');
                    };
                }
            } else {
                // DESBLOQUEADO
                tarjeta.classList.remove('tarjeta-bloqueada');

                if (btn && btn.getAttribute('data-original-href')) {
                    btn.setAttribute('href', btn.getAttribute('data-original-href'));
                    btn.onclick = null;
                }

                if (completado) {
                    badge.className = 'tarjeta-badge-status tarjeta-completada-badge';
                    badge.textContent = '✅ ¡Completado!';
                    tarjeta.style.border = '3px solid #4caf50';
                    if (btn) btn.textContent = 'Repasar 🔄';
                } else {
                    if (badge) badge.remove();
                    tarjeta.style.border = '';
                    if (btn) btn.textContent = 'Ingresar ➔';
                }
            }
        });
    }

    function mostrarModalAdvertenciaSecuencia(nombrePoema, nombreAnterior) {
        const modal = document.createElement('div');
        modal.className = 'reino-modal-overlay';
        modal.innerHTML = `
            <div class="reino-modal-card">
                <span style="font-size: 55px;">🔒📖</span>
                <h2 style="color: #c2185b; margin: 15px 0;">¡Poema Bloqueado!</h2>
                <p style="font-size: 15px; color: #444; line-height: 1.6; margin-bottom: 25px;">
                    Para acceder a <strong>"${nombrePoema}"</strong>, primero debes terminar las actividades de <strong>"${nombreAnterior}"</strong>.
                    <br><br>
                    ¡Sigue la ruta en orden para conseguir todas las estrellas del Reino!
                </p>
                <button type="button" id="btnCerrarAviso" class="reino-btn-submit">
                    ¡Entendido, vamos en orden! 👍
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btnCerrarAviso').addEventListener('click', () => modal.remove());
    }

    function mostrarModalBloqueoSecuencial(poemaActualId, poemaAnterior) {
        const modal = document.createElement('div');
        modal.className = 'reino-modal-overlay';
        modal.innerHTML = `
            <div class="reino-modal-card">
                <span style="font-size: 60px;">🚫🔒</span>
                <h2 style="color: #b71c1c; margin: 15px 0;">Zona Bloqueada</h2>
                <p style="font-size: 15px; color: #444; line-height: 1.6; margin-bottom: 25px;">
                    ¡Alto ahí, pequeño poeta! Las puertas de este poema aún están cerradas con llave.
                    Debes completar primero: <strong>"${poemaAnterior ? poemaAnterior.nombre : 'el poema anterior'}"</strong>.
                </p>
                <a href="${poemaAnterior ? poemaAnterior.url : '/index.html'}" class="reino-btn-submit" style="text-decoration: none; display: block;">
                    👉 Ir a "${poemaAnterior ? poemaAnterior.nombre : 'Inicio'}" ahora
                </a>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // 5. EVENTOS
    function escucharEventosProgreso() {
        window.addEventListener('reino_progreso_actualizado', (e) => {
            const { puntosGanados } = e.detail;
            actualizarTopBar();
            verificarSistemaBloqueoSecuencial();

            if (puntosGanados > 0) {
                mostrarNotificacionPuntos(puntosGanados);
            }
        });

        window.addEventListener('reino_usuario_cambiado', () => {
            actualizarTopBar();
            verificarSistemaBloqueoSecuencial();
        });
    }

    function mostrarNotificacionPuntos(puntos) {
        const notif = document.createElement('div');
        notif.className = 'notif-puntos-flotante';
        notif.textContent = `+${puntos} Puntos ⭐ ¡Genial!`;
        document.body.appendChild(notif);

        const badge = document.getElementById('reinoPuntosBadge');
        if (badge) {
            badge.classList.add('anim-puntos');
            setTimeout(() => badge.classList.remove('anim-puntos'), 500);
        }

        setTimeout(() => notif.remove(), 2500);
    }

    // Banner para pasar al siguiente poema
    function renderBotonSiguientePoema(poemaActualId, targetElementId) {
        const target = document.getElementById(targetElementId);
        if (!target) return;

        const siguiente = window.ReinoDB.getSiguientePoema(poemaActualId);
        if (!siguiente) return;

        const banner = document.createElement('div');
        banner.className = 'banner-siguiente-poema';
        banner.style.cssText = `
            background: linear-gradient(135deg, #7c4dff, #00bcd4);
            color: white;
            padding: 20px;
            border-radius: 20px;
            margin: 25px auto;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            max-width: 600px;
            animation: fadeIn 0.5s ease;
        `;
        banner.innerHTML = `
            <span style="font-size: 35px;">🎉⭐</span>
            <h3 style="margin: 8px 0; font-size: 1.4rem;">¡Reto Superado con Éxito!</h3>
            <p style="margin-bottom: 15px; font-size: 1.05rem;">Has desbloqueado el siguiente poema en tu ruta poética:</p>
            <a href="${siguiente.url}" style="
                display: inline-block;
                background: #ffd700;
                color: #2b1055;
                text-decoration: none;
                font-weight: 900;
                font-size: 1.15rem;
                padding: 14px 28px;
                border-radius: 15px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                transition: transform 0.2s;
            ">➔ Pasar al siguiente: ${siguiente.nombre} 🚀</a>
        `;

        target.appendChild(banner);
    }

    window.ReinoUI = {
        actualizarTopBar,
        mostrarNotificacionPuntos,
        renderBotonSiguientePoema
    };

})();
