/**
 * ==========================================================================
 * SISTEMA DE BASE DE DATOS Y GESTIÓN DE PROGRESO - EL REINO DE LOS POEMAS
 * Implementación con IndexedDB y sincronización con localStorage
 * Soporte para desbloqueo secuencial nivel por nivel
 * ==========================================================================
 */

(function (window) {
    'use strict';

    const DB_NAME = 'ReinoPoemasDB';
    const DB_VERSION = 2;
    const STORAGE_KEY_CURRENT_USER = 'reino_poemas_current_user';
    const STORAGE_KEY_USERS = 'reino_poemas_users';
    const STORAGE_KEY_PROGRESS = 'reino_poemas_progress';

    // Ruta secuencial estricta de poemas
    const SECUENCIA_POEMAS = [
        {
            id: 'pasadizo',
            claveCompletado: 'pasadizo_secreto',
            nombre: 'El pasadizo secreto',
            url: '/template/diagnostico/poema.html'
        },
        {
            id: 'mona_jacinta',
            claveCompletado: 'mona_transferencia',
            nombre: 'La Mona Jacinta',
            url: '/template/poemas/mona-jacinta.html'
        },
        {
            id: 'animales',
            claveCompletado: 'animales_escape_room',
            nombre: 'De todos los animales',
            url: '/template/poemas/animales.html'
        },
        {
            id: 'caldero',
            claveCompletado: 'caldero_crear_magia',
            nombre: 'Había un caldero lleno...',
            url: '/template/poemas/caldero.html'
        },
        {
            id: 'osito',
            claveCompletado: 'osito_vestir_secuencia',
            nombre: '¿Qué se pondrá osito?',
            url: '/template/poemas/que-se-pondra-osito.html'
        },
        {
            id: 'viejecita',
            claveCompletado: 'viejecita_debate',
            nombre: 'La pobre viejecita',
            url: '/template/poemas/viejecita.html'
        },
        {
            id: 'evaluacion',
            claveCompletado: 'evaluacion_final',
            nombre: 'Evaluación de la clase',
            url: '/template/poemas/evaluacion-entorno.html'
        }
    ];

    const ACTIVIDADES_TOTALES = [
        'pasadizo_nivel1',
        'pasadizo_secreto',
        'mona_alcanza_estrella',
        'mona_juego_rimas',
        'mona_encontrar_rimas',
        'mona_quiz',
        'mona_transferencia',
        'animales_sonidos_rimas',
        'animales_froggy_jumps',
        'animales_escape_room',
        'caldero_exploracion',
        'caldero_lectura_emociones',
        'caldero_crear_magia',
        'viejecita_puzzle',
        'viejecita_quiz_millonario',
        'viejecita_debate',
        'osito_rasca_gana',
        'osito_comprension',
        'osito_vestir_secuencia',
        'evaluacion_final'
    ];

    let dbInstance = null;

    function initIndexedDB() {
        return new Promise((resolve) => {
            if (!window.indexedDB) {
                resolve(null);
                return;
            }

            const request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = function (event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('usuarios')) {
                    db.createObjectStore('usuarios', { keyPath: 'username' });
                }
                if (!db.objectStoreNames.contains('progreso')) {
                    db.createObjectStore('progreso', { keyPath: 'username' });
                }
            };

            request.onsuccess = function (event) {
                dbInstance = event.target.result;
                resolve(dbInstance);
            };

            request.onerror = function () {
                resolve(null);
            };
        });
    }

    function getLocalStorage(key, defaultVal) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultVal;
        } catch (e) {
            return defaultVal;
        }
    }

    function setLocalStorage(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.error('Error escribiendo en localStorage', e);
        }
    }

    function saveUserToIDB(user) {
        if (!dbInstance) return Promise.resolve();
        return new Promise((resolve) => {
            try {
                const tx = dbInstance.transaction(['usuarios'], 'readwrite');
                const store = tx.objectStore('usuarios');
                store.put(user);
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            } catch (e) {
                resolve();
            }
        });
    }

    function saveProgressToIDB(progreso) {
        if (!dbInstance) return Promise.resolve();
        return new Promise((resolve) => {
            try {
                const tx = dbInstance.transaction(['progreso'], 'readwrite');
                const store = tx.objectStore('progreso');
                store.put(progreso);
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            } catch (e) {
                resolve();
            }
        });
    }

    function createInitialProgress(username) {
        return {
            username: username,
            puntosTotales: 0,
            pasadizoCompletado: false,
            actividadesCompletadas: {},
            porcentaje: 0,
            fechaActualizacion: new Date().toISOString()
        };
    }

    const ReinoDB = {
        secuencia: SECUENCIA_POEMAS,

        async init() {
            await initIndexedDB();

            const users = getLocalStorage(STORAGE_KEY_USERS, {});
            if (!users['estudiante1']) {
                users['estudiante1'] = {
                    username: 'estudiante1',
                    password: '123',
                    nombre: 'Juanita Caldas',
                    grado: 'Tercero',
                    avatar: '🦁',
                    fechaRegistro: new Date().toISOString()
                };
                setLocalStorage(STORAGE_KEY_USERS, users);
                await saveUserToIDB(users['estudiante1']);
            }

            const allProgress = getLocalStorage(STORAGE_KEY_PROGRESS, {});
            if (!allProgress['estudiante1']) {
                allProgress['estudiante1'] = createInitialProgress('estudiante1');
                setLocalStorage(STORAGE_KEY_PROGRESS, allProgress);
                await saveProgressToIDB(allProgress['estudiante1']);
            }
        },

        async registrar(nombre, username, password, grado, avatar) {
            const cleanUser = username.trim().toLowerCase();
            const users = getLocalStorage(STORAGE_KEY_USERS, {});

            if (users[cleanUser]) {
                return { success: false, message: 'El usuario ya existe. Elige otro nombre de usuario.' };
            }

            const nuevoUsuario = {
                username: cleanUser,
                password: password,
                nombre: nombre.trim(),
                grado: grado || 'Tercero',
                avatar: avatar || '🦁',
                fechaRegistro: new Date().toISOString()
            };

            users[cleanUser] = nuevoUsuario;
            setLocalStorage(STORAGE_KEY_USERS, users);
            await saveUserToIDB(nuevoUsuario);

            const allProgress = getLocalStorage(STORAGE_KEY_PROGRESS, {});
            allProgress[cleanUser] = createInitialProgress(cleanUser);
            setLocalStorage(STORAGE_KEY_PROGRESS, allProgress);
            await saveProgressToIDB(allProgress[cleanUser]);

            this.setUsuarioActual(nuevoUsuario);
            return { success: true, user: nuevoUsuario };
        },

        async login(username, password) {
            const cleanUser = username.trim().toLowerCase();
            const users = getLocalStorage(STORAGE_KEY_USERS, {});
            const usuario = users[cleanUser];

            if (!usuario || usuario.password !== password) {
                return { success: false, message: 'Usuario o contraseña incorrectos.' };
            }

            this.setUsuarioActual(usuario);
            return { success: true, user: usuario };
        },

        getUsuarioActual() {
            return getLocalStorage(STORAGE_KEY_CURRENT_USER, null);
        },

        setUsuarioActual(user) {
            setLocalStorage(STORAGE_KEY_CURRENT_USER, user);
            window.dispatchEvent(new CustomEvent('reino_usuario_cambiado', { detail: user }));
        },

        cerrarSesion() {
            localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
            window.dispatchEvent(new CustomEvent('reino_usuario_cerrado'));
            window.location.href = '/index.html';
        },

        getProgresoActual() {
            const user = this.getUsuarioActual();
            if (!user) return createInitialProgress('invitado');

            const allProgress = getLocalStorage(STORAGE_KEY_PROGRESS, {});
            if (!allProgress[user.username]) {
                allProgress[user.username] = createInitialProgress(user.username);
                setLocalStorage(STORAGE_KEY_PROGRESS, allProgress);
            }
            return allProgress[user.username];
        },

        async registrarPuntos(actividadKey, puntos, metaData = {}) {
            const user = this.getUsuarioActual();
            if (!user) return { success: false, message: 'Inicia sesión para guardar tu progreso' };

            const allProgress = getLocalStorage(STORAGE_KEY_PROGRESS, {});
            let userProg = allProgress[user.username] || createInitialProgress(user.username);

            const yaEstabaCompletada = !!userProg.actividadesCompletadas[actividadKey];

            userProg.actividadesCompletadas[actividadKey] = {
                completada: true,
                puntos: puntos,
                fecha: new Date().toISOString(),
                ...metaData
            };

            if (!yaEstabaCompletada) {
                userProg.puntosTotales = (userProg.puntosTotales || 0) + puntos;
            }

            if (actividadKey === 'pasadizo_secreto') {
                userProg.pasadizoCompletado = true;
            }

            const totalCompletadas = Object.keys(userProg.actividadesCompletadas).filter(
                k => userProg.actividadesCompletadas[k].completada
            ).length;
            userProg.porcentaje = Math.min(100, Math.round((totalCompletadas / ACTIVIDADES_TOTALES.length) * 100));
            userProg.fechaActualizacion = new Date().toISOString();

            allProgress[user.username] = userProg;
            setLocalStorage(STORAGE_KEY_PROGRESS, allProgress);
            await saveProgressToIDB(userProg);

            window.dispatchEvent(new CustomEvent('reino_progreso_actualizado', {
                detail: {
                    progreso: userProg,
                    puntosGanados: yaEstabaCompletada ? 0 : puntos,
                    actividad: actividadKey
                }
            }));

            return {
                success: true,
                puntosGanados: yaEstabaCompletada ? 0 : puntos,
                puntosTotales: userProg.puntosTotales,
                porcentaje: userProg.porcentaje,
                pasadizoCompletado: userProg.pasadizoCompletado
            };
        },

        estaActividadCompletada(actividadKey) {
            const prog = this.getProgresoActual();
            return !!(prog.actividadesCompletadas && prog.actividadesCompletadas[actividadKey] && prog.actividadesCompletadas[actividadKey].completada);
        },

        // Saber si un poema de la secuencia está completado
        estaPoemaCompletado(poemaId) {
            switch (poemaId) {
                case 'pasadizo':
                    return this.estaActividadCompletada('pasadizo_secreto');
                case 'mona_jacinta':
                    return this.estaActividadCompletada('mona_transferencia') || this.estaActividadCompletada('mona_quiz');
                case 'animales':
                    return this.estaActividadCompletada('animales_escape_room');
                case 'caldero':
                    return this.estaActividadCompletada('caldero_crear_magia');
                case 'osito':
                    return this.estaActividadCompletada('osito_vestir_secuencia');
                case 'viejecita':
                    return this.estaActividadCompletada('viejecita_debate');
                case 'evaluacion':
                    return this.estaActividadCompletada('evaluacion_final');
                default:
                    return false;
            }
        },

        // DESBLOQUEO SECUENCIAL ESTRICTO:
        // Cada poema solo se desbloquea si el ANTERIOR en la secuencia está completado
        estaPoemaDesbloqueado(poemaId) {
            // El pasadizo siempre está desbloqueado
            if (poemaId === 'pasadizo') return true;

            const idx = SECUENCIA_POEMAS.findIndex(p => p.id === poemaId);
            if (idx <= 0) return true;

            const anterior = SECUENCIA_POEMAS[idx - 1];
            return this.estaPoemaCompletado(anterior.id);
        },

        // Obtener el siguiente poema en la ruta pedagógica
        getSiguientePoema(poemaActualId) {
            const idx = SECUENCIA_POEMAS.findIndex(p => p.id === poemaActualId);
            if (idx >= 0 && idx < SECUENCIA_POEMAS.length - 1) {
                return SECUENCIA_POEMAS[idx + 1];
            }
            return null;
        },

        // Obtener el poema anterior requerido
        getPoemaAnterior(poemaActualId) {
            const idx = SECUENCIA_POEMAS.findIndex(p => p.id === poemaActualId);
            if (idx > 0) {
                return SECUENCIA_POEMAS[idx - 1];
            }
            return null;
        }
    };

    ReinoDB.init();
    window.ReinoDB = ReinoDB;

})(window);
