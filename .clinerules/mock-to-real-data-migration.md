## Brief overview
Guidelines for migrating components from mock data to real database interactions in the AyurView application. The medication adherence implementation serves as a working reference for this process.

## Reference implementation
- Use src/lib/tests/seed-medication-adherence.js as inspiration for new seeding scripts
- Follow src/app/api/medication-adherence/route.ts structure for new API endpoints
- Reference MedicationAdherenceCalendar.tsx for frontend data fetching patterns
- These files demonstrate successful implementation of all the guidelines below

## Migration workflow
- Create a seeding script in src/lib/tests/ for the specific data type
- Use existing MongoDB connection from mongodb-seed.js for consistency
- Include checks for existing data before seeding to prevent duplicates
- Generate realistic data that reflects actual usage patterns
- Verify data appears correctly in MongoDB after seeding

## API endpoint structure
- Place endpoints in src/app/api/ following feature-based organization
- Always specify "ayurview" as the database name
- Implement proper JWT authentication verification
- Add query parameters for filtering when needed (e.g., date ranges)
- Return data in format matching TypeScript interfaces
- Include proper error handling with appropriate status codes

## Frontend component updates
- Add loading states to improve user experience during data fetches
- Implement error states with user-friendly messages
- Use localStorage for token management
- Add appropriate TypeScript interfaces for the data
- Update UI to handle empty/error states gracefully
- Maintain existing design patterns and color schemes

## Database design
- Create clearly named collections matching features
- Use ObjectId for document relationships
- Include userId in documents for data isolation
- Structure documents to match component needs
- Consider indexing frequently queried fields

## Implementation example
The medication adherence migration demonstrates these guidelines:
- Seeding: Generates 30 days of realistic data per user
- API: Implements JWT auth, date filtering, and proper error handling
- Frontend: Shows loading/error states and proper data formatting
- Database: Uses proper data types and relationships

When migrating new components, refer to this implementation first as it embodies all these best practices in working code.
