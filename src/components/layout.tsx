/** @jsx jsx */
import { jsx } from "hono/jsx";

export function Layout({ children, title = "O-ring fly | Endfield Tactical Terminal v5.0" }: { children: any; title?: string }) {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <link rel="stylesheet" href="/style.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js" />
      </head>
      <body>
        <div id="canvas-container"></div>
        <div class="scanline"></div>

        {children}

        <div class="hud-ui">
          <div class="corner tl"></div>
          <div class="corner br"></div>
          <div class="system-info" id="system-info">
            SYSTEM_TIME: --:--:--<br />
            LAT: 35.6895° N [REDACTED]<br />
            LON: 139.6917° E [REDACTED]<br />
            SIGNAL: ENCRYPTED // STABLE
          </div>
        </div>

        <nav class="nav-menu">
          <a href="/" class="nav-item">Operations</a>
          <a href="/content" class="nav-item">Personnel</a>
          <a href="/content" class="nav-item">Infrastructure</a>
          <a href="/content" class="nav-item">Archives</a>
        </nav>

        <script dangerouslySetInnerHTML={{ __html: threejsScript }} />
        <script dangerouslySetInnerHTML={{ __html: clockScript }} />
      </body>
    </html>
  );
}

const clockScript = `
(function() {
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const el = document.getElementById('system-info');
    if (el) {
      el.innerHTML = 'SYSTEM_TIME: ' + h + ':' + m + ':' + s + '<br>' +
        'LAT: 35.6895° N [REDACTED]<br>' +
        'LON: 139.6917° E [REDACTED]<br>' +
        'SIGNAL: ENCRYPTED // STABLE';
    }
  }
  tick();
  setInterval(tick, 1000);
})();
`;

const threejsScript = `
(function() {
  const container = document.getElementById('canvas-container');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Wireframe terrain
  const geometry = new THREE.PlaneGeometry(120, 120, 60, 60);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    wireframe: true,
    transparent: true,
    opacity: 0.08
  });

  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, Math.sin(x * 0.15) * Math.cos(y * 0.15) * 2.5);
  }

  const terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI / 2.2;
  terrain.position.y = -8;
  scene.add(terrain);

  // Particle cloud
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 2500;
  const posArray = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 80;
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.06,
    color: 0xffffff,
    transparent: true,
    opacity: 0.3
  });
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  camera.position.set(0, 0, 20);

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', function(e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.005;

    terrain.position.z = (time * 5) % 4;
    particlesMesh.rotation.y += 0.0003;

    camera.position.x += (mouseX * 4 - camera.position.x) * 0.03;
    camera.position.y += (mouseY * 2 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
})();
`;
