# Medal Tracker

A personal medal tracker built with HTML, CSS, JavaScript, Bootstrap 5 and Chart.js. It is a static website and can be hosted directly on GitHub Pages.

## Run locally

You do not need Python, Flask, a virtual environment, or a database.

1. Open a terminal in this project folder.
2. Run:

```bash
python3 -m http.server 8000
```

3. Open http://localhost:8000.

The first visit loads the 39 existing medals from `data/initial-medals.json` into your browser's local storage.

## Data storage

- Medals are saved in the browser's `localStorage`.
- Data stays in the browser and device where it was entered. It is not automatically synchronized with other devices or browsers.
- Clearing browser data can delete the saved medals. Use **Download JSON** regularly to create backups.
- Use **Import Backup** to add records from a previously exported JSON file. It adds records and does not replace existing records.
- The initial 39 records are loaded only when the browser has no saved Medal Tracker data yet.

## Publish on GitHub Pages

1. Push the project files to the `main` branch of the `TalitaRR/medal-tracker` repository.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch **main** and folder **/(root)**, then save.
5. Wait for GitHub Pages to finish deploying. The website should be available at:

   https://talitarr.github.io/medal-tracker/

## Important

This is a static, browser-based application. There is no Flask server and no central database. Each visitor's data is stored locally in their own browser. Anyone visiting the public website can use their own separate local copy.
