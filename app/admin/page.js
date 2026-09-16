import { redirect } from "next/navigation";
import { getSession, roleHasFullAccess } from "@/lib/auth";
import { desc, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { enquiries, pages, navigationGroups, navigationItems, testimonials, banks, news, blogPosts, roles, rolePermissions, permissions, users, teamMembers, socialLinks } from "@/lib/schema";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  const hasAnyAccess = session && (roleHasFullAccess(session.role) || (Array.isArray(session.permissions) && session.permissions.length > 0));
  if (!hasAnyAccess) redirect("/admin/login");

  const can = (key) => roleHasFullAccess(session.role) || (session.permissions || []).includes(key);

  const [enquiryRows, pageRows, groupRows, itemRows, testimonialRows, bankRows, newsRows, blogRows, teamRows, socialLinkRows] = await Promise.all([
    db.select().from(enquiries).orderBy(desc(enquiries.createdAt)),
    db.select().from(pages).orderBy(asc(pages.slug)),
    db.select().from(navigationGroups).orderBy(asc(navigationGroups.sortOrder)),
    db.select().from(navigationItems).orderBy(asc(navigationItems.sortOrder)),
    db.select().from(testimonials).orderBy(asc(testimonials.sortOrder)),
    db.select().from(banks).orderBy(asc(banks.sortOrder)),
    db.select().from(news).orderBy(asc(news.createdAt)),
    db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)),
    db.select().from(teamMembers).orderBy(asc(teamMembers.sortOrder)),
    db.select().from(socialLinks).orderBy(asc(socialLinks.sortOrder)),
  ]);
  const stats = {
    total: enquiryRows.length,
    newCount: enquiryRows.filter((item) => item.status === "NEW").length,
    thisMonth: enquiryRows.filter((item) => new Date(item.createdAt).getMonth() === new Date().getMonth()).length,
  };

  let roleRows = [];
  let permissionRows = [];
  let userRows = [];
  if (can("roles.manage") || can("users.manage")) {
    permissionRows = await db.select().from(permissions).orderBy(asc(permissions.group), asc(permissions.label));
  }
  if (can("roles.manage")) {
    const roleData = await db.select().from(roles).orderBy(asc(roles.name));
    const links = await db
      .select({ roleId: rolePermissions.roleId, key: permissions.key })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id));
    const byRole = {};
    for (const link of links) (byRole[link.roleId] ||= []).push(link.key);
    roleRows = roleData.map((role) => ({ ...role, permissionKeys: byRole[role.id] || [] }));
  }
  if (can("users.manage")) {
    userRows = await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role, roleId: users.roleId, roleName: roles.name, createdAt: users.createdAt })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .orderBy(asc(users.name));
  }

  return (
    <AdminDashboard
      session={session}
      enquiries={enquiryRows}
      pages={pageRows}
      navigation={{ groups: groupRows, items: itemRows }}
      testimonials={testimonialRows}
      banks={bankRows}
      news={newsRows}
      blog={blogRows}
      team={teamRows}
      socialLinks={socialLinkRows}
      stats={stats}
      roles={roleRows}
      permissionCatalog={permissionRows}
      staffUsers={userRows}
    />
  );
}
