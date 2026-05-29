const EXCLUDE_KEYWORDS = [
  // 정치
  "대통령", "국회", "여당", "야당", "선거", "장관", "의원", "정당", "정치", "청와대", "정부",
  "민주당", "국민의힘", "대선", "총선", "지방선거", "탄핵", "내각", "국무", "외교",
  // 연예
  "배우", "가수", "아이돌", "드라마", "영화", "콘서트", "팬", "데뷔", "컴백",
  "오디션", "시청률", "흥행", "OST", "뮤직비디오", "연예인",
  // 사건사고
  "사망", "사고", "체포", "구속", "범죄", "살인", "폭행", "사기", "절도",
  "화재", "충돌", "추락", "익사", "자살", "피해", "피의자", "수사", "재판",
  // 스포츠
  "골", "승리", "패배", "리그", "우승", "감독", "선수", "경기", "득점",
  "야구", "축구", "농구", "배구", "골프", "테니스",
  // 경제/주식
  "주가", "코스피", "코스닥", "증시", "환율", "금리", "부동산", "아파트",
  "분양", "재건축", "주식", "펀드", "코인", "비트코인",
  // 광고성
  "할인", "이벤트", "프로모션", "출시", "론칭", "신제품",
];

export default async function handler(req, res) {
  const clientId = process.env.REACT_APP_NAVER_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_NAVER_CLIENT_SECRET;
  const keywords = ["미담 사연", "선행 화제", "감동 이야기", "나눔 따뜻", "봉사 온정", "따뜻한 사연"];
  const keyword = keywords[Math.floor(Math.random() * keywords.length)];

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(keyword)}&display=30&sort=date`,
      {
        headers: {
          "X-Naver-Client-Id": clientId,
          "X-Naver-Client-Secret": clientSecret,
        },
      }
    );
    const data = await response.json();
    if (!data.items) throw new Error("뉴스 없음");

    // 제외 키워드가 포함된 뉴스 필터링
    const filtered = data.items.filter(item => {
      const text = (item.title + item.description).replace(/<[^>]+>/g, "");
      return !EXCLUDE_KEYWORDS.some(kw => text.includes(kw));
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ items: filtered });
  } catch (error) {
    res.status(500).json({ error: "뉴스를 불러오지 못했습니다." });
  }
}