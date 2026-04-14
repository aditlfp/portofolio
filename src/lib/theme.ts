export function hexToHSL(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length == 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length == 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function HSLToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  let rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  let gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  let bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return '#' + rHex + gHex + bHex;
}

export function generateThemeVars(primaryHex: string) {
  const { h, s, l } = hexToHSL(primaryHex);
  
  // Algorithmic derivations (Material Design 3 approximation)
  // Primary is the base color (usually lighter in dark mode, darker in light mode, but we map dynamically)

  // Primary palette
  const primary = HSLToHex(h, s, l);
  const onPrimary = l > 50 ? HSLToHex(h, s, 10) : HSLToHex(h, s, 95); // High contrast text

  // Container is usually darker in dark mode, lighter in light mode. We assume default dark mode here for container logic,
  // but it's safe to use a generic vibrant dark/light shift. Let's make container darker.
  const primaryContainer = HSLToHex(h, s, Math.max(l - 30, 20)); 
  const onPrimaryContainer = HSLToHex(h, s, Math.min(l + 30, 95));

  const inversePrimary = HSLToHex(h, s, l > 50 ? l - 40 : l + 40);

  // Surface Tint (usually same as primary)
  const surfaceTint = primary;

  return {
    '--color-primary': primary,
    '--color-on-primary': onPrimary,
    '--color-primary-container': primaryContainer,
    '--color-on-primary-container': onPrimaryContainer,
    '--color-inverse-primary': inversePrimary,
    '--color-surface-tint': surfaceTint,
  };
}
