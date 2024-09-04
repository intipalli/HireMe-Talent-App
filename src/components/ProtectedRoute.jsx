import { Navigate } from 'react-router-dom';

function ProtectedRoute({ user, allowedRoles, children }) {
  if (user && allowedRoles.includes(user.type)) {
    return children;
  } else {
    return <Navigate to="/login" replace />;
  }
}

export default ProtectedRoute;
