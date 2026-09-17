
(() => {
  const KEY = 'iat_admin_mvp_v1';

  const seed = {
    tours: [
      {id: 1, name: '덕적도 힐링 아일랜드', audience: '가족·중장년', schedule: '당일', difficulty: '★★☆☆☆', status: '노출'},
      {id: 2, name: '신시모도 패밀리 투어', audience: '가족', schedule: '당일', difficulty: '★☆☆☆☆', status: '노출'},
      {id: 3, name: '대청도 자연 투어', audience: '자연·트레킹', schedule: '1박2일', difficulty: '★★★☆☆', status: '준비중'},
      {id: 4, name: '백령도 풍경 투어', audience: '가족·중장년', schedule: '1박2일', difficulty: '★★☆☆☆', status: '준비중'}
    ],
    inquiries: [
      {id: 1, name: '김○○', phone: '010-****-1234', tour: '덕적도 힐링 아일랜드', people: '4명', date: '2026-09-24', status: '접수'},
      {id: 2, name: '이○○', phone: '010-****-5678', tour: '단체 맞춤 여행', people: '28명', date: '2026-10-14', status: '상담중'}
    ],
    reviews: [
      {id: 1, title: '부모님과 함께한 섬 여행', type: '가족 4명', tour: '덕적도 힐링 아일랜드', date: '2026-08', text: '실제 고객 후기 확보 후 교체하세요.'},
      {id: 2, title: '아이와 편하게 다녀온 여행', type: '가족', tour: '신시모도 패밀리 투어', date: '2026-08', text: '실제 고객 후기 확보 후 교체하세요.'}
    ],
    faq: [
      {id:1, q:'배가 결항되면 어떻게 되나요?', a:'실제 결항 및 환불 정책 확정 후 고객용 문구를 입력하세요.'},
      {id:2, q:'부모님과 함께 갈 수 있나요?', a:'상품별 도보시간·계단·휴식정보를 기준으로 안내 문구를 입력하세요.'},
      {id:3, q:'아이도 참여할 수 있나요?', a:'연령별 참여 가능 여부와 준비물 정보를 입력하세요.'}
    ],
    settings: {phone:'', email:'', kakao:'', cta:'예약 문의하기', business:''}
  };

  let state = load();
  let inquiryFilter = 'all';

  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
  function load(){
    try { return JSON.parse(localStorage.getItem(KEY)) || clone(seed); }
    catch(e){ return clone(seed); }
  }
  function save(){
    localStorage.setItem(KEY, JSON.stringify(state));
    renderAll();
    flashSaved();
  }
  function flashSaved(){
    const btn = document.getElementById('saveAllBtn');
    if(!btn) return;
    const old = btn.textContent;
    btn.textContent = '저장됨 ✓';
    setTimeout(()=>btn.textContent=old, 1100);
  }
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const titles = {
    dashboard:'대시보드', tours:'투어상품', inquiries:'문의관리',
    reviews:'후기관리', faq:'FAQ 관리', settings:'사이트 설정'
  };

  function switchView(name){
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(v=>v.classList.toggle('active', v.dataset.view===name));
    document.getElementById('view-'+name)?.classList.add('active');
    document.getElementById('pageTitle').textContent = titles[name] || '관리자';
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('menuBtn').setAttribute('aria-expanded','false');
    window.scrollTo({top:0, behavior:'smooth'});
  }

  document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
  document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.jump)));

  const menuBtn = document.getElementById('menuBtn');
  menuBtn.addEventListener('click',()=>{
    const open = document.getElementById('sidebar').classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  function renderDashboard(){
    document.getElementById('statTours').textContent = state.tours.length;
    document.getElementById('statInquiries').textContent = state.inquiries.length;
    document.getElementById('statReviews').textContent = state.reviews.length;
    document.getElementById('statFaq').textContent = state.faq.length;
    document.getElementById('contentTours').textContent = state.tours.length+'개';
    document.getElementById('contentReviews').textContent = state.reviews.length+'개';
    document.getElementById('contentFaq').textContent = state.faq.length+'개';

    const recent = state.inquiries.slice().reverse().slice(0,4);
    document.getElementById('recentInquiries').innerHTML = recent.length
      ? recent.map(i=>`<div class="list-row"><div><strong>${esc(i.name)} · ${esc(i.tour)}</strong><small>${esc(i.date)} · ${esc(i.people)}</small></div><span class="badge ${i.status==='완료'?'green':''}">${esc(i.status)}</span></div>`).join('')
      : '<p class="muted">등록된 문의가 없습니다.</p>';
  }

  function renderTours(){
    document.getElementById('tourRows').innerHTML = state.tours.map(t=>`
      <tr>
        <td><strong>${esc(t.name)}</strong></td>
        <td>${esc(t.audience)}</td><td>${esc(t.schedule)}</td><td>${esc(t.difficulty)}</td>
        <td><span class="badge ${t.status==='노출'?'green':'gray'}">${esc(t.status)}</span></td>
        <td><div class="row-actions"><button class="mini-btn" data-edit-tour="${t.id}">수정</button><button class="mini-btn danger" data-delete-tour="${t.id}">삭제</button></div></td>
      </tr>`).join('');
    document.querySelectorAll('[data-edit-tour]').forEach(b=>b.onclick=()=>editTour(Number(b.dataset.editTour)));
    document.querySelectorAll('[data-delete-tour]').forEach(b=>b.onclick=()=>removeItem('tours', Number(b.dataset.deleteTour)));
  }

  function renderInquiries(){
    const data = state.inquiries.filter(i=>inquiryFilter==='all'||i.status===inquiryFilter);
    document.getElementById('inquiryCards').innerHTML = data.length ? data.map(i=>`
      <article class="data-card">
        <span class="badge ${i.status==='완료'?'green':''}">${esc(i.status)}</span>
        <h3>${esc(i.name)} · ${esc(i.people)}</h3>
        <p>${esc(i.tour)}</p>
        <div class="data-meta"><span class="badge gray">${esc(i.date)}</span><span class="badge gray">${esc(i.phone)}</span></div>
        <div class="card-actions">
          <button class="mini-btn" data-edit-inquiry="${i.id}">상태 변경</button>
          <button class="mini-btn danger" data-delete-inquiry="${i.id}">삭제</button>
        </div>
      </article>`).join('') : '<p class="muted">조건에 맞는 문의가 없습니다.</p>';
    document.querySelectorAll('[data-edit-inquiry]').forEach(b=>b.onclick=()=>editInquiry(Number(b.dataset.editInquiry)));
    document.querySelectorAll('[data-delete-inquiry]').forEach(b=>b.onclick=()=>removeItem('inquiries', Number(b.dataset.deleteInquiry)));
  }

  function renderReviews(){
    document.getElementById('reviewCards').innerHTML = state.reviews.length ? state.reviews.map(r=>`
      <article class="data-card">
        <span class="badge">${esc(r.type)}</span>
        <h3>${esc(r.title)}</h3><p>${esc(r.text)}</p>
        <div class="data-meta"><span class="badge gray">${esc(r.tour)}</span><span class="badge gray">${esc(r.date)}</span></div>
        <div class="card-actions"><button class="mini-btn" data-edit-review="${r.id}">수정</button><button class="mini-btn danger" data-delete-review="${r.id}">삭제</button></div>
      </article>`).join('') : '<p class="muted">등록된 후기가 없습니다.</p>';
    document.querySelectorAll('[data-edit-review]').forEach(b=>b.onclick=()=>editReview(Number(b.dataset.editReview)));
    document.querySelectorAll('[data-delete-review]').forEach(b=>b.onclick=()=>removeItem('reviews', Number(b.dataset.deleteReview)));
  }

  function renderFaq(){
    document.getElementById('faqEditor').innerHTML = state.faq.map(f=>`
      <div class="list-row">
        <div><strong>${esc(f.q)}</strong><small>${esc(f.a)}</small></div>
        <div class="row-actions"><button class="mini-btn" data-edit-faq="${f.id}">수정</button><button class="mini-btn danger" data-delete-faq="${f.id}">삭제</button></div>
      </div>`).join('');
    document.querySelectorAll('[data-edit-faq]').forEach(b=>b.onclick=()=>editFaq(Number(b.dataset.editFaq)));
    document.querySelectorAll('[data-delete-faq]').forEach(b=>b.onclick=()=>removeItem('faq', Number(b.dataset.deleteFaq)));
  }

  function renderSettings(){
    const form = document.getElementById('settingsForm');
    Object.entries(state.settings).forEach(([k,v])=>{ if(form.elements[k]) form.elements[k].value=v||''; });
  }

  function renderAll(){ renderDashboard(); renderTours(); renderInquiries(); renderReviews(); renderFaq(); renderSettings(); }

  function removeItem(key,id){
    if(!confirm('이 항목을 삭제할까요?')) return;
    state[key] = state[key].filter(x=>x.id!==id);
    save();
  }

  const dialog = document.getElementById('editorDialog');
  const editorForm = document.getElementById('editorForm');
  const dialogFields = document.getElementById('dialogFields');
  let submitHandler = null;

  function openEditor(title, fields, onSubmit){
    document.getElementById('dialogTitle').textContent = title;
    dialogFields.innerHTML = fields.map(f=>{
      const val = esc(f.value||'');
      if(f.type==='textarea') return `<label>${esc(f.label)}<textarea name="${f.name}" rows="4" ${f.required?'required':''}>${val}</textarea></label>`;
      if(f.type==='select') return `<label>${esc(f.label)}<select name="${f.name}">${f.options.map(o=>`<option ${o===f.value?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`;
      return `<label>${esc(f.label)}<input name="${f.name}" type="${f.type||'text'}" value="${val}" ${f.required?'required':''}></label>`;
    }).join('');
    submitHandler = onSubmit;
    dialog.showModal();
  }
  editorForm.addEventListener('submit',e=>{
    if(e.submitter?.value==='cancel') return;
    e.preventDefault();
    const data = Object.fromEntries(new FormData(editorForm).entries());
    submitHandler?.(data);
    dialog.close();
  });

  function nextId(arr){ return arr.length ? Math.max(...arr.map(x=>x.id))+1 : 1; }

  function editTour(id){
    const item = id ? state.tours.find(x=>x.id===id) : {name:'',audience:'',schedule:'당일',difficulty:'★☆☆☆☆',status:'준비중'};
    openEditor(id?'투어 수정':'투어 추가',[
      {label:'상품명',name:'name',value:item.name,required:true},
      {label:'추천 대상',name:'audience',value:item.audience,required:true},
      {label:'일정',name:'schedule',value:item.schedule,required:true},
      {label:'난이도',name:'difficulty',type:'select',value:item.difficulty,options:['★☆☆☆☆','★★☆☆☆','★★★☆☆','★★★★☆','★★★★★']},
      {label:'상태',name:'status',type:'select',value:item.status,options:['노출','준비중','숨김']}
    ],data=>{
      if(id) Object.assign(item,data); else state.tours.push({id:nextId(state.tours),...data});
      save();
    });
  }

  function editInquiry(id){
    const item = id ? state.inquiries.find(x=>x.id===id) : {name:'테스트 고객',phone:'010-0000-0000',tour:'덕적도 힐링 아일랜드',people:'2명',date:'2026-09-30',status:'접수'};
    openEditor(id?'문의 상태 변경':'테스트 문의 추가',[
      {label:'이름',name:'name',value:item.name,required:true},
      {label:'연락처',name:'phone',value:item.phone,required:true},
      {label:'관심 투어',name:'tour',value:item.tour,required:true},
      {label:'인원',name:'people',value:item.people},
      {label:'희망일',name:'date',type:'date',value:item.date},
      {label:'상태',name:'status',type:'select',value:item.status,options:['접수','상담중','완료']}
    ],data=>{
      if(id) Object.assign(item,data); else state.inquiries.push({id:nextId(state.inquiries),...data});
      save();
    });
  }

  function editReview(id){
    const item = id ? state.reviews.find(x=>x.id===id) : {title:'',type:'',tour:'',date:'',text:''};
    openEditor(id?'후기 수정':'후기 추가',[
      {label:'제목',name:'title',value:item.title,required:true},
      {label:'고객유형',name:'type',value:item.type,required:true},
      {label:'이용상품',name:'tour',value:item.tour,required:true},
      {label:'이용시기',name:'date',value:item.date},
      {label:'후기',name:'text',type:'textarea',value:item.text,required:true}
    ],data=>{
      if(id) Object.assign(item,data); else state.reviews.push({id:nextId(state.reviews),...data});
      save();
    });
  }

  function editFaq(id){
    const item = id ? state.faq.find(x=>x.id===id) : {q:'',a:''};
    openEditor(id?'FAQ 수정':'FAQ 추가',[
      {label:'질문',name:'q',value:item.q,required:true},
      {label:'답변',name:'a',type:'textarea',value:item.a,required:true}
    ],data=>{
      if(id) Object.assign(item,data); else state.faq.push({id:nextId(state.faq),...data});
      save();
    });
  }

  document.getElementById('addTourBtn').onclick=()=>editTour();
  document.getElementById('addInquiryBtn').onclick=()=>editInquiry();
  document.getElementById('addReviewBtn').onclick=()=>editReview();
  document.getElementById('addFaqBtn').onclick=()=>editFaq();

  document.querySelectorAll('[data-inquiry-filter]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('[data-inquiry-filter]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); inquiryFilter=b.dataset.inquiryFilter; renderInquiries();
  }));

  document.getElementById('settingsForm').addEventListener('submit',e=>{
    e.preventDefault();
    state.settings = Object.fromEntries(new FormData(e.currentTarget).entries());
    save();
  });

  document.getElementById('saveAllBtn').onclick=save;

  document.getElementById('exportBtn').onclick=()=>{
    const blob = new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'incheon-island-tour-admin-backup.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  document.getElementById('importInput').addEventListener('change',async e=>{
    const file = e.target.files?.[0]; if(!file) return;
    try{
      const parsed = JSON.parse(await file.text());
      if(!parsed.tours || !parsed.inquiries || !parsed.reviews || !parsed.faq) throw new Error('invalid');
      state=parsed; save(); alert('데이터를 불러왔습니다.');
    }catch(err){ alert('올바른 관리자 백업 JSON 파일이 아닙니다.'); }
    e.target.value='';
  });

  document.getElementById('resetBtn').onclick=()=>{
    if(!confirm('현재 브라우저의 관리자 데이터를 초기화할까요?')) return;
    state=clone(seed); save();
  };

  renderAll();
})();
