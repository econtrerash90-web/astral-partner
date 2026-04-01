import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Star, BookOpen, TrendingUp, Heart, Shield, ArrowRight, Moon, Sun, ChevronRight } from "lucide-react";
import StarField from "@/components/StarField";

const features = [
  { icon: Star, title: "Tu Perfil Astral", desc: "Descubre qué dice tu fecha de nacimiento sobre tu personalidad y emociones.", color: "feature-icon", textColor: "text-primary" },
  { icon: BookOpen, title: "Diario Personal", desc: "Escribe lo que sientes cada día con preguntas que te ayudan a reflexionar.", color: "feature-icon-accent", textColor: "text-accent" },
  { icon: TrendingUp, title: "Tu Semana", desc: "Recibe cada semana consejos sobre amor, trabajo y bienestar.", color: "feature-icon-nebula", textColor: "text-nebula" },
  { icon: Heart, title: "Compatibilidad", desc: "Descubre qué tan bien conectas con otra persona según sus estrellas.", color: "feature-icon", textColor: "text-primary" },
];

const testimonials = [
  { text: "Me ayudó a entender por qué soy tan emocional. ¡Ahora sé que mis emociones son mi mayor fortaleza!", name: "Valentina R.", sign: "♋" },
  { text: "Los consejos semanales son sorprendentemente precisos. No puedo empezar la semana sin leerlos.", name: "Carlos M.", sign: "♌" },
  { text: "El diario me ha dado mucha claridad sobre mis patrones de comportamiento.", name: "Ana L.", sign: "♏" },
];

const Landing = () => {
  return (
    <div className="min-h-screen relative">
      <StarField />
      <div className="relative z-10">
        {/* Hero */}
        <div className="px-4 pt-24 pb-20 sm:pt-32 sm:pb-28 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="pill-tag pill-tag-accent mb-8">
                <Sparkles className="w-3 h-3" />
                Potenciado por inteligencia artificial
              </div>

              <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-bold tracking-wide bg-clip-text text-transparent mb-6" style={{ backgroundImage: "var(--gradient-title)" }}>
                ASTRELLE
              </h1>

              <p className="text-foreground/60 text-lg sm:text-xl font-body font-light max-w-xl mx-auto mb-10 leading-relaxed">
                Tu guía personal basada en las estrellas. Conoce más sobre ti, recibe consejos semanales y explora tu energía.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                <Link to="/registro" className="btn-gold flex items-center gap-2 px-8 py-4 text-base">
                  <Sparkles className="w-4 h-4" />
                  Comenzar Gratis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="btn-glass px-8 py-4"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

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
                className="glass-card p-5 group cursor-default"
              >
                <div className="flex items-start gap-4">
                  <div className={`${feat.color} rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                    <feat.icon className={`w-5 h-5 ${feat.textColor}`} />
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
        <div className="px-4 pb-24 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="section-label mb-3">Testimonios</p>
            <h2 className="font-display text-2xl sm:text-3xl text-foreground tracking-wide">Lo que dicen nuestros usuarios</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5"
              >
                <p className="text-foreground/80 font-body text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{t.sign}</span>
                  <span className="text-muted-foreground font-body text-sm">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
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
            <h3 className="font-display text-xl text-foreground tracking-wide mb-3">Tu información está segura</h3>
            <p className="text-muted-foreground text-sm font-body mb-8 leading-relaxed">
              Protegemos tus datos con la mejor tecnología. Lo que escribes aquí es solo tuyo.
            </p>
            <Link to="/registro" className="btn-gold inline-flex items-center gap-2 px-8 py-4">
              <Sparkles className="w-4 h-4" />
              Crear Mi Cuenta
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-8 text-center space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link to="/terminos" className="text-muted-foreground/40 hover:text-muted-foreground/70 text-[11px] font-body transition-colors">Términos</Link>
            <Link to="/privacidad" className="text-muted-foreground/40 hover:text-muted-foreground/70 text-[11px] font-body transition-colors">Privacidad</Link>
            <Link to="/cookies" className="text-muted-foreground/40 hover:text-muted-foreground/70 text-[11px] font-body transition-colors">Cookies</Link>
            <Link to="/descargo" className="text-muted-foreground/40 hover:text-muted-foreground/70 text-[11px] font-body transition-colors">Descargo</Link>
            <Link to="/reembolso" className="text-muted-foreground/40 hover:text-muted-foreground/70 text-[11px] font-body transition-colors">Reembolso</Link>
          </div>
          <p className="text-muted-foreground/30 text-[11px] font-body">© 2026 Astrelle · Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
