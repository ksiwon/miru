// styles/styled.d.ts
export interface TypographyStyle {
  fontFamily: string;
  fontWeight: number;
  fontSize: string;
  lineHeight: string;
}

export interface ColorPalette {
  primary: string;
  white: string;
  black: string;
  gray: {
    600: string;
    300: string;
    200: string;
    100: string;
  };
  red: {
    600: string;
    300: string;
    100: string;
  };
  green: {
    600: string;
    300: string;
  };
  blue: {
    600: string;
    100: string;
  };
  purple: {
    300: string;
    100: string;
  };
  yellow: {
    600: string;
  };
  turkey: {
    600: string;
  };
}