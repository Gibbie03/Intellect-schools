export function darkenColor(hex: string, amount = 0.6) {
  const color = hex.replace("#", "");

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  const darkR = Math.round(r * (1 - amount));
  const darkG = Math.round(g * (1 - amount));
  const darkB = Math.round(b * (1 - amount));

  return `rgb(${darkR}, ${darkG}, ${darkB})`;
    }
