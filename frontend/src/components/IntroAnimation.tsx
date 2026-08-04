import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './IntroAnimation.css';
import logoImage from '../assets/logo.png';

interface IntroAnimationProps {
  onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textWalletRef = useRef<HTMLDivElement>(null);
  const textPayRef = useRef<HTMLDivElement>(null);
  const walletIconRef = useRef<HTMLDivElement>(null);
  const energyRef = useRef<HTMLDivElement>(null);
  const coinsContainerRef = useRef<HTMLDivElement>(null);
  const finalLogoRef = useRef<HTMLDivElement>(null);
  const [showSkip, setShowSkip] = useState(false);
  const tl = useRef<gsap.core.Timeline>(null);

  const walletWord = "Wallet".split("");
  const payWord = "Pay".split("");

  const handleSkip = () => {
    if (tl.current) tl.current.progress(1);
    onComplete();
  };

  useEffect(() => {
    // Show skip button after 2 seconds
    const skipTimer = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(skipTimer);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create particles
    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'intro-particle';
      const size = Math.random() * 4 + 2;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      containerRef.current.appendChild(p);
      particles.push(p);

      gsap.to(p, {
        y: `-=${Math.random() * 100 + 50}`,
        x: `+=${Math.random() * 50 - 25}`,
        opacity: Math.random() * 0.5 + 0.2,
        duration: Math.random() * 5 + 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    tl.current = gsap.timeline({
      onComplete: () => {
        // Fade out entire container
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            particles.forEach(p => p.remove());
            onComplete();
          }
        });
      }
    });

    // Scene 1: Initial pause (0.8s)
    tl.current.to({}, { duration: 0.8 });

    // Scene 2: "Wallet" letters appear
    const wLetters = textWalletRef.current?.children;
    if (wLetters) {
      tl.current.to(wLetters, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.7)",
        filter: "blur(0px)",
        startAt: { filter: "blur(10px)" }
      });
    }

    tl.current.to({}, { duration: 0.3 });

    // Scene 3: "Pay" letters appear
    const pLetters = textPayRef.current?.children;
    if (pLetters) {
      tl.current.to(pLetters, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.7)",
        filter: "blur(0px)",
        startAt: { filter: "blur(15px)" },
        textShadow: "0 0 30px rgba(0, 200, 255, 0.8)"
      });
    }

    // Whole text glows cyan
    tl.current.to([wLetters, pLetters], {
      textShadow: "0 0 40px cyan",
      color: "#e0ffff",
      duration: 1,
      ease: "power2.inOut"
    });

    // Scene 4: Freeze & Camera Zoom
    tl.current.to(containerRef.current, {
      scale: 1.1,
      duration: 2,
      ease: "power1.inOut"
    }, "-=1");

    // Wallet Icon Drops
    tl.current.to(walletIconRef.current, {
      top: "50%",
      yPercent: -50,
      rotationX: 720, // Spin
      rotationY: 360,
      rotationZ: 15,
      scale: 1.5,
      duration: 1.2,
      ease: "power3.in" // Accelerates
    }, "-=1.5");

    // Impact / BOOM
    tl.current.to(containerRef.current, {
      x: () => Math.random() * 20 - 10,
      y: () => Math.random() * 20 - 10,
      duration: 0.1,
      repeat: 5,
      yoyo: true,
      ease: "none"
    }, "-=0.1"); // Camera shake on impact

    // Text cracks/breaks out
    tl.current.to([textWalletRef.current, textPayRef.current], {
      scale: 1.2,
      opacity: 0,
      filter: "blur(20px)",
      duration: 0.3,
      ease: "power4.out"
    }, "-=0.1");

    // Energy explosion
    tl.current.to(energyRef.current, {
      scale: 30,
      opacity: 1,
      duration: 0.4,
      ease: "power2.out"
    }, "-=0.2");
    tl.current.to(energyRef.current, {
      opacity: 0,
      duration: 0.5
    });

    // Scene 5: Gold coins explode
    const generateCoins = () => {
      if (!coinsContainerRef.current) return;
      for (let i = 0; i < 60; i++) {
        const coin = document.createElement('div');
        coin.className = 'intro-gold-coin';
        coinsContainerRef.current.appendChild(coin);
        
        // Random explosion vectors
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 600 + 200;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity - 200; // bias upward initially

        gsap.set(coin, {
          x: "50vw",
          y: "50vh",
          xPercent: -50,
          yPercent: -50,
          z: Math.random() * 400 - 200,
          rotationX: Math.random() * 360,
          rotationY: Math.random() * 360
        });

        gsap.to(coin, {
          x: `+=${tx}`,
          y: `+=${ty}`,
          z: `+=${Math.random() * 800 - 200}`, // Some fly towards camera
          rotationX: `+=${Math.random() * 1080 - 540}`,
          rotationY: `+=${Math.random() * 1080 - 540}`,
          rotationZ: `+=${Math.random() * 720 - 360}`,
          duration: Math.random() * 1 + 1.5,
          ease: "power4.out",
        });

        // Gravity effect after explosion
        gsap.to(coin, {
          y: "150vh", // fall below screen
          duration: Math.random() * 1.5 + 1.5,
          ease: "power2.in",
          delay: 0.5
        });
      }
    };

    tl.current.call(generateCoins, [], "-=0.3");

    // Scene 6: Logo clean up
    tl.current.to(walletIconRef.current, {
      scale: 1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      duration: 1.5,
      ease: "power3.out"
    }, "+=0.5");

    tl.current.to(finalLogoRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out"
    }, "-=1");

    // Hold for a bit before ending
    tl.current.to({}, { duration: 1.5 });

    return () => {
      particles.forEach(p => p.remove());
      if (tl.current) tl.current.kill();
    };
  }, [onComplete]);

  return (
    <div className="intro-container" ref={containerRef}>
      
      {/* Wallet / Pay text sequence */}
      <div className="intro-text-container absolute">
        <div className="intro-word" ref={textWalletRef}>
          {walletWord.map((letter, i) => (
            <span key={i} className="intro-letter">{letter}</span>
          ))}
        </div>
        <div className="intro-word text-primary-400" ref={textPayRef}>
          {payWord.map((letter, i) => (
            <span key={i} className="intro-letter">{letter}</span>
          ))}
        </div>
      </div>

      {/* 3D Wallet dropping */}
      <div className="intro-wallet-drop" ref={walletIconRef}>
        <img src={logoImage} alt="Wallet Icon" className="intro-wallet-img" />
      </div>

      {/* Energy Explosion */}
      <div className="intro-energy-explosion" ref={energyRef} />

      {/* Coins container */}
      <div ref={coinsContainerRef} className="absolute inset-0 pointer-events-none" />

      {/* Final Clean Logo */}
      <div 
        ref={finalLogoRef}
        className="absolute top-[60%] flex flex-col items-center gap-2 opacity-0 translate-y-10"
      >
        <span className="text-4xl font-display font-extrabold tracking-tight text-white">
          Wallet Pay
        </span>
        <span className="text-sm text-surface-400 font-medium tracking-widest uppercase">
          Reward Your Consistency
        </span>
      </div>

      {/* Skip Button */}
      <button 
        className={`intro-skip-btn ${showSkip ? 'visible' : ''}`}
        onClick={handleSkip}
      >
        Skip Intro
      </button>

    </div>
  );
}
