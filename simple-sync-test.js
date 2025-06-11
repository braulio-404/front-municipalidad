// Script para probar sincronización automática
const fs = require('fs');

// Leer el tema actual desde localStorage (simulado)
const currentTheme = process.argv[2] || 'concepcion';
const adminUser = process.argv[3] || 'admin';

const config = {
  selectedTheme: currentTheme,
  lastUpdated: new Date().toISOString(),
  updatedBy: adminUser
};

// Escribir al archivo JSON real
const configPath = './src/assets/config/current-theme.json';

try {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ Tema sincronizado: ${currentTheme}`);
  console.log(`📄 Archivo actualizado: ${configPath}`);
} catch (error) {
  console.error('❌ Error:', error.message);
} 