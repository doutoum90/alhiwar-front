import { Outlet } from 'react-router-dom';
import PrivateHeader from '../common/PrivateHeader';

export const MainLayout = () => (
  <div className="min-h-screen flex flex-col">
    <PrivateHeader />
    <main className="flex-1 container mx-auto p-4">
      <Outlet />
    </main>
    {/* Ajouter un Footer ici si nécessaire */}
  </div>
);

export default MainLayout;