"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingCart, Truck, PieChart } from "lucide-react";

const navItems = [
  { key: "catalogue", label: "Catalogue", href: "/catalogue", icon: Package },
  { key: "commande", label: "Commande", href: "/commande", icon: ShoppingCart },
  { key: "optimisation", label: "Optimisation", href: "/optimisation", icon: Truck },
  { key: "dashboard", label: "Tableau de Bord", href: "/dashboard", icon: PieChart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 w-[280px] h-screen bg-bg-surface backdrop-blur-[20px] border-r border-glass-border z-[100] hidden md:flex flex-col">
      {/* Logo */}
      <div className="p-7 border-b border-border-subtle">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 bg-gradient-to-br from-primary-cyan to-secondary-purple rounded-xl flex items-center justify-center text-xl font-black font-[family-name:var(--font-display)] text-bg-deep"
            style={{ animation: "logoPulse 3s ease-in-out infinite" }}
          >
            N
          </div>
          <div>
            <div className="font-[family-name:var(--font-display)] text-[22px] font-extrabold tracking-[3px] gradient-text">
              NEXUS
            </div>
            <div className="text-[10px] tracking-[4px] uppercase text-text-dim font-semibold mt-0.5">
              Intelligence Logistique
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname === `${item.href}/`;
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-[14px] transition-all duration-200 relative overflow-hidden font-semibold text-[15px] tracking-wide ${
                isActive
                  ? "bg-primary-dim text-primary-cyan"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 w-[3px] h-full bg-primary-cyan rounded-r-sm" />
              )}
              <Icon className="w-5 h-5 shrink-0" strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-border-subtle">
        <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-br from-primary-dim to-secondary-dim border border-border-glow rounded-full font-[family-name:var(--font-display)] text-[10px] font-bold tracking-[2px] text-primary-cyan">
          <div
            className="w-2 h-2 bg-primary-cyan rounded-full"
            style={{ animation: "aiDotPulse 2s ease-in-out infinite" }}
          />
          NEXUS IA ACTIF
        </div>
      </div>
    </nav>
  );
}
