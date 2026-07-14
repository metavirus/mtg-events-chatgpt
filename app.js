const DATA={stores:[],events:[],sources:[],changes:[]};
let currentDate=new Date();
let view='agenda';

async function load(){
  const files=['stores','events','sources','changes'];
  for(const f of files){
    DATA[f]=await fetch(`${f}.json`).then(r=>r.json());
  }
  initialize();
}
function initialize(){
  bindTabs(); bindControls(); populateStoreFilter(); renderCalendar(); renderStores(); renderChanges();
}
function bindTabs(){
  document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{
    document.querySelectorAll('.tab,.panel').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); document.getElementById(b.dataset.tab).classList.add('active');
  });
}
function bindControls(){
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{
    document.querySelectorAll('[data-view]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); view=b.dataset.view; renderCalendar();
  });
  document.getElementById('today').onclick=()=>{currentDate=new Date();renderCalendar()};
  document.getElementById('prev').onclick=()=>{move(-1);renderCalendar()};
  document.getElementById('next').onclick=()=>{move(1);renderCalendar()};
  document.getElementById('storeFilter').onchange=renderCalendar;
  document.getElementById('confidenceFilter').onchange=renderCalendar;
  document.getElementById('modalClose').onclick=()=>document.getElementById('modal').classList.add('hidden');
  document.getElementById('modal').onclick=e=>{if(e.target.id==='modal')e.currentTarget.classList.add('hidden')};
  document.getElementById('fileImport').onchange=importFiles;
}
function move(n){
  if(view==='month') currentDate.setMonth(currentDate.getMonth()+n);
  else currentDate.setDate(currentDate.getDate()+n*(view==='week'?7:14));
}
function populateStoreFilter(){
  const s=document.getElementById('storeFilter');
  DATA.stores.sort((a,b)=>a.name.localeCompare(b.name)).forEach(x=>{
    const o=document.createElement('option');o.value=x.id;o.textContent=x.name;s.appendChild(o);
  });
}
function occurrences(rangeStart,rangeEnd){
  const out=[];
  for(const e of DATA.events){
    if(e.status!=='active')continue;
    if(e.recurrence?.frequency==='weekly'){
      let d=new Date(rangeStart); d.setHours(12,0,0,0);
      while(d.getDay()!==e.recurrence.dayOfWeek)d.setDate(d.getDate()+1);
      while(d<=rangeEnd){
        const min=new Date(e.startDate+'T12:00:00');
        if(d>=min && (!e.endDate || d<=new Date(e.endDate+'T23:59:59'))){
          out.push({...e,occurrenceDate:new Date(d)});
        }
        d.setDate(d.getDate()+7);
      }
    }else if(e.date){
      const d=new Date(e.date+'T12:00:00');
      if(d>=rangeStart&&d<=rangeEnd)out.push({...e,occurrenceDate:d});
    }
  }
  const sf=document.getElementById('storeFilter').value;
  const cf=document.getElementById('confidenceFilter').value;
  return out.filter(e=>(!sf||e.storeId===sf)&&(!cf||e.confidence===cf))
            .sort((a,b)=>a.occurrenceDate-b.occurrenceDate||a.recurrence.startTime.localeCompare(b.recurrence.startTime));
}
function dateKey(d){return d.toISOString().slice(0,10)}
function store(id){return DATA.stores.find(s=>s.id===id)}
function source(id){return DATA.sources.find(s=>s.id===id)}
function range(){
  let start,end;
  if(view==='agenda'){start=new Date(currentDate);start.setHours(0,0,0,0);end=new Date(start);end.setDate(end.getDate()+20)}
  if(view==='week'){start=new Date(currentDate);start.setDate(start.getDate()-start.getDay());start.setHours(0,0,0,0);end=new Date(start);end.setDate(end.getDate()+6);end.setHours(23,59,59,999)}
  if(view==='month'){start=new Date(currentDate.getFullYear(),currentDate.getMonth(),1);end=new Date(currentDate.getFullYear(),currentDate.getMonth()+1,0,23,59,59)}
  return {start,end};
}
function renderCalendar(){
  const {start,end}=range();const ev=occurrences(start,end);
  document.getElementById('dateLabel').textContent=view==='month'
    ?currentDate.toLocaleDateString(undefined,{month:'long',year:'numeric'})
    :`${start.toLocaleDateString(undefined,{month:'short',day:'numeric'})} – ${end.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}`;
  if(view==='agenda')renderAgenda(ev,start,end);
  if(view==='week')renderWeek(ev,start);
  if(view==='month')renderMonth(ev);
}
function card(e,mini=false){
  const st=store(e.storeId);
  const el=document.createElement('div');el.className=mini?'mini-event':'event-card';
  el.innerHTML=mini
    ?`<b>${e.recurrence.startTime}</b> ${e.title}<br><span class="muted">${st.name}</span>`
    :`<div class="event-title">${e.recurrence.startTime} — ${e.title}</div><div>${st.name} · ${st.city}</div><div><span class="badge">${e.eventType}</span><span class="badge">${e.confidence} confidence</span>${e.entryFee!=null?`<span class="badge">$${e.entryFee}</span>`:''}</div>`;
  el.onclick=()=>showEvent(e);return el;
}
function renderAgenda(ev,start,end){
  const c=document.getElementById('calendarContent');c.innerHTML='';
  const grouped={};ev.forEach(e=>(grouped[dateKey(e.occurrenceDate)]??=[]).push(e));
  for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){
    const list=grouped[dateKey(d)]||[];if(!list.length)continue;
    const sec=document.createElement('section');sec.className='agenda-day';
    sec.innerHTML=`<h3>${d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</h3>`;
    list.forEach(e=>sec.appendChild(card(e)));c.appendChild(sec);
  }
  if(!ev.length)c.innerHTML='<p>No matching events in this range.</p>';
}
function renderWeek(ev,start){
  const c=document.getElementById('calendarContent');c.innerHTML='';const grid=document.createElement('div');grid.className='week-grid';
  for(let i=0;i<7;i++){const d=new Date(start);d.setDate(d.getDate()+i);const col=document.createElement('div');col.className='week-day';col.innerHTML=`<h4>${d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}</h4>`;ev.filter(e=>dateKey(e.occurrenceDate)===dateKey(d)).forEach(e=>col.appendChild(card(e,true)));grid.appendChild(col)}c.appendChild(grid);
}
function renderMonth(ev){
  const c=document.getElementById('calendarContent');c.innerHTML='';const grid=document.createElement('div');grid.className='month-grid';
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(x=>{const h=document.createElement('div');h.className='month-head';h.textContent=x;grid.appendChild(h)});
  const first=new Date(currentDate.getFullYear(),currentDate.getMonth(),1);const start=new Date(first);start.setDate(1-first.getDay());
  for(let i=0;i<42;i++){const d=new Date(start);d.setDate(d.getDate()+i);const col=document.createElement('div');col.className='month-day'+(d.getMonth()!==currentDate.getMonth()?' outside':'');col.innerHTML=`<h4>${d.getDate()}</h4>`;ev.filter(e=>dateKey(e.occurrenceDate)===dateKey(d)).forEach(e=>col.appendChild(card(e,true)));grid.appendChild(col)}c.appendChild(grid);
}
function showEvent(e){
  const st=store(e.storeId),src=source(e.sourceId);
  document.getElementById('modalContent').innerHTML=`<h2>${e.title}</h2><p><b>${e.occurrenceDate.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})} at ${e.recurrence.startTime}</b></p><p>${st.name}<br>${st.address}</p><p>${e.details}</p><p><span class="badge">${e.confidence} confidence</span><span class="badge">verified ${e.lastVerified}</span></p>${src?`<p><a href="${src.url}" target="_blank">Open source listing</a></p>`:''}`;
  document.getElementById('modal').classList.remove('hidden');
}
function renderStores(){
  const list=document.getElementById('storeList');list.innerHTML='';
  DATA.stores.sort((a,b)=>a.name.localeCompare(b.name)).forEach((s,i)=>{
    const el=document.createElement('div');el.className='store-list-item';el.innerHTML=`<b>${s.name}</b><br><span class="muted">${s.city} · verified ${s.lastVerified}</span>`;el.onclick=()=>{document.querySelectorAll('.store-list-item').forEach(x=>x.classList.remove('active'));el.classList.add('active');showStore(s)};list.appendChild(el);if(i===0){el.classList.add('active');showStore(s)}
  });
}
function showStore(s){
  const labels={commanderActivity:'Commander activity',meetupAccessibility:'Meetup accessibility',communityContinuity:'Community continuity',newPlayerIntegration:'New-player integration',physicalEnvironment:'Physical environment',scheduleReliability:'Schedule reliability',homeGroupPotential:'Home-group potential'};
  const ev=DATA.events.filter(e=>e.storeId===s.id);
  const src=s.sourceIds.map(id=>source(id)).filter(Boolean);
  document.getElementById('storeDetail').innerHTML=`<div class="store-detail-card"><h2>${s.name}</h2><p>${s.address}<br>${s.phone||''}</p><p><a href="${s.website||s.eventsUrl}" target="_blank">Store website or event page</a></p><p>${s.assessmentNotes}</p><h3>Assessment</h3><div class="score-grid">${Object.entries(s.assessment).map(([k,v])=>`<div class="score"><b>${labels[k]}</b><br>${'●'.repeat(v)}${'○'.repeat(5-v)} (${v}/5)</div>`).join('')}</div><div class="store-events"><h3>Known events</h3>${ev.length?ev.map(e=>`<div class="event-card"><b>${e.title}</b><br>${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][e.recurrence.dayOfWeek]} ${e.recurrence.startTime} · ${e.confidence} confidence</div>`).join(''):'<p>No current event has been verified yet.</p>'}</div><div class="source-list"><h3>Research sources</h3>${src.map(x=>`<a href="${x.url}" target="_blank">${x.label}</a>`).join('')}</div></div>`;
}
function renderChanges(){
  const c=document.getElementById('changeList');c.innerHTML=DATA.changes.sort((a,b)=>b.detectedAt.localeCompare(a.detectedAt)).map(x=>`<div class="change"><b>${x.summary}</b><br><span class="muted">${new Date(x.detectedAt).toLocaleString()} · ${x.changeType} · ${x.reviewStatus}</span></div>`).join('');
}
async function importFiles(e){
  for(const f of e.target.files){
    const key=f.name.replace('.json','');
    if(DATA[key])DATA[key]=JSON.parse(await f.text());
  }
  document.getElementById('storeFilter').innerHTML='<option value="">All stores</option>';
  populateStoreFilter();renderCalendar();renderStores();renderChanges();
  alert('Data imported for this browser session.');
}
load().catch(err=>{document.body.innerHTML=`<pre>Unable to load data. Run this folder through a local web server.\n\n${err}</pre>`});