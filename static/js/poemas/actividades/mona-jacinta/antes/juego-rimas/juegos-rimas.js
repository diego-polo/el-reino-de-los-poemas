// ==========================================
// 🎵 JUEGO DE RIMAS - LÓGICA PRINCIPAL
// ==========================================

const questions = [
    { word: "GATO", options: ["PATO", "MESA", "LUNA"], answer: "PATO", hint: "🐾 Es otro animal que hace 'cuac'." },
    { word: "CASA", options: ["TASA", "PERRO", "SOL"], answer: "TASA", hint: "☕ Es algo que puede tener café." },
    { word: "RATÓN", options: ["CAMIÓN", "PELOTA", "ÁRBOL"], answer: "CAMIÓN", hint: "🚚 Es un vehículo grande." },
    { word: "LUNA", options: ["CUNA", "GATO", "PAN"], answer: "CUNA", hint: "👶 Allí puede dormir un bebé." },
    { word: "PELOTA", options: ["BOTA", "MESA", "SOL"], answer: "BOTA", hint: "👢 Es algo que usamos en los pies." },
    { word: "CAMIÓN", options: ["RATÓN", "CASA", "FLOR"], answer: "RATÓN", hint: "🐭 Es un animal pequeño." },
    { word: "SOL", options: ["CARACOL", "MESA", "GATO"], answer: "CARACOL", hint: "🐌 Es un animal que lleva su casa." },
    { word: "FLOR", options: ["AMOR", "LUNA", "PERRO"], answer: "AMOR", hint: "❤️ Es un sentimiento hermoso." },
    { word: "RANA", options: ["VENTANA", "SOL", "PAN"], answer: "VENTANA", hint: "🪟 Puedes mirar por ella." },
    { word: "CINTURÓN", options: ["TIBURÓN", "AVIÓN", "MESA"], answer: "TIBURÓN", hint: "🦈 Gran animal acuático." }
];

let currentQuestion = 0;
let score = 0;
let lives = 3;
let hintUsed = false;

// Elementos HTML
const mainWord = document.getElementById("mainWord");
const optionsContainer = document.getElementById("options");
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const roundElement = document.getElementById("round");
const progressElement = document.getElementById("progress");
const messageElement = document.getElementById("message");
const feedbackElement = document.getElementById("feedback");
const mascotElement = document.getElementById("mascot");
const hintButton = document.getElementById("hintButton");
const gameOverScreen = document.getElementById("gameOver");
const finalScoreElement = document.getElementById("finalScore");
const finalMessageElement = document.getElementById("finalMessage");
const restartButton = document.getElementById("restartButton");
const nextPoemaBtn = document.querySelector(".next-poema");

// COMPROBACIÓN DE SECUENCIA ESTRICTA
function verificarSecuenciaObligatoria() {
    if (!window.ReinoDB) return true;

    const estrellasCompletado = window.ReinoDB.estaActividadCompletada('mona_alcanza_estrella');
    if (!estrellasCompletado) {
        mostrarModalBloqueoEstrellas();
        return false;
    }

    const rimasCompletado = window.ReinoDB.estaActividadCompletada('mona_juego_rimas');
    if (rimasCompletado) {
        desbloquearBotonSiguienteNivel();
    } else {
        bloquearBotonSiguienteNivel();
    }
    return true;
}

function bloquearBotonSiguienteNivel() {
    if (!nextPoemaBtn) return;
    nextPoemaBtn.style.opacity = '0.55';
    nextPoemaBtn.style.pointerEvents = 'none';
    nextPoemaBtn.style.background = '#9e9e9e';
    nextPoemaBtn.style.color = '#fff';
    nextPoemaBtn.style.cursor = 'not-allowed';
    nextPoemaBtn.textContent = '🔒 Supera el juego para avanzar';
}

function desbloquearBotonSiguienteNivel() {
    if (!nextPoemaBtn) return;
    nextPoemaBtn.style.opacity = '1';
    nextPoemaBtn.style.pointerEvents = 'auto';
    nextPoemaBtn.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
    nextPoemaBtn.style.color = '#ffffff';
    nextPoemaBtn.style.cursor = 'pointer';
    nextPoemaBtn.style.boxShadow = '0 6px 18px rgba(46, 125, 50, 0.4)';
    nextPoemaBtn.textContent = '🎉 ¡Pasa al siguiente nivel! ➔';
}

function mostrarModalBloqueoEstrellas() {
    const modal = document.createElement('div');
    modal.className = 'reino-modal-overlay';
    modal.style.zIndex = '999999';
    modal.innerHTML = `
        <div class="reino-modal-card" style="text-align: center; max-width: 450px;">
            <div style="font-size: 60px; margin-bottom: 10px;">⭐🔒</div>
            <h2 style="color: #4a148c; margin-bottom: 12px;">¡Nivel 2 Bloqueado!</h2>
            <p style="color: #555; line-height: 1.5; margin-bottom: 25px;">
                Para entrar al <strong>Juego de Rimas</strong>, primero debes voltear las 6 estrellas en <strong>Alcanza una estrella</strong>.
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <a href="/template/planeaciones/planeacion-la-mona/actividades/actividades-antes/alcanza-estrella.html" class="reino-btn-submit" style="text-decoration: none; text-align: center;">
                    ⭐ Ir a Alcanza una estrella
                </a>
                <a href="/template/planeaciones/planeacion-la-mona/antes.html" style="color: #7b1fa2; font-weight: bold; text-decoration: none; padding: 10px;">
                    ⬅ Volver al menú
                </a>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function startGame() {
    currentQuestion = 0;
    score = 0;
    lives = 3;
    hintUsed = false;
    gameOverScreen.classList.add("hidden");
    updateStats();
    showQuestion();
}

function showQuestion() {
    if (currentQuestion >= questions.length) {
        endGame();
        return;
    }

    const question = questions[currentQuestion];
    mainWord.textContent = question.word;
    feedbackElement.textContent = "";
    feedbackElement.className = "feedback";
    messageElement.textContent = "¡Piensa muy bien! ¿Cuál palabra rima?";
    mascotElement.textContent = "🐸";

    roundElement.textContent = currentQuestion + 1;
    progressElement.style.width = `${((currentQuestion) / questions.length) * 100}%`;

    optionsContainer.innerHTML = "";
    question.options.forEach(option => {
        const button = document.createElement("button");
        button.textContent = option;
        button.classList.add("option", "option-btn");
        button.addEventListener("click", () => selectOption(option, question.answer, button));
        optionsContainer.appendChild(button);
    });

    if (hintButton) {
        hintButton.disabled = false;
        hintButton.style.opacity = "1";
    }
}

function selectOption(selected, correct, buttonElement) {
    const buttons = document.querySelectorAll(".option, .option-btn");
    buttons.forEach(btn => btn.disabled = true);

    if (selected === correct) {
        score += 10;
        feedbackElement.textContent = "🌟 ¡Correcto! ¡Qué gran oído poético!";
        feedbackElement.className = "feedback correct success";
        messageElement.textContent = "¡Excelente! Esa rima suena genial.";
        mascotElement.textContent = "🎉";
        buttonElement.classList.add("correct");

        if (window.GameJuice) {
            window.GameJuice.bounceElement(buttonElement);
            window.GameJuice.floatingXP(10, buttonElement);
        }
    } else {
        lives--;
        feedbackElement.textContent = `❌ ¡Casi! La palabra que rima era "${correct}".`;
        feedbackElement.className = "feedback wrong incorrect error";
        messageElement.textContent = "No te preocupes, ¡vamos a la siguiente!";
        mascotElement.textContent = "😢";
        buttonElement.classList.add("wrong", "incorrect");

        if (window.GameJuice) {
            window.GameJuice.shakeElement(buttonElement);
        }
    }

    updateStats();

    if (lives <= 0) {
        setTimeout(endGame, 1300);
    } else {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            setTimeout(showQuestion, 1300);
        } else {
            setTimeout(endGame, 1300);
        }
    }
}

if (hintButton) {
    hintButton.addEventListener("click", () => {
        const question = questions[currentQuestion];
        hintUsed = true;
        messageElement.textContent = question.hint;
        mascotElement.textContent = "💡";
        hintButton.disabled = true;
        hintButton.style.opacity = "0.5";
    });
}

function updateStats() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
}

function endGame() {
    gameOverScreen.classList.remove("hidden");
    finalScoreElement.textContent = score;

    // Guardar puntos en la base de datos
    if (window.ReinoDB && score > 0) {
        window.ReinoDB.registrarPuntos('mona_juego_rimas', score);
        desbloquearBotonSiguienteNivel();
    }

    if (score >= 90) {
        finalMessageElement.textContent = "🌟 ¡Increíble! Eres un verdadero campeón de las rimas.";
    } else if (score >= 60) {
        finalMessageElement.textContent = "🎉 ¡Muy bien! Tienes un gran talento para las rimas.";
    } else if (score >= 30) {
        finalMessageElement.textContent = "👏 ¡Buen trabajo! Sigue practicando y mejorarás muchísimo.";
    } else {
        finalMessageElement.textContent = "💪 ¡No te rindas! Practica un poco más y volverás más fuerte.";
    }
}

if (restartButton) {
    restartButton.addEventListener("click", startGame);
}

// Inicializar el juego tras verificar prerrequisitos
document.addEventListener('DOMContentLoaded', () => {
    if (verificarSecuenciaObligatoria()) {
        startGame();
    }
});