import React, { Fragment, useEffect, useState } from 'react';
import { Divider, Card, message, Button, Popconfirm, Icon, Upload, Spin } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import styles from '@/utils/table.less';
import { connect } from 'dva';
import { Dispatch, ConnectState } from '@/models/connect';
import { PermissionItem } from './data.d';
import encodeQueryParam from '@/utils/encodeParam';
import Save from './Save';
import SearchForm from '@/components/SearchForm';
import ProTable from './component/ProTable';
import apis from '@/services';
import { downloadObject } from '@/utils/utils';
// import SettingAutz from "../setting-autz";
interface Props {
  permission: any;
  dispatch: Dispatch;
  location: Location;
  loading: boolean;
}

interface State {
  data: any;
  searchParam: any;
  saveVisible: boolean;
  currentItem: Partial<PermissionItem>;
  saveLoading: boolean;
  autzVisible: boolean;
}

const PermissionList: React.FC<Props> = props => {
  const { dispatch } = props;
  const { result } = props.permission;

  const initState: State = {
    data: result,
    searchParam: { pageSize: 10 },
    saveVisible: false,
    saveLoading: false,
    currentItem: {},
    autzVisible: false,
  };

  const [currentItem, setCurrentItem] = useState(initState.currentItem);
  const [searchParam, setSearchParam] = useState(initState.searchParam);
  const [saveVisible, setSaveVisible] = useState(initState.saveVisible);
  const [saveLoading, setSaveLoading] = useState(initState.saveLoading);
  const [loading, setLoading] = useState(false);
  const handleSearch = (params?: any) => {
    const temp = { ...searchParam, ...params };
    setSearchParam(temp);
    dispatch({
      type: 'permission/query',
      payload: encodeQueryParam(temp),
    });
  };

  useEffect(() => {
    handleSearch(searchParam);
  }, []);

  const edit = (record: PermissionItem) => {
    setSaveVisible(true);
    setCurrentItem(record);
  };

  const saveOrUpdate = (permission: PermissionItem) => {
    setSaveLoading(true);
    if(!!currentItem.id){
      dispatch({
        type: 'permission/updata',
        payload: encodeQueryParam(permission),
        callback: (response: any) => {
          if (response.status === 200) {
            setCurrentItem({});
            message.success('????????????');
            handleSearch(setSearchParam);
            setSaveVisible(false);
          }
          setSaveLoading(false);
        },
      });
    }else{
      dispatch({
        type: 'permission/insert',
        payload: encodeQueryParam(permission),
        callback: (response: any) => {
          if (response.status === 200) {
            setCurrentItem({});
            message.success('????????????');
            handleSearch(setSearchParam);
            setSaveVisible(false);
          }
          setSaveLoading(false);
        },
      });
    }
  };
  const handleDelete = (params: any) => {
    dispatch({
      type: 'permission/remove',
      payload: params.id,
      callback: (res) => {
        if(res.status === 200){
          message.success('????????????');
          handleSearch(searchParam);
        }
      },
    });
  };

  const columns: any[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '??????',
      dataIndex: 'name',
    },
    {
      title: '??????',
      dataIndex: 'status',
      filters: [
        {
          text: '??????',
          value: 1
        },
        {
          text: '??????',
          value: 0,
        }
      ],
      render: (text: any) => (text === 1 ? '??????' : '??????'),
    },
    {
      title: '??????',
      render: (text: any, record: any) => (
        <Fragment>
          <a onClick={() => edit(record)}>??????</a>
          <Divider type="vertical" />
          <Popconfirm
            title="???????????????????????????"
            onConfirm={() => {
              handleDelete(record);
              setSaveLoading(false);
            }}
          >
            <a>??????</a>
          </Popconfirm>
        </Fragment>
      ),
    },
  ];
  return (
    <PageHeaderWrapper title="????????????">
      <Card bordered={false}>
        <div className={styles.tableList}>
          <div>
            <SearchForm
              search={(params: any) => {
                handleSearch({ terms: { ...params }, pageSize: 10, pageIndex: 0 });
              }}
              formItems={[
                {
                  label: "ID",
                  key: "id$LIKE",
                  type: 'string'
                },
                {
                  label: "??????",
                  key: "name$LIKE",
                  type: 'string'
                }
              ]}
            />
          </div>
          <div className={styles.tableListOperator}>
            <Button
              icon="plus"
              type="primary"
              onClick={() => {
                setSaveVisible(true);
                setSaveLoading(false);
              }}
            >
              ??????
            </Button>
            <Button
              onClick={() => {
                apis.permission.listNoPaging({}).then((resp) => {
                  if (resp.status === 200) {
                    downloadObject(resp.result, '????????????');
                    message.success('????????????');
                  } else {
                    message.error('????????????');
                  }
                })
              }}
            >
              <Icon type="export" /> ??????
            </Button>
            <Upload
              showUploadList={false} accept='.json'
              beforeUpload={(file) => {
                setLoading(true);
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = (result: any) => {
                  try {
                    let data = JSON.parse(result.target.result);
                    apis.permission.add(data).then(resp => {
                      if (resp.status === 200) {
                        message.success('????????????');
                      }
                      setLoading(false);
                    })
                  } catch (error) {
                    message.error('???????????????????????????');
                    setLoading(false);
                  }
                }
              }}
            >
              <Button>
                <Icon type="upload" />??????
            </Button>
            </Upload>
          </div>
          <div className={styles.StandardTable}>
            <Spin spinning={loading}>
              <ProTable
                loading={props.loading}
                dataSource={result?.data}
                columns={columns}
                rowKey="id"
                onSearch={(params: any) => {
                  handleSearch({ ...params, terms: searchParam.terms, sorts: searchParam.sorts });
                }}
                paginationConfig={result}
              />
            </Spin>
          </div>
        </div>
      </Card>
      {saveVisible && (
        <Save
          close={() => {
            setSaveVisible(false);
            setCurrentItem({});
            handleSearch(searchParam);
          }}
          loading={saveLoading}
          save={(permission: PermissionItem) => {
            saveOrUpdate(permission);
          }}
          data={currentItem}
        />
      )}
    </PageHeaderWrapper>
  );
};
export default connect(({ permission, loading }: ConnectState) => ({
  permission,
  loading: loading.models.permission,
}))(PermissionList);
