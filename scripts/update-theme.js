const fs = require('fs');
const path = require('path');

/**
 * Script para actualizar la configuración global del tema
 * Este script se ejecuta cuando un admin cambia el tema
 */

// Obtener argumentos de la línea de comandos
const themeName = process.argv[2];
const updatedBy = process.argv[3] || 'admin';

if (!themeName) {
  console.error('❌ Error: Debe especificar el nombre del tema');
  console.log('Uso: node scripts/update-theme.js <nombreTema> [usuarioAdmin]');
  process.exit(1);
}

// Ruta del archivo de configuración
const configPath = path.join(__dirname, '../src/assets/config/current-theme.json');

// Nueva configuración
const newConfig = {
  selectedTheme: themeName,
  lastUpdated: new Date().toISOString(),
  updatedBy: updatedBy
};

try {
  // Escribir el archivo
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
  console.log(`✅ Tema actualizado globalmente: ${themeName}`);
  console.log(`📅 Actualizado: ${newConfig.lastUpdated}`);
  console.log(`👤 Por: ${updatedBy}`);
} catch (error) {
  console.error('❌ Error al actualizar el archivo de configuración:', error);
  process.exit(1);
} 