const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta del archivo de configuración
const CONFIG_PATH = './src/assets/config/current-theme.json';

// Temas válidos disponibles
const VALID_THEMES = ['conchali', 'concepcion', 'valparaiso', 'santiago'];

// Almacenar conexiones SSE para notificaciones en tiempo real
let sseConnections = [];

// Leer configuración actual
function getCurrentConfig() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Configuración por defecto si el archivo no existe
    return {
      selectedTheme: 'conchali',
      lastUpdated: new Date().toISOString(),
      updatedBy: 'system'
    };
  }
}

// Escribir configuración
function writeConfig(config) {
  try {
    // Asegurar que el directorio existe
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing config:', error);
    return false;
  }
}

// Notificar a todos los clientes conectados
function notifyClients(config) {
  console.log(`📡 Notificando a ${sseConnections.length} clientes conectados`);
  sseConnections.forEach((res, index) => {
    try {
      res.write(`data: ${JSON.stringify(config)}\n\n`);
    } catch (error) {
      console.log(`Cliente ${index} desconectado`);
      // Remover conexión muerta
      sseConnections.splice(index, 1);
    }
  });
}

// Endpoint para obtener configuración actual
app.get('/api/theme/current', (req, res) => {
  const config = getCurrentConfig();
  res.json(config);
});

// Endpoint para actualizar tema
app.post('/api/theme/update', (req, res) => {
  const { themeName, adminUser } = req.body;
  
  if (!themeName) {
    return res.status(400).json({ error: 'themeName is required' });
  }

  // Validar que el tema existe
  if (!VALID_THEMES.includes(themeName)) {
    console.log(`❌ Tema no encontrado: ${themeName}`);
    console.log(`✅ Temas válidos: ${VALID_THEMES.join(', ')}`);
    return res.status(400).json({ 
      error: `Tema no encontrado: ${themeName}`,
      validThemes: VALID_THEMES
    });
  }

  const config = {
    selectedTheme: themeName,
    lastUpdated: new Date().toISOString(),
    updatedBy: adminUser || 'admin'
  };

  if (writeConfig(config)) {
    console.log(`✅ Tema actualizado a: ${themeName} por ${adminUser}`);
    
    // Notificar a todos los clientes conectados inmediatamente
    notifyClients(config);
    
    res.json({ success: true, config });
  } else {
    res.status(500).json({ error: 'Failed to update theme' });
  }
});

// Server-Sent Events para notificaciones en tiempo real
app.get('/api/theme/stream', (req, res) => {
  // Configurar headers para SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Agregar esta conexión a la lista
  sseConnections.push(res);
  console.log(`📡 Nueva conexión SSE. Total: ${sseConnections.length}`);

  // Enviar configuración actual inmediatamente
  const currentConfig = getCurrentConfig();
  res.write(`data: ${JSON.stringify(currentConfig)}\n\n`);

  // Limpiar conexión cuando se cierre
  req.on('close', () => {
    sseConnections = sseConnections.filter(connection => connection !== res);
    console.log(`❌ Conexión SSE cerrada. Total: ${sseConnections.length}`);
  });
});

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    connections: sseConnections.length 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de sincronización de temas ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Archivo de configuración: ${CONFIG_PATH}`);
  console.log(`🔄 Configuración actual:`, getCurrentConfig());
});

module.exports = app; 