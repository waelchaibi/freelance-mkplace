import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Some legacy WebSocket libraries expect Node's `global` in the browser bundle.
(globalThis as typeof globalThis & { global: typeof globalThis }).global = globalThis;

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
