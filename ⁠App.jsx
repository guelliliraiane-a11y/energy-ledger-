Des site gratuit ou appli gratuite pour utiliser ce code et qu’il y ait les sauvegardes etc ?

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ---------- Constantes physiologiques ----------
const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 };

const BUILTIN_FOODS = [
  { name: "Blanc de poulet cru", kcal100: 110, protein100: 23, carbs100: 0, fat100: 1.2 },
  { name: "Blanc de poulet cuit", kcal100: 165, protein100: 31, carbs100: 0, fat100: 3.6 },
  { name: "Steak haché 5% MG", kcal100: 137, protein100: 21, carbs100: 0, fat100: 5 },
  { name: "Steak haché 15% MG", kcal100: 215, protein100: 19, carbs100: 0, fat100: 15 },
  { name: "Œuf entier", kcal100: 155, protein100: 13, carbs100: 1.1, fat100: 11 },
  { name: "Blanc d'œuf", kcal100: 52, protein100: 11, carbs100: 0.7, fat100: 0.2 },
  { name: "Saumon cru", kcal100: 208, protein100: 20, carbs100: 0, fat100: 13 },
  { name: "Thon au naturel (boîte)", kcal100: 116, protein100: 26, carbs100: 0, fat100: 1 },
  { name: "Jambon blanc", kcal100: 107, protein100: 18, carbs100: 0.5, fat100: 3.5 },
  { name: "Riz blanc cru", kcal100: 349, protein100: 7, carbs100: 78, fat100: 0.6 },
  { name: "Riz blanc cuit", kcal100: 130, protein100: 2.7, carbs100: 28, fat100: 0.3 },
  { name: "Pâtes crues", kcal100: 353, protein100: 12, carbs100: 71, fat100: 1.5 },
  { name: "Pâtes cuites", kcal100: 158, protein100: 5.8, carbs100: 31, fat100: 0.9 },
  { name: "Flocons d'avoine", kcal100: 375, protein100: 13, carbs100: 60, fat100: 7 },
  { name: "Pain de mie complet", kcal100: 246, protein100: 9, carbs100: 41, fat100: 4 },
  { name: "Pain baguette", kcal100: 274, protein100: 9, carbs100: 55, fat100: 1.4 },
  { name: "Pomme de terre cuite", kcal100: 87, protein100: 2, carbs100: 20, fat100: 0.1 },
  { name: "Patate douce cuite", kcal100: 90, protein100: 2, carbs100: 21, fat100: 0.1 },
  { name: "Lentilles cuites", kcal100: 116, protein100: 9, carbs100: 20, fat100: 0.4 },
  { name: "Haricots rouges cuits", kcal100: 127, protein100: 9, carbs100: 23, fat100: 0.5 },
  { name: "Pois chiches cuits", kcal100: 164, protein100: 9, carbs100: 27, fat100: 2.6 },
  { name: "Fromage blanc 0%", kcal100: 45, protein100: 8, carbs100: 4, fat100: 0.2 },
  { name: "Yaourt nature", kcal100: 61, protein100: 3.5, carbs100: 4.7, fat100: 3.3 },
  { name: "Skyr", kcal100: 63, protein100: 11, carbs100: 4, fat100: 0.2 },
  { name: "Lait demi-écrémé", kcal100: 46, protein100: 3.3, carbs100: 4.8, fat100: 1.6 },
  { name: "Emmental", kcal100: 380, protein100: 28, carbs100: 0, fat100: 30 },
  { name: "Whey protéine (poudre)", kcal100: 380, protein100: 75, carbs100: 8, fat100: 6 },
  { name: "Amandes", kcal100: 579, protein100: 21, carbs100: 22, fat100: 50 },
  { name: "Beurre de cacahuète", kcal100: 588, protein100: 25, carbs100: 20, fat100: 50 },
  { name: "Huile d'olive", kcal100: 884, protein100: 0, carbs100: 0, fat100: 100 },
  { name: "Avocat", kcal100: 160, protein100: 2, carbs100: 9, fat100: 15 },
  { name: "Banane", kcal100: 89, protein100: 1.1, carbs100: 23, fat100: 0.3 },
  { name: "Pomme", kcal100: 52, protein100: 0.3, carbs100: 14, fat100: 0.2 },
  { name: "Orange", kcal100: 47, protein100: 0.9, carbs100: 12, fat100: 0.1 },
  { name: "Brocoli cuit", kcal100: 35, protein100: 2.4, carbs100: 7, fat100: 0.4 },
  { name: "Courgette cuite", kcal100: 17, protein100: 1.2, carbs100: 3, fat100: 0.3 },
  { name: "Tomate", kcal100: 18, protein100: 0.9, carbs100: 3.9, fat100: 0.2 },
  { name: "Salade verte", kcal100: 15, protein100: 1.4, carbs100: 2.9, fat100: 0.2 },
  { name: "Chocolat noir 70%", kcal100: 598, protein100: 7.8, carbs100: 46, fat100: 43 },
  { name: "Miel", kcal100: 304, protein100: 0.3, carbs100: 82, fat100: 0 },
];

// Fallback sécurisé pour le stockage local (localStorage / window.storage)
const storage = {
  async get(key) {
    if (window.storage && typeof window.storage.get === "function") {
      return await window.storage.get(key, false);
    }
    const val = localStorage.getItem(key);
    return val ? { value: val } : null;
  },
  async set(key, value) {
    if (window.storage && typeof window.storage.set === "function") {
      return await window.storage.set(key, value, false);
    }
    localStorage.setItem(key, value);
  }
};

function toDateKey(d) {
  return d.toISOString().slice(0, 10);
}

function computeMifflin({ sex, age, height, weight }) {
  const a = parseFloat(age), h = parseFloat(height), w = parseFloat(weight);
  if (!a || !h || !w) return null;
  const base = 10 * w + 6.25 * h - 5 * a;
  return sex === "femme" ? base - 161 : base + 5;
}

function computeTEF(totals) {
  const pKcal = totals.protein * KCAL_PER_G.protein;
  const cKcal = totals.carbs * KCAL_PER_G.carbs;
  const fKcal = totals.fat * KCAL_PER_G.fat;
  return pKcal * 0.25 + cKcal * 0.08 + fKcal * 0.02;
}

function round(n, d = 0) {
  const f = Math.pow(10, d);
  return Math.round((n + Number.EPSILON) * f) / f;
}

const DEFAULT_PROFILE = {
  sex: "homme",
  age: "",
  height: "",
  weight: 70,
  bmrMode: "manual",
  manualBmr: 1820,
  activeCorrectionPct: 30,
};

const EMPTY_LOG = () => ({ steps: "", activeKcal: "", exerciseKcal: "", entries: [] });

export default function EnergyLedger() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [customFoods, setCustomFoods] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [log, setLog] = useState(EMPTY_LOG());
  const [tab, setTab] = useState("bilan");
  const [query, setQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFood, setNewFood] = useState({ name: "", kcal100: "", protein100: "", carbs100: "", fat100: "" });
  const [history, setHistory] = useState([]);
  const [saveError, setSaveError] = useState("");
  const dateKey = toDateKey(currentDate);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=IBM+Plex+Mono:wght@400;600&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const p = await storage.get("profile");
        if (p) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(p.value) });
      } catch (e) {}
      try {
        const cf = await storage.get("custom-foods");
        if (cf) setCustomFoods(JSON.parse(cf.value));
      } catch (e) {}
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const l = await storage.get(`log-${dateKey}`);
        const loaded = l ? JSON.parse(l.value) : EMPTY_LOG();
        setLog(loaded);
      } catch (e) {
        setLog(EMPTY_LOG());
      }
    })();
  }, [dateKey, ready]);

  const saveProfile = useCallback(async (next) => {
    setProfile(next);
    try {
      await storage.set("profile", JSON.stringify(next));
    } catch (e) { setSaveError("Échec de la sauvegarde du profil."); }
  }, []);

  const saveLog = useCallback(async (next) => {
    setLog(next);
    try {
      await storage.set(`log-${dateKey}`, JSON.stringify(next));
    } catch (e) { setSaveError("Échec de la sauvegarde du journal."); }
  }, [dateKey]);

  const saveCustomFoods = useCallback(async (next) => {
    setCustomFoods(next);
    try {
      await storage.set("custom-foods", JSON.stringify(next));
    } catch (e) { setSaveError("Échec de la sauvegarde de tes aliments."); }
  }, []);

  function addManualFood() {
    const f = {
      id: "custom-" + Date.now(),
      name: newFood.name.trim(),
      kcal100: parseFloat(newFood.kcal100) || 0,
      protein100: parseFloat(newFood.protein100) || 0,
      carbs100: parseFloat(newFood.carbs100) || 0,
      fat100: parseFloat(newFood.fat100) || 0,
    };
    if (!f.name) return;
    saveCustomFoods([...customFoods, f]);
    addEntry(f);
    setNewFood({ name: "", kcal100: "", protein100: "", carbs100: "", fat100: "" });
    setShowAddForm(false);
  }

  const localResults = useMemo(() => {
    if (query.trim().length < 1) return [];
    const q = query.toLowerCase();
    const custom = customFoods
      .filter(f => f.name.toLowerCase().includes(q))
      .map(f => ({ ...f, source: "perso" }));
    const builtin = BUILTIN_FOODS
      .filter(f => f.name.toLowerCase().includes(q))
      .map(f => ({ ...f, source: "base" }));
    return [...custom, ...builtin].slice(0, 12);
  }, [query, customFoods]);

  function addEntry(food, grams = 100) {
    const entry = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      name: food.name,
      kcal100: food.kcal100,
      protein100: food.protein100,
      carbs100: food.carbs100,
      fat100: food.fat100,
      grams,
    };
    saveLog({ ...log, entries: [...log.entries, entry] });
    setQuery("");
  }

  function updateEntryGrams(id, grams) {
    saveLog({
      ...log,
      entries: log.entries.map(e => e.id === id ? { ...e, grams: parseFloat(grams) || 0 } : e),
    });
  }

  function removeEntry(id) {
    saveLog({ ...log, entries: log.entries.filter(e => e.id !== id) });
  }

  const totals = useMemo(() => {
    return log.entries.reduce((acc, e) => {
      const factor = e.grams / 100;
      acc.kcal += e.kcal100 * factor;
      acc.protein += e.protein100 * factor;
      acc.carbs += e.carbs100 * factor;
      acc.fat += e.fat100 * factor;
      return acc;
    }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  }, [log.entries]);

  const formulaBmr = computeMifflin(profile);
  const bmr = profile.bmrMode === "formula" && formulaBmr ? formulaBmr : parseFloat(profile.manualBmr) || 0;
  const correctionFactor = 1 - (parseFloat(profile.activeCorrectionPct) || 0) / 100;
  const activeTotalRaw = parseFloat(log.activeKcal) || 0;
  const eatRaw = parseFloat(log.exerciseKcal) || 0;
  const activeTotal = activeTotalRaw * correctionFactor;
  const eat = eatRaw * correctionFactor;
  const neat = Math.max(activeTotal - eat, 0);
  const tef = computeTEF(totals);
  const depense = bmr + activeTotal + tef;
  const balance = totals.kcal - depense;

  useEffect(() => {
    if (tab !== "historique" || !ready) return;
    (async () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(toDateKey(d));
      }
      const results = [];
      for (const dk of days) {
        try {
          const l = await storage.get(`log-${dk}`);
          const parsed = l ? JSON.parse(l.value) : EMPTY_LOG();
          const t = parsed.entries.reduce((acc, e) => acc + e.kcal100 * (e.grams / 100), 0);
          const correction = 1 - (parseFloat(profile.activeCorrectionPct) || 0) / 100;
          const activeDay = (parseFloat(parsed.activeKcal) || 0) * correction;
          const tefDay = computeTEF(parsed.entries.reduce((acc, e) => {
            const f = e.grams / 100;
            acc.protein += e.protein100 * f; acc.carbs += e.carbs100 * f; acc.fat += e.fat100 * f;
            return acc;
          }, { protein: 0, carbs: 0, fat: 0 }));
          results.push({ date: dk, intake: t, expenditure: bmr + activeDay + tefDay });
        } catch (e) {
          results.push({ date: dk, intake: 0, expenditure: bmr });
        }
      }
      setHistory(results);
    })();
  }, [tab, ready, bmr, profile.activeCorrectionPct]);

  if (!ready) {
    return <div className="ledger-loading">Ouverture du registre…</div>;
  }

  const isDeficit = balance < 0;
  const balanceLabel = Math.abs(balance) < 15 ? "Équilibre" : isDeficit ? "Déficit" : "Surplus";

  return (
    <div className="ledger-root">
      <style>{`
        .ledger-root {
          --paper: #F3F1EA;
          --ink: #1F2A24;
          --muted: #6B6759;
          --line: #D8D2C2;
          --moss: #55735F;
          --moss-soft: #E4EBE2;
          --rust: #A8542F;
          --rust-soft: #F1E1D7;
          --card: #FBFAF6;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: var(--paper);
          color: var(--ink);
          min-height: 100vh;
          padding: 20px 16px 60px;
          max-width: 480px;
          margin: 0 auto;
        }
        .ledger-loading {
          padding: 40px; text-align: center; color: #6B6759; font-family: sans-serif;
        }
        .lg-h1 {
          font-family: "Fraunces", serif;
          font-size: 26px;
          font-weight: 600;
          letter-spacing: -0.01em;
          margin: 0 0 2px;
        }
        .lg-sub {
          font-size: 13px;
          color: var(--muted);
          margin: 0 0 18px;
        }
        .lg-datebar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .lg-datebtn {
          background: var(--card); border: 1px solid var(--line); border-radius: 10px;
          width: 34px; height: 34px; font-size: 16px; color: var(--ink); cursor: pointer;
        }
        .lg-date-label {
          font-family: "IBM Plex Mono", monospace; font-size: 13px; color: var(--muted);
        }
        .lg-tabs {
          display: flex; gap: 4px; margin-bottom: 18px; border-bottom: 1px solid var(--line); padding-bottom: 0;
        }
        .lg-tab {
          flex: 1; text-align: center; padding: 9px 2px; font-size: 12.5px; color: var(--muted);
          border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px;
        }
        .lg-tab.active { color: var(--ink); border-bottom: 2px solid var(--moss); font-weight: 600; }
        .lg-hero {
          background: ${isDeficit ? "var(--moss-soft)" : Math.abs(balance) < 15 ? "var(--card)" : "var(--rust-soft)"};
          border-radius: 18px; padding: 22px 20px; margin-bottom: 16px;
          border: 1px solid var(--line);
        }
        .lg-hero-label { font-size: 12.5px; color: var(--muted); margin-bottom: 4px; }
        .lg-hero-num {
          font-family: "IBM Plex Mono", monospace; font-size: 42px; font-weight: 600;
          color: ${isDeficit ? "var(--moss)" : Math.abs(balance) < 15 ? "var(--ink)" : "var(--rust)"};
          line-height: 1;
        }
        .lg-hero-tag { font-size: 13px; color: var(--muted); margin-top: 6px; }
        .lg-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 11px 0; border-bottom: 1px solid var(--line);
        }
        .lg-row:last-child { border-bottom: none; }
        .lg-row-label { font-size: 14px; color: var(--ink); }
        .lg-row-sub { font-size: 11.5px; color: var(--muted); }
        .lg-row-val { font-family: "IBM Plex Mono", monospace; font-size: 15px; }
        .lg-card {
          background: var(--card); border: 1px solid var(--line); border-radius: 14px;
          padding: 16px; margin-bottom: 16px;
        }
        .lg-card-title { font-size: 12.5px; color: var(--muted); margin-bottom: 6px; text-transform: none; }
        .lg-search {
          width: 100%; padding: 11px 12px; border-radius: 10px; border: 1px solid var(--line);
          background: var(--card); font-size: 15px; color: var(--ink); margin-bottom: 8px; box-sizing: border-box;
        }
        .lg-result {
          display: flex; justify-content: space-between; align-items: center;
          padding: 9px 0; border-bottom: 1px solid var(--line); font-size: 13.5px;
        }
        .lg-result:last-child { border-bottom: none; }
        .lg-result-name { flex: 1; padding-right: 10px; }
        .lg-result-kcal { color: var(--muted); font-family: "IBM Plex Mono", monospace; font-size: 12.5px; margin-right: 8px; white-space: nowrap; }
        .lg-btn {
          background: var(--moss); color: white; border: none; border-radius: 8px;
          padding: 6px 12px; font-size: 12.5px; cursor: pointer; white-space: nowrap;
        }
        .lg-btn.ghost { background: none; color: var(--muted); border: 1px solid var(--line); }
        .lg-btn.small { padding: 4px 9px; font-size: 11px; }
        .lg-entry {
          display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid var(--line);
        }
        .lg-entry:last-child { border-bottom: none; }
        .lg-entry-name { flex: 1; font-size: 13.5px; }
        .lg-entry-kcal { font-family: "IBM Plex Mono", monospace; font-size: 12.5px; color: var(--muted); width: 52px; text-align: right; }
        .lg-gram-input {
          width: 52px; padding: 5px 6px; border-radius: 7px; border: 1px solid var(--line);
          font-family: "IBM Plex Mono", monospace; font-size: 12.5px; text-align: right;
        }
        .lg-remove { background: none; border: none; color: var(--rust); font-size: 18px; cursor: pointer; padding: 0 2px; }
        .lg-macro-strip { display: flex; gap: 14px; margin-top: 10px; font-size: 12px; color: var(--muted); }
        .lg-field { margin-bottom: 12px; }
        .lg-field label { display: block; font-size: 12.5px; color: var(--muted); margin-bottom: 4px; }
        .lg-field input, .lg-field select {
          width: 100%; padding: 10px 11px; border-radius: 9px; border: 1px solid var(--line);
          background: var(--card); font-size: 15px; color: var(--ink); box-sizing: border-box;
        }
        .lg-toggle-row { display: flex; gap: 8px; margin-bottom: 12px; }
        .lg-toggle {
          flex: 1; padding: 9px; text-align: center; border-radius: 9px; border: 1px solid var(--line);
          font-size: 12.5px; cursor: pointer; background: var(--card); color: var(--muted);
        }
        .lg-toggle.active { background: var(--moss); color: white; border-color: var(--moss); }
        .lg-note { font-size: 12px; color: var(--muted); line-height: 1.5; margin-top: 4px; }
        .lg-bar-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; }
        .lg-bar-label { width: 44px; font-size: 11px; color: var(--muted); font-family: "IBM Plex Mono", monospace; }
        .lg-bar-track { flex: 1; height: 20px; background: var(--paper); border-radius: 6px; overflow: hidden; position: relative; border: 1px solid var(--line); }
        .lg-bar-fill { height: 100%; border-radius: 6px; }
        .lg-bar-val { width: 60px; font-size: 11px; font-family: "IBM Plex Mono", monospace; text-align: right; color: var(--muted); }
        .lg-error { color: var(--rust); font-size: 12px; margin-bottom: 10px; }
      `}</style>

      <h1 className="lg-h1">Grand livre énergétique</h1>
      <p className="lg-sub">Apports, dépense et bilan du jour, tout relié.</p>
      {saveError && <div className="lg-error">{saveError}</div>}

      <div className="lg-tabs">
        {[
          ["bilan", "Bilan"],
          ["journal", "Repas"],
          ["mouvement", "Mouvement"],
          ["profil", "Profil"],
          ["historique", "Historique"],
        ].map(([key, label]) => (
          <button key={key} className={`lg-tab ${tab === key ? "active" : ""}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {tab !== "profil" && tab !== "historique" && (
        <div className="lg-datebar">
          <button className="lg-datebtn" onClick={() => setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; })}>‹</button>
          <span className="lg-date-label">
            {currentDate.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
          </span>
          <button className="lg-datebtn" onClick={() => setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; })}>›</button>
        </div>
      )}

      {tab === "bilan" && (
        <>
          <div className="lg-hero">
            <div className="lg-hero-label">Bilan du jour</div>
            <div className="lg-hero-num">{balance >= 0 ? "+" : ""}{round(balance)}</div>
            <div className="lg-hero-tag">{balanceLabel} · {round(totals.kcal)} kcal ingérées pour {round(depense)} kcal dépensées</div>
          </div>

          <div className="lg-card">
            <div className="lg-card-title">Composition de la dépense</div>
            <div className="lg-row">
              <div><div className="lg-row-label">Métabolisme de base</div><div className="lg-row-sub">au repos, fonctions vitales</div></div>
              <div className="lg-row-val">{round(bmr)} kcal</div>
            </div>
            <div className="lg-row">
              <div><div className="lg-row-label">Activité (Watch, corrigée -{profile.activeCorrectionPct}%)</div><div className="lg-row-sub">{round(activeTotalRaw)} kcal saisies · NEAT {round(neat)} + séance {round(eat)}, sans doublon</div></div>
              <div className="lg-row-val">{round(activeTotal)} kcal</div>
            </div>
            <div className="lg-row">
              <div><div className="lg-row-label">Thermogenèse alimentaire</div><div className="lg-row-sub">digestion des repas du jour</div></div>
              <div className="lg-row-val">{round(tef)} kcal</div>
            </div>
            <div className="lg-row">
              <div><div className="lg-row-label" style={{ fontWeight: 600 }}>Total dépensé</div></div>
              <div className="lg-row-val" style={{ fontWeight: 600 }}>{round(depense)} kcal</div>
            </div>
          </div>

          <div className="lg-card">
            <div className="lg-card-title">Apports du jour</div>
            <div className="lg-row">
              <div className="lg-row-label">Calories</div>
              <div className="lg-row-val">{round(totals.kcal)} kcal</div>
            </div>
            <div className="lg-macro-strip">
              <span>Prot {round(totals.protein)}g</span>
              <span>Gluc {round(totals.carbs)}g</span>
              <span>Lip {round(totals.fat)}g</span>
            </div>
          </div>
        </>
      )}

      {tab === "journal" && (
        <>
          <div className="lg-card">
            <div className="lg-card-title">Ajouter un aliment</div>
            <input
              className="lg-search"
              placeholder="Rechercher (ex: poulet, riz, yaourt...)"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query.trim().length > 0 && localResults.length === 0 && (
              <div className="lg-note">Aucun résultat dans la base intégrée. Ajoute-le toi-même ci-dessous.</div>
            )}
            {localResults.length > 0 && (
              <div>
                {localResults.map(f => (
                  <div className="lg-result" key={f.id || f.name}>
                    <div className="lg-result-name">{f.name}{f.source === "perso" && <span className="lg-note" style={{ display: "inline" }}> · perso</span>}</div>
                    <div className="lg-result-kcal">{round(f.kcal100)} kcal/100g</div>
                    <button className="lg-btn small" onClick={() => addEntry(f)}>Ajouter</button>
                  </div>
                ))}
              </div>
            )}
            <button className="lg-btn ghost" style={{ marginTop: 10 }} onClick={() => setShowAddForm(v => !v)}>
              {showAddForm ? "Annuler" : "+ Ajouter un aliment personnel"}
            </button>
            {showAddForm && (
              <div style={{ marginTop: 12 }}>
                <div className="lg-field">
                  <label>Nom de l'aliment</label>
                  <input value={newFood.name} onChange={e => setNewFood({ ...newFood, name: e.target.value })} placeholder="ex: Galette de sarrasin" />
                </div>
                <div className="lg-field">
                  <label>Calories pour 100g</label>
                  <input type="number" value={newFood.kcal100} onChange={e => setNewFood({ ...newFood, kcal100: e.target.value })} />
                </div>
                <div className="lg-field">
                  <label>Protéines / 100g (g)</label>
                  <input type="number" value={newFood.protein100} onChange={e => setNewFood({ ...newFood, protein100: e.target.value })} />
                </div>
                <div className="lg-field">
                  <label>Glucides / 100g (g)</label>
                  <input type="number" value={newFood.carbs100} onChange={e => setNewFood({ ...newFood, carbs100: e.target.value })} />
                </div>
                <div className="lg-field">
                  <label>Lipides / 100g (g)</label>
                  <input type="number" value={newFood.fat100} onChange={e => setNewFood({ ...newFood, fat100: e.target.value })} />
                </div>
                <button className="lg-btn" onClick={addManualFood}>Enregistrer et ajouter au repas</button>
                <p className="lg-note">Il sera aussi gardé dans "perso" pour le retrouver plus vite la prochaine fois.</p>
              </div>
            )}
          </div>

          <div className="lg-card">
            <div className="lg-card-title">Repas du jour ({log.entries.length})</div>
            {log.entries.length === 0 && <div className="lg-note">Aucun aliment enregistré pour ce jour.</div>}
            {log.entries.map(e => (
              <div className="lg-entry" key={e.id}>
                <div className="lg-entry-name">{e.name}</div>
                <input
                  className="lg-gram-input"
                  type="number"
                  value={e.grams}
                  onChange={ev => updateEntryGrams(e.id, ev.target.value)}
                />
                <span className="lg-note">g</span>
                <div className="lg-entry-kcal">{round(e.kcal100 * e.grams / 100)}</div>
                <button className="lg-remove" onClick={() => removeEntry(e.id)}>×</button>
              </div>
            ))}
            {log.entries.length > 0 && (
              <div className="lg-macro-strip">
                <span>{round(totals.kcal)} kcal</span>
                <span>Prot {round(totals.protein)}g</span>
                <span>Gluc {round(totals.carbs)}g</span>
                <span>Lip {round(totals.fat)}g</span>
              </div>
            )}
          </div>
        </>
      )}

      {tab === "mouvement" && (
        <div className="lg-card">
          <div className="lg-card-title">Activité — depuis l'app Santé (cercle Mouvement)</div>
          <p className="lg-note">
            Je ne peux pas lire Apple Santé directement. Pour éviter de compter deux fois les kcal d'une séance
            (une fois via les pas, une fois via l'exercice), pars du total "Calories actives" que Santé/Watch
            calcule déjà pour toute la journée — il inclut la séance sans doublon.
          </p>
          <div className="lg-field">
            <label>Calories actives totales du jour (cercle Mouvement)</label>
            <input type="number" value={log.activeKcal} onChange={e => saveLog({ ...log, activeKcal: e.target.value })} placeholder="ex: 620" />
          </div>
          <div className="lg-field">
            <label>Dont calories de la séance (résumé de l'entraînement) — optionnel</label>
            <input type="number" value={log.exerciseKcal} onChange={e => saveLog({ ...log, exerciseKcal: e.target.value })} placeholder="ex: 350" />
            <p className="lg-note">Sert juste à afficher NEAT et séance séparément — déjà inclus dans le total ci-dessus, pas rajouté.</p>
          </div>
          <div className="lg-field">
            <label>Pas comptés aujourd'hui — indicatif, non utilisé dans le calcul</label>
            <input type="number" value={log.steps} onChange={e => saveLog({ ...log, steps: e.target.value })} placeholder="ex: 8500" />
          </div>
        </div>
      )}

      {tab === "profil" && (
        <div className="lg-card">
          <div className="lg-card-title">Profil</div>
          <div className="lg-field">
            <label>Sexe</label>
            <select value={profile.sex} onChange={e => saveProfile({ ...profile, sex: e.target.value })}>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </div>
          <div className="lg-field">
            <label>Poids (kg)</label>
            <input type="number" value={profile.weight} onChange={e => saveProfile({ ...profile, weight: e.target.value })} />
          </div>
          <div className="lg-field">
            <label>Taille (cm)</label>
            <input type="number" value={profile.height} onChange={e => saveProfile({ ...profile, height: e.target.value })} placeholder="requis pour le calcul par formule" />
          </div>
          <div className="lg-field">
            <label>Âge</label>
            <input type="number" value={profile.age} onChange={e => saveProfile({ ...profile, age: e.target.value })} placeholder="requis pour le calcul par formule" />
          </div>

          <div className="lg-toggle-row">
            <div className={`lg-toggle ${profile.bmrMode === "manual" ? "active" : ""}`} onClick={() => saveProfile({ ...profile, bmrMode: "manual" })}>BMR manuel</div>
            <div className={`lg-toggle ${profile.bmrMode === "formula" ? "active" : ""}`} onClick={() => saveProfile({ ...profile, bmrMode: "formula" })}>BMR par formule (Mifflin)</div>
          </div>
          {profile.bmrMode === "manual" ? (
            <div className="lg-field">
              <label>Métabolisme de base (kcal)</label>
              <input type="number" value={profile.manualBmr} onChange={e => saveProfile({ ...profile, manualBmr: e.target.value })} />
            </div>
          ) : (
            <p className="lg-note">
              {formulaBmr ? `Calculé : ${round(formulaBmr)} kcal` : "Renseigne poids, taille et âge pour activer le calcul par formule."}
            </p>
          )}
          <p className="lg-note">Le mode manuel est prérempli avec ta valeur habituelle (formule de Byrne, 1820 kcal) — change-la si besoin.</p>

          <div className="lg-field" style={{ marginTop: 16 }}>
            <label>Marge de correction sur les calories actives Apple (%)</label>
            <input type="number" value={profile.activeCorrectionPct} onChange={e => saveProfile({ ...profile, activeCorrectionPct: e.target.value })} />
          </div>
          <p className="lg-note">Apple tend à surestimer les calories actives, surtout à l'effort. 30% de correction est un point de départ raisonnable — ajuste selon ce que tu observes sur ton poids réel dans le temps.</p>
        </div>
      )}

      {tab === "historique" && (
        <div className="lg-card">
          <div className="lg-card-title">7 derniers jours — apport vs dépense</div>
          {history.map(h => {
            const max = Math.max(h.intake, h.expenditure, 1);
            return (
              <div key={h.date}>
                <div className="lg-bar-row">
                  <span className="lg-bar-label">{h.date.slice(5)}</span>
                  <div className="lg-bar-track">
                    <div className="lg-bar-fill" style={{ width: `${(h.intake / max) * 100}%`, background: "var(--moss)" }} />
                  </div>
                  <span className="lg-bar-val">{round(h.intake)}i</span>
                </div>
                <div className="lg-bar-row" style={{ marginTop: -6 }}>
                  <span className="lg-bar-label"></span>
                  <div className="lg-bar-track">
                    <div className="lg-bar-fill" style={{ width: `${(h.expenditure / max) * 100}%`, background: "var(--rust)" }} />
                  </div>
                  <span className="lg-bar-val">{round(h.expenditure)}d</span>
                </div>
              </div>
            );
          })}
          <p className="lg-note">i = ingéré, d = dépensé</p>
        </div>
      )}
    </div>
  );
}
