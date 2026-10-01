import * as faceapi from '@vladmandic/face-api';
import { people, addSample, clearAll } from './db.js';
import { fakeProfile, drawProfile } from './profiler.js';

const MODELS = `${import.meta.env.BASE_URL}models`; // copiados a public/models al hacer npm install
const THRESHOLD = 0.5; // distancia máxima para considerar match; más bajo = más estricto

const $ = id => document.getElementById(id);
const [statusEl, video, overlay, register, nameEl, clearBtn, peopleEl, hackEl] =
  ['statusEl', 'video', 'overlay', 'register', 'nameEl', 'clearBtn', 'people', 'hackEl'].map($);

let hackSince = 0;
hackEl.onchange = () => hackSince = performance.now();

$('cctvEl').onchange = e => $('stage').classList.toggle('cctv', e.target.checked);
setInterval(() => $('clockEl').textContent = new Date().toLocaleString('sv-SE'), 1000); // sv-SE = AAAA-MM-DD hh:mm:ss

const matcher = () => {
  const labeled = people().map(([name, ds]) =>
    new faceapi.LabeledFaceDescriptors(name, ds.map(d => new Float32Array(d))));
  return labeled.length ? new faceapi.FaceMatcher(labeled, THRESHOLD) : null;
};

const renderPeople = () => {
  peopleEl.innerHTML = people()
    .map(([n, ds]) => `<li>${n.replace(/</g, '&lt;')} (${ds.length} muestra${ds.length > 1 ? 's' : ''})</li>`).join('');
};

const detect = () => faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();

register.onsubmit = async e => {
  e.preventDefault();
  const faces = await detect();
  if (faces.length !== 1) return statusEl.textContent = `Necesito exactamente 1 cara en cámara (hay ${faces.length}).`;
  const n = nameEl.value.trim();
  addSample(n, faces[0].descriptor);
  renderPeople(); nameEl.value = '';
  statusEl.textContent = `Registrado: ${n}`;
};

clearBtn.onclick = () => { clearAll(); renderPeople(); };

async function loop() {
  const faces = await detect();
  const dims = faceapi.matchDimensions(overlay, video, true);
  const m = matcher();
  const ctx = overlay.getContext('2d');
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  for (const [i, f] of faceapi.resizeResults(faces, dims).entries()) {
    const match = m?.findBestMatch(f.descriptor);
    new faceapi.draw.DrawBox(f.detection.box, { label: match ? match.toString() : 'sin registros' }).draw(overlay);
    if (hackEl.checked) {
      const known = match && match.label !== 'unknown';
      const name = known ? match.label : 'Desconocido';
      drawProfile(ctx, f.detection.box, name, fakeProfile(known ? name : 'unknown' + i), hackSince);
    }
  }
  requestAnimationFrame(loop);
}

try {
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODELS),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODELS),
  ]);
  video.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
  await new Promise(r => video.onloadedmetadata = r);
  statusEl.textContent = 'Listo. Ponte frente a la cámara, escribe tu nombre y pulsa Registrar.';
  renderPeople();
  loop();
} catch (err) {
  statusEl.textContent = 'Error: ' + err.message;
}
