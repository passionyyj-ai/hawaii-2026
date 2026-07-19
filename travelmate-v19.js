
(function(){
  const ROOT="travelmate_v19";
  const LANG={
    "France":{code:"fr",speech:"fr-FR",label:"프랑스어",fallback:"영어"},
    "Japan":{code:"ja",speech:"ja-JP",label:"일본어",fallback:"영어"},
    "Spain":{code:"es",speech:"es-ES",label:"스페인어",fallback:"영어"},
    "Italy":{code:"it",speech:"it-IT",label:"이탈리아어",fallback:"영어"},
    "Germany":{code:"de",speech:"de-DE",label:"독일어",fallback:"영어"},
    "China":{code:"zh",speech:"zh-CN",label:"중국어",fallback:"영어"},
    "Thailand":{code:"th",speech:"th-TH",label:"태국어",fallback:"영어"},
    "Vietnam":{code:"vi",speech:"vi-VN",label:"베트남어",fallback:"영어"},
    "United Kingdom":{code:"en",speech:"en-GB",label:"영어",fallback:""},
    "United States":{code:"en",speech:"en-US",label:"영어",fallback:""}
  };
  const DEFAULT_LANG={code:"en",speech:"en-US",label:"영어",fallback:""};
  window.getTargetLanguage=function(){
    const t=window.getTripSettings?.()||{};
    return LANG[t.country]||DEFAULT_LANG;
  };

  const trip=()=>window.getTripSettings?.()||{id:"default",name:"새 여행",city:"",country:"",timezone:"UTC",currency:"USD",start:""};
  const key=s=>`${ROOT}_${trip().id}_${s}`;
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const uid=p=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  const load=(s,d=[])=>{try{return JSON.parse(localStorage.getItem(key(s))||JSON.stringify(d))}catch{return d}};
  const save=(s,v)=>localStorage.setItem(key(s),JSON.stringify(v));

  function isHawaii(){
    const t=trip();
    return t.id==="trip-hawaii-2026" || /honolulu|hawaii|하와이/i.test(`${t.city} ${t.name}`);
  }

  function updateClockContext(){
    const t=trip();
    document.getElementById("v19LocalCity")?.replaceChildren(document.createTextNode(t.city||"Local"));
    document.getElementById("v19LocalTimezone")?.replaceChildren(document.createTextNode(t.timezone||"UTC"));
    const worldSmall=document.querySelector(".time-zone-card .section-title small");
    if(worldSmall)worldSmall.textContent=`${t.city||"여행지"} 현지시간과 한국시간을 동시에 표시합니다.`;
  }

  function updateLanguageUI(){
    const l=getTargetLanguage();
    const text=l.fallback?`${l.label} + ${l.fallback}`:l.label;
    const englishH=document.querySelector("#englishPage h2");
    const interpH=document.querySelector("#interpreterPage h2");
    if(englishH)englishH.innerHTML=`🗣 현지 회화 <span class="v19-language-badge">${text}</span>`;
    if(interpH)interpH.innerHTML=`🎙 양방향 통역 <span class="v19-language-badge">${text}</span>`;
  }

  // Generic schedule for non-Hawaii trips. Hawaii keeps the original complete v17 UI untouched.
  const schedule=()=>load("schedule",[]);
  function renderFilter(){
    const e=document.getElementById("v19DateFilter"); if(!e)return;
    const cur=e.value, ds=[...new Set(schedule().map(x=>x.date).filter(Boolean))].sort();
    e.innerHTML='<option value="all">전체 날짜</option>'+ds.map(d=>`<option value="${d}">${d}</option>`).join("");
    e.value=ds.includes(cur)?cur:"all";
  }
  function renderSchedule(){
    const generic=document.getElementById("v19GenericScheduleCard");
    const editor=document.getElementById("v19ScheduleEditor");
    const legacy=document.querySelectorAll("#schedulePage > .card:not(#v19GenericScheduleCard):not(#v19ScheduleEditor), #schedulePage > .day-panel");
    if(isHawaii()){
      generic?.classList.add("hidden");editor?.classList.add("hidden");
      legacy.forEach(x=>x.classList.remove("v19-force-hidden"));
      return;
    }
    legacy.forEach(x=>x.classList.add("v19-force-hidden"));
    generic?.classList.remove("hidden");
    if(document.getElementById("v19ScheduleTripName"))v19ScheduleTripName.textContent=`${trip().name} · ${trip().city}`;
    renderFilter();
    const filter=document.getElementById("v19DateFilter")?.value||"all";
    let list=[...schedule()].sort((a,b)=>`${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
    if(filter!=="all")list=list.filter(x=>x.date===filter);
    const box=document.getElementById("v19ScheduleList");if(!box)return;
    box.innerHTML=list.length?list.map(x=>`
      <article class="v19-schedule-item">
        <div><div class="v19-time">${esc(x.start||"시간 미정")}${x.end?"~"+esc(x.end):""}</div><small>${esc(x.date||"")} · ${x.zone==="korea"?"한국시간":"현지시간"}</small></div>
        <div><b>${esc(x.title)}</b><div>${esc(x.place||"")}</div><small>${esc(x.note||"")}</small></div>
        <div class="v19-actions"><button class="btn secondary" data-v19-edit="${x.id}">수정</button><button class="btn secondary danger" data-v19-del="${x.id}">삭제</button>${x.map?`<a class="btn secondary" href="${esc(x.map)}" target="_blank">지도</a>`:""}</div>
      </article>`).join(""):'<div class="v19-empty">등록된 일정이 없습니다. 직접 추가하거나 엑셀/CSV를 업로드하세요.</div>';
    box.querySelectorAll("[data-v19-edit]").forEach(b=>b.onclick=()=>openEditor(b.dataset.v19Edit));
    box.querySelectorAll("[data-v19-del]").forEach(b=>b.onclick=()=>{if(confirm("이 일정을 삭제할까요?")){save("schedule",schedule().filter(x=>x.id!==b.dataset.v19Del));renderSchedule();refreshNext()}});
  }
  const hideStyle=document.createElement("style");
  hideStyle.textContent=".v19-force-hidden{display:none!important}";
  document.head.appendChild(hideStyle);

  function openEditor(id=""){
    const x=id?schedule().find(v=>v.id===id):{id:"",date:trip().start||"",start:"09:00",end:"",zone:"local",title:"",place:"",map:"",category:"기타",note:""};
    v19ScheduleId.value=x.id||"";v19Date.value=x.date||"";v19Start.value=x.start||"";v19End.value=x.end||"";v19Zone.value=x.zone||"local";v19Title.value=x.title||"";v19Place.value=x.place||"";v19Map.value=x.map||"";v19Category.value=x.category||"기타";v19Note.value=x.note||"";
    v19EditorTitle.textContent=id?"일정 수정":"일정 추가";v19ScheduleEditor.classList.remove("hidden");v19ScheduleEditor.scrollIntoView({behavior:"smooth"});
  }
  function closeEditor(){v19ScheduleEditor.classList.add("hidden")}
  function storeSchedule(){
    const x={id:v19ScheduleId.value||uid("schedule"),date:v19Date.value,start:v19Start.value,end:v19End.value,zone:v19Zone.value,title:v19Title.value.trim(),place:v19Place.value.trim(),map:v19Map.value.trim(),category:v19Category.value,note:v19Note.value.trim()};
    if(!x.date||!x.title)return alert("날짜와 일정명을 입력하세요.");
    const v=schedule(),i=v.findIndex(a=>a.id===x.id);if(i>=0)v[i]=x;else v.push(x);
    save("schedule",v);closeEditor();renderSchedule();refreshNext();alert("현재 여행에 일정을 저장했습니다.");
  }

  function normalizeRow(row){
    const pick=(...keys)=>{for(const k of keys){if(row[k]!==undefined&&row[k]!=="")return String(row[k]).trim()}return ""};
    const zone=pick("시간대","Zone","zone");
    return {id:uid("import"),date:pick("날짜","Date","date"),start:pick("시작시간","시작","Start","start"),end:pick("종료시간","종료","End","end"),title:pick("일정명","일정","제목","Title","title"),place:pick("장소","Place","place"),note:pick("메모","비고","Note","note"),map:pick("지도링크","지도","Map","map"),category:pick("분류","Category","category")||"기타",zone:/한국|korea/i.test(zone)?"korea":"local"};
  }

  function reservationFields(){return [...document.querySelectorAll("#reservationPage [data-save]")]}
  function loadReservations(){
    const t=trip(),context=document.getElementById("v19ReservationContext");
    if(context)context.textContent=`${t.name} · ${t.city} · ${t.currency}`;
    const rental=document.querySelector("#reservationPage .rental-highlight");
    if(rental)rental.style.display=isHawaii()?"":"none";
    reservationFields().forEach(e=>{
      const v=localStorage.getItem(key("reservation_"+e.dataset.save));
      if(v!==null)e.value=v;
      else if(!isHawaii())e.value="";
    });
  }
  function saveReservations(){
    reservationFields().forEach(e=>localStorage.setItem(key("reservation_"+e.dataset.save),e.value));
    alert("현재 여행의 예약정보를 저장했습니다.");
  }

  function updateTools(){
    const t=trip();
    const usdLabel=document.querySelector('label[for="usdInput"]');
    const currencySpan=document.querySelector('#toolsPage label.field span');
    if(currencySpan&&currencySpan.textContent.includes("달러"))currencySpan.textContent=`현지통화(${t.currency})`;
    const rate=document.getElementById("rateInput");
    if(rate && !rate.dataset.v19Initialized){rate.value=t.currency==="EUR"?"1550":t.currency==="JPY"?"9.3":t.currency==="USD"?"1400":rate.value;rate.dataset.v19Initialized="1";}
    document.querySelectorAll('#homePage a[href*="Honolulu"]').forEach(a=>{
      const q=a.textContent.includes("일몰")?`${t.city} sunset time`:`${t.city} weather`;
      a.href="https://www.google.com/search?q="+encodeURIComponent(q);
      a.textContent=a.textContent.includes("일몰")?"일몰 시간":`${t.city} 날씨`;
    });
  }

  function refreshNext(){
    if(isHawaii())return;
    const now=new Date();
    const items=schedule().map(x=>({...x,instant:toInstant(x)})).filter(x=>x.instant&&x.instant>now).sort((a,b)=>a.instant-b.instant);
    const n=items[0];if(!n)return;
    const minutes=Math.floor((n.instant-now)/60000),days=Math.floor(minutes/1440),hours=Math.floor((minutes%1440)/60),mins=minutes%60;
    if(window.nextTime)nextTime.textContent=n.start+(n.end?"~"+n.end:"");
    if(window.nextPlace)nextPlace.textContent=n.title;
    if(window.nextTimeZone)nextTimeZone.textContent=n.zone==="korea"?"한국시간(KST)":`${trip().city} 현지시간`;
    if(window.countdownText)countdownText.textContent=days?`${days}일 ${hours}시간 ${mins}분 남음`:hours?`${hours}시간 ${mins}분 남음`:`${mins}분 남음`;
    if(window.nextActionTitle)nextActionTitle.textContent=n.title;
    if(window.nextActionNote)nextActionNote.textContent=n.note||n.place||"";
  }
  function toInstant(x){
    if(!x.date||!x.start)return null;
    const [y,m,d]=x.date.split("-").map(Number),[hh,mm]=x.start.split(":").map(Number);
    const offset=x.zone==="korea"?-9:timezoneOffsetHours(trip().timezone,new Date(Date.UTC(y,m-1,d,hh,mm)));
    return new Date(Date.UTC(y,m-1,d,hh-offset,mm));
  }
  function timezoneOffsetHours(tz,date){
    try{
      const parts=new Intl.DateTimeFormat("en-US",{timeZone:tz,timeZoneName:"longOffset",hour:"2-digit"}).formatToParts(date);
      const name=parts.find(p=>p.type==="timeZoneName")?.value||"GMT+00:00";
      const m=name.match(/GMT([+-])(\d{2}):(\d{2})/);if(!m)return 0;
      const v=Number(m[2])+Number(m[3])/60;return m[1]==="-"?-v:v;
    }catch{return 0}
  }

  let installPrompt=null;
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e});
  async function install(){
    if(!installPrompt){v19InstallStatus.textContent="브라우저 메뉴에서 ‘홈 화면에 추가’ 또는 ‘앱 설치’를 선택하세요.";return}
    installPrompt.prompt();const r=await installPrompt.userChoice;v19InstallStatus.textContent=r.outcome==="accepted"?"설치를 시작했습니다.":"설치가 취소되었습니다.";installPrompt=null;
  }

  function refreshAll(){
    updateClockContext();updateLanguageUI();renderSchedule();loadReservations();updateTools();refreshNext();
  }

  document.getElementById("v19AddSchedule")?.addEventListener("click",()=>openEditor());
  document.getElementById("v19CloseEditor")?.addEventListener("click",closeEditor);
  document.getElementById("v19SaveSchedule")?.addEventListener("click",storeSchedule);
  document.getElementById("v19DateFilter")?.addEventListener("change",renderSchedule);
  document.getElementById("v19ShowAll")?.addEventListener("click",()=>{v19DateFilter.value="all";renderSchedule()});
  document.getElementById("v19SaveReservations")?.addEventListener("click",saveReservations);
  document.getElementById("v19InstallBtn")?.addEventListener("click",install);
  document.getElementById("v19TemplateBtn")?.addEventListener("click",()=>{
    const csv="\ufeff날짜,시작시간,종료시간,시간대,일정명,장소,분류,메모,지도링크\n2027-05-01,09:00,11:00,현지시간,루브르 박물관,Louvre Museum,관광,예약시간 확인,https://maps.google.com/";
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="TravelMate_일정_샘플.csv";a.click();URL.revokeObjectURL(a.href);
  });
  document.getElementById("v19ImportFile")?.addEventListener("change",async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{
      const wb=XLSX.read(await file.arrayBuffer(),{type:"array"}),ws=wb.Sheets[wb.SheetNames[0]],rows=XLSX.utils.sheet_to_json(ws,{defval:""});
      const items=rows.map(normalizeRow).filter(x=>x.date&&x.title);
      if(!items.length)return alert("날짜와 일정명 컬럼을 확인하세요.");
      save("schedule",[...schedule(),...items]);renderSchedule();refreshNext();alert(`${items.length}개 일정을 등록했습니다.`);
    }catch(err){alert("파일을 읽지 못했습니다: "+err.message)}
    e.target.value="";
  });

  document.getElementById("quickTripSwitcher")?.addEventListener("change",()=>setTimeout(refreshAll,80));
  document.addEventListener("click",e=>{if(e.target.matches('[data-action="switch"]'))setTimeout(refreshAll,80)});
  window.addEventListener("pageshow",refreshAll);
  setInterval(refreshNext,30000);
  refreshAll();
})();
