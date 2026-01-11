import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaHome,
  FaNewspaper,
  FaUsers,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaBullhorn,
  FaTags,
  FaEnvelopeOpenText,
  FaKey,
  FaUserShield,
} from "react-icons/fa";

export const PARAGRAPHS = [
  {
    title: "Présentation d'Alhiwar",
    sousParagraphs: [
      {
        title: "📰 Qui sommes-nous ?",
        description:
          "Alhiwar est un journal d’actualité et d’analyses. Nous mettons en avant une information fiable, accessible et structurée par rubriques pour aider nos lecteurs à comprendre les enjeux, suivre l’essentiel et rester informés au quotidien.",
      },
      {
        title: "🎯 Notre mission",
        description:
          "Notre mission est de proposer une couverture claire et pertinente de l’actualité (locale, nationale et internationale), en privilégiant la qualité des contenus, la diversité des points de vue et la mise en contexte des faits.",
      },
    ],
  },
  {
    title: "Une information claire, un accès rapide à l’essentiel",
    sousParagraphs: [
      { title: "✅ Fiabilité", description: "Nous privilégions des contenus vérifiés, des sources solides et une rédaction responsable." },
      { title: "🧭 Clarté", description: "Nos articles sont pensés pour être lisibles et structurés, afin de faciliter la compréhension." },
      { title: "📌 Pertinence", description: "Nous mettons en avant les sujets majeurs, avec une organisation par rubriques et des mises en avant “Breaking”." },
      { title: "🌍 Ouverture", description: "Alhiwar offre une couverture large et une vision globale des actualités et des tendances." },
    ],
  },
];

export const FAQ_TITLES = {
  title: "Une question ? Nous avons la réponse !",
  subtitle: "Découvrez tout ce qu’il faut savoir sur Alhiwar et profitez pleinement de votre expérience.",
};

export const ABOUT_TITLES = {
  title: "Alhiwar, votre source d’actualité et d’analyses",
  subtitle: "Nous mettons l’information en perspective pour vous aider à comprendre l’essentiel.",
};

export const PUBLIC_MENU = [
  { label: "Actualités", link: "/posts" },
  { label: "Rubriques", link: "/categories" },
  { label: "À propos", link: "/a-propos" },
  { label: "Contact", link: "/contact" },
];

export const MAIL = "contact@alhiwar.td";
export const PHONE = "+235 66 66 66 66";
export const ADDRESS = "Mardjan Dafag N'Djaména Tchad";

export const SOCIAL_MEDIA = [
  { icon: FaFacebook, link: "https://www.facebook.com/alhiwar" },
  { icon: FaTwitter, link: "https://www.twitter.com/alhiwar" },
  { icon: FaLinkedin, link: "https://www.linkedin.com/alhiwar" },
  { icon: FaInstagram, link: "https://www.instagram.com/alhiwar" },
];

export const YEAR = new Date().getFullYear();
export const COPYRIGHT = `© ${YEAR} Alhiwar. Tous droits réservés`;

export const DASHBOARD_TITLE = "Tableau de bord";

type MenuItem = {
  name: string;
  path: string;
  icon: any;
  danger?: boolean;
  roles?: string[];
  permissions?: string[];
};

export const PROTECTED_MENU: MenuItem[] = [
  { name: "Dashboard", path: "/espace-membre/dashboard", icon: FaHome, permissions: ["stats.dashboard.view"] },

  { name: "Articles", path: "/espace-membre/articles", icon: FaNewspaper, permissions: ["articles.view"] },
  { name: "Catégories", path: "/espace-membre/categories", icon: FaTags, permissions: ["categories.view"] },

  { name: "Utilisateurs", path: "/espace-membre/users", icon: FaUsers, permissions: ["users.view"] },
  { name: "Publicités", path: "/espace-membre/ads", icon: FaBullhorn, permissions: ["ads.view"] },
  { name: "Newsletter", path: "/espace-membre/newsletter", icon: FaEnvelopeOpenText, permissions: ["newsletter.view"] },
  { name: "Messages", path: "/espace-membre/messages", icon: FaEnvelopeOpenText, permissions: ["contacts.view"] },

  { name: "Rôles", path: "/espace-membre/rbac/roles", icon: FaUserShield, permissions: ["rbac.roles.view"] },
  { name: "Permissions", path: "/espace-membre/rbac/permissions", icon: FaKey, permissions: ["rbac.permissions.view"] },

  { name: "Profil", path: "/espace-membre/profile", icon: FaUser },

  { name: "Paramètres", path: "/espace-membre/parametres", icon: FaCog, permissions: ["settings.view"] },

  { name: "Déconnexion", path: "/auth/login", icon: FaSignOutAlt, danger: true },
];

export const AUTH_FORM_COLORS = {
  formBgLight: "app.formBg.light",
  formBgDark: "app.formBg.dark",
  heading: "app.heading",
  text: "app.text",
  link: "app.link",
  focusBorder: "app.focusBorder",
  spinner: "app.spinner",
  buttonHover: { transform: "translateY(-2px)" },
};

export const OTHER_LINKS = [
  { label: "Mentions légales", link: "/mentions-legales" },
  { label: "Politique de confidentialité", link: "/confidentialite" },
  { label: "CGU", link: "/cgu" },
];

export const PAGE_SIZE = 25;

export type NewsletterTableMode = "all" | "unverified";

export const CONSENT_KEY = "cache_consent";
export const CONSENT_VERSION = "v1";