import React, {useEffect, useState} from 'react';
import {FormComponentProps} from 'antd/lib/form';
import Form from 'antd/es/form';
import {Badge, Button, Checkbox, message, Modal, Radio, Select, Spin, Upload} from 'antd';
import apis from '@/services';
import {DeviceProduct} from '@/pages/device/product/data';
import {UploadProps} from 'antd/lib/upload';
import {getAccessToken} from '@/utils/authority';
import {EventSourcePolyfill} from "event-source-polyfill";
import {wrapAPI} from '@/utils/utils';

interface Props extends FormComponentProps {
  productId: string;
  close: Function;
}

interface State {
  productList: DeviceProduct[];
  product: string;
  fileType: string;
  fileInfo: any;
  source: any;
}

const Import: React.FC<Props> = props => {
  const initState: State = {
    productList: [],
    product: '',
    fileType: '.xlsx',
    fileInfo: {},
    source: {},
  };
  const [productList, setProductList] = useState(initState.productList);
  const [uploading, setUploading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [product, setProduct] = useState(initState.product);
  const [fileType, setFileType] = useState(initState.fileType);
  const [flag, setFlag] = useState<boolean>(true);
  const [autoDeploy, setAutoDeploy] = useState<boolean>(false);
  const [eventSource, setSource] = useState<any>(initState.source);
  const [count, setCount] = useState<number>(0);
  const [errMessage, setErrMessage] = useState<string>('');

  useEffect(() => {
    if (props.productId) {
      setProduct(props.productId);
    }
    // 获取下拉框数据
    apis.deviceProdcut
      .queryNoPagin()
      .then(response => {
        setProductList(response.result);
      })
      .catch(() => {
      });
    return () => {
      if (Object.keys(eventSource).length !== 0) {
        eventSource.close();
      }
    };
  }, []);


  const submitData = (fileUrl: string) => {
    if (fileUrl) {
      setImportLoading(true);
      let dt = 0;
      // todo:后期需优化，更换为：websocket
      const source = new EventSourcePolyfill(
        wrapAPI(`/jetlinks/device/instance/${product}/import?fileUrl=${fileUrl}&autoDeploy=${autoDeploy}&:X_Access_Token=${getAccessToken()}`)
      );
      setSource(source);
      source.onmessage = (e: any) => {
        const res = JSON.parse(e.data);
        if (res.success) {
          const temp = res.result.total;
          dt += temp;
          setCount(dt);
        } else {
          setErrMessage(res.message);
        }
      };
      source.onerror = () => {
        setFlag(false);
        source.close();
      };
      source.onopen = () => {
      };
    } else {
      message.error("请先上传文件");
    }
  };

  const uploadProps: UploadProps = {
    accept: fileType,
    action: '/jetlinks/file/static',
    headers: {
      'X-Access-Token': getAccessToken(),
    },
    showUploadList: false,
    onChange(info) {
      setCount(0);
      setErrMessage('');
      setFlag(true);
      setImportLoading(false);
      setUploading(true);
      if (info.file.status === 'done') {
        setUploading(false);
        message.success('文件上传成功');
        submitData(info.file.response.result);
      }
    },
  };

  const downloadTemplate = (type: string) => {
    const formElement = document.createElement('form');
    formElement.style.display = 'display:none;';
    formElement.method = 'GET';
    formElement.action = `/jetlinks/device/instance/${product}/template.${type}`;
    const inputElement = document.createElement('input');
    inputElement.type = 'hidden';
    inputElement.name = ':X_Access_Token';
    inputElement.value = getAccessToken();
    formElement.appendChild(inputElement);
    document.body.appendChild(formElement);
    formElement.submit();
    document.body.removeChild(formElement);
  };

  return (
    <Modal
      title='批量导入设备'
      visible
      okText=""
      cancelText="取消"
      onOk={() => {
        /*setCount(0);
        setErrMessage('');
        setFlag(true);
        setImportLoading(false);
        submitData();*/
        props.close();
        if (Object.keys(eventSource).length !== 0) {
          eventSource.close();
        }
      }}
      onCancel={() => {
        props.close();
        if (Object.keys(eventSource).length !== 0) {
          eventSource.close();
        }
      }}
    >
      <Spin spinning={uploading} tip="上传中...">
        <Form labelCol={{span: 4}} wrapperCol={{span: 20}}>
          <Form.Item key="productId" label="产品">
            <Select placeholder="请选择产品" defaultValue={props.productId}
                    disabled={!!props.productId}
                    onChange={(event: string) => {
                      setProduct(event);
                    }}>
              {(productList || []).map(item => (
                <Select.Option
                  key={JSON.stringify({productId: item.id, productName: item.name})}
                  value={item.id}
                >
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {(product || props.productId) && (
            <div>
              <Form.Item label="文件格式">
                <Radio.Group onChange={e => {
                  setFileType(e.target.value);
                }} defaultValue=".xlsx">
                  <Radio.Button value=".xlsx">xlsx</Radio.Button>
                  <Radio.Button value=".csv">csv</Radio.Button>
                </Radio.Group>

                <Checkbox onChange={(e) => {
                  setAutoDeploy(e.target.checked);
                }} style={{marginLeft: 15}}>自动启用</Checkbox>
              </Form.Item>
              <Form.Item label="文件上传">
                <Upload {...uploadProps}>
                  <Button icon="upload">上传文件</Button>
                </Upload>
                <span style={{marginLeft: 10}}>
                  下载模版
                  <a style={{marginLeft: 10}} onClick={() => downloadTemplate('xlsx')}>.xlsx</a>
                  <a style={{marginLeft: 10}} onClick={() => downloadTemplate('csv')}>.csv</a>
                </span>
                <br/>
                {importLoading && (
                  <div>
                    {flag ? (
                      <Badge status="processing" text="进行中"/>
                    ) : (
                      <Badge status="success" text="已完成"/>
                    )}
                    <span style={{marginLeft: 15}}>总数量:{count}</span>
                    <p style={{color: 'red'}}>{errMessage}</p>
                  </div>
                )}
              </Form.Item>
            </div>
          )}
        </Form>
      </Spin>
    </Modal>
  );
};

export default Form.create<Props>()(Import);
