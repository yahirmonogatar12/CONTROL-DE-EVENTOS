// Script para generar contraseñas hasheadas con bcrypt
// Ejecutar con: node generate-hashes.js

const bcrypt = require('bcryptjs');

const passwords = [
  { user: 'globaladmin@example.com', password: 'global123' },
  { user: 'admin@example.com', password: 'admin123' },
  { user: 'user@example.com', password: 'user123' }
];

async function generateHashes() {
  console.log('🔐 Generando contraseñas hasheadas con bcrypt...\n');
  
  for (const { user, password } of passwords) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`-- ${user}: ${password}`);
    console.log(`UPDATE users SET password = '${hash}' WHERE email = '${user}';`);
    console.log('');
  }
  
  console.log('✅ Hashes generados! Copia los comandos UPDATE arriba y ejecútalos en Supabase SQL Editor.');
}

generateHashes();
