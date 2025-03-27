import { useEffect, useState } from 'react'
import { ColumnDef, Row } from '@tanstack/react-table'
import { scanTable } from '@/lib/dynamodb'
import { DataTable } from '@/features/tasks/components/data-table'

interface TableViewerProps {
  tableName: string
}

interface DynamoDBItem {
  [key: string]: unknown
}

export function TableViewer({ tableName }: TableViewerProps) {
  const [data, setData] = useState<DynamoDBItem[]>([])
  const [columns, setColumns] = useState<ColumnDef<DynamoDBItem>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTableData() {
      setLoading(true)
      try {
        const items = await scanTable(tableName)
        setData(items)

        // Generate columns from the first item's keys
        if (items.length > 0) {
          const firstItem = items[0]
          const generatedColumns = Object.keys(firstItem).map((key) => ({
            accessorKey: key,
            header: key,
            cell: ({ row }: { row: Row<DynamoDBItem> }) => {
              const value = row.getValue(key)
              return typeof value === 'object'
                ? JSON.stringify(value)
                : String(value)
            },
          }))
          setColumns(generatedColumns)
        }
      } catch (_error) {
        // Log error to your error tracking service instead of console
      } finally {
        setLoading(false)
      }
    }

    loadTableData()
  }, [tableName])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold tracking-tight'>{tableName}</h1>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
