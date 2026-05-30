import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/* ── Page header ── */

export function AdminPageHeader({
  title,
  subtitle,
  breadcrumb,
  action,
  backHref,
  backLabel,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        {breadcrumb ? (
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-ocean-light/70">
            {breadcrumb}
          </p>
        ) : null}
        {backHref ? (
          <Link
            href={backHref}
            className="mb-1 inline-flex items-center gap-1 font-body text-sm text-muted-foreground transition-colors hover:text-ocean-light"
          >
            ← {backLabel ?? "Back"}
          </Link>
        ) : null}
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="font-body text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ── Cards ── */

export function AdminCard({
  className,
  children,
  padding = "default",
}: {
  className?: string;
  children: React.ReactNode;
  padding?: "none" | "default" | "lg";
}) {
  const pad =
    padding === "none" ? "" : padding === "lg" ? "p-6" : "p-5 md:p-6";
  return (
    <div className={cn("admin-card", pad, className)}>{children}</div>
  );
}

export function AdminCardHeader({
  title,
  icon: Icon,
  action,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex items-center justify-between gap-3 border-b border-border-subtle/60 pb-4",
        className,
      )}
    >
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        {Icon ? <Icon className="h-5 w-5 text-gold-light" /> : null}
        {title}
      </h2>
      {action}
    </div>
  );
}

/* ── Stat cards ── */

export function AdminStatCard({
  title,
  value,
  icon: Icon,
  accent = "default",
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "default" | "gold" | "success" | "warning";
}) {
  const accentClasses = {
    default: "text-ocean-light",
    gold: "text-gold-light",
    success: "text-success",
    warning: "text-ocean-mid",
  };

  return (
    <div className="admin-stat-card">
      <div className="flex items-start justify-between gap-3">
        <p className="font-body text-sm font-medium text-muted-foreground">
          {title}
        </p>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full bg-ocean-primary/20",
            accentClasses[accent],
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p
        className={cn(
          "mt-3 font-display text-2xl font-bold tracking-tight",
          accent === "gold" ? "text-gold-light" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function AdminStatSkeleton() {
  return (
    <div className="admin-stat-card space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24 admin-skeleton" />
        <Skeleton className="h-9 w-9 rounded-full admin-skeleton" />
      </div>
      <Skeleton className="h-8 w-28 admin-skeleton" />
    </div>
  );
}

/* ── Data table ── */

export function AdminTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("admin-table-wrap", className)}>
      <table className="admin-table">{children}</table>
    </div>
  );
}

export function AdminTableHead({ children }: { children: React.ReactNode }) {
  return <thead className="admin-table-head">{children}</thead>;
}

export function AdminTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="admin-table-body">{children}</tbody>;
}

export function AdminTh({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("admin-th", className)}>
      {children}
    </th>
  );
}

export function AdminTr({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tr className={cn("admin-tr", className)}>{children}</tr>;
}

export function AdminTd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("admin-td", className)}>{children}</td>;
}

/* ── Status badge (pill) ── */

export function AdminStatusBadge({
  className,
  children,
  variant = "default",
}: {
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "outline";
}) {
  return (
    <Badge
      variant={variant}
      className={cn(
        "rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold uppercase tracking-wide",
        className,
      )}
    >
      {children}
    </Badge>
  );
}

/* ── Empty & loading states ── */

export function AdminEmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-blob" aria-hidden />
      {Icon ? (
        <span className="relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-primary/20 text-ocean-light">
          <Icon className="h-7 w-7" />
        </span>
      ) : null}
      <p className="relative z-10 font-display text-lg font-semibold text-foreground">
        {title}
      </p>
      {description ? (
        <p className="relative z-10 mt-1 max-w-sm font-body text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="relative z-10 mt-4">{action}</div> : null}
    </div>
  );
}

export function AdminLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="admin-spinner" aria-hidden />
      <p className="font-body text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 p-2">
      <Skeleton className="h-10 w-full rounded-xl admin-skeleton" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg admin-skeleton" style={{ opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  );
}

/* ── Form section ── */

export function AdminFormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("admin-form-section", className)}>
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 font-body text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/* ── Bulk actions bar ── */

export function AdminBulkBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("admin-bulk-bar", className)}>{children}</div>
  );
}

/* ── Search input wrapper ── */

export function AdminFilterRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("admin-filter-row", className)}>{children}</div>;
}

export function AdminSearchField({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("admin-search-field", className)}>{children}</div>;
}

/* ── Image upload dropzone ── */

export function AdminImageDropzone({
  isDragActive,
  disabled,
  children,
  rootProps,
}: {
  isDragActive: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  rootProps: React.HTMLAttributes<HTMLDivElement>;
}) {
  return (
    <div
      {...rootProps}
      className={cn(
        "admin-dropzone",
        isDragActive && "admin-dropzone-active",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      {children}
    </div>
  );
}
