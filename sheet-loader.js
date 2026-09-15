const INFETTI_SHEET_ID="1XnHtR1UOjUEn-tcNz4XpzlY5PZCnaHkSPYnpy2ulY-g";

function csvParse(text){
  const rows=[]; let row=[], field="", q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i], n=text[i+1];
    if(c=='"' && q && n=='"'){field+='"';i++}
    else if(c=='"'){q=!q}
    else if(c==',' && !q){row.push(field);field=""}
    else if((c=='\n'||c=='\r') && !q){
      if(c=='\r'&&n=='\n') i++;
      row.push(field); field="";
      if(row.some(x=>x!=="")) rows.push(row);
      row=[];
    } else field+=c;
  }
  if(field||row.length){row.push(field);rows.push(row)}
  if(!rows.length) return [];
  const h=rows[0].map(x=>x.trim());
  return rows.slice(1).map(r=>Object.fromEntries(h.map((k,i)=>[k,(r[i]??"").trim()])));
}
async function getTab(name){
  const u=`https://docs.google.com/spreadsheets/d/${INFETTI_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}&_=${Date.now()}`;
  const res=await fetch(u,{cache:"no-store"});
  if(!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return csvParse(await res.text());
}
function num(x){ const n=Number(x); return Number.isFinite(n)?n:null }
function fmtDate(x){
  if(!x) return "MONDAY • DATE TBC";
  const m=x.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if(m) return `MONDAY • ${m[1].padStart(2,"0")}/${m[2].padStart(2,"0")}/${m[3]}`;
  return `MONDAY • ${x}`;
}
function aggregate(rows, competition, playerKey="PLAYER", teamKey="TEAM", valueKey=null){
  const map=new Map();
  rows.filter(r=>(r["COMPETITION"]||"").toLowerCase()===competition.toLowerCase()).forEach(r=>{
    const player=r[playerKey], team=r[teamKey]; if(!player) return;
    const key=player+"|"+team, add=valueKey?(num(r[valueKey])||0):1;
    const old=map.get(key)||{player,team,total:0}; old.total+=add; map.set(key,old);
  });
  return [...map.values()].sort((a,b)=>b.total-a.total||a.player.localeCompare(b.player));
}
async function loadInfettiSheet(){
  const [teamsR,fixR,goalsR,awardsR,cupR,superR]=await Promise.all([
    getTab("TEAMS"),getTab("FIXTURES"),getTab("GOALS"),getTab("AWARDS"),getTab("CUP"),getTab("SUPER CUP")
  ]);
  const teams=teamsR.filter(r=>r["TEAM NAME"]).map(r=>({
    name:r["TEAM NAME"], short:r["TEAM ID"], logo:`assets/teams/${r["LOGO FILE"]||r["TEAM ID"].toLowerCase()+".png"}`
  }));
  const played=fixR.filter(r=>(r.STATUS||"").toLowerCase()==="played" && num(r["HOME SCORE"])!==null && num(r["AWAY SCORE"])!==null);
  const results=played.map(r=>({round:Number(r.MATCHWEEK),date:fmtDate(r.DATE),time:r.TIME||"TBC",home:r["HOME TEAM"],away:r["AWAY TEAM"],hg:num(r["HOME SCORE"]),ag:num(r["AWAY SCORE"])}));
  const fixtures=fixR.filter(r=>(r.STATUS||"").toLowerCase()!=="cancelled" && (r.STATUS||"").toLowerCase()!=="played").map(r=>({
    round:Number(r.MATCHWEEK),date:fmtDate(r.DATE),time:r.TIME||"TBC",home:r["HOME TEAM"],away:r["AWAY TEAM"]
  }));
  window.INFETTI_DATA={
    teams, fixtures, results,
    leagueScorers:aggregate(goalsR,"League","PLAYER","TEAM","GOALS"),
    cupScorers:aggregate(goalsR,"Cup","PLAYER","TEAM","GOALS"),
    potg:aggregate(awardsR,"League","POTG PLAYER","POTG TEAM"),
    kotg:aggregate(awardsR,"League","KOTG PLAYER","KOTG TEAM"),
    cup:cupR, superCup:superR
  };
}
window.INFETTI_READY=loadInfettiSheet();
