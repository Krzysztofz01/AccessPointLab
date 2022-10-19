import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DownloadComponent } from "./download.component";

const routes: Routes = [
    {
        path: '',
        component: DownloadComponent
    },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DownloadRoutingModule { }