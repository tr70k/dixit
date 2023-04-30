import React, {
  ChangeEventHandler,
  KeyboardEventHandler,
  MutableRefObject,
  useEffect,
  useRef,
  useState
} from 'react';
import styled from 'styled-components';
import { useRoom } from '../../../utils/room';
import { Modal } from '../../base/Modal';
import { Button } from '../../base/Button';
import { Input } from '../../base/Input';

const ROOM_NAME_LENGTH = 6;

const Form = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 16px;
  
  span {
    margin-bottom: 8px;
  }
`;

type EnterProps = {
  isOpen: boolean
}

export const EnterModal = ({ isOpen }: EnterProps) => {
  const { create, join } = useRoom();
  const [roomName, setRoomName] = useState('');
  const inputRef: MutableRefObject<HTMLInputElement | null> = useRef(null);

  useEffect(() => {
    isOpen && inputRef.current?.focus();
  }, [isOpen]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => setRoomName(e.target.value.slice(-6));
  const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && roomName.length === ROOM_NAME_LENGTH) {
      join(roomName);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => void 0} withoutCloseButton>
      <Form>
        <h3>Let&apos;s start! 🚀</h3>
        <Input ref={inputRef} mb='s' width={200} value={roomName} onChange={handleChange} onKeyUp={handleKeyUp} placeholder='Six-character room code' />
        <Button mb='s' width={200} disabled={roomName.length !== ROOM_NAME_LENGTH} onClick={() => join(roomName)}>Join room</Button>
        <span>or</span>
        <Button width={200} onClick={() => create()}>Create new room</Button>
      </Form>
    </Modal>
  );
};
