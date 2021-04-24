import React, {Fragment, useEffect, useState} from "react";
import {Button, Card, Divider, Modal, Popconfirm, Table} from "antd";
import {PageHeaderWrapper} from "@ant-design/pro-layout";
import Save from './save'
import Edit from './edit'
import api from '@/services'

export const TenantContext = React.createContext({});

interface Props {
  data: any;
}

const Category = (props: Props) => {

  const [saveVisible, setSaveVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [params, setParams] = useState({
    type: '编辑',
    description: "",
    id: "",
    name: "",
    parentId: ''
  });
  const [categoryList, setCategoryList] = useState([]);

  const columns = [
    {
      title: '分类ID',
      align: 'left',
      width: 150,
      dataIndex: 'id',
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      align: 'center',
      width: 200
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 300,
      align: 'center',
      ellipsis: true,
      render: (description: string) => description ? description : '--'
    },
    {
      title: '操作',
      width: '200px',
      align: 'center',
      render: (record: any) => (
        <Fragment>
          <a onClick={() => { setEditVisible(true); setParams({ type: '编辑',parentId: '', id: record.id, name: record.name, description: record.description}) }}>编辑</a>
          <Divider type="vertical" />
          <a onClick={() => {setSaveVisible(true); setParams({ type: '新增子',parentId: record.id, id: '', name: '', description: ''})}}>添加子分类</a>
          <Divider type="vertical" />
          <Popconfirm
            title="确认删除？"
            onConfirm={() => {
              delConfirm(record.id);
            }}
          >
            <a>删除</a>
          </Popconfirm>
        </Fragment>
      ),
    },
  ];

  const delConfirm = (id: string) => {
    api.categoty.remove(id).then(res => {
      if (res.status === 200) {
        handleSearch();
      }
    })
  };
  const handleSearch = () => {
    api.categoty.query_tree({}).then(res => {
      if (res.status === 200) {
        setCategoryList(res.result)
      }
    })
  };
  useEffect(() => {
    handleSearch();
  }, []);
  return (
    <div>
      <PageHeaderWrapper title="分类管理">
        <Card>
          <Button icon="plus" type="primary" style={{ marginBottom: '20px' }} onClick={i => { setSaveVisible(true); setParams({ type: '新增',parentId: '', id: '', name: '', description: ''})}}>新增</Button>
          <TenantContext.Provider value={categoryList}>
            <Table dataSource={(categoryList || [])} rowKey="id" columns={columns}
              pagination={false} />
          </TenantContext.Provider>
        </Card>
      </PageHeaderWrapper>
      {saveVisible && <Save data={params} close={() => {
        setSaveVisible(false)
      }} save={() => {setSaveVisible(false); handleSearch()}} />}
      {editVisible && <Edit data={params} close={() => {
        setEditVisible(false)
      }} edit={() => {setEditVisible(false); handleSearch()}} />}
    </div>
  )
};

export default Category
