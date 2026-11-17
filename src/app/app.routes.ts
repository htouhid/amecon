import { Routes } from '@angular/router';
import { Home } from './home';

export const routes: Routes = [
  { path: '', component: Home, title: 'AMECON | Custom Crests, Trophies & Honour Boards' },
  {
    path: 'collections/honour-boards',
    loadComponent: () => import('./honour-boards').then((m) => m.HonourBoards),
    title: 'Honour Boards | AMECON',
  },
  {
    path: 'collections/honour-boards/:slug',
    loadComponent: () => import('./honour-board-detail').then((m) => m.HonourBoardDetail),
    title: 'Honour Board | AMECON',
  },
  { path: '**', redirectTo: '' },
];
