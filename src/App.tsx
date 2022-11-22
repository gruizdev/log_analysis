import React from 'react';
import './App.css';
import { Layout, Upload, Button, Row, Col, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';
import { Pie, Column, Line } from '@ant-design/plots';
import ILogInfo from './ILogInfo';

import data from './logData.json';

function App() { 

  const [info, setInfo] = React.useState<ILogInfo[]>(data as ILogInfo[]);  

  const onFileUpload = async (file: RcFile) : Promise<string> => {
    const text = await file.text();
    const lines = processFile(text);
    setInfo(lines);
    console.log(lines);
    const a = getRequestsPerHour(lines);
    console.log(a);
    return text;
  }  

  const processFile = (rawContent: string) : ILogInfo[] => {
        
    const regex = /(?<host>.+)\s\[(?<date>.+)\]\s"(?<method>\w+)\s((?<url>.+)\s(?<protocol>\w+)\/(?<version>.+)|(?<fullUrl>.+))"\s(?<code>\d+)\s(?<bytes>\d+|-)/gm;

    const result = Array.from(rawContent.matchAll(regex));    

    return result.map<ILogInfo>(match => {
      const groups = match?.groups;
      if(groups){
        const dateParts = groups["date"].split(":");

        return {
          host: groups["host"],
          datetime: {
              day: dateParts[0],
              hour: dateParts[1],
              minute: dateParts[2],
              second: dateParts[3]
          },
          request: {
              method: groups["method"],
              url: groups["url"] || groups["fullUrl"],
              protocol: groups["protocol"] || "",
              protocol_version: groups["version"] || ""
          },
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

  const getHttpMethodsChartData = (lines : ILogInfo[]) => {
    const httpMethods = new Set([...lines.map(x => x.request.method)]);
    return Array.from(httpMethods).map<{type: string, value: number}>(x => ({type: x, value: lines.filter(l => l.request.method === x).length}));
  }

  const getHttpCodesChartData = (lines: ILogInfo[]) => {
    const httpCodes = new Set([...lines.map(x => x.response_code)]);
    return Array.from(httpCodes).map<{type: string, value: number}>(x => ({type: x, value: lines.filter(l => l.response_code === x).length}));
  }

  const getLowSizeRequestsSize = (lines: ILogInfo[]) => {
    const lowSizeRequests = lines.filter(x => x.response_code === "200" && x.document_size < 1000);
    const distribution = lowSizeRequests.reduce((previous: any, current) => {
      const result = Math.trunc(current.document_size/100);
      if(previous[result] >= 0) previous[result] = previous[result] + 1;
      else previous[result] = 0;
      return previous;
    }, {});
    return [
      {size: "0 - 99", value: distribution[0] || 0},
      {size: "100 - 199", value: distribution[1] || 0},
      {size: "200 - 299", value: distribution[2] || 0},
      {size: "300 - 399", value: distribution[3] || 0},
      {size: "400 - 499", value: distribution[4] || 0},
      {size: "500 - 599", value: distribution[5] || 0},
      {size: "600 - 699", value: distribution[6] || 0},
      {size: "700 - 799", value: distribution[7] || 0},
      {size: "800 - 899", value: distribution[8] || 0},
      {size: "900 - 999", value: distribution[9] || 0},
    ];  
  }

  const getRequestsPerHour = (lines: ILogInfo[]) => {
    const requests = lines.reduce((previous: any, current) => {
      const dayHour = `${current.datetime.day}-${current.datetime.hour}:00`;
      if(previous[dayHour] >= 0) previous[dayHour] = previous[dayHour] + 1;
      else previous[dayHour] = 0;
      return previous;
    }, {});

    return Object.entries(requests).map(x => ({date: x[0], requests: x[1]}));
  }

  const getRequestsPerMinute = (lines: ILogInfo[]) => {
    const requests = lines.reduce((previous: any, current) => {
      const dayHourMinute = `${current.datetime.day}-${current.datetime.hour}:${current.datetime.minute}`;
      if(previous[dayHourMinute] >= 0) previous[dayHourMinute] = previous[dayHourMinute] + 1;
      else previous[dayHourMinute] = 0;
      return previous;
    }, {});
    return Object.entries(requests).map(x => ({date: x[0], requests: x[1]}));
  }  

  return (
    <Layout>
      <Layout.Header>
        {/* <Upload action={onFileUpload} showUploadList={false} >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload> */}
        
        <Row justify={'center'}><h1 style={{color: 'white'}}>UFirst assignment</h1></Row>
      </Layout.Header>
      <Layout.Content style={{margin: "10px"}}>        
        {info.length > 0 ? 
          <>
            <Row gutter={[16, 16]} justify={'center'}>
              <Col xs={22} style={{border: "1px dotted"}}>
                <h2>Requests per minute</h2>
                <Line 
                  data={getRequestsPerMinute(info)}
                  padding='auto'
                  xField='date'
                  yField='requests'
                  xAxis={{tickCount: 5, title: {text: "Day and time"}}}
                  yAxis={{title: {text: "Number of requests"}}}
                  smooth={true}
                  slider={{start: 0, end: 1}}
                />
              </Col>
              <Col xs={22} sm={11} style={{border: "1px dotted"}}>
                <h2>Distribution of HTTP methods</h2>
                <Pie 
                  data={getHttpMethodsChartData(info)} 
                  appendPadding={10}
                  angleField='value'
                  colorField='type'
                  radius={0.8}
                  label={{type: 'outer'}}
                  interactions={[{type: 'element-active'}]}
                />                
              </Col>
              <Col xs={22} sm={11} style={{border: "1px dotted"}}>
                <h2>Distribution of HTTP answer codes</h2>
                <Pie 
                  data={getHttpCodesChartData(info)} 
                  appendPadding={10}
                  angleField='value'
                  colorField='type'
                  radius={0.8}
                  label={{type: 'outer'}}
                  interactions={[{type: 'element-active'}]}
                />                
              </Col>
              <Col xs={22} style={{border: "1px dotted"}}>
                <h2>Distribution of the size of the answer of all requests with code 200 and size &lt;1000B</h2>
                <Column
                  data={getLowSizeRequestsSize(info)}
                  xField='size'
                  yField='value'
                  appendPadding={10}
                  label={{
                    position: 'middle',
                    style: {
                      fill: '#FFFFFF',
                      opacity: 0.6,
                    },
                  }}
                  xAxis={{title: {text:"Size in bytes"}}}
                  yAxis={{title: {text: "Number of requests"}}}
                  />                
              </Col>
            </Row>            
          </> 
          :
          <h1>Please upload a log file above</h1>
        }
      </Layout.Content>
    </Layout>
  );
}

export default App;
