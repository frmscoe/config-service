const { createServer } = require("https");
const { readFileSync } = require("fs");
const next = require("next");
require("dotenv").config({ path: ".env.local" });

const port = parseInt(process.env.PORT, 10) || 3000; // Use PORT from .env.local or default to 3000
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// SSL Certificate and Key paths
const sslOptions = {
  key: readFileSync("certificates/localhost.key"),
  cert: readFileSync("certificates/localhost.crt"),
};

// Prepare the Next app
app.prepare().then(() => {
  createServer(sslOptions, (req, res) => {
    handle(req, res);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://localhost:${port}`);
  });
});
