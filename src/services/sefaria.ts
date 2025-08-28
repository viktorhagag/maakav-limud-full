
import type { Node } from '@/lib/db'

const BASE = 'https://www.sefaria.org/api'

async function j(url: string){
  const r = await fetch(url)
  if (!r.ok) throw new Error('HTTP '+r.status+' for '+url)
  return await r.json()
}

function A<T>(x:any): T[] { return Array.isArray(x) ? (x as T[]) : [] }
function toHebNum(n: number){
  const map = ['','א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב','יג','יד','טו','טז','יז','יח','יט','כ','כא','כב','כג','כד','כה','כו','כז','כח','כט','ל']
  if (n < map.length) return map[n]
  return String(n)
}

/** ------------------ TANAKH ------------------ **/
export async function buildTanakh(): Promise<Node[]> {
  const nodes: Node[] = []
  nodes.push({ id:'home', title:'ספרים', kind:'card', order:0 })
  nodes.push({ id:'tanakh', title:'תנ״ך', kind:'card', color:'blue', parentId:'home', order:3 })

  const cats = [
    { api: 'Torah', id: 'tanakh:torah', he: 'תורה' },
    { api: 'Prophets', id: 'tanakh:neviim', he: 'נביאים' },
    { api: 'Writings', id: 'tanakh:ketuvim', he: 'כתובים' },
  ]
  for (let i=0;i<cats.length;i++){
    const cat = cats[i]
    nodes.push({ id:cat.id, title:cat.he, kind:'card', color:'blue', parentId:'tanakh', order:i+1 })
    const list = await j(`${BASE}/category/${cat.api}`)
    const books = Array.isArray(list.books) ? list.books as string[] : []
    let order = 1
    for (const b of books) {
      const meta = await j(`${BASE}/index/${encodeURIComponent(b)}`)
      const heb = meta.heTitle as string
      const bid = `${cat.id}:${b.replace(/\s+/g,'_')}`
      nodes.push({ id: bid, title: heb, kind:'card', color:'blue', parentId:cat.id, order: order++ })
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
export async function buildMishnah(): Promise<Node[]> {
  const nodes: Node[] = []
  nodes.push({id:'home', title:'ספרים', kind:'card', order:0})
  nodes.push({id:'mishnah', title:'משנה', kind:'card', color:'brown', parentId:'home', order:2})
  const orders = await j(`${BASE}/category/Mishnah`)
  let o=1
  for (const order of A<any>(orders.contents)) {
    const orderHeb = order.heCategory || order.heTitle || order.he
    const orderId = `mishnah:${(order.category || order.title || 'order').replace(/\s+/g,'_')}`
    nodes.push({id:orderId, title:orderHeb, kind:'card', color:'brown', parentId:'mishnah', order:o++})
    let t=1
    for (const m of A<any>(order.contents)) {
      if (!m.title) continue
      const meta = await j(`${BASE}/index/${encodeURIComponent(m.title)}`)
      const he = meta.heTitle as string
      const mId = `${orderId}:${m.title.replace(/\s+/g,'_')}`
      nodes.push({id:mId, title:he, kind:'card', color:'brown', parentId:orderId, order:t++})
      const perakim: number = (Array.isArray(meta.lengths) && meta.lengths[0]) || 0
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

  const orders = ['Moed','Nashim','Nezikin','Kodashim','Taharot','Zeraim']
  orders.forEach((o,idx)=> nodes.push({id:`gemara:${o.toLowerCase()}`, title:ORDER_HE[o] ?? o, kind:'card', color:'brown', parentId:'gemara', order:idx+1}))

  const cat = await j(`${BASE}/category/Talmud`)
  const bavli = (A<any>(cat.contents)).find((c:any)=>c.category==='Bavli' || c.title==='Bavli')
  if (!bavli) return nodes
  let counters: Record<string, number> = {}
  for (const t of A<any>(bavli.contents)) {
    if (!t.title) continue
    const meta = await j(`${BASE}/index/${encodeURIComponent(t.title)}`)
    const he = meta.heTitle as string
    const eng = meta.title as string
    const orderKey = BAVLI_ORDER[eng] || 'Moed'
    const parentId = `gemara:${orderKey.toLowerCase()}`
    counters[orderKey] = (counters[orderKey] ?? 0) + 1
    const mId = `${parentId}:${eng.replace(/\s+/g,'_')}`
    nodes.push({id:mId, title:he, kind:'card', color:'brown', parentId, order:counters[orderKey]})
    const dafCount = (Array.isArray(meta.lengths) && meta.lengths[0]) || 0
    for (let d=2; d<=dafCount+1; d++){
      const label = d===2 ? 'ב' : toHebNum(d)
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
  for (const t of A<any>(cat.contents)) {
    if (!t.title) continue
    const meta = await j(`${BASE}/index/${encodeURIComponent(t.title)}`)
    const he = meta.heTitle as string
    const mId = `yeru:${t.title.replace(/\s+/g,'_')}`
    nodes.push({id:mId, title:he, kind:'card', color:'grey', parentId:'yeru', order:i++})
    const lengths = meta.lengths || []
    const perakim = Array.isArray(lengths) ? (lengths[0] || 0) : 0
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
    const meta = await j(`${BASE}/index/${encodeURIComponent(part.eng)}`)
    const simanim = (Array.isArray(meta.lengths) && meta.lengths[0]) || 0
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

/** ------------------ RAMBAM ------------------ **/
export async function buildRambam(): Promise<Node[]> {
  const nodes: Node[] = []
  nodes.push({id:'home', title:'ספרים', kind:'card', order:0})
  nodes.push({id:'rambam', title:'רמב״ם', kind:'card', color:'grey', parentId:'home', order:4})

  const root = await j(`${BASE}/category/Mishneh_Torah`)
  let b=1
  for (const book of A<any>(root.contents)) {
    const bookId = `rambam:${(book.title || book.category || 'book').replace(/\s+/g,'_')}`
    nodes.push({id:bookId, title:(book.heTitle || book.heCategory || book.he), kind:'card', color:'grey', parentId:'rambam', order:b++})
    let h=1
    for (const hil of A<any>(book.contents)) {
      if (!hil.title) continue
      const meta = await j(`${BASE}/index/${encodeURIComponent(hil.title)}`)
      const he = meta.heTitle as string
      const hilId = `${bookId}:${hil.title.replace(/\s+/g,'_')}`
      nodes.push({id:hilId, title:he, kind:'card', color:'grey', parentId:bookId, order:h++})
      const chapters = (Array.isArray(meta.lengths) && meta.lengths[0]) || 0
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

/** ------------------ BUILD EVERYTHING (SEQUENTIAL + SAFE) ------------------ **/
export async function buildEverything(): Promise<Node[]> {
  const home: Node[] = [{id:'home', title:'ספרים', kind:'card', order:0}]
  const out: Node[] = [...home]

  async function graft(title:string, color:'blue'|'brown'|'orange'|'grey', prefix:string, fn:()=>Promise<Node[]>, order:number) {
    try {
      const arr = await fn()
      out.push({id:prefix, title, kind:'card', color, parentId:'home', order})
      for (const n of arr) {
        if (n.id==='home') continue
        const nn: Node = { ...n }
        if (!nn.parentId || nn.parentId==='home') nn.parentId = prefix
        out.push(nn)
      }
    } catch (e:any) {
      out.push({id:`${prefix}:ERROR`, title:`שגיאת יבוא: ${title}`, kind:'card', color, parentId:'home', order})
      console.error('IMPORT ERROR for', prefix, e?.message)
    }
  }

  await graft('גמרא','brown','gemara',buildBavli,1)
  await graft('משנה','brown','mishnah',buildMishnah,2)
  await graft('תנ״ך','blue','tanakh',buildTanakh,3)
  await graft('רמב״ם','grey','rambam',buildRambam,4)
  await graft('שולחן ערוך','orange','sa',buildShulchanAruch,5)
  await graft('ירושלמי','grey','yeru',buildYerushalmi,6)

  return out
}
