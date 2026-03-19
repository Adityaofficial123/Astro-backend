document.addEventListener('DOMContentLoaded', () => {
    initLoader(); // Start with loader
});

// 2. CINEMATIC LOADER
function initLoader() {
    const loader = document.getElementById('cinematic-loader');
    if (!loader) {
        initApp(); // Run app if no loader (other pages)
        return;
    }
    const rocket = loader.querySelector('.rocket-wrapper');
    const panels = loader.querySelectorAll('.loader-panel');
    const status = loader.querySelector('.loader-status');

    // Sequence:
    // 1. Ignition (Show status)
    setTimeout(() => {
        status.style.opacity = '1';
    }, 500);

    // 2. Launch
    setTimeout(() => {
        rocket.classList.add('launch');
        status.textContent = "Max Q Reached";
    }, 1200);

    // 3. Curtains Open
    setTimeout(() => {
        panels.forEach(p => p.classList.add('slide-out'));
        document.body.classList.remove('overflow-hidden');
    }, 2200);

    // 4. Initialize App & Fade In Hero
    setTimeout(() => {
        initApp();
        loader.style.display = 'none';
    }, 3400);
}

function initApp() {
    injectComponents();
    initCursor();
    initFirebase();

    const path = window.location.pathname;

    if (path.includes('members')) loadMembers();
    if (path.includes('programs')) loadEvents();
    if (path.includes('gallery')) loadGallery();

    if (path.includes('index') || path === '/') {
        initThreeJS(); // Stars background
        initCosmicSystem(); // Hero cosmic system only on home
        initDailyFact();
    } else {
        initCanvasStars();
    }

    if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });
}

// 1. COMPONENT INJECTION (Nav & Footer)
function injectComponents() {
    const links = [
        { n: 'Home', u: 'index.html' }, { n: 'Members', u: 'members.html' }, 
        { n: 'Programs', u: 'programs.html' }, { n: 'Gallery', u: 'gallery.html' },
        { n: 'About', u: 'about.html' }, { n: 'Contact', u: 'contact.html' }
    ];
    const active = window.location.pathname.split('/').pop() || 'index.html';
    const activeNormalized = (active === '' || active === '/') ? 'index.html' : active;

    // Nav
    const navHTML = `
        <div class="container mx-auto px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="nav-logo">
                    <img src="logo.png" alt="Astronomy & Astrophysics Society logo" class="nav-logo__img">
                </div>
                <span class="nav-brand text-white font-heading font-bold tracking-[0.14em] uppercase leading-tight">
                    <span class="nav-brand__full hidden sm:inline">ASTRONOMY &amp; ASTROPHYSICS SOCIETY</span>
                    <span class="nav-brand__short sm:hidden">ASTRONOMY &amp; ASTROPHYSICS SOCIETY</span>
                </span>
            </div>
            <div class="hidden md:flex items-center gap-8">
                ${links.map(l => `<a href="${l.u}" class="nav-link ${activeNormalized.includes(l.u) ? 'active' : ''}">${l.n}</a>`).join('')}
            </div>
            <button class="md:hidden text-white text-2xl mobile-toggle"><i class="fas fa-bars"></i></button>
        </div>
        <div class="mobile-menu hidden absolute top-20 left-0 w-full bg-black/95 p-6 text-center border-b border-white/10">
            ${links.map(l => `<a href="${l.u}" class="block py-3 text-white hover:text-cyan-400 mobile-menu-link">${l.n}</a>`).join('')}
        </div>`;

    const nav = document.createElement('nav');
    nav.innerHTML = navHTML;
    document.body.prepend(nav);

    // Mobile Toggle
    const toggleBtn = document.querySelector('.mobile-toggle');
    const menu = document.querySelector('.mobile-menu');
    const openMenu = () => {
        if (!menu) return;
        menu.classList.remove('hidden');
        menu.classList.add('active');
    };
    const closeMenu = () => {
        if (!menu) return;
        menu.classList.remove('active');
        menu.classList.add('hidden');
    };
    const toggleMenu = () => {
        if (!menu) return;
        if (menu.classList.contains('hidden')) openMenu();
        else closeMenu();
    };

    toggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu on link click
    document.querySelectorAll('.mobile-menu-link').forEach(a => {
        a.addEventListener('click', () => closeMenu());
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!menu || menu.classList.contains('hidden')) return;
        if (menu.contains(e.target) || toggleBtn?.contains(e.target)) return;
        closeMenu();
    });

    // Close menu on resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) closeMenu();
    });

    // Footer (skip on admin)
    if (!activeNormalized.includes('admin')) {
        const foot = document.createElement('footer');
        foot.className = "relative z-50 bg-[#02040a] border-t border-white/10 pt-20 pb-10 mt-20 overflow-hidden";
        foot.innerHTML = `
                <!-- Decorative Top Glow -->
                <div class="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_var(--cyan-glow)]"></div>

                <div class="container mx-auto px-6">
                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        
                        <!-- Column 1: Brand Info -->
                        <div class="space-y-6">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                    <i class="fas fa-meteor text-white"></i>
                                </div>
                                <span class="text-xl sm:text-2xl font-bold tracking-[0.14em] text-white uppercase" style="font-family: 'Orbitron', sans-serif;">ASTRONOMY &amp; ASTROPHYSICS SOCIETY</span>
                            </div>
                            <p class="text-gray-400 leading-relaxed">
                                Exploring the infinite cosmos, one star at a time. Join our mission to decode the universe through observation and research.
                            </p>
                        </div>

                        <!-- Column 2: Navigation -->
                        <div>
                            <h3 class="text-lg font-bold text-white mb-6 tracking-widest uppercase" style="font-family: 'Orbitron', sans-serif;">Mission Links</h3>
                            <ul class="space-y-4">
                                <li><a href="index.html" class="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><i class="fas fa-chevron-right text-xs text-purple-500"></i> Home</a></li>
                                <li><a href="about.html" class="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><i class="fas fa-chevron-right text-xs text-purple-500"></i> About Us</a></li>
                                <li><a href="members.html" class="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><i class="fas fa-chevron-right text-xs text-purple-500"></i> The Team</a></li>
                                <li><a href="programs.html" class="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><i class="fas fa-chevron-right text-xs text-purple-500"></i> Programs</a></li>
                            </ul>
                        </div>

                        <!-- Column 3: Resources / Gallery -->
                        <div>
                            <h3 class="text-lg font-bold text-white mb-6 tracking-widest uppercase" style="font-family: 'Orbitron', sans-serif;">Discover</h3>
                            <ul class="space-y-4">
                                <li><a href="gallery.html" class="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><i class="fas fa-chevron-right text-xs text-purple-500"></i> Deep Space Gallery</a></li>
                                <li><a href="contact.html" class="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><i class="fas fa-chevron-right text-xs text-purple-500"></i> Contact Support</a></li>
                                <li><a href="#" class="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><i class="fas fa-chevron-right text-xs text-purple-500"></i> Privacy Policy</a></li>
                            </ul>
                        </div>

                        <!-- Column 4: Connect -->
                        <div>
                            <h3 class="text-lg font-bold text-white mb-6 tracking-widest uppercase" style="font-family: 'Orbitron', sans-serif;">Signal Us</h3>
                            
                            <!-- Social Links -->
                            <div class="space-y-4">
                                <a href="https://chat.whatsapp.com/IQbOWh8nZhN401xweqOG4z?mode=gi_t" target="_blank" class="group flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-green-500/50 transition-all duration-300">
                                    <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition">
                                        <i class="fab fa-whatsapp text-green-400 group-hover:text-white"></i>
                                    </div>
                                    <span class="text-gray-300 group-hover:text-white">WhatsApp Channel</span>
                                </a>

                                <a href="https://www.instagram.com/aasg_gcoea?igsh=OGE5ODhtYzkzb2hi" target="_blank" class="group flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-pink-500/50 transition-all duration-300">
                                    <div class="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition">
                                        <i class="fab fa-instagram text-pink-400 group-hover:text-white"></i>
                                    </div>
                                    <span class="text-gray-300 group-hover:text-white">Instagram</span>
                                </a>
<a href="mailto:astrophy@gcoea.in" class="group flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300">
    
    <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition">
        <i class="fas fa-envelope text-blue-400 group-hover:text-white"></i>
    </div>

    <span class="text-gray-300 group-hover:text-white">Email</span>

</a>
                            </div>

                            <div class="mt-6 flex items-center gap-2 text-sm text-gray-500">
                                <i class="fas fa-envelope text-cyan-500"></i>
                                <span>adityataywadeofficial@gmail.com</span>
                            </div>
                        </div>
                    </div>

                    <!-- Copyright Bar -->
                    <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p class="text-gray-500 text-sm">
                            &copy; ${new Date().getFullYear()} Astronomy & Astrophysics Society. All rights reserved.
                        </p>
                        <p class="text-gray-600 text-xs uppercase tracking-widest">
                            <span class="inline-block bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold dev-credit-glow">
                                Designed And Developed By Aditya Taywade
                            </span>
                        </p>
                    </div>
                </div>
            `;
        document.body.appendChild(foot);
    }
}

// 2. ROBOT LOGIC (Removed in favor of Cosmic System)
function initRobot() {}

// 4. COSMIC SYSTEM — Full-viewport Hero Solar System
// NOTE: This function is now in hero-animation.js
// function initCosmicSystem() { ... } moved to separate file

/*
function initCosmicSystem() {
    // Old implementation moved to hero-animation.js
}
*/
// 3. CURSOR TRAIL
function initCursor() {
    const cvs = document.createElement('canvas');
    cvs.id = 'cursor-canvas';
    document.body.appendChild(cvs);
    const ctx = cvs.getContext('2d');
    let points = [], mouse = { x: 0, y: 0 };

    const resize = () => { cvs.width = window.innerWidth; cvs.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    const animate = () => {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        points.push({ x: mouse.x, y: mouse.y, age: 0 });
        if (points.length > 25) points.shift();

        ctx.beginPath();
        if (points.length > 1) {
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                const p = points[i];
                ctx.lineTo(p.x, p.y);
                p.age++;
            }
        }
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00f2fe';
        ctx.strokeStyle = ctx.createLinearGradient(0, 0, cvs.width, cvs.height);
        ctx.strokeStyle.addColorStop(0, '#764ba2');
        ctx.strokeStyle.addColorStop(1, '#00f2fe');
        ctx.stroke();
        requestAnimationFrame(animate);
    };
    animate();
}

// 4. THREE.JS PLANET (Homepage Only)
function initThreeJS() {
    const container = document.getElementById('bg-canvas');

    if (!container) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const geo = new THREE.BufferGeometry();
    const count = 2000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 10;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 0.02, color: 0x00f2fe });
    const sphere = new THREE.Points(geo, mat);
    scene.add(sphere);
    camera.position.z = 2;

    const animate = () => {
        requestAnimationFrame(animate);
        sphere.rotation.y += 0.002;
        sphere.rotation.x += 0.001;
        renderer.render(scene, camera);
    };
    animate();

}

// 5. CANVAS STARS (Inner Pages)
function initCanvasStars() {
    let cvs = document.getElementById('bg-canvas');
    if (!cvs) {
        cvs = document.createElement('canvas');
        cvs.id = 'bg-canvas';
        document.body.appendChild(cvs);
    }
    if (cvs.tagName.toLowerCase() !== 'canvas') {
        const canvas = document.createElement('canvas');
        canvas.id = 'bg-canvas';
        cvs.replaceWith(canvas);
        cvs = canvas;
    }
    const ctx = cvs.getContext('2d');
    let stars = [];
    const resize = () => {
        cvs.width = window.innerWidth; cvs.height = window.innerHeight;
        stars = Array(100).fill().map(() => ({
            x: Math.random() * cvs.width, y: Math.random() * cvs.height, r: Math.random() * 2, s: Math.random() * 0.5
        }));
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.fillStyle = "white";
        stars.forEach(s => {
            s.y -= s.s;
            if (s.y < 0) s.y = cvs.height;
            ctx.globalAlpha = Math.random() * 0.5 + 0.3;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        });
        requestAnimationFrame(animate);
    };
    animate();
}

// 6. FIREBASE DATA LOADING
let db;
function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('[Firebase] SDK not loaded');
        return;
    }
    if (typeof CONFIG === 'undefined' || !CONFIG?.firebase) {
        console.error('[Firebase] CONFIG.firebase missing');
        return;
    }

    try {
        if (!firebase.apps?.length) firebase.initializeApp(CONFIG.firebase);
        db = firebase.database();
    } catch (e) {
        console.error('[Firebase] init failed', e);
    }
}

function loadMembers() {
    if (!db) return;
    db.ref('members').on('value', snap => {
        const data = snap.val() || {};
        const grid = document.getElementById('membersGrid');
        if (grid) {
            const members = Object.values(data);

            const normalize = (s) => String(s || '').trim();
            const roleText = (m) => normalize(m.role);
            const roleKey = (m) => roleText(m).toLowerCase();
            const isFounding = (m) => /(founding|founder|founded|foun(d|i)d)/i.test(roleKey(m));
            const isTechnical = (m) => /tech|technical/i.test(roleText(m));
            const isTechnicalHead = (m) => /technical\s*head/i.test(roleText(m));

            const founding = members.filter(isFounding);
            const technical = members.filter(m => !isFounding(m) && isTechnical(m));
            const regular = members.filter(m => !isFounding(m) && !isTechnical(m));

            const card = (m, variant) => {
                const img = m.image || 'https://via.placeholder.com/256';
                const name = normalize(m.name) || 'Member';
                const role = roleText(m) || 'Member';
                const branch = normalize(m.branch);
                const year = normalize(m.year);

                const variantClass = variant === 'founding'
                    ? 'member-card member-card--founding'
                    : (isTechnicalHead(m) ? 'member-card member-card--tech-head' : 'member-card');

                const roleBadgeClass = variant === 'founding'
                    ? 'member-role member-role--founding'
                    : (isTechnicalHead(m) ? 'member-role member-role--tech-head' : 'member-role');

                return `
                        <div class="holo-card p-6 text-center group ${variantClass}">
                            <div class="member-role-wrap">
                                <span class="${roleBadgeClass}">${role}</span>
                            </div>
                            <div class="w-32 h-32 mx-auto rounded-full p-1 bg-gradient-to-br from-cyan-400 to-purple-600 mb-4">
                                <img src="${img}" class="w-full h-full object-cover rounded-full border-4 border-black" alt="${name}">
                            </div>
                            <h3 class="text-xl font-bold text-white">${name}</h3>
                            <div class="member-meta">
                                ${branch ? `<div class=\"member-meta-branch\">${branch}</div>` : ''}
                                ${year ? `<div class=\"member-meta-year\">${year}</div>` : ''}
                            </div>
                        </div>
                    `;
            };

            const section = (title, items, variant) => {
                if (!items.length) return '';
                return `
                        <div class="col-span-full" data-aos="fade-up">
                            <div class="member-section-title">
                                <h2>${title}</h2>
                                <div class="member-section-line"></div>
                            </div>
                        </div>
                        ${items.map(m => card(m, variant)).join('')}
                    `;
            };

            grid.innerHTML = [
                section('Founding Members', founding, 'founding'),
                section('Technical Team', technical, 'tech'),
                section('Members', regular, 'regular')
            ].join('');
        }
    });
}

function loadEvents() {
    if (!db) return;
    db.ref('events').once('value', snap => {
        const data = snap.val() || {};
        const grid = document.getElementById('eventsGrid');
        if (grid) {
            const entries = Object.entries(data);
            // newest first (fallback if date missing)
            entries.sort((a, b) => new Date(b[1].date || 0) - new Date(a[1].date || 0));

            grid.innerHTML = entries.map(([id, e]) => {
                const img = e.image || 'https://via.placeholder.com/600x400';
                return `
                    <button type="button" class="holo-card group overflow-hidden text-left" data-event-id="${id}">
                        <div class="h-48 overflow-hidden">
                            <img src="${img}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt="${(e.title || 'Program').replace(/\"/g, '&quot;')}">
                        </div>
                        <div class="p-6">
                            <span class="bg-purple-900/50 text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30">${e.category || 'Program'}</span>
                            <h3 class="text-xl font-bold mt-2 mb-2">${e.title || 'Untitled Program'}</h3>
                            <p class="text-gray-400 text-sm mb-4 line-clamp-2">${e.shortDesc || ''}</p>
                            <div class="flex justify-between text-xs text-cyan-400">
                                <span><i class="far fa-calendar mr-1"></i>${e.date || ''}</span>
                                <span><i class="fas fa-map-marker-alt mr-1"></i>${e.location || ''}</span>
                            </div>
                        </div>
                    </button>`;
            }).join('');

            // Modal only exists on programs.html
            const modal = document.getElementById('programModal');
            const backdrop = document.getElementById('programModalBackdrop');
            const closeBtn = document.getElementById('programModalClose');
            const titleEl = document.getElementById('programModalTitle');
            const metaEl = document.getElementById('programModalMeta');
            const bannerEl = document.getElementById('programModalBanner');
            const descEl = document.getElementById('programModalDesc');
            const galleryEl = document.getElementById('programModalGallery');
            const contribEl = document.getElementById('programModalContrib');

            if (!modal) return;

            const openModal = (evt) => {
                const img = evt.image || 'https://via.placeholder.com/900x600';
                const longDesc = evt.longDesc || evt.shortDesc || '';
                const contrib = Array.isArray(evt.contributors)
                    ? evt.contributors
                    : (typeof evt.contributors === 'string' ? evt.contributors.split(',').map(s => s.trim()).filter(Boolean) : []);
                const gallery = Array.isArray(evt.galleryImages) ? evt.galleryImages : [];

                if (titleEl) titleEl.textContent = evt.title || 'Program';
                if (metaEl) metaEl.textContent = `${evt.category || 'Program'}${evt.date ? ' • ' + evt.date : ''}${evt.location ? ' • ' + evt.location : ''}`;
                if (bannerEl) bannerEl.src = img;
                if (descEl) descEl.textContent = longDesc;

                if (contribEl) {
                    contribEl.innerHTML = contrib.length
                        ? contrib.map(c => `<span class="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-gray-200">${c}</span>`).join('')
                        : '<span class="text-gray-500 text-sm">No contributors listed.</span>';
                }

                if (galleryEl) {
                    const all = (gallery.length ? gallery : [img]).slice(0, 12);
                    galleryEl.innerHTML = all.map((u) => `
                            <button type="button" class="rounded-lg overflow-hidden border border-white/10 bg-black/40 hover:border-cyan-500/40 transition" data-gallery-src="${u}">
                                <img src="${u}" alt="Gallery" class="w-full h-20 object-cover">
                            </button>
                        `).join('');

                    galleryEl.querySelectorAll('[data-gallery-src]').forEach(btn => {
                        btn.addEventListener('click', () => {
                            if (bannerEl) bannerEl.src = btn.getAttribute('data-gallery-src') || img;
                        });
                    });
                }

                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            };

            const closeModal = () => {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            };

            closeBtn?.addEventListener('click', closeModal);
            backdrop?.addEventListener('click', closeModal);
            document.addEventListener('keydown', (e) => {
                if (!modal.classList.contains('hidden') && e.key === 'Escape') closeModal();
            });

            grid.querySelectorAll('[data-event-id]').forEach(card => {
                card.addEventListener('click', () => {
                    const id = card.getAttribute('data-event-id');
                    if (!id) return;
                    const evt = data[id];
                    if (!evt) return;
                    openModal(evt);
                });
            });
        }
    });
}

function loadGallery() {
    if (!db) return;
    db.ref('gallery').once('value', snap => {
        const data = snap.val() || {};
        const grid = document.getElementById('galleryGrid');
        if (grid) {
            const items = Object.values(data);
            grid.innerHTML = items.map(g => {
                const type = (g.type || 'image');
                const caption = g.caption || '';
                const url = g.url || '';

                const media = type === 'video'
                    ? `<video src="${url}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110" muted playsinline controls></video>`
                    : `<img src="${url}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt="${caption.replace(/\"/g, '&quot;')}">`;

                return `
                        <div class="holo-card overflow-hidden cursor-pointer group relative h-64">
                            ${media}
                            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                                <p class="text-white font-bold">${caption}</p>
                            </div>
                        </div>
                    `;
            }).join('');
        }
    });
}

// ============================================================
// 7. "DO YOU KNOW?" — DAILY SPACE FACT
//
// HOW TO INTEGRATE:
//   1. Paste this entire block at the bottom of main.js
//      (after the existing loadGallery function).
//
//   2. In the DOMContentLoaded listener at the top of main.js,
//      add this line inside the homepage-specific block:
//
//        if (path.includes('index') || path === '/') {
//            initThreeJS();
//            initDailyFact();   // <-- ADD THIS LINE
//        }
//
// ============================================================

// ── CONFIG ──────────────────────────────────────────────────
const DYK_CONFIG = {
    // Spaceflight News API — free, no key required
    apiUrl: 'https://api.spaceflightnewsapi.net/v4/articles/?limit=30&has_launch=true',

    // How many facts to cache per session
    cacheKey: 'dyk_articles_cache',
    cacheDateKey: 'dyk_cache_date',

    // NASA Astronomy Picture of the Day API (free key)
    nasaApodUrl: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',
};

// ── FALLBACK LOCAL FACTS ─────────────────────────────────────
// Used when all APIs fail (network issues, CORS, rate limits)
const DYK_FALLBACK_FACTS = [
    {
        title: "Venus Spins the Wrong Way",
        summary: "Venus rotates in the opposite direction to most planets in our solar system — a phenomenon called retrograde rotation. This means on Venus, the Sun rises in the west and sets in the east. Scientists believe a massive ancient collision may have flipped the planet upside down billions of years ago.",
        link: null,
    },
    {
        title: "A Teaspoon of Neutron Star Weighs a Billion Tons",
        summary: "Neutron stars are the collapsed cores of massive stars that exploded as supernovae. Their matter is compressed so tightly that a single teaspoon would weigh roughly 10 million tons — about the combined mass of every human being on Earth, packed into a sugar cube.",
        link: null,
    },
    {
        title: "More Stars Than Grains of Sand",
        summary: "The observable universe contains an estimated 2 trillion galaxies, each with billions of stars. The total number of stars is roughly 10 times greater than all grains of sand on every beach and desert on Earth — a number so vast it is essentially incomprehensible.",
        link: null,
    },
    {
        title: "A Day on Mercury Is Longer Than Its Year",
        summary: "Mercury completes one orbit around the Sun in just 88 Earth days, but it rotates so slowly on its axis that a single solar day lasts 176 Earth days. This means a year on Mercury is literally shorter than its own day.",
        link: null,
    },
    {
        title: "The Footprints on the Moon Will Last Millions of Years",
        summary: "The Moon has no atmosphere, which means there is no wind or weather to erode the surface. The footprints left by Apollo astronauts will remain perfectly preserved for at least 10 million years — unless a meteorite happens to land directly on them.",
        link: null,
    },
    {
        title: "Light Takes 100,000 Years to Cross the Milky Way",
        summary: "Our galaxy is approximately 100,000 light-years in diameter. If you could travel at the speed of light — 299,792 km per second — it would still take 100,000 years to travel from one edge of the Milky Way to the other.",
        link: null,
    },
    {
        title: "There Is a Giant Cloud of Alcohol in Space",
        summary: "Located 26,000 light-years from Earth in Sagittarius B2, there is a molecular cloud containing roughly 10 billion billion billion litres of ethyl alcohol — enough to fill millions of Earth-sized planets. Astronomers study it to understand how complex molecules form in space.",
        link: null,
    },
    {
        title: "The Sun Loses 4 Million Tons of Mass Every Second",
        summary: "Through nuclear fusion, the Sun converts hydrogen into helium and releases an extraordinary amount of energy. In this process, about 4 million metric tons of matter are converted to energy every single second — yet the Sun has enough fuel to continue shining for another 5 billion years.",
        link: null,
    },
    {
        title: "Olympus Mons Is Three Times the Height of Everest",
        summary: "The largest volcano in the solar system, Olympus Mons on Mars, stands approximately 22 km (72,000 ft) tall — nearly three times the height of Mount Everest. Its base stretches 600 km across, wide enough to cover the entire state of Arizona.",
        link: null,
    },
    {
        title: "Saturn Could Float on Water",
        summary: "Saturn is the least dense planet in our solar system, with an average density of just 0.687 g/cm³. Water has a density of 1.0 g/cm³. If you could find an ocean large enough, Saturn would float on it — making it the only planet that could do so.",
        link: null,
    },
    {
        title: "Space Is Completely Silent",
        summary: "Sound needs a medium — like air or water — to travel through. In the vacuum of space, there is no such medium. Explosions, rocket engines, and even supernovae produce absolutely no sound that could be heard. The universe is in permanent, absolute silence.",
        link: null,
    },
    {
        title: "The James Webb Telescope Sees Back in Time",
        summary: "Because light takes time to travel, looking deep into space means looking back in time. The James Webb Space Telescope can observe galaxies as they existed over 13 billion years ago — just a few hundred million years after the Big Bang — giving us a direct window into the early universe.",
        link: null,
    },
    {
        title: "There Are More Possible Chess Games Than Atoms in the Observable Universe",
        summary: "While not strictly astronomy, the Shannon Number — the estimated number of possible chess games — is 10^120. The number of atoms in the observable universe is only about 10^80. This comparison helps illustrate just how incomprehensibly vast certain numbers in physics and mathematics truly are.",
        link: null,
    },
    {
        title: "Black Holes Warp Both Space and Time",
        summary: "Near the event horizon of a black hole, gravity is so intense that time itself slows down relative to a distant observer — a phenomenon predicted by Einstein's general theory of relativity called gravitational time dilation. An astronaut falling into a black hole would appear to freeze at the event horizon as seen from outside.",
        link: null,
    },
    {
        title: "The Cosmic Microwave Background Is the Oldest Light We Can See",
        summary: "The universe was opaque for its first 380,000 years. When it finally cooled enough for atoms to form, light was released — and we can still detect that ancient glow today as the Cosmic Microwave Background radiation. It is the oldest electromagnetic radiation in the universe, a faint echo of the Big Bang itself.",
        link: null,
    },
];

// ── STATE ────────────────────────────────────────────────────
let dykArticles = [];   // pool of facts for the current session
let dykIndex = 0;       // current position in pool

// ── MAIN INIT ────────────────────────────────────────────────
async function initDailyFact() {
    // Only run on the homepage
    const section = document.getElementById('do-you-know');
    if (!section) return;

    // Stamp today's date on the card
    const dateEl = document.getElementById('dyk-date');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    // Seed the index from today's date so the "daily" fact is consistent
    const today = new Date();
    const dayOfYear = Math.floor(
        (today - new Date(today.getFullYear(), 0, 0)) / 86400000
    );

    try {
        dykArticles = await fetchSpaceflightArticles();
        if (!dykArticles.length) throw new Error('empty');
        // Start at the day-based offset so each day opens on a different fact
        dykIndex = dayOfYear % dykArticles.length;
        renderFact(dykArticles[dykIndex], 'api');
    } catch (_) {
        // Fall back to local facts
        dykArticles = DYK_FALLBACK_FACTS;
        dykIndex = dayOfYear % dykArticles.length;
        renderFact(dykArticles[dykIndex], 'local');
    }
}

// ── FETCH FROM SPACEFLIGHT NEWS API ─────────────────────────
async function fetchSpaceflightArticles() {
    // Simple session-level cache to avoid hammering the API
    const cacheRaw = sessionStorage.getItem(DYK_CONFIG.cacheKey);
    if (cacheRaw) {
        try { return JSON.parse(cacheRaw); } catch (_) { /* ignore */ }
    }

    const res = await fetch(DYK_CONFIG.apiUrl, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const articles = (json.results || [])
        .filter(a => a.title && a.summary && a.summary.length > 60)
        .map(a => ({
            title: a.title,
            summary: a.summary,
            link: a.url || null,
        }));

    if (articles.length) {
        sessionStorage.setItem(DYK_CONFIG.cacheKey, JSON.stringify(articles));
    }
    return articles;
}

// ── RENDER A FACT ────────────────────────────────────────────
function renderFact(fact, source) {
    const loading = document.getElementById('dyk-loading');
    const content = document.getElementById('dyk-content');
    const title = document.getElementById('dyk-title');
    const summary = document.getElementById('dyk-summary');
    const link = document.getElementById('dyk-link');
    const badge = document.getElementById('dyk-source-badge');
    const label = document.getElementById('dyk-source-label');
    const refreshBtn = document.getElementById('dyk-refresh');

    if (!loading || !content || !title || !summary) return;

    // Populate
    title.textContent = fact.title;
    summary.textContent = fact.summary;

    // Source badge
    if (badge && label) {
        badge.classList.remove('hidden');
        label.textContent = source === 'api' ? 'Spaceflight News API' : 'AstroSoc Archive';
    }

    // Read-more link
    if (link) {
        if (fact.link) {
            link.href = fact.link;
            link.classList.remove('hidden');
        } else {
            link.classList.add('hidden');
        }
    }

    // Swap loading → content with animation
    loading.classList.add('hidden');
    content.classList.remove('hidden');
    // Re-trigger animation on each cycle
    content.classList.remove('dyk-fade-in');
    void content.offsetWidth; // reflow trick
    content.classList.add('dyk-fade-in');

    // Show the refresh button
    if (refreshBtn) {
        refreshBtn.style.opacity = '1';
    }
}

// ── CYCLE TO NEXT FACT (bound to "Next Fact" button) ─────────
function cycleDailyFact() {
    if (!dykArticles.length) return;
    dykIndex = (dykIndex + 1) % dykArticles.length;

    // Briefly show loading skeleton for smooth transition
    const loading = document.getElementById('dyk-loading');
    const content = document.getElementById('dyk-content');
    if (loading && content) {
        content.classList.add('hidden');
        loading.classList.remove('hidden');
    }

    setTimeout(() => renderFact(dykArticles[dykIndex],
        dykArticles === DYK_FALLBACK_FACTS ? 'local' : 'api'), 400);
}

// ── EXPOSE cycleDailyFact GLOBALLY (used by onclick in HTML) ─
window.cycleDailyFact = cycleDailyFact;