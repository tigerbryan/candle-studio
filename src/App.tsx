import React, { memo, useMemo, useState, useCallback, useEffect } from "react";

// NOTE: constants moved to a separate module for tree‑shaking & testability.

// Create a new file `src/constants.ts` with the content I'll paste in chat.

import {
  DYE_BLOCK_COLORS,
  LIQUID_PRESETS,
  LIQUID_DYE_COLORS,
  SWATCH,
  LIQUID_SWATCH,
  WAX_INFO,
  // types
  type DyeBlockColor,
  type LiquidPresetId,
  type LiquidColorName,
  type WaxKey,
} from "./constants";
import TipsSection from "./TipsSection";

// ===== Types kept locally that refer to constants' types =====
export type WaxName = "Soy" | "Coconut" | "Beeswax" | "Palm" | "Paraffin" | "Ice Flower";
export type PriceKeys =
  | "GW464" | "GW454" | "C3" | "BeeswaxYellow" | "BeeswaxWhite" | "Paraffin" | "Palm" | "Ice Flower"
  | "Fragrance_perKg" | "DyeBlock_perBlock" | "LiquidDye_perKg" | "Wick_perUnit" | "Jar_perUnit";
export type Part = { name: PriceKeys; pct: number; grams: number };

interface Variant { name: string; formula: { name: WaxName; pct: number }[]; fl: { rec: number; range: string }; best?: boolean; nr?: boolean }
interface Template { id: string; title: string; variants: Variant[]; temp: { addFO: number; pour: number }; tip: string }

// ===== Template Library (business logic, not visual constants) =====
const TEMPLATE_LIBRARY_RAW: Template[] = [
  {
    id: "container",
    title: "容器蜡（玻璃杯/罐）",
    variants: [
      { name: "100% 大豆蜡", formula: [{ name: "Soy", pct: 100 }], fl: { rec: 9, range: "8–10%" } },
      { name: "大豆 80% + 蜂蜡 20%（最佳）", formula: [{ name: "Soy", pct: 80 }, { name: "Beeswax", pct: 20 }], fl: { rec: 9, range: "8–10%" }, best: true },
      { name: "大豆 50% + 蜂蜡 50%（1:1）", formula: [{ name: "Soy", pct: 50 }, { name: "Beeswax", pct: 50 }], fl: { rec: 8, range: "7–9%" } },
      { name: "100% 椰子蜡", formula: [{ name: "Coconut", pct: 100 }], fl: { rec: 10, range: "9–10%" } },
      { name: "椰子 70% + 蜂蜡 30%", formula: [{ name: "Coconut", pct: 70 }, { name: "Beeswax", pct: 30 }], fl: { rec: 9, range: "8–10%" } },
      { name: "大豆 80% + 石蜡 20%（不推荐）", formula: [{ name: "Soy", pct: 80 }, { name: "Paraffin", pct: 20 }], fl: { rec: 7.5, range: "7–8%" }, nr: true },
      { name: "椰子 90% + 大豆 10%", formula: [{ name: "Coconut", pct: 90 }, { name: "Soy", pct: 10 }], fl: { rec: 9.5, range: "9–10%" } },
    ],
    temp: { addFO: 70, pour: 55 },
    tip: "70–75°C 融蜡 → ~70°C 加香搅拌 1–2 分钟 → 55–60°C 入杯；控制冷却减轻起霜。",
  },
  {
    id: "mould",
    title: "模具/公仔（柱蜡体系，圣诞树等）",
    variants: [
      { name: "蜂蜡 60% + 大豆 40%（最佳）", formula: [{ name: "Beeswax", pct: 60 }, { name: "Soy", pct: 40 }], fl: { rec: 7, range: "6–8%" }, best: true },
      { name: "100% 蜂蜡", formula: [{ name: "Beeswax", pct: 100 }], fl: { rec: 6, range: "6–8%" } },
      { name: "蜂蜡 80% + 椰子 20%", formula: [{ name: "Beeswax", pct: 80 }, { name: "Coconut", pct: 20 }], fl: { rec: 6.5, range: "6–7%" } },
      { name: "棕榈 60% + 蜂蜡 40%", formula: [{ name: "Palm", pct: 60 }, { name: "Beeswax", pct: 40 }], fl: { rec: 7, range: "6–8%" } },
      { name: "石蜡 80% + 蜂蜡 20%", formula: [{ name: "Paraffin", pct: 80 }, { name: "Beeswax", pct: 20 }], fl: { rec: 6.5, range: "6–7%" } },
      { name: "石蜡 90% + 大豆/棕榈 10%", formula: [{ name: "Paraffin", pct: 90 }, { name: "Palm", pct: 10 }], fl: { rec: 7, range: "6–8%" } },
    ],
    temp: { addFO: 70, pour: 60 },
    tip: "冷却后如顶部凹陷可二次回倒；控制收缩与脱模。",
  },
  {
    id: "piping",
    title: "奶油/裱花蜡（表面装饰）",
    variants: [
      { name: "464 55% + C3 30% + 蜂蜡 15%（最佳）", formula: [{ name: "Soy", pct: 55 }, { name: "Coconut", pct: 30 }, { name: "Beeswax", pct: 15 }], fl: { rec: 3, range: "2–4%" }, best: true },
    ],
    temp: { addFO: 65, pour: 57 },
    tip: "裱花窗口 56–58°C；需要更挺可蜂蜡至 18–20%。",
  },
  {
    id: "decor",
    title: "装饰/淋面蜡（表面流淋/渐变）",
    variants: [
      { name: "464 70% + C3 20% + 蜂蜡 10%（最佳）", formula: [{ name: "Soy", pct: 70 }, { name: "Coconut", pct: 20 }, { name: "Beeswax", pct: 10 }], fl: { rec: 3, range: "2–5%" }, best: true },
    ],
    temp: { addFO: 70, pour: 52 },
    tip: "50–55°C 做淋面更顺滑；可结合喷涂颗粒渐变。",
  },
  {
    id: "ice",
    title: "冰花蜡（晶体/裂纹纹理）",
    variants: [
      { name: "100% 冰花/晶体蜡（最佳）", formula: [{ name: "Ice Flower", pct: 100 }], fl: { rec: 5, range: "3–6%" }, best: true },
    ],
    temp: { addFO: 70, pour: 60 },
    tip: "中等浇注温度 + 均匀缓冷；24–48h 观察结晶。",
  },
];

const sortVariants = (vs: Variant[]) => {
  const best = vs.filter(v => v.best);
  const normal = vs.filter(v => !v.best && !v.nr);
  const notRec = vs.filter(v => v.nr);
  return [...best, ...normal, ...notRec];
};

const TEMPLATE_LIBRARY: Template[] = TEMPLATE_LIBRARY_RAW.map(t => ({ ...t, variants: sortVariants(t.variants) }));

// ===== Utils =====
const LS_KEY = "candle.studio.local.v1" as const;
function loadPersisted() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function persist(data: any) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
}
const round1 = (x: number) => Math.round(x * 10) / 10;
const kg = (g: number) => g / 1000;

function normalizeDecimal(input: string) {
  let s = input.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  const first = s.indexOf(".");
  if (first !== -1) s = s.slice(0, first + 1) + s.slice(first + 1).replace(/\./g, "");
  if (s.startsWith(".")) s = "0" + s;
  return s;
}

function computeWaxFromWater({ waterGrams, count, factor = 1.15 }: { waterGrams: number; count: number; factor?: number }) {
  const totalWater = Math.max(0, waterGrams * count);
  const totalWax = totalWater / Math.max(0.01, factor);
  return { totalWater: round1(totalWater), totalWax: round1(totalWax) };
}

function calcLiquidDye(netWax: number, pct: number) { return Math.max(0, +(netWax * (pct / 100)).toFixed(3)); }
function calcBlockCount(netWax: number, shadeMul = 1) { const blocks = (netWax / 3000) * shadeMul; return Math.max(0, +blocks.toFixed(2)); }

// 颜色混合工具函数
function mixColors(color1: string, color2: string, ratio: number) {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

// 根据浓度计算颜色深浅
function getShadeColor(baseColor: string, shade: number) {
  if (shade <= 1) {
    // 浅色：混合白色
    const mix = 1 - shade;
    return mixColors(baseColor, "#FFFFFF", mix);
  } else {
    // 深色：混合黑色
    const mix = (shade - 1) / 1;
    return mixColors(baseColor, "#000000", mix);
  }
}

// ===== UI bits (hoisted & memoized) =====
const Section = memo(({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) => (
  <section className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-200 p-5 md:p-6">
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="font-semibold text-base md:text-lg text-gray-800">{title}</h2>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
    {children}
  </section>
));
Section.displayName = 'Section';

const VariantBadge = memo(({ v }: { v: Variant }) => (
  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs ${v.best?"bg-emerald-100 text-emerald-700 border border-emerald-200":""} ${v.nr?"bg-gray-100 text-gray-500 border border-gray-200":""}`}>
    {v.best?"最佳":v.nr?"不推荐":""}
  </span>
));
VariantBadge.displayName = 'VariantBadge';

// ===== Component =====
export default function CandleStudioApp() {
  const [tplId, setTplId] = useState<string>("container");
  const [variantIndex, setVariantIndex] = useState<number>(0);
  const tpl = useMemo(() => TEMPLATE_LIBRARY.find((t) => t.id === tplId) || TEMPLATE_LIBRARY[0], [tplId]);
  const variant = tpl.variants[Math.min(variantIndex, tpl.variants.length - 1)] || tpl.variants[0];

  const [waterStr, setWaterStr] = useState<string>("320");
  const [countStr, setCountStr] = useState<string>("1");
  const [factorStr, setFactorStr] = useState<string>("1.15");
  const [flPctStr, setFlPctStr] = useState<string>(String(variant.fl.rec));

  const water = useMemo(()=> parseFloat(waterStr) || 0, [waterStr]);
  const count = useMemo(()=> parseFloat(countStr) || 0, [countStr]);
  const factor = useMemo(()=> parseFloat(factorStr) || 1.15, [factorStr]);
  const flPct = useMemo(()=> parseFloat(flPctStr) || 0, [flPctStr]);

  const [dyeMode, setDyeMode] = useState<"block" | "liquid">("block");
  const [dyeBlockColor, setDyeBlockColor] = useState<DyeBlockColor>("Pink");
  const [blockShade, setBlockShade] = useState<number>(1);
  const [liquidPreset, setLiquidPreset] = useState<LiquidPresetId>("med");
  const [liquidColor, setLiquidColor] = useState<LiquidColorName>("Pink");

  const [has464, setHas464] = useState<boolean>(true);
  const [has454, setHas454] = useState<boolean>(true);
  const [hasC3, setHasC3] = useState<boolean>(true);
  const [hasBeeswaxYellow, setHasBeeswaxYellow] = useState<boolean>(true);
  const [hasBeeswaxWhite, setHasBeeswaxWhite] = useState<boolean>(false);

  const [price, setPrice] = useState<Record<PriceKeys, string>>({
    GW464: "", GW454: "", C3: "",
    BeeswaxYellow: "", BeeswaxWhite: "",
    Paraffin: "", Palm: "", "Ice Flower": "",
    Fragrance_perKg: "", DyeBlock_perBlock: "", LiquidDye_perKg: "", Wick_perUnit: "", Jar_perUnit: "",
  });
  
  // 优化：使用 useCallback 包装 setPrice 辅助函数
  const updatePrice = useCallback((k: PriceKeys, v: string) => {
    setPrice((prev) => ({ ...prev, [k]: v }));
  }, []);

  // ===== 优化：统一的持久化逻辑 =====
  // 初始加载：只在组件挂载时执行一次
  useEffect(() => {
    const s = loadPersisted();
    if (!s) return;
    
    // 恢复所有状态
    if (s.tplId) setTplId(s.tplId);
    if (typeof s.variantIndex === 'number') setVariantIndex(s.variantIndex);
    if (s.waterStr) setWaterStr(s.waterStr);
    if (s.countStr) setCountStr(s.countStr);
    if (s.factorStr) setFactorStr(s.factorStr);
    if (s.flPctStr) setFlPctStr(s.flPctStr);
    if (s.dyeMode) setDyeMode(s.dyeMode);
    if (s.dyeBlockColor) setDyeBlockColor(s.dyeBlockColor);
    if (typeof s.blockShade === 'number') setBlockShade(s.blockShade);
    if (s.liquidPreset) setLiquidPreset(s.liquidPreset);
    if (s.liquidColor) setLiquidColor(s.liquidColor);
    if (typeof s.has464 === 'boolean') setHas464(s.has464);
    if (typeof s.has454 === 'boolean') setHas454(s.has454);
    if (typeof s.hasC3 === 'boolean') setHasC3(s.hasC3);
    if (typeof s.hasBeeswaxYellow === 'boolean') setHasBeeswaxYellow(s.hasBeeswaxYellow);
    if (typeof s.hasBeeswaxWhite === 'boolean') setHasBeeswaxWhite(s.hasBeeswaxWhite);
    if (s.price) setPrice(s.price);
  }, []);

  // 持久化：状态改变时自动保存（使用防抖优化）
  useEffect(() => {
    const timer = setTimeout(() => {
      persist({
        tplId, variantIndex,
        waterStr, countStr, factorStr, flPctStr,
        dyeMode, dyeBlockColor, blockShade, liquidPreset, liquidColor,
        has464, has454, hasC3, hasBeeswaxYellow, hasBeeswaxWhite,
        price,
      });
    }, 300); // 300ms 防抖，避免频繁写入
    
    return () => clearTimeout(timer);
  }, [tplId, variantIndex, waterStr, countStr, factorStr, flPctStr, dyeMode, dyeBlockColor, blockShade, liquidPreset, liquidColor, has464, has454, hasC3, hasBeeswaxYellow, hasBeeswaxWhite, price]);

  const mapName = useCallback((n: WaxName): PriceKeys => {
    if (n === "Soy") return (has464 ? "GW464" : "GW454");
    if (n === "Coconut") return "C3";
    if (n === "Beeswax") return hasBeeswaxYellow ? "BeeswaxYellow" : "BeeswaxWhite";
    if (n === "Paraffin") return "Paraffin";
    if (n === "Palm") return "Palm";
    return "Ice Flower";
  }, [has464, hasBeeswaxYellow]);

  const base = useMemo(() => computeWaxFromWater({ waterGrams: Number(water) || 0, count: Number(count) || 0, factor: Number(factor) || 1.15 }), [water, count, factor]);
  const fragranceG = useMemo(() => round1((base.totalWax * (Number(flPct) || 0)) / 100), [base.totalWax, flPct]);
  const netWax = useMemo(() => round1(base.totalWax - fragranceG), [base.totalWax, fragranceG]);

  const priceNum = useMemo(() => {
    const obj: Record<PriceKeys, number> = {
      GW464: 0, GW454: 0, C3: 0, BeeswaxYellow: 0, BeeswaxWhite: 0, Paraffin: 0, Palm: 0, "Ice Flower": 0,
      Fragrance_perKg: 0, DyeBlock_perBlock: 0, LiquidDye_perKg: 0, Wick_perUnit: 0, Jar_perUnit: 0,
    };
    (Object.keys(obj) as PriceKeys[]).forEach((k)=>{ obj[k] = parseFloat(price[k] || "0") || 0; });
    return obj;
  }, [price]);

  const resolved = useMemo(() => variant.formula.map((r) => ({ name: mapName(r.name), pct: r.pct })), [variant, mapName]);
  const partsPriced: Part[] = useMemo(() => resolved.map((r)=> ({ ...r, grams: round1(netWax * (r.pct/100)) })), [resolved, netWax]);

  const liquidPct = useMemo(() => (LIQUID_PRESETS as readonly {id: LiquidPresetId; label: string; pct: number}[]).find((p) => p.id === liquidPreset)?.pct ?? 0.05, [liquidPreset]);
  const liquidG = useMemo(() => calcLiquidDye(netWax, liquidPct), [netWax, liquidPct]);
  const blockCount = useMemo(() => calcBlockCount(netWax, Number(blockShade) || 1), [netWax, blockShade]);

  const waxCost = useMemo(() => partsPriced.reduce((sum, p) => sum + kg(p.grams) * (priceNum[p.name] || 0), 0), [partsPriced, priceNum]);
  const fragranceCost = useMemo(() => kg(fragranceG) * (priceNum.Fragrance_perKg || 0), [fragranceG, priceNum]);
  const dyeCost = useMemo(() => (dyeMode === "block" ? (priceNum.DyeBlock_perBlock || 0) * blockCount : kg(liquidG) * (priceNum.LiquidDye_perKg || 0)), [dyeMode, blockCount, liquidG, priceNum]);
  const accessoriesCostBatch = useMemo(() => ((priceNum.Wick_perUnit || 0) + (priceNum.Jar_perUnit || 0)) * Number(count || 0), [priceNum, count]);
  const totalCostBatch = useMemo(() => waxCost + fragranceCost + dyeCost + accessoriesCostBatch, [waxCost, fragranceCost, dyeCost, accessoriesCostBatch]);
  const costPerCandle = useMemo(() => (Number(count) || 0) ? totalCostBatch / Number(count) : 0, [totalCostBatch, count]);

  const summary = useMemo(() => {
    const lines = [
      `【${tpl.title}｜${variant.name}${variant.nr ? "（不推荐）" : variant.best ? "（最佳）" : ""}】`,
      `装水称重: ${base.totalWater} g，换算因子: ${factor}`,
      `总倒料(含香精): ${base.totalWax} g；香精 ${flPct}% → ${fragranceG} g；净蜡: ${netWax} g`,
      `配方: ` + partsPriced.map((p) => `${p.name} ${p.pct}%→${p.grams} g`).join(" · "),
      dyeMode === "block" ? `色块: ${dyeBlockColor}，深浅倍率×${blockShade} → 预计 ${blockCount} 块` : `液体染料: ${(LIQUID_PRESETS as readonly {id: LiquidPresetId; label: string; pct: number}[]).find(p=>p.id===liquidPreset)?.label} · 颜色 ${liquidColor} → 约 ${liquidG} g`,
      `流程: 加香约 ${tpl.temp.addFO}°C；浇注约 ${tpl.temp.pour}°C。推荐香精负载：${variant.fl.range}（默认 ${variant.fl.rec}%）`,
      `备注: ${tpl.tip}`,
      `— 成本 —`,
      `蜡材: ${waxCost.toFixed(2)} AUD，香精: ${fragranceCost.toFixed(2)}，染料: ${dyeCost.toFixed(2)}，辅料(瓶/芯): ${accessoriesCostBatch.toFixed(2)}`,
      `合计(批): ${totalCostBatch.toFixed(2)} AUD；单只: ${costPerCandle.toFixed(2)} AUD`
    ];
    return lines.join("\n");
  }, [tpl, variant, base, factor, flPct, fragranceG, netWax, partsPriced, dyeMode, dyeBlockColor, blockShade, liquidPreset, liquidG, liquidColor, waxCost, fragranceCost, dyeCost, accessoriesCostBatch, totalCostBatch, costPerCandle, blockCount]);

  const onSelectTpl = useCallback((id: string) => { setTplId(id); setVariantIndex(0); const t = TEMPLATE_LIBRARY.find((x)=>x.id===id) || TEMPLATE_LIBRARY[0]; setFlPctStr(String(t.variants[0].fl.rec)); }, []);
  const onSelectVariant = useCallback((idx: number) => { setVariantIndex(idx); const v = tpl.variants[idx] || tpl.variants[0]; setFlPctStr(String(v.fl.rec)); }, [tpl]);

  const copy = useCallback(async () => { try { await navigator.clipboard.writeText(summary); alert("已复制批次配方到剪贴板"); } catch { alert("复制失败，请手动选择文本复制"); } }, [summary]);

  // 优化：导出数据（改进错误处理和用户反馈）
  const exportData = useCallback(() => {
    try {
      const data = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        appName: "香薰蜡烛 DIY 工作室",
        data: {
          tplId, variantIndex, waterStr, countStr, factorStr, flPctStr,
          dyeMode, dyeBlockColor, blockShade, liquidPreset, liquidColor,
          has464, has454, hasC3, hasBeeswaxYellow, hasBeeswaxWhite,
          price,
        }
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0];
      a.download = `蜡烛工作室-配置备份-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('✅ 数据已导出成功！\n\n文件名：蜡烛工作室-配置备份-' + date + '.json\n\n请妥善保存此文件，需要时可以导入恢复数据。');
    } catch (error) {
      console.error('导出失败:', error);
      alert('❌ 导出失败\n\n可能原因：\n- 浏览器安全限制\n- 存储空间不足\n\n请重试或联系技术支持。');
    }
  }, [tplId, variantIndex, waterStr, countStr, factorStr, flPctStr, dyeMode, dyeBlockColor, blockShade, liquidPreset, liquidColor, has464, has454, hasC3, hasBeeswaxYellow, hasBeeswaxWhite, price]);

  // 优化：导入数据（改进错误处理和验证）
  const importData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // 文件大小检查
      if (file.size > 1024 * 1024) { // 1MB
        alert('❌ 文件过大\n\n配置文件不应超过 1MB，请检查文件是否正确。');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const imported = JSON.parse(content);
          
          // 验证文件格式
          if (!imported.data || !imported.version) {
            throw new Error('文件格式不正确');
          }
          
          const d = imported.data;
          let importedCount = 0;
          
          // 恢复所有状态
          if (d.tplId) { setTplId(d.tplId); importedCount++; }
          if (typeof d.variantIndex === 'number') { setVariantIndex(d.variantIndex); importedCount++; }
          if (d.waterStr) { setWaterStr(d.waterStr); importedCount++; }
          if (d.countStr) { setCountStr(d.countStr); importedCount++; }
          if (d.factorStr) { setFactorStr(d.factorStr); importedCount++; }
          if (d.flPctStr) { setFlPctStr(d.flPctStr); importedCount++; }
          if (d.dyeMode) { setDyeMode(d.dyeMode); importedCount++; }
          if (d.dyeBlockColor) { setDyeBlockColor(d.dyeBlockColor); importedCount++; }
          if (typeof d.blockShade === 'number') { setBlockShade(d.blockShade); importedCount++; }
          if (d.liquidPreset) { setLiquidPreset(d.liquidPreset); importedCount++; }
          if (d.liquidColor) { setLiquidColor(d.liquidColor); importedCount++; }
          if (typeof d.has464 === 'boolean') { setHas464(d.has464); importedCount++; }
          if (typeof d.has454 === 'boolean') { setHas454(d.has454); importedCount++; }
          if (typeof d.hasC3 === 'boolean') { setHasC3(d.hasC3); importedCount++; }
          if (typeof d.hasBeeswaxYellow === 'boolean') { setHasBeeswaxYellow(d.hasBeeswaxYellow); importedCount++; }
          if (typeof d.hasBeeswaxWhite === 'boolean') { setHasBeeswaxWhite(d.hasBeeswaxWhite); importedCount++; }
          if (d.price) { setPrice(d.price); importedCount++; }
          
          const exportDate = imported.exportDate ? new Date(imported.exportDate).toLocaleDateString('zh-CN') : '未知';
          alert(`✅ 数据导入成功！\n\n导出时间：${exportDate}\n恢复项目：${importedCount} 项配置\n\n所有设置已恢复完成。`);
        } catch (error) {
          console.error('导入失败:', error);
          alert('❌ 导入失败\n\n可能原因：\n- 文件格式不正确\n- 文件已损坏\n- 不是本应用导出的文件\n\n请确保选择正确的配置文件。');
        }
      };
      reader.onerror = () => {
        alert('❌ 文件读取失败\n\n请重试或选择其他文件。');
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-white to-orange-50 text-gray-900 pb-24 md:pb-6">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl md:text-3xl">🕯️</span>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  香薰蜡烛 DIY 工作室
                </h1>
              </div>
              <p className="text-gray-600 mt-1 text-xs md:text-sm leading-relaxed">
                专业配方计算器 · 选类型 → 选配方 → 输入参数 → 自动计算用量与成本
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={importData} 
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs md:text-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all active:scale-95" 
                title="从文件导入数据"
                aria-label="导入配置数据"
              >
                <span>📥</span>
                <span className="hidden sm:inline">导入</span>
              </button>
              <button 
                onClick={exportData} 
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs md:text-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all active:scale-95" 
                title="导出数据到文件"
                aria-label="导出配置数据"
              >
                <span>💾</span>
                <span className="hidden sm:inline">导出</span>
              </button>
              <button 
                onClick={() => { if(confirm('确定要清空所有本地数据吗？此操作不可恢复！')) { localStorage.removeItem(LS_KEY); window.location.reload(); } }} 
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs md:text-sm hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all active:scale-95"
                aria-label="清空所有记录"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">清空</span>
              </button>
              <button 
                onClick={copy} 
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-xs md:text-sm font-medium hover:from-amber-600 hover:to-orange-600 hover:shadow-md transition-all active:scale-95 shadow-sm"
                aria-label="复制当前批次配方"
              >
                <span>📋</span>
                <span className="hidden sm:inline">复制配方</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 space-y-4 md:space-y-6">
        <Section title="① 选择制作类型" right={<div className="text-xs text-gray-400">加香 {tpl.temp.addFO}°C · 浇注 {tpl.temp.pour}°C</div>}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {TEMPLATE_LIBRARY.map((t) => (
              <button 
                key={t.id} 
                onClick={() => onSelectTpl(t.id)} 
                className={`rounded-xl border-2 p-4 text-left transition-all duration-200 active:scale-[0.98] ${
                  tplId===t.id
                    ? "border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md ring-2 ring-amber-200"
                    : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-sm"
                }`}
              >
                <div className="font-semibold text-sm md:text-base text-gray-800 flex items-center gap-2 mb-1">
                  <span>{t.title}</span>
                  {tplId===t.id && <span className="text-amber-600">✓</span>}
                </div>
                <div className="text-[10px] md:text-xs text-gray-500 mt-1.5">
                  ⭐ {t.variants.find(v=>v.best)?.name.replace(/（最佳）/g,"") || "推荐配方"}
                </div>
              </button>
            ))}
          </div>
        </Section>

        <Section title="② 配方方案（高亮【最佳】在最前）">
          <div className="grid md:grid-cols-3 gap-3 items-end">
            <label className="block text-sm font-medium text-gray-700">
              配方方案
              <select 
                className="mt-1.5 w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 h-11 md:h-12 bg-white hover:border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-colors cursor-pointer" 
                value={variantIndex} 
                onChange={(e)=>onSelectVariant(Number(e.target.value))}
              >
                {tpl.variants.map((v, i) => (
                  <option key={v.name} value={i}>
                    {v.name} · 香精 {v.fl.rec}%（{v.fl.range}）
                  </option>
                ))}
              </select>
            </label>
            <div className="text-xs text-gray-500">推荐：{variant.fl.rec}%（{variant.fl.range}）</div>
            <div className="text-xs text-gray-500 truncate">提示：{tpl.tip}</div>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {tpl.variants.map((v,i)=> (
              <div 
                key={v.name} 
                className={`rounded-xl border-2 p-4 text-sm transition-all cursor-pointer ${
                  i===variantIndex
                    ? "border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md ring-2 ring-amber-200"
                    : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/30 hover:shadow-sm"
                }`}
                onClick={() => onSelectVariant(i)}
              >
                <div className="font-semibold flex items-center text-gray-800">
                  {v.name}
                  {i===variantIndex && <span className="ml-2 text-amber-600">✓</span>}
                  <VariantBadge v={v} />
                </div>
                <div className="text-xs text-gray-600 mt-2">香精：{v.fl.rec}%（{v.fl.range}）</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="③ 我的库存优先级 & 单价（AUD）">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 text-sm">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all">
              <input type="checkbox" checked={has464} onChange={(e)=>setHas464(e.target.checked)} className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer" />
              <span className="text-sm font-medium text-gray-700">GW464</span>
            </label>
            <label className="flex items-center gap-2.5 p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all">
              <input type="checkbox" checked={has454} onChange={(e)=>setHas454(e.target.checked)} className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer" />
              <span className="text-sm font-medium text-gray-700">GW454</span>
            </label>
            <label className="flex items-center gap-2.5 p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all">
              <input type="checkbox" checked={hasC3} onChange={(e)=>setHasC3(e.target.checked)} className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer" />
              <span className="text-sm font-medium text-gray-700">C3</span>
            </label>
            <label className="flex items-center gap-2.5 p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all">
              <input type="checkbox" checked={hasBeeswaxYellow} onChange={(e)=>setHasBeeswaxYellow(e.target.checked)} className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer" />
              <span className="text-sm font-medium text-gray-700">Beeswax Yellow</span>
            </label>
            <label className="flex items-center gap-2.5 p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all">
              <input type="checkbox" checked={hasBeeswaxWhite} onChange={(e)=>setHasBeeswaxWhite(e.target.checked)} className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer" />
              <span className="text-sm font-medium text-gray-700">Beeswax White</span>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 mt-3 text-sm">
            {[
              ["GW464","GW464 (AUD/kg)"],
              ["GW454","GW454 (AUD/kg)"],
              ["C3","C3 (AUD/kg)"],
              ["BeeswaxYellow","Beeswax Yellow (AUD/kg)"],
              ["BeeswaxWhite","Beeswax White (AUD/kg)"],
              ["Paraffin","Paraffin (AUD/kg)"],
              ["Palm","Palm (AUD/kg)"],
              ["Ice Flower","Ice Flower (AUD/kg)"],
              ["Fragrance_perKg","Fragrance (AUD/kg)"],
              ["DyeBlock_perBlock","Dye Block (AUD/块)"],
              ["LiquidDye_perKg","Liquid Dye (AUD/kg)"],
              ["Wick_perUnit","Wick (AUD/只)"],
              ["Jar_perUnit","Jar (AUD/只)"],
            ].map(([key,label])=> (
              <label key={key as string} className="block">
                <span className="text-xs text-gray-600">{label as string}</span>
                <input 
                  inputMode="decimal" 
                  type="text" 
                  className="mt-1.5 w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 h-11 bg-white hover:border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-colors" 
                  value={price[key as PriceKeys] ?? ""} 
                  onChange={(e)=>updatePrice(key as PriceKeys, normalizeDecimal(e.target.value))} 
                />
              </label>
            ))}
          </div>
        </Section>

        <Section title="④ 蜡材参数（仅显示我有库存）">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {(() => {
              const cards: { key: WaxKey; show: boolean }[] = [
                { key: "GW464", show: has464 },
                { key: "GW454", show: has454 },
                { key: "C3", show: hasC3 },
                { key: "BeeswaxBlock", show: hasBeeswaxYellow },
                { key: "BeeswaxPaleBeaded", show: hasBeeswaxWhite },
                { key: "Ice Flower", show: true },
              ];
              return cards.filter(c => c.show).map(c => {
                const w = WAX_INFO[c.key];
                return (
                  <div key={c.key} className="rounded-xl border p-3 bg-white/80">
                    <div className="font-medium mb-1">{w.name}</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>类型：{w.type}</div>
                      {w.meltPoint && <div>熔点：{w.meltPoint}</div>}
                      {w.pourTemp && <div>倒蜡温度：{w.pourTemp}</div>}
                      {w.fragranceLoad && <div>香精承载：{w.fragranceLoad}</div>}
                      {w.suitable && <div>适合：{w.suitable}</div>}
                      {w.properties && <div>特性：{w.properties}</div>}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </Section>

        <Section title="⑤ 用量参数（【装水称重】法）">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
            <label className="block text-sm font-medium text-gray-700">
              单个模具水重 (g)
              <input 
                inputMode="numeric" 
                type="text" 
                className="mt-1.5 w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 h-11 bg-white hover:border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-colors" 
                value={waterStr} 
                onChange={(e)=>setWaterStr(normalizeDecimal(e.target.value))} 
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              数量 (个)
              <input 
                inputMode="numeric" 
                type="text" 
                className="mt-1.5 w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 h-11 bg-white hover:border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-colors" 
                value={countStr} 
                onChange={(e)=>setCountStr(normalizeDecimal(e.target.value))} 
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              水→蜡换算因子
              <input 
                inputMode="decimal" 
                type="text" 
                className="mt-1.5 w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 h-11 bg-white hover:border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-colors" 
                value={factorStr} 
                onChange={(e)=>setFactorStr(normalizeDecimal(e.target.value))} 
              />
              <div className="text-xs text-gray-500 mt-1.5">常用 1.15（大豆/椰子系经验）</div>
            </label>
            <label className="block text-sm font-medium text-gray-700">
              香精负载 (%)
              <input 
                inputMode="decimal" 
                type="text" 
                className="mt-1.5 w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 h-11 bg-white hover:border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-colors" 
                value={flPctStr} 
                onChange={(e)=>setFlPctStr(normalizeDecimal(e.target.value))} 
              />
              <div className="text-xs text-gray-500 mt-1.5">{variant.fl.range}（默认 {variant.fl.rec}%）</div>
            </label>
            <div className="text-sm bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200 flex flex-col justify-center shadow-sm">
              <div className="font-semibold text-gray-800 mb-1">计算结果</div>
              <div className="text-gray-700">总水重：<span className="font-mono font-semibold text-amber-700">{base.totalWater} g</span></div>
              <div className="text-gray-700 mt-1">总倒料（含香精）：<span className="font-mono font-semibold text-amber-700">{base.totalWax} g</span></div>
            </div>
          </div>
        </Section>

        <Section title="⑥ 上色方式与用量">
          <div className="inline-flex rounded-xl border-2 border-gray-200 p-1 bg-gray-50">
            <button 
              aria-pressed={dyeMode==='block'} 
              onClick={()=>setDyeMode('block')} 
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                dyeMode==='block'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              色块（Dye Block）
            </button>
            <button 
              aria-pressed={dyeMode==='liquid'} 
              onClick={()=>setDyeMode('liquid')} 
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                dyeMode==='liquid'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              液体染料
            </button>
          </div>

          {dyeMode==='block' ? (
            <div className="mt-4 space-y-4">
              {/* 色块颜色选择 - 直接展示 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">选择色块颜色</label>
                <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-3">
                  {DYE_BLOCK_COLORS.map((color) => {
                    const isSelected = dyeBlockColor === color;
                    const displayColor = getShadeColor(SWATCH(color), blockShade);
                    
                    return (
                      <button
                        key={color}
                        onClick={() => setDyeBlockColor(color)}
                        className={`relative rounded-xl border-2 p-3 transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'border-amber-500 ring-2 ring-amber-200 shadow-md scale-105'
                            : 'border-gray-200 hover:border-amber-300 hover:shadow-sm'
                        }`}
                        title={color}
                      >
                        <div 
                          className="w-full h-16 rounded-lg mb-2 border border-gray-300"
                          style={{ background: displayColor }}
                        />
                        <div className="text-xs font-medium text-gray-700 text-center">
                          {color}
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-[10px]">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 浓度调节 */}
      <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  深浅强度：<span className="text-amber-600 font-semibold">×{blockShade}</span>
                </label>
                <div className="rounded-xl border-2 border-gray-200 bg-white p-4">
                  <input 
                    type="range" 
                    min={0.5} 
                    max={2} 
                    step={0.25} 
                    value={blockShade} 
                    onChange={(e)=>setBlockShade(parseFloat(e.target.value))} 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="mt-3 flex justify-between text-xs text-gray-600">
                    <div className="text-center">
                      <div className="font-medium">Pastel</div>
                      <div className="text-gray-400">×0.5</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Medium</div>
                      <div className="text-gray-400">×1.0</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Dark</div>
                      <div className="text-gray-400">×1.5</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Very Dark</div>
                      <div className="text-gray-400">×2.0</div>
                    </div>
                  </div>
                  
                  {/* 当前选中颜色的浓度预览 */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-2">当前颜色浓度预览：</div>
                    <div className="flex gap-2">
                      {[0.5, 1.0, 1.5, 2.0].map((shade) => {
                        const previewColor = getShadeColor(SWATCH(dyeBlockColor), shade);
                        const isCurrent = Math.abs(blockShade - shade) < 0.1;
                        return (
                          <div key={shade} className="flex-1 text-center">
                            <div 
                              className={`w-full h-12 rounded-lg mb-1 border-2 ${
                                isCurrent ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-300'
                              }`}
                              style={{ background: previewColor }}
                            />
                            <div className={`text-[10px] ${isCurrent ? 'font-semibold text-amber-600' : 'text-gray-500'}`}>
                              ×{shade}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 预计用量 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-4 flex items-center justify-between shadow-sm">
                  <div className="text-sm font-medium text-gray-700">预计需要色块</div>
                  <div className="text-3xl font-bold tabular-nums text-amber-700">{blockCount}</div>
                </div>
                <div className="rounded-xl bg-white border-2 border-gray-200 p-4 text-xs text-gray-600 md:col-span-2">
                  <strong className="text-gray-800">💡 专业建议：</strong>1 块 ≈ 3 kg 蜡（中深度）。建议先做 20–50 g 小样测试，逐步加深至目标色。深色可能需要更大芯号，避免隧道燃烧。色块需刨片后加入，充分搅拌确保均匀。
                </div>
              </div>
      </div>
          ) : (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
              <div className="md:col-span-7">
                <label className="block text-sm">液体颜色</label>
                <div className="mt-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {LIQUID_DYE_COLORS.map(c => (
                    <button key={c.name} onClick={()=>setLiquidColor(c.name)} className={`flex items-center gap-2 border rounded-lg px-2 py-2 text-xs hover:bg-gray-50 ${liquidColor===c.name? 'ring-2 ring-black/10 bg-gray-50':''}`}>
                      <span className="w-5 h-5 rounded border" style={{background: LIQUID_SWATCH(c.name)}} />
                      <span className="truncate">{c.name}</span>
        </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-5 grid gap-2">
                <label className="block text-sm">色深预设</label>
                <select className="mt-1 w-full border rounded-xl px-3 py-2 h-11" value={liquidPreset} onChange={(e)=>setLiquidPreset(e.target.value as LiquidPresetId)}>
                  {(LIQUID_PRESETS as readonly {id: LiquidPresetId; label: string; pct: number}[]).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                <div className="rounded-xl border p-3 text-sm bg-gray-50">预计液体染料：<span className="font-mono text-lg">{liquidG}</span> g</div>
                <div className="text-[11px] text-gray-500">参考：10 ml ≈ 1 kg 蜡（中深度），不同颜色会有差异。建议先做小样测试，确认颜色后再大批量制作。</div>
              </div>
            </div>
          )}
        </Section>

        <Section title="⑦ 批次配方清单 + 成本">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between"><span>香精 {flPct}%</span><span className="font-mono">{fragranceG} g</span></div>
              <div className="flex justify-between font-semibold"><span>净蜡（扣除香精）</span><span className="font-mono">{netWax} g</span></div>
              <ul className="list-disc pl-5 mt-2">
                {partsPriced.map((p) => (<li key={p.name}>{p.name}：<span className="font-mono">{p.grams} g</span>（{p.pct}%）</li>))}
              </ul>
              {dyeMode==='block' ? (<div className="mt-2">色块：{dyeBlockColor} × <span className="font-mono">{blockCount}</span> 块</div>) : (<div className="mt-2">液体染料：<span className="font-mono">{liquidG}</span> g</div>)}
            </div>
            <div className="text-xs text-gray-600 leading-5">
              <div className="font-medium text-gray-800 mb-1">专业流程建议</div>
              <div>1) <strong>融蜡</strong>：70–75°C 完全融蜡，使用温度计监控，避免过热（大豆蜡 65-75°C，椰子蜡 70-80°C，蜂蜡 75-85°C）。</div>
              <div>2) <strong>加香</strong>：在 {tpl.temp.addFO}°C 左右加入香精，搅拌 1–2 分钟确保均匀。温度过高会挥发香味，过低会混合不均。</div>
              <div>3) <strong>上色</strong>：液体染料在加香前后皆可加入；色块需刨片后逐步加入，先做 20-50g 小样测试深浅。</div>
              <div>4) <strong>浇注</strong>：约 {tpl.temp.pour}°C 缓慢倒入（容器 55–60°C；模具 58–62°C；裱花 56–58°C；淋面 50–55°C）。避免产生气泡。</div>
              <div>5) <strong>冷却</strong>：室温下静置 24-48 小时，避免移动。模具类如出现顶部凹陷，待冷却后进行二次回倒。</div>
              <div>6) <strong>测试</strong>：首次燃烧至少 2-3 小时形成完整熔池，记录芯号、燃面温度、蘑菇头、隧道/冒烟情况。</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-5 border-2 border-gray-200 shadow-sm">
              <div className="font-semibold text-gray-800 mb-3 text-base">成本汇总（批）</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-gray-600">蜡材</span>
                  <span className="font-mono font-semibold text-gray-800">{waxCost.toFixed(2)} AUD</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-gray-600">香精</span>
                  <span className="font-mono font-semibold text-gray-800">{fragranceCost.toFixed(2)} AUD</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-gray-600">染料</span>
                  <span className="font-mono font-semibold text-gray-800">{dyeCost.toFixed(2)} AUD</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-gray-600">辅料(瓶/芯)</span>
                  <span className="font-mono font-semibold text-gray-800">{accessoriesCostBatch.toFixed(2)} AUD</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-gray-300">
                  <span className="font-semibold text-gray-800">合计（批）</span>
                  <span className="font-mono font-bold text-lg text-amber-700">{totalCostBatch.toFixed(2)} AUD</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 border-2 border-amber-200 shadow-md">
              <div className="font-semibold text-gray-800 mb-3 text-base">成本（单只）</div>
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {costPerCandle.toFixed(2)}
                </span>
                <span className="text-xl font-semibold text-gray-700">AUD</span>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                批量制作可降低单只成本
              </div>
            </div>
          </div>

          <div className="hidden md:flex justify-end mt-4">
            <button 
              onClick={copy} 
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-3 text-sm font-medium hover:from-amber-600 hover:to-orange-600 hover:shadow-lg transition-all active:scale-95 shadow-md"
            >
              <span>📋</span>
              <span>复制整批配方</span>
            </button>
          </div>
        </Section>

        <TipsSection />
      </main>

      <div className="fixed md:hidden left-0 right-0 bottom-0 z-20 border-t-2 border-gray-200 bg-white/98 backdrop-blur-md shadow-lg px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="text-[10px] text-gray-500 mb-0.5">单只成本</div>
              <div className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {costPerCandle.toFixed(2)} AUD
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={importData} 
                className="rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs hover:bg-gray-50 hover:border-amber-300 transition-all active:scale-95" 
                title="导入数据"
                aria-label="导入"
              >
                📥
              </button>
              <button 
                onClick={exportData} 
                className="rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs hover:bg-gray-50 hover:border-amber-300 transition-all active:scale-95" 
                title="导出数据"
                aria-label="导出"
              >
                💾
              </button>
              <button 
                onClick={copy} 
                className="rounded-xl border-2 border-amber-500 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-sm font-medium shadow-md hover:shadow-lg transition-all active:scale-95"
                aria-label="复制配方"
              >
                复制
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
