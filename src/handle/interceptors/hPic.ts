import YBot from '../../core/YBot';
import { actionParamType } from '../../core/Interceptor';
import { getHPic } from '../../modules/hPic';
import config from '../../../config';
import { hPicReplyText } from '../../customize/replyTextConfig';
const yoruConfig = config.yoruConfig;

function hPicRule(message: string) {
  if (!yoruConfig.hPic.enable) {
    return { hit: false }
  }
  const exec = /((要|发|份|点)大?(色|h|瑟|涩)图)/.exec(message);
  let needBig = false;
  if (exec !== null) {
    needBig = message.search('大') !== -1;
  }
  return {
    hit: exec !== null,
    param: { needBig }
  }
}
function hPicAction(param: actionParamType) {
  const ybot = YBot.getInstance();
  const { senderId, groupId, resultParam } = param;
  const needBig = resultParam?.needBig;
  if (groupId) {
    //0=全年龄,1=混合,2=r18Only
    let limitLevel = 0 as 0 | 1 | 2;
    //设置色图限制等级
    const whiteOnly = yoruConfig.hPic.whiteOnly;
    const whiteList = yoruConfig.hPic.whiteGroup;
    const inWhiteList = whiteList.includes(groupId);
    if (whiteOnly && !inWhiteList) {
      //该群无色图权限
      ybot.sendGroupMsg(groupId, hPicReplyText.noAuth);
      return;
    }
    if (inWhiteList) {
      const lv = yoruConfig.hPic.whiteGroupLimit;
      if ([0, 1, 2].includes(lv)) {
        limitLevel = lv as 0 | 1 | 2;
      }
    }
    getHPic(limitLevel, needBig).then(resultMsg => {
      ybot.sendGroupMsg(groupId, resultMsg);
    })
  } else {
    //私聊无限制
    getHPic(1, needBig).then(resultMsg => {
      ybot.sendPrivateMsg(senderId, resultMsg)
    })
  }
}

export default {
  name: 'hPic',
  doRule: hPicRule,
  doAction: hPicAction
}