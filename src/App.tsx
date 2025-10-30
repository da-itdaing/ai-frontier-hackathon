import { FlipCard } from "./components/FlipCard";
import { ProjectCard } from "./components/ProjectCard";
import { CardBack } from "./components/CardBack";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { HowItWorks } from "./components/HowItWorks";
import { Button } from "./components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { HandHeart, Package, Info } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { CardData } from "data";
import { needsData, givesData, needsCategories as defaultNeedsCategories, givesCategories as defaultGivesCategories } from "data";
import React from "react";
import { computeMatches, fetchStoredMatches, fetchCategories, type MatchResponse } from "./utils/api";
import { MobileCarousel } from "./components/MobileCarousel";
import { useIsMobile } from "./components/ui/use-mobile";
const RequestHelp = React.lazy(() => import("./pages/RequestHelp").then(m => ({ default: m.RequestHelp })));
const SubmitSolution = React.lazy(() => import("./pages/ProvideSolution").then(m => ({ default: m.ProvideSolution })));

export default function App() {
  const isMobile = useIsMobile();
  const [route, setRoute] = useState<string>(() => window.location.hash || "");
  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || "");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const [needsFilter, setNeedsFilter] = useState("전체");
  const [givesFilter, setGivesFilter] = useState("전체");
  const [showFlippedNeedsOnly, setShowFlippedNeedsOnly] = useState(false);
  const [showFlippedGivesOnly, setShowFlippedGivesOnly] = useState(false);
  const [needsPage, setNeedsPage] = useState(0);
  const [givesPage, setGivesPage] = useState(0);
  const [needsCats, setNeedsCats] = useState<string[]>(defaultNeedsCategories);
  const [givesCats, setGivesCats] = useState<string[]>(defaultGivesCategories);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"need" | "give" | null>(null);
  const [highlightedCards, setHighlightedCards] = useState<string[]>([]);
  const [flippedNeeds, setFlippedNeeds] = useState<string[]>([]);
  const [flippedGives, setFlippedGives] = useState<string[]>([]);
  const [allNeeds, setAllNeeds] = useState<CardData[]>(needsData);
  const [allGives, setAllGives] = useState<CardData[]>(givesData);
  const [matchMap, setMatchMap] = useState<MatchResponse | null>(null);

  useEffect(() => {
    const loadCustom = () => {
      try {
        const customNeedsRaw = JSON.parse(localStorage.getItem("custom_needs") || "[]");
        const customGivesRaw = JSON.parse(localStorage.getItem("custom_gives") || "[]");
        const customNeeds = Array.isArray(customNeedsRaw)
          ? customNeedsRaw.map((n: any) => ({ ...n, isCustom: true }))
          : [];
        const customGives = Array.isArray(customGivesRaw)
          ? customGivesRaw.map((g: any) => ({ ...g, isCustom: true }))
          : [];
        setAllNeeds([...(customNeeds || []), ...needsData]);
        setAllGives([...(customGives || []), ...givesData]);
      } catch (e) {
        console.error("Failed to load custom data", e);
      }
    };
    loadCustom();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "custom_needs" || e.key === "custom_gives") loadCustom();
    };
    const onCustom = () => loadCustom();
    window.addEventListener("storage", onStorage);
    window.addEventListener("data:updated", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("data:updated", onCustom as EventListener);
    };
  }, []);

  // Fetch categories from backend (fallback to defaults on error)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchCategories();
        if (!cancelled) {
          if (Array.isArray(res.needsCategories) && res.needsCategories.length) setNeedsCats(res.needsCategories);
          if (Array.isArray(res.givesCategories) && res.givesCategories.length) setGivesCats(res.givesCategories);
        }
      } catch {
        // keep defaults silently
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Compute or fetch LLM-based matches whenever datasets change
  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        // Try to use stored matches first
        const stored = await fetchStoredMatches();
        if (!cancelled) setMatchMap(stored);
      } catch {
        // If no stored, compute on the fly
        try {
          const computed = await computeMatches({ needs: allNeeds, gives: allGives, top_k: 5 });
          if (!cancelled) setMatchMap(computed);
        } catch (e) {
          // silent fallback to local matching
          if (!cancelled) setMatchMap(null);
        }
      }
    }
    run();
    return () => { cancelled = true; };
  }, [allNeeds, allGives]);

  const filteredNeeds = needsFilter === "전체" 
    ? allNeeds 
    : allNeeds.filter(item => item.tags.includes(needsFilter));

  const filteredGives = givesFilter === "전체" 
    ? allGives 
    : allGives.filter(item => item.tags.includes(givesFilter));

  // Apply "flipped only" toggle per side
  const effectiveNeeds = showFlippedNeedsOnly
    ? filteredNeeds.filter(n => flippedNeeds.includes(n.id))
    : filteredNeeds;
  const effectiveGives = showFlippedGivesOnly
    ? filteredGives.filter(g => flippedGives.includes(g.id))
    : filteredGives;

  // Keep Needs/Gives select in sync when possible (same label exists on both)
  const handleNeedsFilterChange = (val: string) => {
    setNeedsFilter(val);
    if (val !== "전체" && givesCats.includes(val)) setGivesFilter(val);
    setNeedsPage(0);
    setGivesPage(0);
  };
  const handleGivesFilterChange = (val: string) => {
    setGivesFilter(val);
    if (val !== "전체" && needsCats.includes(val)) setNeedsFilter(val);
    setNeedsPage(0);
    setGivesPage(0);
  };

  const handleCardHover = (cardId: string, cardType: "need" | "give") => {
    setSelectedCard(cardId);
    setSelectedType(cardType);

    // 매칭되는 카드 찾기
    if (cardType === "need") {
      const card = allNeeds.find(c => c.id === cardId);
      if (card) {
        const matches = allGives
          .filter(g => g.matchingTags.some(tag => card.matchingTags.includes(tag)))
          .map(g => g.id);
        setHighlightedCards(matches);
      }
    } else {
      const card = allGives.find(c => c.id === cardId);
      if (card) {
        const matches = allNeeds
          .filter(n => n.matchingTags.some(tag => card.matchingTags.includes(tag)))
          .map(n => n.id);
        setHighlightedCards(matches);
      }
    }
  };

  const handleCardLeave = () => {
    setSelectedCard(null);
    setSelectedType(null);
    setHighlightedCards([]);
  };

  // Clear any temporary user-added data stored in localStorage
  const clearCustomData = () => {
    try {
      localStorage.removeItem("custom_needs");
      localStorage.removeItem("custom_gives");
      setAllNeeds(needsData);
      setAllGives(givesData);
      // Notify any listeners to refresh derived data
      window.dispatchEvent(new Event("data:updated"));
    } catch (e) {
      console.error("Failed to clear custom data", e);
    }
  };

  const getMatchesForNeed = (needId: string) => {
    if (matchMap?.needMatches?.[needId]) {
      return matchMap.needMatches[needId].map(m => m.id);
    }
    const card = allNeeds.find(c => c.id === needId);
    if (!card) return [] as string[];
    return allGives
      .filter(g => g.matchingTags.some(tag => card.matchingTags.includes(tag)))
      .map(g => g.id);
  };

  const getMatchesForGive = (giveId: string) => {
    if (matchMap?.giveMatches?.[giveId]) {
      return matchMap.giveMatches[giveId].map(m => m.id);
    }
    const card = allGives.find(c => c.id === giveId);
    if (!card) return [] as string[];
    return allNeeds
      .filter(n => n.matchingTags.some(tag => card.matchingTags.includes(tag)))
      .map(n => n.id);
  };

  // Helper: prioritize list by a set of IDs (matched first, then the rest, stable order)
  const prioritizeByIds = <T extends { id: string }>(list: T[], ids: string[]) => {
    const idSet = new Set(ids);
    const matched: T[] = [];
    const rest: T[] = [];
    for (const item of list) {
      (idSet.has(item.id) ? matched : rest).push(item);
    }
    return [...matched, ...rest];
  };

  // Compute desktop (web) visible 2x2 lists with prioritization based on hover on the opposite side
  const needsDesktopView = useMemo(() => {
    const pageSize = 4;
    const start = needsPage * pageSize;
    const end = start + pageSize;
    if (selectedType === "give" && selectedCard) {
      const matchIds = getMatchesForGive(selectedCard);
      return prioritizeByIds(effectiveNeeds, matchIds).slice(start, end);
    }
    return effectiveNeeds.slice(start, end);
  }, [effectiveNeeds, selectedType, selectedCard, needsPage]);

  const givesDesktopView = useMemo(() => {
    const pageSize = 4;
    const start = givesPage * pageSize;
    const end = start + pageSize;
    if (selectedType === "need" && selectedCard) {
      const matchIds = getMatchesForNeed(selectedCard);
      return prioritizeByIds(effectiveGives, matchIds).slice(start, end);
    }
    return effectiveGives.slice(start, end);
  }, [effectiveGives, selectedType, selectedCard, givesPage]);

  const totalNeedsPages = Math.max(1, Math.ceil(effectiveNeeds.length / 4));
  const totalGivesPages = Math.max(1, Math.ceil(effectiveGives.length / 4));

  // Clamp page indices when the data set size changes (e.g., filters/toggles)
  useEffect(() => {
    setNeedsPage((p) => Math.min(p, Math.max(0, totalNeedsPages - 1)));
  }, [totalNeedsPages]);
  useEffect(() => {
    setGivesPage((p) => Math.min(p, Math.max(0, totalGivesPages - 1)));
  }, [totalGivesPages]);

  const handleNeedClick = (needId: string) => {
    // Toggle clicked need card
    const willFlip = !flippedNeeds.includes(needId);
    const nextFlippedNeeds = willFlip
      ? [...flippedNeeds, needId]
      : flippedNeeds.filter((id) => id !== needId);
    setFlippedNeeds(nextFlippedNeeds);

    // Cross-flip: any give matched by ANY flipped need should be flipped
    const givesToFlip = new Set<string>();
    for (const nId of nextFlippedNeeds) {
      getMatchesForNeed(nId).forEach((gId) => givesToFlip.add(gId));
    }
    setFlippedGives(Array.from(givesToFlip));
  };

  const handleGiveClick = (giveId: string) => {
    // Toggle clicked give card
    const willFlip = !flippedGives.includes(giveId);
    const nextFlippedGives = willFlip
      ? [...flippedGives, giveId]
      : flippedGives.filter((id) => id !== giveId);
    setFlippedGives(nextFlippedGives);

    // Cross-flip: any need matched by ANY flipped give should be flipped
    const needsToFlip = new Set<string>();
    for (const gId of nextFlippedGives) {
      getMatchesForGive(gId).forEach((nId) => needsToFlip.add(nId));
    }
    setFlippedNeeds(Array.from(needsToFlip));
  };

  if (route === "#/request") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-[960px] mx-auto px-6 py-12">
          <Suspense fallback={<div className="p-6 text-gray-600">로딩 중…</div>}>
            <RequestHelp />
          </Suspense>
        </main>
        <Footer />
      </div>
    );
  }

  if (route === "#/submit") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-[960px] mx-auto px-6 py-12">
          <Suspense fallback={<div className="p-6 text-gray-600">로딩 중…</div>}>
            <SubmitSolution />
          </Suspense>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* How It Works */}
      <HowItWorks />

      {/* Main Content - Matching Cards */}
      <section id="matching" className="py-16 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-[40px] text-gray-900 mb-4">
              매칭 탐색하기
            </h2>
            <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[18px] text-gray-600 mb-4">
              실시간으로 연결 가능한 솔루션과 요청을 확인하세요
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Info className="w-4 h-4" />
              <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px]">
                카드에 마우스를 올리면 매칭되는 솔루션/요청이 반짝입니다
              </p>
            </div>
          </div>
          {/* Cards Grid Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Needs Section */}
            <div id="needs" className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 shadow-lg border-2 border-blue-200">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 rounded-full p-2.5">
                  <HandHeart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] text-[26px] text-blue-900">
                    Needs
                  </h2>
                  <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[13px] text-blue-700">
                    도움이 필요한 사람들
                  </p>
                </div>
              </div>
              
              {/* Filter: Select box + data reset */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="max-w-xs min-w-40">
                  <Select value={needsFilter} onValueChange={handleNeedsFilterChange}>
                    <SelectTrigger aria-label="Needs category" className="bg-white text-blue-900 border-blue-300">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="전체">전체</SelectItem>
                      {needsCats.filter(cat => cat !== "전체").map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={clearCustomData} className="text-blue-900 border-blue-300 hover:bg-blue-50">
                  데이터 초기화
                </Button>
                <Button
                  variant={showFlippedNeedsOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFlippedNeedsOnly(v => !v)}
                  className={showFlippedNeedsOnly ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-blue-900 border-blue-300 hover:bg-blue-50"}
                >
                  뒤집힌 카드만 보기
                </Button>
              </div>
            </div>

            {/* Responsive rendering without relying on CSS breakpoints */}
            {isMobile ? (
              <MobileCarousel
                items={effectiveNeeds}
                type="needs"
                highlightedIds={highlightedCards}
                selectedId={selectedCard}
                flippedIds={flippedNeeds}
                onHover={handleCardHover}
                onLeave={handleCardLeave}
                onToggle={handleNeedClick}
              />
            ) : (
              <>
                <div
                  className="grid gap-6 justify-center"
                  style={{ gridTemplateColumns: "repeat(2, 224px)", gridTemplateRows: "repeat(2, 320px)" }}
                >
                  {needsDesktopView.map((need) => (
                    <div
                      key={need.id}
                      className={`transition-all duration-300 w-[224px] h-[320px] rounded-[8px] ${
                        highlightedCards.includes(need.id) ? 'animate-pulse-glow' : ''
                      } ${selectedCard === need.id ? 'ring-4 ring-blue-500 ring-offset-2 ring-offset-white rounded-lg' : ''}`}
                      onMouseEnter={() => handleCardHover(need.id, 'need')}
                      onMouseLeave={handleCardLeave}
                    >
                      <FlipCard
                        flipped={flippedNeeds.includes(need.id)}
                        onToggle={() => handleNeedClick(need.id)}
                        front={<ProjectCard id={need.id} imageUrl={need.imageUrl} category={need.category} title={need.title} contact={need.contact} link={(need as any).link} type="needs" isCustom={(need as any).isCustom} />}
                        back={<CardBack title={need.title} description={need.description} skills={need.skills} duration={need.duration} contact={need.contact} type="needs" />}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNeedsPage(p => Math.max(0, p - 1))}
                    disabled={needsPage === 0}
                    className="text-blue-900 border-blue-300 hover:bg-blue-50"
                  >
                    이전
                  </Button>
                  <span className="text-sm text-blue-900/80">{needsPage + 1} / {totalNeedsPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNeedsPage(p => Math.min(totalNeedsPages - 1, p + 1))}
                    disabled={needsPage >= totalNeedsPages - 1}
                    className="text-blue-900 border-blue-300 hover:bg-blue-50"
                  >
                    다음
                  </Button>
                </div>
              </>
            )}
            
            {/* Removed total count text for a cleaner section footer */}
          </div>

            {/* Gives Section */}
            <div id="gives" className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-6 shadow-lg border-2 border-orange-200">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-600 rounded-full p-2.5">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] text-[26px] text-orange-900">
                    Gives
                  </h2>
                  <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[13px] text-orange-700">
                    도움을 줄 수 있는 사람들
                  </p>
                </div>
              </div>

              {/* Filter: Select box + data reset */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="max-w-xs min-w-40">
                  <Select value={givesFilter} onValueChange={handleGivesFilterChange}>
                    <SelectTrigger aria-label="Gives category" className="bg-white text-orange-900 border-orange-300">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="전체">전체</SelectItem>
                      {givesCats.filter(cat => cat !== "전체").map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={clearCustomData} className="text-orange-900 border-orange-300 hover:bg-orange-50">
                  데이터 초기화
                </Button>
                <Button
                  variant={showFlippedGivesOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFlippedGivesOnly(v => !v)}
                  className={showFlippedGivesOnly ? "bg-orange-600 hover:bg-orange-700 text-white" : "text-orange-900 border-orange-300 hover:bg-orange-50"}
                >
                  뒤집힌 카드만 보기
                </Button>
              </div>
            </div>

            {isMobile ? (
              <MobileCarousel
                items={effectiveGives}
                type="gives"
                highlightedIds={highlightedCards}
                selectedId={selectedCard}
                flippedIds={flippedGives}
                onHover={handleCardHover}
                onLeave={handleCardLeave}
                onToggle={handleGiveClick}
              />
            ) : (
              <>
                <div
                  className="grid gap-6 justify-center"
                  style={{ gridTemplateColumns: "repeat(2, 224px)", gridTemplateRows: "repeat(2, 320px)" }}
                >
                  {givesDesktopView.map((give) => (
                    <div
                      key={give.id}
                      className={`transition-all duration-300 w-[224px] h-[320px] rounded-[8px] ${
                        highlightedCards.includes(give.id) ? 'animate-pulse-glow' : ''
                      } ${selectedCard === give.id ? 'ring-4 ring-orange-500 ring-offset-2 ring-offset-white rounded-lg' : ''}`}
                      onMouseEnter={() => handleCardHover(give.id, 'give')}
                      onMouseLeave={handleCardLeave}
                    >
                      <FlipCard
                        flipped={flippedGives.includes(give.id)}
                        onToggle={() => handleGiveClick(give.id)}
                        front={<ProjectCard id={give.id} imageUrl={give.imageUrl} category={give.category} title={give.title} contact={give.contact} link={(give as any).link} type="gives" isCustom={(give as any).isCustom} />}
                        back={<CardBack title={give.title} description={give.description} skills={give.skills} duration={give.duration} contact={give.contact} type="gives" />}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGivesPage(p => Math.max(0, p - 1))}
                    disabled={givesPage === 0}
                    className="text-orange-900 border-orange-300 hover:bg-orange-50"
                  >
                    이전
                  </Button>
                  <span className="text-sm text-orange-900/80">{givesPage + 1} / {totalGivesPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGivesPage(p => Math.min(totalGivesPages - 1, p + 1))}
                    disabled={givesPage >= totalGivesPages - 1}
                    className="text-orange-900 border-orange-300 hover:bg-orange-50"
                  >
                    다음
                  </Button>
                </div>
              </>
            )}
            
            {/* Removed total count text for a cleaner section footer */}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
