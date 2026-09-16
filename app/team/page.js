import Reveal from "@/components/Reveal";
import TeamShowcase from "@/components/TeamShowcase";
import { getTeam } from "@/lib/content";
import { team as fallbackTeam } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = { title: "Team | Zuess" };

export default async function Team() {
  const members = await getTeam();
  const roster = members.length > 0 ? members : fallbackTeam;

  return (
    <>
      <TeamShowcase members={roster} />

      <section className="bg-paper-dim py-20 md:py-28">
        <div className="container-content grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <p className="text-emerald text-[14px] font-medium mb-3">Joining the firm</p>
            <h2 className="font-serif text-3xl text-ink mb-5 leading-snug">
              We're a small firm on purpose — but we're always looking for good accountants.
            </h2>
            <p className="text-[15px] text-charcoal/70 leading-relaxed">
              If you're a qualified CA or an articled trainee looking for a
              practice that still does client work directly rather than
              through layers, write to us with your CV and a short note on
              what kind of work interests you.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="bg-paper p-8 rounded-sm border border-line">
              <p className="font-serif text-lg text-ink mb-4">Write to us</p>
              <p className="text-[14px] text-charcoal/65 leading-relaxed mb-1">careers@zuess.local</p>
              <p className="text-[14px] text-charcoal/65 leading-relaxed">+91 80 4123 5566</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
