import { getAdminSupabase } from '@/lib/supabase';

export async function saveInventoryProduct(payload: any, mode: 'full' | 'patch') {
  // Shared-password clients have no trustworthy identity; do not trust payload.user.
  // RBAC rollout must replace this explicit attribution before production release.
  const supabase = getAdminSupabase();
  const res = await supabase.rpc('save_inventory_product', {
    payload,
    mode,
    actor: 'legacy_admin_unverified',
  });
  if (res.error && (res.error.code === 'PGRST202' || res.error.message?.includes('save_inventory_product'))) {
    return supabase.rpc('save_admin_product_full', { payload });
  }
  return res;
}

export function inventoryFailure(error: { code?: string; message?: string }) {
  if (error.code === '40001') return { status: 409, error: 'Ce produit a été modifié. Rechargez-le avant d’enregistrer.' };
  if (error.code === '22023') return { status: 400, error: 'Quantité ou variante invalide. Pour un produit à variantes, modifiez chaque variante.' };
  if (error.code === 'P0002') return { status: 404, error: 'Produit introuvable.' };
  return { status: 500, error: error.message || 'La modification n’a pas été enregistrée. Veuillez réessayer.' };
}
