import React from 'react';
import logo from './logo.png';
import { AppHeader, AppLink, AppLogo, Wrapper } from './styled';
import { useRoom } from '../../utils/room';

function Index() {
  const { room } = useRoom();

  return (
    <Wrapper>
      <AppHeader>
        <AppLogo src={logo} alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <AppLink
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </AppLink>
        <pre>
          Room: {JSON.stringify(room, null, 2)}
        </pre>
      </AppHeader>
    </Wrapper>
  );
}

export default Index;
