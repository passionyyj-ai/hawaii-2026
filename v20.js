(function(){
  const CFG='travelmate_v19_cloud_config';
  const DB='travelmate_v18_data';
  const FILES='files';
  const DETAILS='details';
  const STATE='travelmate_v19_schedule_changes';

  const getCfg=()=>{try{return JSON.parse(localStorage.getItem(CFG)||'{}')}catch{return {}}};
  const setCfg=c=>localStorage.setItem(CFG,JSON.stringify(c));
  const cleanCode=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12);
  const makeCode=()=>{const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let out='';crypto.getRandomValues(new Uint8Array(8)).forEach(n=>out+=chars[n%chars.length]);return out.slice(0,4)+'-'+out.slice(4,8)};

  function cloudDefaults(){
    const c=getCfg(), h=window.HAWAII_CONFIG||{};
    return {
      url:c.url||h.cloudProjectUrl||'',
      anonKey:c.anonKey||h.cloudAnonKey||h.supabaseAnonKey||'',
      shareCode:c.shareCode||'',
      tripName:c.tripName||'2026 하와이 가족여행'
    };
  }

  async function req(c,path,opt={}){
    const r=await fetch(c.url.replace(/\/$/,'')+path,{...opt,headers:{apikey:c.anonKey,Authorization:'Bearer '+c.anonKey,...(opt.headers||{})}});
    if(!r.ok) throw new Error((await r.text())||('HTTP '+r.status));
    const text=await r.text();
    return text?JSON.parse(text):null;
  }

  function modal(){
    let w=document.getElementById('v20Backdrop');
    if(w) return w;
    w=document.createElement('div');
    w.id='v20Backdrop';
    w.className='v20-backdrop';
    w.innerHTML=`<div class="v20-modal">
      <div class="v20-head"><div><h2 style="margin:0">☁️ 여행 공유</h2><div class="v20-note">일정과 첨부파일을 아이폰·갤럭시·PC에서 함께 사용합니다.</div></div><button id="v20Close" class="btn ghost">✕</button></div>
      <div class="v20-card"><b>① Supabase 연결</b><div class="v20-grid" style="margin-top:10px"><label class="v20-field full">Project URL<input id="v20Url" placeholder="https://xxxx.supabase.co"></label><label class="v20-field full">anon public key<input id="v20Key" type="password" placeholder="eyJ..."></label></div><div class="v20-actions"><button id="v20SaveConnection" class="btn secondary">연결정보 저장</button><button id="v20Test" class="btn ghost">연결 테스트</button></div></div>
      <div class="v20-card"><b>② 새 여행 만들기</b><label class="v20-field" style="margin-top:10px">여행명<input id="v20TripName" value="2026 하와이 가족여행"></label><div class="v20-actions"><button id="v20Create" class="btn primary">새 여행 생성</button></div></div>
      <div class="v20-card"><b>③ 기존 여행 참가</b><label class="v20-field" style="margin-top:10px">여행 코드<input id="v20JoinCode" placeholder="예: AB3Q-9LXT"></label><div class="v20-actions"><button id="v20Join" class="btn secondary">여행 참가</button></div></div>
      <div id="v20Active" class="v20-card" style="display:none"><b>현재 연결된 여행</b><div id="v20ActiveName" style="margin-top:8px;font-weight:800"></div><div id="v20ActiveCode" class="v20-code"></div><img id="v20Qr" class="v20-qr" alt="여행 공유 QR"><div class="v20-actions"><button id="v20CopyCode" class="btn secondary">코드 복사</button><button id="v20Share" class="btn primary">공유하기</button><button id="v20Migrate" class="btn ghost">기존 일정·파일 이관</button><button id="v20Disconnect" class="btn ghost">연결 해제</button></div><div class="v20-note">다른 기기에서는 같은 앱을 열고 여행 코드를 입력하세요.</div></div>
      <div id="v20Progress" class="v20-progress" style="display:none"></div>
    </div>`;
    document.body.appendChild(w);
    w.querySelector('#v20Close').onclick=()=>w.classList.remove('show');
    w.onclick=e=>{if(e.target===w)w.classList.remove('show')};
    w.querySelector('#v20SaveConnection').onclick=saveConnection;
    w.querySelector('#v20Test').onclick=testConnection;
    w.querySelector('#v20Create').onclick=createTrip;
    w.querySelector('#v20Join').onclick=joinTrip;
    w.querySelector('#v20CopyCode').onclick=copyCode;
    w.querySelector('#v20Share').onclick=shareTrip;
    w.querySelector('#v20Migrate').onclick=migrate;
    w.querySelector('#v20Disconnect').onclick=disconnect;
    return w;
  }

  function fill(){
    const c=cloudDefaults(),w=modal();
    w.querySelector('#v20Url').value=c.url;
    w.querySelector('#v20Key').value=c.anonKey;
    w.querySelector('#v20TripName').value=c.tripName||'2026 하와이 가족여행';
    const active=w.querySelector('#v20Active');
    if(c.shareCode){
      active.style.display='block';
      w.querySelector('#v20ActiveName').textContent=c.tripName||'공유 여행';
      w.querySelector('#v20ActiveCode').textContent=c.shareCode;
      w.querySelector('#v20Qr').src='https://api.qrserver.com/v1/create-qr-code/?size=300x300&data='+encodeURIComponent(shareLink(c.shareCode));
    }else active.style.display='none';
  }

  function currentFromInputs(){
    const w=modal();
    return {...cloudDefaults(),url:w.querySelector('#v20Url').value.trim().replace(/\/$/,''),anonKey:w.querySelector('#v20Key').value.trim()};
  }

  function saveConnection(){
    const c=currentFromInputs();
    if(!c.url||!c.anonKey) return alert('Project URL과 anon public key를 입력하세요.');
    setCfg(c); alert('연결정보를 저장했습니다.'); fill();
  }

  async function testConnection(){
    try{await req(currentFromInputs(),'/rest/v1/travelmate_trips?select=trip_code&limit=1');alert('Supabase 연결에 성공했습니다.')}catch(e){alert('연결 실패: '+e.message)}
  }

  async function createTrip(){
    try{
      const c=currentFromInputs(),name=modal().querySelector('#v20TripName').value.trim()||'새 여행';
      if(!c.url||!c.anonKey) return alert('먼저 Supabase 연결정보를 입력하세요.');
      let code,ok=false;
      for(let i=0;i<5&&!ok;i++){
        code=makeCode();
        try{await req(c,'/rest/v1/travelmate_trips',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({trip_code:code,trip_name:name})});ok=true}catch(e){if(!/duplicate|23505/i.test(e.message))throw e}
      }
      if(!ok) throw new Error('여행 코드를 생성하지 못했습니다.');
      setCfg({...c,shareCode:code,tripName:name}); fill();
      if(confirm('기존에 저장된 일정과 첨부파일을 지금 이 여행으로 옮길까요?')) await migrate(); else location.reload();
    }catch(e){alert('여행 생성 실패: '+e.message)}
  }

  async function joinTrip(){
    try{
      const c=currentFromInputs(),code=cleanCode(modal().querySelector('#v20JoinCode').value);
      if(!c.url||!c.anonKey) return alert('먼저 Supabase 연결정보를 입력하세요.');
      if(code.length<8) return alert('올바른 여행 코드를 입력하세요.');
      const rows=await req(c,'/rest/v1/travelmate_trips?trip_code=eq.'+encodeURIComponent(code)+'&select=trip_code,trip_name');
      if(!rows?.length) return alert('해당 여행을 찾지 못했습니다.');
      setCfg({...c,shareCode:rows[0].trip_code,tripName:rows[0].trip_name});
      alert('여행에 참가했습니다. 일정을 불러옵니다.'); location.reload();
    }catch(e){alert('여행 참가 실패: '+e.message)}
  }

  function shareLink(code){const u=new URL(location.href);u.searchParams.set('trip',code);u.hash='';return u.toString()}
  async function copyCode(){await navigator.clipboard.writeText(cloudDefaults().shareCode);alert('여행 코드를 복사했습니다.')}
  async function shareTrip(){
    const c=cloudDefaults(),data={title:c.tripName||'TravelMate 여행',text:'TravelMate 여행 코드: '+c.shareCode,url:shareLink(c.shareCode)};
    try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.url+'\n여행 코드: '+c.shareCode);alert('공유 링크와 코드를 복사했습니다.')}}catch(e){if(e.name!=='AbortError')alert('공유 실패: '+e.message)}
  }
  function disconnect(){if(!confirm('현재 여행 연결을 해제할까요? 기기 내부 데이터는 삭제되지 않습니다.'))return;const c=getCfg();delete c.shareCode;delete c.tripName;setCfg(c);location.reload()}

  function openDb(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);r.onupgradeneeded=()=>{}})}
  function all(db,store){return new Promise((res,rej)=>{if(!db.objectStoreNames.contains(store))return res([]);const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)})}

  async function migrate(){
    const c=cloudDefaults();
    if(!c.url||!c.anonKey||!c.shareCode) return alert('먼저 여행을 생성하거나 참가하세요.');
    const box=modal().querySelector('#v20Progress');box.style.display='block';box.textContent='기존 데이터 확인 중…';
    try{
      const state=JSON.parse(localStorage.getItem(STATE)||'{"custom":[],"edited":{},"deleted":[]}');
      await req(c,'/rest/v1/travelmate_shared_state',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({share_code:c.shareCode,state,updated_at:new Date().toISOString()})});
      const db=await openDb(),details=await all(db,DETAILS),files=await all(db,FILES);let dc=0,fc=0;
      for(const d of details){
        box.textContent=`상세정보 ${details.length}개 중 ${dc+1}개 이관 중…`;
        await req(c,'/rest/v1/travelmate_details',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({share_code:c.shareCode,schedule_key:d.scheduleKey,memo:d.memo||'',reservation:d.reservation||'',phone:d.phone||'',url:d.url||'',updated_at:new Date().toISOString()})});dc++;
      }
      for(const f of files){
        box.textContent=`첨부파일 ${files.length}개 중 ${fc+1}개 업로드 중…`;
        const safe=(f.name||'file').replace(/[^a-zA-Z0-9._-]/g,'_');
        const path=c.shareCode+'/'+encodeURIComponent(f.scheduleKey)+'/'+Date.now()+'_'+fc+'_'+safe;
        const up=await fetch(c.url+'/storage/v1/object/travelmate-files/'+path,{method:'POST',headers:{apikey:c.anonKey,Authorization:'Bearer '+c.anonKey,'Content-Type':f.type||'application/octet-stream','x-upsert':'false'},body:f.blob});
        if(!up.ok) throw new Error(await up.text());
        await req(c,'/rest/v1/travelmate_attachments',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({share_code:c.shareCode,schedule_key:f.scheduleKey,file_name:f.name||'file',mime_type:f.type||'',file_size:f.size||0,storage_path:decodeURIComponent(path)})});fc++;
      }
      box.textContent=`이관 완료 ✓\n일정 변경사항 저장\n상세정보 ${dc}개\n첨부파일 ${fc}개`;
      setTimeout(()=>location.reload(),1200);
    }catch(e){box.textContent='이관 실패: '+e.message}
  }

  function autoJoin(){
    const code=cleanCode(new URL(location.href).searchParams.get('trip'));
    if(!code)return;
    const c=cloudDefaults();
    if(c.shareCode!==code) setTimeout(()=>{window.openV20TripCenter();modal().querySelector('#v20JoinCode').value=code},300);
  }

  window.openV20TripCenter=()=>{fill();modal().classList.add('show')};
  window.addEventListener('DOMContentLoaded',()=>{document.getElementById('v20TripButton')?.addEventListener('click',window.openV20TripCenter);autoJoin()});
})();
