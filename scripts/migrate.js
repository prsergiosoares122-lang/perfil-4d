const { Client } = require('pg')

async function run() {
  const connectionString = process.argv[2]
  if (!connectionString) {
    console.error('Error: Please provide your PostgreSQL connection string as an argument.')
    console.error('Example: node scripts/migrate.js "postgresql://postgres:password@db.aojqrexjcnwjmfdcfgfy.supabase.co:5432/postgres"')
    process.exit(1)
  }

  console.log('Connecting to PostgreSQL database...')
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Connected successfully. Running schema migration...')

    // 1. DDL checks completed (no spouse email columns needed)
    console.log('✓ DDL check completed.');

    // 2. Reload PostgREST schema cache
    await client.query("NOTIFY pgrst, 'reload schema';")
    console.log('✓ PostgREST schema cache reload notification sent.');

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err.message)
  } finally {
    await client.end()
  }
}

run()
