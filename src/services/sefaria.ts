import type { Node } from '@/lib/db'

const BASE = 'https://www.sefaria.org/api'

async function j(url: string){
  const r = await fetch(url)
  if (!r.ok) throw new Error('HTTP '+r.status+' for '+url)
  return await r.json()
}

function toHebNum(n: number){
  const map = ['','א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב','יג','יד','טו','טז','יז','יח','יט','כ','כא','כב','כג','כד','כה','כו','כז','כח','כט','ל']
  if (n < map.length) return map[n]
  return String(n)
}

/** ------------------ TANAKH ------------------ **/
// Tanakh -> Torah/Prophets/Writings -> Books -> Chapters
export async function buildTanakh(): Promise<Node[]> {
  const nodes: Node[] = []
  nodes.push({ id:'home', title:'ספרים', kind:'card', order:0 })
  const tanakh: Node = { id:'tanakh', title:'תנ״ך', kind:'card', color:'blue', parentId:'home', order:3 }
  nodes.push(tanakh)
  const cats = ['Torah','Prophets','Writings']
  const hebCats = ['תורה','נביאים','כתובים']
  for (let i=0;i<cats.length;i++){
    const catId = ['tanakh:torah','tanakh:neviim','tanakh:ketuvim'][i]
    nodes.push({ id:catId, title:hebCats[i], kind:'card', color:'blue', parentId:'tanakh', order:i+1 })
    const list = await j(`${BASE}/category/${cats[i]}`)
    let order = 1
    for (const b of (list.books as string[])) {
      const meta = await j(`${BASE}/index/${encodeURIComponent(b)}`)
      const heb = meta.heTitle as string
      const bid = `${catId}:${b.replace(/\s+/g,'_')}`
      nodes.push({ id: bid, title: heb, kind:'card', color:'blue', parentId:catId, order: order++ })
      // chapters count
      const lengths = meta.lengths || meta?.schema?.lengths || []
      const chapCount = Array.isArray(lengths) ? (lengths[0] || 0) : 0
      for (let c=1; c<=chapCount; c++){
        nodes.push({ id:`${bid}:${c}`, title:`פרק ${toHebNum(c)}`, kind:'check', parentId: bid, order:c })
      }
    }
  }
  return nodes
}

/** ------------------ MISHNAH ------------------ **/
// Mishnah -> Orders -> Tractates -> Perakim -> Mishnayot
export async function buildMishnah(): Promise<Node[]> {
  const nodes: Node[] = []
  nodes.push({id:'home', title:'ספרים', kind:'card', order:0})
  const rootId = 'mishnah'
  nodes.push({id:rootId, title:'משנה', kind:'card', color:'brown', parentId:'home', order:2})
  const orders = await j(`${BASE}/category/Mishnah`)
  let o=1
  for (const order of orders.contents as any[]) {
    const orderHeb = order.heCategory || order.heTitle
    const orderId = `${rootId}:${(order.category || order.title).replace(/\s+/g,'_')}`
    nodes.push({id:orderId, title:orderHeb, kind:'card', color:'brown', parentId:rootId, order:o++})
    let t=1
    for (const m of order.contents as any[]) {
      if (!m.title) continue
      const meta = await j(`${BASE}/index/${encodeURIComponent(m.title)}`)
      const he = meta.heTitle as string
      const mId = `${orderId}:${m.title.replace(/\s+/g,'_')}`
      nodes.push({id:mId, title:he, kind:'card', color:'brown', parentId:orderId, order:t++})
      const perakim: number = (meta.lengths && meta.lengths[0]) || 0
      for (let p=1;p<=perakim;p++){
        const pId = `${mId}:${p}`
        nodes.push({id:pId, title:`פרק ${toHebNum(p)}`, kind:'card', color:'brown', parentId:mId, order:p})
        const chapMeta = await j(`${BASE}/texts/${encodeURIComponent(m.title)}.${p}?lang=he`)
        const mishCount = Array.isArray(chapMeta.he) ? chapMeta.he.length : 0
        for (let mi=1;mi<=mishCount;mi++){
          nodes.push({id:`${pId}:${mi}`, title:`משנה ${toHebNum(mi)}`, kind:'check', parentId:pId, order:mi})
        }
      }
    }
  }
  return nodes
}

/** ------------------ TALMUD BAVLI ------------------ **/
// Bavli -> Orders (Moed/Nashim/Nezikin/Kodashim/Taharot/Zeraim*) -> Tractates -> Dafim
// We use a static mapping for grouping; daf count from index.lengths[0].
const BAVLI_ORDER: Record<string, string> = {
  'Berakhot':'Zeraim',
  'Shabbat':'Moed','Eruvin':'Moed','Pesachim':'Moed','Shekalim':'Moed','Rosh Hashanah':'Moed','Yoma':'Moed','Sukkah':'Moed','Beitzah':'Moed','Taanit':'Moed','Megillah':'Moed','Moed Katan':'Moed','Chagigah':'Moed',
  'Yevamot':'Nashim','Ketubot':'Nashim','Nedarim':'Nashim','Nazir':'Nashim','Sotah':'Nashim','Gittin':'Nashim','Kiddushin':'Nashim','Niddah':'Taharot',
  'Bava Kamma':'Nezikin','Bava Metzia':'Nezikin','Bava Batra':'Nezikin','Sanhedrin':'Nezikin','Makkot':'Nezikin','Shevuot':'Nezikin','Avodah Zarah':'Nezikin','Horayot':'Nezikin',
  'Zevachim':'Kodashim','Menachot':'Kodashim','Chullin':'Kodashim','Bekhorot':'Kodashim','Arakhin':'Kodashim','Temurah':'Kodashim','Keritot':'Kodashim','Meilah':'Kodashim','Tamid':'Kodashim','Middot':'Kodashim'
}
const ORDER_HE: Record<string,string> = { Zeraim:'זרעים', Moed:'מועד', Nashim:'נשים', Nezikin:'נזיקין', Kodashim:'קדשים', Taharot:'טהרות' }

export async function buildBavli(): Promise<Node[]> {
  const nodes: Node[] = []
  nodes.push({id:'home', title:'ספרים', kind:'card', order:0})
  nodes.push({id:'gemara', title:'גמרא', kind:'card', color:'brown', parentId:'home', order:1})

  // orders
  const orders = ['Moed','Nashim','Nezikin','Kodashim','Taharot','Zeraim']
  orders.forEach((o,idx)=> nodes.push({id:`gemara:${o.toLowerCase()}`, title:ORDER_HE[o] ?? o, kind:'card', color:'brown', parentId:'gemara', order:idx+1}))

  // fetch list of Bavli tractates
  const cat = await j(`${BASE}/category/Talmud`)
  const bavli = (cat?.contents || []).find((c:any)=>c.category==='Bavli' || c.title==='Bavli')
  if (!bavli) return nodes
  let counters: Record<string, number> = {}
  for (const t of (bavli.contents as any[])) {
    if (!t.title) continue
    const meta = await j(`${BASE}/index/${encodeURIComponent(t.title)}`)
    const he = meta.heTitle as string
    const eng = meta.title as string
    const orderKey = BAVLI_ORDER[eng] || 'Moed'
    const parentId = `gemara:${orderKey.toLowerCase()}`
    counters[orderKey] = (counters[orderKey] ?? 0) + 1
    const mId = `${parentId}:${eng.replace(/\s+/g,'_')}`
    nodes.push({id:mId, title:he, kind:'card', color:'brown', parentId, order:counters[orderKey]})
    const dafCount = (meta.lengths && meta.lengths[0]) || 0
    for (let d=2; d<=dafCount+1; d++){
      const label = d===2 ? 'ב' : toHebNum(d) // start from דף ב כמו בסריקות
      nodes.push({id:`${mId}:${d}`, title:`דף ${label}`, kind:'check', parentId:mId, order:d-1})
    }
  }
  return nodes
}

/** ------------------ JERUSALEM TALMUD ------------------ **/
export async function buildYerushalmi(): Promise<Node[]> {
  const nodes: Node[] = []
  nodes.push({id:'home', title:'ספרים', kind:'card', order:0})
  nodes.push({id:'yeru', title:'ירושלמי', kind:'card', color:'grey', parentId:'home', order:6})
  const cat = await j(`${BASE}/category/Jerusalem_Talmud`)
  let i=1
  for (const t of (cat.contents as any[])) {
    if (!t.title) continue
    const meta = await j(`${BASE}/index/${encodeURIComponent(t.title)}`)
    const he = meta.heTitle as string
    const mId = `yeru:${t.title.replace(/\s+/g,'_')}`
    nodes.push({id:mId, title:he, kind:'card', color:'grey', parentId:'yeru', order:i++})
    const lengths = meta.lengths || []
    const perakim = lengths[0] || 0
    for (let p=1;p<=perakim;p++){
      const pId = `${mId}:${p}`
      nodes.push({id:pId, title:`פרק ${toHebNum(p)}`, kind:'card', color:'grey', parentId:mId, order:p})
      const chapMeta = await j(`${BASE}/texts/${encodeURIComponent(t.title)}.${p}?lang=he`)
      const sugyaCount = Array.isArray(chapMeta.he) ? chapMeta.he.length : 0
      for (let s=1;s<=sugyaCount;s++){
        nodes.push({id:`${pId}:${s}`, title:`סוגיה ${toHebNum(s)}`, kind:'check', parentId:pId, order:s})
      }
    }
  }
  return nodes
}

/** ------------------ SHULCHAN ARUCH ------------------ **/
const SA_PARTS = [
  { eng: 'Shulchan Arukh, Orach Chayim', he: 'אורח חיים' },
  { eng: 'Shulchan Arukh, Yoreh Deah', he: 'יורה דעה' },
  { eng: 'Shulchan Arukh, Even HaEzer', he: 'אבן העזר' },
  { eng: 'Shulchan Arukh, Choshen Mishpat', he: 'חושן משפט' }
]

export async function buildShulchanAruch(): Promise<Node[]> {
  const nodes: Node[] = []
  nodes.push({id:'home', title:'ספרים', kind:'card', order:0})
  nodes.push({id:'sa', title:'שולחן ערוך', kind:'card', color:'orange', parentId:'home', order:5})

  let idx=1
  for (const part of SA_PARTS) {
    const partId = `sa:${part.eng.replace(/\s+/g,'_')}`
    nodes.push({id:partId, title:part.he, kind:'card', color:'orange', parentId:'sa', order:idx++})
    // number of simanim from index.lengths[0]
    const meta = await j(`${BASE}/index/${encodeURIComponent(part.eng)}`)
    const simanim = (meta.lengths && meta.lengths[0]) || 0
    for (let s=1;s<=simanim;s++){
      const simanId = `${partId}:${s}`
      nodes.push({id:simanId, title:`סימן ${toHebNum(s)}`, kind:'card', color:'orange', parentId:partId, order:s})
      const chap = await j(`${BASE}/texts/${encodeURIComponent(part.eng)}.${s}?lang=he`)
      const seifCount = Array.isArray(chap.he) ? chap.he.length : 0
      for (let se=1; se<=seifCount; se++){
        nodes.push({id:`${simanId}:${se}`, title:`סעיף ${toHebNum(se)}`, kind:'check', parentId:simanId, order:se})
      }
    }
  }
  return nodes
}

/** ------------------ RAMBAM (Mishneh Torah) ------------------ **/
// Mishneh Torah -> Books -> Hilchot -> Chapters -> Halachot
export async function buildRambam(): Promise<Node[]> {
  const nodes: Node[] = []
  nodes.push({id:'home', title:'ספרים', kind:'card', order:0})
  nodes.push({id:'rambam', title:'רמב״ם', kind:'card', color:'grey', parentId:'home', order:4})

  const root = await j(`${BASE}/category/Mishneh_Torah`)
  let b=1
  for (const book of (root.contents as any[])) {
    const bookId = `rambam:${(book.title || book.category).replace(/\s+/g,'_')}`
    nodes.push({id:bookId, title:(book.heTitle || book.heCategory), kind:'card', color:'grey', parentId:'rambam', order:b++})
    let h=1
    for (const hil of (book.contents as any[])) {
      if (!hil.title) continue
      const meta = await j(`${BASE}/index/${encodeURIComponent(hil.title)}`)
      const he = meta.heTitle as string
      const hilId = `${bookId}:${hil.title.replace(/\s+/g,'_')}`
      nodes.push({id:hilId, title:he, kind:'card', color:'grey', parentId:bookId, order:h++})
      const chapters = (meta.lengths && meta.lengths[0]) || 0
      for (let p=1;p<=chapters;p++){
        const pId = `${hilId}:${p}`
        nodes.push({id:pId, title:`פרק ${toHebNum(p)}`, kind:'card', color:'grey', parentId:hilId, order:p})
        const chap = await j(`${BASE}/texts/${encodeURIComponent(hil.title)}.${p}?lang=he`)
        const halCount = Array.isArray(chap.he) ? chap.he.length : 0
        for (let ha=1; ha<=halCount; ha++){
          nodes.push({id:`${pId}:${ha}`, title:`הלכה ${toHebNum(ha)}`, kind:'check', parentId:pId, order:ha})
        }
      }
    }
  }
  return nodes
}

/** ------------------ BUILD EVERYTHING ------------------ **/
export async function buildEverything(): Promise<Node[]> {
  // Compose under one 'home' with category cards (gemara/mishnah/tanakh/rambam/sa/yeru)
  const [tanakh, mishnah, bavli, sa, rambam, yeru] = await Promise.all([
    buildTanakh(), buildMishnah(), buildBavli(), buildShulchanAruch(), buildRambam(), buildYerushalmi()
  ])
  function graft(title:string, color:'blue'|'brown'|'orange'|'grey', prefix:string, arr:Node[], order:number): Node[] {
    const out: Node[] = []
    out.push({id:prefix, title, kind:'card', color, parentId:'home', order})
    const byId = new Map(arr.map(n=>[n.id,n]))
    // attach only nodes that are not 'home'
    for (const n of arr) {
      if (n.id==='home') continue
      const nn: Node = { ...n }
      if (!nn.parentId || nn.parentId==='home') nn.parentId = prefix
      out.push(nn)
    }
    return out
  }
  const home: Node[] = [{id:'home', title:'ספרים', kind:'card', order:0}]
  return [
    ...home,
    ...graft('גמרא','brown','gemara',bavli,1),
    ...graft('משנה','brown','mishnah',mishnah,2),
    ...graft('תנ״ך','blue','tanakh',tanakh,3),
    ...graft('רמב״ם','grey','rambam',rambam,4),
    ...graft('שולחן ערוך','orange','sa',sa,5),
    ...graft('ירושלמי','grey','yeru',yeru,6),
  ]
}
