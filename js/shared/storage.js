const STORAGE_KEY = "mediboard_appointments_v2";

export function getAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedAppointments();
  } catch {
    return seedAppointments();
  }
}

export function saveAppointments(appointments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

export function upsertAppointment(appointment) {
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

export function removeAppointment(id) {
  const updated = getAppointments().filter((item) => item.id !== id);
  saveAppointments(updated);
  return updated;
}

export function findAppointment(id) {
  return getAppointments().find((item) => item.id === id) ?? null;
}

export function sortAppointments(appointments) {
  return [...appointments].sort((left, right) =>
    `${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`)
  );
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
      date: formatDate(today),
      time: "09:30",
      reason: "Skin check and treatment review.",
    },
    {
      id: crypto.randomUUID(),
      patientName: "Rahul Menon",
      doctorName: "Dr. Leena Joseph",
      hospitalName: "Northside Medical",
      specialty: "General Medicine",
      date: formatDate(nextDay),
      time: "14:15",
      reason: "Follow-up visit for fever and fatigue.",
    },
  ];

  saveAppointments(seeded);
  return seeded;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

