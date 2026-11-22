import * as d3 from 'd3-geo';
import * as topo from 'topojson-client';
import fs from 'fs';
const w50 = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));
const w110 = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json'));
const f50 = topo.feature(w50, w50.objects.countries).features;
const f110 = topo.feature(w110, w110.objects.countries).features;
const rings = (geo, proj, scale) => { const out = []; const polys = geo.type === 'Polygon' ? [geo.coordinates] : geo.coordinates; for (const p of polys) { const r = p[0].map(c => proj(c)).filter(Boolean).map(([x, y]) => [+(x * scale).toFixed(3), +(-y * scale).toFixed(3)]); if (r.length > 3) out.push(r); } return out; };
const simplify = (r, step) => r.filter((_, i) => i % step === 0);
// equal-area per-country (km -> units: 1 unit = 250 km)
const ea = (lon, lat) => d3.geoAzimuthalEqualArea().rotate([-lon, -lat]).scale(6371).translate([0, 0]);
const BR = f50.find(f => f.id === '076'), US = f50.find(f => f.id === '840');
const brR = rings(BR.geometry, ea(-53, -12), 1 / 250).map(r => simplify(r, 3));
const usAll = rings(US.geometry, ea(-98, 39), 1 / 250).map(r => simplify(r, 3));
// split contiguous vs alaska by centroid x
const cx = r => r.reduce((a, p) => a + p[0], 0) / r.length, cy = r => r.reduce((a, p) => a + p[1], 0) / r.length;
const area = r => Math.abs(r.reduce((a, p, i) => { const q = r[(i + 1) % r.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) / 2);
const usMain = usAll.filter(r => cx(r) > -12 && cy(r) < 8 && cy(r) > -8 && area(r) > .5);
const alaska = usAll.filter(r => cx(r) < -8 && cy(r) > 8 && area(r) > .5);
// Americas (conic equal area)
const pa = d3.geoAzimuthalEqualArea().rotate([80, -5]).scale(6371).translate([0, 0]);
const am = {}; for (const f of f110) { const c = d3.geoCentroid(f); if (c[0] > -170 && c[0] < -30 && c[1] > -60 && c[1] < 75 && f.id !== '304' && f.id) { const r = rings(f.geometry, pa, 1 / 700).filter(r => area(r) > .02); if (r.length) am[f.id] = r; } }
fs.writeFileSync('mapdata.js', 'export const MAPS = ' + JSON.stringify({ br: brR, us: usMain, ak: alaska, am }) + ';');
console.log('br', brR.length, brR.map(area).reduce((a, b) => a + b, 0).toFixed(1), 'us', usMain.length, usMain.map(area).reduce((a, b) => a + b, 0).toFixed(1), 'ak', alaska.length, 'americas', Object.keys(am).length, fs.statSync('mapdata.js').size);
