// styles/GlobalStyle.ts
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html, body {
    height: 100%;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
    background-color: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.black};
    overflow-x: hidden;
  }
  
  #root {
    height: 100%;
  }
  
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
  }
  
  input, textarea {
    font-family: inherit;
    outline: none;
  }
  
  a {
    text-decoration: none;
    color: inherit;
  }
  
  ul, ol {
    list-style: none;
  }
  
  /* 스크롤바 스타일링 */
  ::-webkit-scrollbar {
    width: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.gray[100]};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray[300]};
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;