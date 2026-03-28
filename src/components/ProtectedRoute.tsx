import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AstralLoading from "@/components/AstralLoading";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <AstralLoading />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
