import ReadingScreen from "@/components/ReadingScreen";
import { PageSeo } from "@/components/PageSeo";
const Secret = () => (
  <>
    <PageSeo
      title="El Secreto — Lectura mística | Astrelle"
      description="Descubre un mensaje secreto del universo basado en tu energía actual y tu carta astral."
      path="/el-secreto"
    />
    <ReadingScreen type="secret" />
  </>
);
export default Secret;
