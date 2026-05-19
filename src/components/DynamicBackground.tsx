
import React, { useEffect, useRef } from 'react';
import type { Theme } from './ThemeSwitcher';
import { getAutoThemeConfig, type GlobalSeason, type TimeOfDay } from '../utils/timeCycle';

interface DynamicBackgroundProps {
    theme: Theme;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ theme }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        let animationFrameId: number;
        let particles: any[] = [];

        // Auto Mode Config
        let autoConfig = { season: 'summer' as GlobalSeason, time: 'day' as TimeOfDay, bgGradient: '' };
        if (theme === 'auto') {
            autoConfig = getAutoThemeConfig();
            // Apply background gradient to canvas container parent (the div in App.tsx)
            // But since we can't easily reach up, let's fill the canvas with the gradient or color
            // Actually, we usually rely on CSS classes. 
            // For 'auto', we'll draw the gradient on the canvas background layer.
        }

        // --- EFFECT INITIALIZERS ---

        const initStars = () => {
            particles = [];
            for (let i = 0; i < 200; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 2,
                    speed: Math.random() * 0.5 + 0.1,
                    opacity: Math.random()
                });
            }
        };

        const initYinYang = () => {
            particles = [];
            for (let i = 0; i < 150; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 20 + 5,
                    vx: (Math.random() - 0.5) * 1,
                    vy: (Math.random() - 0.5) * 1,
                    color: Math.random() > 0.5 ? '#111827' : '#ffffff',
                    opacity: Math.random() * 0.5 + 0.1
                });
            }
        };

        const initBlackHole = () => {
            particles = [];
            for (let i = 0; i < 300; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 100 + Math.random() * 400;
                particles.push({
                    angle,
                    dist,
                    size: Math.random() * 3,
                    speed: (500 - dist) * 0.0002,
                    color: Math.random() > 0.5 ? '#ea580c' : '#7c3aed'
                });
            }
        };

        const initMountain = () => {
            particles = [];
            for (let i = 0; i < 100; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 3,
                    speed: Math.random() * 1 + 0.5,
                    sway: Math.random() * 2
                });
            }
        };

        // --- AUTO MODE INITIALIZERS ---

        const initRain = () => {
            particles = [];
            for (let i = 0; i < 300; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    length: Math.random() * 20 + 10,
                    speed: Math.random() * 10 + 15,
                    opacity: Math.random() * 0.5 + 0.2
                });
            }
        };

        const initSnow = () => {
            particles = [];
            for (let i = 0; i < 150; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 3 + 1,
                    speed: Math.random() * 2 + 1,
                    sway: Math.random() * 2
                });
            }
        };

        const initPetals = () => {
            particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 5 + 3,
                    speed: Math.random() * 2 + 1,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 2,
                    color: Math.random() > 0.5 ? '#fbcfe8' : '#f472b6' // Pink
                });
            }
        };

        const initSun = () => {
            // Sun rays or just ambient particles
            particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 4,
                    speed: Math.random() * 0.5,
                    opacity: Math.random() * 0.5
                });
            }
        };

        const initFireflies = () => {
            particles = [];
            for (let i = 0; i < 80; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: height - (Math.random() * height * 0.5), // Bottom half
                    size: Math.random() * 4,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    opacity: Math.random(),
                    pulseSpeed: Math.random() * 0.05
                });
            }
        };

        // --- RENDERERS ---

        const drawStars = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'white';
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.globalAlpha = p.opacity;
                ctx.fill();
                p.y -= p.speed;
                if (Math.random() > 0.95) p.opacity = Math.random();
                if (p.y < 0) { p.y = height; p.x = Math.random() * width; }
            });
        };

        const drawYinYang = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
            });
        };

        const drawBlackHole = () => {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, 0, width, height);
            const cx = width / 2;
            const cy = height / 2;
            ctx.beginPath();
            ctx.arc(cx, cy, 80, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.shadowBlur = 50;
            ctx.shadowColor = '#ea580c';
            ctx.fill();
            ctx.shadowBlur = 0;
            particles.forEach(p => {
                const x = cx + Math.cos(p.angle) * p.dist;
                const y = cy + Math.sin(p.angle) * p.dist * 0.4;
                ctx.beginPath();
                ctx.arc(x, y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.8;
                ctx.fill();
                p.angle += p.speed;
            });
        };

        const drawMountain = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(width * 0.2, height * 0.6);
            ctx.lineTo(width * 0.5, height * 0.8);
            ctx.lineTo(width * 0.8, height * 0.4);
            ctx.lineTo(width, height);
            ctx.fill();
            ctx.fillStyle = 'white';
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.globalAlpha = 0.7;
                ctx.fill();
                p.y += p.speed;
                p.x += Math.sin(p.y * 0.01) * 0.5;
                if (p.y > height) { p.y = 0; p.x = Math.random() * width; }
            });
        };

        // --- AUTO MODE RENDERERS ---

        const drawAutoBg = () => {
            // Fill background with calculated gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            // Simple fallback parsing for the gradient string we made
            if (autoConfig.time === 'morning') {
                gradient.addColorStop(0, '#60a5fa'); gradient.addColorStop(1, '#bfdbfe');
            } else if (autoConfig.time === 'day') {
                gradient.addColorStop(0, '#3b82f6'); gradient.addColorStop(1, '#93c5fd');
            } else if (autoConfig.time === 'sore') {
                gradient.addColorStop(0, '#f59e0b'); gradient.addColorStop(1, '#7c3aed');
            } else {
                gradient.addColorStop(0, '#0f172a'); gradient.addColorStop(1, '#312e81');
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        };

        const drawRain = () => {
            drawAutoBg();
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1;
            particles.forEach(p => {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x, p.y + p.length);
                ctx.globalAlpha = p.opacity;
                ctx.stroke();
                p.y += p.speed;
                if (p.y > height) { p.y = -p.length; p.x = Math.random() * width; }
            });
        };

        const drawSnow = () => {
            drawAutoBg();
            ctx.fillStyle = 'white';
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.globalAlpha = 0.8;
                ctx.fill();
                p.y += p.speed;
                p.x += Math.sin(p.y * 0.05) * p.sway;
                if (p.y > height) { p.y = 0; p.x = Math.random() * width; }
            });
        };

        const drawPetals = () => {
            drawAutoBg();
            particles.forEach(p => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.8;

                // Draw petal shape
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();

                p.y += p.speed;
                p.x += Math.sin(p.y * 0.02);
                p.rotation += p.rotationSpeed;

                if (p.y > height) { p.y = -10; p.x = Math.random() * width; }
            });
        };

        const drawSun = () => {
            drawAutoBg();

            // Draw Sun
            ctx.beginPath();
            ctx.arc(width * 0.8, height * 0.15, 60, 0, Math.PI * 2);
            ctx.fillStyle = '#fcd34d'; // Amber-300
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 40;
            ctx.globalAlpha = 1;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Ambient particles
            ctx.fillStyle = '#fffbeb';
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.globalAlpha = p.opacity;
                ctx.fill();
                p.y -= p.speed;
                if (p.y < 0) { p.y = height; p.x = Math.random() * width; }
            });
        };

        const drawFireflies = () => {
            drawAutoBg();
            // Moon
            ctx.beginPath();
            ctx.arc(width * 0.8, height * 0.15, 40, 0, Math.PI * 2);
            ctx.fillStyle = '#e2e8f0';
            ctx.shadowColor = '#94a3b8';
            ctx.shadowBlur = 30;
            ctx.globalAlpha = 1;
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fde047'; // Yellow
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.globalAlpha = Math.abs(Math.sin(Date.now() * p.pulseSpeed));
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#fde047';
                ctx.fill();
                ctx.shadowBlur = 0;

                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0 || p.x > width) p.speedX *= -1;
                if (p.y < height * 0.4 || p.y > height) p.speedY *= -1;
            });
        };

        // --- MAIN LOOP ---

        // Initialize based on theme
        if (theme === 'yinyang') initYinYang();
        else if (theme === 'blackhole') initBlackHole();
        else if (theme === 'mountain') initMountain();
        else if (theme === 'auto') {
            // Auto logic
            if (autoConfig.season === 'winter') initSnow();
            else if (autoConfig.season === 'spring') initPetals();
            else if (autoConfig.season === 'autumn') initRain(); // Autumn rain
            else {
                // Summer
                if (autoConfig.time === 'night') initFireflies();
                else initSun();
            }
        }
        else initStars();

        const animate = () => {
            if (theme === 'yinyang') drawYinYang();
            else if (theme === 'blackhole') drawBlackHole();
            else if (theme === 'mountain') drawMountain();
            else if (theme === 'auto') {
                if (autoConfig.season === 'winter') drawSnow();
                else if (autoConfig.season === 'spring') drawPetals();
                else if (autoConfig.season === 'autumn') drawRain();
                else {
                    if (autoConfig.time === 'night') drawFireflies();
                    else drawSun();
                }
            }
            else drawStars();

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            // Simplified resize: just clear and standard stars for robustness or full re-init
            if (theme === 'yinyang') initYinYang();
            else if (theme === 'auto') {
                // Re-run auto check logic? For speed just re-init particles
                if (autoConfig.season === 'winter') initSnow();
                else if (autoConfig.season === 'spring') initPetals();
                // ... etc
            }
            else initStars();
        };

        window.addEventListener('resize', handleResize);
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none w-full h-full"
            style={{
                mixBlendMode: (theme === 'yinyang' || theme === 'auto') ? 'normal' : 'screen'
            }}
        />
    );
}

export default DynamicBackground;
