import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

// Disable prefetch for serverless — each Lambda invocation is a cold connection
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });