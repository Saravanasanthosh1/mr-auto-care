(function(){
  const yr=document.getElementById('year'); if(yr){ yr.textContent=new Date().getFullYear(); }

  function fixOffsets(){
    const alertbar=document.querySelector('.alertbar');
    const header=document.querySelector('.site-header');
    const drawer=document.getElementById('drawer');
    const scrim=document.getElementById('drawerScrim');
    const a=alertbar?.offsetHeight||52; const h=header?.offsetHeight||64;
    document.documentElement.style.setProperty('--alertbar-h', a+'px');
    document.documentElement.style.setProperty('--header-h', h+'px');
    const top=(a+h)+"px";
    if(drawer){ drawer.style.top=top; drawer.style.height=`calc(100vh - ${top})`; }
    if(scrim){ scrim.style.top=top; scrim.style.height=`calc(100vh - ${top})`; }
  }

  const drawer=document.getElementById('drawer');
  const scrim=document.getElementById('drawerScrim');
  document.getElementById('menuBtn')?.addEventListener('click',()=>{ drawer?.classList.add('open'); scrim?.classList.add('open'); });
  document.getElementById('drawerClose')?.addEventListener('click',()=>{ drawer?.classList.remove('open'); scrim?.classList.remove('open'); });
  scrim?.addEventListener('click',()=>{ drawer?.classList.remove('open'); scrim?.classList.remove('open'); });
  drawer?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{ drawer.classList.remove('open'); scrim?.classList.remove('open'); }));

  function wireLangRadios(){
    const hdr={ en:document.getElementById('langEn'), ta:document.getElementById('langTa') };
    const mob={ en:document.getElementById('langEnM'), ta:document.getElementById('langTaM') };
    function apply(lang){ I18N_APPLY(lang); const isEn=(lang==='en'); if(hdr.en) hdr.en.checked=isEn; if(hdr.ta) hdr.ta.checked=!isEn; if(mob.en) mob.en.checked=isEn; if(mob.ta) mob.ta.checked=!isEn; }
    [hdr.en,hdr.ta,mob.en,mob.ta].forEach(el=>{ el&&el.addEventListener('change',()=>{ apply(el.value); }); });
  }

  function initGallery(){
    const stage=document.getElementById('galleryStage');
    const wrap=document.getElementById('gallery');
    const prevBtn=document.getElementById('galleryPrev');
    const nextBtn=document.getElementById('galleryNext');
    if(!stage || !wrap || !prevBtn || !nextBtn){ return; }
    const folder=wrap.getAttribute('data-folder')||'assets/images/gallery';
    const count=parseInt(wrap.getAttribute('data-count')||'6',10);
    const base=wrap.getAttribute('data-base')||'image';
    const ext=wrap.getAttribute('data-ext')||'jpg';
    let i=1,active,incoming,timer;
    function makeImg(){ const img=document.createElement('img'); img.className='gallery__img'; img.alt=''; return img; }
    function src(n){return `${folder}/${base}${n}.${ext}`;}
    function show(n,dir){
      incoming=makeImg(); incoming.src=src(n); incoming.alt='Gallery image '+n;
      incoming.classList.add(dir==='next'?'enter-right':'enter-left');
      stage.appendChild(incoming);
      requestAnimationFrame(()=>{
        if(active){ active.classList.add(dir==='next'?'exit-left':'exit-right'); active.classList.remove('active'); }
        incoming.classList.remove(dir==='next'?'enter-right':'enter-left'); incoming.classList.add('active');
        setTimeout(()=>{ if(active && active.parentNode===stage){ stage.removeChild(active);} active=incoming; },420);
      });
    }
    function startTimer(){ clearInterval(timer); timer=setInterval(()=>{ i=(i%count)+1; show(i,'next'); },5000); }
    function goPrev(){ i=(i-2+count)%count+1; show(i,'prev'); startTimer(); }
    function goNext(){ i=(i%count)+1; show(i,'next'); startTimer(); }
    prevBtn.addEventListener('click',goPrev); nextBtn.addEventListener('click',goNext);
    active=makeImg(); active.src=src(i); active.classList.add('active'); stage.appendChild(active);
    startTimer();
  }

  function svcControls(){
    const details=[...document.querySelectorAll('.svc-details')];
    const expandAll=()=>details.forEach(d=>d.open=true);
    const collapseAll=()=>details.forEach(d=>d.open=false);
    document.getElementById('svcExpandAll')?.addEventListener('click',expandAll);
    document.getElementById('svcCollapseAll')?.addEventListener('click',collapseAll);
    const isDesktop=()=>window.matchMedia('(min-width:980px)').matches;
    if(isDesktop()) expandAll(); else collapseAll();
  }

  window.addEventListener('load',()=>{ fixOffsets(); wireLangRadios(); initGallery(); svcControls(); });
  window.addEventListener('resize', fixOffsets);
})();
