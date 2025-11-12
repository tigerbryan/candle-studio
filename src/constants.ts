// ===== 色块染料颜色 =====
export const DYE_BLOCK_COLORS = [
  "Pink", "Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Brown", "Black", "White"
] as const;

export type DyeBlockColor = typeof DYE_BLOCK_COLORS[number];

export const SWATCH = (c: DyeBlockColor): string => {
  const map: Record<DyeBlockColor, string> = {
    Pink: "#FFB6C1",
    Red: "#DC143C",
    Orange: "#FF8C00",
    Yellow: "#FFD700",
    Green: "#228B22",
    Blue: "#4169E1",
    Purple: "#8B008B",
    Brown: "#8B4513",
    Black: "#1a1a1a",
    White: "#F5F5F5",
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

export const LIQUID_SWATCH = (c: LiquidColorName): string => {
  const found = LIQUID_DYE_COLORS.find(d => d.name === c);
  return found ? found.hex : "#ccc";
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

