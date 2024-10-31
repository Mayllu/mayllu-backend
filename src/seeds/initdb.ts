// src/seeds/init-db.ts
import { MongoClient } from 'mongodb';

async function seed() {
  const uri = 'mongodb://localhost:27017/mayllu_db';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('mayllu_db');

    // Limpiar colecciones existentes
    await db.collection('users').deleteMany({});
    await db.collection('complaintcategories').deleteMany({});
    await db.collection('districts').deleteMany({});
    await db.collection('complaints').deleteMany({});
    await db.collection('complaintstates').deleteMany({});

    // Insertar usuarios de prueba
    const users = await db.collection('users').insertMany([
      { dni: '12345678', name: 'Juan Pérez' },
      { dni: '87654321', name: 'María García' }
    ]);
    console.log('Users created');

    // Insertar categorías
    const categories = await db.collection('complaintcategories').insertMany([
      { name: 'Alumbrado Público' },
      { name: 'Residuos' },
      { name: 'Veredas' }
    ]);
    console.log('Categories created');

    // Insertar distritos
    const districts = await db.collection('districts').insertMany([
      { name: 'Miraflores' },
      { name: 'San Isidro' }
    ]);
    console.log('Districts created');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seed();
