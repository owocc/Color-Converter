interface RGB { r: number; g: number; b: number; a?: number }
interface HSL { h: number; s: number; l: number; a?: number; }
interface Oklch { L: number; C: number; h: number; a?: number; }
export type ColorFormat = 'oklch' | 'hex' | 'rgb' | 'hsl';
export interface ConvertOptions {
    format: ColorFormat;
    useCssSyntax: boolean;
}

export const COLOR_REGEX = /(hsl(a?)\([^\)]+\))|(rgb(a?)\([^\)]+\))|(#[a-fA-F0-9]{3,8})|(oklch\([^\)]+\))/g;

// --- PARSING FUNCTIONS ---

function hexToRgb(hex: string): RGB | null {
  hex = hex.replace(/^#/, '');

  if (hex.length === 4) { // #rgba
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  } else if (hex.length === 3) { // #rgb
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  if (hex.length !== 6 && hex.length !== 8) return null;

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  if (hex.length === 8) {
    const a = parseInt(hex.substring(6, 8), 16) / 255;
    return { r, g, b, a };
  }

  return { r, g, b };
}


function rgbStringToRgb(rgbStr: string): RGB | null {
  const match = rgbStr.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:\s*[,\/]\s*([\d.]+))?\)/);
  if (!match) return null;
  const rgb: RGB = {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
  };
  if (match[4] !== undefined) {
    rgb.a = parseFloat(match[4]);
  }
  return rgb;
}

function hslStringToRgb(hslStr: string): RGB | null {
  const match = hslStr.match(/hsla?\((\d+)(?:deg)?[,?\s]+([\d.]+)%?[,\s]+([\d.]+)%?(?:\s*[,\/]\s*([\d.]+))?\)/);
  if (!match) return null;
  
  let h = parseInt(match[1], 10);
  let s = parseFloat(match[2]) / 100;
  let l = parseFloat(match[3]) / 100;
  const a = match[4] !== undefined ? parseFloat(match[4]) : undefined;

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

  return { r, g, b, a };
}

// --- REVERSE CONVERSION (OKLCH -> RGB) ---

function oklchToOklab({ L, C, h }: Oklch): { L: number; a: number; b: number } {
  const rad = h * (Math.PI / 180);
  return { L, a: C * Math.cos(rad), b: C * Math.sin(rad) };
}

function linearRgbToSrgb(c: number): number {
    const v = Math.max(0, Math.min(1, c));
    const srgb = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1/2.4) - 0.055;
    return Math.round(srgb * 255);
}

function oklchStringToRgb(oklchStr: string): RGB | null {
    const match = oklchStr.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+%?))?\s*\)/);
    if (!match) return null;
    
    const oklch: Oklch = {
        L: parseFloat(match[1]) / 100.0,
        C: parseFloat(match[2]),
        h: parseFloat(match[3]),
    };
    
    if (match[4] !== undefined) {
        let alphaStr = match[4];
        if (alphaStr.endsWith('%')) {
            oklch.a = parseFloat(alphaStr) / 100.0;
        } else {
            oklch.a = parseFloat(alphaStr);
        }
    }

    const oklab = oklchToOklab(oklch);
    
    // Oklab to non-linear LMS
    const l_ = oklab.L + 0.3963377774 * oklab.a + 0.2158037573 * oklab.b;
    const m_ = oklab.L - 0.1055613458 * oklab.a - 0.0638541728 * oklab.b;
    const s_ = oklab.L - 0.0894841775 * oklab.a - 1.2914855480 * oklab.b;

    // non-linear LMS to linear LMS
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;
    
    // linear LMS to linear sRGB
    const lr =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    
    // Linear sRGB to sRGB
    const r = linearRgbToSrgb(lr);
    const g = linearRgbToSrgb(lg);
    const b = linearRgbToSrgb(lb);
    
    return { r, g, b, a: oklch.a };
}

// --- CONVERSION PIPELINE (RGB -> TARGET) ---

function rgbToHex({ r, g, b, a }: RGB): string {
  const toHex = (c: number) => Math.round(c).toString(16).padStart(2, '0');
  let hex = `${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (a !== undefined && a < 1) {
    hex += toHex(a * 255);
  }
  return hex;
}

function rgbToHsl({ r, g, b, a }: RGB): HSL {
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
    const hsl: HSL = { h: h * 360, s: s * 100, l: l * 100 };
    if (a !== undefined) {
      hsl.a = a;
    }
    return hsl;
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
    const oklch = oklabToOklch(oklab.L, oklab.a, oklab.b);
    if (rgb.a !== undefined) {
      oklch.a = rgb.a;
    }
    return oklch;
}

// --- FORMATTING FUNCTIONS ---

function formatOklch(oklch: Oklch, useCssSyntax: boolean): string {
    const l = (oklch.L * 100).toFixed(2).replace(/\.00$/, '');
    const c = oklch.C.toFixed(4).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    const h = oklch.h.toFixed(2).replace(/\.00$/, '');

    let alphaPart = '';
    if (oklch.a !== undefined && oklch.a < 1) {
        const a = oklch.a.toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace(/^0\./, '.');
        alphaPart = ` / ${a}`;
    }

    if (useCssSyntax) {
        return `oklch(${l}% ${c} ${h}${alphaPart})`;
    } else {
        return `${l} ${c} ${h}${alphaPart}`;
    }
}


// --- MAIN EXPORTED FUNCTION ---

export function convertCssColors(cssString: string, options: ConvertOptions): string {
  if (!cssString) return '';
  
  return cssString.replace(COLOR_REGEX, (match) => {
    let rgb: RGB | null = null;
    const cleanedMatch = match.toLowerCase().trim();

    try {
        if (cleanedMatch.startsWith('#')) { rgb = hexToRgb(cleanedMatch); } 
        else if (cleanedMatch.startsWith('rgb')) { rgb = rgbStringToRgb(cleanedMatch); } 
        else if (cleanedMatch.startsWith('hsl')) { rgb = hslStringToRgb(cleanedMatch); }
        else if (cleanedMatch.startsWith('oklch')) { rgb = oklchStringToRgb(cleanedMatch); }

        if (!rgb) return match;
        
        rgb = { 
          r: Math.max(0, Math.min(255, rgb.r)), 
          g: Math.max(0, Math.min(255, rgb.g)), 
          b: Math.max(0, Math.min(255, rgb.b)),
          a: rgb.a
        };

        switch(options.format) {
            case 'oklch':
                return formatOklch(rgbToOklch(rgb), options.useCssSyntax);
            case 'hex':
                return (options.useCssSyntax ? '#' : '') + rgbToHex(rgb);
            case 'rgb': {
                 const r = Math.round(rgb.r);
                 const g = Math.round(rgb.g);
                 const b = Math.round(rgb.b);
                 if (rgb.a !== undefined && rgb.a < 1) {
                    const a = parseFloat(rgb.a.toFixed(2));
                    return options.useCssSyntax ? `rgba(${r}, ${g}, ${b}, ${a})` : `${r} ${g} ${b} / ${a}`;
                 }
                 return options.useCssSyntax ? `rgb(${r}, ${g}, ${b})` : `${r} ${g} ${b}`;
            }
            case 'hsl': {
                const hsl = rgbToHsl(rgb);
                const h = hsl.h.toFixed(0);
                const s = hsl.s.toFixed(1).replace(/\.0$/, '');
                const l = hsl.l.toFixed(1).replace(/\.0$/, '');
                if (hsl.a !== undefined && hsl.a < 1) {
                    const a = parseFloat(hsl.a.toFixed(2));
                    return options.useCssSyntax ? `hsla(${h}, ${s}%, ${l}%, ${a})` : `${h} ${s} ${l} / ${a}`;
                }
                return options.useCssSyntax ? `hsl(${h}, ${s}%, ${l}%)` : `${h} ${s} ${l}`;
            }
            default:
                return match;
        }

    } catch (e) {
        console.error("Failed to convert color:", match, e);
        return match;
    }
  });
}