import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-confirmacion-postulacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirmacion-postulacion.component.html',
  styleUrls: ['./confirmacion-postulacion.component.scss']
})
export class ConfirmacionPostulacionComponent {
  constructor(private router: Router) {}

  volverAPostulaciones() {
    this.router.navigate(['/postulacion']);
  }

  irAInicio() {
    this.router.navigate(['/']);
  }
} 