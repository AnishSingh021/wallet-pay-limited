import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Intro.css';
import { WalletCrash, WalletCrashRefs } from './WalletCrash';
import { CoinExplosion, CoinExplosionRefs } from './CoinExplosion';

interface IntroAnimationProps {
  onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textWalletRef = useRef<HTMLDivElement>(null);
  const textPayRef = useRef<HTMLDivElement>(null);
  
  const crashRefs = useRef<WalletCrashRefs>(null);
  const explosionRefs = useRef<CoinExplosionRefs>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  
  const tl = useRef<gsap.core.Timeline>(null);
  const [showSkip, setShowSkip] = useState(false);

  const walletLetters = "Wallet".split("");
  const payLetters = "Pay".split("");

  const handleSkip = () => {
    if (tl.current) tl.current.progress(1);
    onComplete();
  };

  useEffect(() => {
    const skipTimer = setTimeout(() => setShowSkip(true), 1500);
    return () => clearTimeout(skipTimer);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !crashRefs.current || !explosionRefs.current) return;

    // 1. Setup Elements & Initial States
    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: onComplete
        });
      }
    });

    const wLetters = Array.from(textWalletRef.current?.children || []);
    const pLetters = Array.from(textPayRef.current?.children || []);
    const allText = [...wLetters, ...pLetters];
    
    // Initial Text State
    gsap.set(allText, { opacity: 0, y: 50, rotateX: -60, rotateZ: 5, filter: 'blur(10px)', scale: 0.8 });

    // Scene 1: Black screen + Blue light sweep
    // Duration: 0.0 -> 0.3
    if (sweepRef.current) {
      timeline.fromTo(sweepRef.current, 
        { x: "-150%", opacity: 1 }, 
        { x: "150%", duration: 0.6, ease: "power2.inOut" }, 
        0
      );
    }

    // Scene 2: "Wallet" tight stagger
    // Duration: 0.1 -> 0.5
    timeline.to(wLetters, {
      y: 0,
      rotateX: 0,
      rotateZ: 0,
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      duration: 0.6,
      ease: "expo.out",
      stagger: 0.04
    }, 0.1);

    // Scene 3: "Pay" morphs in
    // Duration: 0.3 -> 0.7
    timeline.to(pLetters, {
      y: 0,
      rotateX: 0,
      rotateZ: 0,
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      duration: 0.6,
      ease: "back.out(1.7)",
      stagger: 0.04
    }, 0.3);

    // Cyan glow sweep across text
    timeline.to(allText, {
      color: "#06b6d4",
      textShadow: "0 0 20px rgba(6, 182, 212, 0.8)",
      duration: 0.4,
      ease: "power2.inOut",
      stagger: 0.02
    }, 0.5);

    // Reset glow slightly
    timeline.to(allText, {
      color: "#ffffff",
      textShadow: "none",
      duration: 0.4,
      ease: "power2.inOut"
    }, 1.0);

    // Scene 4: Wallet Drop SLAM
    // Scale from 0, 3D rotate
    const walletEl = crashRefs.current.walletRef;
    const trails = crashRefs.current.trailsRef;
    
    if (walletEl) {
      timeline.fromTo(walletEl,
        { scale: 0, rotationX: 180, rotationY: -90, rotationZ: 45, opacity: 0, z: -1000 },
        { scale: 2, rotationX: 0, rotationY: 0, rotationZ: 0, opacity: 1, z: 0, duration: 0.7, ease: "expo.in" },
        0.8 // Start drop at 0.8s
      );

      // Motion Trails trailing behind
      trails.forEach((trail, i) => {
        timeline.fromTo(trail,
          { scale: 0, rotationX: 180, rotationY: -90, rotationZ: 45, opacity: 0, z: -1000 },
          { scale: 2, rotationX: 0, rotationY: 0, rotationZ: 0, opacity: 0.5 - (i * 0.15), z: 0, duration: 0.7, ease: "expo.in" },
          0.8 - (i * 0.04) // Offset trails slightly
        );
        // fade them instantly at impact
        timeline.set(trail, { opacity: 0 }, 1.5);
      });
    }

    // IMPACT at exactly 1.5s
    const impactTime = 1.5;

    // Camera shake
    timeline.to(containerRef.current, {
      x: () => Math.random() * 40 - 20,
      y: () => Math.random() * 40 - 20,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      ease: "none"
    }, impactTime);
    timeline.set(containerRef.current, { x: 0, y: 0 }, impactTime + 0.3);

    // Text shattering / physics reaction to the slam
    timeline.to(wLetters, {
      y: 100, rotateZ: () => Math.random() * 40 - 20, opacity: 0, filter: "blur(20px)",
      duration: 0.4, ease: "power4.out", stagger: { amount: 0.1, from: "center" }
    }, impactTime);
    
    timeline.to(pLetters, {
      y: 100, rotateZ: () => Math.random() * 40 - 20, opacity: 0, filter: "blur(20px)",
      duration: 0.4, ease: "power4.out", stagger: { amount: 0.1, from: "center" }
    }, impactTime);

    // Shockwave & Energy
    const flashEl = crashRefs.current.flashRef;
    if (flashEl) {
      timeline.fromTo(flashEl, { opacity: 1 }, { opacity: 0, duration: 0.5, ease: "expo.out" }, impactTime);
    }

    const ringEl = crashRefs.current.energyRingRef;
    if (ringEl) {
      timeline.fromTo(ringEl, 
        { scale: 0, opacity: 1, borderWidth: "10px" }, 
        { scale: 30, opacity: 0, borderWidth: "1px", duration: 0.8, ease: "expo.out" }, 
        impactTime
      );
    }

    // Scene 5: Coin Explosion
    const coins = explosionRefs.current.coinsRef;
    coins.forEach((coin) => {
      const angle = Math.random() * Math.PI * 2;
      const forceXY = Math.random() * 1200 + 400; // Violent burst
      const forceZ = (Math.random() - 0.5) * 2000; // Depth of field

      const tx = Math.cos(angle) * forceXY;
      const ty = Math.sin(angle) * forceXY - (Math.random() * 600); // Bias upward initially

      // Depth blur simulation based on Z
      const blurAmount = Math.abs(forceZ) > 800 ? `${Math.abs(forceZ) / 200}px` : "0px";

      gsap.set(coin, { opacity: 1, x: 0, y: 0, z: 0, scale: 0, filter: `blur(${blurAmount})` });

      // The initial explosive burst outward
      timeline.to(coin, {
        x: tx,
        y: ty,
        z: forceZ,
        scale: Math.random() * 0.8 + 0.6,
        rotationX: Math.random() * 1440 - 720,
        rotationY: Math.random() * 1440 - 720,
        rotationZ: Math.random() * 720 - 360,
        duration: Math.random() * 0.5 + 0.4,
        ease: "expo.out"
      }, impactTime);

      // Gravity pulls them down fast
      timeline.to(coin, {
        y: "200vh",
        duration: Math.random() * 0.8 + 0.5,
        ease: "power2.in"
      }, impactTime + 0.3 + (Math.random() * 0.2));
    });

    // Scene 6: Seamless Navbar Reveal transition
    // The wallet icon smoothly moves up into its final navbar logo position
    if (walletEl) {
      timeline.to(walletEl, {
        scale: 0.6,
        yPercent: -450, // Approximate navbar height position
        xPercent: -400, // Move to left
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        duration: 0.8,
        ease: "expo.inOut"
      }, impactTime + 0.5);
    }

    // Total time is roughly 1.5s (impact) + 0.5s (wait) + 0.8s (wallet transition) = 2.8s total active animation.
    // Hold for 0.2s then fade out
    timeline.to({}, { duration: 0.2 });

    tl.current = timeline;

    return () => {
      if (tl.current) tl.current.kill();
    };
  }, [onComplete]);

  return (
    <div className="intro-overlay" ref={containerRef}>
      
      {/* Light Sweep */}
      <div className="intro-sweep" ref={sweepRef}></div>

      {/* Ambient Particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={`p-${i}`} className="intro-ambient-particle" style={{
          width: Math.random() * 3 + 1 + 'px',
          height: Math.random() * 3 + 1 + 'px',
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          opacity: Math.random() * 0.5 + 0.1,
          transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`
        }}></div>
      ))}

      {/* 3D Scene Container */}
      <div className="intro-scene">
        
        {/* Animated Text */}
        <div className="intro-text-wrapper absolute">
          <div className="intro-word" ref={textWalletRef}>
            {walletLetters.map((l, i) => <span key={i} className="intro-letter">{l}</span>)}
          </div>
          <div className="intro-word" ref={textPayRef}>
            {payLetters.map((l, i) => <span key={i} className="intro-letter text-gradient">{l}</span>)}
          </div>
        </div>

        {/* The crash effects & wallet */}
        <WalletCrash ref={crashRefs} />

        {/* The 150+ Coins */}
        <CoinExplosion ref={explosionRefs} count={150} />
      </div>

      <button 
        className={`intro-skip-btn ${showSkip ? 'visible' : ''}`}
        onClick={handleSkip}
      >
        Skip Intro
      </button>

    </div>
  );
}
