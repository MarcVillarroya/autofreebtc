const { test } = require('@playwright/test');

const SIMULATOR_URL = 'http://localhost:3000'; // Cambiar según tu servidor local
const BASE_BET = '0.00000001'; // 1 satoshi
const BET_ODDS = '3.00';
const MAX_LEVEL = 22; // L22 según estrategia
const TARGET_PROFIT = 0.00000300; // 300 satoshis de ganancia objetivo

// Secuencia Fibonacci precalculada hasta L30 (en satoshis)
const FIBONACCI_SEQUENCE = [
  1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 
  1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 
  121393, 195729, 317122, 512851, 829973, 1342824
];

// Convierte satoshis a BTC string con 8 decimales
function satoshisToBTC(satoshis) {
  return (satoshis / 100000000).toFixed(8);
}

// Obtiene la apuesta para un nivel específico
function getBetAmount(level) {
  if (level < 1 || level > FIBONACCI_SEQUENCE.length) {
    throw new Error(`Nivel ${level} fuera de rango`);
  }
  return satoshisToBTC(FIBONACCI_SEQUENCE[level - 1]);
}

// Calcula el capital total necesario hasta un nivel
function getTotalCapitalNeeded(level) {
  let total = 0;
  for (let i = 0; i < level; i++) {
    total += FIBONACCI_SEQUENCE[i];
  }
  return satoshisToBTC(total);
}

test('Simulator - FIBONACCI STRATEGY TEST', async ({ page }) => {
  
  // ========== NAVEGACIÓN AL SIMULADOR ==========
  try {
    await page.goto(SIMULATOR_URL, { waitUntil: 'networkidle' });
  } catch (error) {
    console.error('❌ Error: No se pudo cargar el simulador.');
    console.error('💡 Asegúrate de que el servidor está corriendo en http://localhost:3000');
    console.error('💡 Ejecuta: npm run simulator');
    throw error;
  }
  console.log('✅ Simulador cargado');
  
  // Escuchar errores de consola
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('🔴 Error en consola:', msg.text());
    }
  });
  
  // Escuchar errores de página
  page.on('pageerror', err => {
    console.error('🔴 Error en página:', err.message);
  });
  
  // ========== OBTENER BALANCE INICIAL ==========
  await page.waitForSelector('#balance', { state: 'visible' });
  const initialBalanceText = await page.locator('#balance').innerText();
  const initialBalance = parseFloat(initialBalanceText);
  console.log(`\n💼 Balance inicial: ${initialBalance.toFixed(8)} BTC`);
  console.log(`🎯 Objetivo de ganancia: ${TARGET_PROFIT.toFixed(8)} BTC (${(TARGET_PROFIT * 100000000)} sats)`);
  console.log(`🛑 Stop loss: Nivel L${MAX_LEVEL} (${getBetAmount(MAX_LEVEL)} BTC)\n`);

  // Configurar odds
  await page.locator('#double_your_btc_payout_multiplier').fill(BET_ODDS);
  await page.waitForTimeout(50);

  // Deshabilitar animaciones para mayor velocidad
  const isChecked = await page.locator('#disable_animation_checkbox').isChecked();
  if (!isChecked) {
    await page.locator('#disable_animation_checkbox').check();
  }

  // ========== ESTRATEGIA FIBONACCI ==========
  let currentLevel = 1;
  let consecutiveLosses = 0;
  let totalProfit = 0;
  let betCount = 0;
  let resetCount = 0; // Contador de veces que se alcanza L22
  let sessionActive = true;

  console.log('═'.repeat(80));
  console.log('🎲 INICIANDO ESTRATEGIA FIBONACCI (SIMULADOR)');
  console.log('═'.repeat(80));

  while (sessionActive) {
    betCount++;
    
    // Obtener apuesta según nivel actual
    const currentBet = getBetAmount(currentLevel);
    
    console.log(`\n📊 Apuesta #${betCount} | Nivel: L${currentLevel} | Pérdidas consecutivas: ${consecutiveLosses}`);
    console.log(`💰 Monto: ${currentBet} BTC (${FIBONACCI_SEQUENCE[currentLevel - 1]} sats)`);
    
    // Configurar monto de apuesta
    await page.locator('#double_your_btc_stake').fill(currentBet);
    await page.waitForTimeout(50);

    // Verificar que el balance es suficiente
    const currentBalanceText = await page.locator('#balance').innerText();
    const currentBalance = parseFloat(currentBalanceText);
    
    if (currentBalance < parseFloat(currentBet)) {
      console.log('\n' + '═'.repeat(80));
      console.log(`🛑 SALDO INSUFICIENTE: ${currentBalance.toFixed(8)} BTC`);
      console.log(`💰 Necesario: ${currentBet} BTC`);
      console.log('═'.repeat(80));
      sessionActive = false;
      break;
    }
    
    // Elegir HI o LO aleatoriamente
    const betType = Math.random() < 0.5 ? 'bet_hi_button' : 'bet_lo_button';
    const betTypeName = betType === 'bet_hi_button' ? 'BET HI' : 'BET LO';
    console.log(`🎯 Tipo: ${betTypeName}`);
    
    // Verificar que el botón existe y está habilitado
    await page.waitForSelector(`#${betType}`, { state: 'visible' });
    const isEnabled = await page.locator(`#${betType}`).isEnabled();
    if (!isEnabled) {
      console.error('⚠️  Botón deshabilitado, esperando...');
      await page.waitForTimeout(1000);
    }
    
    // Realizar apuesta
    await page.locator(`#${betType}`).click();
    await page.waitForTimeout(200); // Esperar animación y resultado
    
    // Obtener resultado
    await page.waitForSelector('#roll_number', { state: 'visible' });
    const result = await page.locator('#roll_number').innerText();
    
    // Verificar si ganó o perdió
    const isWinVisible = await page.locator('#double_your_btc_bet_win').isVisible().catch(() => false);
    const isLoseVisible = await page.locator('#double_your_btc_bet_lose').isVisible().catch(() => false);
    
    if (isWinVisible) {
      // ===== GANÓ =====
      const winAmount = parseFloat(currentBet) * (parseFloat(BET_ODDS) - 1);
      totalProfit += winAmount;
      
      console.log(`✅ ¡GANASTE! Número: ${result}`);
      console.log(`💵 Ganancia: +${winAmount.toFixed(8)} BTC (+${(winAmount * 100000000).toFixed(0)} sats)`);
      console.log(`📈 Profit total: ${totalProfit > 0 ? '+' : ''}${totalProfit.toFixed(8)} BTC (${(totalProfit * 100000000).toFixed(0)} sats)`);
      
      // Resetear progresión
      currentLevel = 1;
      consecutiveLosses = 0;
      
      // Verificar take profit
      if (totalProfit >= TARGET_PROFIT) {
        console.log('\n' + '═'.repeat(80));
        console.log(`🎉 ¡OBJETIVO ALCANZADO! Ganancia: ${totalProfit.toFixed(8)} BTC`);
        console.log('═'.repeat(80));
        sessionActive = false;
      }
      
    } else if (isLoseVisible) {
      // ===== PERDIÓ =====
      const lossAmount = parseFloat(currentBet);
      totalProfit -= lossAmount;
      consecutiveLosses++;
      
      console.log(`❌ Perdiste. Número: ${result}`);
      console.log(`💸 Pérdida: -${lossAmount.toFixed(8)} BTC (-${(lossAmount * 100000000).toFixed(0)} sats)`);
      console.log(`📉 Profit total: ${totalProfit > 0 ? '+' : ''}${totalProfit.toFixed(8)} BTC (${(totalProfit * 100000000).toFixed(0)} sats)`);
      
      // Verificar si alcanzó el nivel máximo
      if (currentLevel >= MAX_LEVEL) {
        resetCount++;
        console.log('\n' + '⚠️'.repeat(40));
        console.log(`🔄 LÍMITE ALCANZADO: Nivel máximo L${MAX_LEVEL} alcanzado (Reset #${resetCount})`);
        console.log(`📊 Pérdidas consecutivas: ${consecutiveLosses}`);
        console.log(`🔁 RESET: Volviendo a nivel L1 con apuesta base`);
        console.log(`💔 Pérdida acumulada en esta racha: -${(FIBONACCI_SEQUENCE.slice(0, MAX_LEVEL).reduce((a, b) => a + b, 0) / 100000000).toFixed(8)} BTC`);
        console.log('⚠️'.repeat(40) + '\n');
        
        // RESETEAR a nivel 1 en lugar de detener
        currentLevel = 1;
        consecutiveLosses = 0;
        
        // Continuar jugando (no detener la sesión)
      } else {
        // Avanzar al siguiente nivel Fibonacci
        currentLevel++;
        console.log(`⬆️  Subiendo a nivel L${currentLevel}`);
      }
      
    } else {
      console.log('⚠️  No se pudo determinar el resultado');
      // Esperar un poco más y reintentar verificación
      await page.waitForTimeout(500);
    }
    
    // Pequeña pausa entre apuestas
    await page.waitForTimeout(500);
  }

  // ========== RESUMEN FINAL ==========
  const finalBalanceText = await page.locator('#balance').innerText();
  const finalBalance = parseFloat(finalBalanceText);
  const realProfit = finalBalance - initialBalance;
  
  console.log('\n' + '═'.repeat(80));
  console.log('📊 RESUMEN DE SESIÓN (SIMULADOR)');
  console.log('═'.repeat(80));
  console.log(`💼 Balance inicial:  ${initialBalance.toFixed(8)} BTC`);
  console.log(`💼 Balance final:    ${finalBalance.toFixed(8)} BTC`);
  console.log(`📈 Ganancia/Pérdida: ${realProfit > 0 ? '+' : ''}${realProfit.toFixed(8)} BTC (${(realProfit * 100000000).toFixed(0)} sats)`);
  console.log(`🎲 Total de apuestas: ${betCount}`);
  console.log(`� Veces que alcanzó L${MAX_LEVEL}: ${resetCount}`);
  console.log(`🎯 Nivel final: L${currentLevel}`);
  console.log('═'.repeat(80));
});
