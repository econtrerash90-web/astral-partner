import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import StarField from "@/components/StarField";

const Cookies = () => (
  <div className="min-h-screen relative">
    <StarField />
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide mb-2">Política de Cookies</h1>
      <p className="text-muted-foreground text-sm mb-10">Última actualización: 30 de marzo de 2026</p>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-foreground/80 font-body leading-relaxed">
        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">1. ¿Qué son las Cookies?</h2>
          <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestra Aplicación. Nos permiten recordar tus preferencias y mejorar tu experiencia.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">2. Cookies que Utilizamos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-2 pr-4 text-foreground">Tipo</th>
                  <th className="text-left py-2 pr-4 text-foreground">Propósito</th>
                  <th className="text-left py-2 text-foreground">Duración</th>
                </tr>
              </thead>
              <tbody className="text-foreground/70">
                <tr className="border-b border-border/20">
                  <td className="py-2 pr-4 font-medium">Esenciales</td>
                  <td className="py-2 pr-4">Autenticación y sesión de usuario</td>
                  <td className="py-2">Sesión</td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2 pr-4 font-medium">Funcionales</td>
                  <td className="py-2 pr-4">Preferencias de tema y configuración</td>
                  <td className="py-2">1 año</td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2 pr-4 font-medium">Analíticas</td>
                  <td className="py-2 pr-4">Uso de la aplicación y rendimiento</td>
                  <td className="py-2">90 días</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">3. Almacenamiento Local</h2>
          <p>Además de cookies, utilizamos <strong>localStorage</strong> del navegador para almacenar:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tokens de autenticación (sesión segura).</li>
            <li>Preferencias de tema (claro/oscuro).</li>
            <li>Caché de datos para mejorar el rendimiento.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">4. Cookies de Terceros</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Stripe:</strong> cookies necesarias para el procesamiento seguro de pagos.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground tracking-wide">5. Gestión de Cookies</h2>
          <p>Puedes gestionar las cookies a través de la configuración de tu navegador. Ten en cuenta que deshabilitar cookies esenciales puede afectar el funcionamiento de la Aplicación.</p>
        </section>
      </div>
    </div>
  </div>
);

export default Cookies;
