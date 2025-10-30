import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-orange-50 py-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[14px]">
              혁신과 필요를 연결하는 플랫폼
            </span>
          </div>

          {/* Main Title (match HowItWorks heading size = 40px) */}
          <div className="font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-[40px] leading-tight mb-6 tracking-[-0.02em]">
            <span className="block">
              <span className="bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">해커톤 아이디어</span>
              <span className="text-gray-900">가</span>
            </span>
            <span className="block">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">실제 도움</span>
              <span className="text-gray-900">이 되는 순간</span>
            </span>
          </div>

          {/* Subheading */}
          <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[clamp(18px,4vw,22px)] text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            해커톤과 공모전에서 만들어진 혁신적인 솔루션을<br></br>실생활의 문제를 해결하는데 필요한 사람들에게 연결합니다.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a href="#/request" className="inline-block">
              <Button 
                size="lg" 
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-[16px] shadow-lg hover:shadow-xl transition-all"
              >
                도움 요청하기
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
            <a href="#/submit" className="inline-block">
              <Button 
                size="lg" 
                variant="outline"
                className="gap-2 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-6 text-[16px]"
              >
                솔루션 제공하기
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t">
            <div>
              <div className="font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-[clamp(28px,7vw,36px)] text-blue-600 mb-2">
                100+
              </div>
              <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[clamp(12px,3.5vw,14px)] text-gray-600">
                등록된 솔루션
              </p>
            </div>
            <div>
              <div className="font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-[clamp(28px,7vw,36px)] text-orange-600 mb-2">
                100+
              </div>
              <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[clamp(12px,3.5vw,14px)] text-gray-600">
                도움 요청
              </p>
            </div>
            <div>
              <div className="font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-[clamp(28px,7vw,36px)] text-green-600 mb-2">
                26
              </div>
              <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[clamp(12px,3.5vw,14px)] text-gray-600">
                성공적인 매칭
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
