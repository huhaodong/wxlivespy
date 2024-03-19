import axios from 'axios';
import {
  LiveMessageInfo,
  LiveStatus,
  AnchorInfo,
  ResponseData,
  formatFromAnchorInfo,
  formatFromMessageBody,
  formatFromeStatusBody,
} from './dataFormat';

export default class DSHandler {
  private url: string = 'http://dataservice.xtdy.xyz';

  // get请求函数
  // eslint-disable-next-line class-methods-use-this
  public async getData(api: string): Promise<ResponseData> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.get<ResponseData>(this.url + api);
        // eslint-disable-next-line no-console
        console.log(response.data); // 这里可以看到响应数据
        resolve(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.error('请求错误:', error.message);
        } else {
          // eslint-disable-next-line no-console
          console.error('未知错误:', error);
        }
        reject(error);
      }
    });
  }

  // 函数发送POST请求
  // eslint-disable-next-line class-methods-use-this
  public async sendPostRequest(api: string, data: any): Promise<ResponseData> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(this.url + api, data);
        // eslint-disable-next-line no-console
        console.log('服务器响应:', response.data);
        // 处理响应数据
        resolve(response.data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('发送POST请求出错:', error);
        // 处理错误
        reject(error);
      }
    });
  }

  // 发送livestatus到服务器
  public sendLivestatus(data: any): void {
    formatFromeStatusBody(data)
      // eslint-disable-next-line promise/always-return
      .then((formattedData) => {
        // eslint-disable-next-line promise/no-nesting
        this.sendPostRequest('/livestatus', formattedData).catch((error) => {
          // eslint-disable-next-line no-console
          console.error('发送Livestatus请求出错:', error);
        });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }

  // 发送livemessage到服务器
  public sendLivemessage(data: any, liveID: string): void {
    formatFromMessageBody(data, liveID)
      // eslint-disable-next-line promise/always-return
      .then((formattedData) => {
        // eslint-disable-next-line promise/no-nesting
        this.sendPostRequest('/livemessage', formattedData).catch((error) => {
          // eslint-disable-next-line no-console
          console.error('发送Livestatus请求出错:', error);
        });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }

  // 发送anchor info到服务器
  public sendAnchorinfo(wechatUin: string, nickname: string): void {
    formatFromAnchorInfo(wechatUin, nickname)
      // eslint-disable-next-line promise/always-return
      .then((formattedData) => {
        // eslint-disable-next-line promise/no-nesting
        this.sendPostRequest('/anchorinfo', formattedData).catch((error) => {
          // eslint-disable-next-line no-console
          console.error('发送Livestatus请求出错:', error);
        });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }
}
