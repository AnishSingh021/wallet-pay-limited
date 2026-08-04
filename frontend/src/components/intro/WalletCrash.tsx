import React, { forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import logoImage from '../../assets/logo.png';

export interface WalletCrashRefs {
  walletRef: HTMLDivElement | null;
  energyRingRef: HTMLDivElement | null;
  flashRef: HTMLDivElement | null;
  fragmentsRef: HTMLDivElement[];
  trailsRef: HTMLDivElement[];
}

export const WalletCrash = forwardRef<WalletCrashRefs>((_, ref) => {
  const walletRef = useRef<HTMLDivElement>(null);
  const energyRingRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const fragmentsRef = useRef<HTMLDivElement[]>([]);
  const trailsRef = useRef<HTMLDivElement[]>([]);

  useImperativeHandle(ref, () => ({
    get walletRef() { return walletRef.current; },
    get energyRingRef() { return energyRingRef.current; },
    get flashRef() { return flashRef.current; },
    get fragmentsRef() { return fragmentsRef.current; },
    get trailsRef() { return trailsRef.current; }
  }));

  const fragments = useMemo(() => Array.from({ length: 12 }), []);
  const trails = useMemo(() => Array.from({ length: 3 }), []);

  return (
    <div className="crash-container">
      {/* Background Energy Flash */}
      <div className="energy-flash" ref={flashRef}></div>
      
      {/* Physical Shockwave Ring */}
      <div className="energy-ring" ref={energyRingRef}></div>
      
      {/* Motion Trails for the Slam */}
      {trails.map((_, i) => (
        <div 
          key={`trail-${i}`} 
          className="motion-trail"
          ref={(el) => { if(el) trailsRef.current[i] = el; }}
        >
          <img src={logoImage} alt="trail" />
        </div>
      ))}

      {/* Main Dropping Wallet */}
      <div className="crash-wallet" ref={walletRef}>
        <img src={logoImage} alt="Wallet Logo" />
      </div>

      {/* Glass Fragments / Sparks */}
      {fragments.map((_, i) => (
        <div 
          key={`frag-${i}`} 
          className="glass-fragment"
          ref={(el) => { if(el) fragmentsRef.current[i] = el; }}
        ></div>
      ))}
    </div>
  );
});
