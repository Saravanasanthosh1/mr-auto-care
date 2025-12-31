(function(){
  const $=id=>document.getElementById(id);
  const yr=$('year'); if(yr){ yr.textContent=new Date().getFullYear(); }

  function fixOffsets(){
    const alertbar=document.querySelector('.alertbar');
    const header=document.querySelector('.site-header');
    const drawer=$('drawer');
    const scrim=$('drawerScrim');
    const a=(alertbar && !alertbar.classList.contains('hide'))?(alertbar.offsetHeight||52):0;
    const h=header?.offsetHeight||64;
    document.documentElement.style.setProperty('--alertbar-h', a+'px');
    document.documentElement.style.setProperty('--header-h', h+'px');
    const top=(a+h)+"px";
    if(drawer){ drawer.style.top=top; drawer.style.height=`calc(100vh - ${top})`; }
    if(scrim){ scrim.style.top=top; scrim.style.height=`calc(100vh - ${top})`; }
  }

  const drawer=$('drawer');
  const scrim=$('drawerScrim');
  $('menuBtn')?.addEventListener('click',()=>{ drawer?.classList.add('open'); scrim?.classList.add('open'); });
  $('drawerClose')?.addEventListener('click',()=>{ drawer?.classList.remove('open'); scrim?.classList.remove('open'); });
  scrim?.addEventListener('click',()=>{ drawer?.classList.remove('open'); scrim?.classList.remove('open'); });
  drawer?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{ drawer.classList.remove('open'); scrim?.classList.remove('open'); }));

  // Robust hysteresis for banner show/hide
  (function(){
    let lastY=window.pageYOffset||0; let ticking=false; const bar=document.querySelector('.alertbar'); let hidden=false; let lastToggle=0; let fixTimer;
    function safeFix(){ clearTimeout(fixTimer); fixTimer=setTimeout(()=>{ try{ fixOffsets(); }catch(e){} },140); }
    function onScroll(){ if(!bar) return; const y=window.pageYOffset||0; const dy=y-lastY; lastY=y; const now=Date.now();
      if(dy>20 && y>140 && !hidden && (now-lastToggle>420)){ bar.classList.add('hide'); hidden=true; lastToggle=now; safeFix(); return; }
      if(dy<-20 && hidden && (now-lastToggle>420)){ bar.classList.remove('hide'); hidden=false; lastToggle=now; safeFix(); return; }
    }
    window.addEventListener('scroll', ()=>{ if(!ticking){ window.requestAnimationFrame(()=>{ onScroll(); ticking=false; }); ticking=true; } }, {passive:true});
  })();

  // Language radios
  function wireLangRadios(){
    const hdr={ en:$('langEn'), ta:$('langTa') };
    const mob={ en:$('langEnM'), ta:$('langTaM') };
    function apply(lang){ try{ localStorage.setItem('lang',lang); }catch(e){} I18N_APPLY(lang); const isEn=(lang==='en');
      [hdr.en,hdr.ta,mob.en,mob.ta].forEach(el=>{ if(!el) return; el.checked = (el.value==='en')?isEn:!isEn; }); }
    [hdr.en,hdr.ta,mob.en,mob.ta].forEach(el=>{ if(!el) return; el.addEventListener('change',()=>apply(el.value)); el.addEventListener('click',()=>apply(el.value)); });
  }

  // Services controls
  function svcControls(){
    const details=[...document.querySelectorAll('.svc-details')];
    const expandAll=()=>details.forEach(d=>d.open=true);
    const collapseAll=()=>details.forEach(d=>d.open=false);
    document.getElementById('svcExpandAll')?.addEventListener('click',expandAll);
    document.getElementById('svcCollapseAll')?.addEventListener('click',collapseAll);
    const isDesktop=()=>window.matchMedia('(min-width:980px)').matches;
    if(isDesktop()) expandAll(); else collapseAll();
  }

  // Gallery slider autoplay (5 seconds) + prev/next + keyboard
  function gallerySlider(){
    const img = document.getElementById('slide');
    if(!img) return;
    const pics = [
      {src:'assets/images/gallery/gallery-1.jpg', alt:'Work sample 1'},
      {src:'assets/images/gallery/gallery-2.jpg', alt:'Work sample 2'},
      {src:'assets/images/gallery/gallery-3.jpg', alt:'Work sample 3'},
      {src:'assets/images/gallery/gallery-4.jpg', alt:'Work sample 4'},
      {src:'assets/images/gallery/gallery-5.jpg', alt:'Work sample 5'},
      {src:'assets/images/gallery/gallery-6.jpg', alt:'Work sample 6'},
      {src:'assets/images/gallery/gallery-7.jpg', alt:'Work sample 7'},
      {src:'assets/images/gallery/gallery-8.jpg', alt:'Work sample 8'}
    ];
    let idx=0; let timer;
    function show(i){ idx=(i+pics.length)%pics.length; const p=pics[idx]; img.src=p.src; img.alt=p.alt; }
    function next(){ show(idx+1); reset(); }
    function prev(){ show(idx-1); reset(); }
    function reset(){ clearInterval(timer); timer=setInterval(next, 5000); }
    document.querySelector('.slider-btn.next')?.addEventListener('click', next);
    document.querySelector('.slider-btn.prev')?.addEventListener('click', prev);
    document.querySelector('.slider')?.addEventListener('mouseenter', ()=>clearInterval(timer));
    document.querySelector('.slider')?.addEventListener('mouseleave', reset);
    window.addEventListener('keydown', (e)=>{ if(e.key==='ArrowRight') next(); if(e.key==='ArrowLeft') prev(); });
    show(0); reset();
  }

  // WhatsApp submission with validation + toast
  (function(){
    const form=document.getElementById('apptForm'); if(!form) return;
    function getSelectedServices(){ return [...form.querySelectorAll('input[name="services[]"]:checked')].map(i=>i.value); }
    function onlyDigits(s){ return (s||'').replace(/\D/g,''); }
    function toast(msg, type='success', ttl=10000){
      let t=document.querySelector('.toast'); if(!t){ t=document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
      t.classList.remove('success','error'); t.classList.add(type);
      t.textContent=msg; t.classList.add('show');
      setTimeout(()=>{ t.classList.remove('show'); }, ttl);
    }

    form.addEventListener('submit', function(ev){ ev.preventDefault();
      const fd=new FormData(form);
      const name=(fd.get('name')||'').trim();
      const phone=onlyDigits(fd.get('phone')||'');
      const date=(fd.get('date')||'').trim();
      const time=(fd.get('time')||'').trim();
      const vehicle=(fd.get('vehicle')||'').trim();
      const msg=(fd.get('msg')||'').trim();
      const services=getSelectedServices();

      if(services.length===0){ toast('Please select at least one service.', 'error', 6000); return; }
      if(!name){ toast('Name is required.', 'error', 6000); return; }
      if(!phone || !/^\d{10}$/.test(phone)){ toast('Phone number must be 10 digits.', 'error', 6000); return; }
      if(!vehicle){ toast('Vehicle (Make/Model) is required.', 'error', 6000); return; }
      const now=new Date();
      if(date){
        const parts=date.split('-');
        const d=new Date(Number(parts[0]), Number(parts[1])-1, Number(parts[2]));
        const today=new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if(d < today){ toast('Please choose a future date.', 'error', 6000); return; }
        if(d.getTime()===today.getTime()){
          if(!time){ toast('Please choose a time.', 'error', 6000); return; }
          const [hh,mm]=time.split(':').map(Number);
          const selected=new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh||0, mm||0);
          if(selected <= now){ toast('Time must be in the future for today.', 'error', 6000); return; }
        }
      }

      const lines=[
        '*MR Auto Repairs — Appointment Request*',
        '',
        '*Name:* '+name,
        '*Phone:* +91 '+phone,
        '*Vehicle:* '+vehicle,
        date?('*Date:* '+date):'',
        time?('*Time:* '+time):'',
        '*Services:*',
        ...services.map(s=>'• '+s),
        msg?('', '*Notes:* '+msg):''
      ].flat().filter(Boolean);
      const wa='https://wa.me/919790566797?text='+encodeURIComponent(lines.join('\n'));
      window.open(wa,'_blank');

      form.reset();
      form.querySelectorAll('input[name="services[]"]').forEach(i=>i.checked=false);
      toast('Thanks! Our team will contact you shortly.', 'success', 10000);
    });
  })();

  window.addEventListener('load',()=>{ fixOffsets(); wireLangRadios(); svcControls(); gallerySlider(); });
  window.addEventListener('resize', fixOffsets);
})();
