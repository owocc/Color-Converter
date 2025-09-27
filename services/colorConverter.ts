
interface RGB { r: number; g: number; b: number; }
interface HSL { h: number; s: number; l: number; }
interface Oklch { L: number; C: number; h: number; }
export type ColorFormat = 'oklch' | 'hex' | 'rgb' | 'hsl';
export interface ConvertOptions {
    format: ColorFormat;
    useCssSyntax: boolean;
}

// --- PARSING FUNCTIONS ---

function hexToRgb(hex: string): RGB | null {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  if (hex.length !== 6) return null;
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbStringToRgb(rgbStr: string): RGB | null {
  const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
  };
}

function hslStringToRgb(hslStr: string): RGB | null {
  const match = hslStr.match(/hsla?\((\d+),\s*([\d.]+)%?,\s*([\d.]+)%?/);
  if (!match) return null;
  
  let h = parseInt(match[1], 10);
  let s = parseInt(match[2], 10) / 100;
  let l = parseInt(match[3], 10) / 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { [r, g, b] = [c, x, 0]; }
  else if (60 <= h && h < 120) { [r, g, b] = [x, c, 0]; }
  else if (120 <= h && h < 180) { [r, g, b] = [0, c, x]; }
  else if (180 <= h && h < 240) { [r, g, b] = [0, x, c]; }
  else if (240 <= h && h < 300) { [r, g, b] = [x, 0, c]; }
  else if (300 <= h && h < 360) { [r, g, b] = [c, 0, x]; }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return { r, g, b };
}


// --- CONVERSION PIPELINE (RGB -> TARGET) ---

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (c: number) => Math.round(c).toString(16).padStart(2, '0');
  return `${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl({ r, g, b }: RGB): HSL {
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

function srgbToLinearRgb(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function linearRgbToXyz(r: number, g: number, b: number): { x: number; y: number; z: number } {
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
  return { x, y, z };
}

function xyzToOklab(x: number, y: number, z: number): { L: number; a: number; b: number } {
  const l = 0.4122214708 * x + 0.5363325363 * y + 0.0514459929 * z;
  const m = 0.2119034982 * x + 0.6806995451 * y + 0.1073969566 * z;
  const s = 0.0883024619 * x + 0.2817188376 * y + 0.6299787005 * z;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

function oklabToOklch(L: number, a: number, b: number): Oklch {
  const C = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * (180 / Math.PI);
  if (h < 0) { h += 360; }
  return { L, C, h };
}

function rgbToOklch(rgb: RGB): Oklch {
    const linearR = srgbToLinearRgb(rgb.r);
    const linearG = srgbToLinearRgb(rgb.g);
    const linearB = srgbToLinearRgb(rgb.b);
    const xyz = linearRgbToXyz(linearR, linearG, linearB);
    const oklab = xyzToOklab(xyz.x, xyz.y, xyz.z);
    return oklabToOklch(oklab.L, oklab.a, oklab.b);
}

// --- FORMATTING FUNCTIONS ---

function formatOklch(oklch: Oklch, useCssSyntax: boolean): string {
    const l = (oklch.L * 100).toFixed(2).replace(/\.00$/, '');
    const c = oklch.C.toFixed(4).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    const h = oklch.h.toFixed(2).replace(/\.00$/, '');
    return useCssSyntax ? `oklch(${l}% ${c} ${h})` : `${l} ${c} ${h}`;
}

// --- MAIN EXPORTED FUNCTION ---

export function convertCssColors(cssString: string, options: ConvertOptions): string {
  if (!cssString) return '';
  const colorRegex = /(hsl(a?)\s*\([\d\s.,%]+\))|(rgb(a?)\s*\([\d\s.,]+\))|(#[a-fA-F0-9]{3,8})/g;
  
  return cssString.replace(colorRegex, (match) => {
    let rgb: RGB | null = null;
    const cleanedMatch = match.toLowerCase().trim();

    try {
        if (cleanedMatch.startsWith('#')) { rgb = hexToRgb(cleanedMatch); } 
        else if (cleanedMatch.startsWith('rgb')) { rgb = rgbStringToRgb(cleanedMatch); } 
        else if (cleanedMatch.startsWith('hsl')) { rgb = hslStringToRgb(cleanedMatch); }

        if (!rgb) return match;
        
        rgb = { 
          r: Math.max(0, Math.min(255, rgb.r)), 
          g: Math.max(0, Math.min(255, rgb.g)), 
          b: Math.max(0, Math.min(255, rgb.b)) 
        };

        switch(options.format) {
            case 'oklch':
                return formatOklch(rgbToOklch(rgb), options.useCssSyntax);
            case 'hex':
                return (options.useCssSyntax ? '#' : '') + rgbToHex(rgb);
            case 'rgb':
                 const r = Math.round(rgb.r);
                 const g = Math.round(rgb.g);
                 const b = Math.round(rgb.b);
                 return options.useCssSyntax ? `rgb(${r}, ${g}, ${b})` : `${r} ${g} ${b}`;
            case 'hsl':
                const hsl = rgbToHsl(rgb);
                const h = hsl.h.toFixed(0);
                const s = hsl.s.toFixed(1);
                const l = hsl.l.toFixed(1);
                return options.useCssSyntax ? `hsl(${h}, ${s}%, ${l}%)` : `${h} ${s} ${l}`;
            default:
                return match;
        }

    } catch (e) {
        console.error("Failed to convert color:", match, e);
        return match;
    }
  });
}