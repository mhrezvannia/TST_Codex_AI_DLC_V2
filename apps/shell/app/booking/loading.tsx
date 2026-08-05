import { Skeleton, Stack, Table, TableContainer } from "@erp/ui";

export default function BookingLoading() {
  return (
    <section aria-label="Loading bookings" aria-busy="true" aria-live="polite" data-state="loading">
      <Stack>
        <Skeleton height={34} width="14rem" />
        <Skeleton height={42} />
        <TableContainer>
          <Table aria-label="Loading booking records">
            <tbody>{Array.from({ length: 5 }, (_, index) => <tr key={index}><td><Skeleton height={22} /></td></tr>)}</tbody>
          </Table>
        </TableContainer>
      </Stack>
    </section>
  );
}
