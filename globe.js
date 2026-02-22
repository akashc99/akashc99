// ============================
// THREE.JS WIREFRAME GLOBE
// Bug bounty target locations
// Enhanced animations
// ============================

(function () {
    const container = document.getElementById('globe-container');
    if (!container) return;

    const isAndroid = /Android/i.test(navigator.userAgent);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isAndroid ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Globe wireframe
    const globeSegments = isAndroid ? 20 : 32;
    const globeGeometry = new THREE.SphereGeometry(1, globeSegments, globeSegments);
    const globeMaterial = new THREE.MeshBasicMaterial({
        color: 0xe63946,
        wireframe: true,
        transparent: true,
        opacity: 0.12
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Inner glow sphere (desktop only)
    let innerGlow, halo;
    if (!isAndroid) {
        const innerGeometry = new THREE.SphereGeometry(0.98, 24, 24);
        const innerMaterial = new THREE.MeshBasicMaterial({
            color: 0xe63946,
            transparent: true,
            opacity: 0.03,
            side: THREE.BackSide
        });
        innerGlow = new THREE.Mesh(innerGeometry, innerMaterial);
        scene.add(innerGlow);

        // Atmospheric halo glow
        const haloGeometry = new THREE.SphereGeometry(1.15, 32, 32);
        const haloMaterial = new THREE.MeshBasicMaterial({
            color: 0xe63946,
            transparent: true,
            opacity: 0.04,
            side: THREE.BackSide
        });
        halo = new THREE.Mesh(haloGeometry, haloMaterial);
        scene.add(halo);
    }

    // Equator ring
    const equatorGeometry = new THREE.RingGeometry(1.005, 1.01, 64);
    const equator = new THREE.Mesh(equatorGeometry, new THREE.MeshBasicMaterial({
        color: 0xe63946, transparent: true, opacity: 0.15, side: THREE.DoubleSide
    }));
    scene.add(equator);

    // ---- SCANNING RING ----
    const scanRingGeometry = new THREE.RingGeometry(0.99, 1.03, 64, 1, 0, Math.PI * 0.4);
    const scanRingMaterial = new THREE.MeshBasicMaterial({
        color: 0xe63946,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    const scanRing = new THREE.Mesh(scanRingGeometry, scanRingMaterial);
    scanRing.rotation.x = Math.PI / 2;
    scene.add(scanRing);

    // ---- ORBITING PARTICLE FIELD ----
    const particleCount = isAndroid ? 50 : 200;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const radius = 1.2 + Math.random() * 0.8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i * 3 + 1] = radius * Math.cos(phi);
        particlePositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xe63946,
        size: 0.015,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const particles = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particles);

    // Bug bounty target locations
    const targets = [
        { lat: 37.39, lng: -122.08, name: 'Intel', size: 1.2 },
        { lat: 19.07, lng: 72.87, name: 'Paytm', size: 1.0 },
        { lat: 37.77, lng: -122.41, name: 'Yelp', size: 1.0 },
        { lat: 51.50, lng: -0.12, name: 'Deliveroo', size: 1.1 },
        { lat: 37.39, lng: -121.97, name: 'Instacart', size: 1.0 },
        { lat: 48.14, lng: 11.57, name: 'ESET', size: 0.9 },
        { lat: 37.77, lng: -122.39, name: 'HackerOne', size: 1.1 },
        { lat: 12.97, lng: 77.59, name: 'Goibibo', size: 0.9 },
        { lat: 28.61, lng: 77.20, name: 'Redbus', size: 0.9 },
        { lat: 37.77, lng: -122.41, name: 'Airtable', size: 1.0 },
        { lat: 37.77, lng: -122.41, name: 'Udemy', size: 0.9 },
        { lat: 50.10, lng: 8.68, name: 'Open-Xchange', size: 0.9 },
        { lat: 37.77, lng: -122.41, name: 'Greenhouse', size: 0.9 },
        { lat: 52.52, lng: 13.40, name: 'ZenMate', size: 0.9 },
        { lat: 40.71, lng: -74.00, name: 'Constant Contact', size: 0.9 },
    ];

    function latLngToVector3(lat, lng, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    // Create ping points
    const pingGroup = new THREE.Group();
    const pings = [];

    targets.forEach((target) => {
        const pos = latLngToVector3(target.lat, target.lng, 1.02);

        // Ping dot
        const dotGeometry = new THREE.SphereGeometry(0.02 * target.size, 8, 8);
        const dotMaterial = new THREE.MeshBasicMaterial({
            color: 0xe63946, transparent: true, opacity: 0.9
        });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.copy(pos);
        dot.userData = { name: target.name };
        pingGroup.add(dot);

        // Inner pulse ring
        const ringGeometry = new THREE.RingGeometry(0.01, 0.04 * target.size, 16);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xe63946, transparent: true, opacity: 0.6, side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMat);
        ring.position.copy(pos);
        ring.lookAt(new THREE.Vector3(0, 0, 0));
        pingGroup.add(ring);

        // Outer ripple ring (second wave)
        const outerRingGeom = new THREE.RingGeometry(0.01, 0.06 * target.size, 16);
        const outerRingMat = new THREE.MeshBasicMaterial({
            color: 0xe63946, transparent: true, opacity: 0.3, side: THREE.DoubleSide
        });
        const outerRing = new THREE.Mesh(outerRingGeom, outerRingMat);
        outerRing.position.copy(pos);
        outerRing.lookAt(new THREE.Vector3(0, 0, 0));
        pingGroup.add(outerRing);

        pings.push({ ring, dot, outerRing, phase: Math.random() * Math.PI * 2 });
    });

    scene.add(pingGroup);

    // ---- ANIMATED ARC CONNECTIONS WITH DATA PULSES ----
    const connections = [
        [0, 4], [0, 2], [2, 10], [1, 8], [1, 11], [3, 13], [5, 11], [7, 8]
    ];

    const arcs = [];

    if (!isAndroid) {
        connections.forEach(([a, b]) => {
            const posA = latLngToVector3(targets[a].lat, targets[a].lng, 1.02);
            const posB = latLngToVector3(targets[b].lat, targets[b].lng, 1.02);
            const mid = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
            mid.normalize().multiplyScalar(1.35);

            const curve = new THREE.QuadraticBezierCurve3(posA, mid, posB);
            const points = curve.getPoints(50);

            // Arc line
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xe63946, transparent: true, opacity: 0.08
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);

            // Traveling data pulse dot
            const pulseGeom = new THREE.SphereGeometry(0.012, 6, 6);
            const pulseMat = new THREE.MeshBasicMaterial({
                color: 0xff6b6b, transparent: true, opacity: 0.9
            });
            const pulse = new THREE.Mesh(pulseGeom, pulseMat);
            scene.add(pulse);

            arcs.push({
                curve, pulse, line,
                speed: 0.15 + Math.random() * 0.2,
                progress: Math.random()
            });
        });
    }

    // Mouse and Raycaster
    let targetRotationX = 0;
    let targetRotationY = 0;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const tooltip = document.getElementById('globe-tooltip');
    const bugCursor = document.getElementById('bug-cursor');

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        targetRotationY = x * 0.3;
        targetRotationX = -y * 0.2;

        mouse.x = x;
        mouse.y = y;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(pings.map(p => p.dot));

        if (intersects.length > 0) {
            if (bugCursor) bugCursor.classList.add('hover');
            if (tooltip) {
                tooltip.innerHTML = `<strong>${intersects[0].object.userData.name}</strong>`;
                tooltip.style.left = `${e.clientX - rect.left}px`;
                tooltip.style.top = `${e.clientY - rect.top}px`;
                tooltip.classList.add('visible');
            }
        } else {
            if (bugCursor) bugCursor.classList.remove('hover');
            if (tooltip) tooltip.classList.remove('visible');
        }
    });

    container.addEventListener('mouseleave', () => {
        targetRotationX = 0;
        targetRotationY = 0;
        if (bugCursor) bugCursor.classList.remove('hover');
        if (tooltip) tooltip.classList.remove('visible');
    });

    // Animation loop
    let frameCount = 0;
    function animate() {
        requestAnimationFrame(animate);

        // Throttle to ~30fps on mobile
        if (isAndroid) {
            frameCount++;
            if (frameCount % 2 !== 0) return;
        }

        const time = Date.now() * 0.001;

        // Slow auto-rotation
        globe.rotation.y += 0.002;
        pingGroup.rotation.y += 0.002;
        equator.rotation.y += 0.002;

        // Scanning ring rotation (different axis, faster)
        scanRing.rotation.y = globe.rotation.y;
        scanRing.rotation.z += 0.008;

        // Halo breathing (desktop only)
        if (halo) {
            const haloScale = 1 + Math.sin(time * 0.5) * 0.02;
            halo.scale.set(haloScale, haloScale, haloScale);
            halo.material.opacity = 0.03 + Math.sin(time * 0.8) * 0.015;
        }

        // Mouse-driven rotation
        globe.rotation.x += (targetRotationX - globe.rotation.x * 0.5) * 0.02;
        pingGroup.rotation.x = globe.rotation.x;
        equator.rotation.x = globe.rotation.x;

        // Animate ping pulses (inner + outer ripple)
        pings.forEach((ping) => {
            const scale = 1 + Math.sin(time * 2 + ping.phase) * 0.8;
            ping.ring.scale.set(scale, scale, 1);
            ping.ring.material.opacity = 0.6 * (1 - (scale - 1) / 0.8);

            const outerScale = 1 + Math.sin(time * 1.5 + ping.phase + 1.5) * 1.5;
            ping.outerRing.scale.set(outerScale, outerScale, 1);
            ping.outerRing.material.opacity = 0.25 * Math.max(0, 1 - (outerScale - 1) / 1.5);

            ping.dot.material.opacity = 0.5 + Math.sin(time * 3 + ping.phase) * 0.4;
        });

        // Animate data pulses traveling along arcs
        arcs.forEach((arc) => {
            arc.progress += arc.speed * 0.01;
            if (arc.progress > 1) arc.progress = 0;

            const point = arc.curve.getPoint(arc.progress);
            const euler = new THREE.Euler(globe.rotation.x, globe.rotation.y, 0);
            point.applyEuler(euler);
            arc.pulse.position.copy(point);

            const fade = Math.sin(arc.progress * Math.PI);
            arc.pulse.material.opacity = 0.9 * fade;
            const pulseSize = 0.8 + fade * 0.4;
            arc.pulse.scale.set(pulseSize, pulseSize, pulseSize);
        });

        // Rotate particle field slowly (opposite direction)
        particles.rotation.y -= 0.0005;
        particles.rotation.x += 0.0002;
        particleMaterial.opacity = 0.35 + Math.sin(time * 0.3) * 0.15;

        renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
})();
