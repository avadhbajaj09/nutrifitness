/** Supabase resolves SQL failures; it does not reject the promise. */
export async function requireWrite<T>(query: PromiseLike<{ data: T; error: any }>): Promise<T> {
  const { data, error } = await query;
  if (error) throw new Error('La modification n’a pas été enregistrée. Veuillez réessayer.');
  return data;
}

export function inventoryInteger(value: unknown, allowNegative = false): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || (!allowNegative && value < 0)) {
    throw new Error('La quantité doit être un nombre entier valide.');
  }
  return value;
}
