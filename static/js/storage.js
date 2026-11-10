(() => {
  const STORAGE_KEY = "medal-tracker-medals-v1";
  const INITIAL_DATA_URL = "./data/initial-medals.json";

  function normalizeMedal(record) {
    const year = Number(record.year);
    const validTypes = ["ouro", "prata", "bronze", "mencao_honrosa"];
    if (!record || typeof record !== "object") throw new Error("Invalid medal record.");
    const competition = String(record.competition || "").trim();
    const medalType = String(record.medal_type || "").trim();
    if (!competition) throw new Error("A medal is missing its competition name.");
    if (!Number.isInteger(year) || year < 1900 || year > 2100) throw new Error("A medal has an invalid year.");
    if (!validTypes.includes(medalType)) throw new Error("A medal has an invalid award type.");
    return {
      id: record.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      competition,
      year,
      medal_type: medalType,
      category: String(record.category || ""),
      phase: String(record.phase || ""),
      region: String(record.region || ""),
      certificate_url: String(record.certificate_url || ""),
      notes: String(record.notes || ""),
      received: Boolean(record.received),
      created_at: record.created_at || new Date().toISOString()
    };
  }

  function readStored() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Stored medal data is invalid.");
    return parsed;
  }

  function write(medals) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medals));
  }

  async function initialize() {
    if (localStorage.getItem(STORAGE_KEY) !== null) return;
    const response = await fetch(INITIAL_DATA_URL);
    if (!response.ok) throw new Error("Could not load the initial medal data.");
    const payload = await response.json();
    const records = Array.isArray(payload) ? payload : payload.medals;
    write(records.map(normalizeMedal));
  }

  async function getAll() {
    await initialize();
    return readStored().sort((a, b) => Number(b.year) - Number(a.year) || String(b.id).localeCompare(String(a.id)));
  }

  async function add(record) {
    await initialize();
    const medals = readStored();
    const medal = normalizeMedal(record);
    medal.id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    medals.push(medal);
    write(medals);
    return medal;
  }

  async function update(id, record) {
    await initialize();
    const medals = readStored();
    const index = medals.findIndex(m => String(m.id) === String(id));
    if (index < 0) throw new Error("Medal not found.");
    medals[index] = normalizeMedal({ ...record, id: medals[index].id, created_at: medals[index].created_at });
    write(medals);
    return medals[index];
  }

  async function remove(id) {
    await initialize();
    write(readStored().filter(m => String(m.id) !== String(id)));
  }

  async function importRecords(payload) {
    await initialize();
    const records = Array.isArray(payload) ? payload : payload?.medals;
    if (!Array.isArray(records)) throw new Error("The JSON file must contain a list of medals.");
    const clean = records.map(normalizeMedal);
    const existing = readStored();
    const additions = clean.map(record => ({
      ...record,
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`
    }));
    write([...existing, ...additions]);
    return additions.length;
  }

  function exportRecords(medals) {
    const payload = {
      format: "medal-tracker",
      version: 1,
      exported_at: new Date().toISOString(),
      medals: medals.map(({ id, ...record }) => record)
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "medal-tracker-backup.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  window.MedalStorage = { getAll, add, update, remove, importRecords, exportRecords };
})();
