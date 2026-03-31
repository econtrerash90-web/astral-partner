import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import StarField from "@/components/StarField";

const Terms = () => (
  <div className="min-h-screen relative">
    <StarField />
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide mb-2">Términos y Condiciones</h1>
      <p className="text-muted-foreground text-sm mb-10">Última actualización: 30 de marzo de 2026</p>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-foreground/80 font-body leading-relaxed">
        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">1. Aceptación de los Términos</h2>
          <p>Al acceder y utilizar Astrelle ("la Aplicación"), operada por Elfawa ("nosotros"), aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo, debes abstenerte de usar la Aplicación.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">2. Descripción del Servicio</h2>
          <p>Astrelle es una plataforma de entretenimiento que ofrece contenido astrológico generado por inteligencia artificial, incluyendo cartas astrales, lecturas de tarot, oráculos, predicciones semanales y funcionalidades relacionadas.</p>
          <p><strong>El contenido proporcionado es exclusivamente con fines de entretenimiento y autoconocimiento.</strong> No constituye asesoría profesional de ningún tipo (médica, psicológica, financiera o legal).</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">3. Registro y Cuenta</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Debes ser mayor de 13 años para crear una cuenta.</li>
            <li>Eres responsable de mantener la confidencialidad de tus credenciales.</li>
            <li>La información proporcionada debe ser veraz y actualizada.</li>
            <li>Nos reservamos el derecho de suspender cuentas que violen estos términos.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">4. Propiedad Intelectual</h2>
          <p>Todo el contenido de la Aplicación (diseño, textos, gráficos, logotipos, código fuente y análisis generados por IA) es propiedad de Elfawa o sus licenciantes. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">5. Uso Aceptable</h2>
          <p>Te comprometes a no:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Usar la Aplicación para fines ilegales o no autorizados.</li>
            <li>Intentar acceder a sistemas, datos o cuentas de otros usuarios.</li>
            <li>Redistribuir, vender o comercializar el contenido generado.</li>
            <li>Usar bots, scrapers o herramientas automatizadas para extraer datos.</li>
            <li>Suplantar la identidad de otro usuario o persona.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">6. Suscripciones y Pagos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Astrelle ofrece un plan gratuito con funcionalidades limitadas y planes premium de pago.</li>
            <li>Los pagos se procesan a través de proveedores externos seguros (Stripe).</li>
            <li>Las suscripciones se renuevan automáticamente salvo cancelación previa.</li>
            <li>Los precios pueden cambiar con aviso previo de 30 días.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">7. Limitación de Responsabilidad</h2>
          <p>Astrelle se proporciona "tal cual" sin garantías de ningún tipo. No nos hacemos responsables de:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Decisiones tomadas basándose en el contenido astrológico.</li>
            <li>Interrupciones temporales del servicio.</li>
            <li>Pérdida de datos por causas fuera de nuestro control.</li>
            <li>Daños indirectos o consecuentes derivados del uso de la Aplicación.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">8. Modificaciones</h2>
          <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos desde su publicación. El uso continuado implica aceptación de los términos actualizados.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">9. Ley Aplicable</h2>
          <p>Estos términos se rigen por las leyes aplicables en la jurisdicción donde opera Elfawa. Cualquier disputa será resuelta ante los tribunales competentes.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">10. Contacto</h2>
          <p>Para consultas sobre estos términos, puedes contactarnos en: <a href="mailto:legal@astrelle-guide.app" className="text-primary hover:underline">legal@astrelle-guide.app</a></p>
        </section>
      </div>
    </div>
  </div>
);

export default Terms;
