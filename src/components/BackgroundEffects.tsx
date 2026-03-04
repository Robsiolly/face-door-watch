import React, { useEffect, useState, useMemo } from 'react';

export const BackgroundEffects: React.FC = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isMoving, setIsMoving] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
            setIsMoving(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setIsMoving(false), 2000);

            // Update CSS variables for parallax if needed
            const moveX = (e.clientX - window.innerWidth / 2) / 50;
            const moveY = (e.clientY - window.innerHeight / 2) / 50;
            document.documentElement.style.setProperty('--mouse-x', `${moveX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${moveY}px`);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const particles = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: `${Math.random() * 2 + 0.5}px`,
            duration: `${Math.random() * 20 + 20}s`,
            delay: `${Math.random() * 10}s`,
            opacity: Math.random() * 0.3 + 0.1,
        }));
    }, []);

    return (
        <>
            <div className="premium-bg" />
            <div
                className={`glow-cursor transition-opacity duration-1000 ${isMoving ? 'opacity-40' : 'opacity-10'}`}
                style={{
                    left: `${mousePos.x}px`,
                    top: `${mousePos.y}px`
                }}
            />
            <div className="particles-container fixed inset-0 pointer-events-none z-[-2]">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="particle absolute rounded-full bg-white animate-float"
                        style={{
                            left: p.left,
                            top: p.top,
                            width: p.size,
                            height: p.size,
                            opacity: p.opacity,
                            // @ts-ignore
                            '--duration': p.duration,
                            animationDelay: p.delay,
                        }}
                    />
                ))}
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                    0% { transform: translateY(0) translateX(0); }
                    33% { transform: translateY(-30px) translateX(20px); }
                    66% { transform: translateY(20px) translateX(-10px); }
                    100% { transform: translateY(0) translateX(0); }
                }
                .animate-float {
                    animation: float var(--duration) ease-in-out infinite;
                }
            `}} />
        </>
    );
};
