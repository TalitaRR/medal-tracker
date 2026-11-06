document.addEventListener("DOMContentLoaded", async () => {
  const search = document.getElementById("search-medals");
  const yearFilter = document.getElementById("filter-year");
  const typeFilter = document.getElementById("filter-type");
  const sort = document.getElementById("sort-year");
  const tbody = document.getElementById("medals-table-body");
  const noResults = document.getElementById("no-results");
  const form = document.getElementById("medal-form");
  const formTitle = document.getElementById("form-title");
  const submit = document.getElementById("submit-medal");
  const cancel = document.getElementById("cancel-edit");
  const exportButton = document.getElementById("export-json");
  const importButton = document.getElementById("import-json");
  const jsonFile = document.getElementById("json-file");
  let medals = [];
  let editingId = null;

  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  function refreshYearFilter() {
    const selected = yearFilter.value;
    const years = [...new Set(medals.map(m => Number(m.year)))].sort((a, b) => b - a);
    yearFilter.innerHTML = '<option value="">All years</option>' +
      years.map(year => `<option value="${year}">${year}</option>`).join("");
    if (years.includes(Number(selected))) yearFilter.value = selected;
  }

  function render() {
    refreshYearFilter();
    const rows = [...medals].sort((a, b) => {
      const diff = Number(a.year) - Number(b.year);
      if (diff !== 0) return sort.value === "asc" ? diff : -diff;
      return String(b.id).localeCompare(String(a.id));
    }).filter(m => {
      return m.competition.toLowerCase().includes(search.value.trim().toLowerCase())
        && (!yearFilter.value || String(m.year) === yearFilter.value)
        && (!typeFilter.value || m.medal_type === typeFilter.value);
    });

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-state">${medals.length ? "No achievements match the selected filters." : "You haven't added any medals yet."}</td></tr>`;
      noResults.classList.add("d-none");
      return;
    }

    tbody.innerHTML = rows.map(m => `
      <tr data-medal-id="${escapeHtml(m.id)}">
        <td><strong>${escapeHtml(m.competition)}</strong></td>
        <td><span class="medal-pill ${escapeHtml(m.medal_type)}">${escapeHtml(medalLabel(m.medal_type))}</span></td>
        <td>${Number(m.year)}</td>
        <td class="text-end action-cell">
          <button class="icon-button edit-medal" type="button" data-id="${escapeHtml(m.id)}" title="Edit"><i class="fi fi-rc-pencil"></i></button>
          <button class="icon-button delete-button delete-medal" type="button" data-id="${escapeHtml(m.id)}" title="Delete"><i class="fi fi-rr-trash"></i></button>
        </td>
      </tr>`).join("");
    noResults.classList.add("d-none");
  }

  function medalLabel(type) {
    return ({ ouro: "Gold", prata: "Silver", bronze: "Bronze", mencao_honrosa: "Honorable Mention" })[type] || type;
  }

  function resetForm() {
    form.reset();
    editingId = null;
    formTitle.textContent = "Add Medal";
    submit.textContent = "＋ Add Medal";
    cancel.classList.add("d-none");
    document.getElementById("year").value = new Date().getFullYear();
  }

  function fillForm(medal) {
    editingId = medal.id;
    form.elements.competition.value = medal.competition;
    form.elements.year.value = medal.year;
    form.elements.medal_type.value = medal.medal_type;
    form.elements.notes.value = medal.notes || "";
    formTitle.textContent = "Edit Medal";
    submit.textContent = "Save Changes";
    cancel.classList.remove("d-none");
    document.getElementById("add-medal").scrollIntoView({ behavior: "smooth" });
  }

  async function reload() {
    medals = await MedalStorage.getAll();
    render();
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const record = {
      competition: form.elements.competition.value.trim(),
      year: form.elements.year.value,
      medal_type: form.elements.medal_type.value,
      notes: form.elements.notes.value.trim()
    };
    try {
      if (editingId === null) {
        await MedalStorage.add(record);
        window.showMessage("Medal added successfully.");
      } else {
        await MedalStorage.update(editingId, record);
        window.showMessage("Medal updated successfully.");
      }
      await reload();
      resetForm();
    } catch (error) {
      window.showMessage(error.message, "error");
    }
  });

  cancel.addEventListener("click", resetForm);

  tbody.addEventListener("click", async event => {
    const editButton = event.target.closest(".edit-medal");
    const deleteButton = event.target.closest(".delete-medal");
    if (editButton) {
      const medal = medals.find(m => String(m.id) === editButton.dataset.id);
      if (medal) fillForm(medal);
    }
    if (deleteButton) {
      const id = deleteButton.dataset.id;
      const medal = medals.find(m => String(m.id) === id);
      if (!medal || !window.confirm(`Delete the medal from ${medal.competition}?`)) return;
      try {
        await MedalStorage.remove(id);
        await reload();
        window.showMessage("Medal deleted.");
      } catch (error) {
        window.showMessage(error.message, "error");
      }
    }
  });

  [search, yearFilter, typeFilter, sort].forEach(control => {
    control.addEventListener("input", render);
    control.addEventListener("change", render);
  });

  exportButton.addEventListener("click", async () => {
    try {
      MedalStorage.exportRecords(await MedalStorage.getAll());
    } catch (error) {
      window.showMessage(error.message, "error");
    }
  });

  importButton.addEventListener("click", async () => {
    const file = jsonFile.files[0];
    if (!file) {
      window.showMessage("Choose a JSON backup file first.", "error");
      return;
    }
    try {
      const payload = JSON.parse(await file.text());
      const count = await MedalStorage.importRecords(payload);
      jsonFile.value = "";
      await reload();
      window.showMessage(`${count} record(s) imported successfully.`);
    } catch (error) {
      window.showMessage(`Could not import the file: ${error.message}`, "error");
    }
  });

  try {
    await reload();
    resetForm();
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Could not load medal data.</td></tr>';
    window.showMessage(error.message, "error");
  }
});
