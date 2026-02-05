import type { Context } from "hono";

const THREE_JS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js";

export function Layout({ children, title = "O-ring fly" }: { children: string; title?: string }) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Endfield Tactical Terminal v5.0</title>
  <link rel="stylesheet" href="/style.css">
  <script src="${THREE_JS_CDN}"></script>
</head>
<body style="margin:0;padding:0;background:#050505;color:#fff;font-family:'Inter',-apple-system,sans-serif;overflow-x:hidden;min-height:100vh;">
  <!-- Three.js background -->
  <div id="canvas-container" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;"></div>
  <div class="scanline"></div>

  <!-- HUD overlay -->
  <div style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:100;pointer-events:none;">
    <div style="position:absolute;top:15px;left:15px;width:60px;height:60px;border-top:1px solid #888;border-left:1px solid #888;"></div>
    <div style="position:absolute;bottom:15px;right:15px;width:60px;height:60px;border-bottom:1px solid #888;border-right:1px solid #888;"></div>
    <div style="position:absolute;top:20px;right:20px;text-align:right;font-family:monospace;font-size:11px;color:#00e5ff;line-height:1.4;">
      SYSTEM_TIME: <span id="hud-time">--:--:--</span><br>
      LAT: 35.6895° N [REDACTED]<br>
      LON: 139.6917° E [REDACTED]<br>
      SIGNAL: ENCRYPTED // STABLE
    </div>
  </div>

  <!-- Navigation -->
  <nav style="position:fixed;bottom:40px;left:40px;z-index:100;display:flex;flex-direction:column;gap:12px;">
    <a href="/" class="nav-item" style="font-weight:900;font-size:1rem;text-transform:uppercase;letter-spacing:2px;color:#888;text-decoration:none;display:flex;align-items:center;transition:all 0.2s;cursor:pointer;"
       onmouseover="this.style.color='#ffd700';this.style.paddingLeft='10px'"
       onmouseout="this.style.color='#888';this.style.paddingLeft='0'">Operations</a>
    <a href="/content" class="nav-item" style="font-weight:900;font-size:1rem;text-transform:uppercase;letter-spacing:2px;color:#888;text-decoration:none;display:flex;align-items:center;transition:all 0.2s;cursor:pointer;"
       onmouseover="this.style.color='#ffd700';this.style.paddingLeft='10px'"
       onmouseout="this.style.color='#888';this.style.paddingLeft='0'">Archives</a>
  </nav>

  <!-- Page content -->
  <div style="position:relative;z-index:20;min-height:100vh;">
    ${children}
  </div>

  <script>
    // --- HUD Clock ---
    function updateTime() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const el = document.getElementById("hud-time");
      if (el) el.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    }
    setInterval(updateTime, 1000);
    updateTime();

    // --- Three.js Scene ---
    (function() {
      const container = document.getElementById("canvas-container");
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      // Wireframe terrain
      const geometry = new THREE.PlaneGeometry(120, 120, 60, 60);
      const material = new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: true, transparent: true, opacity: 0.08 });
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        pos.setZ(i, Math.sin(pos.getX(i) * 0.15) * Math.cos(pos.getY(i) * 0.15) * 2.5);
      }
      const terrain = new THREE.Mesh(geometry, material);
      terrain.rotation.x = -Math.PI / 2.2;
      terrain.position.y = -8;
      scene.add(terrain);

      // Particle cloud
      const particlesGeo = new THREE.BufferGeometry();
      const posArr = new Float32Array(2500 * 3);
      for (let i = 0; i < posArr.length; i++) posArr[i] = (Math.random() - 0.5) * 80;
      particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
      const particlesMesh = new THREE.Points(particlesGeo, new THREE.PointsMaterial({ size: 0.06, color: 0xffffff, transparent: true, opacity: 0.3 }));
      scene.add(particlesMesh);

      camera.position.set(0, 0, 20);

      let mouseX = 0, mouseY = 0, time = 0;
      document.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      });

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

      window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      animate();
    })();
  </script>
</body>
</html>`;
}
