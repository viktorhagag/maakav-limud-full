
// PATCH: helper used by buildEverything to merge sections without duplicate ids
export function __graftMerge(prefix:string, title:string, color:'blue'|'brown'|'orange'|'grey', arr:Node[], order:number): Node[] {
  const out: Node[] = []
  out.push({id:prefix, title, kind:'card', color, parentId:'home', order})
  for (const n of arr) {
    if (n.id==='home' || n.id===prefix) continue; // avoid duplicate ids
    const nn: Node = { ...n }
    if (!nn.parentId || nn.parentId==='home') nn.parentId = prefix
    out.push(nn)
  }
  return out
}
