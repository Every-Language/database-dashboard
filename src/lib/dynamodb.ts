import { DynamoDBClient, ListTablesCommand, ScanCommand } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({
    region: import.meta.env.VITE_AWS_REGION,
    credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
        sessionToken: import.meta.env.VITE_AWS_SESSION_TOKEN,
    },
})

export async function listTables() {
    try {
        const command = new ListTablesCommand({})
        const response = await client.send(command)
        return response.TableNames || []
    } catch (_error) {
        // Log error to your error tracking service instead of console
        return []
    }
}

export async function scanTable(tableName: string) {
    try {
        const command = new ScanCommand({
            TableName: tableName,
        })
        const response = await client.send(command)
        return response.Items || []
    } catch (_error) {
        // Log error to your error tracking service instead of console
        return []
    }
} 