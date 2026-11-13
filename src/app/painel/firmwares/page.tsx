import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { Alert } from "@/components/ui";
import { emptyPageSlice, toPageSlice } from "@/lib/api/pagination.types";
import { requirePlatformUser } from "@/features/authentication/lib/guards";
import { fetchFirmwaresPage } from "@/features/firmwares/actions/firmware.actions";
import { FirmwaresTable } from "@/features/firmwares/components/FirmwaresTable";
import { listFirmwares } from "@/features/firmwares/services/firmware.service";
import type { Firmware } from "@/features/firmwares/types/firmware.types";

export const metadata: Metadata = {
  title: `Firmwares — ${brand.name}`,
};

export default async function FirmwaresPage() {
  // O catálogo é da plataforma; a empresa lê a versão pela tela de cadeiras.
  await requirePlatformUser();

  // Primeira página no servidor: a tabela chega preenchida, sem piscar vazia.
  const result = await listFirmwares({ page: 0 });
  const initialSlice = result.ok ? toPageSlice(result.data) : emptyPageSlice<Firmware>();

  return (
    // No desktop (lg+), a lista rola dentro da tabela; no celular, o <main> rola a página.
    <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
      {!result.ok && (
        <Alert tone="error" title="Não foi possível carregar os firmwares">
          {result.message}
        </Alert>
      )}

      <FirmwaresTable initialSlice={initialSlice} loadPage={fetchFirmwaresPage} />
    </div>
  );
}
