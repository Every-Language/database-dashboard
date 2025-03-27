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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTableData() {
      setLoading(true)
      setError(null)
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
        } else {
          setColumns([])
        }
      } catch (_error) {
        setError('Failed to load table data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadTableData()
  }, [tableName])

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-lg'>Loading table data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-lg text-red-500'>{error}</div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold tracking-tight'>{tableName}</h1>
      {data.length === 0 ? (
        <div className='text-center text-gray-500'>
          No items found in this table
        </div>
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  )
}
