import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { DownloadComponent } from './features/download/download.component';
import { ListComponent } from './features/list/list.component';
import { LoginComponent } from './features/login/login.component';
import { MainComponent } from './features/main/main.component';
import { PreferencesComponent } from './features/preferences/preferences.component';
import { StatisticsComponent } from './features/statistics/statistics.component';
import { UploadComponent } from './features/upload/upload.component';

const routes: Routes = [
  { path: '', component: MainComponent, canActivate: [AuthGuard] },
  { path: 'list', component: ListComponent, canActivate: [AuthGuard] },
  { path: 'statistics', component: StatisticsComponent, canActivate: [AuthGuard] },
  { path: 'upload', component: UploadComponent, canActivate: [AuthGuard] },
  { path: 'download', component: DownloadComponent, canActivate: [AuthGuard] },
  { path: 'preferences', component: PreferencesComponent },
  { path: 'auth', component: LoginComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
