import { useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import type { CardData } from "data";
import { givesCategories as defaultGivesCategories } from "data";
import { generateMatchingTags } from "../utils/matching";
import { enrichItem, fetchCategories } from "../utils/api";
// Date range picker removed in favor of manual start/end inputs per user request

export function ProvideSolution() {
	const [form, setForm] = useState({
		title: "",
		imageUrl: "", // data URL or external URL
		category: defaultGivesCategories[1] ?? "AI/ML",
		description: "",
		skills: "",
		duration: "",
		tags: "",
		contact: "",
	});
	const [givesCats, setGivesCats] = useState<string[]>(defaultGivesCategories);
	const [submitted, setSubmitted] = useState<null | string>(null);
	const [preview, setPreview] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
	const [enriching, setEnriching] = useState(false);
	const [enrichedInfo, setEnrichedInfo] = useState<string>("");
			const [userTouchedCategory, setUserTouchedCategory] = useState(false);
			const [userTouchedTags, setUserTouchedTags] = useState(false);
			const [userTouchedSkills, setUserTouchedSkills] = useState(false);
		const [originalSnapshot, setOriginalSnapshot] = useState<typeof form | null>(null);
		const [enrichedSnapshot, setEnrichedSnapshot] = useState<typeof form | null>(null);
		const canProceed = (form.description || "").trim().length > 0;

		// Helpers: normalize and cap suggestions
		const toTitleCase = (s: string) => s.replace(/\s+/g, " ").trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
		const normalizeTags = (arr: string[], max = 2) => {
			const out: string[] = [];
			const seen = new Set<string>();
			for (const raw of arr) {
				const t = String(raw || "").toLowerCase().trim().replace(/\s+/g, " ");
				if (!t) continue;
				const wc = t.split(" ").length;
				if (wc > 2) continue;
				if (seen.has(t)) continue;
				seen.add(t);
				out.push(t);
				if (out.length >= max) break;
			}
			return out;
		};
		const normalizeSkills = (arr: string[], max = 2) => {
			const out: string[] = [];
			const seen = new Set<string>();
			for (const raw of arr) {
				const base = String(raw || "").replace(/\s+/g, " ").trim();
				if (!base) continue;
				const wc = base.split(" ").length;
				if (wc > 3) continue;
				const key = base.toLowerCase();
				if (seen.has(key)) continue;
				seen.add(key);
				out.push(toTitleCase(base));
				if (out.length >= max) break;
			}
			return out;
		};
		const mergeCapped = (currentCsv: string, suggestions: string[], normalizer: (arr: string[]) => string[], max = 2) => {
			const current = normalizer(currentCsv.split(",").map(s => s.trim()).filter(Boolean));
			const suggested = normalizer(suggestions);
			const out: string[] = [];
			const seen = new Set<string>();
			for (const v of [...current, ...suggested]) {
				const key = v.toLowerCase();
				if (seen.has(key)) continue;
				seen.add(key);
				out.push(v);
				if (out.length >= max) break;
			}
			return out.join(", ");
		};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		if (name === "category") setUserTouchedCategory(true);
		if (name === "tags") setUserTouchedTags(true);
		if (name === "skills") setUserTouchedSkills(true);
		setForm((f) => ({ ...f, [name]: value }));
	};

	// Fetch categories from backend with fallback
	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await fetchCategories();
					if (!cancelled && Array.isArray(res.givesCategories) && res.givesCategories.length) {
						setGivesCats(res.givesCategories);
						if (!res.givesCategories.includes(form.category)) {
							const fallback = res.givesCategories.find((c) => c !== "전체") || res.givesCategories[0];
							if (fallback) setForm((f) => ({ ...f, category: fallback }));
						}
					}
			} catch {
				// keep defaults silently
			}
		})();
		return () => { cancelled = true; };
	}, []);

	const handleEnrich = async () => {
		setEnriching(true);
		setEnrichedInfo("");
		try {
			const res = await enrichItem({
				title: form.title,
				description: form.description,
				skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
				tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
				category: form.category,
			});
					const mergedTags = mergeCapped(form.tags, res.tags || [], (a)=>normalizeTags(a), 2);
					const mergedSkills = mergeCapped(form.skills, res.skills || [], (a)=>normalizeSkills(a), 2);
			setForm((f) => ({
				...f,
				category: res.suggestedCategory || f.category,
							tags: mergedTags,
							skills: mergedSkills,
			}));
			setEnrichedInfo(`추천 카테고리: ${res.suggestedCategory ?? '없음'} · 추천 태그 ${res.tags?.length ?? 0}개 (신뢰도 ${Math.round((res.confidence||0)*100)}%)`);
			} catch (e) {
				// 서버 연결 실패 등 오류 시 사용자에게 안내
				setEnrichedInfo("⚠️ 추천 서버에 연결하지 못했습니다. 서버를 실행하거나 VITE_API_BASE를 설정하세요.");
		} finally {
			setEnriching(false);
		}
	};

	// 자동 추천: 설명(또는 제목)이 충분히 입력되면 디바운스 후 추천 호출
	useEffect(() => {
			if (!originalSnapshot) setOriginalSnapshot(form);
		const minLen = 12;
		const desc = (form.description || "").trim();
		const title = (form.title || "").trim();
		if (enriching) return;
		if (desc.length < minLen && title.length < minLen) return;
		const timer = setTimeout(async () => {
			try {
				setEnriching(true);
				const res = await enrichItem({
					title: form.title,
					description: form.description,
					skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
					tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
					category: form.category,
				});
				setEnrichedInfo(`추천 카테고리: ${res.suggestedCategory ?? '없음'} · 추천 태그 ${res.tags?.length ?? 0}개 (신뢰도 ${Math.round((res.confidence||0)*100)}%)`);
						setForm((f) => {
							const mergedTags = userTouchedTags ? f.tags : mergeCapped(f.tags, res.tags || [], (a)=>normalizeTags(a), 2);
							const mergedSkills = userTouchedSkills ? f.skills : mergeCapped(f.skills, res.skills || [], (a)=>normalizeSkills(a), 2);
							return {
								...f,
								category: userTouchedCategory ? f.category : (res.suggestedCategory || f.category),
								tags: mergedTags,
								skills: mergedSkills,
							};
						});
					} catch {
						// 자동 호출 시에도 가벼운 안내 제공
						setEnrichedInfo("⚠️ 추천 서버에 연결하지 못했습니다. 서버를 실행하거나 VITE_API_BASE를 설정하세요.");
					} finally {
				setEnriching(false);
			}
		}, 700);
		return () => clearTimeout(timer);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.description, form.title, form.skills]);


	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Always enrich before save to let LLM manage category/tags (with graceful fallback)
		let suggestedCategory: string | undefined;
		let suggestedTags: string[] = [];
		try {
			const res = await enrichItem({
				title: form.title,
				description: form.description,
				skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
				tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
				category: form.category,
			});
			suggestedCategory = res.suggestedCategory || undefined;
			suggestedTags = res.tags || [];
		} catch {}

		const finalCategory = suggestedCategory || form.category;
		const finalTags = Array.from(new Set([
			...(suggestedTags || []),
			...form.tags.split(",").map((t) => t.trim()).filter(Boolean),
		]));

		const newGive: CardData = {
			id: `give-${Date.now()}`,
			isCustom: true,
			title: form.title.trim(),
			imageUrl: form.imageUrl.trim() ||
				"https://images.unsplash.com/photo-1638202677704-b74690bb8fa9?w=1080&q=80&auto=format&fit=crop",
			category: finalCategory,
			description: form.description.trim(),
			skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
			duration: (startDate && endDate) ? `${startDate} ~ ${endDate}` : (form.duration.trim() || undefined),
      contact: form.contact?.trim() || undefined,
			tags: finalTags,
			matchingTags: generateMatchingTags({
				type: "gives",
				category: finalCategory,
				title: form.title,
				description: form.description,
				skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
				tags: finalTags,
			}),
			llmCategory: suggestedCategory,
			llmTags: suggestedTags,
		};

		const key = "custom_gives";
		const prev = localStorage.getItem(key);
		const list: CardData[] = prev ? JSON.parse(prev) : [];
		list.unshift(newGive);
		localStorage.setItem(key, JSON.stringify(list));
			setSubmitted(newGive.id);
			// notify app to refresh merged data
			window.dispatchEvent(new Event("data:updated"));
	};

	return (
		<div className="bg-white rounded-2xl shadow-sm border p-6">
			<h2 className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] text-[26px] mb-1 text-gray-900">
				솔루션 제공하기
			</h2>

			{submitted ? (
				<div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-800">
					솔루션이 저장되었습니다. 새로고침하면 리스트에 반영됩니다. (ID: {submitted})
				</div>
			) : (
				<form onSubmit={handleSubmit} className="space-y-5">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="title">제목</Label>
							<Input id="title" name="title" value={form.title} onChange={handleChange} required />
						</div>
						<div>
							<Label htmlFor="imageFile">이미지 업로드</Label>
							<Input
								id="imageFile"
								type="file"
								accept="image/*"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (!file) return;
									const reader = new FileReader();
									reader.onload = () => {
										const dataUrl = String(reader.result || "");
										setForm((f) => ({ ...f, imageUrl: dataUrl }));
										setPreview(dataUrl);
									};
									reader.readAsDataURL(file);
								}}
							/>
							<p className="text-xs text-gray-500 mt-1">JPG/PNG 권장, 최대 2MB, 권장 비율 16:9</p>
							{preview || form.imageUrl ? (
								<img src={preview || form.imageUrl} alt="preview" className="mt-2 w-[160px] h-[114px] object-cover rounded" />
							) : null}
							</div>
						</div>
						{/* 설명: 제목 바로 아래 배치 */}
						<div>
							<Label htmlFor="description">설명</Label>
							<Textarea id="description" name="description" value={form.description} onChange={handleChange} rows={5} required />
							{!canProceed && (
								<p className="text-xs text-gray-500 mt-1">설명을 먼저 입력하면 나머지 항목을 작성할 수 있어요.</p>
							)}
						</div>

						{/* LLM 내용 채우기 버튼 - 섹션 구분용 */}
						{canProceed && (
							<div className="border-t pt-4">
								<Button 
									type="button" 
									variant="outline" 
									onClick={handleEnrich} 
									disabled={enriching}
									className="w-full h-12 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-900 hover:from-orange-100 hover:to-orange-200 transition-all duration-200"
								>
									{enriching ? (
										<span className="flex items-center gap-2">
											<div className="animate-spin h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full"></div>
											LLM으로 하단 내용 채우는 중...
										</span>
									) : (
										'👇🏻 LLM으로 하단 내용 채우기 (카테고리, 스킬, 태그 자동 추천) 👇🏻'
									)}
								</Button>
								{enrichedInfo && (
									<div className="mt-2 p-2 bg-orange-50 rounded text-sm text-orange-800">
										{enrichedInfo}
									</div>
								)}
							</div>
						)}

						{/* 나머지 필드는 설명이 채워져야 활성화 */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
							<Label htmlFor="category">카테고리</Label>
							<select
								id="category"
								name="category"
								value={form.category}
								onChange={handleChange}
									className="h-9 w-full rounded-md border px-3 text-sm bg-white"
									disabled={!canProceed}
							>
								{givesCats.map((c) => (
									<option value={c} key={c}>{c}</option>
								))}
							</select>

						</div>
						{/* 위치 입력 제거 */}
						<div>
							<Label>제공 기간</Label>
							<div className="flex gap-2">
									<Input placeholder="예: 2025.10.23" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={!canProceed} />
								<span className="self-center text-gray-500">~</span>
									<Input placeholder="예: 2025.10.30" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={!canProceed} />
							</div>
							<p className="text-xs text-gray-500 mt-1">형식: YYYY.MM.DD</p>
						</div>
						<div className="md:col-span-2">
							<Label htmlFor="contact">연락처</Label>
							<Input id="contact" name="contact" required onChange={handleChange} placeholder="예: 카카오톡 @username, 이메일 hello@example.com" disabled={!canProceed} />
						</div>
						</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="skills">핵심 기능/스킬 (쉼표 구분)</Label>
								<Input id="skills" name="skills" value={form.skills} onChange={handleChange} placeholder="예: 자동 차단, 실시간 모니터링" disabled={!canProceed} />
						</div>
						<div>
							<Label htmlFor="tags">태그 (쉼표 구분)</Label>
								<Input id="tags" name="tags" value={form.tags} onChange={handleChange} placeholder="예: AI/ML, 교육" disabled={!canProceed} />
						</div>
						{/* 매칭 키는 자동 생성되어 입력 필요 없음 */}
					</div>

					<div className="flex items-center gap-3">
							<Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={!canProceed}>저장</Button>
						<a href="#" className="text-sm text-gray-600 hover:underline">취소</a>
					</div>
				</form>
			)}
		</div>
	);
}

export default ProvideSolution;
