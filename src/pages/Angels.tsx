import ReadingScreen from "@/components/ReadingScreen";
import { PageSeo } from "@/components/PageSeo";
const Angels = () => (
  <>
    <PageSeo
      title="Ángeles — Mensaje angelical | Astrelle"
      description="Recibe el mensaje de tu ángel guía personalizado según tu carta astral y tu pregunta."
      path="/angeles"
    />
    <ReadingScreen type="angels" />
  </>
);
export default Angels;
