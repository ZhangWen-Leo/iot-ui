import React, {useEffect, useState} from 'react';
import Form, {FormComponentProps} from 'antd/lib/form';
import {Card, Col, Icon, Input, message, Row, Select} from 'antd';
import {ActionData} from '@/pages/rule-engine/scene/data';
import apis from '@/services';
import encodeQueryParam from '@/utils/encodeParam';
import Bind from '@/pages/device/gateway/bind';

interface Props extends FormComponentProps {
  action: Partial<ActionData>;
  position: number;
}

interface State {
  actionData: any;
  deviceData: any;
  messageConfig: any[];
  notifyTypeConfig: any[];
  templateConfig: any[];
  messageType: string;
  propertiesData: any;
  functionData: any;
  arrayData: any[];
}

const Action: React.FC<Props> = props => {
  const initState: State = {
    actionData: props.action,
    deviceData: {},
    messageConfig: [],
    notifyTypeConfig: [],
    templateConfig: [],
    messageType: '',
    propertiesData: {},
    functionData: {},
    arrayData: [undefined],
  };

  const [bindVisible, setBindVisible] = useState(false);
  const [actionData, setActionData] = useState(initState.actionData);
  const [deviceData, setDeviceData] = useState(initState.deviceData);
  const [actionType, setActionType] = useState('');
  const [notifyType, setNotifyType] = useState('');
  const [messageConfig, setMessageConfig] = useState(initState.messageConfig);
  const [templateConfig, setTemplateConfig] = useState(initState.templateConfig);
  const [notifyTypeConfig, setNotifyTypeConfig] = useState(initState.notifyTypeConfig);
  const [messageType, setMessageType] = useState(initState.messageType);
  const [propertiesData, setPropertiesData] = useState(initState.propertiesData);
  const [functionData, setFunctionData] = useState(initState.functionData);
  const [arrayData, setArrayData] = useState(initState.arrayData);
  const [deviceName, setDeviceName] = useState('');

  useEffect(() => {
    setActionType(actionData.executor);
    if (actionData.configuration) {
      setNotifyType(actionData.configuration.notifyType);
      if (actionData.executor === 'notifier') {
        findNotifier({id: notifyType});
      } else if (actionData.configuration.deviceId) {
        findDeviceById(actionData.configuration.deviceId);
      }
    }
  }, []);

  useEffect(() => {
    if (actionType === 'notifier') {
      apis.notifier.configType().then((res: any) => {
        if (res) {
          setNotifyTypeConfig(res.result);
        }
      });
    }
  }, [actionType]);

  const findNotifier = (value: any) => {
    apis.notifier.config(
      encodeQueryParam({
        paging: false,
        terms: {
          type: value.id,
        },
      }))
      .then((response: any) => {
        if (response.status === 200) {
          setMessageConfig(response.result.data);
          response.result.data.map((item: any) => {
            if (item.id === actionData.configuration.notifierId) {
              findTemplate(item);
            }
          });
        }
      })
      .catch(() => {
      });
  };

  const findTemplate = (value: any) => {
    apis.notifier.template(
      encodeQueryParam({
        paging: false,
        terms: {
          type: value.type,
          provider: value.provider,
        },
      }),
    ).then(res => {
      if (res.status === 200) {
        setTemplateConfig(res.result?.data);
      }
    }).catch(() => {
    });
  };

  const findDeviceById = (deviceId: string) => {
    apis.deviceInstance.info(deviceId)
      .then((response: any) => {
        if (response.status === 200) {
          setDeviceData(response.result || {});
          setDeviceName(response.result.name || '')
          if (!actionData.configuration) {
            actionData.configuration = {};
          }
          if (actionData.configuration.deviceId) {
            setMessageType(actionData.configuration.message.messageType);
            if (actionData.configuration.message.messageType === 'WRITE_PROPERTY') {
              JSON.parse(response.result.metadata).properties?.map((item: any) => {
                if (item.id === Object.keys(actionData.configuration.message.properties)[0]) {
                  setPropertiesData(item);
                  setArrayData(actionData.configuration.message.properties[item.id]);
                }
              });
            } else {
              JSON.parse(response.result.metadata).functions?.map((item: any) => {
                if (item.id === actionData.configuration.message.functionId) {
                  setFunctionData(item);
                }
              });
            }
          }
          actionData.configuration.deviceId = deviceId;
          actionData.configuration.productId = response.result?.productId;
          setActionData({...actionData});
        }
      }).catch(() => {
    });
  };

  const renderPropertiesObject = (properties: any) => {
    if (!actionData.configuration.message.properties[propertiesData.id]) {
      actionData.configuration.message.properties[propertiesData.id] = {};
    }
    if (properties.valueType.type === 'enum') {
      return (
        <Col span={6} style={{paddingBottom: 10}}>
          <Select placeholder="选择属性值"
                  defaultValue={actionData.configuration.message?.properties[propertiesData.id][properties.id] || undefined} >
            {properties.valueType.elements?.map((item: any) => (
              <Select.Option key={item.value}>{`${item.text}（${item.value}）`}</Select.Option>
            ))}
          </Select>
        </Col>
      );
    } else if (properties.valueType.type === 'boolean') {
      return (
        <Col span={6} style={{paddingBottom: 10}}>
          <Select placeholder="选择属性值"
                  defaultValue={actionData.configuration.message?.properties[propertiesData.id][properties.id] || undefined}>
            <Select.Option key={properties.valueType.trueValue}>
              {`${properties.valueType.trueText}（${properties.valueType.trueValue}）`}
            </Select.Option>
            <Select.Option key={properties.valueType.falseValue}>
              {`${properties.valueType.falseText}（${properties.valueType.falseValue}）`}
            </Select.Option>
          </Select>
        </Col>
      );
    } else {
      return (
        <Col span={6} style={{paddingBottom: 10}}>
          <Input key='value' placeholder='填写属性值'
                 defaultValue={actionData.configuration.message?.properties[propertiesData.id][properties.id] || undefined}
                 readOnly/>
        </Col>
      );
    }
  };

  const renderProperties = () => {
    if (!actionData.configuration.message.properties) {
      actionData.configuration.message.properties = {};
    }

    if (propertiesData.valueType.type === 'enum') {
      return (
        <Col span={6} style={{paddingBottom: 10}}>
          <Select placeholder="选择属性值"
                  defaultValue={actionData.configuration.message?.properties[propertiesData.id] || undefined}>
            {propertiesData.valueType.elements?.map((item: any) => (
              <Select.Option key={item.value}>{`${item.text}（${item.value}）`}</Select.Option>
            ))}
          </Select>
        </Col>
      );
    } else if (propertiesData.valueType.type === 'array') {
      return (
        <Col span={24}>
          {arrayData[0] && arrayData.map((value: string, index: number) => (
            <Row key={`array_${index}`} style={{paddingBottom: 10}}>
              <Col span={4}>
                <Input
                  defaultValue={value}
                  readOnly
                />
              </Col>
              <Col span={2} style={{textAlign: 'center', paddingTop: 10}}>
                {index === 0 ? (
                  (arrayData.length - 1) === 0 ? (
                    <Icon type="plus-circle"
                          onClick={() => {
                            arrayData.push(undefined);
                            actionData.configuration.message.properties[propertiesData.id] = arrayData;
                            setActionData({...actionData});
                          }}
                    />
                  ) : (
                    <Icon type="minus-circle"
                          onClick={() => {
                            arrayData.splice(index, 1);
                            actionData.configuration.message.properties[propertiesData.id] = arrayData;
                            setActionData({...actionData});
                          }}
                    />
                  )
                ) : (
                  index === (arrayData.length - 1) ? (
                    <Row>
                      <Icon type="plus-circle"
                            onClick={() => {
                              arrayData.push(undefined);
                              actionData.configuration.message.properties[propertiesData.id] = arrayData;
                              setActionData({...actionData});
                            }}
                      />
                      <Icon style={{paddingLeft: 10}}
                            type="minus-circle"
                            onClick={() => {
                              arrayData.splice(index, 1);
                              actionData.configuration.message.properties[propertiesData.id] = arrayData;
                              setActionData({...actionData});
                            }}
                      />
                    </Row>
                  ) : (
                    <Icon type="minus-circle"
                          onClick={() => {
                            arrayData.splice(index, 1);
                            actionData.configuration.message.properties[propertiesData.id] = arrayData;
                            setActionData({...actionData});
                          }}
                    />
                  )
                )}
              </Col>
            </Row>
          ))}
        </Col>
      );
    } else if (propertiesData.valueType.type === 'boolean') {
      if (!propertiesData.valueType.trueValue || !propertiesData.valueType.falseValue) {
        return (
          <Col span={6} style={{paddingBottom: 10}}>
            <Input key='value' placeholder='填写属性值'
                   defaultValue={actionData.configuration.message?.properties[propertiesData.id] || undefined}
                   readOnly/>
          </Col>
        )
      } else {
        return (
          <Col span={6} style={{paddingBottom: 10}}>
            <Select placeholder="选择属性值"
                    defaultValue={actionData.configuration.message?.properties[propertiesData.id] || undefined}>
              <Select.Option key={propertiesData.valueType.trueValue}>
                {`${propertiesData.valueType.trueText}（${propertiesData.valueType.trueValue}）`}
              </Select.Option>
              <Select.Option key={propertiesData.valueType.falseValue}>
                {`${propertiesData.valueType.falseText}（${propertiesData.valueType.falseValue}）`}
              </Select.Option>
            </Select>
          </Col>
        );
      }
    } else if (propertiesData.valueType.type === 'object') {
      return (
        propertiesData.valueType.properties?.map((item: any, index: number) => (
          <Col span={24} style={{marginLeft: -8}}>
            <div key={`object${item.id}_${index}`}>
              <Col span={4}>
                <Input value={`${item.name}(${item.id})`} readOnly={true}/>
              </Col>
              {renderPropertiesObject(item)}
            </div>
          </Col>
        ))
      );
    } else {
      return (
        <Col span={6} style={{paddingBottom: 10}}>
          <Input key='value' placeholder='填写属性值'
                 defaultValue={actionData.configuration.message?.properties[propertiesData.id] || undefined}
                 readOnly/>
        </Col>
      );
    }
  };

  const renderFunctionOnType = (item: any, index: number) => {
    if (!actionData.configuration.message.inputs) {
      actionData.configuration.message.inputs = [];
    }
    if (item.valueType.type === 'enum') {
      return (<Col span={6} style={{paddingBottom: 10}}>
        <Select placeholder="选择调用参数"
                defaultValue={actionData.configuration.message?.inputs[index]?.value || undefined}>
          {item.valueType.elements?.map((item: any) => (
            <Select.Option key={item.value}>{`${item.text}（${item.value}）`}</Select.Option>
          ))}
        </Select>
      </Col>);
    } else if (item.valueType.type === 'boolean') {
      return (<Col span={6} style={{paddingBottom: 10}}>
        <Select placeholder="选择调用参数"
                defaultValue={actionData.configuration.message?.inputs[index]?.value || undefined}>
          <Select.Option key={item.valueType.trueValue}>
            {`${item.valueType.trueText}（${item.valueType.trueValue}）`}
          </Select.Option>
          <Select.Option key={item.valueType.falseValue}>
            {`${item.valueType.falseText}（${item.valueType.falseValue}）`}
          </Select.Option>
        </Select>
      </Col>);
    } else {
      return (
        <Col span={6} style={{paddingBottom: 10}}>
          <Input key='value' placeholder='填写调用参数'
                 defaultValue={actionData.configuration.message?.inputs[index]?.value || undefined}
                 readOnly/>
        </Col>
      );
    }
  };

  const renderMassageType = () => {
    switch (messageType) {
      case 'WRITE_PROPERTY':
        return (
          <div>
            <Col span={6} style={{paddingBottom: 10}}>
              <Select placeholder="物模型属性"
                      defaultValue={actionData.configuration.message?.properties ? Object.keys(actionData.configuration.message?.properties)[0] : undefined}
              >
                {JSON.parse(deviceData.metadata).properties?.map((item: any) => (
                  <Select.Option key={item.id} data={item}>{`${item.name}（${item.id}）`}</Select.Option>
                ))}
              </Select>
            </Col>
            {propertiesData.valueType && (renderProperties())}
          </div>
        );
      case 'INVOKE_FUNCTION':
        return (
          <div>
            <Col span={6} style={{paddingBottom: 10}}>
              <Select placeholder="物模型功能"
                      defaultValue={actionData.configuration.message.functionId || undefined}
              >
                {JSON.parse(deviceData.metadata).functions?.map((item: any) => (
                  <Select.Option key={item.id} data={item}>{`${item.name}（${item.id}）`}</Select.Option>
                ))}
              </Select>
            </Col>
            {functionData.id && functionData.inputs.map((item: any, index: number) => {
              return (
                <Col span={24} style={{marginLeft: -8}}>
                  <div key={`function_${item.id}_${index}`}>
                    <Col span={4}>
                      <Input value={`${item.name}(${item.id})`} readOnly={true}/>
                    </Col>
                    {renderFunctionOnType(item, index)}
                  </div>
                </Col>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  const renderActionType = () => {
    if (!actionData.configuration) {
      actionData.configuration = {};
    }

    if (!actionData.configuration.message) {
      actionData.configuration.message = {};
    }
    switch (actionType) {
      case 'notifier':
        return (
          <div>
            <Col span={4}>
              <Select placeholder="选择通知类型" value={actionData.configuration?.notifyType || undefined}>
                {notifyTypeConfig.length > 0 && notifyTypeConfig.map((item: any) => (
                  <Select.Option key={item.id} data={item}>{item.name}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Select placeholder="选择通知配置" value={actionData.configuration?.notifierId || undefined}>
                {messageConfig.length > 0 && messageConfig.map((item: any) => (
                  <Select.Option key={item.id} data={item}>{item.name}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Select placeholder="选择通知模板" value={actionData.configuration?.templateId || undefined}>
                {templateConfig.length > 0 && templateConfig.map((item: any) => (
                  <Select.Option key={item.id}>{item.name}</Select.Option>
                ))}
              </Select>
            </Col>
          </div>
        );
      case'device-message-sender':
        return (
          <div>
            <Col span={4}>
              <Input readOnly  type='gold' title="点击选择设备"
                defaultValue={deviceName} value={deviceData?.name}/>
            </Col>
            {deviceData.name && (
              <Col span={4}>
                <Select placeholder="选择类型，如：属性/功能"
                        defaultValue={actionData.configuration.message.messageType || undefined}>
                  <Select.Option value="WRITE_PROPERTY">设置属性</Select.Option>
                  <Select.Option value="INVOKE_FUNCTION">调用功能</Select.Option>
                </Select>
              </Col>
            )}
            {messageType != '' && renderMassageType()}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{paddingBottom: 5}}>
      <Card size="small" bordered={false} style={{backgroundColor: '#F5F5F6'}}>
        <Row gutter={16} key={props.position + 1} style={{paddingLeft: 10}}>
          <Col span={4}>
            <Select placeholder="选择动作类型" value={actionData.executor} key="trigger">
              <Select.Option value="notifier">消息通知</Select.Option>
              <Select.Option value="device-message-sender">设备输出</Select.Option>
            </Select>
          </Col>
          {renderActionType()}
        </Row>
      </Card>
      {bindVisible && (
        <Bind selectionType='radio'
              close={() => {
                setBindVisible(false);
              }}
              save={(item: any) => {
                if (item[0]) {
                  setBindVisible(false);
                  findDeviceById(item[0]);
                } else {
                  message.error('请勾选设备');
                  return;
                }
              }}
        />
      )}
    </div>
  );
};

export default Form.create<Props>()(Action);
