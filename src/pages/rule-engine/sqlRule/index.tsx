import React, { Fragment, useEffect, useState } from 'react';
import { ColumnProps, PaginationConfig, SorterResult } from 'antd/es/table';
import { Badge, Button, Card, Divider, Form, message, Popconfirm, Table, Upload, Icon } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import styles from '@/utils/table.less';
import { RuleInstanceItem } from './data.d';
import { Dispatch } from '@/models/connect';
import encodeQueryParam from '@/utils/encodeParam';
import Save from './save/index';
import apis from '@/services';
import { downloadObject } from '@/utils/utils';
import { FormComponentProps } from 'antd/lib/form';
import moment from 'moment';
import SearchForm from '@/components/SearchForm';

interface Props extends FormComponentProps {
  dispatch: Dispatch;
  location: Location;
  loading: boolean;
}

interface State {
  data: any;
  searchParam: any;
  saveVisible: boolean;
  current: Partial<RuleInstanceItem>;
}

const SqlRuleList: React.FC<Props> = props => {
  const initState: State = {
    data: [],
    searchParam: {
      pageSize: 10,
      terms: { modelType: 'sql_rule' },
      sorts: {
        order: 'descend',
        field: 'createTime',
      },
    },
    saveVisible: false,
    current: {},
  };

  const [searchParam, setSearchParam] = useState(initState.searchParam);
  const [saveVisible, setSaveVisible] = useState(initState.saveVisible);
  const [current, setCurrent] = useState(initState.current);
  const [data, setData] = useState(initState.data);
  const [loading, setLoading] = useState(false);

  const handleSearch = (params?: any) => {
    setSearchParam(params);
    apis.sqlRule
      .list(encodeQueryParam(params))
      .then(response => {
        if (response.status === 200) {
          setData(response.result);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    handleSearch(searchParam);
  }, []);

  const edit = (record: RuleInstanceItem) => {
    const temp = JSON.parse(record.modelMeta);
    temp.option = 'update';
    temp.id = record.id;
    setCurrent(temp);
    setSaveVisible(true);
  };

  const _start = (record: RuleInstanceItem) => {
    apis.sqlRule
      ._start(record.id)
      .then(response => {
        if (response.status === 200) {
          message.success('????????????');
          handleSearch(searchParam);
        }
      })
      .catch(() => {});
  };

  const _stop = (record: RuleInstanceItem) => {
    apis.sqlRule
      ._stop(record.id)
      .then(response => {
        if (response.status === 200) {
          message.success('????????????');
          handleSearch(searchParam);
        }
      })
      .catch(() => {});
  };

  const handleDelete = (record: RuleInstanceItem) => {
    apis.sqlRule
      .remove(record.id)
      .then(response => {
        if (response.status === 200) {
          message.success('????????????');
          handleSearch(searchParam);
        }
      })
      .catch(() => {});
  };

  const saveOrUpdate = (item: RuleInstanceItem) => {
    setLoading(true);
    apis.sqlRule
      .saveOrUpdate(item)
      .then((response: any) => {
        if (response.status === 200) {
          message.success('????????????');
          setSaveVisible(false);
          handleSearch(searchParam);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  const statusMap = new Map();
  statusMap.set('?????????', 'success');
  statusMap.set('?????????', 'error');
  statusMap.set('?????????', 'processing');

  const columns: ColumnProps<RuleInstanceItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },

    {
      title: '??????',
      dataIndex: 'name',
    },
    {
      title: '????????????',
      dataIndex: 'createTime',
      sorter: true,
      defaultSortOrder: 'descend',
      render: (text: any) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '/'),
    },
    {
      title: '??????',
      dataIndex: 'state',
      render: record =>
        record ? <Badge status={statusMap.get(record.text)} text={record.text} /> : '',
    },
    {
      title: '??????',
      width: '25%',
      render: (text, record) => (
        <Fragment>
          <a onClick={() => edit(record)}>??????</a>
          <Divider type="vertical" />
          {record.state?.value === 'started' ? (
            <span>
              <Popconfirm title="???????????????" onConfirm={() => _stop(record)}>
                <a>??????</a>
              </Popconfirm>
            </span>
          ) : (
            <span>
              <Popconfirm title="?????????????" onConfirm={() => _start(record)}>
                <a>??????</a>
              </Popconfirm>
              <Divider type="vertical" />
              <Popconfirm title="?????????????" onConfirm={() => handleDelete(record)}>
                <a>??????</a>
              </Popconfirm>
            </span>
          )}
          {/*<Divider type="vertical" />*/}
          {/*<a onClick={() => downloadObject(record, '????????????')}>????????????</a>*/}
        </Fragment>
      ),
    },
  ];

  const onTableChange = (
    pagination: PaginationConfig,
    filters: any,
    sorter: SorterResult<RuleInstanceItem>,
  ) => {
    handleSearch({
      pageIndex: Number(pagination.current) - 1,
      pageSize: pagination.pageSize,
      terms: searchParam,
      sorts: sorter,
    });
  };

  return (
    <PageHeaderWrapper title="????????????">
      <Card bordered={false}>
        <div className={styles.tableList}>
          <div>
            <SearchForm
              search={(params: any) => {
                let param = params;
                if (!param) param = {};
                param.modelType = 'sql_rule';
                handleSearch({
                  terms: param,
                  pageSize: 10,
                  sorts: searchParam.sorts || {
                    order: 'descend',
                    field: 'createTime',
                  },
                });
              }}
              formItems={[
                {
                  label: '??????',
                  key: 'name$LIKE',
                  type: 'string',
                },
              ]}
            />
          </div>
          <div className={styles.tableListOperator}>
            <Button
              icon="plus"
              type="primary"
              onClick={() => {
                setCurrent({});
                setSaveVisible(true);
              }}
            >
              ??????
            </Button>
            {/*<Upload*/}
            {/*  showUploadList={false} accept='.json'*/}
            {/*  beforeUpload={(file) => {*/}
            {/*    setLoading(true);*/}
            {/*    const reader = new FileReader();*/}
            {/*    reader.readAsText(file);*/}
            {/*    reader.onload = (result: any) => {*/}
            {/*      try {*/}
            {/*        let data = JSON.parse(result.target.result);*/}
            {/*        saveOrUpdate(data);*/}
            {/*      } catch (error) {*/}
            {/*        message.error('???????????????????????????');*/}
            {/*        setLoading(false);*/}
            {/*      }*/}
            {/*    }*/}
            {/*  }}*/}
            {/*>*/}
            {/*  <Button>*/}
            {/*    <Icon type="upload" />??????*/}
            {/*</Button>*/}
            {/*</Upload>*/}
          </div>
          <div className={styles.StandardTable}>
            <Table
              loading={props.loading}
              dataSource={data?.data}
              columns={columns}
              rowKey="id"
              onChange={onTableChange}
              pagination={{
                current: data.pageIndex + 1,
                total: data.total,
                pageSize: data.pageSize,
                showQuickJumper: true,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total: number) =>
                  `??? ${total} ????????? ???  ${data.pageIndex + 1}/${Math.ceil(
                    data.total / data.pageSize,
                  )}???`,
              }}
            />
          </div>
        </div>
      </Card>
      {saveVisible && (
        <Save
          data={current}
          close={() => {
            setSaveVisible(false);
            setCurrent({});
          }}
          save={(item: RuleInstanceItem) => {
            saveOrUpdate(item);
          }}
        />
      )}
    </PageHeaderWrapper>
  );
};
export default Form.create<Props>()(SqlRuleList);
