export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
}

// Respuesta directa del token y usuario
export interface AuthResponse {
  access_token: string;
  user: UserProfile;
}

// Respuesta del backend con estructura anidada
export interface BackendAuthResponse {
  status: number;
  message: string;
  data: {
    user: UserProfile;
    access_token: string;
    token_type: string;
    expires_in: string;
  };
}

export interface UserProfile {
  usuarioID: string;
  email: string;
  nombre: string;
  apellido?: string;
  rol: string;
  estado: string;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  ultimoLogin?: Date;
}

export interface TokenValidationResponse {
  status: number;
  message: string;
  data: UserProfile;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordDto {
  email: string;
} 