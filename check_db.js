const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT * FROM eventos", [], (err, rows) => {
        if (err) {
            throw err;
        }
        console.log(rows);
    });
});

db.close();