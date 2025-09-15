import { getRegions, getSuburbs } from "@/lib/fetch-geo";
import RegionSuburbSelect from "@/components/region-suburb-select";

export default async function BookingPage() {
  const [regions, suburbs] = await Promise.all([getRegions(), getSuburbs()]);
  return <RegionSuburbSelect regions={regions} suburbs={suburbs} />;
}