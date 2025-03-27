import { useQuery } from '@tanstack/react-query'
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface TranslationStats {
  totalLanguages: number
  motherTongues: number
  newMotherTongues: number
  totalTranslations: number
  completedTranslations: number
  progressPercentage: number
}

async function scanTable(docClient: DynamoDBDocumentClient, tableName: string) {
  const command = new ScanCommand({
    TableName: tableName,
  })
  const response = await docClient.send(command)
  return response.Items || []
}

async function fetchTranslationStats(): Promise<TranslationStats> {
  const client = new DynamoDBClient({
    region: import.meta.env.VITE_AWS_REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
      sessionToken: import.meta.env.VITE_AWS_SESSION_TOKEN,
    },
  })

  const docClient = DynamoDBDocumentClient.from(client)

  // Scan all relevant tables
  const [translations, languages, motherTongues] = await Promise.all([
    scanTable(docClient, 'OmtTranslations-4zxodgpo6zfadoq6zqgzhxovau-NONE'),
    scanTable(docClient, 'OmtLanguages-4zxodgpo6zfadoq6zqgzhxovau-NONE'),
    scanTable(docClient, 'OmtMotherTongues-4zxodgpo6zfadoq6zqgzhxovau-NONE'),
  ])

  // Calculate stats
  const languageSet = new Set<string>()
  const motherTongueSet = new Set<string>()
  const newMotherTongueSet = new Set<string>()
  let totalTranslations = 0
  let completedTranslations = 0

  // Count languages from OmtLanguages table
  languages.forEach((item) => {
    if (item.iso639?.S) {
      languageSet.add(item.iso639.S)
    }
  })

  // Count mother tongues and new mother tongues from OmtMotherTongues table
  motherTongues.forEach((item) => {
    if (item.id?.S) {
      motherTongueSet.add(item.id.S)
      // Check for new mother tongues (not generated or GRN)
      if (
        item.createdById?.S &&
        !['generated', 'GRN'].includes(item.createdById.S)
      ) {
        newMotherTongueSet.add(item.id.S)
      }
    }
  })

  // Count translations and their status
  translations.forEach((item) => {
    totalTranslations++
    if (item.status?.S === 'completed') {
      completedTranslations++
    }
  })

  return {
    totalLanguages: languageSet.size,
    motherTongues: motherTongueSet.size,
    newMotherTongues: newMotherTongueSet.size,
    totalTranslations,
    completedTranslations,
    progressPercentage:
      totalTranslations > 0
        ? Math.round((completedTranslations / totalTranslations) * 100)
        : 0,
  }
}

export function Stats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['translationStats'],
    queryFn: fetchTranslationStats,
  })

  if (isLoading) {
    return <div>Loading stats...</div>
  }

  if (!stats) {
    return <div>No stats available</div>
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Languages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalLanguages}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Mother Tongues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.motherTongues}</div>
          <p className='text-xs text-muted-foreground'>
            {stats.newMotherTongues} new mother tongues identified
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Total Translations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalTranslations}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Translation Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.progressPercentage}%</div>
          <Progress value={stats.progressPercentage} className='mt-2' />
          <p className='mt-1 text-xs text-muted-foreground'>
            {stats.completedTranslations} completed
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
