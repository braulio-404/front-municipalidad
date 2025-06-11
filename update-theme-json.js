// Script para actualizar manualmente el archivo current-theme.json
// Usar cuando cambies el tema en la aplicación

const fs = require('fs');
const path = require('path');

// Obtener parámetros de línea de comandos
const themeName = process.argv[2] || 'concepcion';
const adminUser = process.argv[3] || 'admin';

// Configuración
const configPath = './src/assets/config/current-theme.json';

const newConfig = {
  selectedTheme: themeName,
  lastUpdated: new Date().toISOString(),
  updatedBy: adminUser
};

try {
  // Escribir archivo
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
  console.log(`✅ Tema actualizado a: ${themeName}`);
  console.log(`📄 Archivo: ${configPath}`);
  console.log(`👤 Actualizado por: ${adminUser}`);
  console.log(`⏰ Fecha: ${newConfig.lastUpdated}`);
} catch (error) {
  console.error('❌ Error al actualizar archivo:', error.message);
} 