import tinycolor from 'tinycolor2';

type ColorShades = [string, string, string, string, string, string, string, string, string, string];

interface ShadeMap {
  [key: number]: string;
}

interface Config {
  hueUpStep: number;
  hueDownStep: number;
  saturationUpStep: number;
  saturationDownStep: number;
  lightnessUpStep: number;
  lightnessDownStep: number;
}

export function generateColorShades(centerColor: string): ColorShades {
  const config: Config = {
    hueUpStep: 2.2,
    hueDownStep: 2.5,
    saturationUpStep: 1.7,
    saturationDownStep: 2.0,
    lightnessUpStep: 8.4,
    lightnessDownStep: 6.8,
  };

  const mainColor = tinycolor(centerColor);

  const shadeMap: ShadeMap = {
    50: mainColor
      .clone()
      .spin(config.hueUpStep * 4.5)
      .saturate(config.saturationUpStep * 4.5)
      .lighten(config.lightnessUpStep * 4.5)
      .toHexString(),
    100: mainColor
      .clone()
      .spin(config.hueUpStep * 4.0)
      .saturate(config.saturationUpStep * 4.0)
      .lighten(config.lightnessUpStep * 4.0)
      .toHexString(),
    200: mainColor
      .clone()
      .spin(config.hueUpStep * 3.0)
      .saturate(config.saturationUpStep * 3.0)
      .lighten(config.lightnessUpStep * 3.0)
      .toHexString(),
    300: mainColor
      .clone()
      .spin(config.hueUpStep * 2.0)
      .saturate(config.saturationUpStep * 2.0)
      .lighten(config.lightnessUpStep * 2.0)
      .toHexString(),
    400: mainColor
      .clone()
      .spin(config.hueUpStep)
      .saturate(config.saturationUpStep)
      .lighten(config.lightnessUpStep)
      .toHexString(),
    500: mainColor.toHexString(),
    600: mainColor
      .clone()
      .spin(-config.hueDownStep)
      .saturate(-config.saturationDownStep)
      .darken(config.lightnessDownStep)
      .toHexString(),
    700: mainColor
      .clone()
      .spin(-config.hueDownStep * 2.0)
      .saturate(-config.saturationDownStep * 2.0)
      .darken(config.lightnessDownStep * 2.0)
      .toHexString(),
    800: mainColor
      .clone()
      .spin(-config.hueDownStep * 3.0)
      .saturate(-config.saturationDownStep * 3.0)
      .darken(config.lightnessDownStep * 3.0)
      .toHexString(),
    900: mainColor
      .clone()
      .spin(-config.hueDownStep * 4.0)
      .saturate(-config.saturationDownStep * 4.0)
      .darken(config.lightnessDownStep * 4.0)
      .toHexString(),
  };
  const sortedShadeKeys: (keyof typeof shadeMap)[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  return sortedShadeKeys.map((key) => shadeMap[key]) as ColorShades;
}
