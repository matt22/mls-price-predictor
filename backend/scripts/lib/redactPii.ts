// Strips names, mailing addresses, and phone/email contact info from
// RentCast responses before anything is written to disk or committed.

export function redactSaleListing<T extends Record<string, unknown>>(listing: T): T {
  const { listingAgent, listingOffice, ...rest } = listing as Record<string, any>;
  return {
    ...rest,
    ...(listingOffice ? { listingOffice: { name: listingOffice.name } } : {}),
  } as T;
}

export function redactPropertyRecord<T extends Record<string, unknown>>(record: T): T {
  const { owner, ownerOccupied, ...rest } = record as Record<string, any>;
  return rest as T;
}
