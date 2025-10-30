import data from './data.json';
import givesCases from './gives_cases.json';
import needsCasesRaw from './needs_cases.json';

export * from "./types";

// JSON 데이터 export
// Always use generated local images under /images/generated/<id>.jpg
const withLocalImage = <T extends { id: string; imageUrl?: string }>(arr: T[]): T[] =>
	arr.map((it) => ({ ...it, imageUrl: `/images/generated/${it.id}.jpg` }));

export const needsData = withLocalImage([...(needsCasesRaw as any[]), ...data.needs]);

// Map gives cases (CSV->JSON) into CardData-like items to integrate with UI
const pickCategory = (text: string) => {
	const t = (text || '').toLowerCase();
	if (/(의료|헬스|병원|치과|환자)/.test(t)) return '의료/헬스케어';
	if (/(친환경|환경|탄소|에너지)/.test(t)) return '에너지/환경기술';
	if (/(보안|정보보호|피싱|악성|보호)/.test(t)) return '보안';
	if (/(드론|위성)/.test(t)) return '드론/위성';
	if (/(로봇|로보틱)/.test(t)) return '로보틱스';
	if (/(네트워크|통신)/.test(t)) return '네트워크/통신';
	if (/(블록체인)/.test(t)) return '블록체인';
	if (/(교육|학습|학생|학교|교원|재활|챗봇)/.test(t)) return '교육/컨설팅';
	if (/(ui|ux|디자인)/.test(t)) return 'UX/UI';
	if (/(ai|인공지능|모델|ml|딥러닝|생성형)/.test(t)) return 'AI/ML';
	if (/(데이터|빅데이터|분석|예측)/.test(t)) return '데이터/분석';
	return '운영/프로덕트';
};

const fromCases = (givesCases as Array<any>).map((row, idx) => {
	const title: string = row.name || `해커톤 사례 ${idx + 1}`;
	const desc: string = row.content || '';
	const cat = pickCategory(`${row.content || ''} ${row.name || ''} ${row.org || ''}`);
	// Very light keyword -> matchingTags mapping so some Needs can match
	const lower = `${title} ${desc}`.toLowerCase();
	const matching: string[] = [];
		if (/(콘텐츠|유해|필터|검열)/.test(lower)) matching.push('content-filter');
		if (/(계약|법률|사기|리걸)/.test(lower)) matching.push('legal-contract');
		if (/(시각|블라인드|길 안내|내비|vision)/.test(lower)) matching.push('vision-navigation');
		if (/(건강|헬스|모니터링|심박|수면)/.test(lower)) matching.push('health-monitoring');
		if (/(쓰레기|재활용|waste)/.test(lower)) matching.push('waste-management');
		if (/(정신|우울|감정|멘탈)/.test(lower)) matching.push('mental-health');
		if (/(읽기|음성 읽기|리딩|학습 도구)/.test(lower)) matching.push('reading-support');
		if (/(피싱|phishing|악성 url|malicious url)/.test(lower)) matching.push('phishing-detection');
		if (/(악성코드|malware|xai)/.test(lower)) matching.push('xai-malware');
		if (/(가짜뉴스|fake\s*news)/.test(lower)) matching.push('fake-news-detection');
		if (/(공기질|air\s*quality)/.test(lower)) matching.push('air-quality');
		if (/(rpa|프로세스\s*자동화)/.test(lower)) matching.push('ai-rpa-automation');
		if (/(물가|가격\s*예측|price\s*forecast)/.test(lower)) matching.push('price-forecast');

	const id = `givecase-${row.year || 'y'}${String(row.month ?? 'm').padStart(2, '0')}-${idx}`;
	return {
		id,
		imageUrl: `/images/generated/${id}.jpg`,
		category: cat,
		title,
		description: desc,
		skills: [],
		duration: row.year ? `${row.year}.${row.month ? String(row.month).padStart(2, '0') : ''}` : undefined,
				contact: '이메일 hello@example.com',
				link: row.link || undefined,
		tags: [cat],
		matchingTags: matching,
	};
});

export const givesData = withLocalImage([...fromCases, ...data.gives]);
export const needsCategories = data.categories.needsCategories;
export const givesCategories = data.categories.givesCategories;
