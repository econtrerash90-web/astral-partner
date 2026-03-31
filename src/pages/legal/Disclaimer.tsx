import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import StarField from "@/components/StarField";

const Disclaimer = () => (
  <div className="min-h-screen relative">
    <StarField />
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide mb-2">Descargo de Responsabilidad</h1>
      <p className="text-muted-foreground text-sm mb-10">Última actualización: 30 de marzo de 2026</p>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-foreground/80 font-body leading-relaxed">
        <div className="glass-card p-6 border-accent/30 flex gap-4 items-start">
          <AlertTriangle className="w-6 h-6 text-accent shrink-0 mt-0.5" />
          <p className="text-foreground/90 m-0"><strong>Importante:</strong> Astrelle es una plataforma de entretenimiento. Todo el contenido astrológico es generado por inteligencia artificial y no debe utilizarse como sustituto de asesoramiento profesional.</p>
        </div>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">1. Naturaleza del Contenido</h2>
          <p>Las lecturas astrológicas, cartas astrales, lecturas de tarot, mensajes angélicos, oráculos y predicciones proporcionadas por Astrelle son generadas mediante algoritmos de IA y cálculos astronómicos. Estos contenidos:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Son de carácter <strong>informativo y recreativo</strong>.</li>
            <li>No tienen base científica comprobada.</li>
            <li>No sustituyen el consejo de profesionales de la salud, psicología, finanzas o cualquier otra área.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">2. No es Asesoría Profesional</h2>
          <p>Astrelle <strong>NO proporciona</strong>:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Diagnósticos médicos o psicológicos.</li>
            <li>Asesoramiento financiero o de inversión.</li>
            <li>Consejo legal.</li>
            <li>Terapia o tratamiento de salud mental.</li>
          </ul>
          <p>Si necesitas ayuda profesional en cualquiera de estas áreas, consulta con un especialista calificado.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">3. Contenido Generado por IA</h2>
          <p>Los análisis y predicciones son generados por modelos de inteligencia artificial. Aunque nos esforzamos por ofrecer contenido de calidad, la IA puede producir resultados imprecisos, genéricos o que no reflejen tu situación real.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">4. Responsabilidad del Usuario</h2>
          <p>Al utilizar Astrelle, reconoces y aceptas que:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Las decisiones que tomes basándote en el contenido son de tu exclusiva responsabilidad.</li>
            <li>El contenido astrológico es una herramienta de autoconocimiento y reflexión, no una guía definitiva.</li>
            <li>Los resultados pueden variar y no garantizamos precisión o veracidad.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">5. Bienestar Emocional</h2>
          <p>Si experimentas angustia emocional, ansiedad o cualquier malestar relacionado con el contenido proporcionado, te recomendamos dejar de usar la Aplicación y buscar apoyo profesional. Astrelle no es un sustituto de la atención en salud mental.</p>
        </section>
      </div>
    </div>
  </div>
);

export default Disclaimer;
