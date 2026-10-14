import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const context = vm.createContext({Date, formatTime: value => value,
  dateKey: date => [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-'),
  eventStartTime: e => e.startTime, parseDate: value => new Date(value),
  store: () => context.testPlace,
});
for (const name of ['dayKeyName', 'eventTimeIsEstimated', 'todayHoursInfo', 'todayAvailability']) {
  const start = code.indexOf(`function ${name}(`);
  assert.notEqual(start, -1);
  const end = code.indexOf('\nfunction ', start + 1);
  vm.runInContext(code.slice(start, end), context);
}
const now = new Date(2026, 9, 14, 14, 0);
const place = slots => ({hours:{status:'verified',weekly:{3:slots}}});
const info = slots => context.todayHoursInfo(place(slots), now);
assert.equal(info([{open:'12:00',close:'18:00'}]).remainingMinutes, 240);
assert.match(info([{open:'12:00',close:'18:00'}]).detail, /4h until close/);
assert.equal(info([{open:'12:00',close:'00:00'}]).remainingMinutes, 600);
assert.match(info([{open:'12:00',close:'00:00'}]).schedule, /midnight/);
assert.equal(info([{open:'12:00',close:'15:00'}]).remainingMinutes, 60);
assert.match(info([{open:'12:00',close:'15:00'}]).detail, /short visit window/);
assert.equal(info([{closed:true}]).isOpen, false);
assert.equal(info([{open:'18:00',close:'23:00'}]).isOpen, false);
assert.match(info([{open:'18:00',close:'23:00'}]).detail, /Opens 18:00.*closes 23:00/);
assert.equal(info([{open:'09:00',close:'12:00'},{open:'16:00',close:'22:00'}]).isOpen, false);
assert.match(info([{open:'09:00',close:'12:00'},{open:'16:00',close:'22:00'}]).detail, /Opens 16:00/);
for (const status of ['unknown','stale','variable']) {
  const uncertain = place([{open:'12:00',close:'23:00'}]); uncertain.hours.status = status;
  const result = context.todayHoursInfo(uncertain, now);
  assert.equal(result.verified, false); assert.equal(result.remainingMinutes, null);
}
const temporary = place([{open:'12:00',close:'23:00'}]);
temporary.hours.temporary = [{startDate:'2026-10-14',endDate:'2026-10-14',label:'Special hours today'}];
assert.equal(context.todayHoursInfo(temporary,now).verified, false);
const overnight = {hours:{status:'verified',weekly:{2:[{open:'16:00',close:'02:00'}],3:[{closed:true}]}}};
assert.equal(context.todayHoursInfo(overnight,new Date(2026,9,14,1,0)).remainingMinutes,60);
context.testPlace = place([{closed:true}]);
assert.equal(context.todayAvailability({title:'Casual Commander',startTime:'12:00',occurrenceDate:now},now).group,'earlier');
console.log('PASS Today hours: visit length, midnight, split hours, uncertainty, exceptions, overnight, closed drop-in');
