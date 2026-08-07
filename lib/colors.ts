export function generateBrandPalette(hex: string) {
  const { h, s } = hexToHsl(hex);

  return {
    100: `hsl(${h}, ${Math.max(s - 35, 20)}%, 96%)`,
    300: `hsl(${h}, ${Math.max(s - 15, 30)}%, 82%)`,
    500: `hsl(${h}, ${s}%, 50%)`,
    700: `hsl(${h}, ${Math.min(s + 5, 100)}%, 30%)`,
    900: `hsl(${h}, ${Math.min(s + 10, 100)}%, 16%)`,
  };
}

function hexToHsl(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");

  const bigint = parseInt(clean, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;

    s = l > 0.5
      ? d / (2 - max - min)
      : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;

      case g:
        h = (b - r) / d + 2;
        break;

      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
    }
