// Personas registradas: { nombre: [descriptor, ...] } guardado en localStorage
const KEY = 'faces';

let db = {};
try { db = JSON.parse(localStorage.getItem(KEY)) || {}; } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} };

export const people = () => Object.entries(db);

export function addSample(name, descriptor) {
  (db[name] ||= []).push(Array.from(descriptor)); // varias muestras por persona mejoran la precisión
  save();
}

export function clearAll() {
  db = {};
  save();
}
