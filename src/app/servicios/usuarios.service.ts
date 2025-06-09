import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends BaseApiService {

  constructor(protected override http: HttpClient) {
    super(http);
  }

  // Obtener todos los usuarios
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`);
  }

  // Obtener un usuario por ID
  getUsuarioById(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuarios/${id}`);
  }

  // Crear nuevo usuario
  crearUsuario(usuario: CreateUsuarioDto): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios`, usuario);
  }

  // Actualizar usuario
  actualizarUsuario(id: string, usuario: UpdateUsuarioDto): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/usuarios/${id}`, usuario);
  }

  // Eliminar usuario
  eliminarUsuario(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/usuarios/${id}`);
  }

  // Cambiar estado del usuario
  cambiarEstadoUsuario(id: string, estado: 'activo' | 'inactivo' | 'bloqueado'): Observable<Usuario> {
    return this.actualizarUsuario(id, { estado });
  }

  // Obtener usuarios por rol
  getUsuariosPorRol(rol: 'admin' | 'user' | 'postulante'): Observable<Usuario[]> {
    // Nota: Este endpoint podría necesitar ser implementado en el backend
    // Por ahora usaremos el filtrado en frontend
    return this.getUsuarios();
  }

  // Obtener estadísticas de usuarios
  getEstadisticasUsuarios(): Observable<any> {
    // Nota: Este endpoint podría necesitar ser implementado en el backend
    return this.http.get(`${this.apiUrl}/usuarios/estadisticas`);
  }
} 