// NASA-STYLE PROFESSIONAL SOLAR SYSTEM VISUALIZATION
// Clean, intentional, scientifically accurate layout

function initCosmicSystem() {
    const container = document.getElementById('cosmic-system-container');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Create tooltip element - positioned relative to container
    const tooltip = document.createElement('div');
    tooltip.id = 'planet-tooltip';
    tooltip.className = 'planet-tooltip';
    tooltip.style.cssText = `
        position: fixed;
        background: rgba(10, 15, 30, 0.9);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(0, 242, 254, 0.4);
        border-radius: 12px;
        padding: 16px 20px;
        color: white;
        font-family: 'Rajdhani', 'Segoe UI', sans-serif;
        pointer-events: none;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.25s ease;
        z-index: 9999;
        max-width: 260px;
        box-shadow: 0 12px 40px rgba(0, 242, 254, 0.2), inset 0 1px 0 rgba(255,255,255,0.1);
    `;
    document.body.appendChild(tooltip);

    // ── THREE.JS SETUP ────────────────────────────────────────
    const scene = new THREE.Scene();
    const W = container.clientWidth;
    const H = container.clientHeight;
    
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 2000);
    camera.position.set(0, 40, 80);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── LIGHTING ─────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffddaa, 2, 200);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const dirLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    dirLight.position.set(-50, 30, -50);
    scene.add(dirLight);

    // ── ENHANCED 4-ARM SPIRAL GALAXY BACKGROUND ────────────────
    function createSpiralGalaxy() {
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 4000 : 8000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        const arms = 4;
        
        // Color palette from TSX: cyan, purple, pink, white
        const cyanColor = new THREE.Color("hsl(185, 100%, 60%)");
        const purpleColor = new THREE.Color("hsl(270, 60%, 60%)");
        const pinkColor = new THREE.Color("hsl(300, 60%, 55%)");
        const whiteColor = new THREE.Color("hsl(200, 20%, 90%)");
        const palette = [cyanColor, purpleColor, pinkColor, whiteColor];
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Spiral distribution matching TSX logic
            const radius = Math.random() * 150 + 20;
            const arm = (i % arms) * ((Math.PI * 2) / arms);
            const spin = radius * 0.02; // Scale down for our larger scene
            const scatter = (Math.random() - 0.5) * (8 + radius * 0.3);
            
            positions[i3] = Math.cos(arm + spin) * radius + scatter;
            positions[i3 + 1] = (Math.random() - 0.5) * 8 * (1 + radius * 0.02);
            positions[i3 + 2] = Math.sin(arm + spin) * radius + scatter;
            
            // Color based on distance with random palette selection
            const distRatio = radius / 170;
            const chosenColor = palette[Math.floor(Math.random() * palette.length)];
            const mixedColor = chosenColor.clone().lerp(whiteColor, distRatio * 0.3);
            
            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        const galaxy = new THREE.Points(geometry, material);
        galaxy.name = 'galaxy';
        // Apply tilt matching TSX: rotation={[0.6, 0, 0.2]}
        galaxy.rotation.x = 0.6;
        galaxy.rotation.y = 0.2;
        scene.add(galaxy);
        return galaxy;
    }

    const galaxy = createSpiralGalaxy();
    
    // ── GALAXY CORE (Pulsating Center) ────────────────────────
    const coreGeometry = new THREE.SphereGeometry(2, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
    });
    const galaxyCore = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(galaxyCore);

    // ── SUN ───────────────────────────────────────────────────
    const sunGeometry = new THREE.SphereGeometry(3.5, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffdd88,
        transparent: true,
        opacity: 0.95
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.name = 'Sun';
    sun.userData = {
        label: '☉ THE SUN',
        facts: ['Type: G-type main-sequence', 'Surface: 5,500°C', '99.86% of Solar System mass']
    };
    scene.add(sun);

    // Sun glow layers (atmospheric bloom)
    for (let i = 0; i < 3; i++) {
        const glowGeo = new THREE.SphereGeometry(4.5 + i * 1.2, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: i === 0 ? 0xffaa44 : 0xff6644,
            transparent: true,
            opacity: 0.08 - i * 0.015,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        sun.add(glow);
    }

    // ── PLANETS DATA ─────────────────────────────────────────
    const PLANETS = [
        { 
            name: 'Mercury', r: 0.6, dist: 10, speed: 4.15, 
            color: 0x8c8c8c, emissive: 0x222222,
            label: '☿ MERCURY',
            facts: ['Distance: 57.9 million km', 'Orbital: 88 days', 'Temp: -173°C to 427°C', 'No moons']
        },
        { 
            name: 'Venus', r: 0.9, dist: 14, speed: 1.62, 
            color: 0xe6c288, emissive: 0x332211,
            label: '♀ VENUS',
            facts: ['Distance: 108.2 million km', 'Orbital: 225 days', 'Temp: 462°C', 'No moons']
        },
        { 
            name: 'Earth', r: 1.0, dist: 19, speed: 1.0, 
            color: 0x2288ff, emissive: 0x001133,
            label: '🌍 EARTH',
            facts: ['Distance: 149.6 million km', 'Orbital: 365 days', 'Temp: -88°C to 58°C', '1 moon']
        },
        { 
            name: 'Mars', r: 0.7, dist: 25, speed: 0.53, 
            color: 0xcc4422, emissive: 0x331100,
            label: '♂ MARS',
            facts: ['Distance: 227.9 million km', 'Orbital: 687 days', 'Temp: -153°C to 20°C', '2 moons']
        },
        { 
            name: 'Jupiter', r: 2.8, dist: 38, speed: 0.084, 
            color: 0xd4a574, emissive: 0x332211,
            label: '♃ JUPITER',
            facts: ['Distance: 778.5 million km', 'Orbital: 12 years', 'Temp: -108°C', '95 moons']
        },
        { 
            name: 'Saturn', r: 2.3, dist: 52, speed: 0.034, 
            color: 0xf0d090, emissive: 0x332211,
            label: '♄ SATURN',
            hasRings: true,
            facts: ['Distance: 1.4 billion km', 'Orbital: 29 years', 'Temp: -139°C', '146 moons']
        }
    ];

    // ── CREATE PLANETS ───────────────────────────────────────
    const planetMeshes = [];
    const orbitRings = [];
    let time = 0;

    PLANETS.forEach((pd, idx) => {
        // Orbit ring
        const ringGeo = new THREE.RingGeometry(pd.dist - 0.05, pd.dist + 0.05, 128);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00f2fe,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
        orbitRings.push(ring);

        // Planet group
        const planetGroup = new THREE.Group();
        
        // Planet mesh
        const planetGeo = new THREE.SphereGeometry(pd.r, 32, 32);
        const planetMat = new THREE.MeshStandardMaterial({
            color: pd.color,
            emissive: pd.emissive,
            emissiveIntensity: 0.2,
            roughness: 0.7,
            metalness: 0.1
        });
        const planet = new THREE.Mesh(planetGeo, planetMat);
        planet.userData = { pd: pd, isPlanet: true };
        planetGroup.add(planet);

        // Atmospheric glow
        const glowGeo = new THREE.SphereGeometry(pd.r * 1.2, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: pd.color,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        planet.add(glow);

        // Saturn rings
        if (pd.hasRings) {
            const saturnRingGeo = new THREE.RingGeometry(pd.r * 1.4, pd.r * 2.2, 64);
            const saturnRingMat = new THREE.MeshBasicMaterial({
                color: 0xc8a070,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
            const saturnRing = new THREE.Mesh(saturnRingGeo, saturnRingMat);
            saturnRing.rotation.x = Math.PI / 2;
            saturnRing.rotation.z = Math.PI / 6;
            planet.add(saturnRing);
        }

        scene.add(planetGroup);
        planetMeshes.push({ group: planetGroup, mesh: planet, data: pd, angle: Math.random() * Math.PI * 2 });
    });

    // ── MOUSE INTERACTION & PARALLAX ───────────────────────────
    let mouseX = 0, mouseY = 0;
    let targetCameraX = 0, targetCameraY = 0;
    let hoveredPlanet = null;
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let lastMouseEvent = null;

    function onMouseMove(e) {
        lastMouseEvent = e;
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        let foundPlanet = null;
        for (let hit of intersects) {
            if (hit.object.userData.isPlanet) {
                foundPlanet = hit.object;
                break;
            }
            if (hit.object.name === 'Sun') {
                foundPlanet = hit.object;
                break;
            }
        }

        if (foundPlanet !== hoveredPlanet) {
            // Reset previous hover
            if (hoveredPlanet && hoveredPlanet !== sun) {
                hoveredPlanet.scale.set(1, 1, 1);
            }
            
            hoveredPlanet = foundPlanet;
            
            // Apply new hover
            if (hoveredPlanet) {
                container.style.cursor = 'pointer';
                if (hoveredPlanet !== sun) {
                    hoveredPlanet.scale.set(1.3, 1.3, 1.3);
                }
                
                const data = hoveredPlanet.userData.pd || hoveredPlanet.userData;
                if (data) {
                    tooltip.innerHTML = `
                        <div style="font-family: 'Orbitron', sans-serif; font-size: 13px; color: #00f2fe; margin-bottom: 10px; letter-spacing: 2px; text-transform: uppercase; border-bottom: 1px solid rgba(0,242,254,0.2); padding-bottom: 6px;">${data.label || data.name}</div>
                        ${(data.facts || []).map(f => `<div style="font-size: 12px; color: rgba(255,255,255,0.85); margin-bottom: 5px; display: flex; align-items: flex-start; gap: 8px; line-height: 1.4;"><span style="color: #00f2fe; font-size: 6px; margin-top: 5px; flex-shrink: 0;">◆</span><span>${f}</span></div>`).join('')}
                    `;
                    tooltip.style.opacity = '1';
                    tooltip.style.transform = 'translateY(0)';
                }
            } else {
                container.style.cursor = '';
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateY(10px)';
            }
        }

        // Update tooltip position
        if (tooltip.style.opacity === '1' && lastMouseEvent) {
            const x = Math.min(Math.max(lastMouseEvent.clientX + 20, 16), window.innerWidth - 276);
            const y = Math.min(Math.max(lastMouseEvent.clientY - 60, 16), window.innerHeight - 120);
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        }
    }

    renderer.domElement.addEventListener('mousemove', onMouseMove, { passive: true });

    // ── ANIMATION LOOP ───────────────────────────────────────
    let isActive = true;
    let frameCount = 0;
    
    // Tab visibility handling
    document.addEventListener('visibilitychange', () => {
        isActive = !document.hidden;
    });

    function animate() {
        if (!isActive) {
            requestAnimationFrame(animate);
            return;
        }

        frameCount++;
        time += 0.001;

        // Rotate galaxy - TSX style rotation.y += delta * 0.05
        if (galaxy) {
            galaxy.rotation.y += 0.0008;
        }
        
        // Pulsate galaxy core
        const coreScale = 1 + Math.sin(time * 0.5) * 0.15;
        galaxyCore.scale.set(coreScale, coreScale, coreScale);
        
        // Rotate galaxy core
        galaxyCore.rotation.y += 0.002;

        // Rotate sun
        sun.rotation.y += 0.002;

        // Orbit planets
        planetMeshes.forEach((p, idx) => {
            // Update angle
            p.angle += p.data.speed * 0.005;
            
            // Calculate position
            p.group.position.x = Math.cos(p.angle) * p.data.dist;
            p.group.position.z = Math.sin(p.angle) * p.data.dist;
            
            // Rotate planet on axis
            p.mesh.rotation.y += 0.01;
            
            // Subtle glow pulse
            if (p.mesh.children[0]) {
                p.mesh.children[0].material.opacity = 0.1 + Math.sin(time * 2 + idx) * 0.05;
            }
        });

        // Orbit rings pulse
        orbitRings.forEach((ring, idx) => {
            ring.material.opacity = 0.15 + Math.sin(time * 1.5 + idx * 0.5) * 0.05;
        });

        // Parallax camera movement (every 2nd frame for performance)
        if (frameCount % 2 === 0) {
            targetCameraX = mouseX * 5;
            targetCameraY = mouseY * 3 + 40;
            
            camera.position.x += (targetCameraX - camera.position.x) * 0.03;
            camera.position.y += (targetCameraY - camera.position.y) * 0.03;
            camera.lookAt(0, 0, 0);
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();

    // ── RESIZE HANDLER ───────────────────────────────────────
    window.addEventListener('resize', () => {
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
    }, { passive: true });
}

// Make initCosmicSystem available globally
window.initCosmicSystem = initCosmicSystem;
