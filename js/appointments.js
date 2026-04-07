const {
  getAppointments,
  removeAppointment,
  filterAppointments,
  formatTableDate,
  formatTime,
  formatTimeRange,
  getQueryParam,
} = window.AppointmentApp;

const state = {
  appointments: getAppointments(),
  filters: {
    patient: "",
    doctor: "",
    fromDate: "",
    toDate: "",
  },
};

const modalController = window.AppointmentModal.createAppointmentModal({
  onSaved() {
    renderTable();
  },
});

const elements = {
  searchPatient: document.getElementById("searchPatient"),
  searchDoctor: document.getElementById("searchDoctor"),
  filterFromDate: document.getElementById("filterFromDate"),
  filterToDate: document.getElementById("filterToDate"),
  clear: document.getElementById("clearFiltersBtn"),
  count: document.getElementById("resultsCount"),
  list: document.getElementById("appointmentList"),
  template: document.getElementById("appointmentRowTemplate"),
  openModalBtn: document.getElementById("openModalBtn"),
};

bootstrapFiltersFromQuery();
bindEvents();
renderTable();

function bootstrapFiltersFromQuery() {
  const selectedDate = getQueryParam("date");
  if (selectedDate) {
    state.filters.fromDate = selectedDate;
    state.filters.toDate = selectedDate;
    elements.filterFromDate.value = selectedDate;
    elements.filterToDate.value = selectedDate;
  }
}

function bindEvents() {
  [elements.searchPatient, elements.searchDoctor, elements.filterFromDate, elements.filterToDate].forEach((input) => {
    input.addEventListener("input", handleFilterChange);
  });

  elements.clear.addEventListener("click", () => {
    state.filters = { patient: "", doctor: "", fromDate: "", toDate: "" };
    elements.searchPatient.value = "";
    elements.searchDoctor.value = "";
    elements.filterFromDate.value = "";
    elements.filterToDate.value = "";
    renderTable();
  });

  elements.openModalBtn.addEventListener("click", () => {
    modalController.openNew();
  });
}

function handleFilterChange() {
  state.filters.patient = elements.searchPatient.value.trim().toLowerCase();
  state.filters.doctor = elements.searchDoctor.value.trim().toLowerCase();
  state.filters.fromDate = elements.filterFromDate.value;
  state.filters.toDate = elements.filterToDate.value;

  if (state.filters.fromDate && state.filters.toDate && state.filters.fromDate > state.filters.toDate) {
    state.filters.toDate = state.filters.fromDate;
    elements.filterToDate.value = state.filters.fromDate;
  }

  renderTable();
}

function renderTable() {
  state.appointments = getAppointments();
  const filtered = filterAppointments(state.appointments, state.filters);
  elements.count.textContent = `${filtered.length} appointment${filtered.length === 1 ? "" : "s"}`;
  elements.list.innerHTML = "";
  const targetVisibleRows = 8;

  if (filtered.length === 0) {
    const row = document.createElement("tr");
    row.className = "empty-state";
    row.innerHTML = `<td colspan="7">No appointments match your filters.</td>`;
    elements.list.appendChild(row);
    appendFillerRows(Math.max(0, targetVisibleRows - 1));
    return;
  }

  filtered.forEach((appointment) => {
    const row = elements.template.content.cloneNode(true);
    row.querySelector(".cell-patient").textContent = appointment.patientName;
    row.querySelector(".cell-doctor").textContent = appointment.doctorName;
    row.querySelector(".cell-hospital").textContent = appointment.hospitalName;
    row.querySelector(".cell-specialty").textContent = appointment.specialty;
    row.querySelector(".cell-date").textContent = formatTableDate(appointment.date);
    row.querySelector(".cell-time").textContent = `${formatTime(appointment.time)} - ${formatTimeRange(appointment.time)}`;
    row.querySelector(".edit-link").addEventListener("click", () => {
      modalController.openEdit(appointment.id);
    });
    row.querySelector(".delete-link").addEventListener("click", () => {
      removeAppointment(appointment.id);
      renderTable();
    });
    elements.list.appendChild(row);
  });

  appendFillerRows(Math.max(0, targetVisibleRows - filtered.length));
}

function appendFillerRows(count) {
  for (let index = 0; index < count; index += 1) {
    const row = document.createElement("tr");
    row.className = "filler-row";
    row.innerHTML = "<td></td><td></td><td></td><td></td><td></td><td></td><td></td>";
    elements.list.appendChild(row);
  }
}
