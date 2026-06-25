"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Zap,
  MessageSquare,
  FileText,
  Clock,
  Activity,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/vault", label: "Vault", icon: FolderOpen },
  { href: "/skills", label: "Skills", icon: Zap },
  { href: "/sessions", label: "Sessions", icon: MessageSquare },
  { href: "/articles", label: "Articles", icon: FileText },
  { href: "/cron", label: "Cron Jobs", icon: Clock },
  { href: "/health", label: "Health", icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link href="/" className="logo">
          <span className="logo-icon">◈</span>
          <div>
            <div className="logo-text">Mission Control</div>
            <div className="logo-subtitle">Performance Brain</div>
          </div>
        </Link>
      </div>

      <nav className="nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="status-pill">
          <span className="status-dot" />
          Online
        </div>
        <div className="vault-path">Elfred Brain/</div>
      </div>
    </aside>
  );
}
