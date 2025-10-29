import type { CardData } from "./types";

export const givesData: CardData[] = [
  {
    id: "give-1",
    imageUrl: "https://images.unsplash.com/photo-1638202677704-b74690bb8fa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWNrYXRob24lMjBjb2RpbmclMjB0ZWFtd29ya3xlbnwxfHx8fDE3NjE3MjUxOTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "2024 AI 해커톤 대상",
    title: "스마트 뉴스 검열 시스템",
    description: "유해 콘텐츠를 자동으로 차단하는 시스템입니다. 키즈폰, 학교 등에서 사용할 수 있습니다.",
    skills: ["자동 유해 콘텐츠 차단", "실시간 모니터링", "안전한 인터넷"],
    location: "앱 형태 제공",
    duration: "무료 베타 테스트",
    tags: ["AI/ML", "교육"],
    matchingTags: ["content-filter"]
  },
  {
    id: "give-2",
    imageUrl: "https://images.unsplash.com/photo-1744868562210-fffb7fa882d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHRlY2hub2xvZ3klMjBuZXR3b3JraW5nfGVufDF8fHx8MTc2MTcyNTE5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "법무부 공모전 우수상",
    title: "전세 사기 예방 도우미",
    description: "계약서를 업로드하면 위험 요소를 자동으로 찾아주고 법률 정보를 알려줍니다.",
    skills: ["계약서 자동 검토", "위험 요소 표시", "법률 정보 제공"],
    location: "웹/앱 제공",
    duration: "무료 체험 가능",
    tags: ["AI/ML", "법률"],
    matchingTags: ["legal-contract"]
  },
  {
    id: "give-3",
    imageUrl: "https://images.unsplash.com/photo-1603575448878-868a20723f5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjBjb2RpbmclMjBsYXB0b3B8ZW58MXx8fHwxNzYxNjcyNDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "스타트업 해커톤 최우수",
    title: "시각 장애인 길 안내 앱",
    description: "스마트폰 카메라로 장애물을 인식하고 음성으로 안전하게 길을 안내합니다.",
    skills: ["카메라 장애물 인식", "음성 길 안내", "안전 경로 제공"],
    location: "모바일 앱",
    duration: "무료 제공",
    tags: ["AI/ML", "의료/헬스케어"],
    matchingTags: ["vision-navigation"]
  },
  {
    id: "give-4",
    imageUrl: "https://images.unsplash.com/photo-1521391406205-4a6af174a4c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjB1aSUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NjE3MjUxOTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "헬스케어 공모전 금상",
    title: "스마트 건강 모니터링 기기",
    description: "심박수, 활동량, 수면을 측정하고 이상이 있으면 가족에게 자동으로 알려줍니다.",
    skills: ["건강 상태 측정", "이상 징후 감지", "자동 알림"],
    location: "하드웨어+앱",
    duration: "파일럿 프로그램",
    tags: ["IoT", "의료/헬스케어"],
    matchingTags: ["health-monitoring"]
  },
  {
    id: "give-5",
    imageUrl: "https://images.unsplash.com/photo-1615232714706-6b3adc67138b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMGVuZXJneSUyMHN1c3RhaW5hYmxlfGVufDF8fHx8MTc2MTYyMDc2MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "친환경 해커톤 대상",
    title: "스마트 쓰레기 분류함",
    description: "카메라가 쓰레기를 자동으로 구분하고 재활용률을 높여줍니다.",
    skills: ["자동 쓰레기 분류", "재활용 안내", "환경 보호"],
    location: "하드웨어 제공",
    duration: "지자체 시범 운영",
    tags: ["AI/ML", "친환경"],
    matchingTags: ["waste-management"]
  },
  {
    id: "give-6",
    imageUrl: "https://images.unsplash.com/photo-1511189330313-b0af599a6f5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwd2FzdGUlMjByZWN5Y2xpbmd8ZW58MXx8fHwxNzYxNzI1NzQzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "환경부 공모전 최우수",
    title: "음식물 쓰레기 줄이기 앱",
    description: "냉장고 식재료를 관리하고 유통기한 전에 요리법을 추천해서 버리는 음식을 줄입니다.",
    skills: ["식재료 관리", "요리법 추천", "음식 절약"],
    location: "모바일 앱",
    duration: "무료 다운로드",
    tags: ["AI/ML", "친환경"],
    matchingTags: ["waste-management"]
  },
  {
    id: "give-7",
    imageUrl: "https://images.unsplash.com/photo-1744868562210-fffb7fa882d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHRlY2hub2xvZ3klMjBuZXR3b3JraW5nfGVufDF8fHx8MTc2MTcyNTE5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "정신건강 해커톤 우수",
    title: "마음 일기 앱",
    description: "매일의 감정을 기록하면 기분 패턴을 분석하고 정신건강 관리 방법을 알려줍니다.",
    skills: ["감정 기록", "기분 패턴 분석", "건강 관리 팁"],
    location: "웹/앱",
    duration: "무료 체험",
    tags: ["AI/ML", "의료/헬스케어"],
    matchingTags: ["mental-health"]
  },
  {
    id: "give-8",
    imageUrl: "https://images.unsplash.com/photo-1603575448878-868a20723f5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjBjb2RpbmclMjBsYXB0b3B8ZW58MXx8fHwxNzYxNjcyNDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "교육 공모전 금상",
    title: "읽어주는 학습 도구",
    description: "텍스트를 자연스러운 음성으로 읽어주고 속도를 조절할 수 있는 학습 도구입니다.",
    skills: ["텍스트 음성 읽기", "속도 조절", "학습 지원"],
    location: "웹/앱",
    duration: "교육기관 무료",
    tags: ["AI/ML", "교육"],
    matchingTags: ["reading-support"]
  }
];
