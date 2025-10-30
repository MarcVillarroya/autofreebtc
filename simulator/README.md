# 🎲 FreeBitco.in Simulator

Simulador local del juego HI-LO de FreeBitco.in para probar estrategias de apuestas sin riesgo.

## 🚀 Cómo usar

### Opción 1: Servidor HTTP Simple con Python

```powershell
# Navegar a la carpeta del simulador
cd simulator

# Python 3
python -m http.server 3000

# O Python 2
python -m SimpleHTTPServer 3000
```

### Opción 2: Servidor HTTP Simple con Node.js

```powershell
# Instalar http-server globalmente (solo una vez)
npm install -g http-server

# Navegar a la carpeta del simulador
cd simulator

# Iniciar servidor
http-server -p 3000
```

### Opción 3: Live Server en VS Code

1. Instala la extensión "Live Server" en VS Code
2. Click derecho en `index.html` → "Open with Live Server"
3. Se abrirá en `http://127.0.0.1:5500` (cambiar URL en el test)

## 🎮 Abrir el simulador

Una vez iniciado el servidor, abre tu navegador en:

- http://localhost:3000

## 🧪 Probar con Playwright

### Ejecutar test en el simulador:

```powershell
npx playwright test tests/freebitco.simulator.spec.js --headed
```

### Ejecutar test en producción real:

```powershell
npx playwright test tests/freebitco.spec.js --headed
```

## ✨ Características

- ✅ **Mismos IDs y selectores** que FreeBitco.in
- ✅ **Lógica de juego realista** con probabilidades correctas
- ✅ **Animación del contador** (desactivable)
- ✅ **Estadísticas en tiempo real**
- ✅ **Interfaz visual similar**
- ✅ **Compatible con Playwright**

## 📊 Elementos disponibles

| Elemento          | ID/Selector                          | Descripción               |
| ----------------- | ------------------------------------ | ------------------------- |
| Balance           | `#balance`                           | Balance actual en BTC     |
| Bet Amount        | `#double_your_btc_stake`             | Monto de apuesta          |
| Bet Odds          | `#double_your_btc_payout_multiplier` | Multiplicador de ganancia |
| Win Profit        | `#win_profit`                        | Ganancia esperada         |
| Win Chance        | `#win_chance`                        | Probabilidad de ganar     |
| Roll Number       | `#roll_number`                       | Número resultado          |
| Bet HI Button     | `#bet_hi_button`                     | Botón apostar alto        |
| Bet LO Button     | `#bet_lo_button`                     | Botón apostar bajo        |
| Win Message       | `#double_your_btc_bet_win`           | Mensaje de victoria       |
| Lose Message      | `#double_your_btc_bet_lose`          | Mensaje de derrota        |
| Disable Animation | `#disable_animation_checkbox`        | Checkbox animaciones      |

## 🎯 Configuración inicial

- **Balance inicial:** 0.00100000 BTC (100,000 satoshis)
- **Apuesta mínima:** 0.00000001 BTC (1 satoshi)
- **Odds por defecto:** 2.00x (47.50% probabilidad)

## 🔧 Personalización

Puedes editar `game.js` para cambiar:

- Balance inicial
- Velocidad de animación
- Probabilidades del juego
- Colores y estilos en `styles.css`

## 📝 Notas

- El simulador usa **números aleatorios** para simular el juego
- La lógica de victoria/derrota es **matemáticamente correcta**
- Perfecto para **probar estrategias Fibonacci** sin riesgo
- Compatible con **automatización Playwright**

## 🎓 Uso educativo

Este simulador es solo para **fines educativos y de prueba**. Permite:

- Validar estrategias antes de usar dinero real
- Entender probabilidades y progresiones
- Depurar scripts de automatización
- Analizar resultados a largo plazo

---

**¡Disfruta probando tu estrategia Fibonacci! 🚀**
