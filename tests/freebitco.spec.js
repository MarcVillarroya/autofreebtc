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

test('FreeBitco.in - Login y Multiply BTC', async ({ page }) => {
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

  // 4. Cerrar modales post-login
  await closeModalIfExists(page, 'text=NO THANKS >> nth=0');
  await closeModalIfExists(page, 'role=link[name="Got it!"]');

  console.log('✓ Login exitoso');

  // 5. Navegar a Multiply BTC
  await page.getByRole('navigation').getByRole('link', { name: 'MULTIPLY BTC' }).click();
  
  console.log('✓ En sección Multiply BTC');
});
