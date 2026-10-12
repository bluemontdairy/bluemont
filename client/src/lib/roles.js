// Admin roles and what each may do. Shared by the API (enforcement) and the
// admin panel (hiding what a role can't use). Safe for client components.

export const ROLES = ['superadmin', 'staff'];

export const ROLE_LABELS = {
  superadmin: 'Super admin',
  staff: 'Staff',
};

export const ROLE_DESCRIPTIONS = {
  superadmin: 'Everything, including categories, site images, site settings, deleting records and managing admins.',
  staff: 'Day-to-day work: edit, hide and feature products, add customer reviews, handle partner leads and messages. Can’t delete or change site settings.',
};

const PERMISSIONS = {
  superadmin: [
    'products.edit',
    'products.delete',
    'categories.manage',
    'siteMedia.manage',
    'leads.edit',
    'leads.delete',
    'messages.edit',
    'messages.delete',
    'admins.manage',
    'settings.manage',
    'reviews.edit',
    'reviews.delete',
  ],
  staff: ['products.edit', 'leads.edit', 'messages.edit', 'reviews.edit'],
};

/** True when the admin's role includes the permission. */
export const can = (admin, permission) => Boolean(admin && PERMISSIONS[admin.role]?.includes(permission));
