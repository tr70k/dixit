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

export const getPlayerAvatar = (id: string) => {
  const index = +id.replace(/\D/g,'') % AVATARS.length;
  return AVATARS[index].icon;
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const getPlayerName = ({ id, color }: { id: string, color: string }) => {
  const index = +id.replace(/\D/g,'') % AVATARS.length;
  return capitalize(color) + ' ' + capitalize(AVATARS[index].name);
};

