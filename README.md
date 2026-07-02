# FlowPedidos

Sistema web de automatización del flujo **Pedido → Factura → Despacho** con asistente IA conversacional. Desarrollado con Node.js, Express y TypeScript.

## Características

- **Gestión de Pedidos** — CRUD completo con avance automático por estados
- **Facturación Automática** — Generación de facturas con IVA al llegar a "facturado"
- **Despachos Automáticos** — Creación de despachos con número de rastreo al llegar a "despachado"
- **Chatbot IA** — Asistente conversacional que puede crear pedidos, facturas, despachos y ejecutar el flujo completo
- **Dashboard** — Panel con gráficos Chart.js (estado de pedidos, facturas, despachos, ingresos)
- **Modo oscuro** y **filtros para daltonismo** (protanopia, deuteranopia, tritanopia)

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express + TypeScript |
| Frontend | HTML/CSS vanilla + Chart.js |
| Datos | En memoria (Maps) con datos semilla |
| Chatbot | Reglas de intención + ejecución directa de servicios |

## Instalación

```bash
git clone https://github.com/Oxynni/flowpedidos.git
cd flowpedidos
npm install
npm run build
npm start
```

El servidor corre en `http://localhost:3000` con 12 pedidos de prueba precargados.

## Modo desarrollo

```bash
npm run dev
```

## Scripts

| Comando | Descripción |
|---------|------------|
| `npm run dev` | Inicia con recarga automática (ts-node-dev) |
| `npm run build` | Compila TypeScript a JavaScript |
| `npm start` | Inicia el servidor en producción |
| `npm run lint` | Verifica tipos con TypeScript |
| `npm run docs` | Genera documentación Scrum (.docx) |

## API

| Endpoint | Descripción |
|----------|------------|
| `GET /api/health` | Estado del servidor |
| `GET/POST /api/orders` | CRUD de pedidos |
| `GET /api/invoices` | Consulta de facturas |
| `GET /api/dispatches` | Consulta de despachos |
| `POST /api/chat/message` | Enviar mensaje al chatbot |

### Chatbot IA

El chatbot entiende lenguaje natural para ejecutar acciones:

```
"crea un pedido"       → Inicia creación guiada
"haz la factura"       → Genera factura (pide cliente)
"crea el despacho"     → Crea despacho (pide cliente)
"avanza el pedido"     → Siguiente estado del flujo
"haz todo el proceso"  → Completa Pedido→Factura→Despacho
"ver estadísticas"     → Resumen del sistema
"muestra los pedidos"  → Lista todos los pedidos
```

## Flujo de Automatización

```
Pedido (pendiente) → Confirmado → En Facturación → Facturado (AUTO: Factura)
→ En Despacho → Despachado (AUTO: Despacho) → Entregado
```

Cada factura incluye cálculo automático de IVA (16%) y los despachos generan número de rastreo único.

## Licencia

MIT
