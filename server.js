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

app.use((req, res) => {
  res.status(404).send(render('404.html', 'Page Not Found — AniScope'));
});

app.listen(PORT, () => console.log(`AniScope running at http://localhost:${PORT}`));
