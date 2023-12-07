import Color from 'colorjs.io';

function generateRandomAgentColorHex() {
  const hue = Math.floor((Math.random() + Math.random() + Math.random()) * 360) % 360;
  const saturation = 85 + Math.floor(Math.random() * 15);
  const lightness = 65 + Math.floor(Math.random() * 20);
  const color = new Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  return color.to('srgb').toString({ format: 'hex' });
}

export function getRandomAgentColor(existingColors: string[]) {
  const colorGroups = [
    ['#f5222d', '#e84749', '#F56565'],
    ['#fa541c', '#fa8c16', '#faad14'],
    ['#c2a600', '#d8bd14', '#fadb14'],
    ['#38A169', '#52c41a', '#a0d911'],
    ['#319795', '#13c2c2', '#0BC5EA'],
    ['#1677ff', '#2f54eb', '#4299E1'],
    ['#9254de', '#b391f5', '#c9b6fc'],
    ['#eb2f96', '#ED64A6', '#f7a8c0'],
  ];
  const colorPool = colorGroups.flat().sort(() => 0.5 - Math.random());
  const remainingColors = colorPool.filter((color) => !existingColors.includes(color));
  if (remainingColors.length === 0) {
    const newColor = generateRandomAgentColorHex();
    if (existingColors.includes(newColor)) {
      return getRandomAgentColor(existingColors);
    } else {
      return newColor;
    }
  }
  return remainingColors[Math.floor(Math.random() * remainingColors.length)];
}
