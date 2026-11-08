import { Navigate, useParams } from "react-router-dom";

export default function CustomerHome() {
  const { outletId } = useParams<{ outletId: string }>();

  if (!outletId) {
    return <Navigate to="/outlets" replace />;
  }

  return (
    <Navigate
      to={`/outlets/${outletId}/menu`}
      replace
    />
  );
}