import React from 'react';
import logo from './logo.png';
import { AppHeader, AppLink, AppLogo, Wrapper } from './styled';
import { useRoom } from '../../utils/room';

function Index() {
  const { room, me, join, leave } = useRoom();

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
        <button onClick={() => join('1234')}>Join</button>
        <button onClick={() => leave()}>Leave</button>
        <pre>
          Room: {JSON.stringify(room, null, 2)}
        </pre>
        <br />
        <pre>
          Me: {JSON.stringify(me, null, 2)}
        </pre>
      </AppHeader>
    </Wrapper>
  );
}

export default Index;
