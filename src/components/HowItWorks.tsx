import { Search, Zap, CheckCircle, Users } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "문제 탐색",
      description: "실생활의 문제나 해결하고 싶은 과제를 등록하거나 찾아봅니다.",
      color: "blue"
    },
    {
      icon: Zap,
      title: "스마트 매칭",
      description: "AI가 해커톤 솔루션과 실제 요구사항을 자동으로 연결합니다.",
      color: "purple"
    },
    {
      icon: Users,
      title: "협업 시작",
      description: "솔루션 제공자와 요청자가 연결되어 협력을 시작합니다.",
      color: "orange"
    },
    {
      icon: CheckCircle,
      title: "문제 해결",
      description: "실제 환경에서 솔루션을 적용하고 피드백을 공유합니다.",
      color: "green"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-blue-100",
        icon: "text-blue-600",
        border: "border-blue-200"
      },
      purple: {
        bg: "bg-purple-100",
        icon: "text-purple-600",
        border: "border-purple-200"
      },
      orange: {
        bg: "bg-orange-100",
        icon: "text-orange-600",
        border: "border-orange-200"
      },
      green: {
        bg: "bg-green-100",
        icon: "text-green-600",
        border: "border-green-200"
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-[40px] text-gray-900 mb-4">
            어떻게 작동하나요?
          </h2>
          <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[18px] text-gray-600 max-w-2xl mx-auto">
            간단한 4단계로<br></br> 혁신적인 솔루션과 실제 필요를 연결합니다.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const colors = getColorClasses(step.color);
            const Icon = step.icon;
            
            return (
              <div key={index} className="relative">
                {/* Connector Line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 z-0" />
                )}

                {/* Step Card */}
                <div className="relative z-10 bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-lg transition-all">
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-white text-[14px]">
                      {index + 1}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 ${colors.bg} rounded-xl flex items-center justify-center mb-4 border-2 ${colors.border}`}>
                    <Icon className={`w-8 h-8 ${colors.icon}`} />
                  </div>

                  {/* Title */}
                  <h3 className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] text-[20px] text-gray-900 mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
