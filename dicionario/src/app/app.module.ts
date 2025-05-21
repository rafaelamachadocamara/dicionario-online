import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { DicionarioListComponent } from './components/dicionario-list/dicionario-list.component';

@NgModule({
    declarations: [
        AppComponent,
        DicionarioListComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule  // Adicione esta linha
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }