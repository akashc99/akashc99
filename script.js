// ============================
// MAIN SCRIPT
// ============================

document.addEventListener('DOMContentLoaded', () => {
    // Android detection (iOS handles animations fine)
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) document.body.classList.add('android');

    // ============================
    // PRELOADER
    // ============================
    const preloader = document.getElementById('preloader');
    const loaderLines = document.querySelectorAll('.loader-line');

    loaderLines.forEach((line, i) => {
        const delay = parseInt(line.dataset.delay) || 0;
        line.style.animationDelay = `${delay}ms`;
    });

    setTimeout(() => {
        preloader.classList.add('loaded');
        document.body.style.overflow = 'auto';
    }, 800);

    // ============================
    // MATRIX BACKGROUND
    // ============================
    const canvas = document.getElementById('matrix-bg');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF{}[]<>/\\|=+-*&^%$#@!';
    const charArray = chars.split('');
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    if (!isAndroid) {
        let lastMatrixDraw = 0;
        function drawMatrix(timestamp) {
            requestAnimationFrame(drawMatrix);
            // Throttle to ~12fps (enough for matrix rain effect)
            if (timestamp - lastMatrixDraw < 83) return;
            lastMatrixDraw = timestamp;

            ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'rgba(230, 57, 70, 0.25)';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = charArray[Math.floor(Math.random() * charArray.length)];
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        requestAnimationFrame(drawMatrix);
    } else {
        // On mobile, draw a subtle static background instead
        canvas.style.background = 'radial-gradient(ellipse at center, rgba(230,57,70,0.03) 0%, transparent 70%)';
    }

    // ============================
    // FLOATING PARTICLES
    // ============================
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        particleContainer.style.cssText = `
            position: absolute;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
            z-index: 0;
        `;
        heroSection.prepend(particleContainer);

        const particleCount = isAndroid ? 8 : 30;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 3 + 1;
            const left = Math.random() * 100;
            const delay = Math.random() * 20;
            const duration = Math.random() * 15 + 15;

            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(230, 57, 70, ${Math.random() * 0.4 + 0.1});
                border-radius: 50%;
                left: ${left}%;
                bottom: -10px;
                animation: floatUp ${duration}s linear ${delay}s infinite;
                ${isAndroid ? '' : `box-shadow: 0 0 ${size * 2}px rgba(230, 57, 70, 0.3);`}
            `;
            particleContainer.appendChild(particle);
        }

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                0% {
                    transform: translateY(0) translateX(0);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================
    // BUG CURSOR
    // ============================
    const bugCursor = document.getElementById('bug-cursor');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let bugX = mouseX;
    let bugY = mouseY;
    let currentAngle = 0;
    let isMouseInViewport = false;
    let lastMoveTime = Date.now();

    // Check for touch device
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (isTouchDevice) {
        // Hide custom cursor on touch devices
        bugCursor.style.display = 'none';
        document.body.style.cursor = 'auto';
    } else {
        // Show cursor when mouse enters viewport
        document.addEventListener('mouseenter', () => {
            isMouseInViewport = true;
            bugCursor.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            isMouseInViewport = false;
            bugCursor.style.opacity = '0';
        });

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            lastMoveTime = Date.now();
            if (!isMouseInViewport) {
                isMouseInViewport = true;
                bugCursor.style.opacity = '1';
            }
        });

        function animateBug() {
            // Smooth interpolation
            const ease = 0.15;
            const prevBugX = bugX;
            const prevBugY = bugY;

            bugX += (mouseX - bugX) * ease;
            bugY += (mouseY - bugY) * ease;

            // Calculate movement direction for rotation
            const dx = bugX - prevBugX;
            const dy = bugY - prevBugY;
            const speed = Math.sqrt(dx * dx + dy * dy);

            // Only rotate when moving
            if (speed > 0.3) {
                const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
                // Smooth angle interpolation
                let angleDiff = targetAngle - currentAngle;
                // Normalize angle difference
                while (angleDiff > 180) angleDiff -= 360;
                while (angleDiff < -180) angleDiff += 360;
                currentAngle += angleDiff * 0.15;
            }

            // Apply transform with GPU acceleration
            bugCursor.style.transform = `translate3d(${bugX - 20}px, ${bugY - 20}px, 0) rotate(${currentAngle}deg)`;

            // Idle animation - subtle breathing when stationary
            const timeSinceMove = Date.now() - lastMoveTime;
            if (timeSinceMove > 500) {
                const breathe = Math.sin(Date.now() / 500) * 0.05 + 1;
                bugCursor.style.transform = `translate3d(${bugX - 20}px, ${bugY - 20}px, 0) rotate(${currentAngle}deg) scale(${breathe})`;
            }

            requestAnimationFrame(animateBug);
        }

        // Initialize cursor position
        bugCursor.style.opacity = '0';
        animateBug();

        // Cursor hover effects
        const hoverElements = document.querySelectorAll('a, button, .btn, .project-card, .bounty-item, .cert-card, .skill-tag, .timeline-content, .contact-link-item');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                bugCursor.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                bugCursor.classList.remove('hover');
            });
        });
    }

    // ============================
    // TYPEWRITER EFFECT
    // ============================
    const typewriterEl = document.getElementById('typewriter');
    const phrases = [
        'Team Lead - Security Testing',
        'Offensive Security Specialist',
        'Bug Bounty Hunter',
        'OSCP | OSWE | OSWA | CRTP | CTMP | CDP',
        'CVE Publisher',
        'Penetration Tester',
        'DevSecOps Professional'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typewriterEl.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 40;
        } else {
            typewriterEl.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 80;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    // Delay typewriter start until after preloader
    setTimeout(type, 1200);

    // ============================
    // NAVIGATION
    // ============================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    // Scroll effect on navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active nav link based on scroll position
        updateActiveNav();
    }, { passive: true });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
    });

    // Close mobile menu on link click
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Active nav link
    function updateActiveNav() {
        const sections = document.querySelectorAll('.section');
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (window.scrollY >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === currentSection) {
                link.classList.add('active');
            }
        });
    }

    // ============================
    // SCROLL REVEAL ANIMATIONS
    // ============================
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-text');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ============================
    // COUNTER ANIMATION
    // ============================
    const statItems = document.querySelectorAll('.stat-item');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const countTo = parseInt(target.dataset.count);
                const numberEl = target.querySelector('.stat-number');
                let current = 0;
                const step = Math.max(1, Math.floor(countTo / 60));
                const interval = setInterval(() => {
                    current += step;
                    if (current >= countTo) {
                        current = countTo;
                        clearInterval(interval);
                    }
                    numberEl.textContent = current;
                }, 30);
                counterObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    statItems.forEach(item => counterObserver.observe(item));

    // ============================
    // TILT EFFECT ON CARDS
    // ============================
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -5;
            const rotateY = (x - centerX) / centerX * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ============================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ============================
    // PARALLAX EFFECT ON HERO
    // ============================
    if (!isAndroid) {
        const heroVisual = document.querySelector('.hero-visual');
        window.addEventListener('scroll', () => {
            if (window.scrollY < window.innerHeight) {
                const parallax = window.scrollY * 0.3;
                if (heroVisual) {
                    heroVisual.style.transform = `translateY(${parallax}px)`;
                }
            }
        }, { passive: true });
    }

    // ============================
    // TERMINAL TYPING EFFECT ON ABOUT
    // ============================
    const aboutTerminal = document.querySelector('.about-terminal .terminal-body');
    if (aboutTerminal) {
        const aboutObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lines = aboutTerminal.querySelectorAll('.terminal-line');
                    lines.forEach((line, i) => {
                        line.style.opacity = '0';
                        line.style.transform = 'translateX(-10px)';
                        setTimeout(() => {
                            line.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                            line.style.opacity = '1';
                            line.style.transform = 'translateX(0)';
                        }, i * 200);
                    });
                    aboutObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        aboutObserver.observe(aboutTerminal);
    }

    // ============================
    // BOUNTY ITEMS STAGGER
    // ============================
    const bountyItems = document.querySelectorAll('.bounty-item');
    const bountyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.parentElement.querySelectorAll('.bounty-item');
                items.forEach((item, i) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, i * 60);
                });
                bountyObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    if (bountyItems.length > 0) {
        bountyObserver.observe(bountyItems[0]);
    }

    // ============================
    // MAGNETIC BUTTONS
    // ============================
    const magneticBtns = document.querySelectorAll('.btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // ============================
    // SCROLL PROGRESS BAR
    // ============================
    const scrollProgressBar = document.getElementById('scroll-progress-bar');
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollTop / scrollHeight) * 100;
        if (scrollProgressBar) {
            scrollProgressBar.style.width = scrolled + '%';
        }
    }, { passive: true });

    // ============================
    // SPOTLIGHT EFFECT ON CARDS
    // ============================
    const spotlightCards = document.querySelectorAll('.project-card, .timeline-content, .bounty-item');
    spotlightCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--cursor-x', `${x}px`);
            card.style.setProperty('--cursor-y', `${y}px`);
        });
    });

    // ============================
    // INFINITE MARQUEE CLONE
    // ============================
    const marquee = document.getElementById('bounty-marquee');
    if (marquee) {
        const items = Array.from(marquee.children);
        // Clone items to ensure enough width for continuous scrolling
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true'); // accessibility
            clone.classList.remove('reveal-up'); // avoid re-triggering animation on clones
            marquee.appendChild(clone);
        });
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.classList.remove('reveal-up');
            marquee.appendChild(clone);
        });
    }

    // ============================
    // PAGE VISIBILITY - PAUSE ANIMATIONS
    // ============================
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.body.classList.add('paused');
        } else {
            document.body.classList.remove('paused');
        }
    });

    // ============================
    // EASTER EGG - KONAMI CODE
    // ============================
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.keyCode === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                document.body.style.filter = 'hue-rotate(90deg)';
                setTimeout(() => {
                    document.body.style.filter = '';
                }, 3000);
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    // ============================
    // CLICK TO SPAWN FLYING BUGS
    // ============================
    function createBugSVG(size) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 40 40');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.innerHTML = `
            <ellipse class="bug-wing bug-wing-left" cx="12" cy="16" rx="10" ry="6" fill="rgba(230,57,70,0.3)" stroke="#e63946" stroke-width="0.5" transform="rotate(-20 12 16)"/>
            <ellipse class="bug-wing bug-wing-right" cx="28" cy="16" rx="10" ry="6" fill="rgba(230,57,70,0.3)" stroke="#e63946" stroke-width="0.5" transform="rotate(20 28 16)"/>
            <ellipse cx="20" cy="22" rx="5" ry="8" fill="#e63946"/>
            <circle cx="20" cy="13" r="3.5" fill="#e63946"/>
            <circle cx="18.5" cy="12" r="1" fill="#000"/>
            <circle cx="21.5" cy="12" r="1" fill="#000"/>
            <line x1="18" y1="10" x2="14" y2="5" stroke="#e63946" stroke-width="0.8" stroke-linecap="round"/>
            <line x1="22" y1="10" x2="26" y2="5" stroke="#e63946" stroke-width="0.8" stroke-linecap="round"/>
            <circle cx="14" cy="5" r="1" fill="#e63946"/>
            <circle cx="26" cy="5" r="1" fill="#e63946"/>
        `;
        return svg;
    }

    let activeBugCount = 0;
    const MAX_BUGS = 15;

    document.addEventListener('click', (e) => {
        // Disable click bugs on Android for performance
        if (isAndroid) return;
        // Cap concurrent bugs to prevent lag
        if (activeBugCount >= MAX_BUGS) return;

        const bugCount = Math.floor(Math.random() * 3) + 2; // 2-4 bugs

        for (let i = 0; i < bugCount; i++) {
            const wrapper = document.createElement('div');
            const size = Math.random() * 14 + 12; // 12-26px
            const bug = createBugSVG(size);

            wrapper.style.cssText = `
                position: fixed;
                pointer-events: none;
                z-index: 9999;
                left: ${e.clientX}px;
                top: ${e.clientY}px;
                transform: translate(-50%, -50%);
                filter: none;
            `;
            wrapper.appendChild(bug);
            document.body.appendChild(wrapper);
            activeBugCount++;

            // Random flight direction
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 2; // slight upward bias
            const rotSpeed = (Math.random() - 0.5) * 10;

            let x = e.clientX;
            let y = e.clientY;
            let rot = Math.random() * 360;
            let opacity = 1;
            let frame = 0;
            const maxFrames = 60 + Math.random() * 40; // 60-100 frames

            function animateBugFly() {
                frame++;
                x += vx;
                y += vy + Math.sin(frame * 0.15) * 0.8; // wobbly flight
                rot += rotSpeed;
                opacity = 1 - (frame / maxFrames);

                wrapper.style.left = `${x}px`;
                wrapper.style.top = `${y}px`;
                wrapper.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${opacity})`;
                wrapper.style.opacity = opacity;

                if (frame < maxFrames) {
                    requestAnimationFrame(animateBugFly);
                } else {
                    wrapper.remove();
                    activeBugCount--;
                }
            }
            // Stagger start for natural feel
            setTimeout(() => requestAnimationFrame(animateBugFly), i * 30);
        }
    });
});
