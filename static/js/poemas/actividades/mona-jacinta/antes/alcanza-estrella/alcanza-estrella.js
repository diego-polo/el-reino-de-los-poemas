// ==========================================
// ⭐ JUEGO DE LAS ESTRELLAS (FLIP CARDS)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const estrellas = document.querySelectorAll('.estrella');
    const botonReiniciar = document.getElementById('reiniciar');
    const nextGameBtn = document.querySelector('.next-game');
    let estrellasGiradas = new Set();

    function verificarEstadoInicial() {
        if (!nextGameBtn) return;
        const yaCompletado = window.ReinoDB && window.ReinoDB.estaActividadCompletada('mona_alcanza_estrella');
        if (yaCompletado) {
            desbloquearBotonSiguiente();
        } else {
            bloquearBotonSiguiente();
        }
    }

    function bloquearBotonSiguiente() {
        if (!nextGameBtn) return;
        nextGameBtn.style.opacity = '0.55';
        nextGameBtn.style.pointerEvents = 'none';
        nextGameBtn.style.background = '#9e9e9e';
        nextGameBtn.style.color = '#fff';
        nextGameBtn.style.cursor = 'not-allowed';
        nextGameBtn.textContent = '🔒 Voltea las 6 estrellas para desbloquear';
    }

    function desbloquearBotonSiguiente() {
        if (!nextGameBtn) return;
        nextGameBtn.style.opacity = '1';
        nextGameBtn.style.pointerEvents = 'auto';
        nextGameBtn.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
        nextGameBtn.style.color = '#ffffff';
        nextGameBtn.style.cursor = 'pointer';
        nextGameBtn.style.boxShadow = '0 6px 18px rgba(46, 125, 50, 0.4)';
        nextGameBtn.textContent = '🎉 ¡Siguiente juego: Rimas! ➔';
        if (window.GameJuice) {
            window.GameJuice.bounceElement(nextGameBtn);
        }
    }

    // Voltear cada estrella al hacer clic
    estrellas.forEach((estrella, index) => {
        estrella.addEventListener('click', () => {
            estrella.classList.toggle('girada');

            if (window.GameJuice) {
                window.GameJuice.playPop();
            }

            if (estrella.classList.contains('girada')) {
                estrellasGiradas.add(index);
                // Si el niño descubrió las 6 preguntas, premiar con 20 puntos
                if (estrellasGiradas.size === estrellas.length) {
                    if (window.ReinoDB) {
                        window.ReinoDB.registrarPuntos('mona_alcanza_estrella', 20);
                    }
                    if (window.GameJuice) {
                        window.GameJuice.celebrate(60);
                        window.GameJuice.playFanfare();
                    }
                    desbloquearBotonSiguiente();
                }
            }
        });
    });

    // Reiniciar todas las estrellas
    if (botonReiniciar) {
        botonReiniciar.addEventListener('click', () => {
            estrellas.forEach((estrella) => {
                estrella.classList.remove('girada');
            });
            estrellasGiradas.clear();
        });
    }

    verificarEstadoInicial();
});
