"use client";
import React from "react";
import { TrendingUp, Headphones, Users, Megaphone, Settings } from "lucide-react";

const ROLES = [
  { id: "Sales", icon: TrendingUp, label: "Sales" },
  { id: "Customer Support", icon: Headphones, label: "Support" },
  { id: "HR", icon: Users, label: "HR" },
  { id: "Marketing", icon: Megaphone, label: "Marketing" },
  { id: "Operations", icon: Settings, label: "Operations" },
];

interface Props {
  selectedRole: string;
  onSelect: (role: string) => void;
}

export default function RoleSelector({ selectedRole, onSelect }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Select your role
      </p>
      <div className="grid grid-cols-5 gap-2">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const isActive = selectedRole === r.id;
          return (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition-all ${
                isActive
                  ? "border-primary/50 bg-primary/15 text-white shadow-[0_0_20px_theme(colors.violet.500/0.15)]"
                  : "border-white/10 bg-white/[0.025] text-muted-foreground hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon className={`size-4 ${isActive ? "text-primary" : ""}`} />
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}