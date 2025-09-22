import { DataLoader } from '@/components/admin/DataLoader';

export default function AdminDataPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Database Data Viewer</h1>
        <p className="text-muted-foreground mt-2">
          View and inspect all data in your Supabase database
        </p>
      </div>
      
      <DataLoader />
    </div>
  );
}
