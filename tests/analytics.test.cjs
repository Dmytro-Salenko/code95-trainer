const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../analytics.js'), 'utf8');
function boot({store = new Map(), query = '', host = 'driver95.eu', day = '2026-11-07T12:00:00'} = {}) {
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [day])); } }
  const storage = {getItem: k => store.get(k) ?? null, setItem: (k,v) => store.set(k,String(v)), removeItem:k=>store.delete(k)};
  const w = {location:{search:query,hostname:host}};
  vm.runInNewContext(source,{window:w, localStorage:storage,sessionStorage:{getItem:()=>null}, Date:Clock, URLSearchParams, navigator:{userAgent:'desktop'}, crypto:{randomUUID:()=> 'anonymous-test-id'}, document:{createElement:()=>({}),head:{appendChild(){}}},console,setTimeout});
  return {api:w.Analytics, store, events:()=>(w.dataLayer || []).filter(x=>x[0]==='event').map(x=>({name:x[1],p:x[2]}))};
}
const attempt = {session_id:'attempt-1',mode:'exam',language:'uk',total_questions:40,correct:32,incorrect:8,percent:80,duration_sec:100};
test('one start and one terminal outcome; custom language, threshold and registered duration',()=>{
  const b=boot(); b.api.testStarted(attempt);b.api.testStarted(attempt);b.api.testFinished(attempt);b.api.testFinished(attempt);b.api.testAbandoned(attempt);
  assert.equal(b.events().filter(x=>x.name==='test_started').length,1);
  const ends=b.events().filter(x=>x.name==='test_finished');assert.equal(ends.length,1);
  assert.equal(ends[0].p.app_language,'uk');assert.equal(ends[0].p.language,undefined);
  assert.equal(ends[0].p.session_id,undefined);assert.equal(ends[0].p.test_result,'passed');assert.equal(ends[0].p.duration_seconds,100);
  assert.equal(b.events().filter(x=>x.name==='test_abandoned').length,0);
});
test('abandonment excludes later completion and carries reason',()=>{
 const b=boot();b.api.testStarted(attempt);b.api.testAbandoned({...attempt,reason:'page_exit'});b.api.testFinished(attempt);
 assert.equal(b.events().find(x=>x.name==='test_abandoned').p.exit_reason,'page_exit');assert.equal(b.events().filter(x=>x.name==='test_finished').length,0);
});
test('repeat practice days and multiple exams persist; outside rolling 30 days expires',()=>{
 const b=boot();b.api.testStarted(attempt);b.api.testFinished(attempt);
 const c=boot({store:b.store,day:'2026-11-08T12:00:00'});c.api.testStarted({...attempt,session_id:'attempt-2'});c.api.testFinished({...attempt,session_id:'attempt-2',correct:31});
 const p=c.events().find(x=>x.name==='test_finished').p;assert.equal(p.practice_frequency,'multiple_days_30d');assert.equal(p.exam_completion_frequency,'multiple');assert.equal(p.test_result,'failed');
 const d=boot({store:b.store,day:'2026-12-10T12:00:00'});d.api.testStarted(attempt);assert.equal(d.events().find(x=>x.name==='test_started').p.practice_frequency,'one_day_30d');
});
test('explicit staff opt-in persists, marks all events, can be disabled; local QA automatic',()=>{
 const b=boot({query:'?analytics_test=1'});b.api.testStarted(attempt);assert.equal(b.events().length,0);const local=JSON.parse(b.store.get('driver95_analytics_events'));assert.equal(local[0].traffic_type,'internal');assert.equal(b.store.has('driver95_practice_days'),false);
 const c=boot({store:b.store});assert.equal(c.api.isTestTraffic,true);
 const d=boot({store:b.store,query:'?analytics_test=0'});assert.equal(d.api.isTestTraffic,false);
 assert.equal(boot({host:'localhost'}).api.isTestTraffic,true);
});
test('synthetic smoke tests cannot pollute ordinary traffic',()=>{
 const b=boot();b.api.smokeTest();assert.equal(b.events().length,0);
});
test('learning completion emits analytics before clearing the session and preserves menu flow',()=>{
 const app=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
 const finish=app.slice(app.indexOf('function finishSessionAnalytics(){'),app.indexOf('function showResult(){'));
 const next=app.slice(app.indexOf('function nextQuestion(){'),app.indexOf("['de', 'en'",app.indexOf('function nextQuestion(){')));
 const calls=[];const ctx={session:{mode:'learn',list:[{id:1}],initialTotal:1,index:0,good:1,bad:0,sessionId:'learn-1',startTime:Date.now()},lang:'uk',QUESTIONS:[{}],Date,Math,Analytics:{testFinished:p=>calls.push(p),maybeTrackDailyProgress(){}},getProgress:()=>({1:{lastResult:'correct'}}),showToast(){},t:k=>k,show:s=>calls.push(s),updateHome(){},updateActiveTab(){},updateFavoritesBadge(){},renderQuestion(){throw Error('Should finish');}};
 vm.runInNewContext(finish+next+'nextQuestion();',ctx);
 assert.equal(calls[0].total_questions,1);assert.equal(calls[0].correct,1);assert.equal(calls[1],'mainMenu');assert.equal(ctx.session,null);
});
