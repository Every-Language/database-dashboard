import { createFileRoute } from '@tanstack/react-router'
import { TableViewer } from '@/features/dynamodb/components/table-viewer'

export const Route = createFileRoute('/_authenticated/tables/$tableName')({
  component: TablePage,
})

function TablePage() {
  const { tableName } = Route.useParams()
  return <TableViewer tableName={tableName} />
}
