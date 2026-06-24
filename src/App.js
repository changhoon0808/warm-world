const EXCLUDE_KEYWORDS = [
  "대통령", "국회", "여당", "야당", "선거", "장관", "의원", "정당", "정치", "청와대",
  "민주당", "국민의힘", "대선", "총선", "탄핵", "내각", "국무", "외교", "북한", "대북",
  "배우", "가수", "아이돌", "드라마", "영화", "콘서트", "팬미팅", "데뷔", "컴백",
  "오디션", "시청률", "흥행", "뮤직비디오", "연예인", "스타",
  "사망", "사고", "체포", "구속", "범죄", "살인", "폭행", "사기", "절도",
  "화재", "충돌", "추락", "익사", "피해", "피의자", "수사", "재판", "검찰",
  "우승", "리그", "득점", "야구", "축구", "농구", "배구", "골프", "테니스",
  "주가", "코스피", "코스닥", "증시", "환율", "금리", "부동산", "분양",
  "주식", "펀드", "코인", "비트코인", "기업", "실적", "매출",
  "할인", "이벤트", "프로모션", "출시", "론칭", "신제품", "판매",
];

const SEARCH_KEYWORDS = [
  // 미담/선행
  "할머니 선행", "할아버지 선행", "학생 선행", "시민 구조", "이웃 도움",
  "청년 선행", "어린이 선행", "시민 선행", "군인 선행", "경찰 선행",
  "소방관 감동", "의사 선행", "간호사 감동", "선생님 선행", "운전기사 선행",

  // 나눔/봉사
  "무료 나눔", "기부 감동", "봉사 온정", "재능 기부", "음식 나눔",
  "옷 나눔", "장학금 기부", "익명 기부", "독거노인 봉사", "무료 급식",
  "연탄 봉사", "김장 봉사", "의료 봉사", "도서 기부", "장난감 나눔",

  // 동물
  "유기견 구조", "유기묘 구조", "반려동물 감동", "동물 구조", "강아지 감동",
  "고양이 감동", "동물 사랑", "길고양이 돌봄", "야생동물 구조",

  // 어린이/청소년
  "초등학생 감동", "중학생 선행", "고등학생 선행", "아이 나눔", "어린이 기부",
  "청소년 봉사", "학생 봉사", "아이 선행", "어린이 감동",

  // 가족/사랑
  "부부 감동", "가족 사랑", "노부부 사연", "부모 사랑", "자녀 효도",
  "효자 사연", "효녀 사연", "형제 우애", "가족 감동", "부부 사연",

  // 이웃/공동체
  "이웃 사랑", "마을 감동", "공동체 나눔", "아파트 이웃", "동네 선행",
  "지역사회 봉사", "이웃 돕기", "마을 봉사",

  // 장애/어려운이웃
  "장애인 감동", "다문화 감동", "노인 돌봄", "독거노인 감동", "취약계층 지원",
  "저소득층 지원", "한부모 가정 지원",

  // 기타 따뜻한 이야기
  "감동 사연", "따뜻한 사연", "훈훈한 사연", "미담 화제", "선행 화제",
  "온정 화제", "감사 편지", "인연 감동", "기적 사연", "희망 사연",
];

export default async function handler(req, res) {
  const clientId = process.env.REACT_APP_NAVER_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_NAVER_CLIENT_SECRET;
  const keyword = SEARCH_KEYWORDS[Math.floor(Math.random() * SEARCH_KEYWORDS.length)];

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(keyword)}&display=20&sort=date`,
      {
        headers: {
          "X-Naver-Client-Id": clientId,
          "X-Naver-Client-Secret": clientSecret,
        },
      }
    );
    const data = await response.json();
    if (!data.items) throw new Error("뉴스 없음");

    const filtered = data.items.filter(item => {
      const text = (item.title + item.description).replace(/<[^>]+>/g, "");
      return !EXCLUDE_KEYWORDS.some(kw => text.includes(kw));
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ items: filtered, keyword });
  } catch (error) {
    res.status(500).json({ error: "뉴스를 불러오지 못했습니다." });
  }
}