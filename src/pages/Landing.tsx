import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles, Star, BookOpen, TrendingUp, Heart, Shield, ArrowRight,
  Moon, Sun, ChevronRight, Check, Lock, Zap, Eye, Compass, Flame, Quote
} from "lucide-react";
import StarField from "@/components/StarField";
import { PageSeo } from "@/components/PageSeo";
import { Input } from "@/components/ui/input";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { getSunSign } from "@/lib/sunSign";

const features = [
  { icon: Star, title: "Tu Perfil Astral", desc: "Descubre qué dice tu fecha de nacimiento sobre tu personalidad y emociones." },
  { icon: BookOpen, title: "Diario Personal", desc: "Escribe lo que sientes cada día con preguntas que te ayudan a reflexionar." },
  { icon: TrendingUp, title: "Tu Semana", desc: "Recibe cada semana consejos sobre amor, trabajo y bienestar." },
  { icon: Heart, title: "Compatibilidad", desc: "Descubre qué tan bien conectas con otra persona según sus estrellas." },
];

const testimonials = [
  { text: "Me ayudó a entender por qué soy tan emocional. ¡Ahora sé que mis emociones son mi mayor fortaleza!", name: "Valentina R.", sign: "♋", role: "Cáncer · 28 años" },
  { text: "Los consejos semanales son sorprendentemente precisos. No puedo empezar la semana sin leerlos.", name: "Carlos M.", sign: "♌", role: "Leo · 34 años" },
  { text: "El diario me ha dado mucha claridad sobre mis patrones de comportamiento.", name: "Ana L.", sign: "♏", role: "Escorpio · 31 años" },
];

const faqs = [
  { q: "¿Es realmente gratis?", a: "Sí. Puedes crear tu cuenta, ver tu carta natal, recibir tu horóscopo diario y usar las tiradas básicas sin pagar nada. Premium es opcional para lecturas ilimitadas." },
  { q: "¿Esto es predicción o adivinación?", a: "No. Astrelle es una herramienta de autoconocimiento y reflexión. Te ayuda a interpretar simbólicamente tu energía del día, no a predecir el futuro." },
  { q: "¿Qué pasa con mis datos?", a: "Tus datos están cifrados y nunca se comparten. Tu diario es privado, solo tú lo lees. Puedes exportar o borrar tu cuenta cuando quieras." },
  { q: "¿Cuánto tiempo toma registrarme?", a: "Menos de 30 segundos. Email, fecha y lugar de nacimiento, y ya tienes tu carta natal completa lista." },
  { q: "¿Funciona en mi teléfono?", a: "Sí. Astrelle funciona perfecto en el navegador móvil y también está disponible como app nativa para iOS y Android." },
];

// ─────────────────────────────────────────────────────────
// Counter animado
// ─────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.floor(latest).toLocaleString("es-ES"));

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration: 2, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, to, count]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// Hero interactivo: fecha → signo solar + frase personalizada
// ─────────────────────────────────────────────────────────
function SignDiscovery() {
  const navigate = useNavigate();
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [revealed, setRevealed] = useState(false);

  const sign = revealed ? getSunSign(Number(month), Number(day)) : null;
  const canSubmit = day && month && year && Number(day) >= 1 && Number(day) <= 31 && Number(month) >= 1 && Number(month) <= 12 && Number(year) >= 1920 && Number(year) <= new Date().getFullYear();

  const handleReveal = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) setRevealed(true);
  };

  const handleContinue = () => {
    if (sign) {
      sessionStorage.setItem("astrelle_prefill_birth", JSON.stringify({ day, month, year }));
      navigate("/registro");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="glass-card-elevated p-6 sm:p-7 max-w-md mx-auto mt-10 border-primary/15"
    >
      {!revealed ? (
        <form onSubmit={handleReveal}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            <p className="font-display text-xs text-accent tracking-[0.25em] uppercase">Descubre Tu Signo</p>
          </div>
          <p className="text-foreground/80 text-sm font-body text-center mb-5 leading-relaxed">
            Pon tu fecha de nacimiento y conoce qué dicen las estrellas sobre ti
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Input
              type="number" placeholder="Día" value={day}
              onChange={(e) => setDay(e.target.value.slice(0, 2))}
              min={1} max={31}
              className="text-center font-body"
              aria-label="Día"
            />
            <Input
              type="number" placeholder="Mes" value={month}
              onChange={(e) => setMonth(e.target.value.slice(0, 2))}
              min={1} max={12}
              className="text-center font-body"
              aria-label="Mes"
            />
            <Input
              type="number" placeholder="Año" value={year}
              onChange={(e) => setYear(e.target.value.slice(0, 4))}
              min={1920} max={new Date().getFullYear()}
              className="text-center font-body"
              aria-label="Año"
            />
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-gold w-full flex items-center justify-center gap-2 px-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            Revelar Mi Signo
          </button>
          <p className="text-muted-foreground/60 text-[11px] font-body text-center mt-3 flex items-center justify-center gap-1">
            <Lock className="w-2.5 h-2.5" /> Tus datos están seguros. No pedimos email aún.
          </p>
        </form>
      ) : sign ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="text-6xl mb-2"
            style={{ filter: "drop-shadow(0 0 20px hsl(var(--accent) / 0.5))" }}
          >
            {sign.symbol}
          </motion.div>
          <p className="font-display text-2xl text-foreground tracking-wide mb-1">{sign.name}</p>
          <p className="text-accent/80 text-xs font-body tracking-wider uppercase mb-4">
            {sign.element} · {sign.vibe}
          </p>
          <p className="text-foreground/85 text-sm font-body leading-relaxed mb-5 italic">
            "{sign.strength}"
          </p>
          <div className="space-y-2 text-left mb-5">
            {["Tu carta natal completa", "Tu horóscopo diario personalizado", "Tiradas de Tarot y Oráculo"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-foreground/75 font-body">
                <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleContinue}
            className="btn-gold w-full flex items-center justify-center gap-2 px-6 py-3 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Ver Mi Carta Completa Gratis
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setRevealed(false); setDay(""); setMonth(""); setYear(""); }}
            className="text-muted-foreground/60 hover:text-muted-foreground text-[11px] font-body mt-3 transition-colors"
          >
            Probar otra fecha
          </button>
        </motion.div>
      ) : (
        <div className="text-center text-muted-foreground text-sm font-body py-4">
          Fecha no válida. <button className="text-accent" onClick={() => setRevealed(false)}>Intentar de nuevo</button>
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Mockups estilizados de la app
// ─────────────────────────────────────────────────────────
function AppMockups() {
  const mockups = [
    {
      label: "Dashboard",
      title: "Tu energía hoy",
      content: (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-accent/80 font-body tracking-wider uppercase">Lunes 26 Mayo</span>
            <span className="text-[10px] text-foreground/60 font-body">♋ Cáncer</span>
          </div>
          <p className="font-display text-sm text-foreground leading-tight">Día para escuchar la intuición</p>
          {[
            { label: "Amor", value: 78, color: "from-rose-400/60 to-rose-300/40" },
            { label: "Trabajo", value: 92, color: "from-accent/70 to-accent/50" },
            { label: "Energía", value: 65, color: "from-primary/70 to-primary/50" },
          ].map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-[10px] font-body text-foreground/70 mb-0.5">
                <span>{b.label}</span><span>{b.value}%</span>
              </div>
              <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${b.color} rounded-full`} style={{ width: `${b.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "Carta Natal",
      title: "Tu cielo al nacer",
      content: (
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border border-accent/40" />
            <div className="absolute inset-2 rounded-full border border-accent/25" />
            <div className="absolute inset-4 rounded-full border border-accent/15" />
            {["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"].map((s, i) => {
              const angle = (i * 30 - 90) * Math.PI / 180;
              const x = 50 + 44 * Math.cos(angle);
              const y = 50 + 44 * Math.sin(angle);
              return (
                <span
                  key={s}
                  className="absolute text-[10px] text-accent/80"
                  style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                >
                  {s}
                </span>
              );
            })}
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" style={{ filter: "drop-shadow(0 0 8px hsl(var(--accent)))" }} />
            </div>
          </div>
          <p className="text-[10px] text-foreground/60 font-body mt-2 text-center">Sol ♋ · Luna ♓ · Asc ♌</p>
        </div>
      ),
    },
    {
      label: "Tirada Mística",
      title: "Lo que el día revela",
      content: (
        <div className="flex justify-center gap-1.5 py-3">
          {["☉","☽","✦"].map((sym, i) => (
            <motion.div
              key={i}
              initial={{ rotateY: 180, opacity: 0 }}
              whileInView={{ rotateY: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="w-12 h-18 rounded-md border border-accent/40 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center"
              style={{ aspectRatio: "2/3" }}
            >
              <span className="text-accent text-lg">{sym}</span>
            </motion.div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="px-4 pb-24 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="section-label mb-3">Cómo Funciona</p>
        <h2 className="font-display text-2xl sm:text-3xl text-foreground tracking-wide">
          Tu mundo astral en 3 pasos
        </h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {mockups.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="relative"
          >
            <div className="absolute -top-3 left-5 z-10 pill-tag pill-tag-accent">
              <span className="font-body text-[10px]">0{i + 1}</span>
              {m.label}
            </div>
            <div className="glass-card-elevated p-5 pt-7 h-full border-accent/10">
              <p className="font-display text-sm text-foreground/90 tracking-wider mb-3">{m.title}</p>
              {m.content}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Prueba social
// ─────────────────────────────────────────────────────────
function SocialProof() {
  const stats = [
    { value: 48230, suffix: "+", label: "Cartas natales creadas" },
    { value: 4.9, label: "Valoración media", isDecimal: true },
    { value: 96, suffix: "%", label: "Usuarios recomiendan" },
  ];

  return (
    <div className="px-4 pb-20 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card p-7 sm:p-8 border-accent/10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-7">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl sm:text-4xl text-accent tracking-wide mb-1" style={{ filter: "drop-shadow(0 0 18px hsl(var(--accent) / 0.4))" }}>
                {s.isDecimal ? s.value.toFixed(1) : <Counter to={s.value} suffix={s.suffix || ""} />}
              </div>
              <p className="text-muted-foreground text-xs font-body uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-5 border-t border-foreground/5">
          <div className="flex -space-x-2">
            {["♈","♋","♌","♏","♓"].map((s, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 border border-background flex items-center justify-center text-sm"
              >
                {s}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
            ))}
            <span className="text-foreground/70 text-xs font-body ml-1">
              <Counter to={12483} /> personas usaron Astrelle hoy
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────
function FAQ() {
  return (
    <div className="px-4 pb-24 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <p className="section-label mb-3">Preguntas Frecuentes</p>
        <h2 className="font-display text-2xl sm:text-3xl text-foreground tracking-wide">
          Resolvemos tus dudas
        </h2>
      </motion.div>
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((f, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="glass-card border-none px-5 data-[state=open]:border-accent/20"
          >
            <AccordionTrigger className="font-display text-sm text-foreground/90 tracking-wide hover:no-underline py-4">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm font-body leading-relaxed pb-4">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Sticky CTA (mobile)
// ─────────────────────────────────────────────────────────
function StickyCta() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ y: visible ? 0 : 100, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-3 left-3 right-3 z-50 sm:hidden pointer-events-none"
    >
      <div className="glass-card-elevated p-2 flex items-center gap-2 pointer-events-auto border-accent/30 shadow-2xl">
        <div className="flex-1 px-2">
          <p className="font-display text-xs text-foreground tracking-wide leading-tight">Tu carta natal</p>
          <p className="text-[10px] text-muted-foreground font-body">100% gratis · 30 segundos</p>
        </div>
        <Link to="/registro" className="btn-gold flex items-center gap-1 px-4 py-2.5 text-xs whitespace-nowrap">
          Empezar
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Landing principal
// ─────────────────────────────────────────────────────────
const Landing = () => {
  return (
    <div className="min-h-screen relative">
      <PageSeo
        title="Astrelle — Descubre tu carta natal gratis en 30 segundos"
        description="Tu carta natal, horóscopo diario y tiradas místicas con IA. En lenguaje cotidiano, sin tecnicismos. Empieza gratis."
        path="/"
      />
      <StarField />
      <div className="relative z-10">
        {/* Hero */}
        <div className="px-4 pt-20 pb-16 sm:pt-28 sm:pb-20 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="pill-tag pill-tag-accent mb-8">
                <Sparkles className="w-3 h-3" />
                Más de 48.000 cartas natales creadas
              </div>

              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold tracking-wide bg-clip-text text-transparent mb-5" style={{ backgroundImage: "var(--gradient-title)" }}>
                <span aria-hidden="true">ASTRELLE</span>
                <span className="sr-only">Astrelle — Descubre qué dicen las estrellas sobre ti</span>
              </h1>

              <p className="text-foreground/80 text-lg sm:text-2xl font-display tracking-wide max-w-2xl mx-auto mb-4 leading-snug">
                Descubre qué dicen las estrellas sobre ti
              </p>
              <p className="text-muted-foreground text-sm sm:text-base font-body max-w-xl mx-auto mb-2 leading-relaxed">
                Tu carta natal, horóscopo diario y tiradas místicas — todo en lenguaje cotidiano, sin tecnicismos.
              </p>

              <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground/80 font-body mt-4">
                <span className="flex items-center gap-1"><Check className="w-3 h-3 text-accent" /> Gratis</span>
                <span className="flex items-center gap-1"><Check className="w-3 h-3 text-accent" /> Sin tarjeta</span>
                <span className="flex items-center gap-1"><Check className="w-3 h-3 text-accent" /> 30 segundos</span>
              </div>
            </motion.div>

            {/* Mini-formulario interactivo */}
            <SignDiscovery />

            <Link
              to="/login"
              className="text-muted-foreground/70 hover:text-foreground text-xs font-body mt-5 transition-colors"
            >
              Ya tengo cuenta · Iniciar sesión
            </Link>
          </div>
        </div>

        {/* Mockups */}
        <AppMockups />

        {/* Prueba social */}
        <SocialProof />

        {/* Features */}
        <div className="px-4 pb-24 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="section-label mb-3">Herramientas</p>
            <h2 className="font-display text-2xl sm:text-3xl text-foreground tracking-wide">Todo lo que necesitas</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5 group"
              >
                <div className="flex items-start gap-4">
                  <div className="feature-icon rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <feat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm text-foreground tracking-wider mb-1">{feat.title}</h3>
                    <p className="text-muted-foreground font-body text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="px-4 pb-24 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="section-label mb-3">Testimonios</p>
            <h2 className="font-display text-2xl sm:text-3xl text-foreground tracking-wide">Personas reales, historias reales</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5 relative"
              >
                <Quote className="w-6 h-6 text-accent/30 mb-2" />
                <p className="text-foreground/85 font-body text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2 pt-3 border-t border-foreground/5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center text-lg">
                    {t.sign}
                  </div>
                  <div>
                    <p className="text-foreground/90 text-xs font-body font-medium">{t.name}</p>
                    <p className="text-muted-foreground text-[10px] font-body">{t.role}</p>
                  </div>
                  <div className="flex ml-auto gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-2.5 h-2.5 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <FAQ />

        {/* CTA final */}
        <div className="px-4 pb-24 max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card-elevated p-8 sm:p-10 border-primary/10"
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <Shield className="w-5 h-5 text-primary" />
              <Sun className="w-4 h-4 text-primary/50" />
              <Moon className="w-4 h-4 text-primary/50" />
            </div>
            <h3 className="font-display text-xl text-foreground tracking-wide mb-3">Empieza tu viaje hoy</h3>
            <p className="text-muted-foreground text-sm font-body mb-8 leading-relaxed">
              Únete a miles de personas que ya descubrieron su mapa estelar. Gratis, sin tarjeta, sin compromisos.
            </p>
            <Link to="/registro" className="btn-gold inline-flex items-center gap-2 px-8 py-4">
              <Sparkles className="w-4 h-4" />
              Crear Mi Cuenta Gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-muted-foreground/50 text-[11px] font-body mt-4 flex items-center justify-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Tus datos cifrados y privados
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-24 sm:pb-8 text-center space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link to="/terminos" className="text-muted-foreground/40 hover:text-muted-foreground/70 text-[11px] font-body transition-colors">Términos</Link>
            <Link to="/privacidad" className="text-muted-foreground/40 hover:text-muted-foreground/70 text-[11px] font-body transition-colors">Privacidad</Link>
            <Link to="/cookies" className="text-muted-foreground/40 hover:text-muted-foreground/70 text-[11px] font-body transition-colors">Cookies</Link>
            <Link to="/descargo" className="text-muted-foreground/40 hover:text-muted-foreground/70 text-[11px] font-body transition-colors">Descargo</Link>
            <Link to="/reembolso" className="text-muted-foreground/40 hover:text-muted-foreground/70 text-[11px] font-body transition-colors">Reembolso</Link>
          </div>
          <p className="text-muted-foreground/30 text-[11px] font-body">© 2026 <a href="https://elfawa-ai-technologies.com" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground/70 transition-colors">Elfawa AI Technologies</a> · Todos los derechos reservados</p>
        </div>

        <StickyCta />
      </div>
    </div>
  );
};

export default Landing;
