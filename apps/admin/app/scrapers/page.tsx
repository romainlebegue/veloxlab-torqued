export const dynamic = "force-dynamic";

async function getJobs() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      { auth: { persistSession: false } }
    );
    const { data } = await supabase
      .from("scraper_jobs")
      .select(
        "id, job_type, status, listings_found, listings_new, " +
        "started_at, completed_at, next_run_at, sellers(name)"
      )
      .order("started_at", { ascending: false })
      .limit(50)
      .returns<{
        id: string;
        job_type: string;
        status: string;
        listings_found: number | null;
        listings_new: number | null;
        started_at: string | null;
        completed_at: string | null;
        next_run_at: string | null;
        sellers: { name: string } | null;
      }[]>();
    return data ?? [];
  } catch {
    return [];
  }
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  RUNNING: "bg-blue-100 text-blue-700",
  DONE:    "bg-green-100 text-green-700",
  FAILED:  "bg-red-100 text-red-700",
};

export default async function ScrapersPage() {
  const jobs = await getJobs();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Jobs scrapers</h1>

      {jobs.length === 0 && (
        <p className="text-gray-400 text-sm">
          Aucun job. Connectez Supabase ou déclenchez un scraper manuellement.
        </p>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Source", "Type", "Statut", "Trouvés", "Nouveaux", "Démarré", "Terminé", "Prochain run"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">
                  {job.sellers?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{job.job_type}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[job.status] ?? ""}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{job.listings_found ?? "—"}</td>
                <td className="px-4 py-3 text-green-700 font-medium">{job.listings_new ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{job.started_at?.slice(0, 16).replace("T", " ") ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{job.completed_at?.slice(0, 16).replace("T", " ") ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{job.next_run_at?.slice(0, 16).replace("T", " ") ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
