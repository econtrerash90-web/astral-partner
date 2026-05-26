import ReadingScreen from "@/components/ReadingScreen";
import { PageSeo } from "@/components/PageSeo";
const Oracle = () => (
  <>
    <PageSeo
      title="Oráculo — Consulta tu camino | Astrelle"
      description="Consulta al oráculo y recibe una respuesta clara guiada por tu carta astral."
      path="/oraculo"
    />
    <ReadingScreen type="oracle" />
  </>
);
export default Oracle;
