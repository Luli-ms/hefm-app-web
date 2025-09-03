import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/main/main').then(m => m.Main)
    },
    {
        path: 'detalles/:id',
        loadComponent: () => import('./components/prod-detail/prod-detail').then(m => m.ProdDetail)
    },
    {
        path: 'carrito',
        loadComponent: () => import('./components/cart/cart').then(m => m.Cart)
    },
    {
        path: 'registro',
        loadComponent: () => import('./components/register/register').then(m => m.Register)
    },
    {
        path: 'login',
        loadComponent: () => import('./components/login/login').then(m => m.Login)
    },
    {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile').then(m => m.Profile)
    },
    {
        path: 'about-us',
        loadComponent: () => import('./components/about-us/about-us').then(m => m.AboutUs)
    }
];
