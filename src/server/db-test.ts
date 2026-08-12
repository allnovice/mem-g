import { db } from './db.ts'

const result = await db.query('SELECT NOW()')

console.log('Database connected:', result.rows[0])

await db.end()
