// ════════════════════════════════════════════
//  DATA STORE
// ════════════════════════════════════════════
 
const COLORS = ['#8b5e3c','#6b7c5a','#b84c2a','#c9a84c','#5a6e8b','#7a5e8b','#3d7a5a','#8b3d5a'];
const GENRE_COLORS = {
  'Fiction':'#8b5e3c','Non-Fiction':'#6b7c5a','Science':'#5a6e8b','History':'#c9a84c',
  'Biography':'#7a5e8b','Mystery':'#3d2314','Fantasy':'#3d7a5a','Romance':'#8b3d5a',
  'Technology':'#2a5a8b','Self-Help':'#6b7c5a','Children':'#b84c2a','Poetry':'#c9a84c'
};
 
let books = [
  {id:1,title:'The Great Gatsby',author:'F. Scott Fitzgerald',isbn:'978-0-7432-7356-5',genre:'Fiction',year:1925,copies:3,available:2,desc:'A story of the Jazz Age and the American Dream.'},
  {id:2,title:'A Brief History of Time',author:'Stephen Hawking',isbn:'978-0-553-38016-3',genre:'Science',year:1988,copies:2,available:2,desc:'Cosmology for the general reader.'},
  {id:3,title:'Sapiens',author:'Yuval Noah Harari',isbn:'978-0-06-231609-7',genre:'History',year:2011,copies:4,available:3,desc:'A brief history of humankind.'},
  {id:4,title:'1984',author:'George Orwell',isbn:'978-0-452-28423-4',genre:'Fiction',year:1949,copies:3,available:1,desc:'A dystopian social science fiction novel.'},
  {id:5,title:'Clean Code',author:'Robert C. Martin',isbn:'978-0-13-235088-4',genre:'Technology',year:2008,copies:2,available:2,desc:'A handbook of agile software craftsmanship.'},
  {id:6,title:'The Alchemist',author:'Paulo Coelho',isbn:'978-0-06-231500-7',genre:'Fiction',year:1988,copies:5,available:4,desc:'A philosophical novel about following your dreams.'},
];
 
let members = [
  {id:1,first:'Arjun',last:'Sharma',email:'arjun@example.com',phone:'+91 98765 43210',address:'Ludhiana, Punjab',joined:'2024-01-15',color:'#8b5e3c'},
  {id:2,first:'Priya',last:'Nair',email:'priya@example.com',phone:'+91 87654 32109',address:'Chandigarh, Punjab',joined:'2024-03-22',color:'#6b7c5a'},
  {id:3,first:'Rohit',last:'Verma',email:'rohit@example.com',phone:'+91 76543 21098',address:'Amritsar, Punjab',joined:'2024-06-10',color:'#5a6e8b'},
];
 
let borrows = [
  {id:1,bookId:4,memberId:1,issued:'2025-02-20',due:'2026-03-10',returned:null},
  {id:2,bookId:1,memberId:2,issued:'2025-02-25',due:'2026-03-15',returned:null},
  {id:3,bookId:6,memberId:3,issued:'2025-01-10',due:'2025-01-25',returned:'2025-01-24'},
];
 
let activity = [
  {type:'borrow',text:'Arjun borrowed 1984',time:'2 days ago'},
  {type:'borrow',text:'Priya borrowed The Great Gatsby',time:'5 days ago'},
  {type:'return',text:'Rohit returned The Alchemist',time:'1 week ago'},
  {type:'new',text:'Clean Code added to catalogue',time:'2 weeks ago'},
];
 
let editingBookId = null;
let editingMemberId = null;
let nextBookId = 7;
let nextMemberId = 4;
let nextBorrowId = 4;
 
// ════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════
 
function navigate(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  const btns = document.querySelectorAll('.nav-btn');
  btns.forEach(b => { if(b.getAttribute('onclick').includes(`'${view}'`)) b.classList.add('active'); });
 
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
  if(!activity.length){ feed.innerHTML='<div class="empty-state" style="padding:1.5rem 0"><p>No activity yet.</p></div>'; return; }
  feed.innerHTML = activity.slice(0,6).map(a=>`
    <div class="activity-item">
      <div class="act-dot ${a.type}"></div>
      <div class="act-text">${a.text}</div>
      <div class="act-time">${a.time}</div>
    </div>`).join('');
 
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
 
function saveBook() {
  const title = document.getElementById('b-title').value.trim();
  const author = document.getElementById('b-author').value.trim();
  if(!title||!author){ toast('Title and Author are required.'); return; }
 
  if(editingBookId) {
    const b = books.find(x=>x.id===editingBookId);
    const diff = parseInt(document.getElementById('b-copies').value)||1 - b.copies;
    b.title = title; b.author = author; b.isbn = document.getElementById('b-isbn').value;
    b.genre = document.getElementById('b-genre').value; b.year = parseInt(document.getElementById('b-year').value)||0;
    b.copies = parseInt(document.getElementById('b-copies').value)||1;
    b.available = Math.max(0, b.available + diff);
    b.desc = document.getElementById('b-desc').value;
    toast('Book updated successfully.');
  } else {
    const copies = parseInt(document.getElementById('b-copies').value)||1;
    books.push({
      id: nextBookId++,
      title, author,
      isbn: document.getElementById('b-isbn').value,
      genre: document.getElementById('b-genre').value,
      year: parseInt(document.getElementById('b-year').value)||0,
      copies, available: copies,
      desc: document.getElementById('b-desc').value
    });
    activity.unshift({type:'new',text:`"${title}" added to catalogue`,time:'Just now'});
    toast('Book added to catalogue.');
  }
 
  closeModal('book-modal');
  renderBooks();
  updateHeader();
}
 
function deleteBook(id) {
  if(!confirm('Remove this book from the catalogue?')) return;
  const active = borrows.filter(b=>!b.returned && b.bookId===id);
  if(active.length){ toast('Cannot delete — book is currently borrowed.'); return; }
  books = books.filter(b=>b.id!==id);
  toast('Book removed.');
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
 
function issueBook() {
  const mid = parseInt(document.getElementById('borrow-member').value);
  const bid = parseInt(document.getElementById('borrow-book').value);
  const due = document.getElementById('borrow-due').value;
 
  if(!mid||!bid||!due){ toast('Please fill all fields.'); return; }
 
  const book = books.find(b=>b.id===bid);
  const member = members.find(m=>m.id===mid);
  if(!book||book.available<=0){ toast('Book not available.'); return; }
 
  book.available--;
  borrows.push({id:nextBorrowId++,bookId:bid,memberId:mid,issued:new Date().toISOString().split('T')[0],due,returned:null});
  activity.unshift({type:'borrow',text:`${member.first} borrowed "${book.title}"`,time:'Just now'});
 
  toast(`"${book.title}" issued to ${member.first} ${member.last}.`);
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
 
function returnBook(id) {
  const borrow = borrows.find(b=>b.id===id);
  if(!borrow) return;
  borrow.returned = new Date().toISOString().split('T')[0];
  const book = books.find(b=>b.id===borrow.bookId);
  const member = members.find(m=>m.id===borrow.memberId);
  if(book) book.available++;
  activity.unshift({type:'return',text:`${member?.first||'Member'} returned "${book?.title||'book'}"`,time:'Just now'});
  toast('Book returned successfully.');
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
 
function saveMember() {
  const first = document.getElementById('m-first').value.trim();
  const last = document.getElementById('m-last').value.trim();
  const email = document.getElementById('m-email').value.trim();
  if(!first||!last||!email){ toast('Name and email are required.'); return; }
 
  if(editingMemberId) {
    const m = members.find(x=>x.id===editingMemberId);
    m.first=first; m.last=last; m.email=email;
    m.phone=document.getElementById('m-phone').value;
    m.address=document.getElementById('m-address').value;
    toast('Member updated.');
  } else {
    members.push({
      id: nextMemberId++, first, last, email,
      phone: document.getElementById('m-phone').value,
      address: document.getElementById('m-address').value,
      joined: new Date().toISOString().split('T')[0],
      color: COLORS[Math.floor(Math.random()*COLORS.length)]
    });
    toast(`${first} ${last} added as member.`);
  }
 
  closeModal('member-modal');
  renderMembers();
  updateHeader();
}
 
function deleteMember(id) {
  const active = borrows.filter(b=>!b.returned && b.memberId===id);
  if(active.length){ toast('Cannot remove — member has active borrows.'); return; }
  if(!confirm('Remove this member?')) return;
  members = members.filter(m=>m.id!==id);
  toast('Member removed.');
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
renderDashboard();