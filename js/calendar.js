const {
  getAppointments,
  WEEKDAYS,
  calendarGridStart,
  escapeHtml,
  formatTime,
  removeAppointment,
  startOfMonth,
  toDateInputValue,
  todayString,
} = window.AppointmentApp;

const state = {
  appointments: getAppointments(),
  selectedDate: todayString(),
  currentMonth: startOfMonth(new Date()),
};

const modalController = window.AppointmentModal.createAppointmentModal({
  onSaved(savedAppointment) {
    state.selectedDate = savedAppointment.date;
    state.currentMonth = startOfMonth(new Date(savedAppointment.date));
    renderCalendar();
  },
});

const elements = {
  doctor: document.getElementById("calendarDoctor"),
  label: document.getElementById("calendarMonthLabel"),
  weekdays: document.getElementById("calendarWeekdays"),
  grid: document.getElementById("calendarGrid"),
  prev: document.getElementById("prevMonthBtn"),
  next: document.getElementById("nextMonthBtn"),
  today: document.getElementById("todayBtn"),
  openModalBtn: document.getElementById("openModalBtn"),
  monthDropdownBtn: document.getElementById("monthDropdownBtn"),
  monthMenu: document.getElementById("monthMenu"),
};

renderMonthMenu();
renderWeekdays();
bindEvents();
renderCalendar();

function bindEvents() {
  elements.prev.addEventListener("click", () => {
    const next = shiftSelectedMonth(-1);
    state.currentMonth = startOfMonth(next);
    state.selectedDate = toDateInputValue(next);
    renderCalendar();
  });

  elements.next.addEventListener("click", () => {
    const next = shiftSelectedMonth(1);
    state.currentMonth = startOfMonth(next);
    state.selectedDate = toDateInputValue(next);
    renderCalendar();
  });

  elements.today.addEventListener("click", () => {
    state.currentMonth = startOfMonth(new Date());
    state.selectedDate = todayString();
    renderCalendar();
  });

  elements.openModalBtn.addEventListener("click", () => {
    modalController.openNew();
  });

  elements.monthDropdownBtn.addEventListener("click", () => {
    const isOpen = !elements.monthMenu.classList.contains("hidden");
    elements.monthMenu.classList.toggle("hidden", isOpen);
    elements.monthDropdownBtn.setAttribute("aria-expanded", String(!isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!elements.monthMenu.contains(event.target) && !elements.monthDropdownBtn.contains(event.target)) {
      closeMonthMenu();
    }
  });
}

function renderWeekdays() {
  elements.weekdays.innerHTML = "";
  const todayIndex = new Date().getDay();
  WEEKDAYS.forEach((day) => {
    const cell = document.createElement("div");
    cell.textContent = day;
    if (WEEKDAYS.indexOf(day) === todayIndex) {
      cell.classList.add("today-column");
    }
    elements.weekdays.appendChild(cell);
  });
}

function renderCalendar() {
  state.appointments = getAppointments();
  elements.label.textContent = formatToolbarDate(state.selectedDate);
  elements.doctor.textContent = state.appointments[0]?.doctorName || "Shared schedule";
  elements.grid.innerHTML = "";
  syncMonthMenu();

  const start = calendarGridStart(state.currentMonth);
  const totalDays = getVisibleGridDayCount(state.currentMonth);

  for (let offset = 0; offset < totalDays; offset += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + offset);
    const dateKey = toDateInputValue(day);
    const dayAppointments = state.appointments.filter((appointment) => appointment.date === dateKey);
    const cell = document.createElement("button");
    const isCurrentMonth = day.getMonth() === state.currentMonth.getMonth();

    cell.type = "button";
    cell.className = `calendar-day${isCurrentMonth ? "" : " muted"}${dateKey === state.selectedDate ? " selected" : ""}`;
    cell.addEventListener("click", () => {
      window.location.href = `./appointments.html?date=${dateKey}`;
    });

    const heading = document.createElement("div");
    heading.className = "calendar-day-header";
    heading.innerHTML = `<span>${formatCalendarDayLabel(day, isCurrentMonth)}</span>${dayAppointments.length ? `<span class="calendar-count">${dayAppointments.length}</span>` : ""}`;

    const events = document.createElement("div");
    events.className = "calendar-events";

    dayAppointments.slice(0, 2).forEach((appointment) => {
      const entry = document.createElement("div");
      entry.className = "calendar-card";
      entry.innerHTML = `
        <div class="calendar-card-line">
          <span class="calendar-card-status" aria-hidden="true">
            <svg viewBox="0 0 20 20" focusable="false">
              <path d="M10 4.5v11"></path>
              <path d="M7.25 7.25 10 4.5l2.75 2.75"></path>
              <path d="M7.25 15.5h5.5"></path>
            </svg>
          </span>
          <span class="calendar-card-text">${escapeHtml(appointment.patientName)} (Arrived) ${formatEventTime(appointment.time)}</span>
        </div>
        <div class="calendar-card-tools">
          <div class="calendar-card-actions">
            <button class="calendar-card-action edit-action" type="button" aria-label="Edit appointment">
              <svg viewBox="0 0 20 20" focusable="false">
                <path d="M4 14.75 5 11l7-7 3 3-7 7-3.75.75Z"></path>
                <path d="M10.75 5.25 13.75 8.25"></path>
              </svg>
            </button>
            <button class="calendar-card-action delete-action" type="button" aria-label="Delete appointment">
              <svg viewBox="0 0 20 20" focusable="false">
                <path d="M5.75 6.25v8"></path>
                <path d="M10 6.25v8"></path>
                <path d="M14.25 6.25v8"></path>
                <path d="M4.5 5.25h11"></path>
                <path d="M7.25 5.25V3.75h5.5v1.5"></path>
                <path d="M6 16.25h8"></path>
              </svg>
            </button>
            <button class="calendar-card-action clone-action" type="button" aria-label="Duplicate appointment">
              <svg viewBox="0 0 20 20" focusable="false">
                <rect x="7" y="4.5" width="7.5" height="9"></rect>
                <path d="M5.5 7H4.25v8.5h7.5v-1.25"></path>
                <path d="M8.75 9h4"></path>
                <path d="M10.75 7v4"></path>
              </svg>
            </button>
          </div>
        </div>`;
      entry.querySelector(".edit-action").addEventListener("click", (event) => {
        event.stopPropagation();
        modalController.openEdit(appointment.id);
      });
      entry.querySelector(".delete-action").addEventListener("click", (event) => {
        event.stopPropagation();
        removeAppointment(appointment.id);
        renderCalendar();
      });
      entry.querySelector(".clone-action").addEventListener("click", (event) => {
        event.stopPropagation();
        modalController.openNew({
          patientName: appointment.patientName,
          doctorName: appointment.doctorName,
          hospitalName: appointment.hospitalName,
          specialty: appointment.specialty,
          date: appointment.date,
          time: appointment.time,
          reason: appointment.reason,
        });
      });
      events.appendChild(entry);
    });

    if (dayAppointments.length > 2) {
      const more = document.createElement("div");
      more.className = "calendar-card";
      more.textContent = `+${dayAppointments.length - 2} more`;
      events.appendChild(more);
    }

    cell.append(heading, events);
    elements.grid.appendChild(cell);
  }
}

function shiftSelectedMonth(offset) {
  const selected = new Date(`${state.selectedDate}T00:00:00`);
  const targetMonth = new Date(selected.getFullYear(), selected.getMonth() + offset, 1);
  const maxDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
  const day = Math.min(selected.getDate(), maxDay);
  return new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day);
}

function formatToolbarDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getVisibleGridDayCount(monthDate) {
  const start = calendarGridStart(monthDate);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const visibleEnd = new Date(end);
  visibleEnd.setDate(end.getDate() + (6 - end.getDay()));
  return Math.round((visibleEnd - start) / 86400000) + 1;
}

function formatCalendarDayLabel(day, isCurrentMonth) {
  if (isCurrentMonth && day.getDate() === 1) {
    return `${day.toLocaleDateString("en-US", { month: "short" })} ${day.getDate()}`;
  }

  if (!isCurrentMonth && day.getDate() === 1) {
    return `${day.toLocaleDateString("en-US", { month: "short" })} ${day.getDate()}`;
  }

  return `${day.getDate()}`;
}

function formatEventTime(timeString) {
  const [hours, minutes] = timeString.split(":");
  const hourNumber = Number(hours);
  const suffix = hourNumber >= 12 ? "pm" : "am";
  const twelveHour = hourNumber % 12 || 12;
  return `${String(twelveHour).padStart(2, "0")}:${minutes} ${suffix}`;
}

function renderMonthMenu() {
  const monthNames = Array.from({ length: 12 }, (_, monthIndex) =>
    new Date(2026, monthIndex, 1).toLocaleDateString("en-US", { month: "long" })
  );

  monthNames.forEach((monthName, monthIndex) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "month-option";
    option.textContent = monthName;
    option.setAttribute("role", "menuitem");
    option.addEventListener("click", () => {
      const next = new Date(state.currentMonth);
      next.setMonth(monthIndex);
      state.currentMonth = startOfMonth(next);
      state.selectedDate = toDateInputValue(
        new Date(next.getFullYear(), monthIndex, Math.min(new Date(`${state.selectedDate}T00:00:00`).getDate(), new Date(next.getFullYear(), monthIndex + 1, 0).getDate()))
      );
      closeMonthMenu();
      renderCalendar();
    });
    elements.monthMenu.appendChild(option);
  });
}

function syncMonthMenu() {
  const options = elements.monthMenu.querySelectorAll(".month-option");
  options.forEach((option, index) => {
    option.classList.toggle("is-active", index === state.currentMonth.getMonth());
  });
}

function closeMonthMenu() {
  elements.monthMenu.classList.add("hidden");
  elements.monthDropdownBtn.setAttribute("aria-expanded", "false");
}
