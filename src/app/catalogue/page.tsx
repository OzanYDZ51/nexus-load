import { PageHeader } from "@/components/layout/page-header";
import { UploadZone } from "@/components/catalogue/upload-zone";
import { DemoLoader } from "@/components/catalogue/demo-loader";
import { ProductTable } from "@/components/catalogue/product-table";

export default function CataloguePage() {
  return (
    <>
      <PageHeader
        title="Catalogue Produits"
        subtitle="Importez votre fichier Excel pour charger le catalogue de références"
      />
      <UploadZone />
      <DemoLoader />
      <ProductTable />
    </>
  );
}
