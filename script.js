// Constantes y variables globales
const GAME_TYPES = {
    RANDOM_NUMBER: 'random-number',
    COIN_FLIP: 'coin-flip',
    DECISION_MAKER: 'decision-maker',
    NAME_PICKER: 'name-picker',
    LOTTERY: 'lottery',
    WHEEL: 'wheel'
};

const LOTTERY_TYPES = {
    STANDARD: 'standard',
    POWERBALL: 'powerball',
    EUROMILLIONS: 'euromillions',
    CUSTOM: 'custom'
};

let history = JSON.parse(localStorage.getItem('luckydraw-history')) || [];
let coinFlipCount = { heads: 0, tails: 0 };
let wheel = null;
let wheelSpinning = false;

// Elementos del DOM
const elements = {
    // Navegación
    navLinks: document.querySelectorAll('.nav-link'),
    menuToggle: document.querySelector('.menu-toggle'),
    mainNav: document.querySelector('.main-nav'),
    sections: document.querySelectorAll('.section'),
    
    // Juego: Número aleatorio
    generateNumberBtn: document.getElementById('generate-number'),
    minInput: document.getElementById('min'),
    maxInput: document.getElementById('max'),
    quantityInput: document.getElementById('quantity'),
    randomNumberResult: document.getElementById('randomNumberResult'),
    
    // Juego: Lanzar moneda
    flipCoinBtn: document.getElementById('flip-coin'),
    coin: document.getElementById('coin'),
    coinResult: document.getElementById('coinResult'),
    headsCount: document.getElementById('heads-count'),
    tailsCount: document.getElementById('tails-count'),
    
    // Juego: Tomador de decisiones
    makeDecisionBtn: document.getElementById('make-decision'),
    optionsTextarea: document.getElementById('options'),
    decisionResult: document.getElementById('decisionResult'),
    
    // Juego: Sorteo de nombres
    pickNamesBtn: document.getElementById('pick-names'),
    namesTextarea: document.getElementById('names'),
    winnersInput: document.getElementById('winners'),
    nameResult: document.getElementById('nameResult'),
    
    // Juego: Lotería
    generateLotteryBtn: document.getElementById('generate-lottery'),
    lotteryTypes: document.querySelectorAll('.lottery-type'),
    customOptions: document.querySelector('.custom-options'),
    customNumbers: document.getElementById('custom-numbers'),
    customRange: document.getElementById('custom-range'),
    customSpecial: document.getElementById('custom-special'),
    lotteryResult: document.getElementById('lotteryResult'),
    specialNumbers: document.getElementById('specialNumbers'),
    
    // Juego: Ruleta
    setupWheelBtn: document.getElementById('setup-wheel'),
    spinWheelBtn: document.getElementById('spin-wheel'),
    wheelOptions: document.getElementById('wheel-options'),
    wheelResult: document.getElementById('wheelResult'),
    wheelCanvas: document.getElementById('wheelCanvas'),
    
    // Historial
    historyTabs: document.querySelectorAll('.history-tab'),
    historyItems: document.getElementById('history-items'),
    noHistory: document.getElementById('no-history'),
    clearHistoryBtn: document.getElementById('clear-history'),
    exportHistoryBtn: document.getElementById('export-history'),
    
    // Modal
    modal: document.getElementById('result-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalContent: document.getElementById('modal-content'),
    closeModal: document.querySelector('.close-modal'),
    shareResultBtn: document.getElementById('share-result'),
    saveResultBtn: document.getElementById('save-result'),
    
    // Toast
    toast: document.getElementById('toast'),
    
    // Pestañas de juegos
    gameTabs: document.querySelectorAll('.game-tab'),
    gamePanels: document.querySelectorAll('.game-panel')
};

// Inicialización de la aplicación
function init() {
    // Cargar historial desde localStorage
    loadHistory();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Inicializar ruleta
    initWheel();
    
    // Mostrar la sección activa
    const activeSection = document.querySelector('.section.active-section');
    if (activeSection) {
        activeSection.style.display = 'block';
    }
    
    // Actualizar estadísticas de moneda
    updateCoinStats();
}

// Configurar event listeners
function setupEventListeners() {
    // Navegación
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
            
            // Actualizar clase activa
            elements.navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Cerrar menú en móvil
            if (window.innerWidth <= 768) {
                elements.mainNav.classList.remove('active');
            }
        });
    });
    
    // Menú toggle para móviles
    elements.menuToggle.addEventListener('click', () => {
        elements.mainNav.classList.toggle('active');
    });
    
    // Juego: Número aleatorio
    elements.generateNumberBtn.addEventListener('click', generateRandomNumbers);
    
    // Juego: Lanzar moneda
    elements.flipCoinBtn.addEventListener('click', flipCoin);
    
    // Juego: Tomador de decisiones
    elements.makeDecisionBtn.addEventListener('click', makeDecision);
    
    // Juego: Sorteo de nombres
    elements.pickNamesBtn.addEventListener('click', pickNames);
    
    // Juego: Lotería
    elements.generateLotteryBtn.addEventListener('click', generateLottery);
    elements.lotteryTypes.forEach(type => {
        type.addEventListener('click', () => {
            elements.lotteryTypes.forEach(t => t.classList.remove('active'));
            type.classList.add('active');
            
            // Mostrar opciones personalizadas si es necesario
            if (type.getAttribute('data-type') === LOTTERY_TYPES.CUSTOM) {
                elements.customOptions.style.display = 'block';
            } else {
                elements.customOptions.style.display = 'none';
            }
        });
    });
    
    // Juego: Ruleta
    elements.setupWheelBtn.addEventListener('click', setupWheel);
    elements.spinWheelBtn.addEventListener('click', spinWheel);
    
    // Pestañas de juegos
    elements.gameTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            showGameTab(tabId);
        });
    });
    
    // Historial
    elements.historyTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filter = tab.getAttribute('data-history');
            filterHistory(filter);
        });
    });
    
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    elements.exportHistoryBtn.addEventListener('click', exportHistory);
    
    // Modal
    elements.closeModal.addEventListener('click', closeModal);
    elements.shareResultBtn.addEventListener('click', shareResult);
    elements.saveResultBtn.addEventListener('click', saveResult);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            closeModal();
        }
    });
    
    // CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            showSection('games');
            document.querySelector('.nav-link[data-section="games"]').click();
        });
    }
}

// Mostrar sección
function showSection(sectionId) {
    elements.sections.forEach(section => {
        section.classList.remove('active-section');
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active-section');
        targetSection.style.display = 'block';
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mostrar pestaña de juego
function showGameTab(tabId) {
    elements.gameTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    elements.gamePanels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    document.querySelector(`.game-tab[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Juego: Generar números aleatorios
function generateRandomNumbers() {
    const min = parseInt(elements.minInput.value);
    const max = parseInt(elements.maxInput.value);
    const quantity = parseInt(elements.quantityInput.value);
    
    if (min >= max) {
        showToast('El valor mínimo debe ser menor que el máximo', 'error');
        return;
    }
    
    if (quantity < 1 || quantity > 10) {
        showToast('La cantidad debe estar entre 1 y 10', 'error');
        return;
    }
    
    const numbers = [];
    for (let i = 0; i < quantity; i++) {
        numbers.push(Math.floor(Math.random() * (max - min + 1) + min));
    }
    
    elements.randomNumberResult.innerHTML = numbers.map(num => 
        `<span class="number-bubble">${num}</span>`
    ).join('');
    
    // Guardar en historial
    const result = {
        type: GAME_TYPES.RANDOM_NUMBER,
        date: new Date().toISOString(),
        params: { min, max, quantity },
        result: numbers
    };
    
    addToHistory(result);
    showResultModal('Números Aleatorios Generados', numbers.join(', '));
}

// Juego: Lanzar moneda
function flipCoin() {
    if (elements.coin.classList.contains('flipping')) return;
    
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    elements.coin.classList.add('flipping');
    
    // Actualizar estadísticas
    if (result === 'heads') {
        coinFlipCount.heads++;
    } else {
        coinFlipCount.tails++;
    }
    
    // Mostrar resultado después de la animación
    setTimeout(() => {
        elements.coinResult.textContent = result === 'heads' ? 'CARA' : 'CRUZ';
        elements.coin.classList.remove('flipping');
        
        // Resetear posición de la moneda
        elements.coin.style.transform = `rotateY(${result === 'heads' ? 0 : 180}deg)`;
        
        // Actualizar estadísticas
        updateCoinStats();
        
        // Guardar en historial
        const resultObj = {
            type: GAME_TYPES.COIN_FLIP,
            date: new Date().toISOString(),
            result: result === 'heads' ? 'Cara' : 'Cruz'
        };
        
        addToHistory(resultObj);
        showResultModal('Lanzamiento de Moneda', resultObj.result);
    }, 2000);
}

// Actualizar estadísticas de moneda
function updateCoinStats() {
    elements.headsCount.textContent = coinFlipCount.heads;
    elements.tailsCount.textContent = coinFlipCount.tails;
}

// Juego: Tomador de decisiones
function makeDecision() {
    const optionsText = elements.optionsTextarea.value;
    const options = optionsText.split('\n')
        .map(option => option.trim())
        .filter(option => option !== '');
    
    if (options.length < 2) {
        showToast('Por favor ingresa al menos 2 opciones', 'error');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * options.length);
    const selectedOption = options[randomIndex];
    
    elements.decisionResult.textContent = selectedOption;
    
    // Animación
    elements.decisionResult.classList.add('animate__animated', 'animate__tada');
    setTimeout(() => {
        elements.decisionResult.classList.remove('animate__animated', 'animate__tada');
    }, 1000);
    
    // Guardar en historial
    const result = {
        type: GAME_TYPES.DECISION_MAKER,
        date: new Date().toISOString(),
        params: { options },
        result: selectedOption
    };
    
    addToHistory(result);
    showResultModal('Decisión Tomada', selectedOption);
}

// Juego: Sorteo de nombres
function pickNames() {
    const namesText = elements.namesTextarea.value;
    const names = namesText.split('\n')
        .map(name => name.trim())
        .filter(name => name !== '');
    
    const winnersCount = parseInt(elements.winnersInput.value);
    
    if (names.length < 2) {
        showToast('Por favor ingresa al menos 2 nombres', 'error');
        return;
    }
    
    if (winnersCount < 1 || winnersCount > names.length) {
        showToast(`El número de ganadores debe estar entre 1 y ${names.length}`, 'error');
        return;
    }
    
    // Copiar array para no modificar el original
    const namesCopy = [...names];
    const winners = [];
    
    for (let i = 0; i < winnersCount; i++) {
        if (namesCopy.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * namesCopy.length);
        winners.push(namesCopy[randomIndex]);
        namesCopy.splice(randomIndex, 1);
    }
    
    elements.nameResult.innerHTML = winners.map(winner => 
        `<div class="winner-badge">${winner}</div>`
    ).join('');
    
    // Guardar en historial
    const result = {
        type: GAME_TYPES.NAME_PICKER,
        date: new Date().toISOString(),
        params: { totalNames: names.length, winnersCount },
        result: winners
    };
    
    addToHistory(result);
    showResultModal('Ganadores del Sorteo', winners.join(', '));
}

// Juego: Generar lotería
function generateLottery() {
    const activeType = document.querySelector('.lottery-type.active').getAttribute('data-type');
    let numbersCount = 6;
    let maxNumber = 49;
    let specialNumbersCount = 0;
    
    switch (activeType) {
        case LOTTERY_TYPES.POWERBALL:
            numbersCount = 5;
            maxNumber = 69;
            specialNumbersCount = 1;
            break;
        case LOTTERY_TYPES.EUROMILLIONS:
            numbersCount = 5;
            maxNumber = 50;
            specialNumbersCount = 2;
            break;
        case LOTTERY_TYPES.CUSTOM:
            numbersCount = parseInt(elements.customNumbers.value);
            maxNumber = parseInt(elements.customRange.value);
            specialNumbersCount = parseInt(elements.customSpecial.value);
            break;
    }
    
    if (numbersCount < 1 || numbersCount > maxNumber) {
        showToast(`La cantidad de números debe estar entre 1 y ${maxNumber}`, 'error');
        return;
    }
    
    // Generar números principales
    const mainNumbers = generateUniqueRandomNumbers(numbersCount, 1, maxNumber).sort((a, b) => a - b);
    
    // Generar números especiales si es necesario
    let specialNumbers = [];
    if (specialNumbersCount > 0) {
        const specialMax = activeType === LOTTERY_TYPES.POWERBALL ? 26 : 
                          activeType === LOTTERY_TYPES.EUROMILLIONS ? 12 : maxNumber;
        specialNumbers = generateUniqueRandomNumbers(specialNumbersCount, 1, specialMax).sort((a, b) => a - b);
    }
    
    // Mostrar resultados
    elements.lotteryResult.innerHTML = mainNumbers.map(num => 
        `<div class="lottery-number">${num}</div>`
    ).join('');
    
    if (specialNumbers.length > 0) {
        elements.specialNumbers.style.display = 'flex';
        elements.specialNumbers.innerHTML = specialNumbers.map(num => 
            `<div class="special-number">${num}</div>`
        ).join('');
    } else {
        elements.specialNumbers.style.display = 'none';
    }
    
    // Guardar en historial
    const result = {
        type: GAME_TYPES.LOTTERY,
        date: new Date().toISOString(),
        params: { 
            gameType: activeType,
            numbersCount,
            maxNumber,
            specialNumbersCount 
        },
        result: {
            mainNumbers,
            specialNumbers
        }
    };
    
    addToHistory(result);
    
    let resultText = `Números: ${mainNumbers.join(', ')}`;
    if (specialNumbers.length > 0) {
        resultText += ` | Especiales: ${specialNumbers.join(', ')}`;
    }
    
    showResultModal('Combinación de Lotería', resultText);
}

// Generar números únicos aleatorios
function generateUniqueRandomNumbers(count, min, max) {
    if (count > (max - min + 1)) {
        showToast(`No hay suficientes números únicos entre ${min} y ${max}`, 'error');
        return [];
    }
    
    const numbers = new Set();
    while (numbers.size < count) {
        numbers.add(Math.floor(Math.random() * (max - min + 1) + min));
    }
    
    return Array.from(numbers);
}

// Juego: Ruleta
function initWheel() {
    wheel = new Wheel(elements.wheelCanvas);
    
    // Configuración inicial
    const initialOptions = ['Premio 1', 'Premio 2', 'Premio 3', 'Premio 4', 'Inténtalo de nuevo'];
    wheel.setOptions(initialOptions);
    wheel.draw();
}

function setupWheel() {
    const optionsText = elements.wheelOptions.value;
    const options = optionsText.split('\n')
        .map(option => option.trim())
        .filter(option => option !== '');
    
    if (options.length < 2) {
        showToast('Por favor ingresa al menos 2 opciones', 'error');
        return;
    }
    
    wheel.setOptions(options);
    wheel.draw();
    
    showToast('Ruleta configurada correctamente', 'success');
}

function spinWheel() {
    if (wheelSpinning) return;
    
    wheelSpinning = true;
    elements.spinWheelBtn.disabled = true;
    
    const spinDuration = 3000 + Math.random() * 2000; // 3-5 segundos
    const winnerIndex = wheel.spin(spinDuration);
    
    setTimeout(() => {
        const winner = wheel.options[winnerIndex];
        elements.wheelResult.textContent = winner;
        
        // Guardar en historial
        const result = {
            type: GAME_TYPES.WHEEL,
            date: new Date().toISOString(),
            params: { options: wheel.options },
            result: winner
        };
        
        addToHistory(result);
        showResultModal('Resultado de la Ruleta', winner);
        
        wheelSpinning = false;
        elements.spinWheelBtn.disabled = false;
    }, spinDuration + 500); // Un poco más para que termine la animación
}

// Clase para la ruleta
class Wheel {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = [];
        this.colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
            '#FF9F40', '#8AC24A', '#EA5F89', '#00ACC1', '#FF7043'
        ];
        this.rotation = 0;
        this.spinning = false;
    }
    
    setOptions(options) {
        this.options = options;
    }
    
    draw() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 10;
        
        ctx.clearRect(0, 0, width, height);
        
        if (this.options.length === 0) return;
        
        const segmentAngle = (2 * Math.PI) / this.options.length;
        
        // Dibujar segmentos
        for (let i = 0; i < this.options.length; i++) {
            const startAngle = this.rotation + i * segmentAngle;
            const endAngle = this.rotation + (i + 1) * segmentAngle;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            
            ctx.fillStyle = this.colors[i % this.colors.length];
            ctx.fill();
            
            // Borde del segmento
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Texto
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + segmentAngle / 2);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(this.options[i], radius - 20, 5);
            
            ctx.restore();
        }
        
        // Centro de la ruleta
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        ctx.fillStyle = '#2d3436';
        ctx.fill();
    }
    
    spin(duration) {
        if (this.options.length === 0) return -1;
        
        const spins = 5 + Math.random() * 3; // 5-8 vueltas completas
        const totalRotation = spins * 2 * Math.PI;
        const segmentAngle = (2 * Math.PI) / this.options.length;
        
        // Calcular el índice ganador (aleatorio)
        const winnerIndex = Math.floor(Math.random() * this.options.length);
        // Ajustar la rotación para que el ganador quede en la parte superior
        const targetRotation = totalRotation - (winnerIndex * segmentAngle + segmentAngle / 2);
        
        // Animación
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (easeOutCubic)
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            this.rotation = easedProgress * targetRotation;
            this.draw();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
        return winnerIndex;
    }
}

// Historial
function addToHistory(result) {
    history.unshift(result);
    saveHistory();
    updateHistoryDisplay();
}

function loadHistory() {
    const savedHistory = localStorage.getItem('luckydraw-history');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
}

function saveHistory() {
    localStorage.setItem('luckydraw-history', JSON.stringify(history));
}

function updateHistoryDisplay(filter = 'all') {
    const filteredHistory = filter === 'all' ? history : history.filter(item => {
        if (filter === 'numbers') return item.type === GAME_TYPES.RANDOM_NUMBER;
        if (filter === 'coins') return item.type === GAME_TYPES.COIN_FLIP;
        if (filter === 'decisions') return item.type === GAME_TYPES.DECISION_MAKER;
        if (filter === 'lotteries') return item.type === GAME_TYPES.LOTTERY;
        return true;
    });
    
    if (filteredHistory.length === 0) {
        elements.noHistory.style.display = 'flex';
        elements.historyItems.innerHTML = '';
        return;
    }
    
    elements.noHistory.style.display = 'none';
    elements.historyItems.innerHTML = filteredHistory.map(item => {
        let resultText = '';
        let icon = '';
        
        switch (item.type) {
            case GAME_TYPES.RANDOM_NUMBER:
                icon = '<i class="fas fa-random"></i>';
                resultText = Array.isArray(item.result) ? item.result.join(', ') : item.result;
                break;
            case GAME_TYPES.COIN_FLIP:
                icon = '<i class="fas fa-coins"></i>';
                resultText = item.result;
                break;
            case GAME_TYPES.DECISION_MAKER:
                icon = '<i class="fas fa-question"></i>';
                resultText = item.result;
                break;
            case GAME_TYPES.NAME_PICKER:
                icon = '<i class="fas fa-users"></i>';
                resultText = Array.isArray(item.result) ? item.result.join(', ') : item.result;
                break;
            case GAME_TYPES.LOTTERY:
                icon = '<i class="fas fa-ticket-alt"></i>';
                const main = item.result.mainNumbers.join(', ');
                const special = item.result.specialNumbers.length > 0 ? 
                    ` (${item.result.specialNumbers.join(', ')})` : '';
                resultText = main + special;
                break;
            case GAME_TYPES.WHEEL:
                icon = '<i class="fas fa-compact-disc"></i>';
                resultText = item.result;
                break;
        }
        
        const date = new Date(item.date);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        return `
            <tr>
                <td>${formattedDate}</td>
                <td>${icon} ${getGameName(item.type)}</td>
                <td>${resultText}</td>
                <td>
                    <button class="history-action" data-id="${item.date}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Agregar event listeners a los botones de eliminar
    document.querySelectorAll('.history-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            removeFromHistory(id);
        });
    });
}

function getGameName(type) {
    switch (type) {
        case GAME_TYPES.RANDOM_NUMBER: return 'Número Aleatorio';
        case GAME_TYPES.COIN_FLIP: return 'Lanzar Moneda';
        case GAME_TYPES.DECISION_MAKER: return 'Tomar Decisión';
        case GAME_TYPES.NAME_PICKER: return 'Sorteo de Nombres';
        case GAME_TYPES.LOTTERY: return 'Lotería';
        case GAME_TYPES.WHEEL: return 'Ruleta';
        default: return 'Juego';
    }
}

function filterHistory(filter) {
    elements.historyTabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.history-tab[data-history="${filter}"]`).classList.add('active');
    updateHistoryDisplay(filter);
}

function removeFromHistory(id) {
    history = history.filter(item => item.date !== id);
    saveHistory();
    updateHistoryDisplay(document.querySelector('.history-tab.active').getAttribute('data-history'));
}

function clearHistory() {
    if (confirm('¿Estás seguro de que quieres borrar todo el historial?')) {
        history = [];
        saveHistory();
        updateHistoryDisplay();
    }
}

function exportHistory() {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `luckydraw-historial-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Modal
function showResultModal(title, content) {
    elements.modalTitle.textContent = title;
    elements.modalContent.textContent = content;
    elements.modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function shareResult() {
    const text = `${elements.modalTitle.textContent}: ${elements.modalContent.textContent}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Resultado de LuckyDraw',
            text: text,
            url: window.location.href
        }).catch(err => {
            console.error('Error al compartir:', err);
            copyToClipboard(text);
        });
    } else {
        copyToClipboard(text);
    }
}

function saveResult() {
    const result = {
        title: elements.modalTitle.textContent,
        content: elements.modalContent.textContent,
        date: new Date().toISOString()
    };
    
    // Aquí podrías implementar la lógica para guardar el resultado favorito
    showToast('Resultado guardado en favoritos', 'success');
    closeModal();
}

// Utilidades
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Resultado copiado al portapapeles', 'success');
    }).catch(err => {
        console.error('Error al copiar:', err);
        showToast('No se pudo copiar el resultado', 'error');
    });
}

function showToast(message, type = 'info') {
    const toast = elements.toast;
    toast.textContent = message;
    toast.className = 'toast show';
    
    // Añadir clase de tipo
    toast.classList.add(type);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function closeModal() {
    elements.modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Asegura restaurar el scroll
    document.body.style.position = 'static'; // Agrega esto si es necesario
}

// Al abrir modal
function showResultModal() {
    document.body.classList.add('modal-open');
    // ... resto del código
}

// Al cerrar modal
function closeModal() {
    document.body.classList.remove('modal-open');
    // ... resto del código
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);