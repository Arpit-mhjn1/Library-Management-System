// ════════════════════════════════════════════
//  DATA STORE & FETCH API
// ════════════════════════════════════════════
 
const API_URL = '/api';
const COLORS = ['#8b5e3c','#6b7c5a','#b84c2a','#c9a84c','#5a6e8b','#7a5e8b','#3d7a5a','#8b3d5a'];
const GENRE_COLORS = {
  'Fiction':'#8b5e3c','Non-Fiction':'#6b7c5a','Science':'#5a6e8b','History':'#c9a84c',
  'Biography':'#7a5e8b','Mystery':'#3d2314','Fantasy':'#3d7a5a','Romance':'#8b3d5a',
  'Technology':'#2a5a8b','Self-Help':'#6b7c5a','Children':'#b84c2a','Poetry':'#c9a84c'
};
 
let books = [];
let members = [];
let borrows = [];
let activity = [];
 
let editingBookId = null;
let editingMemberId = null;

async function fetchData() {
    try {
        const [booksRes, membersRes, borrowsRes, activityRes] = await Promise.all([
            fetch(`${API_URL}/books`),
            fetch(`${API_URL}/members`),
            fetch(`${API_URL}/borrows`),
            fetch(`${API_URL}/activity`)
        ]);
        books = await booksRes.json();
        members = await membersRes.json();
        borrows = await borrowsRes.json();
        activity = await activityRes.json();
    } catch (e) {
        console.error("Failed to load data:", e);
        toast("Error loading data from server.");
    }
}
 
// ════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════
 
async function navigate(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  const btns = document.querySelectorAll('.nav-btn');
  btns.forEach(b => { if(b.getAttribute('onclick').includes(`'${view}'`)) b.classList.add('active'); });
  
  await fetchData(); // refresh data on navigate
  if(view==='books') renderBooks();
  if(view==='dashboard') renderDashboard();
  if(view==='borrow') renderBorrowForm();
  if(view==='returns') renderReturns();
  if(view==='members') renderMembers();
  if(view==='history') renderHistory();
}
 
// ════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════
 
function renderDashboard() {
  const borrowed = borrows.filter(b => !b.returned).length;
  const avail = books.reduce((s,b)=>s+b.available,0);
  document.getElementById('d-total').textContent = books.length;
  document.getElementById('d-available').textContent = avail;
  document.getElementById('d-borrowed').textContent = borrowed;
  document.getElementById('d-members').textContent = members.length;
  updateHeader();
 
  // Activity
  const feed = document.getElementById('activity-feed');
  if(!activity.length){ feed.innerHTML='<div class="empty-state" style="padding:1.5rem 0"><p>No activity yet.</p></div>'; }
  else {
      feed.innerHTML = activity.slice(0,6).map(a=>`
        <div class="activity-item">
          <div class="act-dot ${a.type}"></div>
          <div class="act-text">${a.text}</div>
          <div class="act-time">${a.time}</div>
        </div>`).join('');
  }
 
  // Genre chart
  const counts = {};
  books.forEach(b=>{ counts[b.genre]=(counts[b.genre]||0)+1; });
  const max = Math.max(...Object.values(counts),1);
  const chart = document.getElementById('genre-chart');
  chart.innerHTML = Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([g,c])=>`
    <div class="genre-bar-row">
      <div class="genre-name">${g}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${(c/max)*100}%;background:${GENRE_COLORS[g]||'var(--warm-brown)'}"></div></div>
      <div class="bar-count">${c}</div>
    </div>`).join('');
}
 
function updateHeader() {
  const borrowed = borrows.filter(b=>!b.returned).length;
  const overdue = borrows.filter(b=>!b.returned && new Date(b.due)<new Date()).length;
  document.getElementById('h-total').textContent = books.length;
  document.getElementById('h-members').textContent = members.length;
  document.getElementById('h-borrowed').textContent = borrowed;
  document.getElementById('h-overdue').textContent = overdue;
  document.getElementById('overdue-badge').textContent = overdue;
}
 
// ════════════════════════════════════════════
//  BOOKS
// ════════════════════════════════════════════
 
function renderBooks() {
  const q = document.getElementById('book-search').value.toLowerCase();
  const gf = document.getElementById('genre-filter').value;
  const sf = document.getElementById('status-filter').value;
 
  let filtered = books.filter(b => {
    const matchQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || (b.isbn||'').includes(q);
    const matchG = !gf || b.genre === gf;
    const matchS = !sf || (sf==='Available'?b.available>0:b.available===0);
    return matchQ && matchG && matchS;
  });
 
  const grid = document.getElementById('book-grid');
  if(!filtered.length){ grid.innerHTML='<div class="empty-state" style="grid-column:1/-1"><span class="empty-icon">📖</span><p>No books match your search.</p></div>'; return; }
 
  grid.innerHTML = filtered.map(b => {
    const color = GENRE_COLORS[b.genre] || '#8b5e3c';
    const avail = b.available > 0;
    return `
    <div class="book-card">
      <div class="book-spine" style="background:${color}"></div>
      <div class="book-body">
        <div class="book-genre">${b.genre}</div>
        <div class="book-title">${b.title}</div>
        <div class="book-author">by ${b.author}</div>
        <div class="book-meta">
          <span class="status-badge ${avail?'status-available':'status-borrowed'}">${avail?'Available':'All Out'}</span>
          <span class="book-year">${b.year}</span>
        </div>
        ${b.available>0?`<div style="font-family:'DM Mono',monospace;font-size:0.65rem;color:var(--warm-brown);margin-top:6px;opacity:.7">${b.available}/${b.copies} copies free</div>`:''}
      </div>
      <div class="book-actions">
        <button class="btn btn-secondary" style="font-size:.7rem;padding:.3rem .7rem" onclick="openBookModal(${b.id})">Edit</button>
        <button class="btn btn-danger" onclick="deleteBook(${b.id})">Delete</button>
      </div>
    </div>`;
  }).join('');
}
 
function openBookModal(id=null) {
  editingBookId = id;
  document.getElementById('book-modal-title').textContent = id ? 'Edit Book' : 'Add New Book';
  const b = id ? books.find(x=>x.id===id) : null;
  document.getElementById('b-title').value = b?.title||'';
  document.getElementById('b-author').value = b?.author||'';
  document.getElementById('b-isbn').value = b?.isbn||'';
  document.getElementById('b-genre').value = b?.genre||'Fiction';
  document.getElementById('b-year').value = b?.year||new Date().getFullYear();
  document.getElementById('b-copies').value = b?.copies||1;
  document.getElementById('b-desc').value = b?.desc||'';
  document.getElementById('book-modal').classList.add('open');
}
 
async function saveBook() {
  const title = document.getElementById('b-title').value.trim();
  const author = document.getElementById('b-author').value.trim();
  if(!title||!author){ toast('Title and Author are required.'); return; }
 
  let bData = {
      title, author,
      isbn: document.getElementById('b-isbn').value,
      genre: document.getElementById('b-genre').value,
      year: parseInt(document.getElementById('b-year').value)||0,
      copies: parseInt(document.getElementById('b-copies').value)||1,
      desc: document.getElementById('b-desc').value
  };

  if(editingBookId) {
    const b = books.find(x=>x.id===editingBookId);
    const diff = bData.copies - b.copies;
    bData.available = Math.max(0, b.available + diff);
    await fetch(`${API_URL}/books/${editingBookId}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(bData) });
    toast('Book updated successfully.');
  } else {
    bData.available = bData.copies;
    await fetch(`${API_URL}/books`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(bData) });
    await fetch(`${API_URL}/activity`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({type:'new',text:`"${title}" added to catalogue`,time:'Just now'}) });
    toast('Book added to catalogue.');
  }
 
  closeModal('book-modal');
  await fetchData();
  renderBooks();
  updateHeader();
}
 
async function deleteBook(id) {
  if(!confirm('Remove this book from the catalogue?')) return;
  const active = borrows.filter(b=>!b.returned && b.bookId===id);
  if(active.length){ toast('Cannot delete — book is currently borrowed.'); return; }
  await fetch(`${API_URL}/books/${id}`, { method: 'DELETE' });
  toast('Book removed.');
  await fetchData();
  renderBooks();
  updateHeader();
}
 
// ════════════════════════════════════════════
//  BORROW
// ════════════════════════════════════════════
 
function renderBorrowForm() {
  const ms = document.getElementById('borrow-member');
  ms.innerHTML = '<option value="">— Select Member —</option>' +
    members.map(m=>`<option value="${m.id}">${m.first} ${m.last}</option>`).join('');
 
  const bs = document.getElementById('borrow-book');
  bs.innerHTML = '<option value="">— Select Available Book —</option>' +
    books.filter(b=>b.available>0).map(b=>`<option value="${b.id}">${b.title} (${b.available} free)</option>`).join('');
 
  const due = document.getElementById('borrow-due');
  const d = new Date(); d.setDate(d.getDate()+14);
  due.value = d.toISOString().split('T')[0];
}
 
async function issueBook() {
  const mid = parseInt(document.getElementById('borrow-member').value);
  const bid = parseInt(document.getElementById('borrow-book').value);
  const due = document.getElementById('borrow-due').value;
 
  if(!mid||!bid||!due){ toast('Please fill all fields.'); return; }
 
  const book = books.find(b=>b.id===bid);
  const member = members.find(m=>m.id===mid);
  if(!book||book.available<=0){ toast('Book not available.'); return; }
 
  // update book availability
  book.available--;
  await fetch(`${API_URL}/books/${bid}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(book) });

  // issue borrow
  await fetch(`${API_URL}/borrows`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({bookId:bid, memberId:mid, issued:new Date().toISOString().split('T')[0], due, returned:null}) });
  await fetch(`${API_URL}/activity`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({type:'borrow',text:`${member.first} borrowed "${book.title}"`,time:'Just now'}) });
 
  toast(`"${book.title}" issued to ${member.first} ${member.last}.`);
  await fetchData();
  renderBorrowForm();
  updateHeader();
}
 
// ════════════════════════════════════════════
//  RETURNS
// ════════════════════════════════════════════
 
function renderReturns() {
  const active = borrows.filter(b=>!b.returned);
  const tbody = document.getElementById('returns-table');
  if(!active.length){ tbody.innerHTML=`<tr><td colspan="6" style="text-align:center;padding:2rem;font-style:italic;color:var(--warm-brown)">No books currently out on loan.</td></tr>`; return; }
 
  const today = new Date();
  tbody.innerHTML = active.map(b=>{
    const book = books.find(x=>x.id===b.bookId);
    const member = members.find(x=>x.id===b.memberId);
    const dueD = new Date(b.due);
    const overdue = dueD < today;
    const daysLeft = Math.round((dueD-today)/(1000*60*60*24));
    return `<tr>
      <td><strong>${book?.title||'Unknown'}</strong></td>
      <td>${member?`${member.first} ${member.last}`:'Unknown'}</td>
      <td style="font-family:'DM Mono',monospace;font-size:.78rem">${b.issued}</td>
      <td class="${overdue?'overdue':''}" style="font-family:'DM Mono',monospace;font-size:.78rem">${b.due}</td>
      <td>
        ${overdue
          ? `<span class="status-badge status-borrowed">Overdue ${Math.abs(daysLeft)}d</span>`
          : `<span class="status-badge status-available">Due in ${daysLeft}d</span>`}
      </td>
      <td><button class="btn btn-success" onclick="returnBook(${b.id})">Return</button></td>
    </tr>`;
  }).join('');
}
 
async function returnBook(id) {
  const borrow = borrows.find(b=>b.id===id);
  if(!borrow) return;
  const returnedDate = new Date().toISOString().split('T')[0];
  
  await fetch(`${API_URL}/borrows/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({returned: returnedDate}) });

  const book = books.find(b=>b.id===borrow.bookId);
  const member = members.find(m=>m.id===borrow.memberId);
  if(book) {
      book.available++;
      await fetch(`${API_URL}/books/${book.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(book) });
  }
  await fetch(`${API_URL}/activity`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({type:'return',text:`${member?.first||'Member'} returned "${book?.title||'book'}"`,time:'Just now'}) });
  
  toast('Book returned successfully.');
  await fetchData();
  renderReturns();
  updateHeader();
}
 
// ════════════════════════════════════════════
//  MEMBERS
// ════════════════════════════════════════════
 
function renderMembers() {
  const q = document.getElementById('member-search').value.toLowerCase();
  const filtered = members.filter(m =>
    !q || `${m.first} ${m.last}`.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  );
 
  const tbody = document.getElementById('members-table');
  if(!filtered.length){ tbody.innerHTML=`<tr><td colspan="7" style="text-align:center;padding:2rem;font-style:italic;color:var(--warm-brown)">No members found.</td></tr>`; return; }
 
  tbody.innerHTML = filtered.map(m=>{
    const activeBorrows = borrows.filter(b=>!b.returned && b.memberId===m.id).length;
    const initials = (m.first[0]+m.last[0]).toUpperCase();
    return `<tr>
      <td><div class="member-avatar" style="background:${m.color}">${initials}</div></td>
      <td><strong>${m.first} ${m.last}</strong></td>
      <td style="font-size:.82rem">${m.email}</td>
      <td style="font-family:'DM Mono',monospace;font-size:.78rem">${m.phone||'—'}</td>
      <td style="font-family:'DM Mono',monospace;font-size:.78rem">${m.joined}</td>
      <td style="text-align:center">
        ${activeBorrows>0?`<span class="nav-badge" style="background:var(--warm-brown)">${activeBorrows}</span>`:'—'}
      </td>
      <td><button class="btn btn-danger" onclick="deleteMember(${m.id})">Remove</button></td>
    </tr>`;
  }).join('');
}
 
function openMemberModal(id=null) {
  editingMemberId = id;
  document.getElementById('member-modal-title').textContent = id ? 'Edit Member' : 'Add New Member';
  const m = id ? members.find(x=>x.id===id) : null;
  document.getElementById('m-first').value = m?.first||'';
  document.getElementById('m-last').value = m?.last||'';
  document.getElementById('m-email').value = m?.email||'';
  document.getElementById('m-phone').value = m?.phone||'';
  document.getElementById('m-address').value = m?.address||'';
  document.getElementById('member-modal').classList.add('open');
}
 
async function saveMember() {
  const first = document.getElementById('m-first').value.trim();
  const last = document.getElementById('m-last').value.trim();
  const email = document.getElementById('m-email').value.trim();
  if(!first||!last||!email){ toast('Name and email are required.'); return; }
 
  const mData = {
      first, last, email,
      phone: document.getElementById('m-phone').value,
      address: document.getElementById('m-address').value
  };

  if(editingMemberId) {
    await fetch(`${API_URL}/members/${editingMemberId}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(mData) });
    toast('Member updated.');
  } else {
    mData.joined = new Date().toISOString().split('T')[0];
    mData.color = COLORS[Math.floor(Math.random()*COLORS.length)];
    await fetch(`${API_URL}/members`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(mData) });
    toast(`${first} ${last} added as member.`);
  }
 
  closeModal('member-modal');
  await fetchData();
  renderMembers();
  updateHeader();
}
 
async function deleteMember(id) {
  const active = borrows.filter(b=>!b.returned && b.memberId===id);
  if(active.length){ toast('Cannot remove — member has active borrows.'); return; }
  if(!confirm('Remove this member?')) return;
  await fetch(`${API_URL}/members/${id}`, { method: 'DELETE' });
  toast('Member removed.');
  await fetchData();
  renderMembers();
  updateHeader();
}
 
// ════════════════════════════════════════════
//  HISTORY
// ════════════════════════════════════════════
 
function renderHistory() {
  const all = [...borrows].reverse();
  const tbody = document.getElementById('history-table');
  if(!all.length){ tbody.innerHTML=`<tr><td colspan="5" style="text-align:center;padding:2rem;font-style:italic;color:var(--warm-brown)">No borrow history yet.</td></tr>`; return; }
 
  tbody.innerHTML = all.map(b=>{
    const book = books.find(x=>x.id===b.bookId);
    const member = members.find(x=>x.id===b.memberId);
    return `<tr>
      <td><strong>${book?.title||'Unknown'}</strong><br><span style="font-size:.78rem;color:var(--warm-brown);font-style:italic">${book?.author||''}</span></td>
      <td>${member?`${member.first} ${member.last}`:'Unknown'}</td>
      <td style="font-family:'DM Mono',monospace;font-size:.78rem">${b.issued}</td>
      <td style="font-family:'DM Mono',monospace;font-size:.78rem">${b.returned||'—'}</td>
      <td>${b.returned
        ? `<span class="status-badge status-available">Returned</span>`
        : (new Date(b.due)<new Date()
          ? `<span class="status-badge status-borrowed">Overdue</span>`
          : `<span class="status-badge status-reserved">Active</span>`)
      }</td>
    </tr>`;
  }).join('');
}
 
// ════════════════════════════════════════════
//  UTILS
// ════════════════════════════════════════════
 
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
 
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 3000);
}
 
// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(o=>
  o.addEventListener('click', e=>{ if(e.target===o) o.classList.remove('open'); })
);
 
// ════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════
async function initApp() {
    await fetchData();
    renderDashboard();
}

initApp();