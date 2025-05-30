
import { useAuth } from '@/hooks/useAuth';
import AdminPanel from '@/components/AdminPanel';
import { Navigate } from 'react-router-dom';

const AdminPage = () => {
  const { user, isAdmin, isSeller, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-peach-50 to-coral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isSeller)) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-peach-50 to-coral-50">
      <AdminPanel />
    </div>
  );
};

export default AdminPage;
