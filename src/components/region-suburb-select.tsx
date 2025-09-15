"use client";
import { useMemo, useState } from "react";

type Region = { id:string; name:string; slug:string; state?:string };
type Suburb = { id:string; name:string; slug?:string; region_id:string };

export default function RegionSuburbSelect({ regions, suburbs }:{
  regions: Region[]; suburbs: Suburb[];
}) {
  const [regionId, setRegionId] = useState("");
  const filtered = useMemo(() => suburbs.filter(s => s.region_id === regionId), [suburbs, regionId]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <select className="border rounded p-2" value={regionId} onChange={e => setRegionId(e.target.value)}>
        <option value="">Select region…</option>
        {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>
      <select className="border rounded p-2" disabled={!regionId}>
        <option value="">{regionId ? "Select suburb…" : "Choose a region first"}</option>
        {filtered.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </div>
  );
}
