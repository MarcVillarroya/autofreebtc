# Automatización FreeBitco.in con Playwright

Proyecto de automatización web para freebitco.in usando Playwright.

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn

## 🚀 Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Instalar los navegadores de Playwright:

```bash
npx playwright install
```

## 📖 Uso

### Ejecutar tests

```bash
# Ejecutar todos los tests (modo headless)
npm test

# Ejecutar tests en modo visible
npm run test:headed

# Ejecutar en modo debug
npm run test:debug
```

### Generar código automáticamente

Playwright puede generar código automáticamente mientras interactúas con la página:

```bash
npm run codegen
```

Esto abrirá el navegador y el Inspector de Playwright. Cualquier acción que realices en el navegador se convertirá automáticamente en código.

## 📁 Estructura del Proyecto

```
autofreebtc/
├── tests/
│   └── freebitco.spec.js    # Tests de automatización
├── playwright.config.js      # Configuración de Playwright
├── package.json              # Dependencias del proyecto
└── README.md                 # Este archivo
```

## 🔧 Configuración

La configuración de Playwright se encuentra en `playwright.config.js`. Puedes modificar:

- Timeouts
- Navegadores a usar
- Configuración de screenshots y videos
- Y mucho más

## 📝 Notas

- Los tests están configurados para ejecutarse en Chromium por defecto
- Los screenshots y videos se guardan solo cuando hay fallos
- El timeout por test es de 120 segundos

## 🛠️ Desarrollo

Para agregar nuevos tests:

1. Crea un nuevo archivo `.spec.js` en la carpeta `tests/`
2. Usa `test.describe()` para agrupar tests relacionados
3. Usa `test()` para cada caso de prueba individual
4. Usa los selectores de Playwright para interactuar con elementos

### Ejemplo básico:

```javascript
const { test, expect } = require("@playwright/test");

test("mi test", async ({ page }) => {
  await page.goto("https://freebitco.in/");
  await page.click("selector");
  await expect(page).toHaveURL(/esperado/);
});
```

## 📚 Recursos

- [Documentación de Playwright](https://playwright.dev/)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
