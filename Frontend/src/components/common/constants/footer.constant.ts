import { Github, Twitter, Instagram } from "lucide-react";

export const FOOTER_SECTIONS = [
  {
    title: "Platform",
    links: [
      { label: "Explore", href: "/explore" },
      { label: "Trending", href: "/trending" },
      { label: "Communities", href: "/communities" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Safety", href: "/safety" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export const SOCIAL_LINKS = [
  { icon: Github, href: "https://github.com", label: "Github" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
];
