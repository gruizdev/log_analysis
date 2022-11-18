import React from 'react';
import './App.css';
import { Layout, Upload, Button, UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile, UploadChangeParam } from 'antd/es/upload';
import ILogInfo from './ILogInfo';

function App() {

  const [info, setInfo] = React.useState<ILogInfo[]>([]);  

  const onFileUpload = async (file: RcFile) : Promise<string> => {
    const text = await file.text();
    const lines = processFile(text);
    setInfo(lines);
    console.log(lines);
    return text;
  }

  const processFile = (rawContent: string) : ILogInfo[] => {
    
    const regex = /(?<host>.+)\s\[(?<date>.+)\]\s\"(?<method>\w+)\s(?<url>.+)\s(?<protocol>\w+)\/(?<version>.+)\"\s(?<code>\d+)\s(?<bytes>\d+|\-)/gm;

    const result = Array.from(rawContent.matchAll(regex));    

    return result.map<ILogInfo>(match => {
      const groups = match?.groups;
      if(groups){
        const dateParts = groups["date"].split(":");
        return {
          host: groups["host"],
          datetime: {day: dateParts[0], hour: dateParts[1], minute: dateParts[2], second: dateParts[3]},
          request: {method: groups["method"], url: groups["url"], protocol: groups["protocol"], protocol_version: groups["version"]},
          response_code: groups["code"],
          document_size: Number(groups["bytes"])
        }
      }
      else return {
        host: "",
        datetime: {day: "", hour: "", minute: "", second: ""},
        request: {method: "", url: "", protocol: "", protocol_version: ""},
        response_code: "200",
        document_size: 0      
      };
    });    
  }

  return (
    <Layout>
      <Layout.Header>
        <Upload action={onFileUpload} showUploadList={false} >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Layout.Header>
      <Layout.Content>

      </Layout.Content>
    </Layout>
  );
}

export default App;
