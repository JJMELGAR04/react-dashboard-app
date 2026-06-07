import { Table } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useState } from 'react'
import type Permissions from '@/models/api/entities/Permissions'
import { permissionService } from '@/services/api'
import { useFindAll } from '@/hooks/core/useFindAll'
import { queryKeys } from '@/lib/queryClient'

export default function PermissionsView() {
  const [params, setParams] = useState<Record<string, unknown>>({
    page: 0,
    size: 15,
  })

  const { data: response, isLoading } = useFindAll<Permissions>({
    queryKey: queryKeys.permissions,
    service: permissionService,
    queryParams: params,
  })

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setParams((prev) => ({
      ...prev,
      page: (pagination.current ?? 1) - 1,
      size: pagination.pageSize ?? prev.size,
    }))
  }

  const columns: ColumnsType<Permissions> = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
    { title: 'Método', dataIndex: 'method', key: 'method', align: 'center' },
    { title: 'Ruta', dataIndex: 'path', key: 'path', align: 'center' },
    { title: 'Título', dataIndex: 'title', key: 'title', align: 'center' },
  ]

  return (
    <div>
      <Table<Permissions>
        columns={columns}
        dataSource={response?.data}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: (response?.pagination.page ?? 0) + 1,
          pageSize: response?.pagination.pageSize,
          total: response?.pagination.total ?? 0,
          showSizeChanger: true,
          position: ['bottomCenter'],
        }}
        onChange={handleTableChange}
      />
    </div>
  )
}
