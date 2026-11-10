document.addEventListener("DOMContentLoaded", async () => {
  const search = document.getElementById("search-medals");
  const yearFilter = document.getElementById("filter-year");
  const typeFilter = document.getElementById("filter-type");
  const receivedFilter = document.getElementById("filter-received");
  const sort = document.getElementById("sort-year");
  const tbody = document.getElementById("medals-table-body");
  const noResults = document.getElementById("no-results");
  const exportButton = document.getElementById("export-json");
  let medals = [];

  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  function medalLabel(type) {
    return ({ ouro: "Gold", prata: "Silver", bronze: "Bronze", mencao_honrosa: "Honorable Mention" })[type] || type;
  }

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
    }).filter(m =>
      m.competition.toLowerCase().includes(search.value.trim().toLowerCase()) &&
      (!yearFilter.value || String(m.year) === yearFilter.value) &&
      (!typeFilter.value || m.medal_type === typeFilter.value) &&
      (!receivedFilter.value || ( m.received && receivedFilter.value === "true") || ( !m.received && receivedFilter.value === "false"))
    );

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
        <td class="text-center">
          <button class="received-toggle ${m.received ? "received" : ""}"
                  type="button"
                  data-id="${escapeHtml(m.id)}"
                  aria-label="Mark ${escapeHtml(m.competition)} as received">
            <i class="${m.received ? "fi fi-sr-badget-check-alt" : "fi fi-rr-badget-check-alt"}"></i>
          </button>
        </td>
      </tr>`).join("");
    noResults.classList.add("d-none");
  }

  async function reload() {
    medals = await MedalStorage.getAll();
    render();
  }

  tbody.addEventListener("click", async event => {
  const button = event.target.closest(".received-toggle");
  if (!button) return;

  const medal = medals.find(m => String(m.id) === button.dataset.id);
  if (!medal) return;

  button.disabled = true;

  try {
    await MedalStorage.update(medal.id, {
      ...medal,
      received: !medal.received
    });

    await reload();
  } catch (error) {
    button.disabled = false;
    window.showMessage(error.message, "error");
  }
});

  [search, yearFilter, typeFilter, sort, receivedFilter].forEach(control => {
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

  try {
    await reload();
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Could not load medal data.</td></tr>';
    window.showMessage(error.message, "error");
  }
});
