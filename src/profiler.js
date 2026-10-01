// Perfil falso estilo Watch Dogs: todo inventado, derivado del nombre para que no parpadee entre cuadros.
const JOBS = ['Barista', 'Profesor de yoga', 'Piloto de drones', 'Contadora', 'Chef', 'Estudiante',
  'Desarrollador web', 'Veterinaria', 'DJ de bodas', 'Paseador de perros', 'Astronauta (retirado)'];
const FACTS = ['Colecciona tazas de café', 'Le teme a las palomas', 'Vio Shrek 47 veces',
  'Habla con sus plantas', 'Perdió 3 paraguas este año', 'Campeón local de dominó',
  'Odia el cilantro', 'Duerme con calcetines', 'Nunca devuelve los tuppers', 'Canta en la ducha (mal)'];

const hash = s => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);

export const fakeProfile = seed => {
  let h = hash(seed) || 1;
  const pick = n => (h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % n;
  return [
    `EDAD: ${18 + pick(50)}`,
    `OCUPACIÓN: ${JOBS[pick(JOBS.length)]}`,
    `INGRESOS: $${(12 + pick(90)) * 1000}/año`,
    `DATO: ${FACTS[pick(FACTS.length)]}`,
  ];
};

// since: momento (performance.now) en que se activó el modo, para revelar línea a línea
export function drawProfile(ctx, box, name, lines, since) {
  const s = ctx.canvas.width / 640; // escala el texto con la resolución del video
  const fs = 14 * s, pad = 8 * s, lh = fs * 1.4;
  const all = [name.toUpperCase(), ...lines, 'SIMULACIÓN · DATOS FICTICIOS'];
  const shown = Math.floor((performance.now() - since) / 150); // efecto "hackeo"
  ctx.font = `${fs}px monospace`;
  const w = Math.max(...all.map(l => ctx.measureText(l).width)) + pad * 2, h = all.length * lh + pad * 2;
  let x = box.x + box.width + 10 * s;
  if (x + w > ctx.canvas.width) x = Math.max(0, box.x - w - 10 * s);
  const y = Math.max(0, box.y);
  ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2 * s; ctx.strokeRect(x, y, w, h);
  all.slice(0, shown).forEach((l, i) => {
    ctx.fillStyle = i === 0 ? '#0ff' : i === all.length - 1 ? '#f80' : '#fff';
    ctx.fillText(l, x + pad, y + pad + fs + i * lh);
  });
}
