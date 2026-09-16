import CmsPage from "@/components/CmsPage";
import { getPage } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contact | Zuess" };

export default async function Contact() {
  const page = await getPage("contact");
  return <CmsPage page={page?.published ? page : {
    title: "Tell us where your books stand today.",
    subtitle: "Contact",
    description: "We reply to every enquiry within one business day, usually with a few clarifying questions before we suggest next steps.",
    content: [{ type: "contact", heading: "Start with a clear conversation", text: "Tell us what you need help with and our team will suggest next steps." }],
  }} />;
}
