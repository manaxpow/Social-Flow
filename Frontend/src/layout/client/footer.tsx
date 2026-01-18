import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FOOTER_SECTIONS,
  SOCIAL_LINKS,
} from "@/components/common/constants/footer.constant";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background">
      <div className="container-fluid px-5 py-10 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link
              to="/"
              className="text-xl font-bold tracking-tight text-primary"
            >
              SocialFlow
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Connect with communities, share your passion, and grow your
              network.
            </p>
            <div className="flex mt-6 gap-3">
              {SOCIAL_LINKS.map((social) => (
                <Button key={social.label} variant="ghost" size="icon" asChild>
                  <a href={social.href} target="_blank" rel="noreferrer">
                    <social.icon className="size-5" />{" "}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div
              key={section.title}
              className="flex flex-col gap-3 md:items-center md:text-center"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                {section.title}
              </h3>
              {section.links.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} SocialFlow Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/status" className="hover:text-primary">
              System Status
            </Link>
            <div className="flex items-center gap-1">
              <Mail className="size-4" />
              <span>support@socialflow.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
