'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

export type Language = 'en' | 'es';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {},
  es: {
    'Language': 'Idioma',
    'English': 'Inglés',
    'Spanish': 'Español',
    'Dashboard': 'Tablero',
    'Patients': 'Pacientes',
    'Laboratory': 'Laboratorio',
    'Documents': 'Documentos',
    'Contacts': 'Contactos',
    'Schedules': 'Horarios',
    'Insurances': 'Seguros',
    'Complaints': 'Quejas',
    'Licenses': 'Licencias',
    'Medication': 'Medicamentos',
    'HR': 'Recursos Humanos',
    'Tickets': 'Tickets',
    'OnTime Dental Platform': 'Plataforma OnTime Dental',
    "Welcome to your clinic's control center": 'Bienvenido al centro de control de tu clínica',
    'Manage appointments, patient records, and staff scheduling with a secure, cloud-native experience.':
      'Administra citas, historiales de pacientes y programación del personal con una experiencia segura y nativa en la nube.',
    'Go to login': 'Ir al inicio de sesión',
    'Generate Report': 'Generar informe',
    'Dashboard summary': 'Resumen del tablero',
    'Welcome back, {name}.': 'Bienvenido de nuevo, {name}.',
    'team': 'equipo',
    'Generate Report': 'Generar informe',
    'Logout': 'Cerrar sesión',
    'Active Patients': 'Pacientes activos',
    'Scheduled Appointments': 'Citas programadas',
    'Treatment Acceptance': 'Aceptación de tratamientos',
    'Outstanding Balances': 'Saldos pendientes',
    '+5.2% vs last month': '+5.2% vs. el mes pasado',
    '12 today': '12 hoy',
    '+2.1% this week': '+2.1% esta semana',
    '-$3.1K since Monday': '-$3.1K desde el lunes',
    'Performance': 'Desempeño',
    'Monthly Production': 'Producción mensual',
    'Revenue trend across the last six months': 'Tendencia de ingresos durante los últimos seis meses',
    'Apr': 'Abr',
    'May': 'May',
    'Jun': 'Jun',
    'Jul': 'Jul',
    'Aug': 'Ago',
    'Sep': 'Sep',
    'Today': 'Hoy',
    'Upcoming Appointments': 'Próximas citas',
    'Confirm readiness and chair availability': 'Confirma la preparación y disponibilidad de sillones',
    'View schedule': 'Ver horario',
    'Invisalign Checkup': 'Revisión de Invisalign',
    'Implant Consultation': 'Consulta de implantes',
    'Hygiene Maintenance': 'Mantenimiento de higiene',
    'Whitening Touch-Up': 'Retoque de blanqueamiento',
    'Team pulse': 'Latido del equipo',
    'Activity Feed': 'Actividad del equipo',
    'Real-time updates across your team': 'Actualizaciones en tiempo real de tu equipo',
    'Announcements': 'Anuncios',
    "What's happening": 'Lo que está sucediendo',
    'Support': 'Soporte',
    'Need a quick overview?': '¿Necesitas un resumen rápido?',
    'Download the daily executive summary to share performance highlights with your leadership team.':
      'Descarga el resumen ejecutivo diario para compartir los aspectos destacados del desempeño con tu equipo directivo.',
    'Daily Briefing': 'Informe diario',
    'Autumn promotion launching Monday': 'Promoción de otoño se lanza el lunes',
    'Front office team to send reminder emails Friday. Include whitening upgrade for eligible patients.':
      'El equipo de recepción enviará correos de recordatorio el viernes. Incluye la mejora de blanqueamiento para pacientes elegibles.',
    'New OSHA documentation posted': 'Nueva documentación de OSHA publicada',
    'Please review and acknowledge by the end of the week in the compliance portal.':
      'Revisa y reconoce antes de que termine la semana en el portal de cumplimiento.',
    'New note added to Amelia Rivers': 'Nueva nota agregada a Amelia Rivers',
    'Treatment plan approved: Jonah Mills': 'Plan de tratamiento aprobado: Jonah Mills',
    'Invoice sent to Sophie Becker': 'Factura enviada a Sophie Becker',
    '12 minutes ago': 'Hace 12 minutos',
    '43 minutes ago': 'Hace 43 minutos',
    '1 hour ago': 'Hace 1 hora',
    'Marketing': 'Mercadeo',
    'Compliance': 'Cumplimiento',
    'Need help?': '¿Necesitas ayuda?',
    'Access our onboarding kit for carrier credentialing, claims status, and escalation contacts.':
      'Accede a nuestro kit de incorporación para credencialización de aseguradoras, estado de reclamaciones y contactos de escalación.',
    'View guide': 'Ver guía',
    'Insurance hub': 'Centro de seguros',
    'Manage payer documents': 'Gestiona documentos de aseguradoras',
    'Review carrier-specific documentation, credentialing requirements, and plan summaries. Switch between contracted insurers using the selector below.':
      'Revisa documentación específica de cada aseguradora, requisitos de credencialización y resúmenes de planes. Cambia entre aseguradoras contratadas usando el selector.',
    'Signed in as': 'Sesión iniciada como',
    'team': 'equipo',
    'Active insurer': 'Aseguradora activa',
    'Plans': 'Planes',
    'Plan documentation': 'Documentación del plan',
    'Download benefit summaries, credentialing packets, and fee schedules by plan.':
      'Descarga resúmenes de beneficios, paquetes de credencialización y listas de tarifas por plan.',
    'Export list': 'Exportar lista',
    'Reminders': 'Recordatorios',
    'Latest from {insurer}': 'Lo último de {insurer}',
    'Keep your team aligned with carrier notices and operational updates.':
      'Mantén a tu equipo alineado con avisos de la aseguradora y actualizaciones operacionales.',
    'Credentialing checklist': 'Lista de credencialización',
    'Verify license expiration dates': 'Verifica fechas de vencimiento de licencias',
    'Upload renewed documents at least 30 days before carrier review cycles.':
      'Carga los documentos renovados al menos 30 días antes de los ciclos de revisión de la aseguradora.',
    'Confirm tax ID and W-9': 'Confirma el ID tributario y el formulario W-9',
    'Ensure the latest W-9 is attached to avoid claim delays.':
      'Asegúrate de adjuntar el W-9 más reciente para evitar retrasos en reclamaciones.',
    'Track re-credentialing cycles': 'Supervisa los ciclos de recredencialización',
    'Set reminders for {insurer} at least 60 days in advance.': 'Configura recordatorios para {insurer} con al menos 60 días de anticipación.',
    'Need a quick overview?': '¿Necesitas un resumen rápido?',
    'Go': 'Ir',
    'Signed in as {name}': 'Sesión iniciada como {name}',
    'Directory tip': 'Sugerencia del directorio',
    'Keep contacts current': 'Mantén los contactos actualizados',
    'Ensure reception and operations teams know the fastest way to reach every location. Update extensions whenever new team members onboard.':
      'Asegura que los equipos de recepción y operaciones conozcan la forma más rápida de contactar cada ubicación. Actualiza las extensiones cuando ingresen nuevos miembros.',
    'Submit update': 'Enviar actualización',
    'Contacts hub': 'Centro de contactos',
    'Reach every OnTime team instantly': 'Contacta a todo el equipo de OnTime al instante',
    'Browse location extensions, clinic reception desks, and support center directories. Use the filters below to quickly surface the numbers you need.':
      'Explora extensiones por ubicación, recepciones de clínicas y directorios del centro de soporte. Usa los filtros para encontrar rápidamente los números que necesitas.',
    'Extensions': 'Extensiones',
    'Medical Centers': 'Centros médicos',
    'Transportation': 'Transporte',
    'Locations Search': 'Búsqueda de ubicaciones',
    'Corporate': 'Corporativo',
    'Front Desk': 'Recepción',
    'Offices': 'Consultorios',
    'Directory filters': 'Filtros del directorio',
    'Select an entity': 'Selecciona una entidad',
    'Select a group': 'Selecciona un grupo',
    'Go': 'Ir',
    'Results': 'Resultados',
    '{count} contacts matched your filters.': '{count} contactos coincidieron con tus filtros.',
    'Export directory': 'Exportar directorio',
    'Phone number': 'Número de teléfono',
    'Department': 'Departamento',
    'Employee': 'Empleado',
    'No contacts found for this group. Try a different filter.': 'No se encontraron contactos para este grupo. Prueba con otro filtro.',
    'Coming soon': 'Próximamente',
    '{section} directory is in progress': 'El directorio de {section} está en progreso',
    "We're preparing resources for this section. In the meantime, use the extensions view to reach our front desks and corporate teams.":
      'Estamos preparando recursos para esta sección. Mientras tanto, usa la vista de extensiones para contactar nuestras recepciones y equipos corporativos.',
    'Field tip': 'Sugerencia de campo',
    'Confirm GPS pins': 'Confirma los puntos GPS',
    "Update each clinic's coordinates whenever a new operatory opens. Accurate pins keep dispatch and patient text alerts on track.":
      'Actualiza las coordenadas de cada clínica cuando se abra un nuevo consultorio. Puntos precisos mantienen los avisos y mensajes de pacientes en orden.',
    'Share update': 'Compartir actualización',
    'Locations search': 'Búsqueda de ubicaciones',
    'Locate clinics across {company}': 'Ubica clínicas de {company}',
    '← Back to contacts': '← Volver a contactos',
    'HQ · {location}': 'Oficinas centrales · {location}',
    'Location name search': 'Buscar nombre de la ubicación',
    'Search clinics or cities': 'Buscar clínicas o ciudades',
    'Enter address or zip code': 'Ingresa dirección o código postal',
    'Filter by street, city, or ZIP': 'Filtrar por calle, ciudad o código postal',
    'Map': 'Mapa',
    'Satellite': 'Satélite',
    'Clear': 'Limpiar',
    'Interactive map': 'Mapa interactivo',
    '{count} locations matched your filters.': '{count} ubicaciones coincidieron con tus filtros.',
    'Address': 'Dirección',
    'Contact': 'Contacto',
    'Hours': 'Horario',
    'No locations matched your filters. Adjust the search terms to explore more clinics.':
      'Ninguna ubicación coincidió con tus filtros. Ajusta los términos de búsqueda para explorar más clínicas.',
    'Clinic directory': 'Directorio de clínicas',
    '{count} results': '{count} resultados',
    'Export': 'Exportar',
    'No clinics available for the current filters.': 'No hay clínicas disponibles para los filtros actuales.',
    'Operations': 'Operaciones',
    'Schedules': 'Horarios',
    'Review staffing coverage for front desk and chair-side teams. Drag names between clinics and days to simulate deployment changes before publishing to the organization.':
      'Revisa la cobertura del personal para recepción y equipos clínicos. Arrastra nombres entre clínicas y días para simular cambios antes de publicarlos.',
    'Front Desk': 'Recepción',
    "Front Desks and Assistants' Schedule": 'Horario de recepciones y asistentes',
    'Drag & Drop Enabled': 'Arrastrar y soltar habilitado',
    'Position': 'Puesto',
    'Unassigned': 'Sin asignar',
    'Drag': 'Arrastrar',
    'Clinical': 'Clínico',
    "Doctor's Schedule": 'Horario de doctores',
    'Clinic Coverage': 'Cobertura de clínica',
    'Day': 'Día',
    'Operations Command Center': 'Centro de comando operativo',
    'Monitor the production floor, shipping timelines and clinic satisfaction at a glance. The dashboard surfaces key actions for the fabrication team and keeps leadership aligned with today\'s volume.':
      'Monitorea el piso de producción, los tiempos de envío y la satisfacción de las clínicas de un vistazo. El tablero destaca acciones clave para el equipo de fabricación y mantiene al liderazgo alineado con el volumen de hoy.',
    'Cases this month': 'Casos este mes',
    'Goal 400 · Period through Sept 18': 'Meta 400 · Período hasta el 18 de septiembre',
    '+12.5% vs last month': '+12.5% vs. el mes pasado',
    'In transit to clinics': 'En tránsito a las clínicas',
    'Across 12 clinics · Avg transit 1.8 days': 'En 12 clínicas · Promedio de tránsito 1.8 días',
    '-4 vs last week': '-4 vs. la semana pasada',
    'Rush / priority cases': 'Casos urgentes / prioritarios',
    '8 due today · 3 digital impressions pending': '8 vencen hoy · 3 impresiones digitales pendientes',
    '+5 in last 24 hours': '+5 en las últimas 24 horas',
    'Remake ratio': 'Índice de rehacer',
    'Target 3.0% · 10 remakes closed this month': 'Meta 3.0 % · 10 rehacer cerrados este mes',
    '-0.6 pts vs target': '-0.6 pts vs. la meta',
    'Case mix by category': 'Mezcla de casos por categoría',
    '{total} active cases · includes remakes': '{total} casos activos · incluye rehacer',
    'Updated 15 min ago': 'Actualizado hace 15 min',
    'Rising demand': 'Demanda en aumento',
    'Slight dip · review scheduling': 'Ligera baja · revisar programación',
    'Holding steady': 'Se mantiene estable',
    'Transit overview': 'Resumen de tránsito',
    '{count} cases in motion': '{count} casos en movimiento',
    'Courier board synced at 1:10 PM · Next scan in 20 minutes.': 'Tablero de mensajería sincronizado a la 1:10 p. m. · Próximo escaneo en 20 minutos.',
    'Departure {time}': 'Salida {time}',
    'Production pipeline': 'Pipeline de producción',
    'Live work-in-progress load': 'Carga de trabajo en progreso en vivo',
    'Technician schedule locked · auto-refresh every 5 minutes.': 'Horario de técnicos bloqueado · actualización automática cada 5 minutos.',
    'CAD Design': 'Diseño CAD',
    'Milling / Printing': 'Fresado / Impresión',
    'Finishing & QC': 'Acabado y control de calidad',
    'Packing & Dispatch': 'Empaque y despacho',
    'Digital team processed 57 scans overnight.': 'El equipo digital procesó 57 escaneos durante la noche.',
    'Zirconia mill 2 scheduled downtime at 4:30 PM.': 'Molino de zirconia 2 con parada programada a las 4:30 p. m.',
    '3 remakes waiting for shade confirmation.': '3 rehacer esperando confirmación de tono.',
    'Route D consolidated · Courier pickup at 5:15 PM.': 'Ruta D consolidada · Recolección del mensajero a las 5:15 p. m.',
    'On-time delivery': 'Entrega puntual',
    'Average turnaround': 'Tiempo promedio de respuesta',
    'Digital impressions': 'Impresiones digitales',
    'Production health, KPIs and live operations overview.': 'Salud de producción, KPI y vista de operaciones en vivo.',
    'Lookup cases across labs, clinics and statuses.': 'Busca casos en laboratorios, clínicas y estados.',
    'Laboratory Lookup': 'Consulta de laboratorio',
    'Filter by lab, clinic, doctor or procedure to locate an active case. The data below is sample information to validate the workflow.':
      'Filtra por laboratorio, clínica, odontólogo o procedimiento para localizar un expediente activo. Los datos a continuación son de prueba para validar el flujo de trabajo.',
    'Work-in-progress by stage and technician workload.': 'Trabajo en progreso por etapa y carga del técnico.',
    'Routes to clinics, courier SLAs and delivery ETAs.': 'Rutas a clínicas, SLA del mensajero y tiempos estimados de entrega.',
    'Root causes, remake approvals and satisfaction trends.': 'Causas raíz, aprobaciones de rehacer y tendencias de satisfacción.',
    'Statements, adjustments and COD tracking.': 'Estados de cuenta, ajustes y seguimiento de cobros contra entrega.',
    'Planned': 'Planificado',
    'Case Search': 'Búsqueda de casos',
    'Case Search workspace description': 'El espacio de búsqueda de casos está en nuestro plan. Indica al equipo de producto qué flujos de trabajo deseas agilizar aquí.',
    'Case ID': 'ID de caso',
    'LAB-10XXX': 'LAB-10XXX',
    'Lab': 'Laboratorio',
    'All': 'Todos',
    'Clinic': 'Clínica',
    'Any': 'Cualquiera',
    'Patient first name': 'Nombre del paciente',
    'First name': 'Nombre',
    'Patient last name': 'Apellido del paciente',
    'Last name': 'Apellido',
    'Doctor': 'Doctor',
    'Doctor placeholder': 'Dr. o Dra.',
    'Procedure': 'Procedimiento',
    'Procedure placeholder': 'Tipo de trabajo',
    'Search': 'Buscar',
    'Search by name': 'Buscar por nombre',
    'Please perform a search.': 'Debe realizar una búsqueda.',
    'One case found.': 'Se encontró 1 caso.',
    '{count} cases found.': 'Se encontraron {count} casos.',
    'No cases were found with the selected criteria.': 'No se encontraron casos con los criterios seleccionados.',
    'Select a filter and press "Search" to display results.': 'Selecciona un criterio y presiona "Buscar" para ver los resultados.',
    'Patient': 'Paciente',
    'Birthdate': 'Nacimiento',
    'Reservation': 'Reserva',
    'Status': 'Estado',
    'Action': 'Acción',
    'View details': 'Ver detalle',
    'Enter at least a first or last name to search.': 'Ingresa al menos un nombre o apellido para buscar.',
    'This workspace is on our roadmap. Let the product team know what workflows you\'d like to streamline here.':
      'Este espacio de trabajo está en nuestra hoja de ruta. Indica al equipo de producto qué flujos de trabajo deseas optimizar aquí.',
    'Module in discovery': 'Módulo en descubrimiento',
    'In production': 'En producción',
    'In transit': 'En tránsito',
    'Completed': 'Completado',
    'In planning': 'En planificación',
    'Signed in as {name}.': 'Sesión iniciada como {name}.',
    'Filter library': 'Filtrar biblioteca',
    'Choose the business entity followed by the document group. Apply the selection to refresh the available files.':
      'Elige la entidad y luego el grupo de documentos. Aplica la selección para refrescar los archivos disponibles.',
    'Select Entity': 'Selecciona entidad',
    'Select entity...': 'Selecciona una entidad...',
    'Select Group': 'Selecciona grupo',
    'Select group...': 'Selecciona un grupo...',
    'Select entity first': 'Selecciona una entidad primero',
    'Apply': 'Aplicar',
    'Available documents': 'Documentos disponibles',
    'Apply a filter to load documents for download.': 'Aplica un filtro para cargar documentos para descarga.',
    'item': 'elemento',
    'items': 'elementos',
    'Showing {count} {items} for {entity} · {group}': 'Mostrando {count} {items} para {entity} · {group}',
    'ID': 'ID',
    'Title': 'Título',
    'Version': 'Versión',
    'Date': 'Fecha',
    'Description': 'Descripción',
    'Download': 'Descargar',
    'No documents were found for the selected group.': 'No se encontraron documentos para el grupo seleccionado.',
    'No records to display. Apply a filter to load documents.': 'No hay registros para mostrar. Aplica un filtro para cargar documentos.',
    'Documents': 'Documentos',
    'Select an entity and group to view downloadable resources.': 'Selecciona una entidad y un grupo para ver recursos descargables.',
    'Loading...': 'Cargando...',
    'Patient Welcome Packet (English)': 'Paquete de bienvenida para pacientes (inglés)',
    'Patient Welcome Packet (Spanish)': 'Paquete de bienvenida para pacientes (español)',
    'Time-Off Request Policy': 'Política de solicitud de tiempo libre',
    'Employee Acknowledgement Form': 'Formulario de acuse de recibo del empleado',
    'CCL Package': 'Paquete CCL',
    'Visit Records': 'Registros de visitas',
    'OSHA Readiness Binder': 'Carpeta de preparación OSHA',
    'Vendor Ordering Guide': 'Guía de pedidos de proveedores',
    'Inventory Count Template': 'Plantilla de conteo de inventario',
    'Safety Training Sign-Off': 'Confirmación de capacitación en seguridad',
    'Directory tip': 'Sugerencia del directorio',
    'Signed in as {name}': 'Sesión iniciada como {name}',
    'Log out': 'Cerrar sesión',
    'Signed in as {name}.' : 'Sesión iniciada como {name}.',
    'Reservations Control Center': 'Centro de control de reservaciones',
    'Billing': 'Facturación',
    'Billing Control Center': 'Centro de control de facturación',
    'Review production invoices by clinic, procedure, and totals. Filter by company and date range to align collections with operations.':
      'Revisa las facturas de producción por clínica, procedimiento y totales. Filtra por compañía y rango de fechas para alinear las cobranzas con operaciones.',
    'Company': 'Compañía',
    'Billing report from {start} to {end}': 'Informe de facturación del {start} al {end}',
    'Start date': 'Fecha de inicio',
    'End date': 'Fecha de fin',
    'Reports': 'Reportes',
    'Legacy billing': 'Facturación histórica',
    'Quantity': 'Cantidad',
    'Total amount': 'Monto total',
    'Actions': 'Acciones',
    'Total by office': 'Total por oficina',
    'Grand total': 'Gran total',
    'Download detail': 'Descargar detalle',
    'No billing records found for the selected period.': 'No se encontraron registros de facturación para el período seleccionado.',
    'Start date must be on or before end date.': 'La fecha de inicio debe ser anterior o igual a la fecha de fin.',
    'Procedures in period': 'Procedimientos en el período',
    'Units billed': 'Unidades facturadas',
    'Total amount billed': 'Monto total facturado',
    'Clinics with activity': 'Clínicas con actividad',
    'View': 'Vista',
    'Updated at {time}': 'Actualizado a las {time}',
    'Coordinate laboratory production and deliveries with an integrated view of active cases. Switch between monthly, weekly, and daily modes to anticipate workload by procedure.':
      'Coordine la producción y entregas del laboratorio con una vista integrada de los casos activos. Cambie entre los modos mensual, semanal y diario para anticipar la carga de trabajo por procedimiento.',
    'Cases this month': 'Casos del mes',
    'Since {month}': 'Desde {month}',
    'In fabrication': 'En fabricación',
    'Active CAD/CAM and finishing cases': 'Casos activos en CAD/CAM y terminación',
    'Scheduled': 'Programados',
    'Cases confirmed for production': 'Casos confirmados para producción',
    'Delivered': 'Entregados',
    'Includes completed routes': 'Incluye rutas completadas',
    'Calendar': 'Calendario',
    'Case agenda': 'Agenda de casos',
    'Month': 'Mes',
    'Week': 'Semana',
    'Day': 'Día',
    'Previous period': 'Periodo anterior',
    'Next period': 'Periodo siguiente',
    'View day': 'Ver día',
    'No scheduled cases': 'Sin casos programados',
    'Previous day': 'Día anterior',
    'Next day': 'Día siguiente',
    'Case': 'Caso',
    'Schedule': 'Horario',
    'Doctor': 'Doctor',
    'Patient': 'Paciente',
    'Clinic': 'Clínica',
    'Assigned equipment: {equipment}': 'Equipo asignado: {equipment}',
    'View details': 'Ver detalles',
    'No cases scheduled for this day.': 'No hay casos programados para este día.',
    'Procedure distribution': 'Distribución por procedimiento',
    'Scheduled cases this month': 'Casos programados este mes',
    'No procedures assigned yet.': 'Aún no hay procedimientos asignados.',
    'Case status': 'Estado de los casos',
    'Pending confirmation': 'Pendientes de confirmación',
    'Recommendation': 'Recomendación',
    'Reserve additional blocks for partial prosthetics on Thursdays: next week exceeds the operational threshold.':
      'Reserve bloques adicionales para prótesis parciales los jueves: la semana entrante supera el umbral operativo.',
    'Ready to ship': 'Listo para envío',
    'case': 'caso',
    'cases': 'casos',
    'Monday': 'Lunes',
    'Tuesday': 'Martes',
    'Wednesday': 'Miércoles',
    'Thursday': 'Jueves',
    'Friday': 'Viernes',
    'Saturday': 'Sábado',
    'Sunday': 'Domingo',
    'Support Hub': 'Centro de soporte',
    'Monitor live requests, prioritize escalations, and deliver quick resolutions across every OnTime Dental clinic.':
      'Supervisa solicitudes en vivo, prioriza las escalaciones y entrega resoluciones rápidas en cada clínica OnTime Dental.',
    'Average satisfaction': 'Satisfacción promedio',
    'Based on last 30 closed tickets': 'Basado en los últimos 30 tickets cerrados',
    'Active tickets': 'Tickets activos',
    'New, in progress, and waiting requests': 'Solicitudes nuevas, en progreso y en espera',
    'Urgent escalations': 'Escalaciones urgentes',
    'Equipment failures and clinic outages': 'Fallas de equipo y caídas de clínicas',
    'Awaiting clinics': 'Clínicas en espera',
    'Tickets pending feedback or confirmation': 'Tickets pendientes de retroalimentación o confirmación',
    'Response playbook': 'Guía de respuesta',
    'Trigger automatic alerts for urgent tickets and share live updates with clinic leaders.':
      'Activa alertas automáticas para tickets urgentes y comparte actualizaciones en vivo con los líderes de clínica.',
    'Open escalation matrix': 'Abrir matriz de escalación',
    'Live queue': 'Fila en vivo',
    'Filter by status, drill into tickets, and follow resolution updates in real time.':
      'Filtra por estado, profundiza en los tickets y sigue las actualizaciones de resolución en tiempo real.',
    'Filter': 'Filtro',
    'Search tickets': 'Buscar tickets',
    'No tickets found. Try adjusting your filters or creating a new ticket below.':
      'No se encontraron tickets. Ajusta tus filtros o crea un nuevo ticket abajo.',
    'Priority': 'Prioridad',
    'Priority · {priority}': 'Prioridad · {priority}',
    'Requester: {requester}': 'Solicitante: {requester}',
    'Clinic: {clinic}': 'Clínica: {clinic}',
    'Channel: {channel}': 'Canal: {channel}',
    'Created': 'Creado',
    'Target Resolution': 'Resolución objetivo',
    'Updates': 'Actualizaciones',
    '{count} touchpoints logged': '{count} puntos de contacto registrados',
    'Create new ticket': 'Crear nuevo ticket',
    'Log a clinic request. A coordinator will triage it instantly and send updates to the requester.':
      'Registra una solicitud de clínica. Un coordinador la clasificará al instante y enviará actualizaciones al solicitante.',
    'Subject': 'Asunto',
    'Describe the issue': 'Describe el problema',
    'Requester': 'Solicitante',
    'Clinic contact': 'Contacto de la clínica',
    'Clinic / Location': 'Clínica / Ubicación',
    'Where is this happening?': '¿Dónde está ocurriendo esto?',
    'Category': 'Categoría',
    'IT Support': 'Soporte de TI',
    'Equipment': 'Equipamiento',
    'Facilities': 'Instalaciones',
    'Low': 'Baja',
    'Medium': 'Media',
    'High': 'Alta',
    'Urgent': 'Urgente',
    'Detailed description': 'Descripción detallada',
    'Provide context, impacted patients, and any steps already taken.':
      'Proporciona contexto, pacientes afectados y pasos ya realizados.',
    'By submitting you will notify the operations coordination team and start the SLA clock.':
      'Al enviar, notificarás al equipo de coordinación de operaciones e iniciarás el reloj del SLA.',
    'Log ticket': 'Registrar ticket',
    'Status radar': 'Radar de estados',
    'Snapshot of volume by lifecycle stage.': 'Instantánea del volumen por etapa del ciclo de vida.',
    '{percentage}% of tickets': '{percentage}% de los tickets',
    'Operations bulletin': 'Boletín de operaciones',
    'Digital workflows': 'Flujos de trabajo digitales',
    'Every urgent ticket sends SMS alerts to regional directors for faster acknowledgment.':
      'Cada ticket urgente envía alertas SMS a los directores regionales para un reconocimiento más rápido.',
    'Sunrise huddles': 'Reuniones al amanecer',
    'Share overnight ticket summaries with on-call dentists before the first appointment block.':
      'Comparte resúmenes nocturnos de tickets con los dentistas de guardia antes del primer bloque de citas.',
    'Learning loop': 'Bucle de aprendizaje',
    'Resolved tickets with high satisfaction feed back into our service playbook templates.':
      'Los tickets resueltos con alta satisfacción alimentan nuestros modelos de guías de servicio.',
    'VIP monitoring': 'Monitoreo VIP',
    'Enable concierge tracking for executives, urgent surgical cases, and enterprise partners.':
      'Habilita el seguimiento de concierge para ejecutivos, casos quirúrgicos urgentes y socios empresariales.',
    'Launch white-glove view': 'Abrir vista de atención exclusiva',
    'New': 'Nuevo',
    'In Progress': 'En progreso',
    'Waiting on Response': 'En espera de respuesta',
    'Resolved': 'Resuelto',
    'Awaiting triage': 'En espera de clasificación',
    'Actively being worked': 'Atendido activamente',
    'Pending external action': 'Pendiente de acción externa',
    'Completed and documented': 'Completado y documentado',
    'Please review and acknowledge by the end of the week in the compliance portal.': 'Revisa y reconoce antes de que termine la semana en el portal de cumplimiento.'
  }
};

type TranslateOptions = Record<string, string | number>;

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('ontime.language');
    if (stored === 'en' || stored === 'es') {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ontime.language', nextLanguage);
    }
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage
    }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslations() {
  const { language } = useLanguage();

  const translate = useCallback(
    (phrase: string, replacements?: TranslateOptions) => {
      const dictionary = translations[language];
      const template = language === 'en' ? phrase : dictionary[phrase] ?? phrase;

      if (!replacements) {
        return template;
      }

      return Object.entries(replacements).reduce<string>((accumulator, [key, value]) => {
        return accumulator.replaceAll(`{${key}}`, String(value));
      }, template);
    },
    [language]
  );

  return { language, t: translate };
}

export const translationMap = translations;
