window.INFETTI_READY.then(()=>{
const D=window.INFETTI_DATA,T=n=>D.teams.find(t=>t.name===n)||{name:n,short:'',logo:'assets/league-logo.png'},pages=[["home","Home"],["league","League"],["fixtures","Fixtures"],["results","Results"],["scorers","Top Scorers"],["awards","Match Awards"],["cup","Cup"],["supercup","Super Cup"],["teams","Teams"]];
function club(n,a=0){let t=T(n);return `<div class="club ${a?"away":""}">${a?n:""}<img class="badge" src="${t.logo}">${a?"":n}</div>`}function matches(a){return a.length?a.map(m=>`<div class="match">${club(m.home)}<div class="ko"><strong>${m.time}</strong><small>${m.date}</small></div>${club(m.away,1)}</div>`).join(""):`<div class="empty">No fixtures yet.</div>`}function scorerLines(a){return (a||[]).map(x=>`<span>⚽ ${x.player}${x.goals>1?` ×${x.goals}`:""}</span>`).join("")}
function resultClub(name,away=false){const t=T(name);return `<div class="resultClub ${away?"right":""}"><img src="${t.logo}" alt=""><strong>${name}</strong></div>`}
function results(a){return a.length?a.map(m=>`<article class="premiumResult">
  <div class="premiumMeta">
    <span>MATCHWEEK ${m.round||""}</span>
    <div class="bigDate">▣ ${m.date||"DATE TBC"} <b>|</b> ${m.time||"TBC"}</div>
    <small>INFETTI FOOTBALL GROUNDS • BIRKIRKARA</small>
  </div>
  <div class="premiumScore">
    ${resultClub(m.home)}
    <div class="scoreCore"><strong>${m.hg} <i>–</i> ${m.ag}</strong><small>FULL TIME</small></div>
    ${resultClub(m.away,true)}
  </div>
  <div class="premiumGoals">
    <div>${scorerLines(m.homeScorers)||'<span class="muted">No scorers entered</span>'}</div>
    <div>${scorerLines(m.awayScorers)||'<span class="muted">No scorers entered</span>'}</div>
  </div>
  <div class="premiumAwards">
    <div class="awardBox"><span>⭐ PLAYER OF THE GAME</span>${m.potg?`<strong>${m.potg.player}</strong><small>${m.potg.team}</small>`:'<strong>TBC</strong>'}</div>
    <div class="awardBox"><span>🧤 KEEPER OF THE GAME</span>${m.kotg?`<strong>${m.kotg.player}</strong><small>${m.kotg.team}</small>`:'<strong>TBC</strong>'}</div>
  </div>
</article>`).join(""):`<div class="empty">No results yet.<br>Scores will appear after the first matchday.</div>`}
function table(){return `<table><thead><tr><th>POS</th><th>CLUB</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>PTS</th></tr></thead><tbody>${standings().map((x,i)=>`<tr><td class="rank">${i+1}</td><td><div class="teamcell"><img src="${T(x.n).logo}">${x.n}</div></td><td>${x.p}</td><td>${x.w}</td><td>${x.d}</td><td>${x.l}</td><td>${x.gf}</td><td>${x.ga}</td><td>${x.gf-x.ga}</td><td class="pts">${x.pts}</td></tr>`).join("")}</tbody></table>`}
function leaders(a,label){return a.length?`<table><thead><tr><th>#</th><th>PLAYER</th><th>TEAM</th><th>${label}</th></tr></thead><tbody>${a.map((x,i)=>`<tr><td>${i+1}</td><td>${x.player}</td><td>${x.team}</td><td class="pts">${x.total}</td></tr>`).join("")}</tbody></table>`:`<div class="empty">No statistics yet.</div>`}
let nav=document.querySelector("#nav");pages.forEach(([id,l],i)=>{let b=document.createElement("button");b.textContent=l;b.className=i?"":"active";b.onclick=()=>{document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));document.querySelectorAll("#nav button").forEach(x=>x.classList.remove("active"));document.querySelector("#"+id).classList.add("active");b.classList.add("active");scrollTo({top:720,behavior:"smooth"})};nav.appendChild(b)});
next.innerHTML=matches(D.fixtures.filter(x=>x.round===1));latest.innerHTML=results(D.results.slice(-5).reverse());tableHome.innerHTML=tableLeague.innerHTML=table();scoreHome.innerHTML=leaders(D.leagueScorers,"GOALS");potgHome.innerHTML=leaders(D.potg,"AWARDS");kotgHome.innerHTML=leaders(D.kotg,"AWARDS");leagueScores.innerHTML=leaders(D.leagueScorers,"GOALS");cupScores.innerHTML=leaders(D.cupScorers,"GOALS");potg.innerHTML=leaders(D.potg,"AWARDS");kotg.innerHTML=leaders(D.kotg,"AWARDS");allResults.innerHTML=results(D.results);
teamStrip.innerHTML=D.teams.map(t=>`<div><img src="${t.logo}"><span>${t.short}</span></div>`).join("");teamsGrid.innerHTML=D.teams.map(t=>`<div class="teamcard"><img src="${t.logo}"><h3>${t.name}</h3><small>${t.short}</small></div>`).join("");
let fr="";for(let r=1;r<=18;r++)fr+=`<div class="round"><div class="roundtitle">MATCHWEEK ${r}</div><article class="panel">${matches(D.fixtures.filter(x=>x.round===r))}</article></div>`;fixtureRounds.innerHTML=fr;
}).catch(err=>{
 console.error(err);
 document.body.insertAdjacentHTML("afterbegin",'<div style="position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;background:#6d1b1b;color:#fff;padding:12px 16px;border-radius:8px;font:600 14px Arial">Live Google Sheet data could not be loaded. Confirm the sheet is shared as Anyone with the link — Viewer and keep the original tab/header names.</div>');
});
