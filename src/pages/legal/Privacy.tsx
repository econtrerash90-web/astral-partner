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

      <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide mb-2">Aviso de Privacidad Integral</h1>
      <p className="text-muted-foreground text-sm mb-2">Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</p>
      <p className="text-muted-foreground text-sm mb-10">Última actualización: 30 de marzo de 2026</p>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-foreground/80 font-body leading-relaxed">
        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">I. Identidad del Responsable</h2>
          <p><strong>Elfawa</strong> (en adelante "el Responsable"), con domicilio en México, es responsable del tratamiento de sus datos personales a través de la plataforma <strong>Astrelle Guide</strong> (en adelante "la Aplicación"), accesible en <a href="https://astrelle-guide.app" className="text-primary hover:underline">astrelle-guide.app</a>.</p>
          <p>Para cualquier comunicación relacionada con este aviso, puede contactarnos en: <a href="mailto:privacidad@astrelle-guide.app" className="text-primary hover:underline">privacidad@astrelle-guide.app</a></p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">II. Datos Personales Recabados</h2>
          <p><strong>Datos de identificación:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nombre completo</li>
            <li>Correo electrónico</li>
          </ul>
          <p><strong>Datos sensibles:</strong></p>
          <div className="glass-card p-4 border-accent/30 my-3">
            <p className="text-foreground/90 m-0">De conformidad con el artículo 3, fracción VI de la LFPDPPP, los siguientes datos se consideran <strong>datos personales sensibles</strong> por revelar aspectos íntimos relacionados con creencias y vida privada:</p>
          </div>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Fecha de nacimiento</strong> (día, mes, año)</li>
            <li><strong>Hora de nacimiento</strong></li>
            <li><strong>Lugar de nacimiento</strong> (ciudad, país, coordenadas geográficas)</li>
          </ul>
          <p>Estos datos son necesarios para generar su carta astral y personalizar el contenido astrológico.</p>
          <p><strong>Datos financieros:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Información de pago procesada exclusivamente por <strong>Stripe, Inc.</strong> (PCI DSS Level 1). El Responsable <strong>no almacena</strong> datos de tarjetas de crédito o débito.</li>
          </ul>
          <p><strong>Datos de uso:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tipo de dispositivo y navegador</li>
            <li>Registro de actividad dentro de la Aplicación</li>
            <li>Dirección IP (anonimizada)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">III. Finalidades del Tratamiento</h2>
          <p><strong>Finalidades primarias (necesarias para el servicio):</strong></p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Crear y administrar su cuenta de usuario.</li>
            <li>Calcular su carta astral (posiciones planetarias, signo solar, lunar y ascendente).</li>
            <li>Generar lecturas astrológicas personalizadas (tarot, oráculo, ángeles, el secreto).</li>
            <li>Proporcionar predicciones semanales basadas en su configuración astral.</li>
            <li>Almacenar sus entradas de diario astral.</li>
            <li>Procesar pagos y administrar su suscripción Premium+.</li>
            <li>Atender solicitudes, quejas y reclamaciones.</li>
          </ol>
          <p><strong>Finalidades secundarias (no necesarias, requieren consentimiento):</strong></p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Enviar comunicaciones promocionales y novedades de la Aplicación.</li>
            <li>Realizar análisis estadísticos agregados para mejorar el servicio.</li>
            <li>Compartir contenido astrológico personalizado en redes sociales (a solicitud del usuario).</li>
          </ol>
          <p>Si no desea que sus datos sean tratados para finalidades secundarias, puede manifestarlo enviando un correo a <a href="mailto:privacidad@astrelle-guide.app" className="text-primary hover:underline">privacidad@astrelle-guide.app</a> o desmarcando la casilla de comunicaciones promocionales en su registro.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">IV. Consentimiento para Datos Sensibles</h2>
          <p>De conformidad con el artículo 9 de la LFPDPPP, el tratamiento de datos sensibles requiere su <strong>consentimiento expreso y por escrito</strong>.</p>
          <p>Al registrarse en la Aplicación y marcar la casilla correspondiente, usted otorga su consentimiento expreso para el tratamiento de sus datos de nacimiento (fecha, hora y lugar) con las finalidades descritas en este aviso.</p>
          <p>Puede revocar este consentimiento en cualquier momento mediante los mecanismos descritos en la sección de Derechos ARCO.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">V. Derechos ARCO</h2>
          <p>Conforme a los artículos 28 al 35 de la LFPDPPP, usted tiene derecho a:</p>
          <div className="space-y-3 my-4">
            <div className="glass-card p-4">
              <p className="font-medium text-foreground mb-1">📋 Acceso</p>
              <p className="text-sm m-0">Conocer qué datos personales tenemos sobre usted, para qué los utilizamos y las condiciones de su tratamiento.</p>
            </div>
            <div className="glass-card p-4">
              <p className="font-medium text-foreground mb-1">✏️ Rectificación</p>
              <p className="text-sm m-0">Solicitar la corrección de datos personales inexactos o incompletos. Puede editar sus datos de nacimiento directamente desde la sección "Perfil" de la Aplicación.</p>
            </div>
            <div className="glass-card p-4">
              <p className="font-medium text-foreground mb-1">🗑️ Cancelación</p>
              <p className="text-sm m-0">Solicitar la eliminación de sus datos personales. Puede eliminar su cuenta y todos los datos asociados desde la sección "Perfil". Los datos se eliminarán permanentemente en un plazo de 30 días.</p>
            </div>
            <div className="glass-card p-4">
              <p className="font-medium text-foreground mb-1">🚫 Oposición</p>
              <p className="text-sm m-0">Oponerse al tratamiento de sus datos para finalidades específicas, particularmente las secundarias.</p>
            </div>
          </div>
          <p><strong>Para ejercer sus derechos ARCO:</strong></p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Envíe su solicitud a <a href="mailto:arco@astrelle-guide.app" className="text-primary hover:underline">arco@astrelle-guide.app</a></li>
            <li>Incluya: nombre completo, correo electrónico registrado, descripción del derecho que desea ejercer y documentos que acrediten su identidad.</li>
            <li>Responderemos en un plazo máximo de <strong>20 días hábiles</strong> conforme a la ley.</li>
            <li>De ser procedente, se hará efectivo dentro de los <strong>15 días hábiles</strong> siguientes a la respuesta.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">VI. Transferencia de Datos</h2>
          <p>Sus datos personales pueden ser transferidos a los siguientes terceros, sin requerir su consentimiento conforme al artículo 37 de la LFPDPPP:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-2 pr-4 text-foreground">Tercero</th>
                  <th className="text-left py-2 pr-4 text-foreground">Finalidad</th>
                  <th className="text-left py-2 text-foreground">País</th>
                </tr>
              </thead>
              <tbody className="text-foreground/70">
                <tr className="border-b border-border/20">
                  <td className="py-2 pr-4">Stripe, Inc.</td>
                  <td className="py-2 pr-4">Procesamiento de pagos</td>
                  <td className="py-2">EE.UU.</td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2 pr-4">Proveedor de IA</td>
                  <td className="py-2 pr-4">Generación de análisis astrológicos</td>
                  <td className="py-2">EE.UU.</td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2 pr-4">Proveedor de infraestructura cloud</td>
                  <td className="py-2 pr-4">Alojamiento y almacenamiento</td>
                  <td className="py-2">EE.UU.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">Todas las transferencias se realizan bajo acuerdos de confidencialidad y con medidas de seguridad equivalentes a las descritas en este aviso.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">VII. Medidas de Seguridad</h2>
          <p>El Responsable ha implementado las siguientes medidas de seguridad administrativas, técnicas y físicas para proteger sus datos:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Encriptación en tránsito</strong> (TLS/SSL) para todas las comunicaciones.</li>
            <li><strong>Encriptación en reposo</strong> de la base de datos.</li>
            <li><strong>Row Level Security (RLS)</strong>: cada usuario solo puede acceder a sus propios datos.</li>
            <li><strong>Autenticación segura</strong> con verificación de correo electrónico.</li>
            <li><strong>Protección contra contraseñas filtradas</strong> (verificación HIBP).</li>
            <li><strong>Funciones de seguridad a nivel de base de datos</strong> (SECURITY DEFINER) para operaciones críticas.</li>
            <li>Stripe maneja todo el procesamiento de pagos (PCI DSS Level 1). No almacenamos datos de tarjetas.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">VIII. Uso de Cookies y Tecnologías de Rastreo</h2>
          <p>Para información detallada sobre el uso de cookies, consulte nuestra <Link to="/cookies" className="text-primary hover:underline">Política de Cookies</Link>.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">IX. Retención de Datos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Cuenta activa:</strong> sus datos se conservan mientras su cuenta esté activa.</li>
            <li><strong>Cancelación de cuenta:</strong> los datos se eliminan permanentemente dentro de 30 días, excepto cuando la ley exija su conservación.</li>
            <li><strong>Cancelación de suscripción:</strong> sus datos personales y carta astral se mantienen mientras la cuenta esté activa, independientemente del estado de suscripción.</li>
            <li><strong>Datos de facturación:</strong> se conservan por el período que establezca la legislación fiscal aplicable.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">X. Menores de Edad</h2>
          <p>La Aplicación no está dirigida a menores de 13 años. No recabamos intencionalmente datos de menores. Si identificamos datos de un menor, serán eliminados de inmediato.</p>
          <p>Los menores entre 13 y 18 años requieren el consentimiento de su padre, madre o tutor para el tratamiento de sus datos.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">XI. Modificaciones al Aviso de Privacidad</h2>
          <p>El Responsable se reserva el derecho de modificar este aviso. Las modificaciones estarán disponibles en la Aplicación y, en caso de cambios sustanciales, se notificará por correo electrónico.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">XII. Autoridad</h2>
          <p>Si considera que su derecho a la protección de datos ha sido vulnerado, puede acudir al <strong>Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI)</strong>: <a href="https://www.inai.org.mx" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.inai.org.mx</a></p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">XIII. Aceptación</h2>
          <p>Al crear una cuenta en Astrelle Guide y marcar la casilla de consentimiento correspondiente, usted manifiesta haber leído, entendido y aceptado los términos de este Aviso de Privacidad, incluyendo el tratamiento de sus datos sensibles.</p>
        </section>
      </div>
    </div>
  </div>
);

export default Privacy;
