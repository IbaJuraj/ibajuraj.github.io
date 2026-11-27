(() => {
  "use strict";
  const storefronts={sk:"SK",cs:"CZ",en:"US",de:"DE",pl:"PL",hu:"HU"};
  const allowed = {"strazca-terminov":6779741336,"lexdrive":6794546464,"jurajcalc":6777232702,"penazenka-kariet":6779166726};
  const tr = key => window.IbaJurajI18n?.t?.(key,key) || key;
  const lang = () => window.IbaJurajI18n?.language || "sk";
  let catalog = null;
  let generation = 0;
  const el = (tag, text, cls) => {const n=document.createElement(tag); if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const record = slug => {
    const entry=catalog?.apps?.[slug];
    if(!entry || entry.id!==allowed[slug])return null;
    const l=lang(), actual=[l,"sk","cs","en","de","pl","hu"].find(k=>typeof entry.locales?.[k]?.version==="string" && entry.locales[k].version), data=entry.locales?.[actual];
    return data && typeof data.version==="string" && data.version ? {entry,data,actual}:null;
  };
  const date = value => {const d=new Date(value);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat(lang(),{dateStyle:"medium",timeZone:"UTC"}).format(d):"";};
  const label = r => [tr("Verzia")+" "+r.data.version,date(r.data.date),r.actual!==lang()?tr("Údaje z iného obchodu App Store")+" ("+storefronts[r.actual]+")":""].filter(Boolean).join(" · ");
  function render(){
    if(!catalog)return;
    const renderGeneration=++generation;
    document.querySelectorAll("[data-version]").forEach(n=>{const r=record(n.dataset.version);n.textContent=r?label(r):"";});
    document.querySelectorAll("[data-product]").forEach(root=>{
      const slug=root.dataset.product,r=record(slug);if(!r)return;
      const {data}=r;
      for(const [selector,key] of [["[data-release-notes]","notes"],["[data-description]","description"]]){const n=root.querySelector(selector);if(n && data[key])n.textContent=data[key];}
      const os=root.querySelector("[data-min-os]");if(os && data.minOS){os.hidden=false;os.textContent=tr("Minimálna verzia iOS")+": "+data.minOS;}
      const history=root.querySelector("[data-history]");if(history){
        history.replaceChildren();
        for(const item of (data.history||[])){if(!item.version)continue;const d=el("details",undefined,"portal-detail"),s=el("summary",tr("Verzia")+" "+item.version+" · "+date(item.date));d.append(s,el("p",item.notes||tr("Informácie o vydaniach nájdete v App Store."),"store-copy"));history.append(d);}
        root.querySelector("[data-history-empty]").hidden=history.childElementCount>0;
      }
      const gallery=root.querySelector("[data-gallery]");
      // Keep vetted local gallery until at least one validated published store image loads.
      if(gallery && Array.isArray(data.images) && data.images.length){
        const links=[];let success=0,finished=0;
        for(const path of data.images.slice(0,8)){
          if(typeof path!=="string" || !new RegExp("^assets/appstore/media/"+slug+"/[a-z]{2}-[0-9]+-[a-f0-9]{12}\\.(jpg|png|webp)$").test(path))continue;
          const a=el("a");a.href="/"+path;a.target="_blank";a.rel="noopener noreferrer";a.setAttribute("aria-label",tr("Ukážky aplikácie"));
          const img=el("img");img.alt="";img.decoding="async";img.width=820;img.height=1783;a.append(img);links.push(a);
          img.onload=()=>{success++;finished++;finish();};img.onerror=()=>{finished++;a.remove();finish();};img.src=a.href;
        }
        function finish(){if(renderGeneration===generation && finished===links.length && success>0){gallery.dataset.storeGallery="true";gallery.replaceChildren(...links.filter(a=>a.firstChild?.naturalWidth>0));gallery.hidden=false;}}
      }
    });
    document.querySelectorAll('a[href*="apps.apple.com/"]').forEach(a=>{
      const id=Number(new URL(a.href).pathname.match(/id(\d+)/)?.[1]);
      const slug=Object.keys(allowed).find(k=>allowed[k]===id),r=slug&&record(slug);
      if(r && r.actual!==lang()){const u=new URL(a.href),p=u.pathname.split("/");p[1]=storefronts[r.actual].toLowerCase();u.pathname=p.join("/");u.searchParams.set("l",r.actual);a.href=u.toString();}
    });
    document.querySelectorAll("[data-news]").forEach(list=>{
      const entries=Object.keys(allowed).map(slug=>({slug,r:record(slug)})).filter(x=>x.r);
      entries.sort((a,b)=>String(b.r.data.date||"").localeCompare(String(a.r.data.date||"")));
      const limit=Number(list.dataset.news)||entries.length;list.replaceChildren();
      for(const {slug,r} of entries.slice(0,limit)){
        const article=el("article",undefined,"news-item"),title=el("h3"),a=el("a",r.entry.name,"text-link");
        a.href="/apps/"+slug+"/"; if(lang()!=="sk")a.href+="?lang="+lang();
        title.append(a);article.append(title,el("p",label(r)));
        if(r.data.notes){const detail=el("details"),summary=el("summary",tr("Čo je nové?"));detail.append(summary,el("p",r.data.notes));article.append(detail);}
        list.append(article);
      }
      const empty=list.parentElement.querySelector("[data-news-empty]");if(empty)empty.hidden=list.childElementCount>0;
    });
  }
  document.addEventListener("ibajuraj:language-ready",render);
  document.addEventListener("DOMContentLoaded",async()=>{
    const legacy=document.getElementById("legacy-support-form");
    if(legacy){const p=new URLSearchParams(location.search);if(location.hash==="#support"||["app","type","subject"].some(k=>p.has(k)))legacy.open=true;
      window.addEventListener("hashchange",()=>{if(location.hash==="#support")legacy.open=true;});}
    try{const response=await fetch("/assets/appstore/catalog.json",{cache:"no-cache"});if(!response.ok)return;const d=await response.json();if(d.schemaVersion!==1)return;catalog=d;render();}catch(_){/* Static content and verified gallery remain available. */}
  },{once:true});
})();
