/**
 * Playwright Global Setup
 * Cleans CRM data before each test run to prevent database pollution
 *
 * This setup runs ONCE before all test files execute.
 * It deletes all CRM data (companies, contacts, deals, activities, tags)
 * but preserves auth tables (User, Session, Account, Verification).
 */
import { Client } from 'pg';

async function globalSetup() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://minicrm:minicrm@localhost:5432/minicrm';

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('🔌 Connected to test database');

    // Delete in foreign key dependency order
    // 1. Activities reference Company, Contact, Deal
    await client.query('DELETE FROM "Activity"');
    console.log('  ✅ Deleted activities');

    // 2. CompanyTag references Company and Tag
    await client.query('DELETE FROM "CompanyTag"');
    console.log('  ✅ Deleted company tags');

    // 3. ContactTag references Contact and Tag
    await client.query('DELETE FROM "ContactTag"');
    console.log('  ✅ Deleted contact tags');

    // 4. Deal references Company and Contact
    await client.query('DELETE FROM "Deal"');
    console.log('  ✅ Deleted deals');

    // 5. Contact references Company
    await client.query('DELETE FROM "Contact"');
    console.log('  ✅ Deleted contacts');

    // 6. Company references User
    await client.query('DELETE FROM "Company"');
    console.log('  ✅ Deleted companies');

    // 7. Tag references User
    await client.query('DELETE FROM "Tag"');
    console.log('  ✅ Deleted tags');

    console.log('✅ Test database cleaned successfully');
  } catch (error) {
    console.error('❌ Failed to clean test database:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

export default globalSetup;
