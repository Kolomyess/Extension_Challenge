/// <reference types="vite/client" />
/// <reference types="chrome" />

declare module "*.css?raw" {
  const content: string;
  export default content;
}