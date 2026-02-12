"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { OrderUpload } from "@/components/commande/order-upload";
import { ProductSelector } from "@/components/commande/product-selector";
import { QuantityControl } from "@/components/commande/quantity-control";
import { OrderList } from "@/components/commande/order-list";
import { OrderSummary } from "@/components/commande/order-summary";
import { useNexusStore } from "@/lib/store";
import type { Product } from "@/lib/types";

export default function CommandePage() {
  const catalog = useNexusStore((s) => s.catalog);
  const addItem = useNexusStore((s) => s.addItem);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);

  function handleAdd() {
    if (!selectedProduct) {
      toast.error("Veuillez sélectionner un produit");
      return;
    }
    addItem(selectedProduct, qty);
    toast.success(`${qty}x ${selectedProduct.reference} ajouté à la commande`);
    setSelectedProduct(null);
    setQty(1);
  }

  return (
    <>
      <PageHeader
        title="Nouvelle Commande"
        subtitle="Importez un fichier commande ou ajoutez les produits manuellement"
      />

      {/* Upload zone */}
      <OrderUpload />

      {/* Manual add section (only when catalog is loaded) */}
      {catalog.length > 0 && (
        <>
          {/* Separator */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-text-dim text-xs font-[family-name:var(--font-display)] tracking-[3px] uppercase">
              ou ajout manuel
            </span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
            {/* Left: Add product form */}
            <div className="glass-card">
              <h3 className="font-[family-name:var(--font-display)] text-sm font-bold tracking-[2px] text-text-secondary mb-6">
                AJOUTER UN PRODUIT
              </h3>
              <ProductSelector
                onSelect={setSelectedProduct}
                selected={selectedProduct}
              />
              <QuantityControl value={qty} onChange={setQty} />
              <button
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-br from-primary-cyan to-[#00b8d4] text-bg-deep rounded-lg text-[15px] font-bold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                <Plus className="w-[18px] h-[18px]" />
                Ajouter à la commande
              </button>
            </div>

            {/* Right: Order list + summary */}
            <div className="glass-card">
              <h3 className="font-[family-name:var(--font-display)] text-sm font-bold tracking-[2px] text-text-secondary mb-6">
                COMMANDE EN COURS
              </h3>
              <OrderList />
              <OrderSummary />
            </div>
          </div>
        </>
      )}

      {/* Order list when loaded via file import without catalog */}
      {catalog.length === 0 && (
        <div className="mt-6">
          <OrderList />
          <OrderSummary />
        </div>
      )}
    </>
  );
}
