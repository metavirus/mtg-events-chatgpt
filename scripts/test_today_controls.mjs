import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const places = {near:{name:'Near',distance:5,close:1080},far:{name:'Far',distance:22,close:1500},unknown:{name:'Unknown'}};
const options = {query:'',radius:'',favorites:false,sort:'distance'};
const context = vm.createContext({todayOptions:options,store:id=>places[id],numericDistance:p=>p?.distance??null,eventMatchesPreset:e=>e.favorite,todayHoursInfo:p=>({verified:!!p?.close,intervals:p?.close?[{close:p.close}]:[]}),eventStartTime:e=>e.time,compareText:(a,b)=>String(a).localeCompare(String(b)),todayAvailability:e=>({group:e.group||'later'})});
for (const name of ['todayMatchesControls','todayClosingMinutes','sortTodayEvents']) {
  const start=code.indexOf(`function ${name}(`), end=code.indexOf('\nfunction ',start+1);
  vm.runInContext(code.slice(start,end),context);
}
const a={storeId:'near',time:'19:00'}, b={storeId:'far',time:'18:00'}, c={storeId:'unknown',time:'20:00'};
assert.equal(context.sortTodayEvents([b,c,a])[0],a);
options.sort='closing'; assert.equal(context.sortTodayEvents([a,c,b])[0],b);
assert.equal(context.sortTodayEvents([a,c,b])[2],c);
options.sort='time'; assert.equal(context.sortTodayEvents([a,b])[0],b);
options.radius='20'; assert.equal(context.todayMatchesControls(b),false);
assert.equal(context.todayMatchesControls(c),false);
assert.equal(context.todayMatchesControls(a),true);
options.radius=''; assert.equal(context.todayMatchesControls(c),true);
options.favorites=true; assert.equal(context.todayMatchesControls(a),false);
assert.equal(context.todayMatchesControls({...a,favorite:true}),true);
options.favorites=false;options.query='COMMANDER';
assert.equal(context.todayMatchesControls({...a,format:'Commander'}),true);
console.log('PASS Today controls: radius, unknown distance, favorites, search, nearest/start/closing sorts and overnight closing');
