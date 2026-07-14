import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  format?: (val: number) => string;
  className?: string;
  enabled?: boolean;
}

export function AnimatedNumber({ value, format = (v) => v.toString(), className, enabled = true }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(format(value));
  
  const spring = useSpring(value, {
    mass: 1,
    stiffness: 75,
    damping: 15
  });
  
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);
  
  useEffect(() => {
    return spring.onChange((latest) => {
      setDisplayValue(format(latest));
    });
  }, [spring, format]);

  if (!enabled) {
    return <span className={className}>{format(value)}</span>;
  }

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  );
}
