import { TOIMobileNavClient } from './TOIMobileNavClient'

export function TOIMobileNav({ tenantSlug }: { tenantSlug: string }) {
  return <TOIMobileNavClient tenantSlug={tenantSlug} />
}
