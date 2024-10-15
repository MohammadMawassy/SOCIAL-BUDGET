
import sqlite3 from 'sqlite3';

// Opening the database
const DB_URL = './tables/proposals.db';
const db = new sqlite3.Database(DB_URL, (err) => {
    if (err) throw err;
});


db.run('PRAGMA foreign_keys=ON;', (err) => {
    if (err) throw err; 
    console.log('Foreign keys turned on');
});

export default db;