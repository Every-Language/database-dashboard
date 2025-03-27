import { IconLayoutDashboard } from '@tabler/icons-react'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
import { type SidebarData } from '../types'
import { listTables } from '@/lib/dynamodb'

// Function to fetch DynamoDB tables and update sidebar
export async function getSidebarData(): Promise<SidebarData> {
  const tables = await listTables()

  return {
    user: {
      name: 'Public',
      email: 'public@gmail.com',
      avatar: '/avatars/shadcn.jpg',
    },
    teams: [
      {
        name: 'Public',
        logo: Command,
        plan: 'Vite + ShadcnUI',
      },
      {
        name: 'Some custom team',
        logo: GalleryVerticalEnd,
        plan: 'Enterprise',
      },
      {
        name: 'Another custom team',
        logo: AudioWaveform,
        plan: 'Startup',
      },
    ],
    navGroups: [
      {
        title: 'General',
        items: [
          {
            title: 'Dashboard',
            url: '/',
            icon: IconLayoutDashboard,
          },
        ],
      },
      {
        title: 'DynamoDB Tables',
        items: tables.map((tableName: string) => ({
          title: tableName,
          url: { to: '/tables/$tableName', params: { tableName } },
          icon: IconLayoutDashboard,
        })),
      },
    ],
  }
}
