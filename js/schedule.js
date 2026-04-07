const { findAppointment, upsertAppointment, getQueryParam, validateAppointment } = window.AppointmentApp;

const editId = getQueryParam("id");
const editingAppointment = editId ? findAppointment(editId) : null;

const elements = {
  pageTitle: document.getElementById("pageTitle"),
  form: document.getElementById("appointmentForm"),
  appointmentId: document.getElementById("appointmentId"),
  patientName: document.getElementById("patientName"),
  doctorName: document.getElementById("doctorName"),
  hospitalName: document.getElementById("hospitalName"),
  specialty: document.getElementById("specialty"),
  appointmentDate: document.getElementById("appointmentDate"),
  appointmentTime: document.getElementById("appointmentTime"),
  reason: document.getElementById("reason"),
};

bootstrapForm();
elements.form.addEventListener("submit", handleSubmit);
setupPickerField(elements.appointmentDate, "date");
setupPickerField(elements.appointmentTime, "time");

function bootstrapForm() {
  if (editingAppointment) {
    elements.pageTitle.textContent = "Edit Appointment";
    elements.appointmentId.value = editingAppointment.id;
    elements.patientName.value = editingAppointment.patientName;
    elements.doctorName.value = editingAppointment.doctorName;
    elements.hospitalName.value = editingAppointment.hospitalName;
    elements.specialty.value = editingAppointment.specialty;
    setFieldValue(elements.appointmentDate, editingAppointment.date);
    setFieldValue(elements.appointmentTime, editingAppointment.time);
    elements.reason.value = editingAppointment.reason;
  }
}

function handleSubmit(event) {
  event.preventDefault();

  const appointment = {
    id: elements.appointmentId.value || crypto.randomUUID(),
    patientName: elements.patientName.value.trim(),
    doctorName: elements.doctorName.value.trim(),
    hospitalName: elements.hospitalName.value.trim(),
    specialty: elements.specialty.value.trim(),
    date: elements.appointmentDate.value,
    time: elements.appointmentTime.value,
    reason: elements.reason.value.trim(),
  };

  const errors = validateAppointment(appointment);
  renderErrors(errors);

  if (Object.keys(errors).length > 0) {
    return;
  }

  upsertAppointment(appointment);
  window.location.href = "./appointments.html";
}

function renderErrors(errors) {
  const mapping = {
    patientName: elements.patientName,
    doctorName: elements.doctorName,
    hospitalName: elements.hospitalName,
    specialty: elements.specialty,
    date: elements.appointmentDate,
    time: elements.appointmentTime,
    reason: elements.reason,
  };

  Object.entries(mapping).forEach(([key, input]) => {
    const field = input.closest("label");
    const error = field?.querySelector(".error-text");
    if (!error) {
      return;
    }
    error.textContent = errors[key] || "";
    input.classList.toggle("input-error", Boolean(errors[key]));
  });
}

function setupPickerField(input, kind) {
  if (!input) {
    return;
  }

  input.addEventListener("focus", () => {
    input.type = kind;
  });

  input.addEventListener("blur", () => {
    if (!input.value) {
      input.type = "text";
    }
  });
}

function setFieldValue(input, value) {
  if (!input) {
    return;
  }

  if (value) {
    input.type = input.dataset.inputKind || input.type;
    input.value = value;
    return;
  }

  input.value = "";
  input.type = "text";
}
