import styled from 'styled-components';
import { Spacing, SpacingCSS } from '../../../utils/theme';

export const Input = styled.input<Spacing>`
  height: 40px;
  padding: ${({ theme }) => `${theme.spacing.xs}px ${theme.spacing.s}px`};
  ${SpacingCSS};
  text-align: center;
  border-radius: ${({ theme }) => theme.spacing.s}px;
  background-color: ${({ theme }) => theme.colors.black_200};
  color: ${({ theme }) => theme.colors.black_800};
  // border: 1px solid ${({ theme }) => theme.colors.black_800};
  border: none;
  outline: none;
  transition: border-top-color 300ms, border-right-color 300ms, border-bottom-color 300ms, border-left-color 300ms;

  :hover {
    color: ${({ theme }) => theme.colors.black_700};
    // border-color: 1px solid $ {({ theme }) => theme.colors.black_700};
  }

  :disabled {
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.black_500};
    //border-color: 1px solid $ {({ theme }) => theme.colors.black_500};
  }
  
  :focus {
    outline: 2px solid ${({ theme }) => theme.colors.cyan};
  }
`;
