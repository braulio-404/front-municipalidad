import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-datos',
  template: `
    <div class="container">
      <h1>Gestión de Datos</h1>
      <div class="content-message">
        <p>Esta sección está en construcción.</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      color: #9c27b0;
      margin-bottom: 30px;
      text-align: center;
      font-weight: 500;
    }
    
    .content-message {
      background-color: #f9f9f9;
      padding: 40px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    p {
      font-size: 18px;
      color: #555;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class DatosComponent {
  // Lógica del componente aquí
} 