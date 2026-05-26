import ReadingScreen from "@/components/ReadingScreen";
import { PageSeo } from "@/components/PageSeo";
const Tarot = () => (
  <>
    <PageSeo
      title="Tarot — Lectura de cartas | Astrelle"
      description="Recibe una lectura de tarot personalizada según tu carta astral. Tres cartas, una pregunta y un mensaje claro."
      path="/tarot"
    />
    <ReadingScreen type="tarot" />
  </>
);
export default Tarot;
