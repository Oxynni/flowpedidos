import * as fs from 'fs';
import * as path from 'path';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, PageBreak,
  Header, Footer, PageNumber, TableOfContents, ISectionOptions,
} from 'docx';

const OUTPUT_DIR = 'C:\\Users\\MSI\\Downloads\\flowpedidos-jira';

function headerFooter(title: string) {
  return {
    header: new Header({
      children: [new Paragraph({
        children: [new TextRun({ text: `FlowPedidos - ${title}`, size: 16, color: '4472C4' })],
        alignment: AlignmentType.RIGHT,
      })],
    }),
    footer: new Footer({
      children: [new Paragraph({
        children: [
          new TextRun({ text: 'Página ', size: 16 }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16 }),
          new TextRun({ text: ' de ', size: 16 }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16 }),
        ],
        alignment: AlignmentType.CENTER,
      })],
    }),
  };
}

function h1(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 32, color: '1F3864' })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
  });
}

function h2(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: '2E75B6' })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
  });
}

function h3(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: '5B9BD5' })],
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
  });
}

function p(text: string, bold: boolean = false, size: number = 22): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold, size })],
    spacing: { after: 80 },
  });
}

function bullet(text: string, level: number = 0): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    bullet: { level },
    spacing: { after: 40 },
  });
}

function spacer(): Paragraph {
  return new Paragraph({ children: [new TextRun({ text: '', size: 11 })], spacing: { after: 60 } });
}

function tableHeaderCell(text: string, width: number = 20): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 18, color: 'FFFFFF' })],
      alignment: AlignmentType.CENTER,
    })],
    shading: { fill: '4472C4' },
    width: { size: width, type: WidthType.PERCENTAGE },
  });
}

function tableCell(text: string, width: number = 20): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, size: 18 })] })],
    width: { size: width, type: WidthType.PERCENTAGE },
  });
}

function createTable(headers: string[], rows: string[][], colWidths?: number[]): Table {
  const w = colWidths || headers.map(() => Math.floor(100 / headers.length));
  return new Table({
    rows: [
      new TableRow({ children: headers.map((h, i) => tableHeaderCell(h, w[i])) }),
      ...rows.map(row => new TableRow({ children: row.map((c, i) => tableCell(c, w[i])) })),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// ============================================================
// DATA: Epics, User Stories, Tasks
// ============================================================
const epics = [
  {
    id: 'EP-01',
    name: 'Gestión Inteligente de Pedidos',
    description: 'Módulo para la creación, consulta, actualización y cancelación de pedidos. Incluye simulación de pedidos de prueba y filtrado por estado. El corazón del flujo de automatización.',
    priority: 'Alta',
    stories: [
      {
        id: 'HU-01',
        title: 'Crear pedidos con productos',
        description: 'Como usuario, quiero crear pedidos seleccionando productos con cantidades y precios para iniciar el flujo de venta.',
        acceptance: 'Campos: cliente, email, teléfono, productos (nombre, cantidad, precio). Cálculo automático de subtotal y total. Pedido creado en estado "pendiente".',
        priority: 'Alta',
        sp: 5,
        tasks: [
          'Diseñar interfaz de creación de pedidos',
          'Implementar endpoint POST /api/orders',
          'Validar campos requeridos (cliente, email, productos, método pago)',
          'Calcular subtotales y total automáticamente',
          'Asignar estado inicial "pendiente"',
          'Probar creación con diferentes combinaciones',
        ],
      },
      {
        id: 'HU-02',
        title: 'Ver estado de pedidos en tiempo real',
        description: 'Como usuario, quiero consultar el estado actual de mis pedidos para dar seguimiento al flujo.',
        acceptance: 'Listado de pedidos con filtro por estado. Vista detalle con toda la información del pedido. Fechas de creación y última actualización.',
        priority: 'Alta',
        sp: 3,
        tasks: [
          'Implementar GET /api/orders con filtro por estado',
          'Implementar GET /api/orders/:id para detalle',
          'Mostrar historial de cambios de estado',
          'Probar consultas con diferentes filtros',
        ],
      },
      {
        id: 'HU-10',
        title: 'Cancelar pedidos',
        description: 'Como usuario, quiero cancelar pedidos y que se refleje automáticamente en la facturación.',
        acceptance: 'No permitir cancelar pedidos entregados o despachados. Al cancelar, la factura asociada se cancela automáticamente.',
        priority: 'Media',
        sp: 3,
        tasks: [
          'Implementar PATCH /api/orders/:id/cancel',
          'Validar restricciones de cancelación por estado',
          'Cancelar factura asociada automáticamente',
          'Probar cancelación en cada estado del flujo',
        ],
      },
      {
        id: 'HU-11',
        title: 'Filtrar pedidos por estado',
        description: 'Como usuario, quiero filtrar la lista de pedidos por estado para mejor organización.',
        acceptance: 'Filtro por query param status. Combinación de filtros posible.',
        priority: 'Media',
        sp: 2,
        tasks: [
          'Agregar query param status a GET /api/orders',
          'Mapear string a tipo OrderStatus',
          'Probar filtros para cada estado',
        ],
      },
      {
        id: 'HU-12',
        title: 'Simular pedidos de prueba',
        description: 'Como usuario, quiero generar pedidos aleatorios para demostraciones y pruebas.',
        acceptance: 'Endpoint POST /api/orders/simulate. Genera cliente, productos y cantidades aleatorias. Pedido creado en estado "pendiente".',
        priority: 'Baja',
        sp: 2,
        tasks: [
          'Crear catálogo de productos de prueba',
          'Crear lista de clientes de prueba',
          'Implementar POST /api/orders/simulate',
          'Probar simulación múltiples veces',
        ],
      },
    ],
  },
  {
    id: 'EP-02',
    name: 'Automatización de Facturación',
    description: 'Módulo que genera facturas automáticamente al avanzar el pedido al estado "facturado". Incluye cálculo de IVA, numeración automática y gestión de pagos.',
    priority: 'Alta',
    stories: [
      {
        id: 'HU-03',
        title: 'Generación automática de factura',
        description: 'Como usuario, quiero que al confirmar un pedido se genere automáticamente la factura sin intervención manual.',
        acceptance: 'Al avanzar pedido a "facturado" se crea factura automáticamente. Factura incluye: número único, cliente, productos, subtotal, IVA (16%), total. Estados: emitida.',
        priority: 'Alta',
        sp: 8,
        tasks: [
          'Implementar lógica de auto-generación en advanceStatus',
          'Crear modelo Invoice con campos requeridos',
          'Implementar numeración automática FAC-YYYY-NNNNN',
          'Calcular IVA del 16% sobre subtotal',
          'Implementar endpoint GET /api/invoices',
          'Probar generación automática al avanzar pedido',
        ],
      },
      {
        id: 'HU-05',
        title: 'Consultar facturas electrónicas',
        description: 'Como usuario, quiero consultar facturas con todos los impuestos desglosados.',
        acceptance: 'Listado de todas las facturas. Vista detalle por ID. Consulta por pedido asociado. Desglose: subtotal, IVA, total.',
        priority: 'Alta',
        sp: 5,
        tasks: [
          'Implementar GET /api/invoices',
          'Implementar GET /api/invoices/:id',
          'Implementar GET /api/invoices/order/:orderId',
          'Implementar PATCH /api/invoices/:id/pay',
          'Implementar PATCH /api/invoices/:id/cancel',
          'Probar todo el ciclo de vida de factura',
        ],
      },
    ],
  },
  {
    id: 'EP-03',
    name: 'Control de Despachos y Logística',
    description: 'Módulo que gestiona el despacho de pedidos. Se genera automáticamente al avanzar a "despachado". Incluye números de rastreo y seguimiento de estados.',
    priority: 'Alta',
    stories: [
      {
        id: 'HU-04',
        title: 'Generación automática de despacho',
        description: 'Como usuario, quiero que al facturar se genere automáticamente el despacho sin intervención manual.',
        acceptance: 'Al avanzar pedido a "despachado" se crea despacho automáticamente. Despacho incluye: dirección, paquetería, número de rastreo único.',
        priority: 'Alta',
        sp: 8,
        tasks: [
          'Implementar auto-generación de despacho en advanceStatus',
          'Crear modelo Dispatch',
          'Generar número de rastreo TRK-YYYY-NNNNN',
          'Asignar paquetería por defecto',
          'Implementar CRUD de despachos',
          'Probar generación automática',
        ],
      },
      {
        id: 'HU-06',
        title: 'Rastrear estado de envío',
        description: 'Como usuario, quiero rastrear el estado de envío de mis despachos.',
        acceptance: 'Estados: preparando, en_tránsito, entregado, fallido. Consulta por ID de despacho y por ID de pedido.',
        priority: 'Media',
        sp: 5,
        tasks: [
          'Implementar GET /api/dispatches',
          'Implementar GET /api/dispatches/:id',
          'Implementar GET /api/dispatches/order/:orderId',
          'Implementar PATCH /api/dispatches/:id/advance',
          'Implementar PATCH /api/dispatches/:id/fail',
          'Probar todos los cambios de estado',
        ],
      },
      {
        id: 'HU-13',
        title: 'Marcar despachos como entregados/fallidos',
        description: 'Como usuario, quiero actualizar el estado final del despacho (entregado o fallido).',
        acceptance: 'Endpoint para marcar como entregado. Endpoint para marcar como fallido. Fecha de entrega registrada automáticamente.',
        priority: 'Media',
        sp: 3,
        tasks: [
          'Validar transiciones de estado permitidas',
          'Registrar fecha de entrega al marcar entregado',
          'Probar escenarios de entrega exitosa y fallida',
        ],
      },
    ],
  },
  {
    id: 'EP-04',
    name: 'Asistente de IA y Chatbot',
    description: 'Asistente inteligente integrado vía chatbot que ayuda al usuario a navegar el sistema, consultar estadísticas y entender el flujo de automatización.',
    priority: 'Alta',
    stories: [
      {
        id: 'HU-07',
        title: 'Chatbot asistente con IA',
        description: 'Como usuario, quiero chatear con un asistente AI para resolver dudas sobre el sistema.',
        acceptance: 'Endpoint POST /api/chat/message. Detección de intenciones: estadísticas, flujo, ayuda. Respuestas contextuales. Historial por sesión.',
        priority: 'Alta',
        sp: 8,
        tasks: [
          'Diseñar motor de detección de intenciones',
          'Implementar servicio AIService',
          'Implementar POST /api/chat/message',
          'Implementar detección de: stats, flujo, ayuda, pedidos',
          'Mantener historial de conversación por sesión',
          'Probar todas las intenciones del chatbot',
        ],
      },
      {
        id: 'HU-08',
        title: 'Sugerencias inteligentes de IA',
        description: 'Como usuario, quiero que la IA me sugiera acciones basadas en el contexto actual.',
        acceptance: 'Sugerencias contextuales después de cada respuesta. Opciones como: "Ver estadísticas", "Explicar flujo", "Simular pedido".',
        priority: 'Media',
        sp: 5,
        tasks: [
          'Implementar array de sugerencias por intención',
          'Retornar suggestions en respuesta del chat',
          'Personalizar sugerencias según estado del sistema',
          'Probar sugerencias en diferentes contextos',
        ],
      },
    ],
  },
  {
    id: 'EP-05',
    name: 'Dashboard y Reportes',
    description: 'Panel de control con estadísticas en tiempo real del sistema: totales de pedidos, facturas, despachos e ingresos.',
    priority: 'Media',
    stories: [
      {
        id: 'HU-09',
        title: 'Dashboard con estadísticas',
        description: 'Como usuario, quiero ver un dashboard con estadísticas del sistema en tiempo real.',
        acceptance: 'Endpoint /stats para cada módulo. Totales: pedidos, facturas, despachos. Desglose por estado. Ingresos totales.',
        priority: 'Media',
        sp: 5,
        tasks: [
          'Implementar GET /api/orders/stats',
          'Implementar GET /api/invoices/stats',
          'Implementar GET /api/dispatches/stats',
          'Calcular ingresos totales',
          'Probar estadísticas con datos reales',
        ],
      },
    ],
  },
  {
    id: 'EP-06',
    name: 'Arquitectura y Configuración',
    description: 'Base técnica del proyecto: configuración del backend, API REST documentada, estructura MVC con TypeScript.',
    priority: 'Alta',
    stories: [
      {
        id: 'HU-15',
        title: 'API REST documentada',
        description: 'Como desarrollador, quiero una API REST bien estructurada y documentada para integrar el sistema con otras aplicaciones.',
        acceptance: 'Endpoints RESTful con formato JSON consistente. Endpoint /api/health con metadatos. Códigos HTTP estándar. Formato respuesta { success, data, error }.',
        priority: 'Alta',
        sp: 8,
        tasks: [
          'Configurar proyecto Node.js + TypeScript + Express',
          'Implementar middleware de logging y errores',
          'Definir estructura MVC de carpetas',
          'Implementar endpoint /api/health',
          'Documentar todos los endpoints',
          'Configurar CORS para integración',
          'Compilar TypeScript sin errores',
        ],
      },
      {
        id: 'HU-16',
        title: 'Autenticación y login de usuarios',
        description: 'Como usuario, quiero iniciar sesión con credenciales seguras para acceder al sistema con roles y permisos.',
        acceptance: 'Login con email y contraseña. JWT token para sesiones. Roles: admin, operador. Protección de rutas por rol.',
        priority: 'Alta',
        sp: 8,
        tasks: [
          'Implementar modelo de usuario con roles',
          'Crear endpoint POST /api/auth/login',
          'Implementar JWT y middleware de autenticación',
          'Proteger rutas según rol de usuario',
          'Probar login con diferentes roles',
        ],
      },
      {
        id: 'HU-17',
        title: 'Exportar reportes en PDF/Excel',
        description: 'Como usuario, quiero exportar reportes de pedidos, facturas y despachos para compartir información.',
        acceptance: 'Exportar a PDF y Excel. Reportes: pedidos por período, facturas emitidas, despachos realizados.',
        priority: 'Media',
        sp: 5,
        tasks: [
          'Implementar generación de PDF con librería',
          'Implementar generación de Excel',
          'Crear endpoint GET /api/reports/orders',
          'Crear endpoint GET /api/reports/invoices',
          'Probar exportación con datos reales',
        ],
      },
      {
        id: 'HU-18',
        title: 'Despliegue en producción',
        description: 'Como administrador, quiero desplegar el sistema en un servidor en la nube para acceso público.',
        acceptance: 'Despliegue en Render.com. Variables de entorno configuradas. HTTPS habilitado. Dominio asignado.',
        priority: 'Alta',
        sp: 5,
        tasks: [
          'Configurar cuenta en Render.com',
          'Conectar repositorio GitHub con Render',
          'Configurar variables de entorno',
          'Desplegar y verificar funcionamiento',
          'Configurar dominio personalizado',
        ],
      },
    ],
  },
];

// ============================================================
// GENERATE DOCUMENT
// ============================================================
async function generateJiraDoc() {
  const children: any[] = [];

  children.push(h1('FlowPedidos - Jira'));
  children.push(p('Proyecto: Automatización de Flujo Pedido-Factura-Despacho'));
  children.push(p('No. Lista: 38'));
  children.push(p('Fecha de inicio: 13/05/2026'));
  children.push(p('Metodología: Scrum'));
  children.push(p('Herramienta: Jira Software'));
  children.push(spacer());

  // ============================================================
  // SECTION 1: ÉPICAS (Epics)
  // ============================================================
  children.push(h1('1. ÉPICAS (Epics)'));
  children.push(p('Las épicas representan los temas principales del proyecto. Cada épica agrupa varias historias de usuario relacionadas.', false, 22));
  children.push(spacer());

  const epicTableRows = epics.map(e => [
    e.id,
    e.name,
    e.description.substring(0, 80) + '...',
    e.priority,
    String(e.stories.length),
    String(e.stories.reduce((sum, s) => sum + s.sp, 0)),
  ]);

  children.push(
    createTable(
      ['ID', 'Nombre', 'Descripción', 'Prioridad', 'HU', 'SP Total'],
      epicTableRows,
      [8, 20, 32, 10, 8, 8]
    )
  );
  children.push(spacer());

  // Detalle de cada épica
  for (const epic of epics) {
    children.push(h2(`${epic.id}: ${epic.name}`));
    children.push(p(`Descripción: ${epic.description}`));
    children.push(p(`Prioridad: ${epic.priority} | Story Points totales: ${epic.stories.reduce((sum, s) => sum + s.sp, 0)}`));
    children.push(p(`Historias de usuario asociadas: ${epic.stories.map(s => s.id).join(', ')}`));
    children.push(spacer());

    children.push(h3('Historias de Usuario en esta Épica'));
    const storyRows = epic.stories.map(s => [s.id, s.title, s.priority, String(s.sp)]);
    children.push(
      createTable(
        ['ID', 'Título', 'Prioridad', 'SP'],
        storyRows,
        [10, 50, 15, 10]
      )
    );
    children.push(spacer());
  }

  // ============================================================
  // SECTION 2: HISTORIAS DE USUARIO (User Stories)
  // ============================================================
  children.push(h1('2. HISTORIAS DE USUARIO (User Stories)'));
  children.push(p('Cada historia de usuario incluye: título, descripción, criterios de aceptación, prioridad, story points, épica asociada y tareas.', false, 22));
  children.push(spacer());

  let storyCounter = 0;
  for (const epic of epics) {
    for (const story of epic.stories) {
      storyCounter++;
      children.push(h2(`${story.id}: ${story.title}`));
      children.push(p(`Épica: ${epic.id} - ${epic.name}`));
      children.push(p(`Prioridad: ${story.priority} | Story Points: ${story.sp}`));
      children.push(spacer());
      children.push(p('Descripción:', true));
      children.push(p(story.description));
      children.push(spacer());
      children.push(p('Criterios de Aceptación:', true));
      children.push(p(story.acceptance));
      children.push(spacer());
    }
  }

  // ============================================================
  // SECTION 3: TAREAS (Tasks)
  // ============================================================
  children.push(h1('3. TAREAS (Tasks)'));
  children.push(p('Desglose de cada historia de usuario en tareas técnicas concretas para su implementación.', false, 22));
  children.push(spacer());

  for (const epic of epics) {
    for (const story of epic.stories) {
      children.push(h2(`${story.id} - ${story.title}`));
      story.tasks.forEach((task, i) => {
        children.push(bullet(`T-${story.id.replace('HU-', '')}-${String(i + 1).padStart(2, '0')}: ${task}`));
      });
      children.push(spacer());
    }
  }

  // ============================================================
  // SECTION 4: SPRINT ASSIGNMENT (3 Sprints)
  // ============================================================
  const sprint1Stories = ['HU-15', 'HU-01', 'HU-02', 'HU-03', 'HU-04', 'HU-11', 'HU-12'];
  const sprint2Stories = ['HU-05', 'HU-06', 'HU-07', 'HU-10', 'HU-13', 'HU-09'];
  const sprint3Stories = ['HU-08', 'HU-16', 'HU-17', 'HU-18'];

  function getSprint(storyId: string): number {
    if (sprint1Stories.includes(storyId)) return 1;
    if (sprint2Stories.includes(storyId)) return 2;
    if (sprint3Stories.includes(storyId)) return 3;
    return 1;
  }

  children.push(h1('4. SPRINTS - Asignación a Jira'));
  children.push(spacer());

  // Sprint 1
  children.push(h2('Sprint 1: Fundación del Sistema'));
  children.push(p('Duración: 13/05/2026 al 26/05/2026 (2 semanas)', true));
  children.push(p('Objetivo: Establecer la base del sistema con flujo completo de automatización Pedido-Factura-Despacho y API REST.', false, 22));
  children.push(p('Story Points: 36 | Capacidad: 40 SP'));
  children.push(spacer());
  const s1Rows = epics.flatMap(e => e.stories.filter(s => sprint1Stories.includes(s.id)));
  children.push(createTable(
    ['ID', 'Historia de Usuario', 'Épica', 'SP', 'Estado'],
    s1Rows.map(s => { const ep = epics.find(e => e.stories.includes(s))!; return [s.id, s.title, ep.id, String(s.sp), 'Por hacer']; }),
    [8, 35, 10, 8, 12]
  ));
  children.push(spacer());

  // Sprint 2
  children.push(h2('Sprint 2: Inteligencia y Seguimiento'));
  children.push(p('Duración: 27/05/2026 al 09/06/2026 (2 semanas)', true));
  children.push(p('Objetivo: Integrar asistente IA, chatbot, dashboard de estadísticas y gestión avanzada de facturas y despachos.', false, 22));
  children.push(p('Story Points: 31 | Capacidad: 40 SP'));
  children.push(spacer());
  const s2Rows = epics.flatMap(e => e.stories.filter(s => sprint2Stories.includes(s.id)));
  children.push(createTable(
    ['ID', 'Historia de Usuario', 'Épica', 'SP', 'Estado'],
    s2Rows.map(s => { const ep = epics.find(e => e.stories.includes(s))!; return [s.id, s.title, ep.id, String(s.sp), 'Por hacer']; }),
    [8, 35, 10, 8, 12]
  ));
  children.push(spacer());

  // Sprint 3
  children.push(h2('Sprint 3: Mejoras y Despliegue'));
  children.push(p('Duración: 10/06/2026 al 23/06/2026 (2 semanas)', true));
  children.push(p('Objetivo: Implementar autenticación, exportación de reportes, despliegue en producción y ajustes finales.', false, 22));
  children.push(p('Story Points: 23 | Capacidad: 40 SP'));
  children.push(spacer());
  const s3Rows = epics.flatMap(e => e.stories.filter(s => sprint3Stories.includes(s.id)));
  children.push(createTable(
    ['ID', 'Historia de Usuario', 'Épica', 'SP', 'Estado'],
    s3Rows.map(s => { const ep = epics.find(e => e.stories.includes(s))!; return [s.id, s.title, ep.id, String(s.sp), 'Por hacer']; }),
    [8, 35, 10, 8, 12]
  ));
  children.push(spacer());

  // ALL TASKS (de todas las HU, organizadas por Sprint)
  children.push(h1('5. TAREAS POR SPRINT'));
  children.push(spacer());

  const allSprintData = [
    { num: 1, name: 'Fundación del Sistema', stories: sprint1Stories },
    { num: 2, name: 'Inteligencia y Seguimiento', stories: sprint2Stories },
    { num: 3, name: 'Mejoras y Despliegue', stories: sprint3Stories },
  ];

  for (const s of allSprintData) {
    children.push(h2(`Sprint ${s.num}: ${s.name}`));
    const taskRows: { taskId: string; storyId: string; storyTitle: string; task: string }[] = [];
    for (const epic of epics) {
      for (const story of epic.stories) {
        if (s.stories.includes(story.id)) {
          story.tasks.forEach((task, i) => {
            taskRows.push({
              taskId: `T-${story.id.replace('HU-', '')}-${String(i + 1).padStart(2, '0')}`,
              storyId: story.id,
              storyTitle: story.title,
              task,
            });
          });
        }
      }
    }
    for (let i = 0; i < taskRows.length; i += 20) {
      const chunk = taskRows.slice(i, i + 20);
      children.push(createTable(
        ['ID Tarea', 'HU', 'Historia de Usuario', 'Descripción'],
        chunk.map(t => [t.taskId, t.storyId, t.storyTitle, t.task]),
        [12, 8, 25, 45]
      ));
      children.push(spacer());
    }
  }

  // ============================================================
  // SECTION 6: GUÍA PARA JIRA
  // ============================================================
  children.push(h1('6. GUÍA PARA CREAR EN JIRA'));
  children.push(spacer());
  children.push(h2('Paso 1: Crear el Proyecto'));
  children.push(bullet('Tipo de proyecto: Scrum'));
  children.push(bullet('Nombre: FlowPedidos'));
  children.push(bullet('Clave: FP'));
  children.push(spacer());

  children.push(h2('Paso 2: Crear Épicas'));
  children.push(bullet('Ir a Issues → Create Issue → Épica'));
  children.push(bullet('Crear una épica por cada EP-01 a EP-06 de este documento'));
  children.push(bullet('Copiar: Nombre, descripción y prioridad desde este documento'));
  children.push(spacer());

  children.push(h2('Paso 3: Crear Historias de Usuario'));
  children.push(bullet('Ir a Issues → Create Issue → Historia'));
  children.push(bullet('Crear una historia por cada HU-01 a HU-15'));
  children.push(bullet('En el campo "Épica", seleccionar la épica correspondiente'));
  children.push(bullet('En "Descripción" pegar la descripción y criterios de aceptación'));
  children.push(bullet('Asignar Story Points y prioridad'));
  children.push(spacer());

  children.push(h2('Paso 4: Crear Tareas'));
  children.push(bullet('Abrir cada historia de usuario'));
  children.push(bullet('Ir a la pestaña "Subtareas" o crear issues tipo "Tarea" vinculadas'));
  children.push(bullet('Crear cada tarea T-XX-YY listada en la Sección 3'));
  children.push(spacer());

  children.push(h2('Paso 5: Configurar Sprints'));
  children.push(bullet('Ir a Backlog → Create Sprint'));
  children.push(bullet('Sprint 1: 13/05/2026 → 26/05/2026 — HU-15, HU-01, HU-02, HU-03, HU-04, HU-11, HU-12'));
  children.push(bullet('Sprint 2: 27/05/2026 → 09/06/2026 — HU-05, HU-06, HU-07, HU-10, HU-13, HU-09'));
  children.push(bullet('Sprint 3: 10/06/2026 → 23/06/2026 — HU-08, HU-16, HU-17, HU-18'));
  children.push(bullet('Iniciar Sprint 1 y mover las HU correspondientes'));
  children.push(spacer());

  children.push(h2('Paso 6: Daily Scrum y Seguimiento'));
  children.push(bullet('Usar el panel "Active Sprints" para ver el tablero'));
  children.push(bullet('Mover tareas: Por hacer → En progreso → Hecho'));
  children.push(bullet('Actualizar el Burndown Chart diariamente'));

  // ============================================================
  // BUILD DOCUMENT
  // ============================================================
  const doc = new Document({
    ...headerFooter('Jira - Epics, Stories & Tasks'),
    sections: [{ children }],
  });

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const buffer = await Packer.toBuffer(doc);
  const filePath = path.join(OUTPUT_DIR, 'FlowPedidos_Jira_Epics_Stories_Tasks.docx');
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ Documento generado: ${filePath}`);
}

generateJiraDoc().catch(console.error);
