import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Routes with parameters should use SSR instead of prerendering
  {
    path: 'category/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'course/:id',
    renderMode: RenderMode.Server
  },
  // All other routes can be prerendered
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
