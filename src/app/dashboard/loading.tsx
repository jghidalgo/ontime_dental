export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-500/20 border-t-primary-500" />
        <p className="text-slate-400">Loading dashboard...</p>
      </div>
    </div>
  );
}
