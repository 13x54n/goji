import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

export interface AnimatedBalanceProps {
  value: string;
  style?: any;
  animationDuration?: number;
  prefix?: string;
  suffix?: string;
}

export default function AnimatedBalance({ 
  value, 
  style, 
  animationDuration = 500,
  prefix = '',
  suffix = ''
}: AnimatedBalanceProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const previousValue = useRef(value);

  useEffect(() => {
    if (value !== previousValue.current) {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Update value
        setDisplayValue(value);
        previousValue.current = value;
        
        // Animate in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: animationDuration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: animationDuration / 2,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [value, animationDuration, fadeAnim, scaleAnim]);

  return (
    <Animated.Text 
      style={[
        styles.balance,
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      {prefix}{displayValue}{suffix}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
