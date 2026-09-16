"use client";

import { useState } from "react";
import { Save, Upload, Plus } from "lucide-react";

export default function AdminCmsPanel({ pages, navigation }) {
  const [selected, setSelected] = useState(pages[0]);
  const [form, setForm] = useState(selected || {});
  const [message, setMessage] = useState("");
  const [menuForm, setMenuForm] = useState({ label: "", href: "", groupId: navigation.groups[0]?.id || "", parentId: "" });
  const [groupLabel, setGroupLabel] = useState("");

  function selectPage(page) { setSelected(page); setForm(page); setMessage(""); }
  async function savePage(event) {
    event.preventDefault();
    const response = await fetch(`/api/admin/pages/${form.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, content: typeof form.content === "string" ? JSON.parse(form.content || "[]") : form.content }) });
    setMessage(response.ok ? "Page saved." : "Unable to save page.");
  }
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const data = new FormData(); data.append("file", file); data.append("alt", form.title || "Page image");
    const response = await fetch("/api/admin/upload", { method: "POST", body: data });
    const result = await response.json();
    if (response.ok) setForm((current) => ({ ...current, heroImage: result.url }));
    else setMessage(result.error || "Upload failed.");
  }
  async function addMenu(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/navigation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(menuForm) });
    setMessage(response.ok ? "Menu item added. Refresh to see it in the tree." : "Unable to add menu item.");
  }
  async function addGroup(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/navigation", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: groupLabel }) });
    setMessage(response.ok ? "Navigation group added. Refresh to see it." : "Unable to add navigation group.");
    if (response.ok) setGroupLabel("");
  }

  return <section className="mb-12 grid xl:grid-cols-[1.2fr_0.8fr] gap-8">
    <div className="bg-paper p-6 md:p-8">
      <div className="flex items-end justify-between gap-4 mb-6"><div><p className="text-emerald text-sm font-medium">Content studio</p><h2 className="font-serif text-3xl mt-2">Pages and media</h2></div>{message && <span className="text-sm text-emerald">{message}</span>}</div>
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">{pages.map((page) => <button key={page.id} onClick={() => selectPage(page)} className={`px-3 py-2 text-sm whitespace-nowrap border ${selected?.id === page.id ? "border-emerald text-emerald" : "border-line text-charcoal/60"}`}>{page.slug}</button>)}</div>
      {selected && <form onSubmit={savePage} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4"><label className="text-sm text-charcoal/60">Title<input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full border border-line bg-paper px-3 py-2 text-ink" /></label><label className="text-sm text-charcoal/60">Subtitle<input value={form.subtitle || ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="mt-1 w-full border border-line bg-paper px-3 py-2 text-ink" /></label></div>
        <label className="block text-sm text-charcoal/60">Description<textarea rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full border border-line bg-paper px-3 py-2 text-ink" /></label>
        <label className="block text-sm text-charcoal/60">Hero image URL<input value={form.heroImage || ""} onChange={(e) => setForm({ ...form, heroImage: e.target.value })} className="mt-1 w-full border border-line bg-paper px-3 py-2 text-ink" /></label>
        <label className="inline-flex items-center gap-2 text-sm text-charcoal/70"><Upload size={15} /> Upload image<input type="file" accept="image/*" onChange={upload} className="hidden" /></label>
        <label className="block text-sm text-charcoal/60">Content blocks (JSON)<textarea rows={8} value={typeof form.content === "string" ? form.content : JSON.stringify(form.content || [], null, 2)} onChange={(e) => setForm({ ...form, content: e.target.value })} className="mt-1 w-full border border-line bg-paper px-3 py-2 text-ink font-mono text-xs" /></label>
        <button className="inline-flex items-center gap-2 bg-emerald text-paper px-4 py-2.5 text-sm"><Save size={15} /> Save page</button>
      </form>}
    </div>
    <div className="bg-paper p-6 md:p-8"><p className="text-emerald text-sm font-medium">Navigation builder</p><h2 className="font-serif text-3xl mt-2 mb-5">Groups and nested items</h2><div className="space-y-4 mb-7">{navigation.groups.map((group) => <div key={group.id}><p className="font-medium">{group.label}</p><ul className="ml-4 border-l border-line pl-4 text-sm text-charcoal/65 space-y-1">{navigation.items.filter((item) => item.groupId === group.id).map((item) => <li key={item.id}>{item.label}{item.parentId && <span className="text-xs text-gold"> · sub item</span>}</li>)}</ul></div>)}</div><form onSubmit={addGroup} className="border-t border-line pt-5 mb-5 space-y-3"><p className="text-sm font-medium">Add a menu group</p><div className="flex gap-2"><input required placeholder="Group label" value={groupLabel} onChange={(e) => setGroupLabel(e.target.value)} className="min-w-0 flex-1 border border-line px-3 py-2 text-sm" /><button className="inline-flex items-center gap-2 border border-emerald text-emerald px-3 py-2 text-sm"><Plus size={15} /> Group</button></div></form><form onSubmit={addMenu} className="border-t border-line pt-5 space-y-3"><p className="text-sm font-medium">Add a sub menu item</p><input required placeholder="Label" value={menuForm.label} onChange={(e) => setMenuForm({ ...menuForm, label: e.target.value })} className="w-full border border-line px-3 py-2 text-sm" /><input required placeholder="/path or #anchor" value={menuForm.href} onChange={(e) => setMenuForm({ ...menuForm, href: e.target.value })} className="w-full border border-line px-3 py-2 text-sm" /><select value={menuForm.groupId} onChange={(e) => setMenuForm({ ...menuForm, groupId: e.target.value })} className="w-full border border-line px-3 py-2 text-sm">{navigation.groups.map((group) => <option key={group.id} value={group.id}>{group.label}</option>)}</select><select value={menuForm.parentId} onChange={(e) => setMenuForm({ ...menuForm, parentId: e.target.value })} className="w-full border border-line px-3 py-2 text-sm"><option value="">Top-level item</option>{navigation.items.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><button className="inline-flex items-center gap-2 border border-emerald text-emerald px-4 py-2.5 text-sm"><Plus size={15} /> Add menu item</button></form></div>
  </section>;
}
