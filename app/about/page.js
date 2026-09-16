import PageHero from "@/components/PageHero";
import AnimatedCounter from "@/components/AnimatedCounter";
import { stats } from "@/lib/data";
import CmsPage from "@/components/CmsPage";
import { getPage } from "@/lib/content";

export const metadata = { title: "About | Zuess" };

const values = [
  {
    title: "Deadlines are commitments",
    detail:
      "We build in buffer time deliberately, so a filing date is never a source of stress for a client.",
  },
  {
    title: "Plain language, always",
    detail:
      "A tax notice or audit finding is explained the way we'd explain it to our own family, not in clause numbers.",
  },
  {
    title: "One firm, one file",
    detail:
      "Your taxation, audit and compliance work sit with the same team, so nothing gets lost in a handover.",
  },
];

export default async function About() {
  const page = await getPage("about");
  if (page?.published) return <CmsPage page={page} />;

  return (
    <>
      <PageHero
        eyebrow="About the firm"
        title="Built by accountants who wanted fewer surprises, not more clients."
        description="Zuess started in 2008 as a two-person tax practice. Eighteen years on, we still take on a client only when we're confident we can hold to the standard we set for the first ones."
      />

      <section className="py-20 md:py-28">
        <div className="container-content grid md:grid-cols-2 gap-16">
          <div>
            <p className="text-emerald text-[14px] font-medium mb-4">Our story</p>
            <h2 className="font-serif text-3xl text-ink mb-6 leading-snug">
              A practice that grew by referral, not advertising.
            </h2>
            <div className="space-y-4 text-[15px] text-charcoal/75 leading-relaxed">
              <p>
                Rohan Mehta opened the first Zuess office above a printing
                shop on Residency Road with a single filing cabinet and three
                retainer clients. The firm's approach was simple then and hasn't
                changed since: know a client's numbers well enough to answer
                for them without checking a file first.
              </p>
              <p>
                Today the team handles taxation, statutory audit, corporate
                compliance and financial advisory for founders, family
                businesses and mid-sized companies across Karnataka — most of
                whom arrived through a referral from an existing client.
              </p>
            </div>
          </div>

          <div className="bg-paper-dim p-8 rounded-sm">
            <p className="font-serif text-xl text-ink mb-6">Zuess in numbers</p>
            <div className="grid grid-cols-2 gap-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-serif text-3xl text-emerald">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1.5 text-[13px] text-charcoal/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper-dim py-20 md:py-28">
        <div className="container-content">
          <p className="text-emerald text-[14px] font-medium mb-3">What we hold to</p>
          <h2 className="font-serif text-3xl md:text-4xl text-ink max-w-lg mb-14">
            Three things clients mention when they refer us.
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {values.map((v) => (
              <div key={v.title} className="border-t border-line pt-5">
                <p className="font-serif text-xl text-ink mb-3">{v.title}</p>
                <p className="text-[14.5px] text-charcoal/70 leading-relaxed">{v.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
