import React, {Fragment, useContext, useEffect, useState} from 'react';
import {FormComponentProps} from 'antd/es/form';
import {Button, Card, Divider, Form, Table} from 'antd';
import {ColumnProps} from 'antd/lib/table';
import {TagsMeta} from './component/data.d';
import TagsDefin from './component/tags';
import {TenantContext} from "@/pages/device/instance/editor/detail/Definition";

interface Props extends FormComponentProps {
  save: Function;
  data: any[];
  unitsData: any;
}

interface State {
  data: TagsMeta[];
  current: Partial<TagsMeta>;
  visible: boolean;
}

const Tags: React.FC<Props> = (props: Props) => {
  const tenantContextData = useContext(TenantContext);
  const initState: State = {
    data: props.data || [],
    current: {},
    visible: false,
  };

  const [visible, setVisible] = useState(initState.visible);
  const [data, setData] = useState(initState.data);
  const [current, setCurrent] = useState(initState.current);

  useEffect(() => {
    setData(tenantContextData.tags || [])
  }, [tenantContextData]);
  const editItem = (item: any) => {
    setVisible(true);
    setCurrent(item);
  };

  const deleteItem = (item: any) => {
    const temp = data.filter(e => e.id !== item.id);
    setData(temp);
    props.save(temp);
  };

  const columns: ColumnProps<TagsMeta>[] = [
    {
      title: '属性标识',
      dataIndex: 'id',
    },
    {
      title: '属性名称',
      dataIndex: 'name',
    },
    {
      title: '数据类型',
      dataIndex: 'valueType',
      render: text => text?.type,
    },
    {
      title: '是否只读',
      dataIndex: 'expands.readOnly',
      render: text => (text === 'true' ? '是' : '否'),
    },
    {
      title: '说明',
      dataIndex: 'description',
      width:'30%',
      ellipsis:true
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <a onClick={() => editItem(record)}>编辑</a>
          <Divider type="vertical"/>
          <a onClick={() => deleteItem(record)}>删除</a>
        </Fragment>
      ),
    },
  ];

  const saveTagsData = (item: TagsMeta) => {
    if (!data) {
      setData([]);
    }
    const i = data.findIndex((j: any) => j.id === item.id);
    if (i > -1) {
      data[i] = item;
    } else {
      data.push(item);
    }
    setVisible(false);
    setData(data);
    props.save(data);
  };
  return (
    <div>
      <Card
        title="标签定义"
        style={{marginBottom: 20}}
        extra={
          <Button type="primary" onClick={() => {
            setCurrent({});
            setVisible(true);
          }}>
            添加
          </Button>
        }
      >
        <Table rowKey="id" columns={columns} dataSource={data}/>
      </Card>
      {visible && (
        <TagsDefin
          data={current}
          unitsData={props.unitsData}
          save={(item: TagsMeta) => {
            saveTagsData(item);
          }}
          close={() => {
            setVisible(false);
            setCurrent({});
          }}
        />
      )}
    </div>
  );
};
export default Form.create<Props>()(Tags);
