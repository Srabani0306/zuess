import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import RichText from "@/components/RichText";
import { getTeam, getTeamMember } from "@/lib/content";
import { ArrowLeft, Linkedin, Mail, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const member = await getTeamMember(params.slug);
  return { title: member ? `${member.name} | Zuess Team` : "Team | Zuess" };
}

function initialsOf(name) {
  return String(name || "")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function TeamMemberPage({ params }) {
  const member = await getTeamMember(params.slug);
  if (!member) notFound();

  const team = await getTeam();
  const others = team.filter((item) => item.slug !== member.slug).slice(0, 3);

  return (
    <>
      <section className="relative bg-ink text-paper overflow-hidden">
        <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-emerald/20 blur-3xl" />
        <div className="absolute -right-16 -bottom-20 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="container-content relative py-20 md:py-28">
          <Link href="/team" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gold mb-10">
            <ArrowLeft size={14} /> Back to team
          </Link>

          <div className="grid md:grid-cols-[auto_1fr] gap-10 items-center">
            <Reveal y={12}>
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover border-4 border-paper/10 mx-auto md:mx-0"
                />
              ) : (
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-emerald/20 text-paper flex items-center justify-center font-serif text-4xl mx-auto md:mx-0">
                  {initialsOf(member.name)}
                </div>
              )}
            </Reveal>

            <div className="text-center md:text-left">
              <Reveal>
                <p className="text-gold text-[14px] mb-3">{member.role}</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 className="font-serif text-4xl md:text-5xl leading-tight">{member.name}</h1>
              </Reveal>
              <Reveal delay={0.12}>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                  {member.qualification && (
                    <span className="text-[13px] bg-paper/10 px-3.5 py-1.5 rounded-full">{member.qualification}</span>
                  )}
                  {member.experienceYears ? (
                    <span className="text-[13px] bg-paper/10 px-3.5 py-1.5 rounded-full">{member.experienceYears}+ years experience</span>
                  ) : null}
                  {member.focus && <span className="text-[13px] bg-paper/10 px-3.5 py-1.5 rounded-full">Focus: {member.focus}</span>}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-content grid lg:grid-cols-[1fr_320px] gap-12 items-start">
          <Reveal as="article" className="min-w-0">
            {member.bio ? (
              <RichText value={member.bio} className="text-[16px] text-charcoal/80 leading-relaxed" />
            ) : (
              <p className="text-charcoal/60">No biography has been added for {member.name} yet.</p>
            )}
          </Reveal>

          <Reveal delay={0.1} className="bg-paper-dim p-7 border border-line space-y-4">
            <p className="font-serif text-lg text-ink mb-2">Get in touch</p>
            {member.email && (
              <a href={`mailto:${member.email}`} className="flex items-center gap-2.5 text-[14px] text-charcoal/75 hover:text-emerald transition-colors">
                <Mail size={16} /> {member.email}
              </a>
            )}
            {member.phone && (
              <a href={`tel:${member.phone}`} className="flex items-center gap-2.5 text-[14px] text-charcoal/75 hover:text-emerald transition-colors">
                <Phone size={16} /> {member.phone}
              </a>
            )}
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-[14px] text-charcoal/75 hover:text-emerald transition-colors">
                <Linkedin size={16} /> LinkedIn profile
              </a>
            )}
            {!member.email && !member.phone && !member.linkedin && (
              <p className="text-[13px] text-charcoal/50">
                Reach us via the <Link href="/contact" className="text-emerald">contact page</Link>.
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {others.length > 0 && (
        <section className="bg-paper-dim py-16 md:py-20">
          <div className="container-content">
            <p className="font-serif text-2xl text-ink mb-8">Meet the rest of the team</p>
            <div className="grid sm:grid-cols-3 gap-6">
              {others.map((item, index) => (
                <Reveal key={item.id} delay={index * 0.06}>
                  <Link
                    href={`/team/${item.slug}`}
                    className="group block bg-paper p-6 border border-line hover:border-emerald hover:-translate-y-1 transition-all duration-300"
                  >
                    <p className="font-serif text-lg text-ink">{item.name}</p>
                    <p className="text-[13px] text-emerald mt-1">{item.role}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
