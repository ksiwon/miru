// styles/styled-components.d.ts
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
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
    };
    typography: {
      T1: {
        fontFamily: string;
        fontWeight: number;
        fontSize: string;
        lineHeight: string;
      };
      T2: {
        fontFamily: string;
        fontWeight: number;
        fontSize: string;
        lineHeight: string;
      };
      T3: {
        fontFamily: string;
        fontWeight: number;
        fontSize: string;
        lineHeight: string;
      };
      T4: {
        fontFamily: string;
        fontWeight: number;
        fontSize: string;
        lineHeight: string;
      };
      T5: {
        fontFamily: string;
        fontWeight: number;
        fontSize: string;
        lineHeight: string;
      };
      T6: {
        fontFamily: string;
        fontWeight: number;
        fontSize: string;
        lineHeight: string;
      };
      T7: {
        fontFamily: string;
        fontWeight: number;
        fontSize: string;
        lineHeight: string;
      };
    };
  }
}