import { type JSX, lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { LoadingSpinner } from '../pages/common/LoadingSpinner';
import { PublicLayout } from '../pages/layouts/PublicLayout'
import { PrivateLayout } from '../pages/layouts/PrivateLayout'
import { AuthLayout } from '../pages/layouts/AuthLayout'
import { ProtectedRoute } from './PrivateRoute';

const Home = lazy(() => import('../pages/Home'));
const PostDetail = lazy(() => import('../pages/PostDetail'));
const Contact = lazy(() => import('../pages/Contact'));
const About = lazy(() => import('../pages/About'));
const CGU = lazy(() => import('../pages/legal/CGU'));
const MentionsLegales = lazy(() => import('../pages/legal/MentionsLegales'));
const PolitiqueConfidentialite = lazy(() => import('../pages/legal/PolitiqueConfidentialite'));
const CategoryPosts = lazy(() => import('../pages/CategoryPosts'));

const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ArticleDashboard = lazy(() => import('../pages/secure/ArticleDashboard'));
const CategorieDashboard = lazy(() => import('../pages/secure/CategorieDashboard'));
const UserDashboard = lazy(() => import('../pages/secure/UserDashboard'));
const StatDashboard = lazy(() => import('../pages/secure/StatDashboard'));
const ProfilDashboard = lazy(() => import('../pages/secure/ProfilDashboard'));
const ParametreDashboard = lazy(() => import('../pages/secure/ParametreDashboard'));
const AdDashboard = lazy(() => import('../pages/secure/AdDashboard'));
const NewsletterAdmin = lazy(() => import('../pages/secure/NewsletterAdmin'));
const ContactDashboard = lazy(() => import('../pages/secure/ContactDashboard'));
const UserRightsPage = lazy(() => import('../pages/secure/UserRightsPage'));
const RolePermissionsPage = lazy(() => import('../pages/secure/RolePermissionsPage'));
const UserRolesPage = lazy(() => import("../pages/secure/UserRolesPage"));

const lazyLoad = (Component: React.LazyExoticComponent<() => JSX.Element | null>) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);

const guard = (
  element: JSX.Element,
  opts?: { roles?: string[]; permissions?: string[] }
) => (
  <ProtectedRoute roles={opts?.roles} permissions={opts?.permissions}>
    {element}
  </ProtectedRoute>
);

export const routes = [
  {
    path: '/',
    element: <PublicLayout><Outlet /></PublicLayout>,
    children: [
      // Routes publiques
      { index: true, element: <Navigate to="posts" replace /> },
      { path: 'posts', element: lazyLoad(Home) },
      { path: 'categories/:slug', element: lazyLoad(CategoryPosts) }, // ✅ NEW
      { path: 'posts/:postId', element: lazyLoad(PostDetail) },
      { path: 'a-propos', element: lazyLoad(About) },
      { path: 'contact', element: lazyLoad(Contact) },
      { path: 'mentions-legales', element: lazyLoad(MentionsLegales) },
      { path: 'confidentialite', element: lazyLoad(PolitiqueConfidentialite) },
      { path: 'cgu', element: lazyLoad(CGU) },
    ],
  },
  {
    path: 'auth',
    element: <AuthLayout><Outlet /></AuthLayout>,
    children: [
      { path: 'login', element: lazyLoad(Login) },
      { path: 'register', element: lazyLoad(Register) },
      // { path: 'password-reset', element: lazyLoad(PasswordReset) },
    ],
  },
  // Routes privées
  {
    path: 'espace-membre',
    element: (
      <ProtectedRoute>
        <PrivateLayout>
          <Outlet />
        </PrivateLayout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },

      { path: "dashboard", element: guard(lazyLoad(StatDashboard), { permissions: ["stats.dashboard.view"] }) },

      { path: "articles", element: guard(lazyLoad(ArticleDashboard), { permissions: ["articles.view"] }) },

      { path: "categories", element: guard(lazyLoad(CategorieDashboard), { permissions: ["categories.view"] }) },

      { path: "users", element: guard(lazyLoad(UserDashboard), { permissions: ["users.view"] }) },

      { path: "profile", element: guard(lazyLoad(ProfilDashboard)) }, // accessible à tous connectés

      { path: "parametres", element: guard(lazyLoad(ParametreDashboard), { permissions: ["settings.view"] }) },

      { path: "ads", element: guard(lazyLoad(AdDashboard), { permissions: ["ads.view"] }) },

      { path: "newsletter", element: guard(lazyLoad(NewsletterAdmin), { permissions: ["newsletter.view"] }) },

      { path: "messages", element: guard(lazyLoad(ContactDashboard), { permissions: ["contacts.view"] }) },

      // RBAC admin
      { path: "rbac/roles", element: guard(lazyLoad(RolePermissionsPage), { permissions: ["rbac.roles.view"] }) },

      // gestion des droits d’un user (assign roles)
      { path: "rbac/permissions", element: guard(lazyLoad(UserRightsPage), { permissions: ["rbac.users.assign_roles"] }) },

      { path: "rights/users/:userId", element: guard(lazyLoad(UserRolesPage), { permissions: ["rbac.users.assign_roles"] }) },
    ],

  },

  // Gestion des erreurs et redirections
  { path: '404', element: <div>Page non trouvée</div> },
  { path: '*', element: <Navigate to="/404" replace /> },
];

