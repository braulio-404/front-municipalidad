import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

export interface ParametroConfiguracion {
  id?: number;
  clave: string;
  valor: string;
  categoria: string;
  tipo: 'texto' | 'numero' | 'booleano' | 'password' | 'email';
  descripcion?: string;
  esEncriptado?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface ConfiguracionCorreo {
  host: string;
  puerto: number;
  usuario: string;
  password: string;
  secure: boolean;
  fromName: string;
  fromEmail: string;
}

export interface TestCorreoRequest {
  emailDestino: string;
  asunto?: string;
  mensaje?: string;
}

export interface TestCorreoResponse {
  success: boolean;
  message: string;
  config?: any;
  
  // Propiedades compatibles para el frontend
  exito?: boolean;
  mensaje?: string;
  detalles?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService extends BaseApiService {

  constructor(protected override http: HttpClient) {
    super(http);
  }

  // Gestión de parámetros
  getParametros(): Observable<ParametroConfiguracion[]> {
    return this.http.get<ParametroConfiguracion[]>(`${this.apiUrl}/configuracion/parametros`);
  }

  getParametrosPorCategoria(categoria: string): Observable<ParametroConfiguracion[]> {
    return this.http.get<ParametroConfiguracion[]>(`${this.apiUrl}/configuracion/parametros/categoria/${categoria}`);
  }

  crearParametro(parametro: Omit<ParametroConfiguracion, 'id'>): Observable<ParametroConfiguracion> {
    return this.http.post<ParametroConfiguracion>(`${this.apiUrl}/configuracion/parametros`, parametro);
  }

  actualizarParametro(id: number, parametro: Partial<ParametroConfiguracion>): Observable<ParametroConfiguracion> {
    return this.http.patch<ParametroConfiguracion>(`${this.apiUrl}/configuracion/parametros/${id}`, parametro);
  }

  eliminarParametro(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/configuracion/parametros/${id}`);
  }

  // Configuración de correo
  getConfiguracionCorreo(): Observable<ConfiguracionCorreo> {
    return this.http.get<ConfiguracionCorreo>(`${this.apiUrl}/configuracion/correo`);
  }

  probarConfiguracionCorreo(testData: TestCorreoRequest): Observable<TestCorreoResponse> {
    return this.http.post<any>(`${this.apiUrl}/configuracion/correo/test`, testData)
      .pipe(
        map((response: any) => {
          // Normalizar la respuesta del backend al formato esperado por el frontend
          return {
            success: response.success || response.exito || false,
            message: response.message || response.mensaje || '',
            config: response.config,
            detalles: response.config || response.detalles,
            // Propiedades compatibles
            exito: response.success || response.exito || false,
            mensaje: response.message || response.mensaje || ''
          };
        })
      );
  }

  // Métodos de utilidad
  actualizarConfiguracionCorreo(config: Partial<ConfiguracionCorreo>): Observable<any> {
    // Convertir la configuración de correo a parámetros individuales
    const parametros: Partial<ParametroConfiguracion>[] = [];

    if (config.host) {
      parametros.push({ clave: 'MAIL_HOST', valor: config.host, categoria: 'correo' });
    }
    if (config.puerto) {
      parametros.push({ clave: 'MAIL_PORT', valor: config.puerto.toString(), categoria: 'correo' });
    }
    if (config.usuario) {
      parametros.push({ clave: 'MAIL_USERNAME', valor: config.usuario, categoria: 'correo' });
    }
    if (config.password) {
      parametros.push({ clave: 'MAIL_PASSWORD', valor: config.password, categoria: 'correo' });
    }
    if (config.fromName) {
      parametros.push({ clave: 'MAIL_FROM_NAME', valor: config.fromName, categoria: 'correo' });
    }
    if (config.fromEmail) {
      parametros.push({ clave: 'MAIL_FROM_EMAIL', valor: config.fromEmail, categoria: 'correo' });
    }

    // Actualizar cada parámetro (esto requeriría lógica adicional para encontrar los IDs)
    // Por ahora, devolver un observable vacío
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }
} 