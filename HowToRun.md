## Prerequisites
- Node.js 18+ (for module support and running tests).
- Python 3 (only for the lightweight static file server).

## Install Dependencies
```bash
npm install
```

## Run Automated Tests
```bash
npm test
```
(uses Mocha; no additional config needed)

## Run the App Locally
The browser modules must be served over HTTP. From the project root:
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000/index.html` (or `indexGPT.html`) in your browser. Keep the server rooted at the repo top-level so paths like `/data/initializers/default.js` resolve correctly.

## Switch Simulations
Edit `Simulations.js` to point the `Default` entry at a different initializer in `data/initializers/` if you want to load a different scenario on startup.
