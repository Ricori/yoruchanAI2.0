import YBot from '../core/YBot';
import {
  interceptorsType,
  actionParamType,
  doInterceptor,
  testInterceptor
} from '../core/Interceptor';
import { IPrivateMessage, IGroupMessage, IAllMessage } from '../core/MessageType';
import REPLYTEXT from '../customize/replyTextConfig';

export default function handleCommon(messageInfo: IPrivateMessage | IGroupMessage) {

  const interceptors: interceptorsType = [
    {
      name: 'helpText',
      doRule: helpTextRule,
      doAction: helpTextAction
    },


  ];

  return doInterceptor(interceptors, messageInfo);
}


function hasText(text: string, findText: string) {
  return text.search(findText) !== -1;
}
function hasImage(msg: string) {
  return msg.indexOf("[CQ:image") !== -1;
}
function replyMessage(param: actionParamType, msg: string, at = false) {
  const ybot = YBot.getInstance();
  const { senderId, senderGroupId } = param;
  if (senderGroupId) {
    ybot.sendGroupMsg(senderGroupId, msg, at ? senderId : undefined);
  } else {
    ybot.sendPrivateMsg(senderId, msg)
  }
};

function helpTextRule(message: string) {
  return {
    hit: hasText(message, 'help') || hasText(message, '帮助')
  }
}
function helpTextAction(param: actionParamType) {
  replyMessage(param, REPLYTEXT.helptext, true)
}