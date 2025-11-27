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
  // Authenticated routes should use SSR instead of prerendering
  {
    path: 'student',
    renderMode: RenderMode.Server
  },
  // Removed the 'teacher' route since the teacher dashboard was removed
  {
    path: 'admin',
    renderMode: RenderMode.Server
  },
  {
    path: 'profile',
    renderMode: RenderMode.Server
  },
  {
    path: 'teacher/profile',
    renderMode: RenderMode.Server
  },
  {
    path: 'coursesManage',
    renderMode: RenderMode.Server
  },
  {
    path: 'analytics',
    renderMode: RenderMode.Server
  },
  // All other routes can be prerendered
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];