import { useState, useEffect } from "react";

const CATEGORIES = ["전체", "미담", "사랑", "동물", "어린이", "이웃", "나눔"];
const BAD_WORDS = ["욕설","바보","멍청","죽어","싫어","최악","쓰레기","꺼져","짜증","hate","stupid","idiot","trash"];
const CAT_META = {
  "미담": { emoji:"🌟", bg:"linear-gradient(135deg,#FDE8C8,#FDDBA0)", accent:"#E8A030" },
  "사랑": { emoji:"💕", bg:"linear-gradient(135deg,#FDD8D8,#FAB8C0)", accent:"#D05070" },
  "동물": { emoji:"🐾", bg:"linear-gradient(135deg,#D8EDD8,#B8D8B0)", accent:"#508050" },
  "어린이": { emoji:"🧒", bg:"linear-gradient(135deg,#D8E8F8,#B8D0F0)", accent:"#4070B0" },
  "이웃": { emoji:"🏘️", bg:"linear-gradient(135deg,#F0E0C8,#E8D0A8)", accent:"#906840" },
  "나눔": { emoji:"🤝", bg:"linear-gradient(135deg,#E0D8F8,#C8C0F0)", accent:"#6050A0" },
};

const NEWS_KEYWORDS = ["미담", "선행", "감동", "나눔", "봉사", "온정", "따뜻한 이야기"];

const SAMPLE_POSTS = [
  { id:1, category:"미담", title:"버스에서 쓰러진 할머니를 구한 고등학생", summary:"지난 주 서울 버스 안에서 갑자기 쓰러진 70대 할머니를 17살 고등학생이 심폐소생술로 살려냈습니다. 학교에서 배운 응급처치가 실제 생명을 구했습니다.", source:"실화 제보", likes:342, time:"오늘", isNews:false, comments:[{id:1,author:"따뜻한봄",text:"이런 청년이 있다니 정말 감동이에요.",time:"2시간 전"},{id:2,author:"희망씨앗",text:"학교 교육이 이렇게 빛을 발하는군요!",time:"1시간 전"}]},
  { id:2, category:"동물", title:"10년 동안 할아버지 곁을 지킨 강아지", summary:"치매를 앓던 85세 할아버지의 마지막 순간까지 병원 침대 옆에서 자리를 지킨 반려견 '달이'의 이야기가 많은 이들의 눈물을 자아내고 있습니다.", source:"독자 제보", likes:578, time:"어제", isNews:false, comments:[{id:1,author:"달빛",text:"달이처럼 순수한 사랑이 세상에서 제일 아름다워요.",time:"3시간 전"}]},
  { id:3, category:"나눔", title:"매일 새벽 독거노인 도시락 배달하는 30대 직장인", summary:"5년째 매일 새벽 5시에 일어나 혼자 사는 어르신 12명에게 손수 만든 도시락을 배달하는 회사원 김모씨.", source:"뉴스 기사", likes:891, time:"2일 전", isNews:false, comments:[]},
];

function hasBadWord(t) { return BAD_WORDS.some(w=>t.toLowerCase().includes(w)); }

function CardBanner({ category }) {
  const m = CAT_META[category] || CAT_META["미담"];
  return <div style={{background:m.bg, height:130, display:"flex", alignItems:"center", justifyContent:"center", fontSize:52}}>{m.emoji}</div>;
}

function NewsTag({ isNews }) {
  if (!isNews) return null;
  return <span style={{fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:8, background:"#E8F4FD", color:"#2980B9", marginLeft:6, border:"1px solid #AED6F1"}}>📰 뉴스</span>;
}

export default function App() {
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [cat, setCat] = useState("전체");
  const [liked, setLiked] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [comment, setComment] = useState("");
  const [commentErr, setCommentErr] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [showWrite, setShowWrite] = useState(false);
  const [newPost, setNewPost] = useState({title:"", category:"미담", text:""});
  const [writeErr, setWriteErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [newsLoading, setNewsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  const filtered = posts.filter(p =>
    (cat === "전체" || p.category === cat) &&
    (search === "" || p.title.includes(search) || p.summary.includes(search))
  );
  const expandedPost = posts.find(p => p.id === expanded);

  async function fetchNaverNews() {
    setNewsLoading(true);
    try {
      const clientId = process.env.REACT_APP_NAVER_CLIENT_ID;
      const clientSecret = process.env.REACT_APP_NAVER_CLIENT_SECRET;
      const keyword = NEWS_KEYWORDS[Math.floor(Math.random() * NEWS_KEYWORDS.length)];
      const res = await fetch(`/api/news`);
      const data = await res.json();
      if (data.items) {
        const newItems = data.items.map((item, i) => ({
          id: Date.now() + i,
          category: getCategoryFromTitle(item.title),
          title: item.title.replace(/<[^>]+>/g, ""),
          summary: item.description.replace(/<[^>]+>/g, ""),
          source: item.originallink || "네이버 뉴스",
          link: item.link,
          likes: 0,
          time: "방금",
          isNews: true,
          comments: []
        }));
        setPosts(prev => {
          const existingIds = new Set(prev.filter(p => p.isNews).map(p => p.title));
          const filtered = newItems.filter(p => !existingIds.has(p.title));
          return [...filtered, ...prev].slice(0, 50);
        });
        setLastFetched(new Date().toLocaleTimeString("ko-KR"));
      }
    } catch(e) {
      console.error("뉴스 불러오기 실패:", e);
    }
    setNewsLoading(false);
  }

  function getCategoryFromTitle(title) {
    if (title.includes("동물") || title.includes("강아지") || title.includes("고양이")) return "동물";
    if (title.includes("아이") || title.includes("어린이") || title.includes("학생")) return "어린이";
    if (title.includes("사랑") || title.includes("부부") || title.includes("가족")) return "사랑";
    if (title.includes("나눔") || title.includes("기부") || title.includes("봉사")) return "나눔";
    if (title.includes("이웃") || title.includes("마을") || title.includes("동네")) return "이웃";
    return "미담";
  }

  useEffect(() => { fetchNaverNews(); }, []);

  function toggleLike(id, e) {
    if (e) e.stopPropagation();
    setLiked(prev => ({...prev, [id]: !prev[id]}));
    setPosts(prev => prev.map(p => p.id === id ? {...p, likes: p.likes + (liked[id] ? -1 : 1)} : p));
  }

  function submitComment() {
    if (!comment.trim()) return;
    if (hasBadWord(comment)) { setCommentErr("따뜻한 세상에는 따뜻한 말만 담겨요 🌸 좋은 말로 다시 작성해 주세요."); return; }
    setPosts(prev => prev.map(p => p.id === expanded ? {...p, comments: [...p.comments, {id:Date.now(), author:authorName.trim()||"익명의 이웃", text:comment, time:"방금"}]} : p));
    setComment(""); setAuthorName(""); setCommentErr("");
  }

  async function submitPost() {
    if (!newPost.title.trim() || !newPost.text.trim()) { setWriteErr("제목과 내용을 모두 입력해 주세요."); return; }
    if (hasBadWord(newPost.title) || hasBadWord(newPost.text)) { setWriteErr("따뜻한 이야기만 나눌 수 있는 공간이에요."); return; }
    setLoading(true); setWriteErr("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({model:"claude-sonnet-4-20250514", max_tokens:1000, system:"당신은 따뜻한 이야기 게시판의 편집자입니다. 사용자가 제출한 이야기를 감동적이고 따뜻하게 2-3문장으로 요약해 주세요. 반드시 순수한 한국어로 답하고, 요약문만 출력하세요.", messages:[{role:"user", content:`제목: ${newPost.title}\n내용: ${newPost.text}`}]})});
      const data = await res.json();
      const summary = data.content?.[0]?.text || newPost.text.slice(0, 100);
      setPosts(prev => [{id:Date.now(), category:newPost.category, title:newPost.title, summary, source:"독자 제보", likes:0, comments:[], time:"방금", isNews:false}, ...prev]);
      setNewPost({title:"", category:"미담", text:""}); setShowWrite(false);
    } catch { setWriteErr("잠시 문제가 생겼어요. 다시 시도해 주세요."); }
    setLoading(false);
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; background: #FDF6EE; font-family: 'Gowun Dodum', sans-serif; }
    .card { background:#FFFAF4; border:1.5px solid #F2D9BB; border-radius:18px; overflow:hidden; cursor:pointer; transition:transform 0.15s, box-shadow 0.15s; }
    .card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(180,120,60,0.10); }
    input, textarea, select { font-family: 'Gowun Dodum', sans-serif; }
  `;

  return (
    <div style={{background:"#FDF6EE", minHeight:"100vh", fontFamily:"'Gowun Dodum',sans-serif"}}>
      <style>{css}</style>
      <div style={{background:"linear-gradient(160deg,#FDE8D0,#FDF0E0 50%,#FCF4E8)", textAlign:"center", padding:"2.5rem 1rem 2rem", borderBottom:"1.5px solid #F2D9BB"}}>
        <div style={{fontSize:44, marginBottom:6}}>🌸</div>
        <h1 style={{fontSize:26, fontWeight:700, color:"#7A4A2A", margin:"0 0 6px"}}>따뜻한 세상</h1>
        <p style={{fontSize:14, color:"#B07850", margin:"0 0 12px"}}>세상의 좋은 이야기를 모아요 — 오늘도 누군가 좋은 일을 하고 있어요</p>
        <button onClick={fetchNaverNews} disabled={newsLoading}
          style={{padding:"8px 20px", borderRadius:20, border:"1.5px solid #E8A87C", background:"#FDE8D0", color:"#7A4A2A", cursor:"pointer", fontSize:13, fontWeight:600}}>
          {newsLoading ? "🔄 뉴스 불러오는 중..." : "📰 따뜻한 뉴스 불러오기"}
        </button>
        {lastFetched && <p style={{fontSize:12, color:"#C09070", margin:"6px 0 0"}}>마지막 업데이트: {lastFetched}</p>}
      </div>

      <div style={{maxWidth:680, margin:"0 auto", padding:"1.25rem 1rem 3rem"}}>
        {!expanded ? (<>
          <div style={{display:"flex", gap:8, marginBottom:"1rem"}}>
            <input style={{flex:1, padding:"9px 14px", borderRadius:20, border:"1.5px solid #F2D9BB", background:"#FFFAF4", color:"#5A3820", fontSize:14}} placeholder="🔍  이야기 검색..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <button onClick={()=>setShowWrite(!showWrite)} style={{padding:"9px 18px", borderRadius:20, border:"1.5px solid #E8A87C", background:"#FDE8D0", color:"#7A4A2A", cursor:"pointer", fontSize:13, fontWeight:600, whiteSpace:"nowrap"}}>✏️ 이야기 올리기</button>
          </div>

          {showWrite && (
            <div style={{background:"#FFF8F0", border:"1.5px solid #F2D9BB", borderRadius:16, padding:"1.25rem", marginBottom:"1.25rem"}}>
              <p style={{fontWeight:700, fontSize:15, color:"#7A4A2A", margin:"0 0 12px"}}>🌻 내 주변의 따뜻한 이야기를 나눠요</p>
              <input style={{width:"100%", marginBottom:8, padding:"9px 13px", borderRadius:12, border:"1.5px solid #F2D9BB", background:"#FFFAF4", color:"#5A3820", fontSize:14}} placeholder="제목" value={newPost.title} onChange={e=>setNewPost({...newPost,title:e.target.value})}/>
              <select style={{width:"100%", marginBottom:8, padding:"9px 13px", borderRadius:12, border:"1.5px solid #F2D9BB", background:"#FFFAF4", color:"#5A3820", fontSize:14}} value={newPost.category} onChange={e=>setNewPost({...newPost,category:e.target.value})}>
                {CATEGORIES.filter(c=>c!=="전체").map(c=><option key={c}>{c}</option>)}
              </select>
              <textarea style={{width:"100%", marginBottom:8, padding:"9px 13px", borderRadius:12, border:"1.5px solid #F2D9BB", background:"#FFFAF4", color:"#5A3820", fontSize:14, resize:"vertical"}} placeholder="이야기를 들려주세요..." rows={4} value={newPost.text} onChange={e=>setNewPost({...newPost,text:e.target.value})}/>
              {writeErr && <p style={{fontSize:12, color:"#B05030", margin:"0 0 8px", padding:"7px 11px", background:"#FDE8D0", borderRadius:10}}>🌸 {writeErr}</p>}
              <div style={{display:"flex", gap:8}}>
                <button style={{flex:1, padding:"9px 0", borderRadius:12, border:"1.5px solid #E8A87C", background:"#FDE8D0", color:"#7A4A2A", cursor:"pointer", fontSize:14, fontWeight:600}} onClick={submitPost} disabled={loading}>{loading?"AI가 따뜻하게 다듬는 중...":"이야기 올리기 🌸"}</button>
                <button style={{padding:"9px 16px", borderRadius:12, border:"1.5px solid #F2D9BB", background:"transparent", color:"#B07850", cursor:"pointer", fontSize:14}} onClick={()=>setShowWrite(false)}>취소</button>
              </div>
            </div>
          )}

          <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:"1.25rem"}}>
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setCat(c)} style={{padding:"6px 14px", borderRadius:20, fontSize:13, border:"1.5px solid", borderColor:cat===c?"#E8A87C":"#F2D9BB", background:cat===c?"#FDE8D0":"#FFFAF4", color:cat===c?"#7A4A2A":"#B07850", cursor:"pointer", fontWeight:cat===c?600:400}}>
                {CAT_META[c]?.emoji||""} {c}
              </button>
            ))}
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:16}}>
            {filtered.length===0 && <p style={{color:"#C09070", padding:"2rem 0", gridColumn:"1/-1", textAlign:"center"}}>이야기를 찾을 수 없어요 🌿</p>}
            {filtered.map(post=>(
              <div key={post.id} className="card" onClick={()=>setExpanded(post.id)}>
                <CardBanner category={post.category}/>
                <div style={{padding:"14px 16px"}}>
                  <div style={{display:"flex", alignItems:"center", marginBottom:8}}>
                    <span style={{fontSize:11, fontWeight:600, padding:"2px 9px", borderRadius:10, background:"#FDE8D0", color:"#9A5530"}}>
                      {CAT_META[post.category]?.emoji} {post.category}
                    </span>
                    <NewsTag isNews={post.isNews}/>
                  </div>
                  <h3 style={{fontSize:15, fontWeight:700, color:"#5A3820", margin:"0 0 6px", lineHeight:1.4}}>{post.title}</h3>
                  <p style={{fontSize:13, color:"#9A7060", margin:"0 0 10px", lineHeight:1.65, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden"}}>{post.summary}</p>
                  <div style={{display:"flex", alignItems:"center", gap:14, borderTop:"1px solid #F2D9BB", paddingTop:10}}>
                    <button onClick={e=>toggleLike(post.id,e)} style={{display:"flex", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer", color:liked[post.id]?"#D45A5A":"#C09070", fontSize:13, padding:0, fontWeight:600}}>
                      {liked[post.id]?"♥":"♡"} {post.likes}
                    </button>
                    <span style={{fontSize:13, color:"#C09070"}}>💬 {post.comments.length}</span>
                    <span style={{fontSize:12, color:"#C5A890", marginLeft:"auto"}}>{post.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>) : expandedPost ? (<>
          <button onClick={()=>{setExpanded(null);setCommentErr("");setComment("");}} style={{display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:"#B07850", fontSize:13, padding:"0 0 1rem"}}>← 목록으로 돌아가기</button>
          <div style={{background:"#FFFAF4", border:"1.5px solid #F2D9BB", borderRadius:18, overflow:"hidden"}}>
            <CardBanner category={expandedPost.category}/>
            <div style={{padding:"1.25rem"}}>
              <div style={{display:"flex", alignItems:"center", marginBottom:10}}>
                <span style={{fontSize:11, fontWeight:600, padding:"2px 9px", borderRadius:10, background:"#FDE8D0", color:"#9A5530"}}>
                  {CAT_META[expandedPost.category]?.emoji} {expandedPost.category}
                </span>
                <NewsTag isNews={expandedPost.isNews}/>
              </div>
              <h2 style={{fontSize:20, fontWeight:700, color:"#5A3820", margin:"0 0 8px", lineHeight:1.35}}>{expandedPost.title}</h2>
              <p style={{fontSize:12, color:"#C5A890", margin:"0 0 12px"}}>{expandedPost.time} · {expandedPost.source}</p>
              <p style={{fontSize:14, lineHeight:1.85, color:"#7A5A48", margin:"0 0 14px"}}>{expandedPost.summary}</p>
              {expandedPost.link && (
                <a href={expandedPost.link} target="_blank" rel="noopener noreferrer"
                  style={{display:"inline-block", fontSize:13, color:"#7A4A2A", padding:"7px 14px", borderRadius:10, border:"1.5px solid #E8A87C", background:"#FDE8D0", textDecoration:"none", marginBottom:14}}>
                  📰 원문 기사 보기
                </a>
              )}
              <hr style={{border:"none", borderTop:"1px solid #F2D9BB", margin:"12px 0"}}/>
              <button onClick={()=>toggleLike(expandedPost.id,null)} style={{display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:liked[expandedPost.id]?"#D45A5A":"#C09070", fontSize:14, padding:0, fontWeight:600, marginBottom:"1rem"}}>
                {liked[expandedPost.id]?"♥":"♡"} {expandedPost.likes} 감동받았어요
              </button>
              <hr style={{border:"none", borderTop:"1px solid #F2D9BB", margin:"12px 0"}}/>
              <p style={{fontWeight:700, fontSize:14, color:"#7A4A2A", margin:"0.75rem 0 10px"}}>댓글 {expandedPost.comments.length}개</p>
              {expandedPost.comments.map(c=>(
                <div key={c.id} style={{padding:"10px 0", borderBottom:"1px solid #F2D9BB"}}>
                  <div style={{display:"flex", justifyContent:"space-between"}}>
                    <span style={{fontWeight:700, fontSize:13, color:"#7A4A2A"}}>{c.author}</span>
                    <span style={{fontSize:11, color:"#C5A890"}}>{c.time}</span>
                  </div>
                  <p style={{margin:"4px 0 0", fontSize:13, color:"#9A7060", lineHeight:1.6}}>{c.text}</p>
                </div>
              ))}
              <input style={{width:"100%", marginTop:"0.75rem", padding:"8px 12px", borderRadius:12, border:"1.5px solid #F2D9BB", background:"#FFF8F0", color:"#5A3820", fontSize:13}} placeholder="닉네임 (선택)" value={authorName} onChange={e=>setAuthorName(e.target.value)}/>
              <div style={{display:"flex", gap:8, marginTop:6}}>
                <input style={{flex:1, padding:"8px 12px", borderRadius:12, border:"1.5px solid #F2D9BB", background:"#FFF8F0", color:"#5A3820", fontSize:13}} placeholder="따뜻한 댓글을 남겨주세요 🌸" value={comment} onChange={e=>{setComment(e.target.value);setCommentErr("");}} onKeyDown={e=>e.key==="Enter"&&submitComment()}/>
                <button onClick={submitComment} style={{padding:"8px 15px", borderRadius:12, border:"1.5px solid #E8A87C", background:"#FDE8D0", color:"#7A4A2A", cursor:"pointer", fontSize:13, fontWeight:600}}>등록</button>
              </div>
              {commentErr && <p style={{fontSize:12, color:"#B05030", padding:"7px 11px", background:"#FDE8D0", borderRadius:10, marginTop:6}}>🌸 {commentErr}</p>}
            </div>
          </div>
        </>) : null}
      </div>
    </div>
  );
}