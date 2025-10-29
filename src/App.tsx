import { FlipCard } from "./components/FlipCard";
import { ProjectCard } from "./components/ProjectCard";
import { CardBack } from "./components/CardBack";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { HowItWorks } from "./components/HowItWorks";
import { Button } from "./components/ui/button";
import { HandHeart, Package, Info } from "lucide-react";
import { useState } from "react";
import type { CardData } from "data";
import { needsData, givesData, needsCategories, givesCategories } from "data";

export default function App() {
  const [needsFilter, setNeedsFilter] = useState("전체");
  const [givesFilter, setGivesFilter] = useState("전체");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [highlightedCards, setHighlightedCards] = useState<string[]>([]);

  const filteredNeeds = needsFilter === "전체" 
    ? needsData 
    : needsData.filter(item => item.tags.includes(needsFilter));

  const filteredGives = givesFilter === "전체" 
    ? givesData 
    : givesData.filter(item => item.tags.includes(givesFilter));

  const handleCardHover = (cardId: string, cardType: "need" | "give") => {
    setSelectedCard(cardId);

    // 매칭되는 카드 찾기
    if (cardType === "need") {
      const card = needsData.find(c => c.id === cardId);
      if (card) {
        const matches = givesData
          .filter(g => g.matchingTags.some(tag => card.matchingTags.includes(tag)))
          .map(g => g.id);
        setHighlightedCards(matches);
      }
    } else {
      const card = givesData.find(c => c.id === cardId);
      if (card) {
        const matches = needsData
          .filter(n => n.matchingTags.some(tag => card.matchingTags.includes(tag)))
          .map(n => n.id);
        setHighlightedCards(matches);
      }
    }
  };

  const handleCardLeave = () => {
    setSelectedCard(null);
    setHighlightedCards([]);
  };

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
              
              {/* Filter */}
              <div className="flex flex-wrap gap-2">
                {needsCategories.map((cat) => (
                  <Button
                    key={cat}
                    variant={needsFilter === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNeedsFilter(cat)}
                    className={needsFilter === cat 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "bg-white hover:bg-blue-50 text-blue-900 border-blue-300"
                    }
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Cards Grid */}
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredNeeds.map((need) => (
                  <div
                    key={need.id}
                    className={`transition-all duration-300 ${
                      highlightedCards.includes(need.id) 
                        ? 'animate-pulse-glow' 
                        : ''
                    } ${
                      selectedCard === need.id 
                        ? 'ring-4 ring-blue-500 rounded-lg' 
                        : ''
                    }`}
                    onMouseEnter={() => handleCardHover(need.id, "need")}
                    onMouseLeave={handleCardLeave}
                  >
                    <FlipCard
                      front={
                        <ProjectCard
                          imageUrl={need.imageUrl}
                          category={need.category}
                          title={need.title}
                          type="needs"
                        />
                      }
                      back={
                        <CardBack
                          title={need.title}
                          description={need.description}
                          skills={need.skills}
                          location={need.location}
                          duration={need.duration}
                          type="needs"
                        />
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[12px] text-blue-700">
                총 {filteredNeeds.length}개의 요청
              </p>
            </div>
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
                    해커톤 솔루션 제공
                  </p>
                </div>
              </div>
              
              {/* Filter */}
              <div className="flex flex-wrap gap-2">
                {givesCategories.map((cat) => (
                  <Button
                    key={cat}
                    variant={givesFilter === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGivesFilter(cat)}
                    className={givesFilter === cat 
                      ? "bg-orange-600 hover:bg-orange-700 text-white" 
                      : "bg-white hover:bg-orange-50 text-orange-900 border-orange-300"
                    }
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Cards Grid */}
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredGives.map((give) => (
                  <div
                    key={give.id}
                    className={`transition-all duration-300 ${
                      highlightedCards.includes(give.id) 
                        ? 'animate-pulse-glow' 
                        : ''
                    } ${
                      selectedCard === give.id 
                        ? 'ring-4 ring-orange-500 rounded-lg' 
                        : ''
                    }`}
                    onMouseEnter={() => handleCardHover(give.id, "give")}
                    onMouseLeave={handleCardLeave}
                  >
                    <FlipCard
                      front={
                        <ProjectCard
                          imageUrl={give.imageUrl}
                          category={give.category}
                          title={give.title}
                          type="gives"
                        />
                      }
                      back={
                        <CardBack
                          title={give.title}
                          description={give.description}
                          skills={give.skills}
                          location={give.location}
                          duration={give.duration}
                          type="gives"
                        />
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[12px] text-orange-700">
                총 {filteredGives.length}개의 솔루션
              </p>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
