// Script de prueba para verificar conexión con Supabase
// Ejecutar en la consola del navegador

import { supabase } from './lib/supabase'

// Test 1: Verificar conexión
async function testConnection() {
  console.log('🔍 Probando conexión con Supabase...')
  
  const { data, error } = await supabase.from('events').select('count')
  
  if (error) {
    console.error('❌ Error:', error)
    return false
  }
  
  console.log('✅ Conexión exitosa')
  return true
}

// Test 2: Listar tablas (esto podría fallar si no tienes permisos)
async function listTables() {
  console.log('📋 Intentando listar eventos...')
  
  const { data, error } = await supabase.from('events').select('*')
  
  if (error) {
    console.error('❌ Error al listar eventos:', error)
    console.log('Código de error:', error.code)
    console.log('Mensaje:', error.message)
    console.log('Detalles:', error.details)
  } else {
    console.log('✅ Eventos encontrados:', data)
  }
}

// Test 3: Intentar insertar un evento de prueba
async function testInsert() {
  console.log('➕ Intentando insertar evento de prueba...')
  
  const testEvent = {
    title: 'Evento de Prueba',
    date: '2025-10-15',
    location: 'Ubicación de Prueba',
    description: 'Este es un evento de prueba',
    qr_code: 'TEST-QR-123',
    confirmation_code: 'TEST123',
    created_by: 'test@example.com'
  }
  
  const { data, error } = await supabase.from('events').insert(testEvent).select()
  
  if (error) {
    console.error('❌ Error al insertar:', error)
    console.log('Código:', error.code)
    console.log('Mensaje:', error.message)
  } else {
    console.log('✅ Evento insertado:', data)
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  await testConnection()
  await listTables()
  // await testInsert() // Descomenta esto para probar inserción
}

runAllTests()
