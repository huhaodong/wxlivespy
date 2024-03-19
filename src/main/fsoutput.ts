/* eslint-disable class-methods-use-this */
import path from 'path';
import log from 'electron-log';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import { pad2,pad3 } from '../CommonUtil';

import { DecodedData, LiveInfo, LiveMessage } from '../CustomTypes';

export default class FileProcess {
  private path: string;

  private fileFrontName: string = '';

  public liveID: string = '';

  // 定义一个函数，接受一个路径作为参数
  private createDirectoryIfNotExists(dirPath: string): void {
    // 获取路径的绝对路径
    const absolutePath = path.resolve(dirPath);
    // 判断路径是否存在
    if (!fs.existsSync(absolutePath)) {
      // 如果路径不存在，创建路径
      fs.mkdirSync(absolutePath, { recursive: true });
      // recursive 选项表示如果有多层文件夹都不存在，就循环创建
      console.log(`创建了 ${absolutePath} 文件夹`);
    } else {
      // 如果路径已存在，打印提示信息
      console.log(`${absolutePath} 文件夹已存在`);
    }
  }

  constructor(path: string) {
    this.path = path;
    this.createDirectoryIfNotExists(path);
  }

  private delSpecialChar(str: String) {
    let nicknamestr = str;
    if (!nicknamestr || nicknamestr.length === 0) {
      nicknamestr = 'unknown';
    }
    let regex = /["*<>?\\/|:]/g;
    let newStr = nicknamestr.replace(regex, '');
    return newStr;
  }

  private dateString(date: number) {
    const dateIns = new Date(date * 1000);
    const year = dateIns.getFullYear().toString();
    const month = pad2(dateIns.getMonth() + 1);
    const day = pad2(dateIns.getDate());
    const hour = pad2(dateIns.getHours());
    const minute = pad2(dateIns.getMinutes());
    const second = pad2(dateIns.getSeconds());

    const dateStr = `${year}-${month}-${day}`;
    const timeStr = `${hour}:${minute}:${second}`;

    return {datestr: dateStr, timestr: timeStr};
  }

  private timeDiff(diff: number){

    const days = Math.floor(diff / (24 * 3600));
    const hour = Math.floor((diff % (24 * 3600)) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    const time_str = `${days}d${hour}h${minutes}m${seconds}s`;

    return time_str;
  }

  // 格式化直播间的状态值
  private fromLiveInfoData(data: LiveInfo) {
    // 点赞数
    const like_count = data.like_count;

    // 直播间id，每次开始直播都可能变动
    const live_id = data.live_id;

    // 主播的微信名称

    // const nickname = data.nickname? data.nickname: 'unknown';

    // 主播微信的id，直播间唯一标识
    const wechat_uin = data.wechat_uin;

    // 直播间在线人数
    const online_count = data.online_count;

    // 直播间礼物价值，真实热度
    const reward_total_amount_in_wecoin = data.reward_total_amount_in_wecoin;

    // 直播开始时间
    const start_timestamp = data.start_time;
    const start_date_map = this.dateString(start_timestamp);
    const start_date_str = start_date_map.datestr;
    const start_time_str = start_date_map.timestr;

    // 获取当前时间戳
    const current_timestamp = Math.floor(Date.now()/1000);
    const current_date_map = this.dateString(current_timestamp);
    const current_date_str = current_date_map.datestr;
    const current_time_str = current_date_map.timestr;

    // 直播时长
    const live_timestamp = current_timestamp - start_timestamp;
    const live_timestr = this.timeDiff(live_timestamp);

    return {
      WechatUin: wechat_uin,
      LiveID: live_id,
      LikeCount: like_count,
      OnlineCount: online_count,
      RewardTotalAmountInWecoin: reward_total_amount_in_wecoin,
      StartTimestamp: start_timestamp,
      StartDateStr: start_date_str,
      StartTimeStr: start_time_str,
      CurrentTimestamp: current_timestamp,
      CurrentDateStr: current_date_str,
      CurrentTimeStr: current_time_str,
      LiveTimestamp: live_timestamp,
      LiveTimestr: live_timestr,
    }

  }

  //格式化直播间消息
  private formLiveMessageData(data: LiveMessage) {
    let mes_timestamp = Math.floor(data.msg_time/1000)
    let dateMap = this.dateString(mes_timestamp)
    return {
      userSeq: data.seq,
      userOpenID: data.sec_openid,
      userNickname: data.nickname?data.nickname : "unknow",
      messageTimestamp: mes_timestamp,
      messageDateStr: dateMap.datestr,
      messageTimeStr: dateMap.timestr,
      messageType: data.decoded_type,
      messageContent: data.content,
    }
  }

  public excelWriter(filename, fromdata) {
    log.debug(`开始写入信息到Excel文件: ${filename}`);
    const array = [fromdata];
    if(fs.existsSync(filename)){

      // 如果文件存在，读取文件中的工作簿对象
      // let workbook = XLSX.readFile(filename);
      let buffer = fs.readFileSync(filename);
      let workbook = XLSX.read(buffer, {type: 'buffer'});

      // 获取第一个工作表对象
      let worksheet = workbook.Sheets[workbook.SheetNames[0]];
      // 将数据数组转换为工作表对象，从原有的最后一行开始追加
      let newWorksheet = XLSX.utils.json_to_sheet(array);
      // 获取第一个 worksheet 的最后一行的行号
      const lastRow = XLSX.utils.decode_range(worksheet['!ref']).e.r;
      // 将第二个 worksheet 的所有行追加到第一个 worksheet 中，从第一个 worksheet 的最后一行的下一行开始
      XLSX.utils.sheet_add_json(worksheet, XLSX.utils.sheet_to_json(newWorksheet), {skipHeader: true, origin: {r: lastRow + 1, c: 0}});
      // 将合并后的工作表对象更新到工作簿对象中
      workbook.Sheets[workbook.SheetNames[0]] = worksheet;
      // 将工作簿对象写入文件中
      // 将 workbook 转换为一个 buffer 对象
      const buf = XLSX.write(workbook, {type: 'buffer'});
      log.debug(`>>> Excel文件已经存在将新纪录输出到该文件中`);
      fs.writeFileSync(filename, buf);
    }else {
      // 如果文件不存在，创建一个新的工作簿对象
      let workbook = XLSX.utils.book_new();
      // 将数据数组转换为工作表对象
      let worksheet = XLSX.utils.json_to_sheet(array);
      // 将工作表对象添加到工作簿对象中，命名为 Sheet1
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      // 将工作簿对象写入文件中
      // 将 workbook 转换为一个 buffer 对象
      const buf = XLSX.write(workbook, {type: 'buffer'});

      log.debug(`>>> Excel文件不存在将记录输出到新文件中`);

      // 使用 fs 模块将 buffer 写入到一个文件中，
      fs.writeFileSync(filename, buf);
      fs.chmodSync(filename, '777'); // 字符串表示法
    }
  }

  public liveInfoExcelWriter(data: LiveInfo) {
    const fromdata = this.fromLiveInfoData(data);
    if (this.fileFrontName === '') {
      this.fileFrontName = `${fromdata.StartDateStr}_${fromdata.StartTimeStr.replace(/:/g, '-')}`;
      this.liveID = fromdata.LiveID;
      log.debug(`>>> 第一次收到直播数据，将获取前置文件名：${this.fileFrontName} 以及liveid：${this.liveID}`);
    }
    const fname = `${this.fileFrontName}_LiveStatus.xlsx`;
    const filename = path.join(this.path, fname);
    this.excelWriter(filename, fromdata);
  }

  public messageInfoExcelWrite(data: LiveMessage) {
    const fromdata = this.formLiveMessageData(data);
    if (this.fileFrontName === ''){
      log.debug(`>>> 没有获得当前直播的时间，无法创建弹幕文件，部分弹幕将丢失。。`);
    }else{
      const fname = `${this.fileFrontName}_LiveMessages.xlsx`;
      const filename = path.join(this.path, fname);
      this.excelWriter(filename, fromdata);
    }
  }

}
