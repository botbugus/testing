// ============================================================
//  PARTICLES ANIMATION
// ============================================================
(function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    let particles = [];
    const COUNT = 80;
    const MAX_RADIUS = 2.2;
    const MIN_RADIUS = 0.8;
    const SPEED_FACTOR = 0.3;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.r = Math.random() * (MAX_RADIUS - MIN_RADIUS) + MIN_RADIUS;
            this.dx = (Math.random() - 0.5) * SPEED_FACTOR * 1.2;
            this.dy = (Math.random() - 0.5) * SPEED_FACTOR * 1.2;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        update() {
            this.x += this.dx;
            this.y += this.dy;
            if (this.x < 0 || this.x > w) { this.dx *= -1;
                this.x += this.dx; }
            if (this.y < 0 || this.y > h) { this.dy *= -1;
                this.y += this.dy; }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(160, 180, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    const opacity = (1 - dist / 130) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(120, 140, 255, ${opacity})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawLines();
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        particles.forEach(p => {
            p.x = Math.min(Math.max(p.x, 0), w);
            p.y = Math.min(Math.max(p.y, 0), h);
        });
    });

    resize();
    initParticles();
    animate();

    setInterval(() => {
        particles.forEach(p => {
            if (Math.random() < 0.15) p.reset();
        });
    }, 30000);
})();
