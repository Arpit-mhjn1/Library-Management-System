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
              {id:2,title:'A Brief History of Time',author:'Stephen Hawking',isbn:'978-0-553-38016-3',genre:'Science',year:1988,copies:2,available:2,desc:'Cosmology for the general reader.'},
              {id:3,title:'Sapiens',author:'Yuval Noah Harari',isbn:'978-0-06-231609-7',genre:'History',year:2011,copies:4,available:3,desc:'A brief history of humankind.'},
              {id:4,title:'1984',author:'George Orwell',isbn:'978-0-452-28423-4',genre:'Fiction',year:1949,copies:3,available:1,desc:'A dystopian social science fiction novel.'},
              {id:5,title:'Clean Code',author:'Robert C. Martin',isbn:'978-0-13-235088-4',genre:'Technology',year:2008,copies:2,available:2,desc:'A handbook of agile software craftsmanship.'},
              {id:6,title:'The Alchemist',author:'Paulo Coelho',isbn:'978-0-06-231500-7',genre:'Fiction',year:1988,copies:5,available:4,desc:'A philosophical novel about following your dreams.'},
              {id:7,title:'To Kill a Mockingbird',author:'Harper Lee',isbn:'978-0-06-112008-4',genre:'Fiction',year:1960,copies:5,available:5,desc:'A novel about the serious issues of rape and racial inequality.'},
              {id:8,title:'Pride and Prejudice',author:'Jane Austen',isbn:'978-0-14-143951-8',genre:'Romance',year:1813,copies:4,available:4,desc:'A romantic novel of manners.'},
              {id:9,title:'The Hobbit',author:'J.R.R. Tolkien',isbn:'978-0-547-92822-7',genre:'Fantasy',year:1937,copies:6,available:6,desc:'A children\'s fantasy novel.'},
              {id:10,title:'Harry Potter and the Sorcerer\'s Stone',author:'J.K. Rowling',isbn:'978-0-590-35342-7',genre:'Fantasy',year:1997,copies:7,available:7,desc:'The first novel in the Harry Potter series.'},
              {id:11,title:'The Lord of the Rings',author:'J.R.R. Tolkien',isbn:'978-0-618-64015-7',genre:'Fantasy',year:1954,copies:3,available:3,desc:'An epic high-fantasy novel.'},
              {id:12,title:'The Catcher in the Rye',author:'J.D. Salinger',isbn:'978-0-316-76948-7',genre:'Fiction',year:1951,copies:4,available:4,desc:'A story of teenage rebellion.'},
              {id:13,title:'Thinking, Fast and Slow',author:'Daniel Kahneman',isbn:'978-0-374-53355-7',genre:'Non-Fiction',year:2011,copies:3,available:3,desc:'A book on behavioral psychology and decision-making.'},
              {id:14,title:'Atomic Habits',author:'James Clear',isbn:'978-0-7352-1129-2',genre:'Self-Help',year:2018,copies:8,available:8,desc:'An easy and proven way to build good habits and break bad ones.'},
              {id:15,title:'The Power of Habit',author:'Charles Duhigg',isbn:'978-0-8129-8160-5',genre:'Self-Help',year:2012,copies:2,available:2,desc:'Why we do what we do in life and business.'},
              {id:16,title:'Educated',author:'Tara Westover',isbn:'978-0-399-59050-4',genre:'Biography',year:2018,copies:5,available:5,desc:'A memoir about growing up in a strict and abusive household.'},
              {id:17,title:'Steve Jobs',author:'Walter Isaacson',isbn:'978-1-4516-4853-9',genre:'Biography',year:2011,copies:3,available:3,desc:'The exclusive biography of Steve Jobs.'},
              {id:18,title:'Design Patterns',author:'Erich Gamma',isbn:'978-0-201-63361-0',genre:'Technology',year:1994,copies:2,available:2,desc:'Elements of Reusable Object-Oriented Software.'},
              {id:19,title:'Introduction to Algorithms',author:'Thomas H. Cormen',isbn:'978-0-262-03384-8',genre:'Technology',year:2009,copies:1,available:1,desc:'A comprehensive textbook on computer algorithms.'},
              {id:20,title:'The Pragmatic Programmer',author:'Andrew Hunt',isbn:'978-0-201-61622-4',genre:'Technology',year:1999,copies:3,available:3,desc:'From journeyman to master.'},
              {id:21,title:'Cosmos',author:'Carl Sagan',isbn:'978-0-345-33135-9',genre:'Science',year:1980,copies:4,available:4,desc:'The story of fifteen billion years of cosmic evolution.'},
              {id:22,title:'The Selfish Gene',author:'Richard Dawkins',isbn:'978-0-19-929115-1',genre:'Science',year:1976,copies:2,available:2,desc:'A book on evolution by natural selection.'},
              {id:23,title:'The Girl with the Dragon Tattoo',author:'Stieg Larsson',isbn:'978-0-307-26975-1',genre:'Mystery',year:2005,copies:5,available:5,desc:'A psychological thriller.'},
              {id:24,title:'Gone Girl',author:'Gillian Flynn',isbn:'978-0-307-58836-4',genre:'Mystery',year:2012,copies:4,available:4,desc:'A thriller novel about a missing wife.'}
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
