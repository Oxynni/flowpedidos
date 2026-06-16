$portfolioPath = "C:\Users\MSI\Downloads\Sof\9°B DESARROLLO WEB INTEGRAL\Portafolio-M.M.C-202304033-DesarrolloWebIntegral-P.2.docx"

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    $doc = $word.Documents.Open($portfolioPath)
    $content = $doc.Content

    function InsertAfterText($searchText, $newContent) {
        $find = $content.Find
        $find.ClearFormatting()
        $find.Text = $searchText
        $find.Forward = $true
        $find.Wrap = 1
        $found = $find.Execute()
        if ($found) {
            $range = $content.Application.Selection.Range
            $range.Collapse(0)
            $range.InsertAfter("`r`n" + $newContent)
            return $true
        }
        return $false
    }

    Write-Host "Insertando contenido en el portafolio..."

    # UNIDAD I - SCRUM
    InsertAfterText -searchText "1.1.1 Descripcion" -newContent @"
Implementacion de la metodologia SCRUM para la gestion del proyecto FlowPedidos (Procesamiento de pedidos - Automatizacion pedido-factura-despacho). Definicion de Epicas, Historias de Usuario y Tareas en Jira para el desarrollo del sistema. Proyecto iniciado: 13/05/2026. Equipo: Individual (1 persona - rol multifuncional).
"@

    InsertAfterText -searchText "1.1.2 Desarrollo" -newContent @"
SCRUM - FLOWPEDIDOS

Product Backlog (15 Historias de Usuario):
Epicas: Gestion de Pedidos, Facturacion Automatica, Despachos, IA/Chatbot, Dashboard, Seguridad

Sprint 1 (13/05/2026 - 26/05/2026):
Objetivo: Base del sistema con flujo completo + chatbot IA
Capacidad: 40 Story Points
Tareas completadas: 14/14 (100%)

Documentacion generada:
1. Product Backlog - 15 HU priorizadas
2. Sprint Backlog - Sprint 1 y 2
3. Sprint Planning - Objetivos y planificacion
4. Daily Scrum - 10 reuniones registradas
5. Sprint Review - Demo y resultados
6. Sprint Retrospective - Mejora continua
"@

    InsertAfterText -searchText "1.1.3 Conclusion" -newContent @"
La implementacion de SCRUM para el proyecto FlowPedidos permitio una gestion estructurada y eficiente del desarrollo. A pesar de tratarse de un equipo individual, la metodologia ayudo a mantener el enfoque, priorizar tareas y documentar el progreso. El Sprint 1 se completo al 100%, demostrando la efectividad de SCRUM incluso en equipos pequenos.
"@

    # UNIDAD I - Gantt
    InsertAfterText -searchText "1.3.1 Descripcion" -newContent @"
Creacion del diagrama de Gantt en Jira para visualizar las tareas del Sprint 1 del proyecto FlowPedidos, estableciendo cronograma del 13/05/2026 al 26/05/2026.
"@

    InsertAfterText -searchText "1.3.2 Desarrollo" -newContent @"
DIAGRAMA DE GANTT - SPRINT 1 FLOWPEDIDOS

Semana 1 (13/05 - 16/05):
- Dia 1 (13/05): Configuracion del proyecto, modelos de datos
- Dia 2 (14/05): CRUD de pedidos
- Dia 3 (15/05): Flujo Pedido a Factura
- Dia 4 (16/05): Flujo Factura a Despacho

Semana 2 (19/05 - 26/05):
- Dia 5 (19/05): Servicio de IA
- Dia 6 (20/05): Endpoint de chat
- Dia 7 (21/05): Dashboard y simulacion
- Dia 8 (22/05): Pruebas de flujo completo
- Dia 9 (23/05): Documentacion tecnica
- Dia 10 (26/05): Resena y entrega

Total horas invertidas: ~45 horas
"@

    # UNIDAD II - 2.1 Proyecto FlowPedidos
    InsertAfterText -searchText "2.1.1 Descripcion" -newContent @"
Procesamiento de pedidos. Automatizacion de flujo pedido-factura-despacho. Cero errores manuales.
No. de lista: 38
Proyecto: FlowPedidos - Sistema integral de gestion de pedidos, facturacion y despacho con asistencia de IA.

El proyecto consiste en desarrollar un sistema web que automatice el flujo completo de procesamiento de pedidos, desde la creacion del pedido hasta el despacho final, eliminando errores manuales mediante la integracion de un asistente de IA y chatbot que guia al usuario durante todo el proceso.
"@

    InsertAfterText -searchText "2.1.2 Desarrollo" -newContent @"
Se desarrollo el sistema FlowPedidos utilizando las siguientes tecnologias:
- Backend: Node.js + Express + TypeScript
- Arquitectura: MVC (Modelo-Vista-Controlador)
- IA: Motor de deteccion de intenciones para chatbot
- API: RESTful con endpoints JSON
- Herramientas: OpenCode (asistente AI), VS Code

El sistema cuenta con los siguientes modulos:

1. Modulo de Pedidos (Orders):
   - CRUD completo de pedidos
   - Estados: pendiente, confirmado, en_facturacion, facturado, en_despacho, despachado, entregado, cancelado
   - Simulacion de pedidos de prueba
   - Filtrado por estado

2. Modulo de Facturas (Invoices):
   - Generacion automatica al avanzar el pedido a "facturado"
   - Calculo de IVA (16%)
   - Numeracion automatica de facturas
   - Estados: emitida, pagada, cancelada

3. Modulo de Despachos (Dispatch):
   - Generacion automatica al avanzar el pedido a "despachado"
   - Numeros de rastreo unicos
   - Estados: preparando, en_transito, entregado, fallido

4. Asistente IA / Chatbot:
   - Deteccion de intenciones del usuario
   - Respuestas contextuales basadas en el estado del sistema
   - Comandos: estadisticas, flujo, ayuda, crear pedido
   - Historial de conversacion por sesion

5. Dashboard:
   - Estadisticas en tiempo real
   - Totales de pedidos, facturas y despachos
   - Ingresos generados

FLUJO DE AUTOMATIZACION (Cero Errores Manuales):
1. POST /api/orders - Pedido creado (pendiente)
2. PATCH /api/orders/:id/advance - Confirmado
3. PATCH /api/orders/:id/advance - En facturacion
4. PATCH /api/orders/:id/advance - FACTURA GENERADA AUTOMATICAMENTE
5. PATCH /api/orders/:id/advance - En despacho
6. PATCH /api/orders/:id/advance - DESPACHO GENERADO AUTOMATICAMENTE
7. PATCH /api/orders/:id/advance - Entregado

El usuario solo debe avanzar el estado; el sistema genera factura y despacho sin intervencion manual.
"@

    InsertAfterText -searchText "2.1.3 Conclusion" -newContent @"
El desarrollo del sistema FlowPedidos demostro que es posible automatizar completamente el flujo de pedido-factura-despacho utilizando tecnologias web modernas. La integracion de un asistente de IA permite reducir errores manuales y mejorar la experiencia del usuario. El uso de TypeScript y Express proporciona una base solida y escalable para futuras mejoras como la implementacion de frontend, persistencia de datos y autenticacion de usuarios.
"@

    # UNIDAD II - 2.2 Guia de Estilo
    InsertAfterText -searchText "2.2.1 Descripcion" -newContent @"
Creacion de la guia de estilo y estandares de codificacion para el proyecto FlowPedidos, estableciendo convenciones de nomenclatura, estructura de carpetas, y patrones de diseno para mantener la consistencia del codigo.
"@

    InsertAfterText -searchText "2.2.2 Desarrollo" -newContent @"
GUIA DE ESTILO - FLOWPEDIDOS

Estructura del Proyecto:
/src
  /types      - Definiciones de tipos e interfaces TypeScript
  /models     - Capa de datos (en memoria, Map-based)
  /services   - Logica de negocio
  /controllers - Manejadores de peticiones HTTP
  /routes     - Definicion de rutas Express
  /middleware  - Middleware (logger, errores)

Convenciones:
- Lenguaje: TypeScript (tipado estricto)
- Nomenclatura: camelCase para variables/funciones, PascalCase para clases/tipos
- Archivos: Nombre descriptivo en camelCase (orderService.ts, chatController.ts)
- API: Rutas RESTful en plural (/api/orders, /api/invoices)
- Respuestas: Formato exito: bool, datos: T, error: string
- Errores: Codigos HTTP estandar (200, 201, 400, 404, 500)
- Patron: MVC con inyeccion de dependencias simple
"@

    InsertAfterText -searchText "2.2.3 Conclusion" -newContent @"
La guia de estilo establecio un estandar claro para el desarrollo del proyecto, facilitando la lectura y mantenibilidad del codigo. El uso de TypeScript con tipado estricto ayudo a prevenir errores en tiempo de compilacion.
"@

    # UNIDAD II - 2.3 Servicios en la nube
    InsertAfterText -searchText "2.3.1 Descripcion" -newContent @"
Identificacion y seleccion del servicio de infraestructura en la nube para el despliegue del sistema FlowPedidos, evaluando opciones como AWS, Azure, Google Cloud, y servicios PaaS como Render, Railway y Vercel.
"@

    InsertAfterText -searchText "2.3.2 Desarrollo" -newContent @"
EVALUACION DE SERVICIOS EN LA NUBE

1. Render.com (SELECCIONADO)
   - Plan: Free tier
   - Ventajas: Despliegue simple desde Git, SSL automatico, soporte Node.js
   - Ideal para: Proyectos academicos y prototipos

2. Railway.app
   - Alternativa similar a Render
   - Ventajas: Despliegue rapido, variables de entorno faciles

3. AWS EC2
   - Mas complejo pero mayor control
   - Ventajas: Escalabilidad, servicios integrados

SELECCION FINAL: Render.com
Razones: Despliegue gratuito, integracion con GitHub, SSL automatico, configuracion minima requerida para proyectos academicos.
"@

    # Introduccion General
    InsertAfterText -searchText "INTRODUCCION GENERAL" -newContent @"

PARCIAL I:
En esta unidad se abordaron los fundamentos de SCRUM para la gestion de proyectos agiles, la configuracion y uso de Git para control de versiones, y la creacion de diagramas de Gantt en Jira para la planificacion de sprints. Se definieron las epicas, historias de usuario y tareas para el proyecto FlowPedidos, estableciendo las bases para el desarrollo del sistema de automatizacion de pedidos.

PARCIAL II:
En esta unidad se desarrollo el proyecto FlowPedidos, un sistema integral para la automatizacion del flujo pedido-factura-despacho con asistencia de IA. Se implemento una API REST con Node.js, Express y TypeScript siguiendo la arquitectura MVC. Se integro un chatbot con deteccion de intenciones que permite al usuario consultar estadisticas, entender el flujo de automatizacion y recibir ayuda contextual. El sistema logra cero errores manuales mediante la generacion automatica de facturas y despachos al avanzar el estado de los pedidos.

PARCIAL III:
Contenido pendiente de desarrollar en la siguiente unidad.
"@

    # Conclusion General
    InsertAfterText -searchText "CONCLUSION GENERAL" -newContent @"
UNIDAD I:
Se aprendieron los fundamentos de SCRUM y su aplicacion en proyectos de desarrollo web. Se configuro Jira para la gestion del proyecto FlowPedidos y Git para el control de versiones.

UNIDAD II:
Se desarrollo exitosamente el sistema FlowPedidos, demostrando la capacidad de automatizar el flujo completo de procesamiento de pedidos con integracion de IA. El proyecto cumplio con el objetivo de cero errores manuales mediante la generacion automatica de facturas y despachos.

UNIDAD III:
Pendiente de desarrollar.
"@

    $doc.Save()
    Write-Host "OK - Portafolio actualizado exitosamente"
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
finally {
    if ($doc) { $doc.Close() }
    if ($word) { $word.Quit() }
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
