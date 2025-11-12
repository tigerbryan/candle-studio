import { memo } from "react";

interface Tip {
  category: string;
  title: string;
  content: string;
  icon: string;
}

const PROFESSIONAL_TIPS: Tip[] = [
  {
    category: "温度控制",
    title: "最佳融蜡温度",
    content: "大豆蜡：65-75°C | 椰子蜡：70-80°C | 蜂蜡：75-85°C。使用温度计监控，避免过热导致变色或产生气泡。",
    icon: "🌡️"
  },
  {
    category: "香精添加",
    title: "香精添加黄金时机",
    content: "在蜡液冷却至 60-70°C 时加入香精，搅拌 1-2 分钟确保均匀。温度过高会挥发香味，过低会混合不均。",
    icon: "💧"
  },
  {
    category: "浇注技巧",
    title: "完美浇注温度",
    content: "容器蜡：55-60°C | 模具蜡：58-62°C | 裱花蜡：56-58°C | 淋面蜡：50-55°C。缓慢倒入，避免产生气泡。",
    icon: "🎯"
  },
  {
    category: "烛芯选择",
    title: "烛芯尺寸指南",
    content: "直径 5-6cm：CD-5 | 6-8cm：CD-7 | 8-10cm：CD-10 | 10-12cm：CD-12。过大产生蘑菇头，过小导致隧道。",
    icon: "🕯️"
  },
  {
    category: "冷却固化",
    title: "冷却最佳实践",
    content: "室温下静置 24-48 小时，避免快速冷却导致裂纹。不要移动或触碰，保持环境无尘。冰花蜡需均匀缓冷。",
    icon: "❄️"
  },
  {
    category: "防止起霜",
    title: "减少起霜技巧",
    content: "控制冷却速度，避免温度骤变。使用 80% 大豆 + 20% 蜂蜡混合可显著减少起霜。缓慢冷却比快速冷却效果更好。",
    icon: "❄️"
  },
  {
    category: "避免隧道",
    title: "防止隧道燃烧",
    content: "选择合适尺寸的烛芯，首次燃烧至少 2-3 小时形成完整熔池。修剪烛芯至 6mm，避免过短或过长。",
    icon: "🕳️"
  },
  {
    category: "避免蘑菇头",
    title: "减少蘑菇头",
    content: "使用合适尺寸的烛芯，避免过大。定期修剪烛芯至 6mm。选择优质烛芯材料，避免使用劣质烛芯。",
    icon: "🍄"
  },
  {
    category: "颜色技巧",
    title: "均匀上色方法",
    content: "液体染料在加香前后皆可加入，充分搅拌。色块需刨片后逐步加入，先做小样测试深浅。深色可能需要更大芯号。",
    icon: "🎨"
  },
  {
    category: "模具脱模",
    title: "完美脱模技巧",
    content: "完全冷却后脱模（24-48小时）。如顶部凹陷，待冷却后进行二次回倒。使用脱模剂或硅胶模具更易脱模。",
    icon: "📦"
  },
  {
    category: "成本优化",
    title: "节省成本技巧",
    content: "批量制作可降低单只成本。合理选择蜡材组合，大豆+蜂蜡性价比高。记录每次配方和成本，优化比例。",
    icon: "💰"
  },
  {
    category: "安全建议",
    title: "制作安全须知",
    content: "使用双层蒸锅或专用融蜡锅，避免直接加热。保持工作区域通风，远离易燃物。首次燃烧时观察 1-2 小时。",
    icon: "⚠️"
  },
];

const TipsSection = memo(() => {
  return (
    <section className="rounded-2xl border p-4 bg-gradient-to-br from-blue-50 to-purple-50 backdrop-blur">
      <div className="mb-4">
        <h2 className="font-semibold text-lg md:text-xl mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>专业制作技巧</span>
        </h2>
        <p className="text-xs md:text-sm text-gray-600">
          来自专业蜡烛制作师的经验分享，助你制作完美蜡烛
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PROFESSIONAL_TIPS.map((tip, index) => (
          <div
            key={index}
            className="rounded-xl border bg-white/80 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="text-xl">{tip.icon}</span>
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 mb-1">{tip.category}</div>
                <div className="font-medium text-sm mb-1">{tip.title}</div>
                <div className="text-xs text-gray-600 leading-relaxed">{tip.content}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-white/60 rounded-xl border border-blue-200">
        <div className="text-xs text-gray-700 leading-relaxed">
          <strong>💬 专业建议：</strong>每次制作后记录配方、温度、结果，建立自己的配方库。小批量测试新配方，确认效果后再大批量制作。定期清洁工具，保持工作环境整洁。
        </div>
      </div>
    </section>
  );
});

TipsSection.displayName = 'TipsSection';

export default TipsSection;

