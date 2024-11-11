// handle seeding for sample data with current schemas

import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017/maylludb';

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('maylludb');
    console.log('🚀 Connected to MongoDB');

    // clean previous example collections 
    const collections = [
      'users',
      'complaintcategories',
      'districts',
      'complaints',
      'complaintstates'
    ];
    for (const eachCollection of collections) {
      await db.collection(eachCollection).deleteMany({});
      console.log(`🧽 Cleaned ${eachCollection} collection`);
    };

    // insert example users with roles
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
    console.log('🔒 Users created');

    // insert example categories - this will linked to complaints
    const categories = await db.collection('complaintcategories').insertMany([
      {
        name: 'Alumbrado Público',
      },
      {
        name: 'Residuos',
      },
      {
        name: 'Veredas',
      },
      {
        name: 'Seguridad',
      },
    ]);
    console.log('🧩 Categories created');

    // insert districts with location (geojson)
    const districts = await db.collection('districts').insertMany([
      {
        name: 'Miraflores',
        location: {
          type: 'Point',
          coordinates: [-77.0307, -12.1217]
        },
        complaints: []
      },
      {
        name: 'San Isidro',
        location: {
          type: 'Point',
          coordinates: [-77.0339, -12.0989]
        },
        complaints: []
      },
      {
        name: 'Surco',
        location: {
          type: 'Point',
          coordinates: [-76.9917, -12.1416]
        },
        complaints: []
      },
    ]);
    console.log('⭐️ Districts created');

    // insert complaints with categories, districts and users
    const complaints = await db.collection('complaints').insertMany([
      {
        title: 'Falta de iluminación',
        description: 'La calle está completamente a oscuras',
        ubication: '-12.1217,-77.0307',
        user: '72671060',
        category: categories.insertedIds[0],
        district: districts.insertedIds[0],
        imageUrl: '',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Basura acumulada',
        description: 'Hay basura acumulada desde hace días',
        ubication: '-12.0989,-77.0339',
        user: '87654321',
        category: categories.insertedIds[1],
        district: districts.insertedIds[1],
        imageUrl: '',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Vereda en mal estado',
        description: 'Vereda rota y peligrosa',
        ubication: '-76.9917,-12.1416',
        user: '72671060',
        category: categories.insertedIds[2],
        district: districts.insertedIds[2],
        imageUrl: '',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Problema de seguridad',
        description: 'Falta de vigilancia en la zona',
        ubication: '-76.9917,-12.1416',
        user: '87654321',
        category: categories.insertedIds[3],
        district: districts.insertedIds[2], // surco gonna have 2 complaints
        imageUrl: '',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
    console.log('📍 Complaints created');

    // map complaints to districts
    const complaintsArray = await db.collection('complaints').find().toArray();
    const complaintsByDistrict = new Map<string, ObjectId[]>();
    console.log('🔍 Total complaints found:', complaintsArray.length);

    for (const complaint of complaintsArray) {
        const districtId = complaint.district.toString();
        
        // if districtId not associated then create empty array else push complaint id
        if (!complaintsByDistrict.has(districtId)) complaintsByDistrict.set(districtId, []);
        complaintsByDistrict.get(districtId)!.push(complaint._id);
    }

    // update districts
    for (const [districtId, districtComplaints] of complaintsByDistrict) {
        const result = await db.collection('districts').updateOne(
            { _id: new ObjectId(districtId) },
            { $set: { complaints: districtComplaints } }
        );
    }
    console.log('🔗 Complaints linked to districts');
    
    // create complaint states
    await db.collection('complaintstates').insertMany([
      {
        complaint: complaints.insertedIds[0],
        state: 'PENDING',
        user: '72671060',
        created_at: new Date()
      },
      {
        complaint: complaints.insertedIds[1],
        state: 'IN_PROGRESS',
        user: '87654321',
        created_at: new Date()
      },
      {
        complaint: complaints.insertedIds[2],
        state: 'PENDING',
        user: '72671060',
        created_at: new Date()
      },
      {
        complaint: complaints.insertedIds[3],
        state: 'IN_PROGRESS',
        user: '87654321',
        created_at: new Date()
      }
    ]);
    console.log('⏳ Complaint states created');

    const updatedDistricts = await db.collection('districts').find().toArray();
    console.log('📊 Districts complaint counts:', 
      updatedDistricts.map(d => ({
        name: d.name,
        complaintCount: d.complaints.length
      }))
    );

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
    console.log('💀 Database connection closed');
  }
}

seed();