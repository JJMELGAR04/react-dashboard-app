import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  DatePicker,
} from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useState } from 'react'
import type Movimiento from '@/models/api/entities/Movimiento'
import type Cuenta from '@/models/api/entities/Cuenta'
import { queryKeys } from '@/lib/queryClient'
import { movimientoService, cuentaService } from '@/services/api'
import { useFindAll } from '@/hooks/core/useFindAll'
import useCrud from '@/hooks/core/useCrud'
import dayjs from 'dayjs'

export default function MovimientosView() {
  const [params, setParams] = useState<Record<string, unknown>>({
    page: 0,
    size: 10,
  })

  const { data: response, isLoading } = useFindAll<Movimiento>({
    queryKey: queryKeys.movimientos,
    service: movimientoService,
    queryParams: params,
  })

  const { data: cuentasResponse } = useFindAll<Cuenta>({
    queryKey: queryKeys.cuentas,
    service: cuentaService,
    queryParams: { page: 0, size: 100 },
  })

  const crud = useCrud<Movimiento>({
    service: movimientoService,
    queryKey: queryKeys.movimientos,
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
    await crud.create({
      payload: {
        ...values,
        fecha: values.fecha
          ? values.fecha.format('YYYY-MM-DDTHH:mm:ss')
          : dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      },
    })
    setOpen(false)
    form.resetFields()
  }

  const cuentaOptions = cuentasResponse?.data?.map((c: Cuenta) => ({
    label: `${c.alias} (${c.moneda})`,
    value: c.id,
  }))

  const columns: ColumnsType<Movimiento> = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
    { title: 'Monto', dataIndex: 'monto', key: 'monto', align: 'center' },
    {
      title: 'Moneda',
      dataIndex: 'monedaOriginal',
      key: 'monedaOriginal',
      align: 'center',
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      align: 'center',
      render: (v) => {
        if (Array.isArray(v)) {
          return dayjs(
            new Date(v[0], v[1] - 1, v[2], v[3] ?? 0, v[4] ?? 0)
          ).format('DD/MM/YYYY HH:mm')
        }
        return dayjs(v).format('DD/MM/YYYY HH:mm')
      },
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      align: 'center',
    },
    {
      title: 'Cuenta',
      key: 'cuenta',
      align: 'center',
      render: (_text, record) => record.cuenta?.alias ?? '-',
    },
  ]

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button type="primary" onClick={() => setOpen(true)}>
          Nuevo movimiento
        </Button>
      </div>

      <Table<Movimiento>
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
        title="Nuevo movimiento"
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="cuentaId"
            label="Cuenta"
            rules={[{ required: true }]}
          >
            <Select options={cuentaOptions} />
          </Form.Item>
          <Form.Item name="monto" label="Monto" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item
            name="monedaOriginal"
            label="Moneda"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: 'USD', value: 'USD' },
                { label: 'EUR', value: 'EUR' },
                { label: 'GTQ', value: 'GTQ' },
              ]}
            />
          </Form.Item>
          <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
