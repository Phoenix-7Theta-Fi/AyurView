const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
require('dotenv').config();

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env");
}

const uri = process.env.MONGODB_URI;

async function seedProducts() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    // Initialize MongoDB connection
    await client.connect();
    const db = client.db('ayurview');
    const collection = db.collection('products');

    // Check for existing products
    const existingProducts = await collection.countDocuments();
    if (existingProducts > 0) {
      console.log('Products collection already seeded. Skipping...');
      await client.close();
      return;
    }

    // Seed data based on the existing mock products structure
    const products = [
      {
        _id: new ObjectId(),
        name: 'Ashwagandha Capsules',
        description: 'Powerful adaptogen for stress relief, vitality, and cognitive function. Organic and sustainably sourced.',
        price: 15.99,
        imageUrl: 'https://picsum.photos/seed/ashwagandha_capsules/400/400',
        dataAiHint: 'herbal supplement bottle',
        category: 'Supplements',
        stock: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: 'Triphala Churna',
        description: 'Traditional Ayurvedic blend for digestion, detoxification, and colon health. Made from three potent fruits.',
        price: 12.50,
        imageUrl: 'https://picsum.photos/seed/triphala_powder/400/400',
        dataAiHint: 'ayurvedic powder',
        category: 'Herbal Powders',
        stock: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: 'Organic Turmeric Latte Mix',
        description: 'Delicious and healthy golden milk mix with turmeric, ginger, cinnamon, and black pepper. Boosts immunity.',
        price: 18.75,
        imageUrl: 'https://picsum.photos/seed/turmeric_latte/400/400',
        dataAiHint: 'golden milk spice',
        category: 'Wellness Drinks',
        stock: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: 'Neem & Tulsi Soap',
        description: 'Handmade Ayurvedic soap with neem and tulsi extracts for clear, healthy skin. Antiseptic properties.',
        price: 7.99,
        imageUrl: 'https://picsum.photos/seed/neem_soap/400/400',
        dataAiHint: 'herbal soap bar',
        category: 'Personal Care',
        stock: 75,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: 'Brahmi Oil for Hair',
        description: 'Nourishing hair oil infused with Brahmi to promote hair growth, reduce dandruff, and calm the mind.',
        price: 22.00,
        imageUrl: 'https://picsum.photos/seed/brahmi_oil/400/400',
        dataAiHint: 'hair oil bottle',
        category: 'Hair Care',
        stock: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: 'Chyawanprash - Ayurvedic Jam',
        description: 'A rich, herbal jam known for its rejuvenating and immune-boosting properties. A blend of over 40 herbs.',
        price: 25.50,
        imageUrl: 'https://picsum.photos/seed/chyawanprash_jar/400/400',
        dataAiHint: 'ayurvedic jam jar',
        category: 'Herbal Jams',
        stock: 40,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: 'Herbal Teatox Blend',
        description: 'A detoxifying tea blend with ginger, lemon, and Ayurvedic herbs to cleanse and rejuvenate the system.',
        price: 14.99,
        imageUrl: 'https://picsum.photos/seed/herbal_tea/400/400',
        dataAiHint: 'tea box herbs',
        category: 'Wellness Teas',
        stock: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: 'Shatavari Root Powder',
        description: 'Known as a female reproductive tonic, Shatavari supports hormonal balance and overall wellness for women.',
        price: 16.50,
        imageUrl: 'https://picsum.photos/seed/shatavari_powder/400/400',
        dataAiHint: 'herbal powder bag',
        category: 'Herbal Powders',
        stock: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert the products
    await collection.insertMany(products);
    console.log('Successfully seeded products collection');

    // Create indexes
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ name: 1 });
    console.log('Created indexes for products collection');

    await client.close();
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
