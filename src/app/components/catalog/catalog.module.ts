import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Main } from '../main/main';

const routes: Routes = [
    { path: '', component: Main }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        Main
    ]
})
export class CatalogModule { }
