import { useParams } from 'react-router-dom'
import { TableViewer } from '../components/table-viewer'

export default function TablePage() {
  const { tableName } = useParams<{ tableName: string }>()

  if (!tableName) {
    return <div>No table name provided</div>
  }

  return <TableViewer tableName={tableName} />
}
