import styled from 'styled-components';

export const Wrapper = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  min-width: 1000px;
  padding: 8px 16px 16px;
  display: flex;
  flex-direction: column;
  
  div {
    border-color: transparent !important;
  }
`;

export const Title = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0 ${(props) => props.theme.spacing.s}px;
  gap: ${(props) => props.theme.spacing.xs}px;
  
  button {
    margin-left: -${(props) => props.theme.spacing.xs}px;
  }
`;

export const Copyright = styled.div`
  height: 16px;
  margin-bottom: -16px;
  font-size: 12px;
`;

export const Menu = styled.div`
  position: absolute;
  top: ${(props) => props.theme.spacing.s}px;
  right: ${(props) => props.theme.spacing.m}px;
  display: flex;
  gap: ${(props) => props.theme.spacing.s}px;
  
  button {
    font-size: 20px;
  }
`;
