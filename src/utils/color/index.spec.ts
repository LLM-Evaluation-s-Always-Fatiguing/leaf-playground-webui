import { test } from '@jest/globals';
import { getRandomAgentColor } from '@/utils/color/index';

test('Test Random Color', async () => {
  const existColors: string[] = [];

  for (let i = 0; i < 1000; i++) {
    const color = getRandomAgentColor(existColors);
    if (existColors.includes(color)) {
      throw new Error(`Duplicate color: ${color} at ${i}th iteration`);
    }
    existColors.push(color);
  }
});
