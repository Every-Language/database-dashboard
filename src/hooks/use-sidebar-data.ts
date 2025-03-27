import { useQuery } from '@tanstack/react-query'
import { getSidebarData } from '@/components/layout/data/sidebar-data'
import { type SidebarData } from '@/components/layout/types'

export function useSidebarData() {
    return useQuery<SidebarData>({
        queryKey: ['sidebarData'],
        queryFn: getSidebarData,
    })
} 