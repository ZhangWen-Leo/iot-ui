import SearchForm from "@/components/SearchForm";
import ProTable from "@/pages/system/permission/component/ProTable";
import apis from "@/services";
import encodeQueryParam from "@/utils/encodeParam";
import { PageHeaderWrapper } from "@ant-design/pro-layout";
import { Card, Divider, message, Modal, Tag, Input, Form } from "antd";
import { ColumnProps } from "antd/lib/table";
import moment from "moment";
import { FormComponentProps } from "antd/lib/form";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { AlarmLog } from "../alarm/data";

interface Props extends FormComponentProps{ }
const Alarmlog: React.FC<Props> = props => {
    const {
        form: {getFieldDecorator},
        form,
      } = props;
    const [loading, setLoading] = useState(false);
    const [solveVisible, setSolveVisible] = useState(false);
    const [solveAlarmLogId, setSolveAlarmLogId] = useState();
    const [result, setResult] = useState<any>({});
    const productList = useRef<any[]>([]);
    const [searchParam, setSearchParam] = useState({
        pageSize: 10,
        sorts: {
            order: "descend",
            field: "alarmTime"
        }
    });
    useEffect(() => {
        handleSearch(searchParam);
        apis.deviceProdcut.queryNoPagin(
            encodeQueryParam({ paging: false }))
            .then((resp) => {
                if (resp.status === 200) {
                    productList.current = resp.result;
                }
            });
    }, []);
    const handleSearch = (params?: any) => {
        setSearchParam(params);
        setLoading(true);
        apis.deviceAlarm.findAlarmLog(encodeQueryParam(params))
            .then((response: any) => {
                if (response.status === 200) {
                    setResult(response.result);
                }
            }).finally(() => { setLoading(false) });

    };
    const alarmSolve = () => {
        form.validateFields((err, fileValue) => {
            if (err) return;

            apis.deviceAlarm.alarmLogSolve(solveAlarmLogId, fileValue.description)
                .then((response: any) => {
                    if (response.status === 200) {
                        message.success('????????????');
                        setSolveAlarmLogId(undefined);
                        setSolveVisible(false);
                        handleSearch(searchParam);
                    }
                })
                .catch(() => {
                })
        });
    };
    const alarmLogColumns: ColumnProps<AlarmLog>[] = [
        {
            title: '??????ID',
            dataIndex: 'deviceId',
        },
        {
            title: '????????????',
            dataIndex: 'deviceName',
        },
        {
            title: '????????????',
            dataIndex: 'alarmName',
        },
        {
            title: '????????????',
            dataIndex: 'alarmTime',
            width: '300px',
            render: (text: any) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '/',
            sorter: true,
            defaultSortOrder: 'descend'
        },
        {
            title: '????????????',
            dataIndex: 'state',
            align: 'center',
            width: '100px',
            render: text => text === 'solve' ? <Tag color="#87d068">?????????</Tag> : <Tag color="#f50">?????????</Tag>,
        },
        {
            title: '??????',
            width: '120px',
            align: 'center',
            render: (record: any) => (
                <Fragment>
                    <a onClick={() => {
                        let content: string;
                        try {
                            content = JSON.stringify(record.alarmData, null, 2);
                        } catch (error) {
                            content = record.alarmData;
                        }
                        Modal.confirm({
                            width: '40VW',
                            title: '????????????',
                            content: <pre>{content}
                                {record.state === 'solve' && (
                                    <>
                                        <br /><br />
                                        <span style={{ fontSize: 16 }}>???????????????</span>
                                        <br />
                                        <p>{record.description}</p>
                                    </>
                                )}
                            </pre>,
                            okText: '??????',
                            cancelText: '??????',
                        })
                    }}>??????</a>
                    {
                        record.state !== 'solve' ? <Divider type="vertical" /> : ''
                    }
                    {
                        record.state !== 'solve' && (
                            <a onClick={() => {
                                setSolveAlarmLogId(record.id);
                                setSolveVisible(true);
                            }}>??????</a>
                        )
                    }
                </Fragment>
            )
        },
    ];
    return (
        <PageHeaderWrapper title="????????????">
            <Card bordered={false} style={{ marginBottom: 16 }}>
                <div>
                    <div>

                        <SearchForm
                            search={(params: any) => {
                                handleSearch({
                                    terms: { ...params },
                                    pageSize: 10,
                                    sorts: searchParam.sorts
                                });
                            }}
                            formItems={[{
                                label: '??????ID',
                                key: 'deviceId$like',
                                type: 'string',
                            },
                            {
                                label: '??????',
                                key: 'productId$IN',
                                type: 'list',
                                props: {
                                    data: productList.current,
                                    mode: 'tags',
                                }
                            },
                            {
                                label: '????????????',
                                key: 'alarmTime$btw',
                                type: 'time',
                            },
                            ]}
                        />
                    </div>
                </div>
            </Card>
            <Card>
                <ProTable
                    loading={loading}
                    dataSource={result?.data}
                    columns={alarmLogColumns}
                    rowKey="id"
                    onSearch={(params: any) => {
                        handleSearch(params);
                    }}
                    paginationConfig={result}
                />
            </Card>
            {solveVisible && (
                <Modal
                    title='??????????????????'
                    visible
                    okText="??????"
                    cancelText="??????"
                    width='700px'
                    onOk={() => {
                        alarmSolve();
                    }}
                    onCancel={() => {
                        setSolveVisible(false);
                        setSolveAlarmLogId(undefined);
                    }}
                >
                    <Form labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} key="solve_form">
                        <Form.Item key="description" label="????????????">
                            {getFieldDecorator('description', {
                                rules: [
                                    { required: true, message: '?????????????????????' },
                                    { max: 2000, message: '?????????????????????2000?????????' }
                                ],
                            })(
                                <Input.TextArea rows={8} placeholder="?????????????????????" />,
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            )}
        </PageHeaderWrapper>
    )
}

export default Form.create<Props>()(Alarmlog);