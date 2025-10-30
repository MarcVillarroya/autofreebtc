// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Sin timeout de test - permitir ejecución indefinida */
  timeout: 0,
  expect: {
    /**
     * Tiempo máximo que expect() debe esperar una condición
     */
    timeout: 30000
  },
  /* Ejecutar tests en archivos en paralelo */
  fullyParallel: false,
  /* Fallar el build en CI si dejaste test.only */
  forbidOnly: !!process.env.CI,
  /* Reintentar en CI únicamente */
  retries: process.env.CI ? 2 : 0,
  /* Opt out de parallel tests en CI */
  workers: 1,
  /* Reporter a usar */
  reporter: 'html',
  /* Configuración compartida para todos los proyectos */
  use: {
    /* URL base para usar en acciones como `await page.goto('/')` */
    baseURL: 'https://freebitco.in/',
    /* Capturar trace al primer reintento de un test fallido */
    trace: 'on-first-retry',
    /* Capturar screenshot en fallo */
    screenshot: 'only-on-failure',
    /* Video solo en fallo */
    video: 'retain-on-failure',
    /* Tiempo de espera para navegación */
    navigationTimeout: 60000,
  },

  /* Configurar proyectos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    /* Descomenta para usar otros navegadores */
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
