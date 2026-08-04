import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Wallet } from 'lucide-react';
import './Intro.css';

interface IntroAnimationProps {
  onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Text elements
  const textWRef = useRef<HTMLSpanElement>(null);
  const textAlletRef = useRef<HTMLDivElement>(null);
  const textPayRef = useRef<HTMLDivElement>(null);
  const textFullRef = useRef<HTMLDivElement>(null); // For shatter effect
  
  // Crash & Coins
  const walletRef = useRef<HTMLDivElement>(null);
  const impactFlashRef = useRef<HTMLDivElement>(null);
  const coinsContainerRef = useRef<HTMLDivElement>(null);
  
  const tl = useRef<gsap.core.Timeline>(null);
  const [showSkip, setShowSkip] = useState(false);

  const handleSkip = () => {
    if (tl.current) tl.current.progress(1);
    onComplete();
  };

  useEffect(() => {
    const skipTimer = setTimeout(() => setShowSkip(true), 1500);
    return () => clearTimeout(skipTimer);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // We'll generate 60 coins for the explosion
    const coins = Array.from(coinsContainerRef.current?.children || []);

    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: onComplete
        });
      }
    });

    const alletLetters = Array.from(textAlletRef.current?.children || []);
    const payLetters = Array.from(textPayRef.current?.children || []);
    
    // Initial states
    gsap.set(textWRef.current, { x: -300, opacity: 0 });
    gsap.set([...alletLetters, ...payLetters], { y: 20, opacity: 0 });
    gsap.set(walletRef.current, { y: -500, rotationZ: -20, opacity: 0, scale: 2 });
    gsap.set(impactFlashRef.current, { scale: 0, opacity: 0 });
    gsap.set(textFullRef.current, { opacity: 1 });
    
    coins.forEach((coin: any) => {
      gsap.set(coin, { opacity: 0, scale: 0, x: 0, y: 0, z: 0 });
    });

    // Step 1: "W" appears
    timeline.to(textWRef.current, {
      x: 0,
      opacity: 1,
      duration: 0.4,
      ease: "back.out(1.2)",
    }, 0);

    // Step 2: "allet" appears
    timeline.to(alletLetters, {
      y: 0,
      opacity: 1,
      duration: 0.3,
      stagger: 0.05,
      ease: "power2.out"
    }, 0.3);

    // Step 3: "Pay" appears
    timeline.to(payLetters, {
      y: 0,
      opacity: 1,
      duration: 0.3,
      stagger: 0.05,
      ease: "power2.out"
    }, 0.7);

    // Flash / Glow
    timeline.to(textFullRef.current, {
      textShadow: "0 0 30px rgba(20, 214, 196, 0.8)",
      duration: 0.15,
      yoyo: true,
      repeat: 1,
    }, 1.1);

    // Step 4: Text shatters + Wallet crashes
    const impactTime = 1.6;

    // Wallet falling
    timeline.to(walletRef.current, {
      y: 0,
      rotationZ: 0,
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "power4.in"
    }, 1.3);

    // Impact Flash
    timeline.to(impactFlashRef.current, {
      scale: 4,
      opacity: 1,
      duration: 0.1,
    }, impactTime);
    timeline.to(impactFlashRef.current, {
      opacity: 0,
      duration: 0.2,
    }, impactTime + 0.1);

    // Camera Shake
    timeline.to(containerRef.current, {
      x: () => Math.random() * 20 - 10,
      y: () => Math.random() * 20 - 10,
      duration: 0.04,
      repeat: 4,
      yoyo: true,
      ease: "none"
    }, impactTime);
    timeline.set(containerRef.current, { x: 0, y: 0 }, impactTime + 0.2);

    // Text shatter (simplified: blur and drop)
    timeline.to([textWRef.current, ...alletLetters, ...payLetters], {
      y: () => Math.random() * 100 + 50,
      x: () => Math.random() * 100 - 50,
      rotationZ: () => Math.random() * 40 - 20,
      opacity: 0,
      filter: "blur(10px)",
      duration: 0.4,
      ease: "power4.out"
    }, impactTime);

    // Step 5: Coins burst (3.4s - 4.6s)
    coins.forEach((coin: any, index) => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 800 + 300;
      const is3D = index % 5 === 0;
      
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity - 200; // bias upward
      const tz = is3D ? (Math.random() * 1000 + 500) : 0;
      const scaleMultiplier = is3D ? (Math.random() * 2 + 1.5) : (Math.random() * 0.8 + 0.5);

      gsap.set(coin, { opacity: 1 });

      timeline.to(coin, {
        x: tx,
        y: ty,
        z: tz,
        scale: scaleMultiplier,
        rotationX: Math.random() * 720,
        rotationY: Math.random() * 720,
        rotationZ: Math.random() * 360,
        duration: Math.random() * 0.4 + 0.3,
        ease: "expo.out"
      }, impactTime);

      // Settle down
      timeline.to(coin, {
        y: "150vh",
        opacity: 0,
        duration: Math.random() * 0.5 + 0.4,
        ease: "power2.in"
      }, impactTime + 0.3 + Math.random() * 0.1);
    });

    // Hold before fading to Landing Page
    timeline.to({}, { duration: 0.3 });

    tl.current = timeline;

    return () => {
      if (tl.current) tl.current.kill();
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#050810] flex items-center justify-center overflow-hidden" ref={containerRef}>
      
      {/* Background stars/particles */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-[#050810] to-[#050810] pointer-events-none" />
      
      {/* Text Container */}
      <div 
        ref={textFullRef} 
        className="absolute z-10 flex items-center gap-4 text-6xl md:text-8xl font-display font-black tracking-tighter"
      >
        <div className="flex">
          <span 
            ref={textWRef} 
            className="bg-gradient-to-br from-primary-400 to-accent-400 bg-clip-text text-transparent drop-shadow-xl inline-block"
          >
            W
          </span>
          <div ref={textAlletRef} className="flex">
            {"allet".split('').map((l, i) => (
              <span key={i} className="bg-gradient-to-br from-primary-400 to-accent-400 bg-clip-text text-transparent inline-block">
                {l}
              </span>
            ))}
          </div>
        </div>
        <div ref={textPayRef} className="flex">
          {"Pay".split('').map((l, i) => (
            <span key={i} className="bg-gradient-to-br from-accent-400 to-teal-400 bg-clip-text text-transparent inline-block">
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Wallet Icon Crash */}
      <div 
        ref={walletRef}
        className="absolute z-20 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-primary-500 to-teal-500 rounded-3xl shadow-[0_0_60px_rgba(59,130,246,0.6)] flex items-center justify-center border-t border-white/20"
      >
        <Wallet className="w-16 h-16 md:w-24 md:h-24 text-white drop-shadow-lg" />
      </div>

      {/* Impact Flash */}
      <div 
        ref={impactFlashRef}
        className="absolute z-30 w-32 h-32 bg-white rounded-full blur-2xl pointer-events-none mix-blend-screen"
      />

      {/* Coins Container */}
      <div ref={coinsContainerRef} className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none perspective-[1000px]">
        {Array.from({ length: 60 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-[#F5C542] to-[#B8860B] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3),_0_4px_8px_rgba(0,0,0,0.5)] border border-[#FFD700]/50 flex items-center justify-center"
          >
            <div className="w-5 h-5 rounded-full border border-black/10 flex items-center justify-center text-[#B8860B] font-bold text-xs">
              $
            </div>
          </div>
        ))}
      </div>

      <button 
        className={`absolute bottom-8 right-8 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all text-sm backdrop-blur-sm ${showSkip ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleSkip}
      >
        Skip Intro
      </button>
    </div>
  );
}
