import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { Fragment, useEffect, useState } from 'react';
import { Button, Card, Col, Divider, Form, Icon, Input, message, Popconfirm, Row, Table } from 'antd';
import apis from '@/services';
import { ConnectState, Dispatch } from '@/models/connect';
import { connect } from 'dva';
import { FormComponentProps } from 'antd/es/form';
import encodeQueryParam from '@/utils/encodeParam';
import { downloadObject } from '@/utils/utils';
import Upload from 'antd/lib/upload';
import { PaginationConfig } from 'antd/lib/table';
import Save from './save';
import StandardFormRow from '../components/standard-form-row';
import TagSelect from '../components/tag-select';
import styles from '../index.less';
import Debug from './debugger';
import Logger from './log';

interface Props extends FormComponentProps {
  dispatch: Dispatch;
  noticeConfig: any;
  loading: boolean;
}

interface State {
  typeList: any[];
  // activeType: string;
  saveVisible: boolean;
  currentItem: any;
  searchParam: any;
  filterType: string[];
  filterName: string;
  debugVisible: boolean;
}

const formItemLayout = {
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const Config: React.FC<Props> = props => {
  const { noticeConfig, loading, dispatch } = props;

  const initState: State = {
    typeList: [],
    // activeType: '',
    saveVisible: false,
    currentItem: {},
    searchParam: {},
    filterType: [],
    filterName: '',
    debugVisible: false,
  };
  const [typeList, setTypeList] = useState(initState.typeList);
  // const [activeType, setActiveType] = useState(initState.activeType);
  const [saveVisible, setSaveVisible] = useState(initState.saveVisible);
  const [currentItem, setCurrentItem] = useState(initState.currentItem);
  const [searchParam, setSearchParam] = useState(initState.searchParam);
  const [filterType, setFilterType] = useState(initState.filterType);
  const [filterName, setFilterName] = useState(initState.filterName);
  const [debugVisible, setDebugVisible] = useState(initState.debugVisible);
  const [logVisible, setLogVisible] = useState(false);
  const handlerSearch = (params?: any) => {
    dispatch({
      type: 'noticeConfig/query',
      payload: encodeQueryParam(params),
    });
    setSearchParam(params);
  };

  const onSearch = (type?: string[], name?: string) => {
    const tempType = type || filterType;
    const tempName = name || filterName;
    const param = {
      paging: false,
      sorts: {
        field: 'id',
        order: 'desc',
      },
      terms: {
        type$IN: tempType,
        name$LIKE: tempName,
      },
    };
    setSearchParam(param);
    dispatch({
      type: 'noticeConfig/query',
      payload: encodeQueryParam(param),
    });
  };

  useEffect(() => {
    apis.notifier.configType().then((res: any) => {
      if (res) {
        setTypeList(res.result);
      }
    });
    handlerSearch({
      pageIndex: 0,
      pageSize: 10,
    });
  }, []);

  const remove = (record: any) => {
    dispatch({
      type: 'noticeConfig/remove',
      payload: record.id,
      callback: () => {
        message.success('????????????');
        handlerSearch(searchParam);
      },
    });
  };

  const saveData = (item: any) => {
    dispatch({
      type: 'noticeConfig/insert',
      payload: item,
      callback: () => {
        message.success('????????????');
        setSaveVisible(false);
        handlerSearch(searchParam);
      },
    });
  };

  const onTableChange = (
    pagination: PaginationConfig,
    filters: any,
    sorter: any,
  ) => {
    handlerSearch({
      pageIndex: Number(pagination.current) - 1,
      pageSize: pagination.pageSize,
      terms: searchParam,
      sorts: sorter,
    });
  };

  const uploadProps = (item: any) => {
    dispatch({
      type: 'noticeConfig/insert',
      payload: item,
      callback: () => {
        message.success('????????????');
        handlerSearch(searchParam);
      },
    });
  };

  /*const uploadProps: UploadProps = {
    accept: '.json',
    action: '/jetlinks/file/static',
    headers: {
      'X-Access-Token': getAccessToken(),
    },
    showUploadList: false,
    onChange(info) {

      if (info.file.status === 'done') {
        const fileUrl = info.file.response.result;
        request(fileUrl, { method: 'GET' }).then(e => {
          dispatch({
            type: 'noticeConfig/insert',
            payload: e,
            callback: () => {
              message.success('????????????');
              handlerSearch(searchParam);
            },
          });
        });
      }
      if (info.file.status === 'error') {
        message.error(`${info.file.name} ????????????.`);
      }
    },
  };*/

  return (
    <PageHeaderWrapper title="????????????">
      <div className={styles.filterCardList}>
        <Card bordered={false}>
          <Form layout="inline">
            <StandardFormRow title="????????????" block style={{ paddingBottom: 11 }}>
              <Form.Item>
                <TagSelect
                  // expandable
                  onChange={(value: any[]) => {
                    setFilterType(value);
                    onSearch(value, undefined);
                  }}
                >
                  {(typeList || []).map(item => (
                    <TagSelect.Option key={item.id} value={item.id}>
                      {item.name}
                    </TagSelect.Option>
                  ))}
                </TagSelect>
              </Form.Item>
            </StandardFormRow>
            <StandardFormRow title="????????????" grid last>
              <Row gutter={16}>
                <Col lg={8} md={10} sm={10} xs={24}>
                  <Form.Item {...formItemLayout} label="????????????">
                    <Input
                      onChange={e => {
                        setFilterName(e.target.value);
                        onSearch(undefined, e.target.value);
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </StandardFormRow>
          </Form>
        </Card>
        <br />
        <Card>
          <Button
            onClick={() => {
              setCurrentItem({});
              setSaveVisible(true);
            }}
            type="primary"
            style={{ marginBottom: 16 }}
          >
            ??????
          </Button>
          <Divider type="vertical" />
          <Button
            onClick={() => {
              downloadObject(noticeConfig.result?.data, '????????????');
            }}
            style={{ marginBottom: 16 }}
          >
            ????????????
          </Button>
          <Divider type="vertical" />
          {/*<Upload {...uploadProps}>
            <Button type="primary" style={{ marginBottom: 16 }}>
              ????????????
            </Button>
          </Upload>*/}
          <Upload
            showUploadList={false} accept='.json'
            beforeUpload={(file) => {
              const reader = new FileReader();
              reader.readAsText(file);
              reader.onload = (result) => {
                try {
                  uploadProps(JSON.parse(result.target.result));
                } catch (error) {
                  message.error('??????????????????');
                }
              }
            }}
          >
            <Button>
              <Icon type="upload" />????????????
            </Button>
          </Upload>
          <Table
            rowKey="id"
            loading={loading}
            onChange={onTableChange}
            columns={[
              {
                dataIndex: 'id',
                title: 'ID',
                defaultSortOrder: 'descend',
              },
              {
                dataIndex: 'name',
                title: '????????????',
              },
              {
                dataIndex: 'type',
                title: '????????????',
              },
              {
                dataIndex: 'provider',
                title: '?????????',
              },
              {
                dataIndex: 'option',
                title: '??????',
                render: (text, record: any) => (
                  <Fragment>
                    <a
                      onClick={() => {
                        setCurrentItem(record);
                        setSaveVisible(true);
                      }}
                    >
                      ??????
                    </a>
                    <Divider type="vertical" />
                    <Popconfirm
                      title="???????????????"
                      onConfirm={() => {
                        remove(record);
                      }}
                    >
                      <a>??????</a>
                    </Popconfirm>
                    <Divider type="vertical" />
                    <a onClick={() => downloadObject(record, '????????????')}>????????????</a>
                    <Divider type="vertical" />
                    <a
                      onClick={() => {
                        setCurrentItem(record);
                        setDebugVisible(true);
                      }}
                    >
                      ??????
                    </a>
                    <Divider type="vertical" />
                    <a
                      onClick={() => {
                        setCurrentItem(record);
                        setLogVisible(true);
                      }}
                    >
                      ????????????
                    </a>
                  </Fragment>
                ),
              },
            ]}
            dataSource={noticeConfig.result?.data}
            pagination={{
              current: noticeConfig.result?.pageIndex + 1,
              total: noticeConfig.result?.total,
              pageSize: noticeConfig.result?.pageSize,
              showQuickJumper: true,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total: number) =>
                `??? ${total} ????????? ???  ${noticeConfig.result?.pageIndex + 1}/${Math.ceil(
                  noticeConfig.result?.total / noticeConfig.result?.pageSize,
                )}???`,
            }}
          />
        </Card>
      </div>

      {saveVisible && (
        <Save
          data={currentItem}
          close={() => setSaveVisible(false)}
          save={(item: any) => saveData(item)}
        />
      )}
      {debugVisible && <Debug data={currentItem} close={() => setDebugVisible(false)} />}
      {logVisible && <Logger close={() => setLogVisible(false)} data={currentItem} />}
    </PageHeaderWrapper>
  );
};

export default connect(({ noticeConfig, loading }: ConnectState) => ({
  noticeConfig,
  loading: loading.models.noticeConfig,
}))(Form.create<Props>()(Config));
