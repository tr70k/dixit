import styled from 'styled-components';
import { Spacing, SpacingCSS } from '../../../utils/theme';

export const Button = styled.button<Spacing>`
  height: 40px;
  padding: ${({ theme }) => `${theme.spacing.xs}px ${theme.spacing.s}px`};
  ${SpacingCSS};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${({ theme }) => theme.spacing.s}px;
  border: none;
  background-color: ${({ theme }) => theme.colors.black_800};
  color: ${({ theme }) => theme.colors.black_100};
  outline: none;
  cursor: pointer;
  transition: background-color 300ms;

  :hover {
    background-color: ${({ theme }) => theme.colors.black_700};
  }

  :disabled {
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.black_500};
  }

  :focus {
    outline: 2px solid ${({ theme }) => theme.colors.cyan};
  }
`;
