const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, 'public')));

const partials = {
  header: fs.readFileSync(path.join(__dirname, 'views/partials/header.html'), 'utf8'),
  footer: fs.readFileSync(path.join(__dirname, 'views/partials/footer.html'), 'utf8'),
};

function render(file, title) {
  let html = fs.readFileSync(path.join(__dirname, 'views', file), 'utf8');
  html = html
    .replace('{{TITLE}}', title)
    .replace('{{HEADER}}', partials.header)
    .replace('{{FOOTER}}', partials.footer);
  return html;
}

const routes = {
  '/': ['index.html', 'AniScope — Aesthetic Criticism of Japanese Animation'],
  '/features': ['index.html', 'Features / 特集 — AniScope'],
  '/reviews': ['reviews.html', 'The Architecture of Farewell — AniScope'],
  '/explore': ['explore.html', 'Curated Works & Critical Canon — AniScope'],
  '/essays': ['essays.html', 'The Critical Salon — AniScope'],
  '/community': ['community.html', 'Reiko Tachibana — AniScope'],
};

for (const [route, [file, title]] of Object.entries(routes)) {
  app.get(route, (req, res) => res.send(render(file, title)));
}

const pageLabels = {
  '/': 'Features',
  '/reviews': 'Reviews',
  '/explore': 'Explore',
  '/essays': 'Essays',
  '/community': 'Community',
};

function plainText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{\{[^}]+\}\}/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

app.get('/search-index.json', (req, res) => {
  const seen = new Set();
  const index = [];

  for (const [route, [file]] of Object.entries(routes)) {
    if (seen.has(file)) continue;
    seen.add(file);

    const html = fs.readFileSync(path.join(__dirname, 'views', file), 'utf8');
    const heading = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
    const alts = Array.from(html.matchAll(/alt="([^"]+)"/g), m => m[1]);
    const page = pageLabels[route] || 'AniScope';

    index.push({
      url: route,
      page,
      title: heading ? plainText(heading[1]) : page,
      text: plainText(html) + ' ' + alts.join(' '),
    });
  }

  res.set('Cache-Control', 'no-store');
  res.json(index);
});

app.use((req, res) => {
  res.status(404).send(render('404.html', 'Page Not Found — AniScope'));
});

app.listen(PORT, () => console.log(`AniScope running at http://localhost:${PORT}`));
