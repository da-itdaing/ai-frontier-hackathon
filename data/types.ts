export interface CardData {
  id: string;
  imageUrl: string;
  category: string;
  title: string;
  description: string;
  skills: string[];
  duration?: string;
  contact?: string;
  link?: string;
  tags: string[];
  matchingTags: string[];
  // optional: LLM이 제안한 정규화 카테고리
  llmCategory?: string;
  // optional: LLM이 제안한 태그 목록 (원본 tags 보존)
  llmTags?: string[];
  // optional: 사용자(로컬)에서 추가한 항목 여부
  isCustom?: boolean;
}
