import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { useRoom } from '../../utils/room';
import { Avatar, getName } from '../base/Avatar';
import { IconButton } from '../base/IconButton';
import { EnterModal } from '../modals/EnterModal';
import { DebugInfoModal } from '../modals/DebugInfoModal';
import { RulesModal } from '../modals/RulesModal';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { Players } from '../Players';
import { Status } from '../Status';
import { Cards } from '../Cards';
import { Copyright, Menu, Title, Wrapper } from './styled';

function Index() {
  const { room, me, isLoaded, copyLink, leave } = useRoom();
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  return (
    <Wrapper>
      {room && me && (<>
        <div style={{ border: '1px solid red', flex: 3 }}>
          <Title>
            You are <Avatar player={me} /> <b>{getName(me)}</b> in room <b>#{room.name}</b>
            <IconButton
              onClick={copyLink}
              data-tooltip-id='menu-tooltip'
              data-tooltip-content='Copy link'
            >
              🔗
            </IconButton>
          </Title>

          <div style={{ border: '1px solid orange', display: 'flex', height: 'calc(100% - 56px)' }}>
            <Players />
            <div style={{ border: '1px solid green', width: 'calc(100% - 200px)' }}>
              <Status />
              <Cards />
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid violet', flex: 1 }}>
          <Cards isMy />
        </div>

        <Menu>
          <IconButton
            onClick={() => setIsDebugOpen(true)}
            data-tooltip-id='menu-tooltip'
            data-tooltip-content='Debug info'
          >
            🐞
          </IconButton>
          <IconButton
            onClick={() => setIsRulesOpen(true)}
            data-tooltip-id='menu-tooltip'
            data-tooltip-content='Rules'
          >
            ❓
          </IconButton>
          <IconButton
            onClick={() => setIsLeaveOpen(true)}
            data-tooltip-id='menu-tooltip'
            data-tooltip-content='Leave room'
          >
            👋
          </IconButton>
        </Menu>
        <Tooltip id='menu-tooltip' />

        <Copyright>What&apos;s my card? • by tr70k</Copyright>
        <DebugInfoModal isOpen={isDebugOpen} onClose={() => setIsDebugOpen(false)} />
        <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
        <ConfirmationModal
          title='Leave 👋'
          question='Are you sure you want to leave the room?'
          isOpen={isLeaveOpen}
          onClose={() => setIsLeaveOpen(false)}
          onSubmit={() => {
            setIsLeaveOpen(false);
            leave();
          }}
        />
      </>)}

      <EnterModal isOpen={isLoaded && !room && !isDebugOpen} />
    </Wrapper>
  );
}

export default Index;
