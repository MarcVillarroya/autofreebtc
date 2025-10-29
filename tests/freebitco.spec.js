const { test } = require('@playwright/test');
require('dotenv').config();

// Credenciales desde .env
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

// Helper: Cerrar modal si existe
async function closeModalIfExists(page, selector, timeout = 5000) {
  try {
    await page.click(selector, { timeout });
  } catch (e) {
    // Modal no existe, continuar
  }
}

test('FreeBitco.in - STRATEGY TEST', async ({ page }) => {
  // 1. Navegar y manejar diálogos
  await page.goto('https://freebitco.in/');
  page.once('dialog', dialog => dialog.dismiss().catch(() => {}));

  // 2. Cerrar banner de notificaciones
  await closeModalIfExists(page, 'text=ALLOW >> nth=2', 10000);

  // 3. Login
  await page.getByRole('link', { name: 'LOGIN' }).click();
  await page.getByRole('textbox', { name: 'Bitcoin Address/E-mail Address' }).fill(EMAIL);
  await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'LOGIN!' }).click();

  // 4. Cerrar modales
  await closeModalIfExists(page, 'text=NO THANKS >> nth=0');
  await closeModalIfExists(page, 'role=link[name="Got it!"]');

  console.log('Login OK');

  // 5. Navegar a Multiply BTC
  await page.getByRole('navigation').getByRole('link', { name: 'MULTIPLY BTC' }).click();
  
  console.log('Multiply BTC OK');

  // ========================================
  // SELECTORES DE MANUAL BET - MULTIPLY BTC
  // ========================================
  
  // IDs ESPECÍFICOS PARA MANUAL BET:
  // - #double_your_btc_stake (Bet Amount)
  // - #double_your_btc_payout_multiplier (Bet Odds)
  // - #double_your_btc_win_chance (Win Chance %)
  
  // IDs ESPECÍFICOS PARA AUTO BET:
  // - #autobet_stake (Bet Amount)
  // - #autobet_bet_odds (Bet Odds)
  // - #autobet_win_chance (Win Chance %)
  
  // --- PESTAÑAS DE MODO DE JUEGO ---
  await page.getByText('MANUAL BET').first().click();
  // await page.getByText('AUTO BET').click();

  // --- CAMPO BET AMOUNT (Monto de Apuesta) ---
  // Input field para el monto de apuesta - MANUAL BET
  const betAmountInput = '#double_your_btc_stake';
  await page.locator(betAmountInput).fill('0.00000001');
  

  // --- WIN PROFIT (Ganancia al Ganar) ---
  // Muestra el profit que se obtendría al ganar
  // Valor visible: "0.00000001" (cambia según bet amount y odds)

  // --- BET ODDS Y WIN CHANCE ---
  // Input para BET ODDS (multiplicador de ganancias) - MANUAL BET
  const betOddsInput = '#double_your_btc_payout_multiplier';
  await page.locator(betOddsInput).fill('1.01');
  
  // Input para WIN CHANCE (porcentaje de probabilidad) - MANUAL BET
  const winChanceInput = '#double_your_btc_win_chance';
  // await page.locator(winChanceInput).fill('33.00%');

  // --- DISPLAY DE NÚMERO GANADOR ---
  // Heading que muestra el número del último roll (ejemplo: "0 0 0 0 0")
  // await page.getByRole('heading', { name: '0 0 0 0 0' });

  // --- BOTONES PRINCIPALES DE APUESTA ---
  // Botón BET HI (apostar alto)
  const betHiButton = 'button:has-text("BET HI")';
  await page.locator(betHiButton).click();
  
  // Botón BET LO (apostar bajo)
  //const betLoButton = 'button:has-text("BET LO")';
  // await page.locator(betLoButton).click();

  console.log('✅ Todos los selectores de MANUAL BET han sido documentados');
  
});
