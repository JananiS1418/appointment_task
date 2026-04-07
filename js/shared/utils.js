export const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function todayString() {
  return toDateInputValue(new Date());
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function calendarGridStart(monthDate) {
  const firstDay = startOfMonth(monthDate);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());
  return start;
}

export function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatLongMonth(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatTableDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-GB");
}

export function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTimeRange(timeString, minutesToAdd = 15) {
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes) + minutesToAdd, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function filterAppointments(appointments, filters) {
  return appointments.filter((appointment) => {
    const matchesPatient = appointment.patientName.toLowerCase().includes(filters.patient);
    const matchesDoctor = appointment.doctorName.toLowerCase().includes(filters.doctor);
    const matchesFromDate = !filters.fromDate || appointment.date >= filters.fromDate;
    const matchesToDate = !filters.toDate || appointment.date <= filters.toDate;

    return matchesPatient && matchesDoctor && matchesFromDate && matchesToDate;
  });
}

export function validateAppointment(appointment) {
  const errors = {};

  Object.entries(appointment).forEach(([key, value]) => {
    if (key !== "id" && !value) {
      errors[key] = "This field is required.";
    }
  });

  if (appointment.date && appointment.time) {
    const timestamp = new Date(`${appointment.date}T${appointment.time}`);
    if (Number.isNaN(timestamp.getTime())) {
      errors.time = "Enter a valid time.";
    }
  }

  return errors;
}

