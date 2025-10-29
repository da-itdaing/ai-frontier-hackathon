import type { CardData } from "./types";

export const needsData: CardData[] = [
  {
    id: "need-1",
    imageUrl: "https://images.unsplash.com/photo-1647188443883-9be7cee25341?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZCUyMHBob25lJTIwcGFyZW50YWwlMjBjb250cm9sfGVufDF8fHx8MTc2MTcyNTQ3MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "초등학생 학부모",
    title: "유해 콘텐츠 필터링이 필요해요",
    description: "아이가 키즈폰으로 유해한 뉴스나 영상을 접하는 것이 걱정됩니다. 자동으로 필터링해주는 솔루션이 필요합니다.",
    skills: ["자동 콘텐츠 차단", "유해 정보 감지", "어린이 보호"],
    location: "전국",
    duration: "즉시 필요",
    tags: ["교육", "안전"],
    matchingTags: ["content-filter"]
  },
  {
    id: "need-2",
    imageUrl: "https://images.unsplash.com/photo-1758518731462-d091b0b4ed0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWdhbCUyMGNvbnN1bHRhdGlvbiUyMGNvbnRyYWN0fGVufDF8fHx8MTc2MTcyNTQ3MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "전세 계약 예정자",
    title: "전세 사기 예방 상담 필요",
    description: "전세 계약 전에 사기 여부를 확인하고 싶습니다. 법률 전문가의 도움 없이도 쉽게 확인할 수 있는 방법이 필요합니다.",
    skills: ["계약서 검토", "사기 위험 확인", "법률 정보 제공"],
    location: "서울/경기",
    duration: "계약 전",
    tags: ["법률", "주거"],
    matchingTags: ["legal-contract"]
  },
  {
    id: "need-3",
    imageUrl: "https://images.unsplash.com/photo-1649963425658-f15eb78959e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGluZCUyMHBlcnNvbiUyMG5hdmlnYXRpb24lMjBhc3Npc3RhbmNlfGVufDF8fHx8MTc2MTcyNTQ3MXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "시각 장애인",
    title: "안전한 보행 안내가 필요해요",
    description: "혼자 외출할 때 장애물이나 위험 요소를 미리 알려주는 시스템이 있으면 좋겠습니다.",
    skills: ["음성 길 안내", "장애물 감지", "안전 보행 도움"],
    location: "전국",
    duration: "일상생활",
    tags: ["의료/건강", "안전"],
    matchingTags: ["vision-navigation"]
  },
  {
    id: "need-4",
    imageUrl: "https://images.unsplash.com/photo-1633158832433-11a30ad1e10d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwY2FyZSUyMGhlYWx0aCUyMG1vbml0b3Jpbmd8ZW58MXx8fHwxNzYxNzI1NDY5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "독거 노인 가족",
    title: "부모님 건강 모니터링 필요",
    description: "혼자 사시는 부모님의 건강 상태를 실시간으로 확인하고 이상 징후를 빠르게 파악하고 싶습니다.",
    skills: ["건강 상태 추적", "응급 상황 알림", "원격 확인"],
    location: "전국",
    duration: "24시간",
    tags: ["의료/건강"],
    matchingTags: ["health-monitoring"]
  },
  {
    id: "need-5",
    imageUrl: "https://images.unsplash.com/photo-1638519930507-d1d809d7c949?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnZpcm9ubWVudCUyMHBvbGx1dGlvbiUyMHdhc3RlfGVufDF8fHx8MTc2MTcyNTc0MXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "환경 운동가",
    title: "플라스틱 쓰레기 추적 시스템",
    description: "우리 지역의 플라스틱 쓰레기 배출량을 모니터링하고 줄이는 방법이 필요합니다.",
    skills: ["쓰레기 배출량 확인", "재활용 정보", "환경 개선 제안"],
    location: "지역사회",
    duration: "지속적",
    tags: ["환경"],
    matchingTags: ["waste-management"]
  },
  {
    id: "need-6",
    imageUrl: "https://images.unsplash.com/photo-1551847677-dc82d764e1eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB0aGVyYXB5fGVufDF8fHx8MTc2MTY0NDAyMXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "우울증 환자",
    title: "일상 감정 기록과 관리",
    description: "매일의 감정 상태를 기록하고 패턴을 파악해서 전문가와 상담할 때 활용하고 싶습니다.",
    skills: ["감정 일기 작성", "기분 패턴 분석", "상담 자료 제공"],
    location: "온라인",
    duration: "일상적",
    tags: ["의료/건강"],
    matchingTags: ["mental-health"]
  },
  {
    id: "need-7",
    imageUrl: "https://images.unsplash.com/photo-1589395937658-0557e7d89fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBzdHVkZW50JTIwbGVhcm5pbmd8ZW58MXx8fHwxNzYxNjE2MTA2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "난독증 학생 학부모",
    title: "읽기 학습 보조 도구 필요",
    description: "난독증이 있는 아이가 텍스트를 더 쉽게 읽을 수 있도록 돕는 도구가 필요합니다.",
    skills: ["텍스트 음성 변환", "읽기 속도 조절", "학습 지원"],
    location: "전국",
    duration: "학습 시간",
    tags: ["교육", "의료/건강"],
    matchingTags: ["reading-support"]
  },
  {
    id: "need-8",
    imageUrl: "https://images.unsplash.com/photo-1647235354099-9b05551d692a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwc2VjdXJpdHklMjBzYWZldHl8ZW58MXx8fHwxNzYxNzI1NzQyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "1인 가구",
    title: "혼자 있을 때 안전 확인",
    description: "집에 혼자 있을 때 이상 상황을 감지하고 가족에게 알려주는 시스템이 필요합니다.",
    skills: ["위험 상황 감지", "자동 알림 전송", "안전 확인"],
    location: "전국",
    duration: "24시간",
    tags: ["안전"],
    matchingTags: ["home-safety"]
  }
];
