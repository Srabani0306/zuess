import Link from "next/link";
import { serviceGroups } from "@/lib/data";
import { getSocialIcon } from "@/lib/socialIcons";

const quickLinks = [
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Blog", href: "/blog" },
  { name: "Team", href: "/team" },
];

export default function Footer({ navigation = [], socialLinks = [] }) {
  const serviceNavigation = navigation.find((group) => group.slug === "services");

  const serviceItems = serviceNavigation
    ? serviceNavigation.items.map((item) => ({ slug: item.id, name: item.label, href: item.href }))
    : serviceGroups.flatMap((group) => group.items.map((item) => ({ ...item, href: `/services#${group.id}` })));

  return (
    <footer className="bg-ink text-paper/80">
      <div className="container-content py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl text-paper">
            Zuess <span className="italic text-gold">&amp; Co.</span>
          </p>
          <p className="mt-4 text-[14px] leading-relaxed max-w-xs text-paper/65">
            A chartered accountancy practice handling taxation, audit, compliance
            and advisory for founders and established businesses alike.
          </p>
          <p className="mt-6 text-[13px] text-paper/50">
            402, Residency Chambers, MG Road, Bengaluru 560001
          </p>
        </div>

        <div>
          <p className="text-[13px] tracking-wide text-gold-light/60 mb-4">Services</p>
          <ul className="space-y-2.5">
            {serviceItems.map((item) => (
              <li key={item.slug}>
                <Link href={item.href} className="text-[14px] text-paper/70 hover:text-paper transition-colors">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[13px] tracking-wide text-gold-light/60 mb-4">Quick Links</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2.5">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-[14px] text-paper/70 hover:text-paper transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[13px] tracking-wide text-gold-light/60 mb-4">Follow Us</p>
          {socialLinks.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => {
                const Icon = getSocialIcon(link.platform);
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-paper/20 text-paper/70 hover:text-ink hover:bg-gold hover:border-gold transition-colors"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] text-paper/40">Coming soon.</p>
          )}
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="container-content py-6 flex flex-col sm:flex-row justify-between gap-3 text-[13px] text-paper/45">
          <p>&copy; {new Date().getFullYear()} Zuess Chartered Accountants.</p>
          <p>Membership No. 148203 &middot; ICAI Registered Firm</p>
        </div>
      </div>
    </footer>
  );
}
