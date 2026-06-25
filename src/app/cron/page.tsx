import { prisma } from "@/lib/prisma";
import { Clock, Play, Pause } from "lucide-react";

export const dynamic = "force-dynamic";

async function getJobs() {
  try {
    const jobs = await prisma.cronJob.findMany({ orderBy: { createdAt: "desc" } });
    return jobs;
  } catch {
    return [];
  }
}

export default async function CronPage() {
  const jobs = await getJobs();

  if (jobs.length === 0) {
    return (
      <div>
        <h1 className="page-title">Cron Jobs</h1>
        <p className="page-subtitle">No scheduled jobs configured.</p>
        <div className="empty-state">
          <div className="empty-state-icon">⏰</div>
          <p>Schedule recurring tasks via Hermes CLI to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Cron Jobs</h1>
      <p className="page-subtitle">{jobs.length} scheduled tasks</p>

      <div className="card">
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Last Run</th>
                <th>Runs</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td style={{ fontWeight: 500 }}>{job.name}</td>
                  <td><span className="badge">{job.schedule}</span></td>
                  <td>
                    <span className={`badge ${job.isActive ? "green" : "amber"}`}>
                      {job.isActive ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td style={{ fontSize: 11 }}>
                    {job.lastRun ? new Date(job.lastRun).toLocaleDateString() : "—"}
                  </td>
                  <td>{job.runCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
