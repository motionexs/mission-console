"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function CronPage() {
  return (
    <div>
      <h1 className="page-title">Cron Jobs</h1>
      <p className="page-subtitle">Scheduled tasks</p>
      <div className="empty-state">
        <Clock className="w-8 h-8" style={{ opacity: 0.5 }} />
        <p style={{ marginTop: 12 }}>No cron jobs configured</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Schedule recurring tasks via Hermes CLI to see them here</p>
      </div>
    </div>
  );
}
