(function () {
  const STORAGE_KEY = "mediboard_appointments_v2";

  function saveAppointments(appointments) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  }

  function formatSeedDate(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function seedAppointments() {
    const today = new Date();
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);

    const seeded = [
      {
        id: crypto.randomUUID(),
        patientName: "Ananya Rao",
        doctorName: "Dr. Kiran Mehta",
        hospitalName: "Harbor Care Clinic",
        specialty: "Dermatology",
        date: formatSeedDate(today),
        time: "09:30",
        reason: "Skin check and treatment review.",
      },
      {
        id: crypto.randomUUID(),
        patientName: "Rahul Menon",
        doctorName: "Dr. Leena Joseph",
        hospitalName: "Northside Medical",
        specialty: "General Medicine",
        date: formatSeedDate(nextDay),
        time: "14:15",
        reason: "Follow-up visit for fever and fatigue.",
      },
    ];

    saveAppointments(seeded);
    return seeded;
  }

  function getAppointments() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : seedAppointments();
    } catch {
      return seedAppointments();
    }
  }

  function upsertAppointment(appointment) {
    const appointments = getAppointments();
    const index = appointments.findIndex((item) => item.id === appointment.id);

    if (index >= 0) {
      appointments[index] = appointment;
    } else {
      appointments.push(appointment);
    }

    const sorted = sortAppointments(appointments);
    saveAppointments(sorted);
    return sorted;
  }

  function removeAppointment(id) {
    const updated = getAppointments().filter((item) => item.id !== id);
    saveAppointments(updated);
    return updated;
  }

  function findAppointment(id) {
    return getAppointments().find((item) => item.id === id) || null;
  }

  function sortAppointments(appointments) {
    return [...appointments].sort((left, right) =>
      `${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`)
    );
  }

  const WEEKDAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  function todayString() {
    return toDateInputValue(new Date());
  }

  function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function calendarGridStart(monthDate) {
    const firstDay = startOfMonth(monthDate);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());
    return start;
  }

  function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatLongMonth(date) {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  function formatTableDate(dateString) {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-GB");
  }

  function formatTime(timeString) {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatTimeRange(timeString, minutesToAdd = 15) {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes) + minutesToAdd, 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function filterAppointments(appointments, filters) {
    return appointments.filter((appointment) => {
      const matchesPatient = appointment.patientName.toLowerCase().includes(filters.patient);
      const matchesDoctor = appointment.doctorName.toLowerCase().includes(filters.doctor);
      const matchesFromDate = !filters.fromDate || appointment.date >= filters.fromDate;
      const matchesToDate = !filters.toDate || appointment.date <= filters.toDate;

      return matchesPatient && matchesDoctor && matchesFromDate && matchesToDate;
    });
  }

  function validateAppointment(appointment) {
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

  window.AppointmentApp = {
    WEEKDAYS,
    getAppointments,
    upsertAppointment,
    removeAppointment,
    findAppointment,
    todayString,
    startOfMonth,
    calendarGridStart,
    toDateInputValue,
    formatLongMonth,
    formatTableDate,
    formatTime,
    formatTimeRange,
    escapeHtml,
    getQueryParam,
    filterAppointments,
    validateAppointment,
  };
})();
