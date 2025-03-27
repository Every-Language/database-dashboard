import { createFileRoute } from '@tanstack/react-router'
import { TableViewer } from '@/features/dynamodb/components/table-viewer'

export const Route = createFileRoute('/_authenticated/tables/$tableName')({
  component: TablePage,
})

function TablePage() {
  const { tableName } = Route.useParams()
  if (!tableName) {
    return <div>No table name provided</div>
  }
  return <TableViewer tableName={tableName} />
}
