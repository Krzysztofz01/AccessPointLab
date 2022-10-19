import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RunComponent } from "./run.component";

const routes: Routes = [
    {
        path: '',
        component: RunComponent
    },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RunRoutingModule { }