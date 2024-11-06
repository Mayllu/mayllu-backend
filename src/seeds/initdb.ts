import { MongoClient } from 'mongodb';
import { Types } from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/mayllu_db';

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('mayllu_db');

    // Limpiar todas las colecciones
    const collections = ['users', 'complaintcategories', 'districts', 'complaints', 'complaintstates'];

    for (const collection of collections) {
      await db.collection(collection).deleteMany({});
      console.log(`Cleaned ${collection} collection`);
    }

    // Insertar usuarios
    const users = await db.collection('users').insertMany([
      {
        dni: '72671060',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '987654321',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        dni: '87654321',
        name: 'María García',
        email: 'maria@example.com',
        phone: '987654322',
        role: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
    console.log('Users created:', users.insertedIds);

    // Insertar categorías con categoryId numérico
    const categories = await db.collection('complaintcategories').insertMany([
      {
        categoryId: 1,
        name: 'Alumbrado Público',
        description: 'Problemas con el alumbrado público',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        categoryId: 2,
        name: 'Residuos',
        description: 'Problemas con la recolección de residuos',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        categoryId: 3,
        name: 'Veredas',
        description: 'Problemas con el estado de las veredas',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        categoryId: 4,
        name: 'Seguridad',
        description: 'Problemas de seguridad ciudadana',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
    console.log('Categories created:', categories.insertedIds);

    // Insertar distritos con coordenadas
    const districts = await db.collection('districts').insertMany([
      {
        name: 'Miraflores',
        ubication: '(-12.1217, -77.0307)',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'San Isidro',
        ubication: '(-12.0989, -77.0339)',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Surco',
        ubication: '(-12.1416, -76.9917)',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
    console.log('Districts created:', districts.insertedIds);

    // Crear algunas quejas de ejemplo
    const complaints = await db.collection('complaints').insertMany([
      {
        user: '72671060',
        title: 'Falta de iluminación',
        description: 'La calle está completamente a oscuras',
        ubication: '(-12.1217, -77.0307)',
        category: new Types.ObjectId(Object.values(categories.insertedIds)[0]),
        district: new Types.ObjectId(Object.values(districts.insertedIds)[0]),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user: '87654321',
        title: 'Basura acumulada',
        description: 'Hay basura acumulada desde hace días',
        ubication: '(-12.0989, -77.0339)',
        category: new Types.ObjectId(Object.values(categories.insertedIds)[1]),
        district: new Types.ObjectId(Object.values(districts.insertedIds)[1]),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
    console.log('Complaints created:', complaints.insertedIds);

    // Crear estados iniciales para las quejas
    const complaintStates = await db.collection('complaintstates').insertMany([
      {
        complaint: new Types.ObjectId(Object.values(complaints.insertedIds)[0]),
        state: 'PENDING',
        description: 'Queja registrada',
        user: '72671060',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        complaint: new Types.ObjectId(Object.values(complaints.insertedIds)[1]),
        state: 'IN_PROGRESS',
        description: 'En proceso de atención',
        user: '87654321',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
    console.log('Complaint states created:', complaintStates.insertedIds);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

seed();
