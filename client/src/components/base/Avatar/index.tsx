import React from 'react';
import styled from 'styled-components';
import { Color } from '../../../utils/room';
import { Box } from '../Box';
import { Spacing } from '../../../utils/theme';

const AVATARS: Array<{
  icon: string,
  name: string,
}> = [
  { icon: '🐶', name: 'DOG' },
  { icon: '🦊', name: 'FOX' },
  { icon: '🐱', name: 'CAT' },
  { icon: '🦁', name: 'LION' },
  { icon: '🐯', name: 'TIGER' },
  { icon: '🐮', name: 'COW' },
  { icon: '🐷', name: 'PIG' },
  { icon: '🐭', name: 'MOUSE' },
  { icon: '🐹', name: 'HAMSTER' },
  { icon: '🐰', name: 'RABBIT' },
  { icon: '🐻', name: 'BEAR' },
  { icon: '🐼️', name: 'PANDA' },
  { icon: '🐨', name: 'KOALA' },
  { icon: '🐵', name: 'MONKEY' },
  { icon: '🐔', name: 'CHICKEN' },
  { icon: '🐤', name: 'BABY CHICK' },
  { icon: '🐦', name: 'BIRD' },
  { icon: '🐧', name: 'PENGUIN' },
  { icon: '🐸', name: 'FROG' },
];

export const getAvatar = (id: string) => {
  const index = +id.replace(/\D/g,'') % AVATARS.length;
  return AVATARS[index].icon;
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const getName = ({ id, color }: { id: string, color: Color }) => {
  const index = +id.replace(/\D/g,'') % AVATARS.length;
  return capitalize(color) + ' ' + capitalize(AVATARS[index].name);
};

const AvatarStyled = styled(Box)<{ size: number, color: string }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  font-size: ${({ size }) => size / 2}px;
  background-color: ${({ color, theme }) => theme.colors[color.toLowerCase()] ?? theme.colors.black_500};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
`;

type AvatarProps = Spacing & {
  player: {
    id: string,
    color: Color
  },
  size?: number,
}

export const Avatar = ({ player, size = 32, ...props }: AvatarProps) => {
  return (
    <AvatarStyled size={size} color={player.color} {...props}>
      {getAvatar(player.id)}
    </AvatarStyled>
  );
};
