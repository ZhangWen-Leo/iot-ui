import React, { useState } from 'react';
import { Button, Card, message, Spin, Tabs } from 'antd';
import Property from './Properties';
import Functions from './Functions';
import Events from './Events';
import Tags from '@/pages/device/product/save/definition/Tags';
import Form from 'antd/es/form';
import { FormComponentProps } from 'antd/lib/form';
import MetaData from '@/pages/device/product/save/model/metaData';
import QuickImport from '@/pages/device/product/save/model/quickImport';
import apis from '@/services';
import { DeviceProduct } from '@/pages/device/product/data';
import { ProductContext } from '../../context';

interface Props extends FormComponentProps {
  basicInfo: Partial<DeviceProduct>;
  saveProperty: Function;
  saveFunctions: Function;
  saveEvents: Function;
  saveTags: Function;
  unitsData: Function;
  propertyData: any;
  functionsData: any;
  eventsData: any;
  tagsData: any;
  update: Function;
}

export const TenantContext = React.createContext({});

interface State {
  basicInfo: Partial<DeviceProduct>;
}

const Definition: React.FC<Props> = props => {
  const initState: State = {
    basicInfo: props.basicInfo,
  };

  const [basicInfo, setBasicInfo] = useState(initState.basicInfo);
  const [spinning, setSpinning] = useState(false);
  const [metaDataVisible, setMetaDataVisible] = useState(false);
  const [quickImportVisible, setQuickImportVisible] = useState(false);
  const [importData, setImportData] = useState<any>({
    properties: props.propertyData,
    functions: props.functionsData,
    events: props.eventsData,
    tags: props.tagsData,
  });

  const updateModel = (item?: any) => {
    apis.deviceProdcut
      .update(item, basicInfo.id)
      .then((response: any) => {
        if (response.status === 200) {
          basicInfo.metadata = item.metadata;
          setBasicInfo(basicInfo);
          let data = JSON.parse(item.metadata);
          setImportData({
            properties: data.properties,
            functions: data.functions,
            events: data.events,
            tags: data.tags,
          });
          message.success('物模型导入成功');
        }
        setSpinning(false);
      })
      .catch(() => {})
      .finally(() => props.update());
  };

  const operations = (
    <>
      <Button
        onClick={() => {
          setQuickImportVisible(true);
        }}
      >
        快速导入
      </Button>
      {props.basicInfo.metadata && (
        <Button
          style={{ marginLeft: 10 }}
          onClick={() => {
            setMetaDataVisible(true);
          }}
        >
          物模型 TSL
        </Button>
      )}
    </>
  );

  return (
    <Card>
      <Spin spinning={spinning}>
        <TenantContext.Provider value={importData}>
          <ProductContext.Provider value={props.basicInfo}>
            <Tabs
              defaultActiveKey="1"
              tabPosition="top"
              type="card"
              tabBarExtraContent={operations}
            >
              <Tabs.TabPane tab="属性定义" key="1">
                <Property
                  data={props.propertyData}
                  unitsData={props.unitsData}
                  save={(data: any, onlySave: boolean) => {
                    props.saveProperty(data, onlySave);
                  }}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="功能定义" key="2">
                <Functions
                  data={props.functionsData}
                  unitsData={props.unitsData}
                  save={(data: any, onlySave: boolean) => {
                    props.saveFunctions(data, onlySave);
                  }}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="事件定义" key="3">
                <Events
                  data={props.eventsData}
                  unitsData={props.unitsData}
                  save={(data: any, onlySave: boolean) => {
                    props.saveEvents(data, onlySave);
                  }}
                />
              </Tabs.TabPane>
              {/*<Tabs.TabPane tab="标签定义" key="4">*/}
              {/*  <Tags*/}
              {/*    data={props.tagsData}*/}
              {/*    unitsData={props.unitsData}*/}
              {/*    save={(data: any, onlySave: boolean) => {*/}
              {/*      props.saveTags(data, onlySave);*/}
              {/*    }}*/}
              {/*  />*/}
              {/*</Tabs.TabPane>*/}
            </Tabs>
          </ProductContext.Provider>
        </TenantContext.Provider>
        {metaDataVisible && (
          <MetaData
            close={() => {
              setMetaDataVisible(false);
            }}
            productId={basicInfo.id}
          />
        )}
        {quickImportVisible && (
          <QuickImport
            close={() => {
              setQuickImportVisible(false);
            }}
            update={(item: any) => {
              setQuickImportVisible(false);
              setSpinning(true);
              updateModel({ metadata: item });
            }}
          />
        )}
      </Spin>
    </Card>
  );
};

export default Form.create<Props>()(Definition);
