import moment from 'moment';

// Configurar idioma español (opcional)
moment.locale('es');

export const DateUtils = {
  // Formatear fechas
  formatDate: (date, format = 'DD/MM/YYYY') => {
    return moment(date).format(format);
  },

  formatDateTime: (date, format = 'DD/MM/YYYY HH:mm') => {
    return moment(date).format(format);
  },

  formatTime: (date, format = 'HH:mm') => {
    return moment(date).format(format);
  },

  // Fecha relativa
  fromNow: (date) => {
    return moment(date).fromNow();
  },

  // Validaciones
  isToday: (date) => {
    return moment(date).isSame(moment(), 'day');
  },

  isYesterday: (date) => {
    return moment(date).isSame(moment().subtract(1, 'day'), 'day');
  },

  isThisWeek: (date) => {
    return moment(date).isSame(moment(), 'week');
  },

  // Cálculos
  daysBetween: (startDate, endDate) => {
    return moment(endDate).diff(moment(startDate), 'days');
  },

  hoursBetween: (startDate, endDate) => {
    return moment(endDate).diff(moment(startDate), 'hours');
  },

  // Obtener rangos
  getStartOfDay: (date = new Date()) => {
    return moment(date).startOf('day').toDate();
  },

  getEndOfDay: (date = new Date()) => {
    return moment(date).endOf('day').toDate();
  },

  getStartOfWeek: (date = new Date()) => {
    return moment(date).startOf('week').toDate();
  },

  getEndOfWeek: (date = new Date()) => {
    return moment(date).endOf('week').toDate();
  },

  getStartOfMonth: (date = new Date()) => {
    return moment(date).startOf('month').toDate();
  },

  getEndOfMonth: (date = new Date()) => {
    return moment(date).endOf('month').toDate();
  },

  // Para gráficos
  getLast7Days: () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(moment().subtract(i, 'days').format('DD/MM'));
    }
    return days;
  },

  getLast30Days: () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      days.push(moment().subtract(i, 'days').format('DD/MM'));
    }
    return days;
  },

  // Convertir a ISO string para APIs
  toISOString: (date) => {
    return moment(date).toISOString();
  },

  // Crear fecha desde string
  parseDate: (dateString, format = 'DD/MM/YYYY') => {
    return moment(dateString, format).toDate();
  },
};