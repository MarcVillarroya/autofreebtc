// Estado del juego
let balance = 0.00001000; // 100,000 satoshis iniciales
let currentBet = 0.00000001;
let currentOdds = 2.00;
let animationsDisabled = false;

// Estadísticas
let totalBets = 0;
let totalWins = 0;
let totalLosses = 0;
let netProfit = 0;
let currentLevel = 1;
let maxLevelReached = 1;
let consecutiveLosses = 0;
let maxBetThisSession = 0.00000001;
let totalInvestedInLosses = 0;

// Secuencia Fibonacci (en satoshis)
const FIBONACCI_SEQUENCE = [
  1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 
  1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 
  121393, 195729, 317122, 512851, 829973, 1342824
];

// Datos de probabilidad para la tabla
const PROBABILITY_DATA = [
  68.33, 46.69, 31.90, 21.80, 14.90, 10.18, 6.95, 4.75, 3.25, 2.22,
  1.52, 1.04, 0.71, 0.48, 0.33, 0.23, 0.15, 0.11, 0.07, 0.05,
  0.03, 0.0229, 0.0157, 0.0107, 0.0073, 0.0050, 0.0034, 0.0023, 0.0016, 0.0011
];

// Inicializar el juego
window.addEventListener('DOMContentLoaded', () => {
    updateBalance();
    updateWinProfit();
    updateWinChance();
    updateThresholds();
    updateStats();
    initializeFibonacciTable();
    attachEventListeners();
});

function attachEventListeners() {
    // Botones de apuesta
    document.getElementById('bet_hi_button').addEventListener('click', () => placeBet('HI'));
    document.getElementById('bet_lo_button').addEventListener('click', () => placeBet('LO'));
    
    // Input de monto
    document.getElementById('double_your_btc_stake').addEventListener('input', (e) => {
        currentBet = parseFloat(e.target.value) || 0.00000001;
        currentLevel = calculateLevelFromBet(currentBet);
        updateWinProfit();
        updateStats();
    });
    
    // Input de odds
    document.getElementById('double_your_btc_payout_multiplier').addEventListener('input', (e) => {
        currentOdds = parseFloat(e.target.value) || 2.00;
        updateWinProfit();
        updateWinChance();
        updateThresholds();
    });
    
    // Checkbox de animaciones
    document.getElementById('disable_animation_checkbox').addEventListener('change', (e) => {
        animationsDisabled = e.target.checked;
    });
}

function updateBalance() {
    document.getElementById('balance').textContent = balance.toFixed(8);
}

function updateWinProfit() {
    const winProfit = currentBet * (currentOdds - 1);
    document.getElementById('win_profit').textContent = winProfit.toFixed(8);
}

function updateWinChance() {
    // Fórmula correcta: (95 / odds) %
    // 2.00x = 47.50%, 3.00x = 31.67%
    const winChance = (95 / currentOdds).toFixed(2);
    document.getElementById('win_chance').textContent = `${winChance}%`;
}

function updateThresholds() {
    // Calcular umbrales basados en win chance
    // Fórmula correcta: 95 / odds
    const winChance = 95 / currentOdds;
    const hiThreshold = Math.floor((100 - winChance) * 100);
    const loThreshold = Math.floor(winChance * 100);
    
    document.getElementById('hi_threshold').textContent = hiThreshold;
    document.getElementById('lo_threshold').textContent = loThreshold;
}

function multiplyBet(multiplier) {
    currentBet = parseFloat((currentBet * multiplier).toFixed(8));
    document.getElementById('double_your_btc_stake').value = currentBet.toFixed(8);
    updateWinProfit();
}

function setBetToMin() {
    currentBet = 0.00000001;
    document.getElementById('double_your_btc_stake').value = currentBet.toFixed(8);
    updateWinProfit();
}

function setBetToMax() {
    currentBet = balance;
    document.getElementById('double_your_btc_stake').value = currentBet.toFixed(8);
    updateWinProfit();
}

async function placeBet(type) {
    const betHiBtn = document.getElementById('bet_hi_button');
    const betLoBtn = document.getElementById('bet_lo_button');
    
    try {
        // Validar balance
        if (currentBet > balance) {
            alert('⚠️ Saldo insuficiente!');
            return;
        }
        
        // Deshabilitar botones
        betHiBtn.disabled = true;
        betLoBtn.disabled = true;
        
        // Ocultar mensajes anteriores
        document.getElementById('double_your_btc_bet_win').style.display = 'none';
        document.getElementById('double_your_btc_bet_lose').style.display = 'none';
        
        // Generar número aleatorio (0-9999)
        const rollNumber = Math.floor(Math.random() * 10000);
        
        // Animar el contador
        if (!animationsDisabled) {
            await animateRoll(rollNumber);
        } else {
            document.getElementById('roll_number').textContent = rollNumber.toString().padStart(4, '0');
        }
        
        // Calcular si ganó
        // Fórmula correcta: 95 / odds para win chance
        const winChance = 95 / currentOdds;
        const hiThreshold = (100 - winChance) * 100;
        const loThreshold = winChance * 100;
        
        let won = false;
        if (type === 'HI' && rollNumber > hiThreshold) {
            won = true;
        } else if (type === 'LO' && rollNumber < loThreshold) {
            won = true;
        }
        
        // Actualizar estadísticas
        totalBets++;
        
        if (won) {
            const winAmount = currentBet * (currentOdds - 1);
            balance += winAmount;
            netProfit += winAmount;
            totalWins++;
            
            // Actualizar apuesta máxima si es necesario
            if (currentBet > maxBetThisSession) {
                maxBetThisSession = currentBet;
            }
            
            // Resetear nivel y pérdidas consecutivas
            currentLevel = 1;
            consecutiveLosses = 0;
            totalInvestedInLosses = 0; // Resetear inversión al ganar
            
            // Mostrar mensaje de victoria
            const winMessage = document.getElementById('double_your_btc_bet_win');
            document.getElementById('win_amount_text').textContent = 
                `You won ${winAmount.toFixed(8)} BTC!`;
            winMessage.style.display = 'block';
            
            // Ocultar después de 2 segundos
            setTimeout(() => {
                winMessage.style.display = 'none';
            }, 500);
            
        } else {
            balance -= currentBet;
            netProfit -= currentBet;
            totalLosses++;
            consecutiveLosses++;
            
            // Actualizar apuesta máxima si es necesario
            if (currentBet > maxBetThisSession) {
                maxBetThisSession = currentBet;
            }
            
            // Acumular total invertido en pérdidas
            totalInvestedInLosses += currentBet;
            
            // Avanzar nivel en Fibonacci
            if (currentLevel < FIBONACCI_SEQUENCE.length) {
                currentLevel++;
            }
            
            // Actualizar nivel máximo alcanzado
            if (currentLevel > maxLevelReached) {
                maxLevelReached = currentLevel;
            }
            
            // Mostrar mensaje de pérdida
            const loseMessage = document.getElementById('double_your_btc_bet_lose');
            document.getElementById('lose_amount_text').textContent = 
                `You lost ${currentBet.toFixed(8)} BTC`;
            loseMessage.style.display = 'block';
            
            // Ocultar después de 2 segundos
            setTimeout(() => {
                loseMessage.style.display = 'none';
            }, 500);
        }
        
        // Actualizar UI
        updateBalance();
        updateStats();
        
    } catch (error) {
        console.error('Error en placeBet:', error);
    } finally {
        // Siempre habilitar botones, incluso si hay error
        betHiBtn.disabled = false;
        betLoBtn.disabled = false;
    }
}

async function animateRoll(finalNumber) {
    const counter = document.getElementById('roll_number');
    const duration = 1000; // 1 segundo
    const steps = 20;
    const stepDuration = duration / steps;
    
    for (let i = 0; i < steps; i++) {
        const randomNum = Math.floor(Math.random() * 10000);
        counter.textContent = randomNum.toString().padStart(4, '0');
        await sleep(stepDuration);
    }
    
    // Mostrar número final
    counter.textContent = finalNumber.toString().padStart(4, '0');
}

function updateStats() {
    document.getElementById('stat_total_bets').textContent = totalBets;
    document.getElementById('stat_wins').textContent = totalWins;
    document.getElementById('stat_losses').textContent = totalLosses;
    
    const profitElement = document.getElementById('stat_profit');
    profitElement.textContent = `${netProfit >= 0 ? '+' : ''}${netProfit.toFixed(8)}`;
    profitElement.style.color = netProfit >= 0 ? '#4ade80' : '#f87171';
    
    // Nivel actual
    document.getElementById('stat_current_level').textContent = `L${currentLevel}`;
    
    // Nivel máximo alcanzado
    const maxLevelElement = document.getElementById('stat_max_level');
    maxLevelElement.textContent = `L${maxLevelReached}`;
    // Cambiar color según el nivel
    if (maxLevelReached > 15) {
        maxLevelElement.style.color = '#ef4444'; // Rojo
    } else if (maxLevelReached > 10) {
        maxLevelElement.style.color = '#f59e0b'; // Naranja
    } else {
        maxLevelElement.style.color = '#fbbf24'; // Amarillo
    }
    
    // Pérdidas consecutivas
    document.getElementById('stat_consecutive_losses').textContent = consecutiveLosses;
    
    // Nivel recomendado basado en balance
    const recommendedLevel = calculateRecommendedLevel(balance);
    const recommendedElement = document.getElementById('stat_recommended_level');
    recommendedElement.textContent = `L${recommendedLevel}`;
    
    // Advertencia si el nivel actual es peligroso
    if (currentLevel > recommendedLevel) {
        recommendedElement.style.color = '#ef4444';
        recommendedElement.textContent = `L${recommendedLevel} ⚠️`;
    } else {
        recommendedElement.style.color = '#10b981';
    }
    
    // Apuesta máxima de esta sesión
    document.getElementById('stat_max_bet').textContent = `${maxBetThisSession.toFixed(8)}`;
    
    // Total invertido en pérdidas
    document.getElementById('stat_total_invested').textContent = `${totalInvestedInLosses.toFixed(8)}`;
    
    // Actualizar la tabla Fibonacci
    updateFibonacciTable();
}

function calculateRecommendedLevel(currentBalance) {
    // Calcular qué nivel máximo puede soportar el balance actual
    // Sumando la secuencia Fibonacci hasta que exceda el balance
    const balanceSats = Math.floor(currentBalance * 100000000);
    let totalNeeded = 0;
    let level = 0;
    
    for (let i = 0; i < FIBONACCI_SEQUENCE.length; i++) {
        totalNeeded += FIBONACCI_SEQUENCE[i];
        if (totalNeeded > balanceSats) {
            break;
        }
        level = i + 1;
    }
    
    return Math.max(1, level);
}

function calculateLevelFromBet(betAmount) {
    // Determina en qué nivel de Fibonacci está una apuesta
    const betSats = Math.round(betAmount * 100000000);
    
    for (let i = 0; i < FIBONACCI_SEQUENCE.length; i++) {
        if (FIBONACCI_SEQUENCE[i] === betSats) {
            return i + 1;
        }
    }
    
    return 1; // Por defecto
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function initializeFibonacciTable() {
    const tbody = document.getElementById('fibonacci_table_body');
    if (!tbody) {
        console.error('fibonacci_table_body no encontrado');
        return;
    }
    tbody.innerHTML = '';
    
    console.log('Inicializando tabla Fibonacci con 22 niveles');
    
    for (let i = 0; i < 22; i++) { // Mostrar hasta L22 (óptimo)
        const level = i + 1;
        const betSats = FIBONACCI_SEQUENCE[i];
        const totalCapital = calculateTotalCapitalForLevel(level);
        const probability = PROBABILITY_DATA[i];
        
        const row = document.createElement('tr');
        row.id = `fib_row_${level}`;
        row.innerHTML = `
            <td><strong>L${level}</strong></td>
            <td>${betSats}</td>
            <td>${totalCapital}</td>
            <td>${probability.toFixed(2)}%</td>
            <td><span class="status-badge" id="status_${level}">-</span></td>
        `;
        
        // Marcar L22 como óptimo
        if (level === 22) {
            row.classList.add('optimal-level');
        }
        
        tbody.appendChild(row);
    }
    
    console.log(`Tabla Fibonacci inicializada con ${tbody.children.length} filas`);
    
    // Actualizar la tabla después de inicializarla
    updateFibonacciTable();
}

function calculateTotalCapitalForLevel(level) {
    let total = 0;
    for (let i = 0; i < level; i++) {
        total += FIBONACCI_SEQUENCE[i];
    }
    return total; // Retornar en satoshis
}

function updateFibonacciTable() {
    // Limpiar todas las clases y estados
    for (let i = 1; i <= 22; i++) {
        const row = document.getElementById(`fib_row_${i}`);
        const statusBadge = document.getElementById(`status_${i}`);
        
        if (row && statusBadge) {
            row.classList.remove('current-level', 'max-level-reached', 'danger-level');
            statusBadge.className = 'status-badge';
            statusBadge.textContent = '-';
            
            // Marcar nivel actual
            if (i === currentLevel) {
                row.classList.add('current-level');
                statusBadge.classList.add('current');
                statusBadge.textContent = '▶ NOW';
            }
            // Marcar nivel máximo alcanzado
            else if (i === maxLevelReached && i !== currentLevel) {
                row.classList.add('max-level-reached');
                statusBadge.classList.add('passed');
                statusBadge.textContent = '✓ MAX';
            }
            // Marcar niveles peligrosos
            else if (i > calculateRecommendedLevel(balance)) {
                row.classList.add('danger-level');
                statusBadge.classList.add('danger');
                statusBadge.textContent = '⚠️';
            }
            // Marcar niveles ya pasados
            else if (i < currentLevel) {
                statusBadge.textContent = '✓';
            }
        }
    }
    
    // Auto-scroll a la fila actual si está visible
    const currentRow = document.getElementById(`fib_row_${currentLevel}`);
    if (currentRow) {
        currentRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Atajos de teclado (opcional)
document.addEventListener('keydown', (e) => {
    // Solo activar si no estamos en un input
    if (e.target.tagName === 'INPUT') return;
    
    if (e.key === 'ArrowUp' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        document.getElementById('bet_hi_button').click();
    } else if (e.key === 'ArrowDown' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        document.getElementById('bet_lo_button').click();
    }
});
