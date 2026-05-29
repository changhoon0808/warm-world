const EXCLUDE_KEYWORDS = [
  // 정치
  "대통령", "국회", "여당", "야당", "선거", "장관", "의원", "정당", "정치", "청와대",
  "민주당", "국민의힘", "대선", "총선", "탄핵", "내각", "국무", "외교", "북한", "대북",
  // 연예
  "배우", "가수", "아이돌", "드라마", "영화", "콘서트", "팬미팅", "데뷔", "컴백",
  "오디션", "시청률", "흥행", "뮤직비디오", "연예인", "스타", "셀럽",
  // 사건사고
  "사망", "사고", "체포", "구속", "범죄", "살인", "폭행", "사기", "절도",
  "화재", "충돌", "추락", "익사", "피해", "피의자", "수사", "재판", "검찰", "경찰",
  // 스포츠
  "우승", "감독", "리그", "득점", "야구", "축구", "농구", "배구", "골프", "테니스", "올림픽",
  // 경제/주식
  "주가", "코스피", "코스닥", "증시", "환율", "금리", "부동산", "분양", "재건축",
  "주식", "펀드", "코인", "비트코인", "기업", "실적", "매출",
  // 광고성
  "할인", "이벤트", "프로모션", "출시", "론칭", "신제품", "판매",
];

// 따뜻한 뉴스가 많은 네이버 뉴스 카테고리 코드
// sid1=102: 사회, sid1=103: 생활/문화
const CATEGORIES = [
  { sid1: "102", name: "사회" },
  { sid1: "103", name: "생활문화" },
];

const WARM_KEYWORDS = ["미담", "선행", "감동", "나눔", "봉사", "온정", "따뜻"];

export default async function handler(req, res) {
  const clientId = process.env.REACT_APP_NAVER_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_NAVER_CLIENT_SECRET;

  try {
    // 따뜻한 키워드로 사회/생활문화 카테고리에서만 검색
    const keyword = WARM_KEYWORDS[Math.floor(Math.random() * WARM_KEYWORDS.length)];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

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

    // 제외 키워드 필터링
    const filtered = data.items.filter(item => {
      const text = (item.title + item.description).replace(/<[^>]+>/g, "");
      return !EXCLUDE_KEYWORDS.some(kw => text.includes(kw));
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ items: filtered, category: category.name });
  } catch (error) {
    res.status(500).json({ error: "뉴스를 불러오지 못했습니다." });
  }
}