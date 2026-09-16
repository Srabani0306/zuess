"use client";

import { useRef, useState } from "react";
import { Bell, Building2, ChevronLeft, ChevronRight, Contact2, FileText, FolderTree, GripVertical, Heart, Image, Inbox, KeyRound, LayoutDashboard, LogOut, Megaphone, Newspaper, Plus, Quote, Save, Share2, ShieldCheck, Trash2, Upload, Users as UsersIcon, X } from "lucide-react";
import { BLOCK_ICON_OPTIONS } from "@/lib/blockIcons";
import { SOCIAL_PLATFORM_OPTIONS } from "@/lib/socialIcons";
import RichTextEditor from "@/components/RichTextEditor";

const FULL_ACCESS_ROLES = ["ADMIN", "SUPERADMIN"];

/* [id, label, icon, requiredPermission] — requiredPermission of null means always visible. */
const sections = [
  ["overview", "Overview", LayoutDashboard, null],
  ["pages", "Pages", FileText, "pages.manage"],
  ["navigation", "Navigation", FolderTree, "navigation.manage"],
  ["testimonials", "Testimonials", Quote, "testimonials.manage"],
  ["banks", "Associated Banks", Building2, "banks.manage"],
  ["media", "Media", Image, "media.manage"],
  ["news", "News", Megaphone, "news.manage"],
  ["blog", "Blog", Newspaper, "blog.manage"],
  ["team", "Team", Contact2, "team.manage"],
  ["social", "Social Links", Share2, "social_links.manage"],
  ["enquiries", "Enquiries", Inbox, "enquiries.manage"],
  ["users", "Users", UsersIcon, "users.manage"],
  ["roles", "Roles & Permissions", ShieldCheck, "roles.manage"],
  ["account", "Account", KeyRound, null],
];

const emptyTestimonial = { name: "", role: "", company: "", quote: "", avatar: "", sortOrder: 0, published: true };
const emptyBank = { name: "", logo: "", sortOrder: 0, published: true };
const emptyNews = { title: "", link: "", sortOrder: 0, published: true };
const emptyBlogPost = { slug: "", title: "", excerpt: "", content: "", coverImage: "", author: "", tag: "", published: true };
const emptyTeamMember = { slug: "", name: "", role: "", qualification: "", focus: "", experienceYears: "", bio: "", photo: "", email: "", phone: "", linkedin: "", sortOrder: 0, published: true };
const emptySocialLink = { platform: "facebook", url: "", sortOrder: 0, published: true };

const emptyRole = { name: "", permissionKeys: [] };
const emptyStaffUser = { name: "", email: "", password: "", role: "STAFF", roleId: "" };

const ENQUIRIES_PAGE_SIZE = 10;

export default function AdminWorkspace({ session, enquiries, pages, navigation, testimonials, banks, news, blog, team, socialLinks, stats, roles, permissionCatalog, staffUsers }) {
  const can = (key) => !key || FULL_ACCESS_ROLES.includes(session.role) || (session.permissions || []).includes(key);
  const visibleSections = sections.filter(([, , , permission]) => can(permission));

  const [active, setActive] = useState("overview");
  const [enquiryRows, setEnquiryRows] = useState(enquiries || []);
  const [selectedEnquiryIds, setSelectedEnquiryIds] = useState(() => new Set());
  const [enquiryPage, setEnquiryPage] = useState(1);
  const [expandedEnquiryId, setExpandedEnquiryId] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [newsRows, setNewsRows] = useState(news || []);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsForm, setNewsForm] = useState(emptyNews);
  const [blogRows, setBlogRows] = useState(blog || []);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogForm, setBlogForm] = useState(emptyBlogPost);
  const [blogGallery, setBlogGallery] = useState([]);
  const [pageRows, setPageRows] = useState(pages);
  const [nav, setNav] = useState(navigation);
  const [selectedPage, setSelectedPage] = useState(pages[0] || null);
  const [pageForm, setPageForm] = useState(pages[0] || { slug: "", title: "", subtitle: "", description: "", heroImage: "", content: [] });
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [menuForm, setMenuForm] = useState({ label: "", href: "", description: "", parentId: "", groupId: navigation.groups[0]?.id || "", sortOrder: 0 });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [newPage, setNewPage] = useState({ slug: "", title: "" });
  const [testimonialRows, setTestimonialRows] = useState(testimonials || []);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonial);
  const [bankRows, setBankRows] = useState(banks || []);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankForm, setBankForm] = useState(emptyBank);
  const [teamRows, setTeamRows] = useState(team || []);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamForm, setTeamForm] = useState(emptyTeamMember);
  const [socialRows, setSocialRows] = useState(socialLinks || []);
  const [selectedSocial, setSelectedSocial] = useState(null);
  const [socialForm, setSocialForm] = useState(emptySocialLink);
  const [roleRows, setRoleRows] = useState(roles || []);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleForm, setRoleForm] = useState(emptyRole);
  const [staffRows, setStaffRows] = useState(staffUsers || []);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffForm, setStaffForm] = useState(emptyStaffUser);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/admin/login"; }
  function flash(text, type = "success") { setMessage(text); setMessageType(type); window.setTimeout(() => setMessage(""), 3200); }
  function choosePage(page) { setSelectedPage(page); setPageForm({ ...page, content: page.content || [] }); }
  async function savePage(event) {
    event.preventDefault();
    try {
      const content = typeof pageForm.content === "string" ? JSON.parse(pageForm.content || "[]") : pageForm.content;
      const hasCardMissingTitle = content.some((block) => block.type === "cards" && Array.isArray(block.cards) && block.cards.some((card) => !card.title || !card.title.trim()));
      const hasItemMissingTitle = content.some((block) => ["features", "eligibility", "checklist", "faq"].includes(block.type) && Array.isArray(block.items) && block.items.some((item) => !item.title || !item.title.trim()));
      if (hasCardMissingTitle || hasItemMissingTitle) {
        flash("Every card / item needs at least a title before you can save.", "error");
        return;
      }
      const response = await fetch(`/api/admin/pages/${pageForm.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...pageForm, content }) });
      if (response.ok) { setPageRows((rows) => rows.map((row) => row.id === pageForm.id ? { ...pageForm, content } : row)); flash("Page updated."); } else flash("Unable to update page.", "error");
    } catch { flash("Page sections contain invalid JSON.", "error"); }
  }
  async function createPage(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newPage, content: [] }) });
    const data = await response.json();
    if (response.ok) { const created = { ...newPage, slug: data.slug || newPage.slug, id: data.id, content: [], published: true }; setPageRows((rows) => [...rows, created]); choosePage(created); setNewPage({ slug: "", title: "" }); flash("Page created."); } else flash(data.error || "Unable to create page.", "error");
  }
  async function deletePage() {
    if (!selectedPage || !window.confirm(`Delete the ${selectedPage.slug} page?`)) return;
    const response = await fetch(`/api/admin/pages/${selectedPage.id}`, { method: "DELETE" });
    if (response.ok) { const remaining = pageRows.filter((row) => row.id !== selectedPage.id); setPageRows(remaining); choosePage(remaining[0] || null); flash("Page deleted."); } else flash("Unable to delete page.", "error");
  }
  async function upload(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const data = new FormData(); data.append("file", file); data.append("alt", pageForm.title || "Page image");
    const response = await fetch("/api/admin/upload", { method: "POST", body: data }); const result = await response.json();
    if (response.ok) { setPageForm((form) => ({ ...form, heroImage: result.url })); flash("Banner image uploaded."); } else flash(result.error || "Upload failed.", "error");
  }
  async function uploadBlockImage(event, blockIndex) {
    const file = event.target.files?.[0]; if (!file) return;
    const data = new FormData(); data.append("file", file); data.append("alt", pageForm.content?.[blockIndex]?.heading || "Section image");
    const response = await fetch("/api/admin/upload", { method: "POST", body: data }); const result = await response.json();
    if (!response.ok) return flash(result.error || "Upload failed.", "error");
    const content = Array.isArray(pageForm.content) ? [...pageForm.content] : JSON.parse(pageForm.content || "[]");
    content[blockIndex] = { ...content[blockIndex], image: result.url };
    setPageForm((form) => ({ ...form, content }));
    flash("Section image uploaded.");
  }
  async function uploadCardImage(event, blockIndex, cardIndex) {
    const file = event.target.files?.[0]; if (!file) return;
    const data = new FormData(); data.append("file", file); data.append("alt", pageForm.content?.[blockIndex]?.cards?.[cardIndex]?.title || "Card image");
    const response = await fetch("/api/admin/upload", { method: "POST", body: data }); const result = await response.json();
    if (!response.ok) return flash(result.error || "Upload failed.", "error");
    const content = Array.isArray(pageForm.content) ? [...pageForm.content] : JSON.parse(pageForm.content || "[]");
    const cards = Array.isArray(content[blockIndex].cards) ? [...content[blockIndex].cards] : [];
    cards[cardIndex] = { ...cards[cardIndex], image: result.url };
    content[blockIndex] = { ...content[blockIndex], cards };
    setPageForm((form) => ({ ...form, content }));
    flash("Card image uploaded.");
  }
  async function uploadBlockBackgroundImage(event, blockIndex) {
    const file = event.target.files?.[0]; if (!file) return;
    const data = new FormData(); data.append("file", file); data.append("alt", pageForm.content?.[blockIndex]?.heading || "Section background");
    const response = await fetch("/api/admin/upload", { method: "POST", body: data }); const result = await response.json();
    if (!response.ok) return flash(result.error || "Upload failed.", "error");
    const content = Array.isArray(pageForm.content) ? [...pageForm.content] : JSON.parse(pageForm.content || "[]");
    const currentBackground = content[blockIndex].background || {};
    content[blockIndex] = { ...content[blockIndex], background: { ...currentBackground, image: result.url } };
    setPageForm((form) => ({ ...form, content }));
    flash("Background image uploaded.");
  }
  function chooseTestimonial(item) { setSelectedTestimonial(item); setTestimonialForm(item ? { ...item } : emptyTestimonial); }
  async function saveTestimonial(event) {
    event.preventDefault();
    const response = await fetch(`/api/admin/testimonials/${selectedTestimonial.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(testimonialForm) });
    if (response.ok) { setTestimonialRows((rows) => rows.map((row) => row.id === selectedTestimonial.id ? { ...testimonialForm, id: selectedTestimonial.id } : row)); flash("Testimonial updated."); } else flash("Unable to update testimonial.", "error");
  }
  async function createTestimonial(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/testimonials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(testimonialForm) });
    const data = await response.json();
    if (response.ok) { const created = { ...testimonialForm, id: data.id }; setTestimonialRows((rows) => [...rows, created]); chooseTestimonial(created); flash("Testimonial added."); } else flash(data.error || "Unable to add testimonial.", "error");
  }
  async function deleteTestimonial() {
    if (!selectedTestimonial || !window.confirm(`Delete the testimonial from ${selectedTestimonial.name}?`)) return;
    const response = await fetch(`/api/admin/testimonials/${selectedTestimonial.id}`, { method: "DELETE" });
    if (response.ok) { setTestimonialRows((rows) => rows.filter((row) => row.id !== selectedTestimonial.id)); chooseTestimonial(null); flash("Testimonial deleted."); } else flash("Unable to delete testimonial.", "error");
  }
  async function uploadTestimonialAvatar(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const data = new FormData(); data.append("file", file); data.append("alt", testimonialForm.name || "Client photo");
    const response = await fetch("/api/admin/upload", { method: "POST", body: data }); const result = await response.json();
    if (response.ok) { setTestimonialForm((form) => ({ ...form, avatar: result.url })); flash("Photo uploaded."); } else flash(result.error || "Upload failed.", "error");
  }
  function chooseBank(item) { setSelectedBank(item); setBankForm(item ? { ...item } : emptyBank); }
  async function saveBank(event) {
    event.preventDefault();
    const response = await fetch(`/api/admin/banks/${selectedBank.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bankForm) });
    if (response.ok) { setBankRows((rows) => rows.map((row) => row.id === selectedBank.id ? { ...bankForm, id: selectedBank.id } : row)); flash("Bank updated."); } else flash("Unable to update bank.", "error");
  }
  async function createBank(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/banks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bankForm) });
    const data = await response.json();
    if (response.ok) { const created = { ...bankForm, id: data.id }; setBankRows((rows) => [...rows, created]); chooseBank(created); flash("Bank added."); } else flash(data.error || "Unable to add bank.", "error");
  }
  async function deleteBank() {
    if (!selectedBank || !window.confirm(`Delete ${selectedBank.name}?`)) return;
    const response = await fetch(`/api/admin/banks/${selectedBank.id}`, { method: "DELETE" });
    if (response.ok) { setBankRows((rows) => rows.filter((row) => row.id !== selectedBank.id)); chooseBank(null); flash("Bank deleted."); } else flash("Unable to delete bank.", "error");
  }
  async function uploadBankLogo(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const data = new FormData(); data.append("file", file); data.append("alt", bankForm.name || "Bank logo");
    const response = await fetch("/api/admin/upload", { method: "POST", body: data }); const result = await response.json();
    if (response.ok) { setBankForm((form) => ({ ...form, logo: result.url })); flash("Logo uploaded."); } else flash(result.error || "Upload failed.", "error");
  }
  function chooseTeam(item) { setSelectedTeam(item); setTeamForm(item ? { ...item, experienceYears: item.experienceYears ?? "" } : emptyTeamMember); }
  async function saveTeam(event) {
    event.preventDefault();
    const response = await fetch(`/api/admin/team/${selectedTeam.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(teamForm) });
    const data = await response.json();
    if (response.ok) { setTeamRows((rows) => rows.map((row) => row.id === selectedTeam.id ? { ...teamForm, id: selectedTeam.id, slug: data.slug } : row)); flash("Team member updated."); } else flash(data.error || "Unable to update team member.", "error");
  }
  async function createTeam(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(teamForm) });
    const data = await response.json();
    if (response.ok) { const created = { ...teamForm, id: data.id, slug: data.slug }; setTeamRows((rows) => [...rows, created]); chooseTeam(created); flash("Team member added."); } else flash(data.error || "Unable to add team member.", "error");
  }
  async function deleteTeam() {
    if (!selectedTeam || !window.confirm(`Delete ${selectedTeam.name}?`)) return;
    const response = await fetch(`/api/admin/team/${selectedTeam.id}`, { method: "DELETE" });
    if (response.ok) { setTeamRows((rows) => rows.filter((row) => row.id !== selectedTeam.id)); chooseTeam(null); flash("Team member deleted."); } else flash("Unable to delete team member.", "error");
  }
  async function uploadTeamPhoto(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const data = new FormData(); data.append("file", file); data.append("alt", teamForm.name || "Team member photo");
    const response = await fetch("/api/admin/upload", { method: "POST", body: data }); const result = await response.json();
    if (response.ok) { setTeamForm((form) => ({ ...form, photo: result.url })); flash("Photo uploaded."); } else flash(result.error || "Upload failed.", "error");
  }
  function chooseSocial(item) { setSelectedSocial(item); setSocialForm(item ? { ...item } : emptySocialLink); }
  async function saveSocial(event) {
    event.preventDefault();
    const response = await fetch(`/api/admin/social-links/${selectedSocial.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(socialForm) });
    if (response.ok) { setSocialRows((rows) => rows.map((row) => row.id === selectedSocial.id ? { ...socialForm, id: selectedSocial.id } : row)); flash("Social link updated."); } else flash("Unable to update social link.", "error");
  }
  async function createSocial(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/social-links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(socialForm) });
    const data = await response.json();
    if (response.ok) { const created = { ...socialForm, id: data.id }; setSocialRows((rows) => [...rows, created]); chooseSocial(created); flash("Social link added."); } else flash(data.error || "Unable to add social link.", "error");
  }
  async function deleteSocial() {
    if (!selectedSocial || !window.confirm(`Delete this ${selectedSocial.platform} link?`)) return;
    const response = await fetch(`/api/admin/social-links/${selectedSocial.id}`, { method: "DELETE" });
    if (response.ok) { setSocialRows((rows) => rows.filter((row) => row.id !== selectedSocial.id)); chooseSocial(null); flash("Social link deleted."); } else flash("Unable to delete social link.", "error");
  }

  /* Enquiries */
  function toggleEnquirySelect(id) {
    setSelectedEnquiryIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  function toggleEnquirySelectAllOnPage(pageIds) {
    setSelectedEnquiryIds((current) => {
      const allSelected = pageIds.every((id) => current.has(id));
      const next = new Set(current);
      pageIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }
  async function deleteSelectedEnquiries() {
    const ids = Array.from(selectedEnquiryIds);
    if (!ids.length || !window.confirm(`Permanently delete ${ids.length} ${ids.length === 1 ? "enquiry" : "enquiries"}?`)) return;
    const response = await fetch("/api/admin/enquiries", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
    if (response.ok) {
      setEnquiryRows((rows) => rows.filter((row) => !ids.includes(row.id)));
      setSelectedEnquiryIds(new Set());
      flash("Enquiries deleted.");
    } else flash("Unable to delete enquiries.", "error");
  }
  async function markEnquiryRead(id, isRead = true) {
    const target = enquiryRows.find((row) => row.id === id);
    if (!target || target.isRead === isRead) return;
    setEnquiryRows((rows) => rows.map((row) => (row.id === id ? { ...row, isRead } : row)));
    const response = await fetch(`/api/admin/enquiries/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead }) });
    if (!response.ok) setEnquiryRows((rows) => rows.map((row) => (row.id === id ? { ...row, isRead: !isRead } : row)));
  }
  function openEnquiryFromNotification(id) {
    markEnquiryRead(id, true);
    setNotifOpen(false);
    setActive("enquiries");
    setExpandedEnquiryId(id);
  }

  /* News */
  function chooseNews(item) { setSelectedNews(item); setNewsForm(item ? { ...item } : emptyNews); }
  async function saveNews(event) {
    event.preventDefault();
    const response = await fetch(`/api/admin/news/${selectedNews.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newsForm) });
    if (response.ok) { setNewsRows((rows) => rows.map((row) => row.id === selectedNews.id ? { ...newsForm, id: selectedNews.id } : row)); flash("News item updated."); } else flash("Unable to update news item.", "error");
  }
  async function createNews(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newsForm) });
    const data = await response.json();
    if (response.ok) { const created = { ...newsForm, id: data.id }; setNewsRows((rows) => [...rows, created]); chooseNews(created); flash("News item added."); } else flash(data.error || "Unable to add news item.", "error");
  }
  async function deleteNews() {
    if (!selectedNews || !window.confirm(`Delete "${selectedNews.title}"?`)) return;
    const response = await fetch(`/api/admin/news/${selectedNews.id}`, { method: "DELETE" });
    if (response.ok) { setNewsRows((rows) => rows.filter((row) => row.id !== selectedNews.id)); chooseNews(null); flash("News item deleted."); } else flash("Unable to delete news item.", "error");
  }

  /* Blog */
  async function chooseBlog(item) {
    setSelectedBlog(item);
    setBlogForm(item ? { ...item } : emptyBlogPost);
    setBlogGallery([]);
    if (item) {
      const response = await fetch(`/api/admin/blog/${item.id}`);
      if (response.ok) { const data = await response.json(); setBlogGallery(data.images || []); }
    }
  }
  async function saveBlog(event) {
    event.preventDefault();
    const response = await fetch(`/api/admin/blog/${selectedBlog.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(blogForm) });
    const data = await response.json();
    if (response.ok) { setBlogRows((rows) => rows.map((row) => row.id === selectedBlog.id ? { ...blogForm, id: selectedBlog.id, slug: data.slug } : row)); flash("Post updated."); } else flash(data.error || "Unable to update post.", "error");
  }
  async function createBlog(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(blogForm) });
    const data = await response.json();
    if (response.ok) { const created = { ...blogForm, id: data.id, slug: data.slug, createdAt: Date.now() }; setBlogRows((rows) => [created, ...rows]); chooseBlog(created); flash("Post created."); } else flash(data.error || "Unable to create post.", "error");
  }
  async function deleteBlog() {
    if (!selectedBlog || !window.confirm(`Delete "${selectedBlog.title}"?`)) return;
    const response = await fetch(`/api/admin/blog/${selectedBlog.id}`, { method: "DELETE" });
    if (response.ok) { setBlogRows((rows) => rows.filter((row) => row.id !== selectedBlog.id)); chooseBlog(null); flash("Post deleted."); } else flash("Unable to delete post.", "error");
  }
  async function uploadBlogCover(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const data = new FormData(); data.append("file", file); data.append("alt", blogForm.title || "Blog cover image");
    const response = await fetch("/api/admin/upload", { method: "POST", body: data }); const result = await response.json();
    if (response.ok) { setBlogForm((form) => ({ ...form, coverImage: result.url })); flash("Cover image uploaded."); } else flash(result.error || "Upload failed.", "error");
  }
  async function uploadBlogGalleryImages(event) {
    const files = Array.from(event.target.files || []); event.target.value = "";
    if (!files.length || !selectedBlog) return;
    for (const file of files) {
      const data = new FormData(); data.append("file", file); data.append("alt", blogForm.title || "Blog image");
      const response = await fetch(`/api/admin/blog/${selectedBlog.id}/images`, { method: "POST", body: data });
      const result = await response.json();
      if (response.ok) setBlogGallery((rows) => [...rows, { id: result.id, url: result.url }]);
      else { flash(result.error || "Image upload failed.", "error"); return; }
    }
    flash(`${files.length > 1 ? "Images" : "Image"} added to gallery.`);
  }
  async function deleteBlogGalleryImage(imageId) {
    if (!selectedBlog) return;
    const response = await fetch(`/api/admin/blog/${selectedBlog.id}/images/${imageId}`, { method: "DELETE" });
    if (response.ok) { setBlogGallery((rows) => rows.filter((row) => row.id !== imageId)); flash("Image removed."); }
    else flash("Unable to remove image.", "error");
  }

  /* Roles & permissions */
  function chooseRole(item) { setSelectedRole(item); setRoleForm(item ? { name: item.name, permissionKeys: item.permissionKeys || [] } : emptyRole); }
  function toggleRolePermission(key) {
    setRoleForm((form) => ({ ...form, permissionKeys: form.permissionKeys.includes(key) ? form.permissionKeys.filter((item) => item !== key) : [...form.permissionKeys, key] }));
  }
  async function createRole(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(roleForm) });
    const data = await response.json();
    if (response.ok) { const created = { ...roleForm, id: data.id, isSystem: false }; setRoleRows((rows) => [...rows, created]); chooseRole(created); flash("Role created."); } else flash(data.error || "Unable to create role.", "error");
  }
  async function saveRole(event) {
    event.preventDefault();
    const response = await fetch(`/api/admin/roles/${selectedRole.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(roleForm) });
    const data = await response.json();
    if (response.ok) { setRoleRows((rows) => rows.map((row) => row.id === selectedRole.id ? { ...row, ...roleForm } : row)); flash("Role updated."); } else flash(data.error || "Unable to update role.", "error");
  }
  async function deleteRole() {
    if (!selectedRole || !window.confirm(`Delete the "${selectedRole.name}" role?`)) return;
    const response = await fetch(`/api/admin/roles/${selectedRole.id}`, { method: "DELETE" });
    const data = await response.json();
    if (response.ok) { setRoleRows((rows) => rows.filter((row) => row.id !== selectedRole.id)); chooseRole(null); flash("Role deleted."); } else flash(data.error || "Unable to delete role.", "error");
  }

  /* Staff users */
  function chooseStaff(item) { setSelectedStaff(item); setStaffForm(item ? { name: item.name, email: item.email, password: "", role: item.role, roleId: item.roleId || "" } : emptyStaffUser); }
  async function createStaff(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(staffForm) });
    const data = await response.json();
    if (response.ok) {
      const created = { id: data.id, name: staffForm.name, email: staffForm.email.toLowerCase().trim(), role: staffForm.role, roleId: staffForm.role === "STAFF" ? staffForm.roleId : null, roleName: roleRows.find((r) => r.id === staffForm.roleId)?.name || null };
      setStaffRows((rows) => [...rows, created]);
      chooseStaff(created);
      flash("User created.");
    } else flash(data.error || "Unable to create user.", "error");
  }
  async function saveStaff(event) {
    event.preventDefault();
    const payload = { name: staffForm.name, role: staffForm.role, roleId: staffForm.roleId };
    if (staffForm.password) payload.newPassword = staffForm.password;
    const response = await fetch(`/api/admin/users/${selectedStaff.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (response.ok) {
      setStaffRows((rows) => rows.map((row) => row.id === selectedStaff.id ? { ...row, name: staffForm.name, role: staffForm.role, roleId: staffForm.role === "STAFF" ? staffForm.roleId : null, roleName: roleRows.find((r) => r.id === staffForm.roleId)?.name || null } : row));
      flash("User updated.");
    } else flash(data.error || "Unable to update user.", "error");
  }
  async function deleteStaff() {
    if (!selectedStaff || !window.confirm(`Delete ${selectedStaff.name}?`)) return;
    const response = await fetch(`/api/admin/users/${selectedStaff.id}`, { method: "DELETE" });
    const data = await response.json();
    if (response.ok) { setStaffRows((rows) => rows.filter((row) => row.id !== selectedStaff.id)); chooseStaff(null); flash("User deleted."); } else flash(data.error || "Unable to delete user.", "error");
  }

  /* Own account */
  async function changeOwnPassword(event) {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return flash("New password and confirmation don't match.", "error");
    const response = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }) });
    const data = await response.json();
    if (response.ok) { setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); flash("Password changed."); } else flash(data.error || "Unable to change password.", "error");
  }
  function chooseMenu(item, groupId) { setSelectedMenu(item); setMenuForm({ ...item, groupId }); }
  async function saveMenu(event) {
    event.preventDefault();
    const response = await fetch(`/api/admin/navigation/${selectedMenu.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(menuForm) });
    if (response.ok) { setNav((current) => ({ ...current, items: current.items.map((item) => item.id === selectedMenu.id ? { ...item, ...menuForm } : item) })); flash("Menu item updated."); } else flash("Unable to update menu item.", "error");
  }
  async function deleteMenu() {
    if (!selectedMenu || !window.confirm(`Delete ${selectedMenu.label}?`)) return;
    const response = await fetch(`/api/admin/navigation/${selectedMenu.id}`, { method: "DELETE" });
    if (response.ok) { setNav((current) => ({ ...current, items: current.items.filter((item) => item.id !== selectedMenu.id) })); setSelectedMenu(null); flash("Menu item deleted."); } else flash("Unable to delete menu item.", "error");
  }
  async function addMenu(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/navigation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(menuForm) }); const data = await response.json();
    if (response.ok) { setNav((current) => ({ ...current, items: [...current.items, { ...menuForm, id: data.id }] })); setMenuForm({ ...menuForm, label: "", href: "", description: "", parentId: "" }); flash("Menu item added."); } else flash(data.error || "Unable to add menu item.", "error");
  }
  async function uploadMenuImage(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const data = new FormData(); data.append("file", file); data.append("alt", menuForm.label || "Category image");
    const response = await fetch("/api/admin/upload", { method: "POST", body: data }); const result = await response.json();
    if (response.ok) { setMenuForm((form) => ({ ...form, image: result.url })); flash("Image uploaded."); } else flash(result.error || "Upload failed.", "error");
  }
  async function addGroup(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const label = form.elements.label.value;
    const response = await fetch("/api/admin/navigation", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label }) }); const data = await response.json();
    if (response.ok) { setNav((current) => ({ ...current, groups: [...current.groups, { id: data.id, label }] })); form.reset(); flash("Navigation group added."); } else flash(data.error || "Unable to add navigation group.", "error");
  }
  async function reorderMenuItems(orderedIds) {
    const updates = orderedIds.map((id, index) => ({ id, sortOrder: index }));
    setNav((current) => ({
      ...current,
      items: current.items.map((item) => {
        const update = updates.find((entry) => entry.id === item.id);
        return update ? { ...item, sortOrder: update.sortOrder } : item;
      }),
    }));
    const response = await fetch("/api/admin/navigation/reorder", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: updates }) });
    if (!response.ok) flash("Unable to save the new order.", "error");
  }

  const unreadEnquiries = enquiryRows.filter((row) => !row.isRead).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const content = active === "overview" ? <Overview stats={stats} enquiries={enquiryRows} onOpen={setActive} /> : active === "pages" ? <PagesPanel pageRows={pageRows} pageForm={pageForm} setPageForm={setPageForm} choosePage={choosePage} savePage={savePage} createPage={createPage} deletePage={deletePage} newPage={newPage} setNewPage={setNewPage} upload={upload} uploadBlockImage={uploadBlockImage} uploadCardImage={uploadCardImage} uploadBlockBackgroundImage={uploadBlockBackgroundImage} /> : active === "navigation" ? <NavigationPanel nav={nav} menuForm={menuForm} setMenuForm={setMenuForm} selectedMenu={selectedMenu} chooseMenu={chooseMenu} saveMenu={saveMenu} addMenu={addMenu} addGroup={addGroup} deleteMenu={deleteMenu} uploadMenuImage={uploadMenuImage} reorderMenuItems={reorderMenuItems} /> : active === "testimonials" ? <TestimonialsPanel testimonialRows={testimonialRows} testimonialForm={testimonialForm} setTestimonialForm={setTestimonialForm} selectedTestimonial={selectedTestimonial} chooseTestimonial={chooseTestimonial} saveTestimonial={saveTestimonial} createTestimonial={createTestimonial} deleteTestimonial={deleteTestimonial} uploadTestimonialAvatar={uploadTestimonialAvatar} /> : active === "banks" ? <BanksPanel bankRows={bankRows} bankForm={bankForm} setBankForm={setBankForm} selectedBank={selectedBank} chooseBank={chooseBank} saveBank={saveBank} createBank={createBank} deleteBank={deleteBank} uploadBankLogo={uploadBankLogo} /> : active === "team" ? <TeamPanel teamRows={teamRows} teamForm={teamForm} setTeamForm={setTeamForm} selectedTeam={selectedTeam} chooseTeam={chooseTeam} saveTeam={saveTeam} createTeam={createTeam} deleteTeam={deleteTeam} uploadTeamPhoto={uploadTeamPhoto} /> : active === "social" ? <SocialLinksPanel socialRows={socialRows} socialForm={socialForm} setSocialForm={setSocialForm} selectedSocial={selectedSocial} chooseSocial={chooseSocial} saveSocial={saveSocial} createSocial={createSocial} deleteSocial={deleteSocial} /> : active === "media" ? <MediaPanel /> : active === "news" ? <NewsPanel newsRows={newsRows} newsForm={newsForm} setNewsForm={setNewsForm} selectedNews={selectedNews} chooseNews={chooseNews} saveNews={saveNews} createNews={createNews} deleteNews={deleteNews} /> : active === "blog" ? <BlogPanel blogRows={blogRows} blogForm={blogForm} setBlogForm={setBlogForm} selectedBlog={selectedBlog} chooseBlog={chooseBlog} saveBlog={saveBlog} createBlog={createBlog} deleteBlog={deleteBlog} uploadBlogCover={uploadBlogCover} blogGallery={blogGallery} uploadBlogGalleryImages={uploadBlogGalleryImages} deleteBlogGalleryImage={deleteBlogGalleryImage} /> : active === "enquiries" ? <EnquiriesPanel enquiryRows={enquiryRows} selectedEnquiryIds={selectedEnquiryIds} toggleEnquirySelect={toggleEnquirySelect} toggleEnquirySelectAllOnPage={toggleEnquirySelectAllOnPage} deleteSelectedEnquiries={deleteSelectedEnquiries} markEnquiryRead={markEnquiryRead} enquiryPage={enquiryPage} setEnquiryPage={setEnquiryPage} expandedEnquiryId={expandedEnquiryId} setExpandedEnquiryId={setExpandedEnquiryId} /> : active === "users" ? <UsersPanel staffRows={staffRows} staffForm={staffForm} setStaffForm={setStaffForm} selectedStaff={selectedStaff} chooseStaff={chooseStaff} saveStaff={saveStaff} createStaff={createStaff} deleteStaff={deleteStaff} roleRows={roleRows} /> : active === "roles" ? <RolesPanel roleRows={roleRows} roleForm={roleForm} setRoleForm={setRoleForm} selectedRole={selectedRole} chooseRole={chooseRole} saveRole={saveRole} createRole={createRole} deleteRole={deleteRole} toggleRolePermission={toggleRolePermission} permissionCatalog={permissionCatalog || []} /> : <AccountPanel session={session} passwordForm={passwordForm} setPasswordForm={setPasswordForm} changeOwnPassword={changeOwnPassword} />;

  return <main className="min-h-screen bg-paper-dim text-ink"><aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-ink text-paper md:flex md:flex-col"><div className="px-7 py-7 border-b border-paper/10"><p className="font-serif text-2xl">Zuess</p><p className="text-[11px] tracking-[0.18em] uppercase text-paper/45 mt-2">Admin workspace</p></div><nav className="p-4 space-y-1 flex-1 overflow-y-auto min-h-0">{visibleSections.map(([id, label, Icon]) => <button key={id} onClick={() => setActive(id)} className={`w-full flex items-center gap-3 px-3 py-3 text-sm text-left transition-colors ${active === id ? "bg-emerald text-paper" : "text-paper/65 hover:bg-paper/10 hover:text-paper"}`}><Icon size={16} />{label}</button>)}</nav><div className="p-5 border-t border-paper/10"><p className="text-sm truncate">{session.name}</p><p className="text-xs text-paper/45 mt-1">{session.roleName || session.role}</p><button onClick={logout} className="mt-4 flex items-center gap-2 text-sm text-paper/60 hover:text-paper"><LogOut size={15} /> Sign out</button></div></aside><div className="md:pl-64"><header className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-line"><div className="px-6 md:px-10 py-5 flex items-center justify-between"><div><p className="text-emerald text-xs font-medium uppercase tracking-[0.16em]">Zuess / {active}</p><h1 className="font-serif text-3xl mt-1">{active === "overview" ? "Overview" : visibleSections.find((item) => item[0] === active)?.[1]}</h1></div><div className="relative"><button type="button" onClick={() => setNotifOpen((v) => !v)} aria-label="Notifications" className="relative flex items-center justify-center w-10 h-10 border border-line text-charcoal/70 hover:text-emerald hover:border-emerald transition-colors"><Bell size={18} />{unreadEnquiries.length > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-emerald text-paper text-[10px] leading-none">{unreadEnquiries.length}</span>}</button>{notifOpen && <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-paper border border-line shadow-lg z-50"><div className="px-4 py-3 border-b border-line text-xs uppercase tracking-[0.12em] text-charcoal/50">Unread enquiries</div>{unreadEnquiries.length === 0 ? <p className="px-4 py-6 text-sm text-charcoal/50">You're all caught up.</p> : unreadEnquiries.slice(0, 20).map((item) => <button key={item.id} onClick={() => openEnquiryFromNotification(item.id)} className="w-full text-left px-4 py-3 border-b border-line hover:bg-emerald/5"><span className="flex items-center gap-2 text-sm font-medium text-ink"><span className="w-1.5 h-1.5 rounded-full bg-emerald shrink-0" />{item.name}</span><span className="block text-xs text-charcoal/50 mt-1">{item.service}</span><span className="block text-xs text-charcoal/60 mt-1 line-clamp-2">{item.message}</span></button>)}</div>}</div></div></header><div className="md:hidden flex gap-1 overflow-x-auto bg-ink px-4 py-3">{visibleSections.map(([id, label]) => <button key={id} onClick={() => setActive(id)} className={`px-3 py-2 text-xs whitespace-nowrap ${active === id ? "bg-emerald text-paper" : "text-paper/70"}`}>{label}</button>)}</div><div className="p-6 md:p-10 max-w-[1400px]">{content}</div></div>{message && <div role="status" aria-live="polite" className={`fixed right-5 top-5 z-[70] max-w-sm border px-5 py-4 text-sm shadow-lg ${messageType === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald/30 bg-emerald text-paper"}`}>{message}</div>}</main>;
}

function Overview({ stats, enquiries, onOpen }) { return <><div className="grid sm:grid-cols-3 gap-px bg-line mb-10">{[["Total enquiries", stats.total], ["New to review", stats.newCount], ["This month", stats.thisMonth]].map(([label, value]) => <div key={label} className="bg-paper p-6"><p className="font-serif text-3xl text-emerald">{value}</p><p className="text-sm text-charcoal/60 mt-2">{label}</p></div>)}</div><div className="bg-paper p-7"><p className="text-emerald text-sm font-medium">Quick actions</p><div className="flex flex-wrap gap-3 mt-5"><button onClick={() => onOpen("pages")} className="inline-flex items-center gap-2 bg-emerald text-paper px-4 py-3 text-sm"><FileText size={15} /> Manage pages</button><button onClick={() => onOpen("navigation")} className="inline-flex items-center gap-2 border border-line px-4 py-3 text-sm"><FolderTree size={15} /> Edit navigation</button><button onClick={() => onOpen("enquiries")} className="inline-flex items-center gap-2 border border-line px-4 py-3 text-sm"><Inbox size={15} /> Open enquiries</button></div></div><div className="mt-8 bg-paper p-7"><h2 className="font-serif text-2xl">Latest enquiries</h2><p className="text-sm text-charcoal/60 mt-2">{enquiries.length ? `${enquiries.length} enquiries are available in the inbox.` : "No enquiries yet."}</p></div></>; }

function PagesPanel({ pageRows, pageForm, setPageForm, choosePage, savePage, createPage, deletePage, newPage, setNewPage, upload, uploadBlockImage, uploadCardImage, uploadBlockBackgroundImage }) { return <div className="grid xl:grid-cols-[240px_1fr] gap-8"><div className="bg-paper p-5 h-fit"><div className="flex items-center justify-between mb-4"><h2 className="font-serif text-xl">Pages</h2><Plus size={17} className="text-emerald" /></div>{pageRows.map((page) => <button key={page.id} onClick={() => choosePage(page)} className={`w-full text-left px-3 py-3 text-sm border-b border-line ${page.id === pageForm.id ? "text-emerald bg-emerald/5" : "text-charcoal/70"}`}>{page.slug}</button>)}<form onSubmit={createPage} className="border-t border-line mt-4 pt-4 space-y-2"><input required placeholder="new-page-slug" value={newPage.slug} onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })} className="w-full border border-line px-3 py-2 text-xs" /><input required placeholder="Page title" value={newPage.title} onChange={(e) => setNewPage({ ...newPage, title: e.target.value })} className="w-full border border-line px-3 py-2 text-xs" /><button className="w-full bg-emerald text-paper py-2 text-xs">Add page</button></form></div>{pageForm.id && <form onSubmit={savePage} className="bg-paper p-7 space-y-5"><div className="flex items-start justify-between"><div><p className="text-emerald text-sm">Editing /{pageForm.slug}</p><h2 className="font-serif text-3xl mt-1">Page content</h2></div><button type="button" onClick={deletePage} className="inline-flex items-center gap-2 text-red-700 text-sm"><Trash2 size={15} /> Delete</button></div><div className="grid sm:grid-cols-2 gap-4"><Field label="Title" value={pageForm.title} onChange={(value) => setPageForm({ ...pageForm, title: value })} /><Field label="Subtitle" value={pageForm.subtitle || ""} onChange={(value) => setPageForm({ ...pageForm, subtitle: value })} /></div><Field label="Description" value={pageForm.description || ""} onChange={(value) => setPageForm({ ...pageForm, description: value })} textarea />{pageForm.slug !== "home" && <><Field label="Hero image URL" value={pageForm.heroImage || ""} onChange={(value) => setPageForm({ ...pageForm, heroImage: value })} /><label className="inline-flex items-center gap-2 text-sm text-emerald cursor-pointer"><Upload size={15} /> Upload banner image<input type="file" accept="image/*" onChange={upload} className="hidden" /></label></>}<BlockEditor content={pageForm.content} setContent={(content) => setPageForm({ ...pageForm, content })} uploadBlockImage={uploadBlockImage} uploadCardImage={uploadCardImage} uploadBlockBackgroundImage={uploadBlockBackgroundImage} /><button className="inline-flex items-center gap-2 bg-emerald text-paper px-5 py-3 text-sm"><Save size={15} /> Save changes</button></form>}</div>; }

function BlockEditor({ content, setContent, uploadBlockImage, uploadCardImage, uploadBlockBackgroundImage }) {
  const blocks = Array.isArray(content) ? content : [];

  function update(index, patch) {
    setContent(blocks.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function updateBackground(index, patch) {
    const current = blocks[index]?.background || {};
    update(index, { background: { ...current, ...patch } });
  }

  function addBlock(type = "split") {
    if (type === "banner") {
      setContent([
        ...blocks,
        {
          type: "banner",
          kicker: "Chartered Accountants · Bengaluru",
          heading: "Numbers you can build decisions on.",
          text: "Taxation, audit, compliance and advisory handled by one practice.",
          image: "",
          images: [],
        },
      ]);
    } else if (type === "stats") {
      setContent([
        ...blocks,
        {
          type: "stats",
          kicker: "Key Numbers",
          heading: "A practice built for follow-through",
          text: "Stat highlights",
          statItems: [
            { value: "18", suffix: "+", label: "Years in practice" },
            { value: "640", suffix: "+", label: "Clients served" },
            { value: "3200", suffix: "+", label: "Returns filed last year" },
            { value: "99", suffix: "%", label: "Filings ahead of deadline" },
          ],
        },
      ]);
    } else if (type === "features") {
      setContent([
        ...blocks,
        { type: "features", kicker: "Features & Benefits", heading: "Why choose this service", text: "", items: [{ icon: "check", title: "Benefit one", description: "" }] },
      ]);
    } else if (type === "eligibility") {
      setContent([
        ...blocks,
        { type: "eligibility", kicker: "Eligibility Criteria", heading: "Discover the key factors that determine your eligibility", text: "", items: [{ icon: "badge", title: "Requirement one", description: "" }] },
      ]);
    } else if (type === "checklist") {
      setContent([
        ...blocks,
        { type: "checklist", kicker: "Checklist", heading: "Documents Checklist", text: "", items: [{ title: "Identity Proof", description: "" }] },
      ]);
    } else if (type === "faq") {
      setContent([
        ...blocks,
        { type: "faq", kicker: "FAQ", heading: "Frequently Asked Questions", text: "", items: [{ title: "What is this service?", description: "" }] },
      ]);
    } else {
      setContent([...blocks, { type: "split", kicker: "New section", heading: "Section heading", text: "Add your section description.", image: "" }]);
    }
  }

  function removeBlock(index) {
    setContent(blocks.filter((_, itemIndex) => itemIndex !== index));
  }

  /* Multi-image helpers for banner */
  async function uploadAdditionalImage(event, blockIndex) {
    const file = event.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("alt", "Banner slide image");
    const response = await fetch("/api/admin/upload", { method: "POST", body: data });
    const result = await response.json();
    if (!response.ok) return alert(result.error || "Upload failed");
    const currentImages = Array.isArray(blocks[blockIndex].images) ? [...blocks[blockIndex].images] : [];
    update(blockIndex, { images: [...currentImages, result.url] });
  }

  function removeAdditionalImage(blockIndex, imgIndex) {
    const currentImages = Array.isArray(blocks[blockIndex].images) ? [...blocks[blockIndex].images] : [];
    update(
      blockIndex,
      { images: currentImages.filter((_, idx) => idx !== imgIndex) }
    );
  }

  function addImageInput(blockIndex) {
    const currentImages = Array.isArray(blocks[blockIndex].images) ? [...blocks[blockIndex].images] : [];
    update(blockIndex, { images: [...currentImages, ""] });
  }

  function updateImageInput(blockIndex, imgIndex, val) {
    const currentImages = Array.isArray(blocks[blockIndex].images) ? [...blocks[blockIndex].images] : [];
    currentImages[imgIndex] = val;
    update(blockIndex, { images: currentImages });
  }

  /* Itemized stats helpers */
  function addStatItem(blockIndex) {
    const items = Array.isArray(blocks[blockIndex].statItems) ? [...blocks[blockIndex].statItems] : [];
    update(blockIndex, { statItems: [...items, { value: "100", suffix: "+", label: "New Stat" }] });
  }

  function updateStatItem(blockIndex, statIndex, patch) {
    const items = Array.isArray(blocks[blockIndex].statItems) ? [...blocks[blockIndex].statItems] : [];
    items[statIndex] = { ...items[statIndex], ...patch };
    update(blockIndex, { statItems: items });
  }

  function removeStatItem(blockIndex, statIndex) {
    const items = Array.isArray(blocks[blockIndex].statItems) ? [...blocks[blockIndex].statItems] : [];
    update(blockIndex, { statItems: items.filter((_, idx) => idx !== statIndex) });
  }

  /* Cards / feature grid: repeatable card items, each with its own image, title and description */
  function addCardItem(blockIndex) {
    const cards = Array.isArray(blocks[blockIndex].cards) ? [...blocks[blockIndex].cards] : [];
    update(blockIndex, { cards: [...cards, { image: "", title: "New card", description: "" }] });
  }

  function updateCardItem(blockIndex, cardIndex, patch) {
    const cards = Array.isArray(blocks[blockIndex].cards) ? [...blocks[blockIndex].cards] : [];
    cards[cardIndex] = { ...cards[cardIndex], ...patch };
    update(blockIndex, { cards });
  }

  function removeCardItem(blockIndex, cardIndex) {
    const cards = Array.isArray(blocks[blockIndex].cards) ? [...blocks[blockIndex].cards] : [];
    update(blockIndex, { cards: cards.filter((_, idx) => idx !== cardIndex) });
  }

  /* Shared repeatable-item editor for Features & Benefits / Eligibility Criteria / Documents Checklist / FAQ */
  function addListItem(blockIndex) {
    const items = Array.isArray(blocks[blockIndex].items) ? [...blocks[blockIndex].items] : [];
    update(blockIndex, { items: [...items, { icon: "check", title: "New item", description: "" }] });
  }

  function updateListItem(blockIndex, itemIndex, patch) {
    const items = Array.isArray(blocks[blockIndex].items) ? [...blocks[blockIndex].items] : [];
    items[itemIndex] = { ...items[itemIndex], ...patch };
    update(blockIndex, { items });
  }

  function removeListItem(blockIndex, itemIndex) {
    const items = Array.isArray(blocks[blockIndex].items) ? [...blocks[blockIndex].items] : [];
    update(blockIndex, { items: items.filter((_, idx) => idx !== itemIndex) });
  }

  return (
    <div className="border-t border-line pt-5 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink">Page Sections & Content Blocks</p>
          <p className="text-xs text-charcoal/55 mt-1">Add banner slides, stats counter strips, or custom page sections.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => addBlock("banner")} className="inline-flex items-center gap-1.5 bg-emerald text-paper px-3.5 py-2 text-xs font-medium rounded-sm hover:bg-emerald-dark transition-colors">
            <Plus size={14} /> Add Banner Slide
          </button>
          <button type="button" onClick={() => addBlock("stats")} className="inline-flex items-center gap-1.5 border border-emerald text-emerald bg-emerald/5 px-3.5 py-2 text-xs font-medium rounded-sm hover:bg-emerald/10 transition-colors">
            <Plus size={14} /> Add Counter Stats
          </button>
          <button type="button" onClick={() => addBlock("split")} className="inline-flex items-center gap-1.5 border border-line text-ink px-3.5 py-2 text-xs font-medium rounded-sm hover:border-ink transition-colors">
            <Plus size={14} /> Add Section
          </button>
          <button type="button" onClick={() => addBlock("features")} className="inline-flex items-center gap-1.5 border border-line text-ink px-3.5 py-2 text-xs font-medium rounded-sm hover:border-ink transition-colors">
            <Plus size={14} /> Add Features & Benefits
          </button>
          <button type="button" onClick={() => addBlock("eligibility")} className="inline-flex items-center gap-1.5 border border-line text-ink px-3.5 py-2 text-xs font-medium rounded-sm hover:border-ink transition-colors">
            <Plus size={14} /> Add Eligibility Criteria
          </button>
          <button type="button" onClick={() => addBlock("checklist")} className="inline-flex items-center gap-1.5 border border-line text-ink px-3.5 py-2 text-xs font-medium rounded-sm hover:border-ink transition-colors">
            <Plus size={14} /> Add Documents Checklist
          </button>
          <button type="button" onClick={() => addBlock("faq")} className="inline-flex items-center gap-1.5 border border-line text-ink px-3.5 py-2 text-xs font-medium rounded-sm hover:border-ink transition-colors">
            <Plus size={14} /> Add FAQ
          </button>
        </div>
      </div>

      {blocks.length === 0 && (
        <div className="border border-dashed border-line p-6 text-center text-sm text-charcoal/55 rounded-sm">
          No sections added yet. Click <strong>"+ Add Banner Slide"</strong> or <strong>"+ Add Counter Stats"</strong> above to start adding content.
        </div>
      )}

      {blocks.map((block, index) => {
        const isBanner = block.type === "banner";
        const isStats = block.type === "stats";
        const isCards = block.type === "cards";
        const isFeatures = block.type === "features";
        const isEligibility = block.type === "eligibility";
        const isChecklist = block.type === "checklist";
        const isFaq = block.type === "faq";
        const isItemsBlock = isFeatures || isEligibility || isChecklist || isFaq;
        const isSplit = block.type === "split";
        const isRichText = block.type === "richText";
        const supportsCardStyle = isSplit || isRichText;
        const cardItems = Array.isArray(block.cards) ? block.cards : [];
        const listItems = Array.isArray(block.items) ? block.items : [];
        const statItems = Array.isArray(block.statItems)
          ? block.statItems
          : block.heading && block.text && isStats
          ? block.heading.split("|").map((val, idx) => {
              const label = block.text.split("|")[idx] || "";
              const match = val.trim().match(/^(\d+)(.*)$/);
              return { value: match ? match[1] : val, suffix: match ? match[2] : "", label: label.trim() };
            })
          : [];

        const slideImages = Array.isArray(block.images) ? block.images : [];

        return (
          <div key={index} className={`border rounded-sm p-5 space-y-4 ${isBanner ? "border-emerald/40 bg-emerald/5" : isStats ? "border-amber-400/40 bg-amber-500/5" : "border-line bg-paper"}`}>
            {/* Header with Remove Section Button */}
            <div className="flex items-center justify-between pb-3 border-b border-line/60">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald flex items-center gap-2">
                Section {index + 1} {isBanner ? "— 🎠 Home Banner Slide" : isStats ? "— 📊 Counter Stats Strip" : isCards ? "— 🗂️ Cards / Feature Grid" : isFeatures ? "— ✅ Features & Benefits" : isEligibility ? "— 🛡️ Eligibility Criteria" : isChecklist ? "— 📋 Documents Checklist" : isFaq ? "— ❓ FAQ" : ""}
              </span>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-sm transition-colors"
                title="Remove this section"
              >
                <Trash2 size={13} /> Remove Section
              </button>
            </div>

            <label className="block text-xs text-charcoal/60">
              Design / Type
              <select value={block.type || "richText"} onChange={(event) => update(index, { type: event.target.value })} className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm">
                <option value="banner">🎠 Sliding home banner</option>
                <option value="stats">📊 Stats highlight (Counter)</option>
                <option value="richText">Rich text</option>
                <option value="split">Image and text split</option>
                <option value="cards">Cards / feature grid</option>
                <option value="features">✅ Features & Benefits</option>
                <option value="eligibility">🛡️ Eligibility Criteria</option>
                <option value="checklist">📋 Documents Checklist</option>
                <option value="faq">❓ FAQ</option>
                <option value="quote">Pull quote</option>
                <option value="contact">Contact form</option>
              </select>
            </label>

            {/* SECTION BACKGROUND: colour, gradient, image, overlay & opacity — applies to every section type */}
            <div className="border-t border-line/60 pt-4 space-y-3">
              <p className="text-xs font-medium text-ink">Section Background</p>
              <label className="block text-xs text-charcoal/60">
                Background Type
                <select value={block.background?.type || "none"} onChange={(e) => updateBackground(index, { type: e.target.value })} className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm">
                  <option value="none">None (default styling)</option>
                  <option value="color">Solid colour (full width)</option>
                  <option value="gradient">Gradient</option>
                  <option value="image">Background image</option>
                </select>
              </label>

              {block.background?.type === "color" && (
                <label className="flex items-center gap-2 text-xs text-charcoal/60">
                  Background Colour
                  <input type="color" value={block.background?.color || "#ffffff"} onChange={(e) => updateBackground(index, { color: e.target.value })} className="h-8 w-14 border border-line rounded-sm cursor-pointer" />
                </label>
              )}

              {block.background?.type === "gradient" && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-xs text-charcoal/60">
                    From
                    <input type="color" value={block.background?.gradientFrom || "#ffffff"} onChange={(e) => updateBackground(index, { gradientFrom: e.target.value })} className="h-8 w-14 border border-line rounded-sm cursor-pointer" />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-charcoal/60">
                    To
                    <input type="color" value={block.background?.gradientTo || "#000000"} onChange={(e) => updateBackground(index, { gradientTo: e.target.value })} className="h-8 w-14 border border-line rounded-sm cursor-pointer" />
                  </label>
                  <label className="col-span-2 block text-xs text-charcoal/60">
                    Direction
                    <select value={block.background?.gradientDirection || "to bottom right"} onChange={(e) => updateBackground(index, { gradientDirection: e.target.value })} className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm">
                      <option value="to right">Left → Right</option>
                      <option value="to left">Right → Left</option>
                      <option value="to bottom">Top → Bottom</option>
                      <option value="to top">Bottom → Top</option>
                      <option value="to bottom right">Top-left → Bottom-right</option>
                      <option value="to bottom left">Top-right → Bottom-left</option>
                      <option value="to top right">Bottom-left → Top-right</option>
                      <option value="to top left">Bottom-right → Top-left</option>
                    </select>
                  </label>
                </div>
              )}

              {block.background?.type === "image" && (
                <>
                  <Field label="Background Image URL" value={block.background?.image || ""} onChange={(value) => updateBackground(index, { image: value })} />
                  <label className="inline-flex items-center gap-1.5 text-xs text-emerald cursor-pointer hover:underline">
                    <Upload size={14} /> Upload background image
                    <input type="file" accept="image/*" onChange={(event) => uploadBlockBackgroundImage(event, index)} className="hidden" />
                  </label>
                </>
              )}

              {(block.background?.type === "gradient" || block.background?.type === "image" || block.background?.type === "color") && (
                <div className="grid grid-cols-2 gap-3 items-end pt-1">
                  <label className="flex items-center gap-2 text-xs text-charcoal/60">
                    Overlay Colour
                    <input type="color" value={block.background?.overlayColor || "#000000"} onChange={(e) => updateBackground(index, { overlayColor: e.target.value })} className="h-8 w-14 border border-line rounded-sm cursor-pointer" />
                  </label>
                  <label className="block text-xs text-charcoal/60">
                    Overlay Opacity ({block.background?.overlayOpacity ?? 0}%)
                    <input type="range" min="0" max="100" value={block.background?.overlayOpacity ?? 0} onChange={(e) => updateBackground(index, { overlayOpacity: Number(e.target.value) })} className="mt-1 w-full" />
                  </label>
                </div>
              )}

              {block.background?.type && block.background.type !== "none" && (
                <button type="button" onClick={() => update(index, { background: { type: "none" } })} className="text-[11px] text-red-700 hover:underline">
                  Reset background to default
                </button>
              )}
            </div>

            {/* Standard Text Fields */}
            {!isStats && (
              <>
                <Field
                  label={isBanner ? "Banner Slide Headline / Title" : "Section Title"}
                  value={block.heading || ""}
                  onChange={(value) => update(index, { heading: value })}
                />
                <Field
                  label={isBanner ? "Banner Subtitle / Kicker (e.g. Chartered Accountants · Bengaluru)" : "Section Subtitle / Kicker"}
                  value={block.kicker || ""}
                  onChange={(value) => update(index, { kicker: value })}
                />
                <Field
                  label={isBanner ? "Banner Description Text" : "Section Description"}
                  value={block.text || ""}
                  onChange={(value) => update(index, { text: value })}
                  textarea
                />
                {(isFeatures || isEligibility) && (
                  <label className="block text-xs text-charcoal/60">
                    Items Design
                    <select value={block.layout || "columns"} onChange={(event) => update(index, { layout: event.target.value })} className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm">
                      <option value="columns">Columns</option>
                      <option value="rows">Vertical rows</option>
                    </select>
                  </label>
                )}
              </>
            )}

            {/* BANNER SPECIFIC: Multiple Images Section */}
            {isBanner && (
              <div className="border-t border-line/60 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink">Slide Images (Multiple allowed)</p>
                  <button type="button" onClick={() => addImageInput(index)} className="inline-flex items-center gap-1 text-xs text-emerald border border-emerald px-2 py-1 rounded-sm">
                    <Plus size={12} /> Add Image Slot
                  </button>
                </div>

                {/* Main Slide Image */}
                <div className="border border-line/70 p-3 rounded-sm space-y-2 bg-paper">
                  <p className="text-[11px] font-semibold text-emerald">Primary Image</p>
                  <Field label="Image URL" value={block.image || ""} onChange={(value) => update(index, { image: value })} />
                  <div className="flex items-center justify-between pt-1">
                    <label className="inline-flex items-center gap-1.5 text-xs text-emerald cursor-pointer hover:underline">
                      <Upload size={14} /> Upload Primary Image
                      <input type="file" accept="image/*" onChange={(event) => uploadBlockImage(event, index)} className="hidden" />
                    </label>
                    {block.image && (
                      <button type="button" onClick={() => update(index, { image: "" })} className="inline-flex items-center gap-1 text-xs text-red-700 hover:underline">
                        <Trash2 size={12} /> Clear Primary Image
                      </button>
                    )}
                  </div>
                </div>

                {/* Additional Images for Slide Carousel */}
                {slideImages.map((imgUrl, imgIdx) => (
                  <div key={imgIdx} className="border border-line/70 p-3 rounded-sm space-y-2 bg-paper">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-charcoal/70">Additional Slide Image #{imgIdx + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index, imgIdx)}
                        className="inline-flex items-center gap-1 text-xs text-red-700 hover:bg-red-50 px-2 py-0.5 rounded-sm border border-red-200"
                      >
                        <Trash2 size={12} /> Remove Image
                      </button>
                    </div>
                    <Field label="Image URL" value={typeof imgUrl === "string" ? imgUrl : imgUrl?.url || ""} onChange={(value) => updateImageInput(index, imgIdx, value)} />
                  </div>
                ))}

                <label className="inline-flex items-center gap-1.5 text-xs text-emerald border border-emerald px-3 py-1.5 rounded-sm cursor-pointer hover:bg-emerald/5">
                  <Upload size={14} /> Upload New Slide Image
                  <input type="file" accept="image/*" onChange={(event) => uploadAdditionalImage(event, index)} className="hidden" />
                </label>
              </div>
            )}

            {/* COUNTER STATS SPECIFIC: Itemized Counter Editor */}
            {isStats && (
              <div className="border-t border-line/60 pt-4 space-y-3">
                <Field label="Section Header Title (Optional)" value={block.heading || ""} onChange={(value) => update(index, { heading: value })} />
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs font-medium text-ink">Counter Stat Items (Multiple allowed)</p>
                  <button type="button" onClick={() => addStatItem(index)} className="inline-flex items-center gap-1 text-xs text-emerald border border-emerald px-2 py-1 rounded-sm">
                    <Plus size={12} /> Add Counter Stat
                  </button>
                </div>

                <div className="space-y-3">
                  {statItems.map((stat, statIdx) => (
                    <div key={statIdx} className="border border-line/70 p-3 rounded-sm bg-paper grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] text-charcoal/60">Number</label>
                        <input
                          type="text"
                          placeholder="18"
                          value={stat.value || ""}
                          onChange={(e) => updateStatItem(index, statIdx, { value: e.target.value })}
                          className="mt-1 w-full border border-line px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-charcoal/60">Suffix</label>
                        <input
                          type="text"
                          placeholder="+"
                          value={stat.suffix || ""}
                          onChange={(e) => updateStatItem(index, statIdx, { suffix: e.target.value })}
                          className="mt-1 w-full border border-line px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald font-mono"
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] text-charcoal/60">Label Description</label>
                        <input
                          type="text"
                          placeholder="Years in practice"
                          value={stat.label || ""}
                          onChange={(e) => updateStatItem(index, statIdx, { label: e.target.value })}
                          className="mt-1 w-full border border-line px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={() => removeStatItem(index, statIdx)}
                          className="w-full inline-flex items-center justify-center gap-1 text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 py-1.5 rounded-sm transition-colors"
                          title="Remove this stat"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OTHER SECTIONS: Single Image Field */}
            {!isBanner && !isStats && !isItemsBlock && (
              <>
                <Field label="Section image URL" value={block.image || ""} onChange={(value) => update(index, { image: value })} />
                <label className="inline-flex items-center gap-2 text-xs text-emerald cursor-pointer hover:underline">
                  <Upload size={14} /> Upload section image
                  <input type="file" accept="image/*" onChange={(event) => uploadBlockImage(event, index)} className="hidden" />
                </label>
              </>
            )}

            {/* SPLIT / RICH TEXT SPECIFIC: optional card presentation */}
            {supportsCardStyle && (
              <label className="block text-xs text-charcoal/60">
                Card Style
                <select value={block.cardStyle || "none"} onChange={(e) => update(index, { cardStyle: e.target.value })} className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm">
                  <option value="none">None (plain section)</option>
                  <option value="border">Bordered card</option>
                  <option value="shadow">Shadow card</option>
                  <option value="3d">3D card (border + shadow + hover lift)</option>
                </select>
              </label>
            )}

            {/* CARDS SPECIFIC: Repeatable Card Items, each with its own image, title & description */}
            {isCards && (
              <div className="border-t border-line/60 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink">Cards (each with its own image, title & description)</p>
                  <button type="button" onClick={() => addCardItem(index)} className="inline-flex items-center gap-1 text-xs text-emerald border border-emerald px-2 py-1 rounded-sm">
                    <Plus size={12} /> Add Card
                  </button>
                </div>

                {cardItems.length === 0 && (
                  <p className="text-xs text-charcoal/50 border border-dashed border-line p-3 rounded-sm">
                    No cards added yet. Without cards, this section shows the live services list instead (as used on the Services page). Click "+ Add Card" to build a custom feature grid here.
                  </p>
                )}

                <div className="space-y-3">
                  {cardItems.map((card, cardIdx) => (
                    <div key={cardIdx} className="border border-line/70 p-3 rounded-sm bg-paper space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-charcoal/70">Card {cardIdx + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeCardItem(index, cardIdx)}
                          className="inline-flex items-center gap-1 text-xs text-red-700 hover:bg-red-50 px-2 py-0.5 rounded-sm border border-red-200"
                        >
                          <Trash2 size={12} /> Remove Card
                        </button>
                      </div>
                      <Field label="Card Title" value={card.title || ""} onChange={(value) => updateCardItem(index, cardIdx, { title: value })} errorMessage={!card.title || !card.title.trim() ? "Title is required." : ""} />
                      <Field label="Card Description" value={card.description || ""} onChange={(value) => updateCardItem(index, cardIdx, { description: value })} textarea />
                      <Field label="Card Image URL" value={card.image || ""} onChange={(value) => updateCardItem(index, cardIdx, { image: value })} />
                      <label className="inline-flex items-center gap-1.5 text-xs text-emerald cursor-pointer hover:underline">
                        <Upload size={14} /> Upload Card Image
                        <input type="file" accept="image/*" onChange={(event) => uploadCardImage(event, index, cardIdx)} className="hidden" />
                      </label>
                      <label className="flex items-center gap-2 text-xs text-charcoal/60">
                        Card Background Colour
                        <input type="color" value={card.bgColor || "#ffffff"} onChange={(e) => updateCardItem(index, cardIdx, { bgColor: e.target.value })} className="h-8 w-14 border border-line rounded-sm cursor-pointer" />
                        {card.bgColor && (
                          <button type="button" onClick={() => updateCardItem(index, cardIdx, { bgColor: "" })} className="text-[11px] text-red-700 hover:underline">
                            Reset to default
                          </button>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FEATURES / ELIGIBILITY / CHECKLIST / FAQ: shared repeatable item editor */}
            {isItemsBlock && (
              <div className="border-t border-line/60 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink">{isFaq ? "Questions & Answers" : "Items (icon, title & description)"}</p>
                  <button type="button" onClick={() => addListItem(index)} className="inline-flex items-center gap-1 text-xs text-emerald border border-emerald px-2 py-1 rounded-sm">
                    <Plus size={12} /> {isFaq ? "Add Question" : "Add Item"}
                  </button>
                </div>

                {listItems.length === 0 && (
                  <p className="text-xs text-charcoal/50 border border-dashed border-line p-3 rounded-sm">
                    No items yet. Click "+ Add {isFaq ? "Question" : "Item"}" above to build this section.
                  </p>
                )}

                <div className="space-y-3">
                  {listItems.map((item, itemIdx) => (
                    <div key={itemIdx} className="border border-line/70 p-3 rounded-sm bg-paper space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-charcoal/70">{isFaq ? `Question ${itemIdx + 1}` : `Item ${itemIdx + 1}`}</p>
                        <button
                          type="button"
                          onClick={() => removeListItem(index, itemIdx)}
                          className="inline-flex items-center gap-1 text-xs text-red-700 hover:bg-red-50 px-2 py-0.5 rounded-sm border border-red-200"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                      {!isFaq && (
                        <label className="block text-xs text-charcoal/60">
                          Icon
                          <select value={item.icon || "check"} onChange={(e) => updateListItem(index, itemIdx, { icon: e.target.value })} className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm">
                            {BLOCK_ICON_OPTIONS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                          </select>
                        </label>
                      )}
                      <Field
                        label={isFaq ? "Question" : "Title"}
                        value={item.title || ""}
                        onChange={(value) => updateListItem(index, itemIdx, { title: value })}
                        errorMessage={!item.title || !item.title.trim() ? (isFaq ? "Question is required." : "Title is required.") : ""}
                      />
                      <Field label={isFaq ? "Answer" : "Description"} value={item.description || ""} onChange={(value) => updateListItem(index, itemIdx, { description: value })} textarea />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NavigationPanel({ nav, menuForm, setMenuForm, selectedMenu, chooseMenu, saveMenu, addMenu, addGroup, deleteMenu, uploadMenuImage, reorderMenuItems }) {
  const isEditingGroup = selectedMenu && nav.groups.some((g) => g.id === selectedMenu.id);
  const dragItemRef = useRef(null);
  const [dragOverId, setDragOverId] = useState(null);

  function resetForm() {
    chooseMenu(null, nav.groups[0]?.id || "");
    setMenuForm({ label: "", href: "", description: "", parentId: "", groupId: nav.groups[0]?.id || "", sortOrder: 0 });
  }

  /* Render recursive tree items. Siblings (same groupId + parentId) are drag-reorderable;
     dropping one item onto another swaps their positions and persists via reorderMenuItems. */
  function renderTree(items, groupId, parentId = null, depth = 0) {
    const matching = items
      .filter((item) => item.groupId === groupId && (item.parentId === parentId || (!parentId && !item.parentId)))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    if (!matching.length) return null;

    function handleDrop(targetItem) {
      const dragged = dragItemRef.current;
      dragItemRef.current = null;
      setDragOverId(null);
      if (!dragged || dragged.groupId !== groupId || dragged.parentId !== parentId || dragged.id === targetItem.id) return;
      const orderedIds = matching.map((entry) => entry.id);
      const fromIndex = orderedIds.indexOf(dragged.id);
      const toIndex = orderedIds.indexOf(targetItem.id);
      if (fromIndex === -1 || toIndex === -1) return;
      orderedIds.splice(toIndex, 0, orderedIds.splice(fromIndex, 1)[0]);
      reorderMenuItems(orderedIds);
    }

    return (
      <div className={`space-y-1.5 ${depth > 0 ? "ml-4 border-l border-line/70 pl-3 mt-1.5" : "mt-2"}`}>
        {matching.map((item) => {
          const isSelected = selectedMenu?.id === item.id;
          return (
            <div key={item.id} className="space-y-1">
              <div
                draggable
                onDragStart={() => { dragItemRef.current = { id: item.id, groupId, parentId }; }}
                onDragOver={(event) => { event.preventDefault(); if (dragOverId !== item.id) setDragOverId(item.id); }}
                onDragLeave={() => setDragOverId((current) => (current === item.id ? null : current))}
                onDrop={(event) => { event.preventDefault(); handleDrop(item); }}
                onDragEnd={() => { dragItemRef.current = null; setDragOverId(null); }}
                className={`flex items-center justify-between p-2 rounded-sm text-sm transition-colors cursor-grab active:cursor-grabbing ${
                  isSelected ? "bg-emerald/10 text-emerald font-medium" : "bg-paper hover:bg-paper-dim text-ink"
                } ${dragOverId === item.id ? "ring-2 ring-emerald/60" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => chooseMenu(item, groupId)}
                  className="flex-1 text-left truncate flex items-center gap-1.5"
                >
                  <GripVertical size={13} className="text-charcoal/30 shrink-0" />
                  <span className="text-charcoal/40 font-mono text-xs">{depth === 0 ? "📁" : depth === 1 ? "↳" : "↳↳"}</span>
                  <span className="truncate">{item.label}</span>
                  {item.href && <span className="text-[11px] text-charcoal/40 font-mono">({item.href})</span>}
                </button>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => chooseMenu(item, groupId)} className="text-xs text-emerald hover:underline">
                    Edit
                  </button>
                </div>
              </div>
              {renderTree(items, groupId, item.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid xl:grid-cols-[1fr_400px] gap-8">
      {/* Left Column: Navigation Tree */}
      <div className="bg-paper p-7 space-y-7 rounded-sm border border-line">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <p className="text-emerald text-xs font-semibold uppercase tracking-[0.14em]">Website Navigation Tree</p>
            <h2 className="font-serif text-2xl text-ink mt-1">Menu Groups & Submenus</h2>
          </div>
          <button type="button" onClick={resetForm} className="inline-flex items-center gap-1.5 bg-emerald text-paper px-3 py-2 text-xs font-medium rounded-sm">
            <Plus size={14} /> Add New Menu Item
          </button>
        </div>

        <div className="space-y-8">
          {nav.groups.map((group) => (
            <div key={group.id} className="border border-line/70 p-4 rounded-sm bg-paper-dim/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-line">
                <div>
                  <h3 className="font-serif text-xl text-ink">{group.label}</h3>
                  <p className="text-[11px] text-charcoal/50 uppercase tracking-wider font-mono">Group ID: {group.slug || group.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => chooseMenu({ id: group.id, label: group.label, href: "", description: "", parentId: "" }, group.id)}
                    className="text-xs text-emerald hover:underline"
                  >
                    Edit Group Name
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete the "${group.label}" group and all its menu items?`)) {
                        chooseMenu({ id: group.id }, group.id);
                        deleteMenu();
                      }
                    }}
                    className="text-xs text-red-700 hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Delete Group
                  </button>
                </div>
              </div>

              {renderTree(nav.items, group.id)}
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Editor & Add Item Form */}
      <div className="bg-paper p-7 h-fit rounded-sm border border-line space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald">
            {selectedMenu ? (isEditingGroup ? "📁 Edit Navigation Group" : "📌 Edit Menu Item") : "✨ Add New Navigation Menu Item"}
          </span>
          <h2 className="font-serif text-2xl text-ink mt-1">
            {selectedMenu ? (isEditingGroup ? `Edit Group: ${selectedMenu.label}` : `Editing: ${selectedMenu.label}`) : "New Service / Link"}
          </h2>
          <p className="text-xs text-charcoal/55 mt-1">
            {selectedMenu
              ? "Update the details below or click Delete to remove it from the menu."
              : "To add a new service item under 'Services', fill in the details below and select a parent category."}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            if (!menuForm.href) {
              menuForm.href = `/services/${menuForm.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            }
            if (selectedMenu) saveMenu(e);
            else addMenu(e);
          }}
          className="space-y-4"
        >
          <Field
            label="Item Label / Category / Service Name"
            placeholder="e.g. Taxation or Audit & Advisory"
            value={menuForm.label}
            onChange={(value) => setMenuForm({ ...menuForm, label: value })}
          />
          <Field
            label="URL Link"
            placeholder="e.g. /services/taxation (leave blank to auto-generate from the label)"
            value={menuForm.href}
            onChange={(value) => setMenuForm({ ...menuForm, href: value })}
          />
          <Field
            label="Description (Optional blurb for Services mega menu)"
            placeholder="e.g. Income tax, GST returns, TDS and advisory"
            value={menuForm.description || ""}
            onChange={(value) => setMenuForm({ ...menuForm, description: value })}
            textarea
          />

          <div className="space-y-2">
            <Field
              label="Category Image URL (shown on the homepage & services page cards; a default icon is used if left blank)"
              placeholder="/uploads/example.jpg"
              value={menuForm.image || ""}
              onChange={(value) => setMenuForm({ ...menuForm, image: value })}
            />
            <div className="flex items-center gap-3">
              {menuForm.image && <img src={menuForm.image} alt="" className="w-14 h-14 object-cover rounded-sm border border-line" />}
              <label className="inline-flex items-center gap-1.5 text-xs text-emerald cursor-pointer hover:underline">
                <Upload size={14} /> Upload image
                <input type="file" accept="image/*" onChange={uploadMenuImage} className="hidden" />
              </label>
              {menuForm.image && (
                <button type="button" onClick={() => setMenuForm({ ...menuForm, image: "" })} className="text-xs text-red-700 hover:underline">
                  Remove
                </button>
              )}
            </div>
          </div>

          <label className="block text-xs text-charcoal/60">
            Navigation Group
            <select
              value={menuForm.groupId}
              onChange={(e) => setMenuForm({ ...menuForm, groupId: e.target.value })}
              className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              {nav.groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs text-charcoal/60">
            Parent Category / Position
            <select
              value={menuForm.parentId || ""}
              onChange={(e) => setMenuForm({ ...menuForm, parentId: e.target.value })}
              className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              <option value="">Top-level Category (Column Header, e.g. Formations)</option>
              {nav.items
                .filter((item) => item.id !== selectedMenu?.id && item.groupId === menuForm.groupId)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    ↳ Under {item.label}
                  </option>
                ))}
            </select>
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button className="inline-flex items-center gap-2 bg-emerald text-paper px-5 py-2.5 text-sm font-medium rounded-sm hover:bg-emerald-dark">
              <Save size={15} /> {selectedMenu ? "Save Changes" : "Add Menu Item"}
            </button>
            {selectedMenu && (
              <button
                type="button"
                onClick={deleteMenu}
                className="inline-flex items-center gap-1.5 border border-red-200 bg-red-50 text-red-700 px-4 py-2.5 text-sm font-medium rounded-sm hover:bg-red-100"
              >
                <Trash2 size={15} /> Delete
              </button>
            )}
            {selectedMenu && (
              <button type="button" onClick={resetForm} className="text-xs text-charcoal/60 hover:underline">
                Cancel
              </button>
            )}
          </div>
        </form>

        <form onSubmit={addGroup} className="border-t border-line mt-6 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/70 mb-2">Create New Navigation Group</p>
          <p className="text-xs text-charcoal/50 mb-3">Create a new main menu header (like "Services", "Company", "Resources").</p>
          <div className="flex gap-2">
            <input name="label" required placeholder="New Group Name" className="min-w-0 flex-1 border border-line px-3 py-2 text-sm bg-paper" />
            <button className="bg-emerald text-paper px-4 text-xs font-medium rounded-sm hover:bg-emerald-dark">
              <Plus size={15} /> Add Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TestimonialsPanel({ testimonialRows, testimonialForm, setTestimonialForm, selectedTestimonial, chooseTestimonial, saveTestimonial, createTestimonial, deleteTestimonial, uploadTestimonialAvatar }) {
  return (
    <div className="grid xl:grid-cols-[240px_1fr] gap-8">
      <div className="bg-paper p-5 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">Testimonials</h2>
          <button type="button" onClick={() => chooseTestimonial(null)} className="text-emerald"><Plus size={17} /></button>
        </div>
        {testimonialRows.map((item) => (
          <button key={item.id} onClick={() => chooseTestimonial(item)} className={`w-full text-left px-3 py-3 text-sm border-b border-line ${item.id === selectedTestimonial?.id ? "text-emerald bg-emerald/5" : "text-charcoal/70"}`}>
            {item.name}{item.company ? <span className="block text-xs text-charcoal/45">{item.company}</span> : null}
          </button>
        ))}
        {testimonialRows.length === 0 && <p className="text-xs text-charcoal/50">No testimonials yet.</p>}
      </div>

      <form onSubmit={selectedTestimonial ? saveTestimonial : createTestimonial} className="bg-paper p-7 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-emerald text-sm">{selectedTestimonial ? "Editing testimonial" : "New testimonial"}</p>
            <h2 className="font-serif text-3xl mt-1">Client quote</h2>
          </div>
          {selectedTestimonial && (
            <button type="button" onClick={deleteTestimonial} className="inline-flex items-center gap-2 text-red-700 text-sm">
              <Trash2 size={15} /> Delete
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name" value={testimonialForm.name} onChange={(value) => setTestimonialForm({ ...testimonialForm, name: value })} />
          <Field label="Role" value={testimonialForm.role || ""} onChange={(value) => setTestimonialForm({ ...testimonialForm, role: value })} />
        </div>
        <Field label="Company" value={testimonialForm.company || ""} onChange={(value) => setTestimonialForm({ ...testimonialForm, company: value })} />
        <Field label="Quote" value={testimonialForm.quote} onChange={(value) => setTestimonialForm({ ...testimonialForm, quote: value })} textarea />

        <div className="flex items-center gap-4">
          {testimonialForm.avatar && <img src={testimonialForm.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-line" />}
          <label className="inline-flex items-center gap-2 text-sm text-emerald cursor-pointer">
            <Upload size={15} /> Upload photo
            <input type="file" accept="image/*" onChange={uploadTestimonialAvatar} className="hidden" />
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-charcoal/70">
          <input type="checkbox" checked={testimonialForm.published !== false} onChange={(e) => setTestimonialForm({ ...testimonialForm, published: e.target.checked })} />
          Published on the home page
        </label>

        <button className="inline-flex items-center gap-2 bg-emerald text-paper px-5 py-3 text-sm">
          <Save size={15} /> {selectedTestimonial ? "Save changes" : "Add testimonial"}
        </button>
      </form>
    </div>
  );
}

function BanksPanel({ bankRows, bankForm, setBankForm, selectedBank, chooseBank, saveBank, createBank, deleteBank, uploadBankLogo }) {
  return (
    <div className="grid xl:grid-cols-[240px_1fr] gap-8">
      <div className="bg-paper p-5 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">Banks</h2>
          <button type="button" onClick={() => chooseBank(null)} className="text-emerald"><Plus size={17} /></button>
        </div>
        {bankRows.map((item) => (
          <button key={item.id} onClick={() => chooseBank(item)} className={`w-full text-left px-3 py-3 text-sm border-b border-line ${item.id === selectedBank?.id ? "text-emerald bg-emerald/5" : "text-charcoal/70"}`}>
            {item.name}
          </button>
        ))}
        {bankRows.length === 0 && <p className="text-xs text-charcoal/50">No banks yet.</p>}
      </div>

      <form onSubmit={selectedBank ? saveBank : createBank} className="bg-paper p-7 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-emerald text-sm">{selectedBank ? "Editing bank" : "New bank"}</p>
            <h2 className="font-serif text-3xl mt-1">Associated bank</h2>
          </div>
          {selectedBank && (
            <button type="button" onClick={deleteBank} className="inline-flex items-center gap-2 text-red-700 text-sm">
              <Trash2 size={15} /> Delete
            </button>
          )}
        </div>

        <Field label="Bank name" value={bankForm.name} onChange={(value) => setBankForm({ ...bankForm, name: value })} />

        <div className="flex items-center gap-4">
          {bankForm.logo && <img src={bankForm.logo} alt="" className="h-12 max-w-[140px] object-contain border border-line p-1.5" />}
          <label className="inline-flex items-center gap-2 text-sm text-emerald cursor-pointer">
            <Upload size={15} /> Upload logo
            <input type="file" accept="image/*" onChange={uploadBankLogo} className="hidden" />
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-charcoal/70">
          <input type="checkbox" checked={bankForm.published !== false} onChange={(e) => setBankForm({ ...bankForm, published: e.target.checked })} />
          Published on the home page
        </label>

        <button className="inline-flex items-center gap-2 bg-emerald text-paper px-5 py-3 text-sm">
          <Save size={15} /> {selectedBank ? "Save changes" : "Add bank"}
        </button>
      </form>
    </div>
  );
}

function TeamPanel({ teamRows, teamForm, setTeamForm, selectedTeam, chooseTeam, saveTeam, createTeam, deleteTeam, uploadTeamPhoto }) {
  return (
    <div className="grid xl:grid-cols-[240px_1fr] gap-8">
      <div className="bg-paper p-5 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">Team</h2>
          <button type="button" onClick={() => chooseTeam(null)} className="text-emerald"><Plus size={17} /></button>
        </div>
        {teamRows.map((item) => (
          <button key={item.id} onClick={() => chooseTeam(item)} className={`w-full text-left px-3 py-3 text-sm border-b border-line ${item.id === selectedTeam?.id ? "text-emerald bg-emerald/5" : "text-charcoal/70"}`}>
            {item.name}<span className="block text-xs text-charcoal/45">{item.role}</span>
          </button>
        ))}
        {teamRows.length === 0 && <p className="text-xs text-charcoal/50">No team members yet.</p>}
      </div>

      <form onSubmit={selectedTeam ? saveTeam : createTeam} className="bg-paper p-7 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-emerald text-sm">{selectedTeam ? "Editing team member" : "New team member"}</p>
            <h2 className="font-serif text-3xl mt-1">Team profile</h2>
          </div>
          {selectedTeam && (
            <button type="button" onClick={deleteTeam} className="inline-flex items-center gap-2 text-red-700 text-sm">
              <Trash2 size={15} /> Delete
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name" value={teamForm.name} onChange={(value) => setTeamForm({ ...teamForm, name: value })} />
          <Field label="Role / Designation" value={teamForm.role} onChange={(value) => setTeamForm({ ...teamForm, role: value })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Qualification (e.g. FCA, CS)" value={teamForm.qualification || ""} onChange={(value) => setTeamForm({ ...teamForm, qualification: value })} />
          <Field label="Focus area" value={teamForm.focus || ""} onChange={(value) => setTeamForm({ ...teamForm, focus: value })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Years of experience" type="number" value={teamForm.experienceYears ?? ""} onChange={(value) => setTeamForm({ ...teamForm, experienceYears: value })} />
          <Field label="URL slug (used in /team/[slug])" value={teamForm.slug || ""} onChange={(value) => setTeamForm({ ...teamForm, slug: value })} placeholder="auto-generated from name if left blank" />
        </div>
        <Field label="Bio" value={teamForm.bio || ""} onChange={(value) => setTeamForm({ ...teamForm, bio: value })} textarea />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email" value={teamForm.email || ""} onChange={(value) => setTeamForm({ ...teamForm, email: value })} />
          <Field label="Phone" value={teamForm.phone || ""} onChange={(value) => setTeamForm({ ...teamForm, phone: value })} />
        </div>
        <Field label="LinkedIn URL" value={teamForm.linkedin || ""} onChange={(value) => setTeamForm({ ...teamForm, linkedin: value })} />

        <div className="flex items-center gap-4">
          {teamForm.photo && <img src={teamForm.photo} alt="" className="w-16 h-16 rounded-full object-cover border border-line" />}
          <label className="inline-flex items-center gap-2 text-sm text-emerald cursor-pointer">
            <Upload size={15} /> Upload photo
            <input type="file" accept="image/*" onChange={uploadTeamPhoto} className="hidden" />
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-charcoal/70">
          <input type="checkbox" checked={teamForm.published !== false} onChange={(e) => setTeamForm({ ...teamForm, published: e.target.checked })} />
          Published on the team page
        </label>

        <button className="inline-flex items-center gap-2 bg-emerald text-paper px-5 py-3 text-sm">
          <Save size={15} /> {selectedTeam ? "Save changes" : "Add team member"}
        </button>
      </form>
    </div>
  );
}

function SocialLinksPanel({ socialRows, socialForm, setSocialForm, selectedSocial, chooseSocial, saveSocial, createSocial, deleteSocial }) {
  return (
    <div className="grid xl:grid-cols-[240px_1fr] gap-8">
      <div className="bg-paper p-5 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">Social Links</h2>
          <button type="button" onClick={() => chooseSocial(null)} className="text-emerald"><Plus size={17} /></button>
        </div>
        {socialRows.map((item) => (
          <button key={item.id} onClick={() => chooseSocial(item)} className={`w-full text-left px-3 py-3 text-sm border-b border-line capitalize ${item.id === selectedSocial?.id ? "text-emerald bg-emerald/5" : "text-charcoal/70"}`}>
            {item.platform}
          </button>
        ))}
        {socialRows.length === 0 && <p className="text-xs text-charcoal/50">No social links yet.</p>}
      </div>

      <form onSubmit={selectedSocial ? saveSocial : createSocial} className="bg-paper p-7 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-emerald text-sm">{selectedSocial ? "Editing social link" : "New social link"}</p>
            <h2 className="font-serif text-3xl mt-1">Footer social icon</h2>
          </div>
          {selectedSocial && (
            <button type="button" onClick={deleteSocial} className="inline-flex items-center gap-2 text-red-700 text-sm">
              <Trash2 size={15} /> Delete
            </button>
          )}
        </div>

        <label className="block text-xs text-charcoal/60">
          Platform
          <select value={socialForm.platform} onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })} className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm">
            {SOCIAL_PLATFORM_OPTIONS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <Field label="Profile / Page URL" value={socialForm.url} onChange={(value) => setSocialForm({ ...socialForm, url: value })} placeholder="https://..." />
        <Field label="Sort order" type="number" value={socialForm.sortOrder ?? 0} onChange={(value) => setSocialForm({ ...socialForm, sortOrder: Number(value) })} />

        <label className="inline-flex items-center gap-2 text-sm text-charcoal/70">
          <input type="checkbox" checked={socialForm.published !== false} onChange={(e) => setSocialForm({ ...socialForm, published: e.target.checked })} />
          Show in footer
        </label>

        <button className="inline-flex items-center gap-2 bg-emerald text-paper px-5 py-3 text-sm">
          <Save size={15} /> {selectedSocial ? "Save changes" : "Add social link"}
        </button>
      </form>
    </div>
  );
}

function MediaPanel() { return <div className="bg-paper p-8"><p className="text-emerald text-sm">Media library</p><h2 className="font-serif text-3xl mt-2">Uploaded images</h2><p className="text-charcoal/60 mt-3">Upload and attach images from the Pages editor. Uploaded media is recorded in Turso and local files are stored in <code>public/uploads</code> during development.</p></div>; }
function EnquiriesPanel({ enquiryRows, selectedEnquiryIds, toggleEnquirySelect, toggleEnquirySelectAllOnPage, deleteSelectedEnquiries, markEnquiryRead, enquiryPage, setEnquiryPage, expandedEnquiryId, setExpandedEnquiryId }) {
  const totalPages = Math.max(1, Math.ceil(enquiryRows.length / ENQUIRIES_PAGE_SIZE));
  const page = Math.min(enquiryPage, totalPages);
  const pageRows = enquiryRows.slice((page - 1) * ENQUIRIES_PAGE_SIZE, page * ENQUIRIES_PAGE_SIZE);
  const pageIds = pageRows.map((row) => row.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedEnquiryIds.has(id));

  function changePage(next) {
    setExpandedEnquiryId(null);
    setEnquiryPage(Math.min(Math.max(1, next), totalPages));
  }

  return (
    <div className="bg-paper">
      <div className="flex items-center justify-between px-6 py-4 border-b border-line">
        <p className="text-sm text-charcoal/60">{enquiryRows.length} {enquiryRows.length === 1 ? "enquiry" : "enquiries"} total</p>
        <button type="button" onClick={deleteSelectedEnquiries} disabled={selectedEnquiryIds.size === 0} className="inline-flex items-center gap-2 text-sm px-4 py-2 border border-red-200 text-red-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-50">
          <Trash2 size={15} /> Delete selected {selectedEnquiryIds.size > 0 ? `(${selectedEnquiryIds.size})` : ""}
        </button>
      </div>

      {enquiryRows.length === 0 ? (
        <div className="p-8 text-charcoal/60">No enquiries yet.</div>
      ) : (
        <>
          <div className="px-6 py-2 border-b border-line flex items-center gap-3">
            <input type="checkbox" checked={allOnPageSelected} onChange={() => toggleEnquirySelectAllOnPage(pageIds)} />
            <span className="text-xs text-charcoal/50 uppercase tracking-[0.1em]">Select all on this page</span>
          </div>
          <div className="divide-y divide-line">
            {pageRows.map((item) => (
              <div key={item.id} className={`px-6 py-4 ${!item.isRead ? "bg-emerald/5" : ""}`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1.5" checked={selectedEnquiryIds.has(item.id)} onChange={() => toggleEnquirySelect(item.id)} />
                  <div className="flex-1 cursor-pointer" onClick={() => { if (!item.isRead) markEnquiryRead(item.id, true); setExpandedEnquiryId(expandedEnquiryId === item.id ? null : item.id); }}>
                    <div className="flex items-center gap-3 flex-wrap">
                      {!item.isRead && <span className="w-2 h-2 rounded-full bg-emerald shrink-0" />}
                      <h3 className={`font-serif text-xl ${!item.isRead ? "text-ink" : "text-charcoal/70"}`}>{item.name}</h3>
                      <span className="text-xs uppercase text-emerald">{item.status}</span>
                      <span className="text-xs text-charcoal/40 ml-auto">{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <p className="text-sm text-charcoal/55 mt-2">{item.service} · {item.email} · {item.phone}</p>
                    <p className={`text-sm text-charcoal/75 mt-3 ${expandedEnquiryId === item.id ? "" : "line-clamp-2"}`}>{item.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-xs text-charcoal/50">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => changePage(page - 1)} disabled={page <= 1} className="inline-flex items-center gap-1 text-sm px-3 py-2 border border-line disabled:opacity-30 disabled:cursor-not-allowed hover:border-emerald hover:text-emerald">
                <ChevronLeft size={15} /> Prev
              </button>
              <button type="button" onClick={() => changePage(page + 1)} disabled={page >= totalPages} className="inline-flex items-center gap-1 text-sm px-3 py-2 border border-line disabled:opacity-30 disabled:cursor-not-allowed hover:border-emerald hover:text-emerald">
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NewsPanel({ newsRows, newsForm, setNewsForm, selectedNews, chooseNews, saveNews, createNews, deleteNews }) {
  return (
    <div className="grid xl:grid-cols-[240px_1fr] gap-8">
      <div className="bg-paper p-5 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">News</h2>
          <button type="button" onClick={() => chooseNews(null)} className="text-emerald"><Plus size={17} /></button>
        </div>
        {newsRows.map((item) => (
          <button key={item.id} onClick={() => chooseNews(item)} className={`block w-full text-left px-3 py-3 text-sm border-b border-line truncate ${item.id === selectedNews?.id ? "text-emerald bg-emerald/5" : "text-charcoal/70"}`} title={item.title}>
            {item.title}
          </button>
        ))}
        {newsRows.length === 0 && <p className="text-xs text-charcoal/50">No news items yet.</p>}
      </div>

      <form onSubmit={selectedNews ? saveNews : createNews} className="bg-paper p-7 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-emerald text-sm">{selectedNews ? "Editing news item" : "New news item"}</p>
            <h2 className="font-serif text-3xl mt-1">Ticker headline</h2>
          </div>
          {selectedNews && (
            <button type="button" onClick={deleteNews} className="inline-flex items-center gap-2 text-red-700 text-sm">
              <Trash2 size={15} /> Delete
            </button>
          )}
        </div>

        <Field label="Title" value={newsForm.title} onChange={(value) => setNewsForm({ ...newsForm, title: value })} />
        <Field label="Link (optional)" value={newsForm.link || ""} onChange={(value) => setNewsForm({ ...newsForm, link: value })} placeholder="/insights or https://..." />

        <label className="inline-flex items-center gap-2 text-sm text-charcoal/70">
          <input type="checkbox" checked={newsForm.published !== false} onChange={(e) => setNewsForm({ ...newsForm, published: e.target.checked })} />
          Shown in the site ticker
        </label>

        <button className="inline-flex items-center gap-2 bg-emerald text-paper px-5 py-3 text-sm">
          <Save size={15} /> {selectedNews ? "Save changes" : "Add news item"}
        </button>
      </form>
    </div>
  );
}

function BlogPanel({ blogRows, blogForm, setBlogForm, selectedBlog, chooseBlog, saveBlog, createBlog, deleteBlog, uploadBlogCover, blogGallery, uploadBlogGalleryImages, deleteBlogGalleryImage }) {
  return (
    <div className="grid xl:grid-cols-[240px_1fr] gap-8">
      <div className="bg-paper p-5 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">Blog</h2>
          <button type="button" onClick={() => chooseBlog(null)} className="text-emerald"><Plus size={17} /></button>
        </div>
        {blogRows.map((item) => (
          <button key={item.id} onClick={() => chooseBlog(item)} className={`block w-full text-left px-3 py-3 text-sm border-b border-line ${item.id === selectedBlog?.id ? "text-emerald bg-emerald/5" : "text-charcoal/70"}`} title={item.title}>
            <span className="block truncate">{item.title}</span>{!item.published && <span className="block text-[10px] uppercase text-charcoal/40">Draft</span>}
          </button>
        ))}
        {blogRows.length === 0 && <p className="text-xs text-charcoal/50">No posts yet.</p>}
      </div>

      <form onSubmit={selectedBlog ? saveBlog : createBlog} className="bg-paper p-7 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-emerald text-sm">{selectedBlog ? "Editing post" : "New post"}</p>
            <h2 className="font-serif text-3xl mt-1">Blog post</h2>
          </div>
          <div className="flex items-center gap-4">
            {selectedBlog && (
              <span className="inline-flex items-center gap-1.5 text-sm text-charcoal/60" title="Total likes from visitors">
                <Heart size={15} className="text-emerald" /> {selectedBlog.likeCount ?? 0} likes
              </span>
            )}
            {selectedBlog && (
              <button type="button" onClick={deleteBlog} className="inline-flex items-center gap-2 text-red-700 text-sm">
                <Trash2 size={15} /> Delete
              </button>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Title" value={blogForm.title} onChange={(value) => setBlogForm({ ...blogForm, title: value })} />
          <Field label="Slug" value={blogForm.slug} onChange={(value) => setBlogForm({ ...blogForm, slug: value })} placeholder="auto-generated from title if left blank" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Author" value={blogForm.author || ""} onChange={(value) => setBlogForm({ ...blogForm, author: value })} />
          <Field label="Tag" value={blogForm.tag || ""} onChange={(value) => setBlogForm({ ...blogForm, tag: value })} />
        </div>

        <label className="block text-xs text-charcoal/60">
          Excerpt
          <textarea value={blogForm.excerpt || ""} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} rows={2} className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-emerald" />
        </label>

        <Field label="Content" value={blogForm.content} onChange={(value) => setBlogForm({ ...blogForm, content: value })} textarea />

        <div className="flex items-center gap-4">
          {blogForm.coverImage && <img src={blogForm.coverImage} alt="" className="h-16 w-24 object-cover border border-line" />}
          <label className="inline-flex items-center gap-2 text-sm text-emerald cursor-pointer">
            <Upload size={15} /> Upload cover image
            <input type="file" accept="image/*" onChange={uploadBlogCover} className="hidden" />
          </label>
        </div>

        <div>
          <p className="text-xs text-charcoal/60 mb-2">Gallery images (shown on the post page)</p>
          {selectedBlog ? (
            <>
              <div className="flex flex-wrap gap-3 mb-3">
                {blogGallery.map((image) => (
                  <div key={image.id} className="relative">
                    <img src={image.url} alt="" className="h-20 w-28 object-cover border border-line" />
                    <button type="button" onClick={() => deleteBlogGalleryImage(image.id)} className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-emerald cursor-pointer">
                <Upload size={15} /> Add gallery images
                <input type="file" accept="image/*" multiple onChange={uploadBlogGalleryImages} className="hidden" />
              </label>
            </>
          ) : (
            <p className="text-xs text-charcoal/45">Save the post first, then add gallery images.</p>
          )}
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-charcoal/70">
          <input type="checkbox" checked={blogForm.published !== false} onChange={(e) => setBlogForm({ ...blogForm, published: e.target.checked })} />
          Published
        </label>

        <button className="inline-flex items-center gap-2 bg-emerald text-paper px-5 py-3 text-sm">
          <Save size={15} /> {selectedBlog ? "Save changes" : "Publish post"}
        </button>
      </form>
    </div>
  );
}

function RolesPanel({ roleRows, roleForm, setRoleForm, selectedRole, chooseRole, saveRole, createRole, deleteRole, toggleRolePermission, permissionCatalog }) {
  const groups = permissionCatalog.reduce((acc, permission) => { (acc[permission.group] ||= []).push(permission); return acc; }, {});
  const isSystem = selectedRole?.isSystem;

  return (
    <div className="grid xl:grid-cols-[240px_1fr] gap-8">
      <div className="bg-paper p-5 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">Roles</h2>
          <button type="button" onClick={() => chooseRole(null)} className="text-emerald"><Plus size={17} /></button>
        </div>
        {roleRows.map((role) => (
          <button key={role.id} onClick={() => chooseRole(role)} className={`w-full text-left px-3 py-3 text-sm border-b border-line flex items-center justify-between ${role.id === selectedRole?.id ? "text-emerald bg-emerald/5" : "text-charcoal/70"}`}>
            {role.name}
            {role.isSystem && <span className="text-[10px] uppercase tracking-wide text-charcoal/40 border border-line px-1.5 py-0.5 rounded-sm">System</span>}
          </button>
        ))}
        {roleRows.length === 0 && <p className="text-xs text-charcoal/50">No custom roles yet.</p>}
      </div>

      <form onSubmit={selectedRole ? saveRole : createRole} className="bg-paper p-7 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-emerald text-sm">{selectedRole ? "Editing role" : "New role"}</p>
            <h2 className="font-serif text-3xl mt-1">Role & permissions</h2>
          </div>
          {selectedRole && !isSystem && (
            <button type="button" onClick={deleteRole} className="inline-flex items-center gap-2 text-red-700 text-sm">
              <Trash2 size={15} /> Delete
            </button>
          )}
        </div>

        {isSystem ? (
          <p className="text-sm text-charcoal/60 border border-dashed border-line p-4 rounded-sm">
            {selectedRole.name} automatically holds every permission and can't be edited or deleted. Create a custom role below to grant a staff member a limited set of permissions instead.
          </p>
        ) : (
          <>
            <Field label="Role name" value={roleForm.name} onChange={(value) => setRoleForm({ ...roleForm, name: value })} placeholder="e.g. Content Editor" />

            <div className="space-y-4">
              <p className="text-xs font-medium text-ink">Permissions</p>
              {Object.entries(groups).map(([group, items]) => (
                <div key={group} className="border border-line/70 p-3 rounded-sm">
                  <p className="text-[11px] uppercase tracking-wide text-charcoal/50 mb-2">{group}</p>
                  <div className="space-y-1.5">
                    {items.map((permission) => (
                      <label key={permission.key} className="flex items-center gap-2 text-sm text-charcoal/75">
                        <input type="checkbox" checked={roleForm.permissionKeys.includes(permission.key)} onChange={() => toggleRolePermission(permission.key)} />
                        {permission.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button className="inline-flex items-center gap-2 bg-emerald text-paper px-5 py-3 text-sm">
              <Save size={15} /> {selectedRole ? "Save changes" : "Create role"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

function UsersPanel({ staffRows, staffForm, setStaffForm, selectedStaff, chooseStaff, saveStaff, createStaff, deleteStaff, roleRows }) {
  return (
    <div className="grid xl:grid-cols-[240px_1fr] gap-8">
      <div className="bg-paper p-5 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">Users</h2>
          <button type="button" onClick={() => chooseStaff(null)} className="text-emerald"><Plus size={17} /></button>
        </div>
        {staffRows.map((user) => (
          <button key={user.id} onClick={() => chooseStaff(user)} className={`w-full text-left px-3 py-3 text-sm border-b border-line ${user.id === selectedStaff?.id ? "text-emerald bg-emerald/5" : "text-charcoal/70"}`}>
            {user.name}
            <span className="block text-xs text-charcoal/45">{user.role === "STAFF" ? user.roleName || "No role assigned" : user.role}</span>
          </button>
        ))}
        {staffRows.length === 0 && <p className="text-xs text-charcoal/50">No users yet.</p>}
      </div>

      <form onSubmit={selectedStaff ? saveStaff : createStaff} className="bg-paper p-7 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-emerald text-sm">{selectedStaff ? "Editing user" : "New user"}</p>
            <h2 className="font-serif text-3xl mt-1">Account</h2>
          </div>
          {selectedStaff && (
            <button type="button" onClick={deleteStaff} className="inline-flex items-center gap-2 text-red-700 text-sm">
              <Trash2 size={15} /> Delete
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name" value={staffForm.name} onChange={(value) => setStaffForm({ ...staffForm, name: value })} />
          <Field label="Email" value={staffForm.email} onChange={(value) => setStaffForm({ ...staffForm, email: value })} placeholder={selectedStaff ? "" : "name@zuess.local"} />
        </div>

        <Field
          label={selectedStaff ? "New password (leave blank to keep current)" : "Password"}
          value={staffForm.password}
          onChange={(value) => setStaffForm({ ...staffForm, password: value })}
          type="password"
        />

        <label className="block text-xs text-charcoal/60">
          Access level
          <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm">
            <option value="STAFF">Staff (assign a role below)</option>
            <option value="ADMIN">Admin (all permissions)</option>
            <option value="SUPERADMIN">Superadmin (all permissions)</option>
          </select>
        </label>

        {staffForm.role === "STAFF" && (
          <label className="block text-xs text-charcoal/60">
            Role
            <select value={staffForm.roleId} onChange={(e) => setStaffForm({ ...staffForm, roleId: e.target.value })} className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm">
              <option value="">Select a role...</option>
              {roleRows.filter((role) => !role.isSystem).map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
          </label>
        )}

        <button className="inline-flex items-center gap-2 bg-emerald text-paper px-5 py-3 text-sm">
          <Save size={15} /> {selectedStaff ? "Save changes" : "Create user"}
        </button>
      </form>
    </div>
  );
}

function AccountPanel({ session, passwordForm, setPasswordForm, changeOwnPassword }) {
  return (
    <div className="max-w-lg bg-paper p-7 space-y-5">
      <div>
        <p className="text-emerald text-sm">Signed in as</p>
        <h2 className="font-serif text-3xl mt-1">{session.name}</h2>
        <p className="text-sm text-charcoal/55 mt-1">{session.email} · {session.roleName || session.role}</p>
      </div>

      <form onSubmit={changeOwnPassword} className="space-y-4 border-t border-line pt-5">
        <p className="text-sm font-medium text-ink">Change password</p>
        <Field label="Current password" value={passwordForm.currentPassword} onChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })} type="password" />
        <Field label="New password" value={passwordForm.newPassword} onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })} type="password" />
        <Field label="Confirm new password" value={passwordForm.confirmPassword} onChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })} type="password" />
        <button className="inline-flex items-center gap-2 bg-emerald text-paper px-5 py-3 text-sm">
          <Save size={15} /> Update password
        </button>
      </form>
    </div>
  );
}
function Field({ label, value, onChange, textarea = false, placeholder = "", errorMessage = "", type = "text" }) {
  return <label className="block text-xs text-charcoal/60">{label}{textarea ? <RichTextEditor value={value} onChange={onChange} placeholder={placeholder} /> : <input type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`mt-1 w-full border px-3 py-2 text-sm text-ink focus:outline-none ${errorMessage ? "border-red-400 bg-red-50 focus:border-red-500" : "border-line bg-paper focus:border-emerald"}`} />}{errorMessage && <span className="mt-1 block text-[11px] text-red-600">{errorMessage}</span>}</label>;
}
