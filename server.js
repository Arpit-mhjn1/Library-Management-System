const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const DB_FILE = path.join(__dirname, 'db.json');

// Initialize database with default arrays if not exists
async function initDB() {
    try {
        await fs.access(DB_FILE);
    } catch {
        const initialData = {
            books: [
              {id:1,title:'The Great Gatsby',author:'F. Scott Fitzgerald',isbn:'978-0-7432-7356-5',genre:'Fiction',year:1925,copies:3,available:2,desc:'A story of the Jazz Age and the American Dream.'},
              {id:2,title:'A Brief History of Time',author:'Stephen Hawking',isbn:'978-0-553-38016-3',genre:'Science',year:1988,copies:2,available:2,desc:'Cosmology for the general reader.'}
            ], 
            members: [
              {id:1,first:'Arjun',last:'Sharma',email:'arjun@example.com',phone:'+91 98765 43210',address:'Ludhiana, Punjab',joined:'2024-01-15',color:'#8b5e3c'},
              {id:2,first:'Priya',last:'Nair',email:'priya@example.com',phone:'+91 87654 32109',address:'Chandigarh, Punjab',joined:'2024-03-22',color:'#6b7c5a'}
            ], 
            borrows: [
              {id:1,bookId:4,memberId:1,issued:'2025-02-20',due:'2026-03-10',returned:null}
            ], 
            activity: [
              {id: 1, type:'new',text:'Database initialized',time:'Just now'}
            ]
        };
        await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
    }
}

async function readDB() {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
}

async function writeDB(data) {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

initDB();

// APIs
// GET all books
app.get('/api/books', async (req, res) => {
    try {
        const db = await readDB();
        res.json(db.books);
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

// POST new book
app.post('/api/books', async (req, res) => {
    try {
        const db = await readDB();
        const newBook = { id: Date.now(), ...req.body };
        db.books.push(newBook);
        await writeDB(db);
        res.json({ id: newBook.id });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

// PUT edit book
app.put('/api/books/:id', async (req, res) => {
    try {
        const db = await readDB();
        const index = db.books.findIndex(b => b.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({error: "Book not found"});
        db.books[index] = { ...db.books[index], ...req.body };
        await writeDB(db);
        res.json({ updated: 1 });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

// DELETE book
app.delete('/api/books/:id', async (req, res) => {
    try {
        const db = await readDB();
        db.books = db.books.filter(b => b.id !== parseInt(req.params.id));
        await writeDB(db);
        res.json({ deleted: 1 });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

// Members
app.get('/api/members', async (req, res) => {
    try {
        const db = await readDB();
        res.json(db.members);
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

app.post('/api/members', async (req, res) => {
    try {
        const db = await readDB();
        const newMember = { id: Date.now(), ...req.body };
        db.members.push(newMember);
        await writeDB(db);
        res.json({ id: newMember.id });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

app.put('/api/members/:id', async (req, res) => {
    try {
        const db = await readDB();
        const index = db.members.findIndex(m => m.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({error: "Member not found"});
        db.members[index] = { ...db.members[index], ...req.body };
        await writeDB(db);
        res.json({ updated: 1 });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

app.delete('/api/members/:id', async (req, res) => {
    try {
        const db = await readDB();
        db.members = db.members.filter(m => m.id !== parseInt(req.params.id));
        await writeDB(db);
        res.json({ deleted: 1 });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

// Borrows
app.get('/api/borrows', async (req, res) => {
    try {
        const db = await readDB();
        res.json(db.borrows);
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

app.post('/api/borrows', async (req, res) => {
    try {
        const db = await readDB();
        const newBorrow = { id: Date.now(), ...req.body };
        db.borrows.push(newBorrow);
        await writeDB(db);
        res.json({ id: newBorrow.id });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

app.put('/api/borrows/:id', async (req, res) => {
    try {
        const db = await readDB();
        const index = db.borrows.findIndex(b => b.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({error: "Borrow not found"});
        db.borrows[index] = { ...db.borrows[index], ...req.body };
        await writeDB(db);
        res.json({ updated: 1 });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

// Activity
app.get('/api/activity', async (req, res) => {
    try {
        const db = await readDB();
        res.json(db.activity.slice().reverse().slice(0, 50));
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

app.post('/api/activity', async (req, res) => {
    try {
        const db = await readDB();
        const newActivity = { id: Date.now(), ...req.body };
        db.activity.push(newActivity);
        await writeDB(db);
        res.json({ id: newActivity.id });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
