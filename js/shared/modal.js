(function () {
  const {
    findAppointment,
    upsertAppointment,
    validateAppointment,
  } = window.AppointmentApp;

  function createAppointmentModal(options = {}) {
    const modal = document.getElementById("appointmentModal");
    const form = document.getElementById("appointmentForm");

    if (!modal || !form) {
      return {
        openNew() {},
        openEdit() {},
        close() {},
      };
    }

    const title = document.getElementById("modalTitle");
    const fields = {
      appointmentId: document.getElementById("appointmentId"),
      patientName: document.getElementById("patientName"),
      doctorName: document.getElementById("doctorName"),
      hospitalName: document.getElementById("hospitalName"),
      specialty: document.getElementById("specialty"),
      appointmentDate: document.getElementById("appointmentDate"),
      appointmentTime: document.getElementById("appointmentTime"),
      reason: document.getElementById("reason"),
    };

    const onSaved = options.onSaved || (() => {});

    setupPickerField(fields.appointmentDate, "date");
    setupPickerField(fields.appointmentTime, "time");

    document.querySelectorAll('[data-close-modal="true"]').forEach((element) => {
      element.addEventListener("click", close);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.classList.contains("hidden")) {
        close();
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const appointment = {
        id: fields.appointmentId.value || crypto.randomUUID(),
        patientName: fields.patientName.value.trim(),
        doctorName: fields.doctorName.value.trim(),
        hospitalName: fields.hospitalName.value.trim(),
        specialty: fields.specialty.value.trim(),
        date: fields.appointmentDate.value,
        time: fields.appointmentTime.value,
        reason: fields.reason.value.trim(),
      };

      const errors = validateAppointment(appointment);
      renderErrors(errors);

      if (Object.keys(errors).length > 0) {
        return;
      }

      upsertAppointment(appointment);
      close();
      onSaved(appointment);
    });

    function openNew(prefill = {}) {
      title.textContent = "Schedule Appointment";
      form.reset();
      renderErrors({});
      fields.appointmentId.value = "";
      fields.patientName.value = prefill.patientName || "";
      setFieldValue(fields.appointmentDate, prefill.date || "");
      setFieldValue(fields.appointmentTime, prefill.time || "");
      fields.doctorName.value = prefill.doctorName || "";
      fields.hospitalName.value = prefill.hospitalName || "";
      fields.specialty.value = prefill.specialty || "";
      fields.reason.value = prefill.reason || "";
      show();
    }

    function openEdit(id) {
      const appointment = typeof id === "string" ? findAppointment(id) : id;
      if (!appointment) {
        return;
      }

      title.textContent = "Edit Appointment";
      form.reset();
      renderErrors({});
      fields.appointmentId.value = appointment.id;
      fields.patientName.value = appointment.patientName;
      fields.doctorName.value = appointment.doctorName;
      fields.hospitalName.value = appointment.hospitalName;
      fields.specialty.value = appointment.specialty;
      setFieldValue(fields.appointmentDate, appointment.date);
      setFieldValue(fields.appointmentTime, appointment.time);
      fields.reason.value = appointment.reason;
      show();
    }

    function show() {
      modal.classList.remove("hidden");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    }

    function close() {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }

    function renderErrors(errors) {
      Object.values(fields).forEach((input) => {
        const label = input.closest("label");
        const errorNode = label?.querySelector(".error-text");
        const key = input.id === "appointmentDate" ? "date" : input.id === "appointmentTime" ? "time" : input.id;
        if (errorNode) {
          errorNode.textContent = errors[key] || "";
        }
        input.classList.toggle("input-error", Boolean(errors[key]));
      });
    }

    return {
      openNew,
      openEdit,
      close,
    };
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

  window.AppointmentModal = { createAppointmentModal };
})();
