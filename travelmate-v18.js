
(function(){
  const ROOT="travelmate_v18";
  const trip=()=>window.getTripSettings?window.getTripSettings():{id:"default",start:""};
  const key=s=>`${ROOT}_${trip().id}_${s}`;
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const uid=p=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  const load=(s,d=[])=>{try{return JSON.parse(localStorage.getItem(key(s))||JSON.stringify(d))}catch{return d}};
  const save=(s,v)=>localStorage.setItem(key(s),JSON.stringify(v));
  const schedule=()=>load("schedule",[]);
  const packing=()=>load("packing",[]);
  const expenses=()=>{try{return JSON.parse(localStorage.getItem(`${ROOT}_${trip().id}_expenses`)||localStorage.getItem(`travelmate_v17_${trip().id}_expenses`)||"[]")}catch{return[]}};

  function renderFilter(){
    const e=document.getElementById("v18ScheduleFilter");if(!e)return;
    const cur=e.value,ds=[...new Set(schedule().map(x=>x.date).filter(Boolean))].sort();
    e.innerHTML='<option value="all">전체 날짜</option>'+ds.map(d=>`<option value="${d}">${d}</option>`).join("");
    e.value=ds.includes(cur)?cur:"all";
  }
  function renderSchedule(){
    renderFilter();
    const f=document.getElementById("v18ScheduleFilter")?.value||"all";
    let list=schedule().sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
    if(f!=="all")list=list.filter(x=>x.date===f);
    const box=document.getElementById("v18ScheduleList");if(!box)return;
    box.innerHTML=list.length?list.map(x=>`<div class="v18-schedule-item"><div><div class="v18-schedule-time">${esc(x.start||"시간 미정")}${x.end?"~"+esc(x.end):""}</div><small>${esc(x.date||"")} · ${x.zone==="korea"?"한국시간":"현지시간"}</small></div><div><b>${esc(x.title)}</b><div>${esc(x.place||"")}</div><small>${esc(x.note||"")}</small></div><div class="v18-schedule-actions"><button class="secondary" data-v18-edit="${x.id}">수정</button><button class="secondary danger" data-v18-del="${x.id}">삭제</button>${x.map?`<a class="secondary" href="${esc(x.map)}" target="_blank">지도</a>`:""}</div></div>`).join(""):'<div class="v18-empty">현재 여행에 등록된 일정이 없습니다.</div>';
    box.querySelectorAll("[data-v18-edit]").forEach(b=>b.onclick=()=>openEditor(b.dataset.v18Edit));
    box.querySelectorAll("[data-v18-del]").forEach(b=>b.onclick=()=>{if(confirm("삭제할까요?")){save("schedule",schedule().filter(x=>x.id!==b.dataset.v18Del));renderAll()}});
    summary();
  }
  function openEditor(id=""){
    const x=id?schedule().find(v=>v.id===id):{id:"",date:trip().start||"",start:"09:00",end:"",zone:"local",title:"",place:"",map:"",category:"기타",note:""};
    v18ScheduleId.value=x.id||"";v18Date.value=x.date||"";v18Start.value=x.start||"";v18End.value=x.end||"";v18Zone.value=x.zone||"local";v18Title.value=x.title||"";v18Place.value=x.place||"";v18Map.value=x.map||"";v18Category.value=x.category||"기타";v18Note.value=x.note||"";
    v18ScheduleEditorTitle.textContent=id?"일정 수정":"일정 추가";v18ScheduleEditor.classList.remove("hidden");v18ScheduleEditor.scrollIntoView({behavior:"smooth"});
  }
  const closeEditor=()=>v18ScheduleEditor.classList.add("hidden");
  function storeSchedule(){
    const x={id:v18ScheduleId.value||uid("schedule"),date:v18Date.value,start:v18Start.value,end:v18End.value,zone:v18Zone.value,title:v18Title.value.trim(),place:v18Place.value.trim(),map:v18Map.value.trim(),category:v18Category.value,note:v18Note.value.trim()};
    if(!x.date||!x.title)return alert("날짜와 일정명을 입력하세요.");
    const list=schedule(),i=list.findIndex(v=>v.id===x.id);if(i>=0)list[i]=x;else list.push(x);
    save("schedule",list);closeEditor();renderAll();alert("일정을 저장했습니다.");
  }
  function renderPacking(){
    const list=packing(),box=document.getElementById("v18PackingList");if(!box)return;
    box.innerHTML=list.length?list.map((x,i)=>`<div class="v18-pack-row ${x.done?"done":""}"><input type="checkbox" ${x.done?"checked":""} data-check="${i}"><span>${esc(x.text)}</span><button class="secondary" data-pack-del="${i}">삭제</button></div>`).join(""):'<div class="v18-empty">준비물을 추가해 보세요.</div>';
    box.querySelectorAll("[data-check]").forEach(e=>e.onchange=()=>{const v=packing();v[+e.dataset.check].done=e.checked;save("packing",v);renderAll()});
    box.querySelectorAll("[data-pack-del]").forEach(e=>e.onclick=()=>{const v=packing();v.splice(+e.dataset.packDel,1);save("packing",v);renderAll()});
  }
  function summary(){
    v18ScheduleCount&&(v18ScheduleCount.textContent=schedule().length);
    const fs=["passport","insurance","flight","hotel","rental","voucher","emergencyContact"];
    v18WalletCount&&(v18WalletCount.textContent=fs.filter(f=>localStorage.getItem(`${ROOT}_${trip().id}_${f}`)||localStorage.getItem(`travelmate_v17_${trip().id}_${f}`)).length);
    v18PackingCount&&(v18PackingCount.textContent=packing().length);
    v18ExpenseCount&&(v18ExpenseCount.textContent=expenses().length);
  }
  function notes(){v18ProjectNotes&&(v18ProjectNotes.value=localStorage.getItem(key("notes"))||"")}
  function renderAll(){renderSchedule();renderPacking();summary();notes()}

  v18AddSchedule?.addEventListener("click",()=>openEditor());
  v18CloseSchedule?.addEventListener("click",closeEditor);
  v18SaveSchedule?.addEventListener("click",storeSchedule);
  v18ScheduleFilter?.addEventListener("change",renderSchedule);
  v18ShowAll?.addEventListener("click",()=>{v18ScheduleFilter.value="all";renderSchedule()});
  v18SaveNotes?.addEventListener("click",()=>{localStorage.setItem(key("notes"),v18ProjectNotes.value);alert("메모를 저장했습니다.")});
  v18AddPacking?.addEventListener("click",()=>{const text=prompt("준비물을 입력하세요.");if(text){const v=packing();v.push({text,done:false});save("packing",v);renderAll()}});
  quickTripSwitcher?.addEventListener("change",()=>setTimeout(renderAll,0));
  document.addEventListener("click",e=>{if(e.target.matches('[data-action="switch"]'))setTimeout(renderAll,0)});
  window.addEventListener("pageshow",renderAll);
  renderAll();
})();
