import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Save, Trash2, ChevronDown, ChevronUp, Sparkles, Star, CheckCircle, Calendar as CalendarIcon, BarChart3, Tag, SmilePlus } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import StarField from "@/components/StarField";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatAIText } from "@/lib/format-ai-text";
import { Badge } from "@/components/ui/badge";

interface ChartData {
  sun_sign_name: string;
  moon_sign: string;
  ascendant: string;
}

interface JournalEntry {
  id: string;
  prompt: string;
  content: string;
  word_count: number;
  mood_analysis: string | null;
  mood: string | null;
  tags: string[] | null;
  created_at: string;
}

const MOOD_OPTIONS = [
  { emoji: "✨", label: "Inspirada", value: "inspirada" },
  { emoji: "😊", label: "Feliz", value: "feliz" },
  { emoji: "😌", label: "En paz", value: "en_paz" },
  { emoji: "🤔", label: "Reflexiva", value: "reflexiva" },
  { emoji: "😔", label: "Melancólica", value: "melancolica" },
  { emoji: "😤", label: "Frustrada", value: "frustrada" },
  { emoji: "🌀", label: "Confusa", value: "confusa" },
  { emoji: "💪", label: "Motivada", value: "motivada" },
];

type TabView = "write" | "calendar" | "stats";

const Journal = () => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [entryText, setEntryText] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [activeTab, setActiveTab] = useState<TabView>("write");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [chartRes, entriesRes] = await Promise.all([
        supabase.from("astral_charts").select("sun_sign_name, moon_sign, ascendant").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("journal_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
      ]);
      if (chartRes.data) setChartData(chartRes.data);
      if (entriesRes.data) setEntries(entriesRes.data as JournalEntry[]);
      setLoading(false);
    };
    load();
  }, [user]);

  const generatePrompts = useCallback(async (data: ChartData) => {
    setIsLoadingPrompts(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      if (supabaseUrl && supabaseKey) {
        const resp = await fetch(`${supabaseUrl}/functions/v1/astral-journal`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseKey}` },
          body: JSON.stringify({ type: "prompts", sunSign: data.sun_sign_name, moonSign: data.moon_sign, ascendant: data.ascendant }),
        });
        if (resp.ok) {
          const json = await resp.json();
          if (json.prompts?.length) { setPrompts(json.prompts); setIsLoadingPrompts(false); return; }
        }
      }
    } catch { /* fallback */ }
    setPrompts([
      `¿Cómo está resonando la energía de tu Sol en ${data.sun_sign_name} esta semana?`,
      `Con tu Luna en ${data.moon_sign}, reflexiona sobre tus emociones hoy.`,
      `Tu Ascendente en ${data.ascendant} habla de cómo te presentas al mundo. ¿Estás siendo fiel a esa imagen?`,
    ]);
    setIsLoadingPrompts(false);
  }, []);

  useEffect(() => {
    if (chartData && prompts.length === 0) generatePrompts(chartData);
  }, [chartData, prompts.length, generatePrompts]);

  const wordCount = entryText.trim().split(/\s+/).filter(Boolean).length;

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !selectedTags.includes(tag) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setSelectedTags(selectedTags.filter(t => t !== tag));

  const saveEntry = async () => {
    if (!entryText.trim() || !user || !chartData) return;
    setIsSaving(true);

    let moodAnalysis: string | null = null;
    let aiTags: string[] = [];
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      if (supabaseUrl && supabaseKey) {
        const resp = await fetch(`${supabaseUrl}/functions/v1/astral-journal`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseKey}` },
          body: JSON.stringify({ type: "mood", entryText, sunSign: chartData.sun_sign_name }),
        });
        if (resp.ok) {
          const json = await resp.json();
          if (json.structured) {
            moodAnalysis = `${json.mood}\n\n${json.insight}\n\n✨ ${json.affirmation}`;
            aiTags = json.suggested_tags || [];
          } else {
            moodAnalysis = json.analysis;
          }
        }
      }
    } catch { /* skip */ }

    const allTags = [...new Set([...selectedTags, ...aiTags])];

    const { data, error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      prompt: prompts[currentPromptIndex] || "",
      content: entryText,
      word_count: wordCount,
      mood_analysis: moodAnalysis,
      mood: selectedMood,
      tags: allTags,
    } as any).select().single();

    if (error) { toast.error("Error al guardar"); setIsSaving(false); return; }
    setEntries([data as JournalEntry, ...entries]);
    setEntryText("");
    setSelectedMood(null);
    setSelectedTags([]);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
    setIsSaving(false);
    toast.success("Entrada guardada ✨");
  };

  const deleteEntry = async (id: string) => {
    await supabase.from("journal_entries").delete().eq("id", id);
    setEntries(entries.filter((e) => e.id !== id));
    toast.success("Entrada eliminada");
  };

  // Calendar data
  const calendarDays = useMemo(() => {
    const start = startOfMonth(calendarMonth);
    const end = endOfMonth(calendarMonth);
    return eachDayOfInterval({ start, end });
  }, [calendarMonth]);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    entries.forEach(e => {
      const key = format(parseISO(e.created_at), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [entries]);

  // Stats
  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const totalWords = entries.reduce((sum, e) => sum + e.word_count, 0);
    const moodCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    entries.forEach(e => {
      if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      (e.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
    });
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = format(d, "yyyy-MM-dd");
      if (entriesByDay.has(key)) streak++;
      else break;
    }

    return { totalEntries, totalWords, topMood, topTags, streak };
  }, [entries, entriesByDay]);

  if (loading) return <div className="min-h-screen relative"><StarField /></div>;

  if (!chartData) {
    return (
      <div className="min-h-screen relative">
        <StarField />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center glass-card p-8 max-w-md">
            <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="font-display text-xl text-foreground mb-2">Primero genera tu carta astral</h2>
            <p className="text-muted-foreground font-body text-sm mb-6">Necesitas tu carta astral para desbloquear el diario personalizado</p>
            <Link to="/" className="btn-gold inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> Ir a Carta Astral</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <StarField />
      <div className="relative z-10 px-4 py-8 sm:py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide bg-clip-text text-transparent mb-2" style={{ backgroundImage: "var(--gradient-title)" }}>
            Mi Diario Astral
          </h1>
          <p className="text-muted-foreground font-body text-sm">Reflexiones guiadas por las estrellas</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-1 mb-6">
          {([
            { key: "write" as TabView, icon: BookOpen, label: "Escribir" },
            { key: "calendar" as TabView, icon: CalendarIcon, label: "Calendario" },
            { key: "stats" as TabView, icon: BarChart3, label: "Estadísticas" },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-body font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* WRITE TAB */}
          {activeTab === "write" && (
            <motion.div key="write" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {/* Prompt */}
              <div className="glass-card p-5 sm:p-6 mb-5" style={{ background: "var(--gradient-prediction)" }}>
                <p className="text-primary font-body text-xs uppercase tracking-wider font-medium mb-2">✨ Prompt del Día</p>
                {isLoadingPrompts ? (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                      <Sparkles className="w-4 h-4 text-primary" />
                    </motion.div>
                    <span className="font-body text-sm">Consultando las estrellas...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-foreground/90 text-base font-body leading-relaxed italic">{prompts[currentPromptIndex]}</p>
                    {prompts.length > 1 && (
                      <button onClick={() => setCurrentPromptIndex(i => (i + 1) % prompts.length)} className="mt-3 text-primary/70 hover:text-primary text-xs font-body font-medium transition-colors">
                        Siguiente prompt →
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Mood Selector */}
              <div className="glass-card p-4 mb-5">
                <p className="text-muted-foreground font-body text-xs uppercase tracking-wider font-medium mb-3 flex items-center gap-1.5">
                  <SmilePlus className="w-3.5 h-3.5" /> ¿Cómo te sientes?
                </p>
                <div className="flex flex-wrap gap-2">
                  {MOOD_OPTIONS.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setSelectedMood(selectedMood === m.value ? null : m.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body transition-all ${
                        selectedMood === m.value
                          ? "bg-primary/20 text-primary border border-primary/40 scale-105"
                          : "bg-muted/30 text-muted-foreground border border-border/50 hover:border-primary/30"
                      }`}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Writing area */}
              <div className="glass-card p-5 sm:p-6 mb-5">
                <textarea
                  value={entryText}
                  onChange={e => setEntryText(e.target.value)}
                  placeholder="Escribe tus reflexiones aquí..."
                  className="w-full min-h-[200px] bg-transparent border border-border rounded-xl p-4 text-foreground font-body text-base leading-relaxed resize-y outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
                />

                {/* Tags input */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground/50" />
                  {selectedTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/20" onClick={() => removeTag(tag)}>
                      #{tag} ×
                    </Badge>
                  ))}
                  {selectedTags.length < 5 && (
                    <input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      placeholder="Agregar tag..."
                      className="bg-transparent border-none outline-none text-xs font-body text-muted-foreground placeholder:text-muted-foreground/30 w-24"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-muted-foreground text-xs font-body">{wordCount} palabras</span>
                  <button onClick={saveEntry} disabled={!entryText.trim() || isSaving} className="btn-gold flex items-center gap-2 py-2.5 px-5 text-xs">
                    <AnimatePresence mode="wait">
                      {showSaved ? (
                        <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <CheckCircle className="w-3.5 h-3.5" />
                        </motion.div>
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                    </AnimatePresence>
                    {isSaving ? "Analizando..." : showSaved ? "¡Guardado!" : "Guardar"}
                  </button>
                </div>
              </div>

              {/* Entry History */}
              {entries.length > 0 && (
                <div>
                  <h3 className="font-display text-lg text-foreground tracking-wide mb-4">Entradas Anteriores</h3>
                  <div className="space-y-2">
                    {entries.map(entry => (
                      <EntryCard key={entry.id} entry={entry} expanded={expandedEntry === entry.id} onToggle={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)} onDelete={deleteEntry} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === "calendar" && (
            <motion.div key="calendar" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="glass-card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} className="text-muted-foreground hover:text-foreground transition-colors text-sm">←</button>
                  <h3 className="font-display text-lg text-foreground capitalize">{format(calendarMonth, "MMMM yyyy", { locale: es })}</h3>
                  <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} className="text-muted-foreground hover:text-foreground transition-colors text-sm">→</button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {["L", "M", "X", "J", "V", "S", "D"].map(d => (
                    <div key={d} className="text-center text-muted-foreground/50 text-xs font-body py-1">{d}</div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for first day offset */}
                  {Array.from({ length: (calendarDays[0].getDay() + 6) % 7 }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {calendarDays.map(day => {
                    const key = format(day, "yyyy-MM-dd");
                    const dayEntries = entriesByDay.get(key);
                    const hasEntries = !!dayEntries?.length;
                    const isToday = isSameDay(day, new Date());
                    const moodEmoji = dayEntries?.[0]?.mood ? MOOD_OPTIONS.find(m => m.value === dayEntries[0].mood)?.emoji : null;

                    return (
                      <button
                        key={key}
                        onClick={() => {
                          if (hasEntries) {
                            setActiveTab("write");
                            setExpandedEntry(dayEntries![0].id);
                          }
                        }}
                        className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-body transition-all ${
                          isToday ? "ring-1 ring-primary/50" : ""
                        } ${hasEntries ? "bg-primary/15 text-primary hover:bg-primary/25" : "text-muted-foreground/50 hover:bg-muted/30"}`}
                      >
                        <span>{day.getDate()}</span>
                        {moodEmoji && <span className="text-[10px] mt-0.5">{moodEmoji}</span>}
                        {hasEntries && !moodEmoji && <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STATS TAB */}
          {activeTab === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              {/* Overview */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Entradas", value: stats.totalEntries, icon: "📝" },
                  { label: "Palabras", value: stats.totalWords.toLocaleString(), icon: "✍️" },
                  { label: "Racha", value: `${stats.streak} días`, icon: "🔥" },
                  { label: "Mood Top", value: stats.topMood ? MOOD_OPTIONS.find(m => m.value === stats.topMood[0])?.label || stats.topMood[0] : "—", icon: stats.topMood ? MOOD_OPTIONS.find(m => m.value === stats.topMood[0])?.emoji || "🎭" : "🎭" },
                ].map(s => (
                  <div key={s.label} className="glass-card p-4 text-center">
                    <span className="text-2xl">{s.icon}</span>
                    <p className="text-foreground font-display text-lg mt-1">{s.value}</p>
                    <p className="text-muted-foreground text-xs font-body">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Mood Distribution */}
              {entries.some(e => e.mood) && (
                <div className="glass-card p-5">
                  <h3 className="font-display text-sm text-foreground tracking-wide mb-3">Distribución Emocional</h3>
                  <div className="space-y-2">
                    {MOOD_OPTIONS.map(m => {
                      const count = entries.filter(e => e.mood === m.value).length;
                      if (!count) return null;
                      const pct = Math.round((count / entries.filter(e => e.mood).length) * 100);
                      return (
                        <div key={m.value} className="flex items-center gap-2">
                          <span className="text-sm w-6">{m.emoji}</span>
                          <span className="text-xs font-body text-muted-foreground w-20">{m.label}</span>
                          <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full bg-primary/60" />
                          </div>
                          <span className="text-xs font-body text-muted-foreground w-8 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top Tags */}
              {stats.topTags.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="font-display text-sm text-foreground tracking-wide mb-3">Tags Frecuentes</h3>
                  <div className="flex flex-wrap gap-2">
                    {stats.topTags.map(([tag, count]) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag} <span className="ml-1 text-muted-foreground">({count})</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-muted-foreground/40 text-xs mt-8 font-body">Tu diario está guardado de forma segura en la nube.</p>
      </div>
    </div>
  );
};

// Entry card component
const EntryCard = ({ entry, expanded, onToggle, onDelete }: { entry: JournalEntry; expanded: boolean; onToggle: () => void; onDelete: (id: string) => void }) => {
  const moodInfo = MOOD_OPTIONS.find(m => m.value === entry.mood);
  return (
    <div className="glass-card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors">
        <div className="flex items-center gap-2 flex-wrap">
          {moodInfo && <span className="text-sm">{moodInfo.emoji}</span>}
          <BookOpen className="w-3.5 h-3.5 text-primary/50" />
          <span className="text-foreground font-body text-sm">{new Date(entry.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</span>
          <span className="text-muted-foreground text-xs font-body">{entry.word_count}p</span>
          {entry.mood_analysis && <span className="text-xs text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">IA</span>}
          {(entry.tags || []).slice(0, 2).map(t => (
            <Badge key={t} variant="secondary" className="text-[10px] py-0 px-1.5">#{t}</Badge>
          ))}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3">
              {entry.prompt && <p className="text-muted-foreground text-sm font-body italic">"{entry.prompt}"</p>}
              <p className="text-foreground/90 font-body text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
              {(entry.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(entry.tags || []).map(t => <Badge key={t} variant="outline" className="text-[10px]">#{t}</Badge>)}
                </div>
              )}
              {entry.mood_analysis && (
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/15">
                  <p className="text-accent text-xs font-body font-medium uppercase tracking-wider mb-1">Análisis Emocional</p>
                  <div className="text-foreground/80 text-sm font-body">{formatAIText(entry.mood_analysis)}</div>
                </div>
              )}
              <button
                onClick={() => { if (confirm("¿Eliminar esta entrada?")) onDelete(entry.id); }}
                className="flex items-center gap-1.5 text-destructive/50 hover:text-destructive text-xs font-body transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Eliminar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Journal;
