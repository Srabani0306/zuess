import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import { serviceGroups } from "@/lib/data";
import CmsPage from "@/components/CmsPage";
import { getPage, getNavigation } from "@/lib/content";

export const metadata = { title: "Services | Zuess" };
export const dynamic = "force-dynamic";

export default async function Services() {
  const page = await getPage("services");
  const navigation = await getNavigation();
  const dynamicServices = navigation.find((group) => group.slug === "services")?.items || [];
  const serviceCategories = dynamicServices.length
    ? dynamicServices.map((item) => ({ ...item, title: item.label, blurb: item.description || "Practical support from the Zuess team.", items: item.children?.length ? item.children : [item] }))
    : serviceGroups.map((group) => ({ ...group, items: group.items.map((item) => ({ ...item, href: `/services/${item.slug}` })) }));

  if (page?.published) return <CmsPage page={page} serviceCategories={serviceCategories} />;

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Everything a growing business needs from its accountants."
        description="Organised the way you'll actually need it — by the kind of problem it solves, not by internal department."
      />

      <section className="py-20 md:py-28">
        <div className="container-content space-y-24">
          {serviceGroups.map((group, i) => (
            <div key={group.id} id={group.id} className="scroll-mt-28 grid md:grid-cols-[280px_1fr] gap-10 md:gap-16">
              <div>
                <p className="font-mono text-[13px] text-gold mb-3">
                  0{i + 1}
                </p>
                <h2 className="font-serif text-3xl text-ink leading-snug mb-3">{group.title}</h2>
                <p className="text-[14.5px] text-charcoal/65 leading-relaxed">{group.blurb}</p>
              </div>

              <div className={`grid gap-4 ${group.items.length > 1 ? "sm:grid-cols-2" : "sm:max-w-sm"}`}>
                {group.items.map((item) => (
                  <div
                    key={item.slug}
                    className="group relative overflow-hidden rounded-xl border border-line bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald/30 hover:shadow-[0_20px_40px_-25px_rgba(16,27,51,0.3)]"
                  >
                    <span className="absolute -right-8 -top-8 w-20 h-20 rounded-full bg-emerald/10 opacity-60 transition-transform duration-500 ease-out group-hover:scale-150" />
                    <p className="relative font-serif text-lg text-ink mb-2">{item.name}</p>
                    <p className="relative text-[13.5px] text-charcoal/60 leading-relaxed mb-4">
                      {serviceDescriptions[item.slug]}
                    </p>
                    <Link
                      href="/contact"
                      className="relative inline-flex items-center gap-1 text-[13px] font-medium text-emerald"
                    >
                      Ask about this <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="container-content py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <h2 className="font-serif text-3xl md:text-4xl max-w-lg leading-tight">
            Not sure which service you need? Start with a conversation.
          </h2>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-gold text-ink px-6 py-3.5 rounded-sm font-medium hover:bg-gold-light transition-colors shrink-0"
          >
            Book a consultation <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}

const serviceDescriptions = {
  "income-tax-filing": "Personal and business returns filed accurately, with planning done before the year closes, not after.",
  "gst-registration": "Registration, monthly and annual returns, and reconciliation against your purchase records.",
  "tds-advance-tax": "Quarterly TDS returns and advance tax estimates so nothing is owed as a lump sum in March.",
  "tax-litigation": "Representation before assessing officers and appellate authorities when a notice needs a response.",
  "statutory-audit": "Independent audit under the Companies Act, delivered with enough lead time to fix findings before filing.",
  "internal-audit": "A periodic, independent look at your controls and processes — built around your risk areas, not a generic checklist.",
  "stock-audit": "Physical verification and valuation of inventory, typically required by lenders against working capital limits.",
  "due-diligence": "Financial due diligence for buyers, investors or lenders, delivered as a plain-language report.",
  "company-incorporation": "Private limited, LLP or partnership registration handled end to end, including the first compliance calendar.",
  "roc-filings": "Annual returns, financial statement filings and event-based ROC forms, tracked so nothing is missed.",
  "llp-registration": "LLP formation and the agreement drafting that goes with it, sized for professional and small business partnerships.",
  "secretarial-compliance": "Board resolutions, statutory registers and secretarial records kept current between audits.",
  "bookkeeping": "Monthly reconciliation and clean books, so your financial statements are ready whenever you need them.",
  "payroll": "Salary processing, statutory deductions and payslips handled on a fixed monthly cycle.",
  "financial-advisory": "Budgeting, cash flow planning and the numbers behind a pricing or expansion decision.",
  "loan-assistance": "Financial statements and projections prepared to the format your lender actually asks for.",
};
