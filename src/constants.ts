// ===== 色块染料颜色（基于 Aussie Candle Supplies 的 28 种色块）=====
export const DYE_BLOCK_COLORS = [
  // Red / Pink 系列
  "Red", "Pink", "Rose", "Burgundy", "Maroon",
  // Blue / Purple 系列
  "Blue", "Navy", "Sky Blue", "Teal", "Turquoise", "Purple", "Lavender", "Violet",
  // Green 系列
  "Green", "Lime", "Forest Green", "Mint", "Olive",
  // Yellow / Orange 系列
  "Yellow", "Orange", "Gold", "Amber", "Peach",
  // Brown / Neutral 系列
  "Brown", "Tan", "Beige",
  // Black / White / Gray 系列
  "Black", "White", "Gray"
] as const;

export type DyeBlockColor = typeof DYE_BLOCK_COLORS[number];

export const SWATCH = (c: DyeBlockColor): string => {
  const map: Record<DyeBlockColor, string> = {
    // Red / Pink
    Red: "#DC143C",
    Pink: "#FFB6C1",
    Rose: "#FF69B4",
    Burgundy: "#800020",
    Maroon: "#800000",
    // Blue / Purple
    Blue: "#4169E1",
    Navy: "#000080",
    "Sky Blue": "#87CEEB",
    Teal: "#008080",
    Turquoise: "#40E0D0",
    Purple: "#8B008B",
    Lavender: "#E6E6FA",
    Violet: "#8A2BE2",
    // Green
    Green: "#228B22",
    Lime: "#32CD32",
    "Forest Green": "#228B22",
    Mint: "#98FB98",
    Olive: "#808000",
    // Yellow / Orange
    Yellow: "#FFD700",
    Orange: "#FF8C00",
    Gold: "#FFD700",
    Amber: "#FFBF00",
    Peach: "#FFE5B4",
    // Brown / Neutral
    Brown: "#8B4513",
    Tan: "#D2B48C",
    Beige: "#F5F5DC",
    // Black / White / Gray
    Black: "#1a1a1a",
    White: "#F5F5F5",
    Gray: "#808080",
  };
  return map[c] || "#ccc";
};

// ===== 液体染料 =====
export const LIQUID_PRESETS = [
  { id: "light", label: "浅色 (0.03%)", pct: 0.03 },
  { id: "med", label: "中深 (0.05%)", pct: 0.05 },
  { id: "dark", label: "深色 (0.08%)", pct: 0.08 },
  { id: "veryDark", label: "很深 (0.1%)", pct: 0.1 },
] as const;

export type LiquidPresetId = typeof LIQUID_PRESETS[number]["id"];

export const LIQUID_DYE_COLORS = [
  { name: "Pink", hex: "#FFB6C1" },
  { name: "Red", hex: "#DC143C" },
  { name: "Orange", hex: "#FF8C00" },
  { name: "Yellow", hex: "#FFD700" },
  { name: "Lime", hex: "#32CD32" },
  { name: "Green", hex: "#228B22" },
  { name: "Teal", hex: "#008B8B" },
  { name: "Cyan", hex: "#00CED1" },
  { name: "Blue", hex: "#4169E1" },
  { name: "Navy", hex: "#000080" },
  { name: "Purple", hex: "#8B008B" },
  { name: "Magenta", hex: "#C71585" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Black", hex: "#1a1a1a" },
  { name: "Gray", hex: "#808080" },
] as const;

export type LiquidColorName = typeof LIQUID_DYE_COLORS[number]["name"];

// 优化：使用 Map 提高查找性能
const LIQUID_COLOR_MAP = new Map(LIQUID_DYE_COLORS.map(d => [d.name, d.hex]));

export const LIQUID_SWATCH = (c: LiquidColorName): string => {
  return LIQUID_COLOR_MAP.get(c) || "#ccc";
};

// ===== 蜡材信息 =====
export type WaxKey = "GW464" | "GW454" | "C3" | "BeeswaxBlock" | "BeeswaxPaleBeaded" | "Ice Flower";

export const WAX_INFO: Record<WaxKey, {
  name: string;
  type: string;
  meltPoint?: string;
  pourTemp?: string;
  fragranceLoad?: string;
  suitable?: string;
  properties?: string;
}> = {
  "GW464": {
    name: "GW464（大豆）",
    type: "100% 大豆蜡",
    meltPoint: "49–52°C",
    pourTemp: "54–60°C",
    fragranceLoad: "最高 10%",
    suitable: "容器蜡、玻璃杯蜡烛",
    properties: "易起霜、黏附性好、缓慢冷却可减少霜纹",
  },
  "GW454": {
    name: "GW454（大豆）",
    type: "100% 大豆蜡",
    meltPoint: "49–52°C",
    pourTemp: "54–60°C",
    fragranceLoad: "最高 10%",
    suitable: "容器蜡、玻璃杯蜡烛",
    properties: "类似 464，起霜稍少",
  },
  "C3": {
    name: "C3（椰子）",
    type: "椰子蜡",
    meltPoint: "51–54°C",
    pourTemp: "55–65°C",
    fragranceLoad: "最高 12%",
    suitable: "容器蜡、高端产品",
    properties: "燃烧干净、低烟、表面光滑、价格较高",
  },
  "BeeswaxBlock": {
    name: "Beeswax（黄蜂蜡块）",
    type: "天然蜂蜡",
    meltPoint: "62–65°C",
    pourTemp: "65–75°C",
    fragranceLoad: "6–8%（自带蜂蜜香）",
    suitable: "柱蜡、模具蜡、混合配方增硬度",
    properties: "天然金黄色、自带蜂蜜香、燃烧时间长",
  },
  "BeeswaxPaleBeaded": {
    name: "Beeswax（白/淡色珠状）",
    type: "漂白蜂蜡",
    meltPoint: "62–65°C",
    pourTemp: "65–75°C",
    fragranceLoad: "6–8%",
    suitable: "需浅色/白色的配方",
    properties: "漂白处理、颜色浅、蜂蜜香味淡",
  },
  "Ice Flower": {
    name: "Ice Flower（冰花/晶体蜡）",
    type: "特殊纹理蜡",
    meltPoint: "52–56°C",
    pourTemp: "58–65°C",
    fragranceLoad: "3–6%",
    suitable: "装饰蜡、晶体纹理效果",
    properties: "冷却时形成独特晶体裂纹纹理，需均匀缓冷",
  },
};

