const INFETTI_SHEET_ID="1XnHtR1UOjUEn-tcNz4XpzlY5PZCnaHkSPYnpy2ulY-g";
function csvParse(text){
  const rows=[]; let row=[],f="",q=false;
  for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];
    if(c=='"'&&q&&n=='"'){f+='"';i++;}
    else if(c=='"')q=!q;
    else if(c==','&&!q){row.push(f);f="";}
    else if((c=='\n'||c=='\r')&&!q){if(c=='\r'&&n=='\n')i++;row.push(f);f="";if(row.some(v=>v!==""))rows.push(row);row=[];}
    else f+=c;
  }
  if(f||row.length){row.push(f);rows.push(row);}
  if(!rows.length)return [];
  const h=rows[0].map(x=>x.trim());
  return rows.slice(1).map(r=>Object.fromEntries(h.map((k,i)=>[k,(r[i]??"").trim()])));
}
async function tab(name){
  const u=`https://docs.google.com/spreadsheets/d/${INFETTI_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}&_=${Date.now()}`;
  const r=await fetch(u,{cache:"no-store"});
  if(!r.ok)throw new Error(name+" "+r.status);
  return csvParse(await r.text());
}
const N=x=>{if(x===null||x===undefined||String(x).trim()==="")return null;const n=Number(x);return Number.isFinite(n)?n:null;};
function cleanDate(x){
 if(!x) return "DATE TBC";
 const s=String(x).trim();
 // Google CSV may return M/D/YYYY or "September 21, 2026"
 let d=new Date(s);
 if(!isNaN(d)){
   return d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}).toUpperCase();
 }
 return s;
}
function cleanTime(x){
 if(!x || String(x).trim().toUpperCase()==="TBC") return "TBC";
 const s=String(x).trim();
 // Normalize 20:00, 20:00:00, 8:00 PM etc.
 const m=s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
 if(m) return m[1].padStart(2,"0")+":"+m[2];
 const d=new Date("1970-01-01 "+s);
 if(!isNaN(d)) return d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",hour12:false});
 return s;
}
const date=x=>cleanDate(x);
function agg(rows,comp,pk,tk,vk){
 const m=new Map();
 rows.forEach(r=>{if((r.COMPETITION||"").toLowerCase()!==comp.toLowerCase())return;
 const p=r[pk],t=r[tk];if(!p)return;const k=p+"|"+t,o=m.get(k)||{player:p,team:t,total:0};
 o.total+=vk?(N(r[vk])||0):1;m.set(k,o);});
 return [...m.values()].sort((a,b)=>b.total-a.total||a.player.localeCompare(b.player));
}
window.INFETTI_READY=(async()=>{
 const [tr,fr,gr,ar,cr,sr]=await Promise.all([tab("TEAMS"),tab("FIXTURES"),tab("GOALS"),tab("AWARDS"),tab("CUP"),tab("SUPER CUP")]);
 const teams=tr.filter(r=>r["TEAM NAME"]).map(r=>({name:r["TEAM NAME"],short:r["TEAM ID"],logo:"assets/teams/"+(r["LOGO FILE"]||r["TEAM ID"].toLowerCase()+".png")}));
 const valid=fr.filter(r=>r["HOME TEAM"]&&r["AWAY TEAM"]);
 const results=valid.filter(r=>(r.STATUS||"").toLowerCase()==="played"&&N(r["HOME SCORE"])!==null&&N(r["AWAY SCORE"])!==null)
 .map(r=>({matchId:r["MATCH ID"],round:N(r.MATCHWEEK),date:date(r.DATE),time:cleanTime(r.TIME),home:r["HOME TEAM"],away:r["AWAY TEAM"],hg:N(r["HOME SCORE"]),ag:N(r["AWAY SCORE"])}));
 const fixtures=valid.filter(r=>!["played","cancelled"].includes((r.STATUS||"").toLowerCase()))
 .map(r=>({round:N(r.MATCHWEEK),date:date(r.DATE),time:cleanTime(r.TIME),home:r["HOME TEAM"],away:r["AWAY TEAM"]}));
 const leagueGoalRows=gr.filter(r=>(r.COMPETITION||"").toLowerCase()==="league"&&r["MATCH ID"]&&r.PLAYER);
 results.forEach(m=>{
   const norm=x=>String(x||"").trim().toUpperCase(); const rows=leagueGoalRows.filter(r=>norm(r["MATCH ID"])===norm(m.matchId));
   const side=team=>rows.filter(r=>norm(r.TEAM)===norm(team)).map(r=>({player:r.PLAYER,goals:N(r.GOALS)||1}));
   m.homeScorers=side(m.home); m.awayScorers=side(m.away);
   const award=ar.find(a=>norm(a["MATCH ID"])===norm(m.matchId) && (a.COMPETITION||"").toLowerCase()==="league");
   m.potg=award&&award["POTG PLAYER"] ? {player:award["POTG PLAYER"],team:award["POTG TEAM"]||""} : null;
   m.kotg=award&&award["KOTG PLAYER"] ? {player:award["KOTG PLAYER"],team:award["KOTG TEAM"]||""} : null;
 });
 const cup=cr.filter(r=>r["HOME TEAM"]||r["AWAY TEAM"]).map(r=>({
   matchId:r["MATCH ID"]||"", round:(r.ROUND||"").trim(), date:cleanDate(r.DATE), time:cleanTime(r.TIME),
   home:r["HOME TEAM"]||"TBC", away:r["AWAY TEAM"]||"TBC",
   hg:N(r["HOME SCORE"]), ag:N(r["AWAY SCORE"]), status:(r.STATUS||"Scheduled").trim()
 }));
 window.INFETTI_DATA={teams,fixtures,results,leagueScorers:agg(gr,"League","PLAYER","TEAM","GOALS"),cupScorers:agg(gr,"Cup","PLAYER","TEAM","GOALS"),potg:agg(ar,"League","POTG PLAYER","POTG TEAM"),kotg:agg(ar,"League","KOTG PLAYER","KOTG TEAM"),cup,superCup:sr};
})();
