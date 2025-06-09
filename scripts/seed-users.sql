-- Script para insertar usuarios de prueba en PostgreSQL con TypeORM
-- Tabla: usuario (generada por TypeORM)

-- Limpiar datos existentes (opcional - ¡CUIDADO EN PRODUCCIÓN!)
-- DELETE FROM usuario WHERE email LIKE '%@test.com' OR email LIKE '%@prueba.com';

-- Usuario Administrador
INSERT INTO usuario (
    nombre, 
    email, 
    password, 
    rol, 
    estado,
    "ultimoLogin"
) VALUES (
    'Administrador Sistema',
    'admin@test.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
    'admin',
    'activo',
    CURRENT_TIMESTAMP
);

-- Usuario RRHH
INSERT INTO usuario (
    nombre, 
    email, 
    password, 
    rol, 
    estado,
    "ultimoLogin"
) VALUES (
    'Recursos Humanos',
    'rrhh@test.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
    'rrhh',
    'activo',
    CURRENT_TIMESTAMP
);

-- Usuario Supervisor
INSERT INTO usuario (
    nombre, 
    email, 
    password, 
    rol, 
    estado,
    "ultimoLogin"
) VALUES (
    'Supervisor Sistema',
    'supervisor@test.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
    'supervisor',
    'activo',
    CURRENT_TIMESTAMP
);

-- Usuario Regular
INSERT INTO usuario (
    nombre, 
    email, 
    password, 
    rol, 
    estado,
    "ultimoLogin"
) VALUES (
    'Usuario Regular',
    'usuario@test.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
    'usuario',
    'activo',
    CURRENT_TIMESTAMP
);

-- Usuario para Municipalidad de Conchalí
INSERT INTO usuario (
    nombre, 
    email, 
    password, 
    rol, 
    estado,
    "ultimoLogin"
) VALUES (
    'Admin Conchalí',
    'admin@conchali.cl',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
    'admin',
    'activo',
    CURRENT_TIMESTAMP
);

-- Usuario Bloqueado (para pruebas)
INSERT INTO usuario (
    nombre, 
    email, 
    password, 
    rol, 
    estado
) VALUES (
    'Usuario Bloqueado',
    'bloqueado@test.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
    'usuario',
    'bloqueado'
);

-- Verificar inserción
SELECT 
    "usuarioID",
    nombre,
    email,
    rol,
    estado,
    "fechaCreacion"
FROM usuario 
WHERE email LIKE '%@test.com' OR email LIKE '%@conchali.cl'
ORDER BY "fechaCreacion"; 