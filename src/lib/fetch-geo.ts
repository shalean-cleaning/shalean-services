export async function getRegions() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const res = await fetch(`${base}/api/regions`, { next: { revalidate: 3600 } });
  const json = await res.json();
  return json.value ?? [];
}
export async function getSuburbs() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const res = await fetch(`${base}/api/suburbs`, { next: { revalidate: 3600 } });
  const json = await res.json();
  return json.value ?? [];
}
