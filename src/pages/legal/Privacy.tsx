import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import StarField from "@/components/StarField";

const Privacy = () => (
  <div className="min-h-screen relative">
    <StarField />
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide mb-2">Política de Privacidad</h1>
      <p className="text-muted-foreground text-sm mb-10">Última actualización: 30 de marzo de 2026</p>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-foreground/80 font-body leading-relaxed">
        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">1. Información que Recopilamos</h2>
          <p><strong>Datos proporcionados por el usuario:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nombre completo y correo electrónico (registro).</li>
            <li>Fecha, hora y lugar de nacimiento (carta astral).</li>
            <li>Entradas del diario astral y estados de ánimo.</li>
            <li>Fechas importantes guardadas.</li>
          </ul>
          <p><strong>Datos recopilados automáticamente:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tipo de dispositivo y navegador.</li>
            <li>Datos de uso y navegación dentro de la app.</li>
            <li>Dirección IP (anonimizada).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">2. Cómo Usamos tu Información</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Generar tu carta astral y análisis personalizados.</li>
            <li>Proporcionar lecturas y predicciones astrológicas.</li>
            <li>Procesar pagos y gestionar tu suscripción.</li>
            <li>Mejorar la calidad del servicio y la experiencia de usuario.</li>
            <li>Enviar notificaciones relevantes (con tu consentimiento).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">3. Procesamiento por IA</h2>
          <p>Utilizamos modelos de inteligencia artificial para generar análisis astrológicos. Tus datos de nacimiento son procesados para calcular posiciones planetarias y generar interpretaciones. <strong>Los datos no se usan para entrenar modelos de IA.</strong></p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">4. Compartición de Datos</h2>
          <p>No vendemos ni compartimos tus datos personales con terceros, excepto:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Proveedores de servicio:</strong> procesamiento de pagos (Stripe), alojamiento en la nube y servicios de IA, bajo acuerdos de confidencialidad.</li>
            <li><strong>Requisitos legales:</strong> cuando lo exija la ley o una autoridad competente.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">5. Seguridad de los Datos</h2>
          <p>Implementamos medidas de seguridad incluyendo:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Encriptación en tránsito (TLS/SSL) y en reposo.</li>
            <li>Autenticación segura con verificación de correo electrónico.</li>
            <li>Políticas de acceso restringido a nivel de base de datos (RLS).</li>
            <li>Monitoreo continuo de vulnerabilidades.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">6. Tus Derechos</h2>
          <p>Tienes derecho a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Acceder</strong> a tus datos personales almacenados.</li>
            <li><strong>Rectificar</strong> información incorrecta o desactualizada.</li>
            <li><strong>Eliminar</strong> tu cuenta y datos asociados.</li>
            <li><strong>Portabilidad:</strong> solicitar una copia de tus datos.</li>
            <li><strong>Oposición:</strong> retirar el consentimiento para el procesamiento.</li>
          </ul>
          <p>Para ejercer estos derechos, contacta a: <a href="mailto:privacidad@astrelle-guide.app" className="text-primary hover:underline">privacidad@astrelle-guide.app</a></p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">7. Retención de Datos</h2>
          <p>Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta, los datos se borran permanentemente dentro de 30 días, excepto cuando la ley exija su conservación.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">8. Menores de Edad</h2>
          <p>Astrelle no está dirigida a menores de 13 años. No recopilamos intencionalmente datos de menores. Si descubrimos datos de un menor, serán eliminados de inmediato.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">9. Cambios a esta Política</h2>
          <p>Nos reservamos el derecho de actualizar esta política. Notificaremos cambios significativos por correo electrónico o mediante un aviso en la Aplicación.</p>
        </section>
      </div>
    </div>
  </div>
);

export default Privacy;
