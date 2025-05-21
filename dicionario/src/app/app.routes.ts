import { Routes } from '@angular/router';
import { DicionarioListComponent } from './components/dicionario-list/dicionario-list.component';

export const routes: Routes = [
    {
        path: '',
        component: DicionarioListComponent
    },
    {
        path: 'dicionario',
        component: DicionarioListComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
];