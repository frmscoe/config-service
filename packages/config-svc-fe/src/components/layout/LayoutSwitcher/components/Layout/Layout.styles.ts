import { styled } from "styled-components";

const LayoutContainer = styled.main`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-content: stretch;
  align-items: stretch;
  height: 100%;
`;

const LayoutSidebar = styled.aside`
  flex: 0 1 auto;
  background-color: #202020;
  width: 20%;
`;

const LayoutBody = styled.div`
  flex: 1 1 auto;
  overflow-x: hidden;
  overflow-y: auto;
`;

export { LayoutBody, LayoutContainer, LayoutSidebar };
