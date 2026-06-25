"use client";

import { useState, useEffect } from "react";
import { MessageSquare, RefreshCw } from "lucide-react";

export default function SessionsPage() {
  return (
    <div>
      <h1 className="page-title">Sessions</h1>
      <p className="page-subtitle">Hermes conversation history</p>
      <div className="empty-state">
        <MessageSquare className="w-8 h-8" style={{ opacity: 0.5 }} />
        <p style={{ marginTop: 12 }}>Session tracking coming soon</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Connect Hermes session logs to see history here</p>
      </div>
    </div>
  );
}
