import { removeSpecialCharacters } from "./util";

export interface LiveStatus{
  wechatUin: string;
  liveID: string;
  likeCount: number;
  onlineCount: number;
  rewardTotalAmountInWecoin: number;
  startTimestamp: number;
  startDateStr: string;
  startTimeStr: string;
  currentTimeStamp: number;
  currentDateStr: string;
  currentTimeStr: string;
  liveTimestamp: number;
  liveTimeStr: string;
}

export interface LiveMessageInfo{
  liveID: string;
  userSeq: number;
  userOpenID: string;
  userNickName: string;
  messageTimestamp: number;
  messageDateStr: string;
  messageTimeStr: string;
  messageType: string;
  messageContent: string;
}

export interface AnchorInfo{
  wechatUin: string;
  nickname: string;
}

export interface ResponseData{
  status: number; // 0正常，-1error
  message: string; //回复信息
}

export function formatFromAnchorInfo(wechatUin: string, nickname: string): Promise<AnchorInfo> {
  return new Promise((resolve, reject) => {
    try {
      const ret = {} as AnchorInfo;
      ret.wechatUin = wechatUin;
      ret.nickname = removeSpecialCharacters(nickname);
      resolve(ret);
    } catch (error) {
      reject(error);
    }
  });
}

export function formatFromeStatusBody(body): Promise<LiveStatus>{
  return new Promise((resolve, reject) => {
    try {
      const ret = {} as LiveStatus;
      ret.wechatUin = body.WechatUin;
      ret.liveID = body.LiveID;
      ret.likeCount = body.LikeCount;
      ret.onlineCount = body.OnlineCount;
      ret.rewardTotalAmountInWecoin = body.RewardTotalAmountInWecoin;
      ret.startTimestamp = body.StartTimestamp;
      ret.startDateStr = body.StartDateStr;
      ret.startTimeStr = body.StartTimeStr;
      ret.currentTimeStamp = body.CurrentTimestamp;
      ret.currentDateStr = body.CurrentDateStr;
      ret.currentTimeStr = body.CurrentTimeStr;
      ret.liveTimestamp = body.LiveTimestamp;
      ret.liveTimeStr = body.LiveTimestr;
      resolve(ret);
    } catch (error) {
      reject(error);
    }
  });
}

export function formatFromMessageBody(body, liveID: string): Promise<LiveMessageInfo> {
  return new Promise((resolve, reject) => {
    try {
      const ret = {} as LiveMessageInfo;
      ret.liveID = liveID;
      ret.userSeq = body.userSeq;
      ret.userOpenID = body.userOpenID;
      ret.userNickName = removeSpecialCharacters(body.userNickname);
      ret.messageTimestamp = body.messageTimestamp;
      ret.messageDateStr = body.messageDateStr;
      ret.messageTimeStr = body.messageTimeStr;
      ret.messageType = body.messageType;
      ret.messageContent = removeSpecialCharacters(body.messageContent);
      resolve(ret);
    } catch (error) {
      reject(error);
    }
  });
}
