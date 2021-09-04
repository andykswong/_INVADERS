import { updateState } from './state';

(document as any).monetization && ((document as any).monetization as HTMLElement).addEventListener('monetizationstart', () => (
  updateState({
    sub: true,
    coil: true,
  })
));
