import React from 'react';
import logo from './logo.png';
import { AppHeader, AppLink, AppLogo, Wrapper } from './styled';

function Index() {
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
      </AppHeader>
    </Wrapper>
  );
}

export default Index;
