import { Button, Form, Input, InputNumber, Modal, Select, Table } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useState } from 'react'
import type Cuenta from '@/models/api/entities/Cuenta'
import { queryKeys } from '@/lib/queryClient'
import { cuentaService } from '@/services/api'
import { useFindAll } from '@/hooks/core/useFindAll'
import useCrud from '@/hooks/core/useCrud'

export default function CuentasView() {
  console.log('CuentasView renderizando')
  const [params, setParams] = useState<Record<string, unknown>>({
    page: 0,
    size: 10,
  })

  const { data: response, isLoading } = useFindAll<Cuenta>({
    queryKey: queryKeys.cuentas,
    service: cuentaService,
    queryParams: params,
  })

  const crud = useCrud<Cuenta>({
    service: cuentaService,
    queryKey: queryKeys.cuentas,
  })

  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setParams((prev) => ({
      ...prev,
      page: (pagination.current ?? 1) - 1,
      size: pagination.pageSize ?? prev.size,
    }))
  }

  const handleOk = async () => {
    const values = await form.validateFields()
    await crud.create({ payload: values })
    setOpen(false)
    form.resetFields()
  }

  const columns: ColumnsType<Cuenta> = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
    { title: 'Alias', dataIndex: 'alias', key: 'alias', align: 'center' },
    { title: 'Moneda', dataIndex: 'moneda', key: 'moneda', align: 'center' },
    {
      title: 'Saldo',
      dataIndex: 'saldoBase',
      key: 'saldoBase',
      align: 'center',
    },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', align: 'center' },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'center',
      render: (_text: unknown, record: Cuenta) => (
        <Button
          type="link"
          danger
          onClick={async () => await crud.remove({ id: record.id!.toString() })}
        >
          Eliminar
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button type="primary" onClick={() => setOpen(true)}>
          Nueva cuenta
        </Button>
      </div>

      <Table<Cuenta>
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

      <Modal
        title="Nueva cuenta"
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="alias" label="Alias" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="moneda" label="Moneda" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'USD', value: 'USD' },
                { label: 'EUR', value: 'EUR' },
                { label: 'GTQ', value: 'GTQ' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="saldoBase"
            label="Saldo inicial"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Ahorro', value: 'Ahorro' },
                { label: 'Corriente', value: 'Corriente' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
