import fs from "node:fs";
import path from "node:path";

const publicDir = path.resolve(".output/public");
const assetsDir = path.join(publicDir, "assets");

if (!fs.existsSync(publicDir) || !fs.existsSync(assetsDir)) {
  console.error("Error: .output/public/assets directory does not exist.");
  process.exit(1);
}

// Find compiled JS and CSS bundles in .output/public/assets/
const files = fs.readdirSync(assetsDir);
const jsFile = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const cssFile = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));

if (!jsFile) {
  console.error("Error: Could not find compiled index-*.js in .output/public/assets");
  process.exit(1);
}

const cssLink = cssFile ? `<link rel="stylesheet" href="./assets/${cssFile}">` : "";

const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>STARDUST — Computer Week 2026 Classified Investigation</title>
    <link rel="icon" href="./favicon.ico" type="image/x-icon" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap"
    />
    <script>
      (function() {
        if (!window.$_TSR) {
          var baseRouter = {
            manifest: {},
            matches: [],
            dehydratedData: {},
            state: { matches: [] }
          };
          var routerProxy = new Proxy(baseRouter, {
            get: function(target, prop) {
              if (prop in target) return target[prop];
              if (prop === 'matches' || prop === 'buffer' || prop === 'scripts') return [];
              return {};
            }
          });
          var baseTSR = {
            t: new Map(),
            buffer: [],
            initialized: false,
            router: routerProxy,
            h: function() {},
            clean: function() {},
            init: function() {}
          };
          window.$_TSR = new Proxy(baseTSR, {
            get: function(target, prop) {
              if (prop in target) return target[prop];
              if (prop === 'matches' || prop === 'buffer' || prop === 'scripts') return [];
              return function() {};
            }
          });
        }
        window.__TSR_DEHYDRATED__ = window.__TSR_DEHYDRATED__ || { data: {} };
        window.__TSR_ROUTER__ = window.__TSR_ROUTER__ || {};
      })();
    </script>
    ${cssLink}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./assets/${jsFile}"></script>
  </body>
</html>
`;

const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>STARDUST — Computer Week 2026 Classified Investigation</title>
    <link rel="icon" href="./favicon.ico" type="image/x-icon" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap"
    />
    <script>
      (function() {
        var path = window.location.pathname;
        var repo = '/stardust-gateway';
        if (path.startsWith(repo)) {
          var sub = path.substring(repo.length);
          if (sub && sub !== '/' && sub !== '/index.html' && sub !== '/404.html') {
            window.location.replace(repo + '/#' + sub + window.location.search + window.location.hash);
            return;
          }
        } else if (path !== '/' && path !== '/index.html' && path !== '/404.html') {
          window.location.replace('/#' + path + window.location.search + window.location.hash);
          return;
        }

        if (!window.$_TSR) {
          var baseRouter = { manifest: {}, matches: [], dehydratedData: {}, state: { matches: [] } };
          var routerProxy = new Proxy(baseRouter, {
            get: function(target, prop) {
              if (prop in target) return target[prop];
              if (prop === 'matches' || prop === 'buffer' || prop === 'scripts') return [];
              return {};
            }
          });
          var baseTSR = { t: new Map(), buffer: [], initialized: false, router: routerProxy, h: function() {}, clean: function() {}, init: function() {} };
          window.$_TSR = new Proxy(baseTSR, {
            get: function(target, prop) {
              if (prop in target) return target[prop];
              if (prop === 'matches' || prop === 'buffer' || prop === 'scripts') return [];
              return function() {};
            }
          });
        }
        window.__TSR_DEHYDRATED__ = window.__TSR_DEHYDRATED__ || { data: {} };
        window.__TSR_ROUTER__ = window.__TSR_ROUTER__ || {};
      })();
    </script>
    ${cssLink}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./assets/${jsFile}"></script>
  </body>
</html>
`;

// Write compiled index.html and 404.html to .output/public
fs.writeFileSync(path.join(publicDir, "index.html"), htmlContent, "utf-8");
fs.writeFileSync(path.join(publicDir, "404.html"), notFoundHtml, "utf-8");
fs.writeFileSync(path.join(publicDir, ".nojekyll"), "", "utf-8");

console.log(`[GitHub Pages] Successfully injected compiled assets, router.matches Proxy hydration stub, and 404 hash router redirect into .output/public/index.html & 404.html (JS: ${jsFile}, CSS: ${cssFile || "none"})`);
