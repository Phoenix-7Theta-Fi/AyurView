const { connectToDb, createUser } = require('./mongodb-seed');

const users = [
  { firstName: "John", email: "john@ayur.com" },
  { firstName: "Sarah", email: "sarah@ayur.com" },
  { firstName: "Michael", email: "michael@ayur.com" },
  { firstName: "Emma", email: "emma@ayur.com" },
  { firstName: "David", email: "david@ayur.com" },
  { firstName: "Lisa", email: "lisa@ayur.com" },
  { firstName: "James", email: "james@ayur.com" },
  { firstName: "Anna", email: "anna@ayur.com" },
  { firstName: "Robert", email: "robert@ayur.com" },
  { firstName: "Maria", email: "maria@ayur.com" }
];

async function seedUsers() {
  try {
    console.log('Connecting to database...');
    await connectToDb();
    
    console.log('Starting user seeding...');
    const password = 'harsha';
    
    for (const user of users) {
      try {
        await createUser(user.firstName, user.email, password);
        console.log(`Created user: ${user.email}`);
      } catch (error) {
        if (error instanceof Error && error.message === 'User already exists') {
          console.log(`Skipping ${user.email} - already exists`);
        } else {
          console.error(`Error creating user ${user.email}:`, error);
        }
      }
    }
    
    console.log('User seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed users:', error);
    process.exit(1);
  }
}

seedUsers();
