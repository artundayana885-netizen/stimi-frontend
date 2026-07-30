import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  es: {
    // Común / navegación
    'nav.dashboard': 'Panel Principal',
    'nav.unit': 'Mi Unidad',
    'nav.newReport': 'Nuevo Informe',
    'nav.notifications': 'Notificaciones',
    'nav.settings': 'Configuración',
    'nav.logout': 'Cerrar Sesión',
    'common.back': 'Volver',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.viewAll': 'Ver todos',
    'common.viewLess': 'Ver menos',
    'common.remove': 'Quitar',
    'common.viewFile': 'Ver archivo',

    // UnitView
    'unit.controlPanel': 'Panel de Control',
    'unit.title': 'Mi Cumplimiento',
    'unit.subtitle': 'Análisis detallado de tu desempeño',
    'unit.alertTitle': 'Período de Carga de Informes',
    'unit.alertBody': 'La plataforma estará habilitada para subir informes del 1 al 28 de cada mes. Asegúrate de entregar tus informes a tiempo.',
    'unit.statCompliance': 'Cumplimiento General',
    'unit.statApproved': 'Informes Aprobados',
    'unit.statOnTime': 'Entregas a Tiempo',
    'unit.statQuality': 'Promedio Calidad',
    'unit.recentReports': 'Informes Recientes',
    'unit.recentReportsSubtitle': 'Últimos informes entregados y su estado',
    'unit.importantDates': 'Fechas Importantes',
    'unit.importantDatesSubtitle': 'Establecidas por coordinación',
    'unit.deadlineLabel': 'Fecha límite entregas mensuales',
    'unit.deadlineValue': '28 de cada mes',
    'unit.urgent': '¡Urgente!',
    'unit.monthlyCompliance': 'Cumplimiento Mensual',
    'unit.statusApproved': 'Aprobado',
    'unit.statusToFix': 'A Corregir',

    // NewReport
    'newReport.title': 'Nuevo Informe',
    'newReport.subtitle': 'Selecciona el tipo de informe y carga el documento ya diligenciado',
    'newReport.instructions': 'Instrucciones',
    'newReport.instr1': 'Los informes deben ser entregados entre el día 1 y 28 de cada mes',
    'newReport.instr2': 'El informe se elabora fuera de la plataforma; aquí solo lo cargas para validación',
    'newReport.instr3': 'Asegúrate de completar todos los campos obligatorios y adjuntar el documento principal',
    'newReport.instr4': 'Puedes revisar el archivo con "Ver archivo" antes de enviarlo',
    'newReport.instr5': 'Supervisión revisará que el informe cumpla con todos los parámetros antes de aprobarlo',
    'newReport.gcTitle': 'Gestión Contractual (GC)',
    'newReport.gcDesc': 'Carga tu informe de gestión contractual con evidencias de las 17 obligaciones establecidas',
    'newReport.gfTitle': 'Gestión Financiera (GF)',
    'newReport.gfDesc': 'Carga tu informe de gestión financiera con planillas de pago y comprobantes',
    'newReport.whatToUpload': 'Qué debes cargar:',
    'newReport.uploadGc': 'Cargar Informe GC',
    'newReport.uploadGf': 'Cargar Informe GF',

    // Notifications
    'notif.center': 'Centro de Notificaciones',
    'notif.title': 'Notificaciones',
    'notif.subtitle': 'Mantente al día con las últimas actualizaciones y alertas',
    'notif.all': 'Todas',
    'notif.unread': 'No leídas',
    'notif.alerts': 'Alertas',
    'notif.markRead': 'Marcar como leída',
    'notif.delete': 'Eliminar',
    'notif.empty': 'No hay notificaciones',

    // ReportGC / ReportGF
    'report.gcTitle': 'Informe de Gestión Contractual (GC)',
    'report.gcSubtitle': 'Carga tu informe ya diligenciado para que sea validado por supervisión',
    'report.gfTitle': 'Informe de Gestión Financiera (GF)',
    'report.gfSubtitle': 'Carga tu informe para validación',
    'report.generalInfo': 'Información General',
    'report.month': 'Mes del informe',
    'report.selectMonth': 'Selecciona un mes',
    'report.year': 'Año',
    'report.documentGc': 'Documento del Informe GC',
    'report.documentGf': 'Documento del Informe GF',
    'report.documentGcDesc': 'Sube el informe completo, ya diligenciado, con sus evidencias',
    'report.documentGfDesc': 'Sube el informe completo, ya diligenciado',
    'report.clickToUploadGc': 'Haz clic para cargar el informe GC',
    'report.clickToUploadGf': 'Haz clic para cargar el informe GF',
    'report.fileHint': 'PDF o Word (máx. 20MB)',
    'report.submit': 'Enviar para Validación',
    'report.errorFields': 'Por favor completa el mes y año del informe',
    'report.errorFileGc': 'Por favor carga el documento del informe GC',
    'report.errorFileGf': 'Por favor carga el documento del informe GF',
    'report.successGc': '✅ Informe GC enviado para validación',
    'report.successGf': '✅ Informe GF enviado para validación',
    'report.loaded': '✓ Informe cargado:',

    'months': ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],

    // Sidebar coordinador
    'sidebar.coordPortal': 'Portal Coordinador',
    'sidebar.systemLabel': 'Sistema de Gestión',
    'sidebar.principal': 'Principal',
    'sidebar.tools': 'Herramientas',
    'sidebar.reviewDocs': 'Revisar Documentos',
    'sidebar.sendNotifications': 'Enviar Notificaciones',
    'sidebar.requirements': 'Requisitos',
    'sidebar.manageRoles': 'Administrar Roles',
    'sidebar.aiAssistant': 'Asistente IA',
    'sidebar.trash': 'Papelera',
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.unit': 'My Unit',
    'nav.newReport': 'New Report',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    'nav.logout': 'Log Out',
    'common.back': 'Back',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.viewAll': 'View all',
    'common.viewLess': 'View less',
    'common.remove': 'Remove',
    'common.viewFile': 'View file',

    'unit.controlPanel': 'Control Panel',
    'unit.title': 'My Compliance',
    'unit.subtitle': 'Detailed analysis of your performance',
    'unit.alertTitle': 'Report Upload Period',
    'unit.alertBody': 'The platform will be open for report uploads from the 1st to the 28th of each month. Make sure to submit your reports on time.',
    'unit.statCompliance': 'Overall Compliance',
    'unit.statApproved': 'Approved Reports',
    'unit.statOnTime': 'On-Time Submissions',
    'unit.statQuality': 'Average Quality',
    'unit.recentReports': 'Recent Reports',
    'unit.recentReportsSubtitle': 'Latest submitted reports and their status',
    'unit.importantDates': 'Important Dates',
    'unit.importantDatesSubtitle': 'Set by coordination',
    'unit.deadlineLabel': 'Monthly submission deadline',
    'unit.deadlineValue': '28th of each month',
    'unit.urgent': 'Urgent!',
    'unit.monthlyCompliance': 'Monthly Compliance',
    'unit.statusApproved': 'Approved',
    'unit.statusToFix': 'Needs Revision',

    'newReport.title': 'New Report',
    'newReport.subtitle': 'Select the report type and upload the completed document',
    'newReport.instructions': 'Instructions',
    'newReport.instr1': 'Reports must be submitted between the 1st and 28th of each month',
    'newReport.instr2': 'The report is prepared outside the platform; here you only upload it for validation',
    'newReport.instr3': 'Make sure to complete all required fields and attach the main document',
    'newReport.instr4': 'You can review the file with "View file" before submitting',
    'newReport.instr5': 'Supervision will review that the report meets all requirements before approving it',
    'newReport.gcTitle': 'Contract Management (GC)',
    'newReport.gcDesc': 'Upload your contract management report with evidence for the 17 established obligations',
    'newReport.gfTitle': 'Financial Management (GF)',
    'newReport.gfDesc': 'Upload your financial management report with payment forms and receipts',
    'newReport.whatToUpload': 'What you need to upload:',
    'newReport.uploadGc': 'Upload GC Report',
    'newReport.uploadGf': 'Upload GF Report',

    'notif.center': 'Notification Center',
    'notif.title': 'Notifications',
    'notif.subtitle': 'Stay up to date with the latest updates and alerts',
    'notif.all': 'All',
    'notif.unread': 'Unread',
    'notif.alerts': 'Alerts',
    'notif.markRead': 'Mark as read',
    'notif.delete': 'Delete',
    'notif.empty': 'No notifications',

    'report.gcTitle': 'Contract Management Report (GC)',
    'report.gcSubtitle': 'Upload your completed report so supervision can validate it',
    'report.gfTitle': 'Financial Management Report (GF)',
    'report.gfSubtitle': 'Upload your report for validation',
    'report.generalInfo': 'General Information',
    'report.month': 'Report month',
    'report.selectMonth': 'Select a month',
    'report.year': 'Year',
    'report.documentGc': 'GC Report Document',
    'report.documentGf': 'GF Report Document',
    'report.documentGcDesc': 'Upload the full completed report with its evidence',
    'report.documentGfDesc': 'Upload the full completed report',
    'report.clickToUploadGc': 'Click to upload the GC report',
    'report.clickToUploadGf': 'Click to upload the GF report',
    'report.fileHint': 'PDF or Word (max. 20MB)',
    'report.submit': 'Submit for Validation',
    'report.errorFields': 'Please complete the report month and year',
    'report.errorFileGc': 'Please upload the GC report document',
    'report.errorFileGf': 'Please upload the GF report document',
    'report.successGc': '✅ GC report submitted for validation',
    'report.successGf': '✅ GF report submitted for validation',
    'report.loaded': '✓ Report uploaded:',

    'months': ['January','February','March','April','May','June','July','August','September','October','November','December'],

    // Coordinator sidebar
    'sidebar.coordPortal': 'Coordinator Portal',
    'sidebar.systemLabel': 'Management System',
    'sidebar.principal': 'Main',
    'sidebar.tools': 'Tools',
    'sidebar.reviewDocs': 'Review Documents',
    'sidebar.sendNotifications': 'Send Notifications',
    'sidebar.requirements': 'Requirements',
    'sidebar.manageRoles': 'Manage Roles',
    'sidebar.aiAssistant': 'AI Assistant',
    'sidebar.trash': 'Trash',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('app_language') || 'es';
    } catch {
      return 'es';
    }
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    try { localStorage.setItem('app_language', lang); } catch {}
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    const dict = translations[language] || translations.es;
    const value = dict[key];
    if (value === undefined) {
      // Si falta la traducción, no rompe la UI: cae a español como respaldo
      return translations.es[key] ?? key;
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
  return ctx;
}