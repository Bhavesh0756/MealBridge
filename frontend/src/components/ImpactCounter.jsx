import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export function ImpactCounter({
  targetValue = 0,
  duration = 1800,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) {
  const countRef = useRef(null);
  const animationRef = useRef(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!countRef.current) return;

    if (prefersReduced) {
      countRef.current.textContent = `${prefix}${targetValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;
      return;
    }

    const obj = { val: 0 };
    animationRef.current = animate(obj, {
      val: targetValue,
      duration: duration,
      ease: 'outExpo',
      onUpdate: () => {
        if (countRef.current) {
          countRef.current.textContent = `${prefix}${obj.val.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}${suffix}`;
        }
      },
    });

    return () => {
      if (animationRef.current?.pause) {
        animationRef.current.pause();
      }
    };
  }, [targetValue, duration, prefix, suffix, decimals, prefersReduced]);

  return (
    <span ref={countRef} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
