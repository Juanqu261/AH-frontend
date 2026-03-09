import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent],
    templateUrl: './app.component.html',
    styles: []
})
export class AppComponent {
    title = 'adagioz-frontend';
}
