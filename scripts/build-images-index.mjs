#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PUBLIC_GEN = path.join(ROOT, 'public', 'images', 'generated');
const DATA_DIR = path.join(ROOT, 'data');
const OUT_MAP = path.join(DATA_DIR, 'images_map.json');

function safeReadJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function listFiles(dir) {
  try { return fs.readdirSync(dir); } catch { return []; }
}

function computeGivecaseId(row, idx) {
  const year = row?.year;
  const month = row?.month;
  const mm = String(month ?? 'm').padStart(2, '0');
  return `givecase-${year || 'y'}${mm}-${idx}`;
}

function buildIdList() {
  const ids = new Set();
  const data = safeReadJSON(path.join(DATA_DIR, 'data.json')) || {};
  const needsCases = safeReadJSON(path.join(DATA_DIR, 'needs_cases.json')) || [];
  const givesCases = safeReadJSON(path.join(DATA_DIR, 'gives_cases.json')) || [];

  for (const collName of ['needs', 'gives']) {
    for (const item of (data[collName] || [])) {
      if (item && item.id) ids.add(String(item.id));
    }
  }
  for (const item of needsCases) {
    if (item && item.id) ids.add(String(item.id));
  }
  givesCases.forEach((row, idx) => ids.add(computeGivecaseId(row, idx)));

  return Array.from(ids);
}

function buildMap() {
  const files = listFiles(PUBLIC_GEN);
  const set = new Set(files);
  const findForId = (id) => {
    if (set.has(`${id}.jpg`)) return `${id}.jpg`;
    if (set.has(`${id}.png`)) return `${id}.png`;
    const pref = `${id}-`;
    const cand = files.find(f => f.startsWith(pref));
    if (cand) return cand;
    return null;
  };

  const out = {};
  for (const id of buildIdList()) {
    const file = findForId(id);
    if (file) out[id] = `/images/generated/${file}`;
  }
  return out;
}

const map = buildMap();
fs.writeFileSync(OUT_MAP, JSON.stringify(map, null, 2), 'utf8');
console.log(`Wrote ${Object.keys(map).length} image mappings to ${path.relative(ROOT, OUT_MAP)}`);
