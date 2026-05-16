const { Client } = require('pg')
const fs = require('fs')

const PROJECT_REF = 'rguxuvggckhcybbjzoae'
const DB_PASSWORD = '125400Dh@??'

async function main() {
  const client = new Client({
    host: '2a05:d016:c4a:9700:f6b4:92a0:c54d:660',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  })

  console.log('Connecting via IPv6...')
  await client.connect()
  console.log('Connected!')

  const sql = fs.readFileSync('supabase/migrations/00001_schema.sql', 'utf8')
  console.log('Executing migration...')
  await client.query(sql)
  console.log('Migration executed successfully!')

  const { rows: tables } = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' ORDER BY table_name
  `)
  console.log('Tables created:', tables.map(t => t.table_name).join(', '))

  console.log('\n--- SUPABASE CREDENTIALS ---')
  console.log(`VITE_SUPABASE_URL=https://${PROJECT_REF}.supabase.co`)
  console.log('VITE_SUPABASE_ANON_KEY=<need_from_dashboard>')

  await client.end()
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
