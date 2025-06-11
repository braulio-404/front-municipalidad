// Script temporal para debug del sistema de temas
console.log('=== DEBUG TEMA ===');
console.log('localStorage globalSelectedTheme:', localStorage.getItem('globalSelectedTheme'));
console.log('localStorage themeLastUpdate:', localStorage.getItem('themeLastUpdate'));
console.log('localStorage selectedTheme (antigua):', localStorage.getItem('selectedTheme'));

// Limpiar localStorage completamente
console.log('Limpiando localStorage...');
localStorage.removeItem('globalSelectedTheme');
localStorage.removeItem('themeLastUpdate');
localStorage.removeItem('selectedTheme');
console.log('localStorage limpiado');

// Forzar recarga
location.reload(); 