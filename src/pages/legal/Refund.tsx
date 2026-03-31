import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import StarField from "@/components/StarField";

const Refund = () => (
  <div className="min-h-screen relative">
    <StarField />
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide mb-2">Política de Reembolso</h1>
      <p className="text-muted-foreground text-sm mb-10">Última actualización: 30 de marzo de 2026</p>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-foreground/80 font-body leading-relaxed">
        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">1. Período de Prueba</h2>
          <p>Astrelle ofrece un plan gratuito con funcionalidades básicas para que puedas evaluar el servicio antes de suscribirte a un plan premium.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">2. Cancelación de Suscripción</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Puedes cancelar tu suscripción premium en cualquier momento desde tu perfil.</li>
            <li>Al cancelar, mantendrás acceso a las funciones premium hasta el final del período de facturación actual.</li>
            <li>No se realizarán cargos adicionales después de la cancelación.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">3. Solicitud de Reembolso</h2>
          <p>Puedes solicitar un reembolso bajo las siguientes condiciones:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Dentro de los primeros 7 días</strong> desde la compra o renovación de tu suscripción.</li>
            <li>Si experimentaste problemas técnicos que impidieron el uso del servicio.</li>
            <li>Si se realizó un cargo no autorizado.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">4. Casos No Reembolsables</h2>
          <p>No se otorgarán reembolsos en los siguientes casos:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Solicitudes realizadas después de 7 días del cargo.</li>
            <li>Uso significativo del servicio premium durante el período.</li>
            <li>Insatisfacción con el contenido astrológico generado (que es de naturaleza subjetiva).</li>
            <li>Violación de los Términos y Condiciones que resulte en suspensión de la cuenta.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">5. Proceso de Reembolso</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Envía tu solicitud a <a href="mailto:soporte@astrelle-guide.app" className="text-primary hover:underline">soporte@astrelle-guide.app</a> indicando el motivo.</li>
            <li>Incluye tu correo electrónico registrado y fecha del cargo.</li>
            <li>Evaluaremos tu solicitud en un plazo de 5 días hábiles.</li>
            <li>Si es aprobado, el reembolso se procesará en 5-10 días hábiles al método de pago original.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">6. Cambios de Precio</h2>
          <p>Si el precio de tu plan cambia, se te notificará con al menos 30 días de anticipación. Si no estás de acuerdo con el nuevo precio, puedes cancelar antes de la siguiente renovación sin penalidad.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">7. Contacto</h2>
          <p>Para cualquier consulta relacionada con pagos y reembolsos: <a href="mailto:soporte@astrelle-guide.app" className="text-primary hover:underline">soporte@astrelle-guide.app</a></p>
        </section>
      </div>
    </div>
  </div>
);

export default Refund;
