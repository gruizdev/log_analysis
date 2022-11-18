import React from 'react';
import './App.css';
import { Layout, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';
import { Pie } from '@ant-design/plots';
import ILogInfo from './ILogInfo';
import IRegExLine from './IRegExLine';

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

    console.log("Lines: " + rawContent.split(/\r?\n/).length);

    const regex = /(?<host>.+)\s\[(?<date>.+)\]\s\"(?<method>\w+)\s(?<url>.+)\s(?<protocol>\w+)\/(?<version>.+)\"\s(?<code>\d+)\s(?<bytes>\d+|\-)/gm;
    const lines = rawContent.split(/\r?\n/);
    return lines.map<ILogInfo>(l => {
      const match = l.match(regex);
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
    
    // const regex = /(?<host>.+)\s\[(?<date>.+)\]\s\"(?<method>\w+)\s(?<url>.+)\s(?<protocol>\w+)\/(?<version>.+)\"\s(?<code>\d+)\s(?<bytes>\d+|\-)\n/gm;

    // const result = Array.from(rawContent.matchAll(regex));    

    // return result.map<ILogInfo>(match => {
    //   const groups = match?.groups;
    //   if(groups){
    //     const dateParts = groups["date"].split(":");
    //     return {
    //       host: groups["host"],
    //       datetime: {day: dateParts[0], hour: dateParts[1], minute: dateParts[2], second: dateParts[3]},
    //       request: {method: groups["method"], url: groups["url"], protocol: groups["protocol"], protocol_version: groups["version"]},
    //       response_code: groups["code"],
    //       document_size: Number(groups["bytes"])
    //     }
    //   }
    //   else return {
    //     host: "",
    //     datetime: {day: "", hour: "", minute: "", second: ""},
    //     request: {method: "", url: "", protocol: "", protocol_version: ""},
    //     response_code: "200",
    //     document_size: 0      
    //   };
    // });    
  }

  const getHttpMethodsChartData = (lines : ILogInfo[]) => {
    const httpMethods = new Set([...lines.map(x => x.request.method)]);
    return Array.from(httpMethods).map<{type: string, value: number}>(x => ({type: x, value: lines.filter(l => l.request.method === x).length}));
  }

  return (
    <Layout>
      <Layout.Header>
        <Upload action={onFileUpload} showUploadList={false} >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Layout.Header>
      <Layout.Content>
        {info.length > 0 ? 
          <>
            <Pie data={getHttpMethodsChartData(info)} angleField='value' colorField='type' />
          </> 
          :
          <h1>Please upload a log file above</h1>
        }
      </Layout.Content>
    </Layout>
  );
}

export default App;
