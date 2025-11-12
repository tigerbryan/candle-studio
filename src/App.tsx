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

// ===== UI bits (hoisted & memoized) =====
const Section = memo(({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) => (
  <section className="rounded-2xl border p-4 bg-white/80 backdrop-blur">
    <div className="flex items-center justify-between gap-3 mb-3">
      <h2 className="font-medium text-base md:text-lg">{title}</h2>
      {right}
    </div>
    {children}
  </section>
));

const VariantBadge = memo(({ v }: { v: Variant }) => (
  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs ${v.best?"bg-emerald-100 text-emerald-700 border border-emerald-200":""} ${v.nr?"bg-gray-100 text-gray-500 border border-gray-200":""}`}>
    {v.best?"最佳":v.nr?"不推荐":""}
  </span>
));

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
  const setP = (k: PriceKeys, v: string) => setPrice((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cs.price");
      if (saved) setPrice(JSON.parse(saved));
      const inv = localStorage.getItem("cs.inventory");
      if (inv) {
        const o = JSON.parse(inv);
        setHas464(!!o.has464);
        setHas454(!!o.has454);
        setHasC3(!!o.hasC3);
        setHasBeeswaxYellow(!!o.hasBeeswaxYellow);
        setHasBeeswaxWhite(!!o.hasBeeswaxWhite);
      }
      const inputs = localStorage.getItem("cs.inputs");
      if (inputs) {
        const i = JSON.parse(inputs);
        if (i.waterStr != null) setWaterStr(String(i.waterStr));
        if (i.countStr != null) setCountStr(String(i.countStr));
        if (i.factorStr != null) setFactorStr(String(i.factorStr));
        if (i.flPctStr != null) setFlPctStr(String(i.flPctStr));
      }
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem("cs.price", JSON.stringify(price)); } catch {} }, [price]);
  useEffect(() => { try { localStorage.setItem("cs.inventory", JSON.stringify({ has464, has454, hasC3, hasBeeswaxYellow, hasBeeswaxWhite })); } catch {} }, [has464, has454, hasC3, hasBeeswaxYellow, hasBeeswaxWhite]);
  useEffect(() => { try { localStorage.setItem("cs.inputs", JSON.stringify({ waterStr, countStr, factorStr, flPctStr })); } catch {} }, [waterStr, countStr, factorStr, flPctStr]);

  // ===== Load persisted state (once) =====
  useEffect(() => {
    const s = loadPersisted();
    if (!s) return;
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

  // ===== Persist on change =====
  useEffect(() => {
    persist({
      tplId, variantIndex,
      waterStr, countStr, factorStr, flPctStr,
      dyeMode, dyeBlockColor, blockShade, liquidPreset, liquidColor,
      has464, has454, hasC3, hasBeeswaxYellow, hasBeeswaxWhite,
      price,
    });
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

  // 导出数据
  const exportData = useCallback(() => {
    try {
      const data = {
        version: "1.0",
        exportDate: new Date().toISOString(),
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
      a.download = `candle-studio-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('数据已导出！文件已下载到你的电脑。');
    } catch (error) {
      alert('导出失败，请重试');
    }
  }, [tplId, variantIndex, waterStr, countStr, factorStr, flPctStr, dyeMode, dyeBlockColor, blockShade, liquidPreset, liquidColor, has464, has454, hasC3, hasBeeswaxYellow, hasBeeswaxWhite, price]);

  // 导入数据
  const importData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const imported = JSON.parse(content);
          if (!imported.data) throw new Error('Invalid file format');
          const d = imported.data;
          // 恢复所有状态
          if (d.tplId) setTplId(d.tplId);
          if (typeof d.variantIndex === 'number') setVariantIndex(d.variantIndex);
          if (d.waterStr) setWaterStr(d.waterStr);
          if (d.countStr) setCountStr(d.countStr);
          if (d.factorStr) setFactorStr(d.factorStr);
          if (d.flPctStr) setFlPctStr(d.flPctStr);
          if (d.dyeMode) setDyeMode(d.dyeMode);
          if (d.dyeBlockColor) setDyeBlockColor(d.dyeBlockColor);
          if (typeof d.blockShade === 'number') setBlockShade(d.blockShade);
          if (d.liquidPreset) setLiquidPreset(d.liquidPreset);
          if (d.liquidColor) setLiquidColor(d.liquidColor);
          if (typeof d.has464 === 'boolean') setHas464(d.has464);
          if (typeof d.has454 === 'boolean') setHas454(d.has454);
          if (typeof d.hasC3 === 'boolean') setHasC3(d.hasC3);
          if (typeof d.hasBeeswaxYellow === 'boolean') setHasBeeswaxYellow(d.hasBeeswaxYellow);
          if (typeof d.hasBeeswaxWhite === 'boolean') setHasBeeswaxWhite(d.hasBeeswaxWhite);
          if (d.price) setPrice(d.price);
          alert('数据导入成功！');
        } catch (error) {
          alert('导入失败，请确保文件格式正确');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white text-gray-900 pb-24 md:pb-6">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold">香薰蜡烛 DIY · 配方/用量/颜色/成本 工具</h1>
            <p className="text-gray-500 mt-0.5 text-xs md:text-sm">选类型 → 选配方 → 输入水重/数量/单价 → 自动出克数与成本。优先你的库存（464/454/C3/黄蜂蜡/白蜂蜡）。</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={importData} className="hidden md:inline-flex rounded-xl border px-3 py-2 text-sm hover:bg-gray-50" title="从文件导入数据">📥 导入数据</button>
            <button onClick={exportData} className="hidden md:inline-flex rounded-xl border px-3 py-2 text-sm hover:bg-gray-50" title="导出数据到文件">💾 导出数据</button>
            <button onClick={() => { if(confirm('确定要清空所有本地数据吗？')) { localStorage.removeItem(LS_KEY); window.location.reload(); } }} className="hidden md:inline-flex rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">清空记录</button>
            <button onClick={copy} className="hidden md:inline-flex rounded-xl border px-3 py-2 text-sm bg-black text-white hover:opacity-90">复制整批配方</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 space-y-4 md:space-y-6">
        <Section title="① 选择制作类型" right={<div className="text-xs text-gray-400">加香 {tpl.temp.addFO}°C · 浇注 {tpl.temp.pour}°C</div>}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
            {TEMPLATE_LIBRARY.map((t) => (
              <button key={t.id} onClick={() => onSelectTpl(t.id)} className={`rounded-xl border p-3 text-left hover:bg-gray-50 active:scale-[0.99] transition ${tplId===t.id?"ring-2 ring-black/10 bg-gray-50":""}`}>
                <div className="font-medium text-sm md:text-base flex items-center gap-2">
                  <span>{t.title}</span>
                </div>
                <div className="text-[10px] md:text-xs text-gray-400 mt-1">最佳：{t.variants.find(v=>v.best)?.name.replace(/（最佳）/g,"")}</div>
              </button>
            ))}
          </div>
        </Section>

        <Section title="② 配方方案（高亮【最佳】在最前）">
          <div className="grid md:grid-cols-3 gap-3 items-end">
            <label className="block text-sm">方案
              <select className="mt-1 w-full border rounded-xl px-3 py-2 h-10 md:h-11" value={variantIndex} onChange={(e)=>onSelectVariant(Number(e.target.value))}>
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
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {tpl.variants.map((v,i)=> (
              <div key={v.name} className={`rounded-xl border p-3 text-sm ${i===variantIndex?"border-black/20 bg-gray-50":""}`}>
                <div className="font-medium flex items-center">{v.name}<VariantBadge v={v} /></div>
                <div className="text-xs text-gray-500 mt-1">香精：{v.fl.rec}%（{v.fl.range}）</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="③ 我的库存优先级 & 单价（AUD）">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 text-sm">
            <label className="flex items-center gap-2 p-2 rounded-lg border"><input type="checkbox" checked={has464} onChange={(e)=>setHas464(e.target.checked)} />GW464</label>
            <label className="flex items-center gap-2 p-2 rounded-lg border"><input type="checkbox" checked={has454} onChange={(e)=>setHas454(e.target.checked)} />GW454</label>
            <label className="flex items-center gap-2 p-2 rounded-lg border"><input type="checkbox" checked={hasC3} onChange={(e)=>setHasC3(e.target.checked)} />C3</label>
            <label className="flex items-center gap-2 p-2 rounded-lg border"><input type="checkbox" checked={hasBeeswaxYellow} onChange={(e)=>setHasBeeswaxYellow(e.target.checked)} />Beeswax Yellow</label>
            <label className="flex items-center gap-2 p-2 rounded-lg border"><input type="checkbox" checked={hasBeeswaxWhite} onChange={(e)=>setHasBeeswaxWhite(e.target.checked)} />Beeswax White</label>
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
                <input inputMode="decimal" type="text" className="mt-1 w-full border rounded-xl px-3 py-2 h-10" value={price[key as PriceKeys] ?? ""} onChange={(e)=>setP(key as PriceKeys, normalizeDecimal(e.target.value))} />
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
            <label className="block text-sm">单个模具水重(g)
              <input inputMode="numeric" type="text" className="mt-1 w-full border rounded-xl px-3 py-2 h-10" value={waterStr} onChange={(e)=>setWaterStr(normalizeDecimal(e.target.value))} />
            </label>
            <label className="block text-sm">数量(个)
              <input inputMode="numeric" type="text" className="mt-1 w-full border rounded-xl px-3 py-2 h-10" value={countStr} onChange={(e)=>setCountStr(normalizeDecimal(e.target.value))} />
            </label>
            <label className="block text-sm">水→蜡换算因子
              <input inputMode="decimal" type="text" className="mt-1 w-full border rounded-xl px-3 py-2 h-10" value={factorStr} onChange={(e)=>setFactorStr(normalizeDecimal(e.target.value))} />
              <div className="text-xs text-gray-400 mt-1">常用 1.15（大豆/椰子系经验）</div>
            </label>
            <label className="block text-sm">香精负载(%)
              <input inputMode="decimal" type="text" className="mt-1 w-full border rounded-xl px-3 py-2 h-10" value={flPctStr} onChange={(e)=>setFlPctStr(normalizeDecimal(e.target.value))} />
              <div className="text-xs text-gray-400 mt-1">{variant.fl.range}（默认 {variant.fl.rec}%）</div>
            </label>
            <div className="text-sm bg-gray-50 rounded-xl p-3 flex flex-col justify-center">
              <div>总水重：<span className="font-mono">{base.totalWater} g</span></div>
              <div>总倒料（含香精）：<span className="font-mono">{base.totalWax} g</span></div>
            </div>
          </div>
        </Section>

        <Section title="⑥ 上色方式与用量">
          <div className="inline-flex rounded-xl border p-0.5 bg-white">
            <button aria-pressed={dyeMode==='block'} onClick={()=>setDyeMode('block')} className={`px-3 py-2 rounded-lg text-sm transition ${dyeMode==='block'?'bg-black text-white':'text-gray-700'}`}>色块（Dye Block）</button>
            <button aria-pressed={dyeMode==='liquid'} onClick={()=>setDyeMode('liquid')} className={`px-3 py-2 rounded-lg text-sm transition ${dyeMode==='liquid'?'bg-black text-white':'text-gray-700'}`}>液体染料</button>
          </div>

          {dyeMode==='block' ? (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
              <div className="md:col-span-6">
                <label className="block text-sm">色块颜色</label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg border" style={{ background: SWATCH(dyeBlockColor) }} />
                  <select className="flex-1 border rounded-xl px-3 py-2 h-11" value={dyeBlockColor} onChange={(e)=>setDyeBlockColor(e.target.value as DyeBlockColor)}>
                    {DYE_BLOCK_COLORS.map((c)=> (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-6">
                <label className="block text-sm">深浅强度（0.5–2.0）</label>
                <div className="mt-1 rounded-xl border p-3 bg-gray-50">
                  <input type="range" min={0.5} max={2} step={0.25} value={blockShade} onChange={(e)=>setBlockShade(parseFloat(e.target.value))} className="w-full" />
                  <div className="mt-1 flex justify-between text-[10px] text-gray-500">
                    <span>Pastel ×0.5</span><span>Medium ×1</span><span>Dark ×1.5</span><span>Very Dark ×2</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl bg-white border p-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">预计需要色块</div>
                  <div className="text-2xl font-semibold tabular-nums">{blockCount}</div>
                </div>
                <div className="rounded-xl bg-white border p-3 text-xs text-gray-600 md:col-span-2">
                  经验：1 块 ≈ 3 kg 蜡（中深度）。建议先做 20–50 g 小样，逐步加深；深色可能需要更大芯号。
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
                <div className="text-[11px] text-gray-500">参考：10 ml ≈ 1 kg 蜡（中深度），不同颜色会有差异。</div>
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
              <div className="font-medium text-gray-800 mb-1">流程建议</div>
              <div>1) 70–75°C 完全融蜡 → 在 {tpl.temp.addFO}°C 左右加入香精（搅拌 1–2 分钟）。</div>
              <div>2) 染料：液体可在加香前后皆可加入；色块刨片逐步加入至目标色。</div>
              <div>3) 浇注：约 {tpl.temp.pour}°C（容器 55–60°C；模具 58–62°C；裱花 56–58°C；淋面 50–55°C）。</div>
              <div>4) 模具类如出现顶部凹陷，待冷却后进行二次回倒；冰花蜡需均匀缓冷以强化晶体纹理。</div>
              <div>5) 做燃烧测试：记录芯号、燃面温度、蘑菇头、隧道/冒烟情况。</div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white p-3 border">
              <div className="font-medium mb-2">成本汇总（批）</div>
              <div>蜡材：<span className="font-mono">{waxCost.toFixed(2)}</span> AUD</div>
              <div>香精：<span className="font-mono">{fragranceCost.toFixed(2)}</span> AUD</div>
              <div>染料：<span className="font-mono">{dyeCost.toFixed(2)}</span> AUD</div>
              <div>辅料(瓶/芯)：<span className="font-mono">{accessoriesCostBatch.toFixed(2)}</span> AUD</div>
              <div className="font-semibold mt-1">合计（批）：<span className="font-mono">{totalCostBatch.toFixed(2)}</span> AUD</div>
            </div>
            <div className="rounded-xl bg-white p-3 border">
              <div className="font-medium mb-2">成本（单只）</div>
              <div className="text-2xl font-semibold"><span className="font-mono">{costPerCandle.toFixed(2)}</span> AUD</div>
            </div>
          </div>

          <div className="hidden md:flex justify-end mt-3">
            <button onClick={copy} className="rounded-xl border px-3 py-2 text-sm bg-black text-white hover:opacity-90">复制整批配方</button>
          </div>
        </Section>
      </main>

      <div className="fixed md:hidden left-0 right-0 bottom-0 z-20 border-t bg-white/95 backdrop-blur px-4 py-2">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div>
              <div className="text-[10px] text-gray-500">单只成本</div>
              <div className="text-lg font-semibold">{costPerCandle.toFixed(2)} AUD</div>
            </div>
            <div className="flex gap-2">
              <button onClick={importData} className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50" title="导入数据">📥</button>
              <button onClick={exportData} className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50" title="导出数据">💾</button>
              <button onClick={copy} className="rounded-xl border px-3 py-2 text-sm bg-black text-white">复制配方</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
