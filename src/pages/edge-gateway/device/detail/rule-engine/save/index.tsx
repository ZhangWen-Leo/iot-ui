import React, { useEffect, useState } from 'react';
import Form from 'antd/es/form';
import { FormComponentProps } from 'antd/lib/form';
import { Button, Card, Col, Icon, Input, Modal, Row, Radio, Switch, Tooltip, Select, message } from 'antd';
import Service from '../service';
import Triggers from './alarm/trigger';
import Trigger from './alarm/trigger-scene';
import ActionAssembly from './alarm/action';
import Bind from '../../rule-engine/scene-save/bind';

interface Props extends FormComponentProps {
  close: Function;
  save: Function;
  data: any;
  deviceId: string;
}

interface State {
  instanceType: string;
  name: string;
  description: string;

  properties: any[];
  data: any;
  trigger: any[];
  action: any[];
  shakeLimit: any;
  alarmType: string;
  deviceList: any[];
  productId: string;
  deviceId: string;
  productList: any[];
  device: any;
  product: any;
  parallel: Boolean;
}

const Save: React.FC<Props> = props => {
  const service = new Service('rule-engine-instance-save');
  const initState: State = {
    instanceType: '',
    description: '',
    name: '',

    productList: [],
    deviceList: [],

    properties: [{ _id: 0 }],
    data: {},
    trigger: [{ _id: 0 }],
    action: [{ _id: 0 }],
    shakeLimit: {},
    alarmType: 'product',
    parallel: false,
    deviceId: '',
    productId: props.data.targetId || '',

    device: {},
    product: {},
  };

  const [instanceType, setInstanceType] = useState(initState.instanceType);
  const [description, setDescription] = useState(initState.description);

  // const [deviceList, setDeviceList] = useState(initState.deviceList);
  const [bindVisible, setBindVisible] = useState(false);
  const [productList, setProductList] = useState(initState.productList);

  const [data] = useState(initState.data);
  const [alarmType, setAlarmType] = useState(initState.alarmType);
  const [properties, setProperties] = useState(initState.properties);
  const [trigger, setTrigger] = useState(initState.trigger);
  const [action, setAction] = useState(initState.action);
  const [shakeLimit, setShakeLimit] = useState(initState.shakeLimit);

  const [name, setName] = useState(initState.name);
  const [deviceId, setDeviceId] = useState(initState.deviceId);
  const [productId, setProductId] = useState(initState.productId);
  const [device, setDevice] = useState(initState.device);
  const [product, setProduct] = useState(initState.product);
  const [parallel, setParallel] = useState(initState.parallel);

  const submitData = () => {
    if (instanceType === 'node-red') {
      let params = {
        instanceType: 'node-red',
        name: name,
        description: description
      }
      props.save({ ...params });
    } else if (instanceType === 'device_alarm') {
      data.name = name;
      data.target = alarmType;
      if (alarmType === 'device') {
        data.targetId = deviceId;
        data.alarmRule = {
          name: device.name,
          deviceId: device.id,
          deviceName: device.name,
          triggers: trigger,
          actions: action,
          properties: properties,
          productId: device.productId,
          productName: device.productName,
          shakeLimit: shakeLimit,
        };
      } else {
        data.targetId = productId;
        data.alarmRule = {
          name: product.name,
          productId: product.id,
          productName: product.name,
          triggers: trigger,
          actions: action,
          properties: properties,
          shakeLimit: shakeLimit,
        };
      }
      data.instanceType = 'device_alarm'
      props.save({ ...data });
    } else if (instanceType === 'rule-scene') {
      let tri = trigger.map(item => {
        if (item.trigger === 'scene') {
          return { scene: item.scene, trigger: 'scene' }
        } else if (item.trigger === 'manual') {
          return {
            trigger: 'manual'
          }
        } else if (item.trigger === 'timer') {
          return { cron: item.cron, trigger: 'timer' }
        } else {
          return { device: item.device, trigger: 'device' }
        }
      });
      let items = {
        name: name,
        triggers: tri,
        actions: action,
        parallel: parallel,
        instanceType: 'rule-scene'
      };
      props.save(items);
    }
  };

  // const getDeviceList = () => {
  //   service.getDeviceList(props.deviceId, { paging: false }).subscribe(
  //     (res) => {
  //       setDeviceList(res.data)
  //     }
  //   )
  // }
  const getProductList = () => {
    service.getProductList(props.deviceId, { paging: false }).subscribe(
      (res) => {
        setProductList(res)
      }
    )
  }

  const getInstanceDetail = (id: string) => {
    service.getInstanceDetail(props.deviceId, id).subscribe(
      (res) => {
        setDevice(res);
      }
    )
  }

  useEffect(() => {
    // getDeviceList();
    getProductList();
  }, []);

  const removeProperties = (val: number) => {
    properties.splice(val, 1);
    setProperties([...properties]);
  };

  const renderComponent = () => {
    switch (instanceType) {
      case 'device_alarm':
        return (
          <>
            <Row gutter={24}
              style={{ marginLeft: '0.1%' }}>
              <Col span={20}>
                <Form.Item key="alarmType" label="????????????">
                  <Select placeholder="?????????" defaultValue={props.data.target}
                    onChange={(value: string) => {
                      setAlarmType(value);
                    }}
                  >
                    <Select.Option key='product' value="product">??????</Select.Option>
                    <Select.Option key='device' value="device">??????</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              {
                alarmType === 'product' && <Col span={20}>
                  <Form.Item key="productId" label="??????" >
                    <Select placeholder="?????????" defaultValue={props.data.targetId} onChange={(value: string) => {
                      setProductId(value);
                    }}>
                      {productList.map((item: any) => {
                        return (
                          <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                        )
                      })}
                    </Select>
                  </Form.Item>
                </Col>
              }
              {
                alarmType === 'device' && <Col span={20}>
                  <Form.Item key="deviceId" label="??????">
                    {/* <Select placeholder="?????????" defaultValue={props.data.targetId} onChange={(value: string) => {
                      setDeviceId(value);
                      getInstanceDetail(value);
                    }}>
                      {deviceList.map((item: any) => {
                        return (
                          <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                        )
                      })}
                    </Select> */}
                    <Input addonAfter={<Icon onClick={() => {
                      setBindVisible(true);
                    }} type='gold' title="??????????????????" />}
                      defaultValue={deviceId || ''}
                      placeholder="??????????????????"
                      value={device?.name}
                      readOnly />
                  </Form.Item>
                </Col>
              }
            </Row>
            <Card style={{ margin: '0px 20px 10px' }} bordered={false} size="small">
              <p style={{ fontSize: 16 }}>????????????
              <Tooltip title="???????????????????????????????????????????????????">
                  <Icon type="question-circle-o" style={{ paddingLeft: 10 }} />
                </Tooltip>
                <Switch key='shakeLimit.enabled' checkedChildren="????????????" unCheckedChildren="????????????"
                  defaultChecked={shakeLimit.enabled ? shakeLimit.enabled : false}
                  style={{ marginLeft: 20 }}
                  onChange={(value: boolean) => {
                    shakeLimit.enabled = value;
                    setShakeLimit({ ...shakeLimit })
                  }}
                />
                {shakeLimit.enabled && (
                  <>
                    <Input style={{ width: 80, marginLeft: 3 }} size='small' key='shakeLimit.time'
                      defaultValue={shakeLimit.time}
                      onBlur={event => {
                        shakeLimit.time = event.target.value;
                      }}
                    />????????????
                  <Input style={{ width: 80 }} size='small' key='shakeLimit.threshold' defaultValue={shakeLimit.threshold}
                      onBlur={event => {
                        shakeLimit.threshold = event.target.value;
                      }}
                    />????????????????????????
                  <Radio.Group defaultValue={shakeLimit.alarmFirst} key='shakeLimit.alarmFirst' size='small'
                      buttonStyle="solid"
                      onChange={event => {
                        shakeLimit.alarmFirst = Boolean(event.target.value);
                      }}
                    >
                      <Radio.Button value={true}>?????????</Radio.Button>
                      <Radio.Button value={false}>????????????</Radio.Button>
                    </Radio.Group>
                  </>
                )}
              </p>
              {trigger.map((item: any, index: number) => (
                <div key={index}>
                  <Triggers
                    save={(data: any) => {
                      trigger.splice(index, 1, data);
                    }}
                    trigger={item}
                    key={`trigger_${Math.round(Math.random() * 100000)}`}
                    metaData={device.metaData}
                    position={index}
                    remove={(position: number) => {
                      trigger.splice(position, 1);
                      let data = [...trigger];
                      setTrigger([...data]);
                    }}
                  />
                </div>
              ))}
              <Button icon="plus" type="link"
                onClick={() => {
                  setTrigger([...trigger, { _id: Math.round(Math.random() * 100000) }]);
                }}
              >
                ???????????????
            </Button>
            </Card>
            <Card style={{ margin: '0px 20px 10px' }} bordered={false} size="small">
              <p style={{ fontSize: 16 }}>??????
              <Tooltip title="????????????????????????????????????????????????????????????deviceId ?????? id">
                  <Icon type="question-circle-o" style={{ paddingLeft: 10 }} />
                </Tooltip>
              </p>
              <div style={{
                maxHeight: 200,
                overflowY: 'auto',
                overflowX: 'hidden',
                backgroundColor: '#F5F5F6',
                paddingTop: 10,
              }}>
                {properties.map((item: any, index: number) => (
                  <Row gutter={16} key={index}
                    style={{ paddingBottom: 10, marginLeft: 13, marginRight: 3 }}>
                    <Col span={6}>
                      <Input placeholder="???????????????" value={item.property}
                        onChange={event => {
                          properties[index].property = event.target.value;
                          setProperties([...properties]);
                        }}
                      />
                    </Col>
                    <Col span={6}>
                      <Input placeholder="???????????????" value={item.alias}
                        onChange={event => {
                          properties[index].alias = event.target.value;
                          setProperties([...properties]);
                        }}
                      />
                    </Col>
                    <Col span={12} style={{ textAlign: 'right', marginTop: 6, paddingRight: 15 }}>
                      <a style={{ paddingTop: 7 }}
                        onClick={() => {
                          removeProperties(index);
                        }}
                      >??????</a>
                    </Col>
                  </Row>
                ))}
                <Col span={24} style={{ marginLeft: 20 }}>
                  <a onClick={() => {
                    setProperties([...properties, { _id: Math.round(Math.random() * 100000) }]);
                  }}>??????</a>
                </Col>
              </div>
            </Card>
            <Card style={{ margin: '0px 20px' }} bordered={false} size="small">
              <p style={{ fontSize: 16 }}>????????????</p>
              {action.map((item: any, index) => (
                <ActionAssembly deviceId={props.deviceId} key={index + Math.random()} save={(actionData: any) => {
                  action.splice(index, 1, actionData);
                }} action={item} position={index} remove={(position: number) => {
                  action.splice(position, 1);
                  setAction([...action]);
                }} />
              ))}
              <Button icon="plus" type="link"
                onClick={() => {
                  setAction([...action, { _id: Math.round(Math.random() * 100000) }]);
                }}
              >
                ????????????
            </Button>
            </Card>
          </>
        );
      case 'node-red':
        return (
          <Row gutter={24} style={{ marginLeft: '0.1%' }}>
            <Col span={20}>
              <Form.Item key="description" label="??????" >
                <Input.TextArea rows={4} placeholder="?????????" onChange={(e) => {
                  setDescription(e.target.value);
                }} />
              </Form.Item>
            </Col>
          </Row>
        );
      case 'rule-scene':
        return (
          <>
            <Card style={{ marginBottom: 10 }} bordered={false} size="small">
              <p style={{ fontSize: 16 }}>????????????
              <Tooltip title="???????????????????????????????????????????????????">
                  <Icon type="question-circle-o" style={{ paddingLeft: 10 }} />
                </Tooltip>
              </p>
              {trigger.length > 0 && trigger.map((item: any, index) => (
                <div key={index}>
                  <Trigger
                    save={(data: any) => {
                      trigger.splice(index, 1, data);
                    }}
                    deviceId={props.deviceId}
                    key={index + Math.random()}
                    trigger={item}
                    position={index}
                    remove={(position: number) => {
                      trigger.splice(position, 1);
                      let data = [...trigger];
                      setTrigger([...data]);
                    }}
                  />
                </div>
              ))}
              <Button icon="plus" type="link"
                onClick={() => {
                  setTrigger([...trigger, {
                    _id: Math.round(Math.random() * 100000), name: '', trigger: '', cron: '',
                    device: { shakeLimit: {}, filters: [], productId: '', deviceId: '', type: '', modelId: '' },
                    scene: {}
                  }]);
                }}
              >
                ???????????????
            </Button>
            </Card>
            <Card bordered={false} size="small">
              <p style={{ fontSize: 16 }}>
                <span>????????????</span>
                <Switch key='parallel'
                  checkedChildren="????????????" unCheckedChildren="????????????"
                  defaultChecked={parallel || false}
                  style={{ marginLeft: 20, width: '100px' }}
                  onChange={(value: boolean) => {
                    setParallel(value)
                  }}
                />
              </p>
              {action.length > 0 && action.map((item: any, index) => (
                <div key={index}>
                  <ActionAssembly deviceId={props.deviceId} key={index + Math.random()} save={(actionData: any) => {
                    action.splice(index, 1, actionData);
                  }} action={item} position={index} remove={(position: number) => {
                    action.splice(position, 1);
                    setAction([...action]);
                  }} />
                </div>
              ))}
              <Button icon="plus" type="link"
                onClick={() => {
                  setAction([...action, { _id: Math.round(Math.random() * 100000) }]);
                }}
              >
                ????????????
            </Button>
            </Card>
          </>
        );
      default: null;
    }
  }

  return (
    <Modal
      title={`${props.data?.id ? '??????' : '??????'}????????????`}
      visible
      okText="??????"
      cancelText="??????"
      onOk={() => {
        submitData();
      }}
      style={{ marginTop: '-3%' }}
      width="65%"
      onCancel={() => props.close()}
    >
      <div style={{ maxHeight: 750, overflowY: 'auto', overflowX: 'hidden' }}>
        <Form wrapperCol={{ span: 22 }} labelCol={{ span: 2 }} key='addAlarmForm'>
          <Row gutter={24}
            style={{ marginLeft: '0.1%' }}>
            <Col span={20}>
              <Form.Item key="name" label="??????">
                <Input placeholder="????????????"
                  onBlur={event => {
                    setName(event.target.value);
                  }} />
              </Form.Item>
            </Col>
            <Col span={20}>
              <Form.Item key="instanceType" label="??????" >
                <Select placeholder="?????????" onChange={(value: string) => {
                  setInstanceType(value);
                }}>
                  <Select.Option key="device_alarm" value="device_alarm">????????????</Select.Option>
                  <Select.Option key="node-red" value="node-red">????????????</Select.Option>
                  <Select.Option key="rule-scene" value="rule-scene">????????????</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          {renderComponent()}
        </Form>
      </div>
      {bindVisible && (
        <Bind selectionType='radio'
              close={() => {
                setBindVisible(false);
              }}
              deviceId={props.deviceId}
              save={(item: any) => {
                if (item[0]) {
                  setBindVisible(false);
                  getInstanceDetail(item[0]);
                  setDeviceId(item[0]);
                } else {
                  message.error('???????????????');
                  return;
                }
              }}
        />
      )}
    </Modal>
  );
};

export default Form.create<Props>()(Save);
