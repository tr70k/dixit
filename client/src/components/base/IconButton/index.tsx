import styled from 'styled-components';
import { Spacing, SpacingCSS } from '../../../utils/theme';
import { Button } from '../Button';

export const IconButton = styled.button<Spacing>`
  height: 32px;
  width: 32px;
  ${SpacingCSS};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border: none;
  background-color: ${({ theme }) => theme.colors.transparent};
  outline: none;
  // outline-color: ${({ theme }) => theme.colors.cyan};
  // outline-width: 3px;
  // outline-style: solid;
  // outline-color: ${({ theme }) => theme.colors.cyan};
  cursor: pointer;
  transition: background-color 300ms;

  :hover {
    background-color: ${({ theme }) => theme.colors.transparent_black};
  }

  :disabled {
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.transparent};
  }
`;
