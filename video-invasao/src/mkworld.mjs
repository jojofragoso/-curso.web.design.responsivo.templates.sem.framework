import * as d3 from 'd3-geo'; import * as topo from 'topojson-client'; import fs from 'fs'; import { createRequire } from 'module';
const require = createRequire(import.meta.url); const { createCanvas } = require('@napi-rs/canvas');
const w = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json'));
const f = topo.feature(w, w.objects.countries).features;
const c = createCanvas(2048, 1024), x = c.getContext('2d'); x.fillStyle = '#1f4e6b'; x.fillRect(0, 0, 2048, 1024);
const p = d3.geoPath(d3.geoEquirectangular().scale(2048 / (2 * Math.PI)).translate([1024, 512]), x);
x.strokeStyle = 'rgba(79,209,232,.12)'; x.lineWidth = 2; x.beginPath(); p(d3.geoGraticule10()); x.stroke();
for (const g of f) { x.beginPath(); p(g); x.fillStyle = g.id === '156' ? '#d8423a' : g.id === '076' ? '#2e9e5b' : g.id === '840' ? '#3f6fb3' : '#c9b58a'; x.fill(); x.strokeStyle = '#3a3020'; x.lineWidth = 1.5; x.stroke(); }
fs.writeFileSync('worldmap.png', c.toBuffer('image/png'));
const pr = d3.geoEquirectangular().scale(2048 / (2 * Math.PI)).translate([1024, 512]);
console.log(JSON.stringify({ cn: pr([104, 35]), br: pr([-52, -12]), us: pr([-98, 39]) }));
