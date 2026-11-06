const palette = ["#7C0E44", "#AA5E7A", "#D49A9A", "#E8BCC0"];
const medalLabels = { ouro: "Gold", prata: "Silver", bronze: "Bronze", mencao_honrosa: "Honorable Mention" };
const medalKeys = ["ouro", "prata", "bronze", "mencao_honrosa"];

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "Not specified";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const medals = await MedalStorage.getAll();
    const counts = Object.fromEntries(medalKeys.map(key => [key, medals.filter(m => m.medal_type === key).length]));
    document.querySelectorAll("[data-count-type]").forEach(el => {
      const key = el.dataset.countType;
      el.textContent = key === "total" ? medals.length : (counts[key] || 0);
    });

    const byYear = countBy(medals, "year");
    const years = Object.keys(byYear).sort((a, b) => Number(a) - Number(b));
    const datasets = medalKeys.map((key, i) => ({
      label: medalLabels[key],
      data: years.map(year => medals.filter(m => String(m.year) === year && m.medal_type === key).length),
      backgroundColor: palette[i],
      borderRadius: 5,
      stack: "medals"
    }));
    new Chart(document.getElementById("yearChart"), {
      type: "bar",
      data: { labels: years, datasets },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true, ticks: { precision: 0 }, grid: { color: "rgba(124,14,68,.09)" } } }, plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 7 } } } }
    });

    const competitions = countBy(medals, "competition");
    new Chart(document.getElementById("competitionChart"), {
      type: "doughnut",
      data: { labels: Object.keys(competitions), datasets: [{ data: Object.values(competitions), backgroundColor: palette, borderWidth: 3, borderColor: "#fff9f6" }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 7 } } } }
    });

    const bestYear = Object.entries(byYear).sort((a, b) => b[1] - a[1])[0];
    document.getElementById("best-year").textContent = bestYear ? bestYear[0] : "—";
    document.getElementById("best-year-caption").textContent = bestYear ? `${bestYear[1]} achievement(s) that year.` : "Add medals to see your record.";

    const topCompetition = Object.entries(competitions).sort((a, b) => b[1] - a[1])[0];
    document.getElementById("top-competition").textContent = topCompetition ? topCompetition[0] : "—";
    document.getElementById("top-competition-caption").textContent = topCompetition ? `${topCompetition[1]} achievement(s) in this competition.` : "The ranking will appear as you add medals.";

    const recent = medals.slice(0, 5);
    const tbody = document.getElementById("recent-medals");
    if (recent.length) {
      tbody.innerHTML = recent.map(m => `<tr><td><strong>${escapeHtml(m.competition)}</strong></td><td><span class="medal-pill ${m.medal_type}">${medalLabels[m.medal_type]}</span></td><td>${m.year}</td></tr>`).join("");
    } else {
      tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No medals added yet.</td></tr>';
    }
  } catch (error) {
    console.error(error);
    window.showMessage?.(`Could not load medals: ${error.message}`, "error");
  }
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
