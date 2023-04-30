import { css } from 'styled-components';

export const theme = {
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  },
  colors: {
    black_100: '#f7f7f7',
    black_200: '#ebebeb',
    black_300: '#d9d9d9',
    black_400: '#bdbdbd',
    black_500: '#999',
    black_600: '#737373',
    black_700: '#4d4d4d',
    black_800: '#333',
    black_900: '#1a1a1a',
    transparent_black: 'rgba(0, 0, 0, 0.1)',
    transparent: 'transparent',
    yellow: '#ffb74d',
    orange: '#f57c00',
    red: '#d32f2f',
    cyan: '#29b6f6',
    blue: '#0288d1',
    purple: '#ab47bc',
    pink: '#ce93d8',
    green: '#4caf50',
    olive: '#827717',
    brown: '#795548',
  },
};

type SpacingValue = keyof typeof theme.spacing;

export type Spacing = {
  height?: string | number,
  width?: string | number,
  p?: SpacingValue,
  pt?: SpacingValue,
  pr?: SpacingValue,
  pb?: SpacingValue,
  pl?: SpacingValue,
  m?: SpacingValue,
  mt?: SpacingValue,
  mr?: SpacingValue,
  mb?: SpacingValue,
  ml?: SpacingValue,
}

export const SpacingCSS = css<Spacing>`
  ${({ height }) => height && `height: ${height}${typeof height !== 'string' ? 'px' : ''};`}
  ${({ width }) => width && `width: ${width}${typeof width !== 'string' ? 'px' : ''};`}
  ${({ theme, p }) => p && `padding: ${theme.spacing[p]}px;`}
  ${({ theme, pt }) => pt && `padding-top: ${theme.spacing[pt]}px;`}
  ${({ theme, pr }) => pr && `padding-right: ${theme.spacing[pr]}px;`}
  ${({ theme, pb }) => pb && `padding-bottom: ${theme.spacing[pb]}px;`}
  ${({ theme, pl }) => pl && `padding-left: ${theme.spacing[pl]}px;`}
  ${({ theme, m }) => m && `margin: ${theme.spacing[m]}px;`}
  ${({ theme, mt }) => mt && `margin-top: ${theme.spacing[mt]}px;`}
  ${({ theme, mr }) => mr && `margin-right: ${theme.spacing[mr]}px;`}
  ${({ theme, mb }) => mb && `margin-bottom: ${theme.spacing[mb]}px;`}
  ${({ theme, ml }) => ml && `margin-left: ${theme.spacing[ml]}px;`}
`;
