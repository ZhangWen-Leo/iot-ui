import React, {useEffect, useState} from 'react';
import {Button, Card, Divider, Form, Input, Select, Spin} from 'antd';
import apis from '@/services';
import {FormComponentProps} from "antd/lib/form";
import AceEditor from "react-ace";
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/mode-hjson';
import 'ace-builds/src-noconflict/mode-jsoniq';
import 'ace-builds/src-noconflict/snippets/json';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/theme-eclipse';

interface Props extends FormComponentProps {
  device: any
}

interface State {
  propertiesData: any[];
  functionsSelectList: any[];
  functionsInfo: any;
  spinning: boolean;
}

const Functions: React.FC<Props> = (props) => {

    const {
      form: {getFieldDecorator, setFieldsValue},
      form,
    } = props;

    const initState: State = {
      propertiesData: [],
      functionsSelectList: [],
      functionsInfo: {},
      spinning: false,
    };

    const [functionsSelectList] = useState(initState.functionsSelectList);
    const [functionsInfo, setFunctionsInfo] = useState(initState.functionsInfo);
    const [spinning, setSpinning] = useState(initState.spinning);

    useEffect(() => {
      const {functions} = JSON.parse(props.device.metadata);
      const map = {};
      functions.forEach((item: any) => {
        map[item.id] = item;
        functionsSelectList.push(<Select.Option key={item.id}>{item.name}</Select.Option>);
      });
      setFunctionsInfo(map);
    }, []);

    const debugFunction = () => {
      setSpinning(true);

      form.validateFields((err, fileValue) => {
        if (err) return;

        localStorage.setItem(`function-debug-data-${props.device.id}-${fileValue.functionId}`, fileValue.functionData);

        apis.deviceInstance
          .invokedFunction(props.device.id, fileValue.functionId, JSON.parse(fileValue.functionData))
          .then(response => {
            const tempResult = response?.result;
            if (response.status === 200) {
              typeof tempResult === 'object' ?
                setFieldsValue({logs: JSON.stringify(tempResult)}) :
                setFieldsValue({logs: tempResult})
            }
            setSpinning(false);
          }).catch(() => {
          setFieldsValue({logs: '????????????'});
        });
      });
    };

    return (
      <div>
        <Spin spinning={spinning}>
          <Card style={{marginBottom: 20}} title="????????????">
            <Form labelCol={{span: 2}} wrapperCol={{span: 22}}>
              <Form.Item label="????????????">
                {getFieldDecorator('functionId', {
                  rules: [
                    {required: true, message: '?????????????????????'},
                  ],
                })(<Select placeholder="?????????????????????" onChange={(e: any) => {
                  const map = {};
                  functionsInfo[e].inputs.forEach((item: any) => {
                    map[item.id] = item.name;
                  });
                  setFieldsValue({
                    'functionData':
                      localStorage.getItem(`function-debug-data-${props.device.id}-${e}`) ||
                      JSON.stringify(map, null, 2)
                  });
                }}>
                  {functionsSelectList}
                </Select>)}
              </Form.Item>
              <Form.Item label="?????????">
                {getFieldDecorator('functionData', {
                  rules: [
                    {required: true, message: '?????????????????????'},
                  ],
                })(
                  <AceEditor
                    mode='json'
                    theme="eclipse"
                    name="app_code_editor"
                    key='simulator'
                    fontSize={14}
                    showPrintMargin
                    showGutter
                    wrapEnabled
                    highlightActiveLine  //???????????????
                    enableSnippets  //???????????????
                    style={{width: '100%', height: 300}}
                    setOptions={{
                      enableBasicAutocompletion: true,   //??????????????????????????????
                      enableLiveAutocompletion: true,   //?????????????????????????????? ?????????????????????????????????
                      enableSnippets: true,  //???????????????
                      showLineNumbers: true,
                      tabSize: 2,
                    }}
                  />
                )}
              </Form.Item>
              <div style={{textAlign: 'right'}}>
                <Button
                  type="primary"
                  onClick={() => {
                    debugFunction();
                  }}
                >
                  ??????
                </Button>
                <Divider type="vertical"/>
                <Button type="ghost" onClick={() => setFieldsValue({logs: undefined})}>
                  ??????
                </Button>
              </div>

              <Form.Item label="???????????????" style={{paddingTop: 20}}>
                {getFieldDecorator('logs', {})(
                  <Input.TextArea rows={4} readOnly/>
                )}
              </Form.Item>
            </Form>
          </Card>
        </Spin>
      </div>
    );
  }
;

export default Form.create<Props>()(Functions);
