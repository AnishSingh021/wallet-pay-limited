import React, { forwardRef, useImperativeHandle, useRef, useMemo } from 'react';

export interface CoinExplosionRefs {
  coinsRef: HTMLDivElement[];
}

export interface CoinExplosionProps {
  count?: number;
}

export const CoinExplosion = forwardRef<CoinExplosionRefs, CoinExplosionProps>(({ count = 150 }, ref) => {
  const coinsRef = useRef<HTMLDivElement[]>([]);

  useImperativeHandle(ref, () => ({
    get coinsRef() { return coinsRef.current; }
  }));

  const coins = useMemo(() => Array.from({ length: count }), [count]);

  return (
    <div className="coin-container">
      {coins.map((_, i) => (
        <div 
          key={i} 
          className="coin"
          ref={(el) => {
            if (el) coinsRef.current[i] = el;
          }}
        >
          {/* True 3D Coin Construction */}
          <div className="coin-face"></div>
          <div className="coin-edge"></div>
          <div className="coin-back coin-face"></div>
        </div>
      ))}
    </div>
  );
});
