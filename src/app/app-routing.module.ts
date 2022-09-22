import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { PreferencesComponent } from './features/preferences/preferences.component';

const routes: Routes = [
  { path: '', loadChildren: () => import('./features/main/main.module').then(m => m.MainModule), canActivate: [AuthGuard] },
  { path: 'list', loadChildren: () => import('./features/list/list.module').then(m => m.ListModule), canActivate: [AuthGuard] },
  { path: 'statistics', loadChildren: () => import('./features/statistics/statistics.module').then(m => m.StatisticsModule), canActivate: [AuthGuard] },
  { path: 'upload', loadChildren: () => import('./features/upload/upload.module').then(m => m.UploadModule), canActivate: [AuthGuard] },
  { path: 'download', loadChildren: () => import('./features/download/download.module').then(m => m.DownloadModule), canActivate: [AuthGuard] },
  { path: 'run', loadChildren: () => import('./features/run/run.module').then(m => m.RunModule), canActivate: [AuthGuard] },
  { path: 'auth', loadChildren: () => import('./features/login/login.module').then(m => m.LoginModule), canActivate: [AuthGuard] },

  { path: 'preferences', component: PreferencesComponent },
  { path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
