document.addEventListener("DOMContentLoaded", async () => {
  const colors = ["#7C0E44", "#AA5E7A", "#D49A9A", "#E8BCC0"];
  const keys = ["ouro", "prata", "bronze", "mencao_honrosa"];
  const labels = ["Gold", "Silver", "Bronze", "Honorable Mention"];
  try {
    const medals = await MedalStorage.getAll();
    const years = [...new Set(medals.map(m => Number(m.year)))].sort((a, b) => a - b);
    const perYear = key => years.map(year => medals.filter(m => Number(m.year) === year && m.medal_type === key).length);

    new Chart(document.getElementById("stats-year-chart"), {
      type: "line",
      data: { labels: years, datasets: keys.map((key, i) => ({ label: labels[i], data: perYear(key), borderColor: colors[i], backgroundColor: colors[i], tension: .3, fill: false })) },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
    });

    new Chart(document.getElementById("stats-type-chart"), {
      type: "doughnut",
      data: { labels, datasets: [{ data: keys.map(key => medals.filter(m => m.medal_type === key).length), backgroundColor: colors, borderWidth: 3, borderColor: "#fff9f6" }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
    });

    const competitions = [...new Set(medals.map(m => m.competition))];
    const competitionCounts = competitions.map(name => medals.filter(m => m.competition === name).length);
    new Chart(document.getElementById("stats-competition-chart"), {
      type: "bar",
      data: { labels: competitions, datasets: [{ label: "Achievements", data: competitionCounts, backgroundColor: colors[1], borderRadius: 5 }] },
      options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }, plugins: { legend: { display: false } } }
    });

    const selectA = document.getElementById("compare-year-a");
    const selectB = document.getElementById("compare-year-b");
    years.forEach(y => {
      selectA.add(new Option(y, y));
      selectB.add(new Option(y, y));
    });
    if (years.length >= 2) {
      selectA.value = years[years.length - 2];
      selectB.value = years[years.length - 1];
    }
    let compareChart;
    function compare() {
      if (!selectA.value || !selectB.value) return;
      const selected = [Number(selectA.value), Number(selectB.value)];
      const values = keys.map(key => selected.map(y => medals.filter(m => Number(m.year) === y && m.medal_type === key).length));
      if (compareChart) compareChart.destroy();
      compareChart = new Chart(document.getElementById("compare-chart"), {
        type: "bar",
        data: { labels, datasets: selected.map((y, i) => ({ label: String(y), data: values.map(v => v[i]), backgroundColor: colors[i] })) },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
      });
      document.getElementById("compare-empty").classList.add("d-none");
    }
    selectA.addEventListener("change", compare);
    selectB.addEventListener("change", compare);
    if (years.length >= 2) compare();
  } catch (error) {
    console.error(error);
    window.showMessage?.(`Could not load statistics: ${error.message}`, "error");
  }
});
