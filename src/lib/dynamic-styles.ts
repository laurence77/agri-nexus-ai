/**
 * Dynamic Styles Utility
 * 
 * Safe utility functions for handling dynamic styles without inline styles
 * Provides type-safe, sanitized CSS generation for data-driven UI components
 */

export type CSSProperties = React.CSSProperties;

/**
 * Sanitize CSS values to prevent injection attacks
 */
export function sanitizeCSSValue(value: string | number): string {
  if (typeof value === 'number') {
    return String(value);
  }
  
  // Remove potentially dangerous characters and limit length
  return String(value)
    .replace(/[^a-zA-Z0-9#().,\s%-]/g, '')
    .substring(0, 50);
}

/**
 * Create safe CSS custom properties for dynamic values
 */
export function createCSSProperties(properties: Record<string, string | number>): CSSProperties {
  const cssProps: CSSProperties = {};
  
  Object.entries(properties).forEach(([key, value]) => {
    // Ensure property names are safe
    const safeKey = key.startsWith('--') ? key : `--${key}`;
    const sanitizedKey = safeKey.replace(/[^a-zA-Z0-9-]/g, '-');
    const sanitizedValue = sanitizeCSSValue(value);
    
    (cssProps as any)[sanitizedKey] = sanitizedValue;
  });
  
  return cssProps;
}

/**
 * Generate Tailwind-compatible width classes for percentages
 */
export function getWidthClass(percentage: number): string {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  // Common percentage classes in Tailwind
  const widthMap: Record<number, string> = {
    0: 'w-0',
    5: 'w-1/20',
    10: 'w-1/10', 
    15: 'w-3/20',
    20: 'w-1/5',
    25: 'w-1/4',
    30: 'w-3/10',
    33: 'w-1/3',
    40: 'w-2/5',
    50: 'w-1/2',
    60: 'w-3/5',
    65: 'w-13/20',
    66: 'w-2/3',
    70: 'w-7/10',
    75: 'w-3/4',
    80: 'w-4/5',
    85: 'w-17/20',
    90: 'w-9/10',
    95: 'w-19/20',
    100: 'w-full'
  };
  
  // Find closest match
  const closest = Object.keys(widthMap)
    .map(Number)
    .reduce((prev, curr) => 
      Math.abs(curr - clampedPercentage) < Math.abs(prev - clampedPercentage) ? curr : prev
    );
  
  return widthMap[closest] || 'w-full';
}

/**
 * Generate safe background color classes for dynamic colors
 */
export function getBackgroundColorClass(colorIndex: number): string {
  const colorClasses = [
    'bg-red-500',    // #ef4444
    'bg-orange-500', // #f97316
    'bg-yellow-500', // #eab308
    'bg-green-500',  // #22c55e
    'bg-blue-500',   // #3b82f6
    'bg-purple-500', // #8b5cf6
    'bg-pink-500'    // #ec4899
  ];
  
  return colorClasses[colorIndex % colorClasses.length] || 'bg-gray-500';
}

/**
 * Create a style object with CSS custom properties for progress bars
 */
export function createProgressBarStyle(percentage: number): CSSProperties {
  return createCSSProperties({
    'progress-width': `${Math.max(0, Math.min(100, percentage))}%`
  });
}

/**
 * Create a style object with CSS custom properties for background images
 */
export function createBackgroundImageStyle(imageUrl: string): CSSProperties {
  if (!imageUrl) return {};
  
  // Basic URL validation to prevent XSS
  const isValidUrl = /^https?:\/\//.test(imageUrl) || imageUrl.startsWith('data:image/');
  if (!isValidUrl) {
    console.warn('Invalid image URL provided to createBackgroundImageStyle');
    return {};
  }
  
  return createCSSProperties({
    'bg-image': `url(${imageUrl})`
  });
}

/**
 * Utility class names for common dynamic styles
 */
export const DYNAMIC_CLASSES = {
  // Progress bar widths
  progressBar: 'w-[var(--progress-width)]',
  batteryLevel: 'w-[var(--battery-level)]',
  notificationProgress: 'w-[var(--notification-progress)]',
  
  // Background images
  coverImage: 'bg-[image:var(--bg-image)]',
  productImage: 'bg-[image:var(--bg-image)]',
  
  // Animation delays
  animateDelay2s: 'animate-delay-2s',
  animateDelay3s: 'animate-delay-3s',
  animateDelay4s: 'animate-delay-4s',
} as const;

/**
 * Create responsive breakpoint styles
 */
export function createResponsiveStyle(
  mobile: CSSProperties,
  tablet?: CSSProperties,
  desktop?: CSSProperties
): CSSProperties {
  // For now, just return mobile styles
  // In a full implementation, you'd handle media queries
  return mobile;
}