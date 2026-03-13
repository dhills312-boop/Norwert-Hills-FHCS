#!/bin/bash
set -e

npm install --legacy-peer-deps

node -e "
const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  await pool.query(\`
    CREATE TABLE IF NOT EXISTS form_templates (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      jotform_id TEXT,
      pdf_path TEXT,
      required_for_service_types TEXT[] NOT NULL DEFAULT '{}'::text[],
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS form_instances (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      arrangement_id VARCHAR NOT NULL,
      template_id VARCHAR NOT NULL,
      status TEXT NOT NULL DEFAULT 'not_sent',
      form_url TEXT,
      sent_via TEXT,
      sent_to TEXT,
      sent_at TIMESTAMP,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS comm_events (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      arrangement_id VARCHAR NOT NULL,
      actor_id VARCHAR NOT NULL,
      channel TEXT NOT NULL,
      destination TEXT NOT NULL,
      template_id VARCHAR,
      details TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  \`);
  await pool.end();
  console.log('Database tables synced');
}
run().catch(e => { console.error(e); process.exit(1); });
"
