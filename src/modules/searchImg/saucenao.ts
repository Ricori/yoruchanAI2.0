import Axios from 'axios';
import MessageCode from '../../core/MessageCode';

const hosts = ["saucenao.com"];
interface ISnDB {
  all: 999,
  pixiv: 5,
  danbooru: 9,
  book: 18,
  anime: 21
}

/**
 * saucenao搜索
 *
 * @param {string} imgURL 图片地址
 */
export default async function saucenaoSearch(imgURL: string) {
  const ret = await getSearchResult(hosts[0], imgURL, 999);
  if (ret.results && ret.results.length > 0) {
    const { data, header } = ret.results[0];
    //console.log(ret.results[0]);
    const {
      similarity, //相似度
      thumbnail //缩略图
    } = header;
    let {
      title, //标题
      member_name, //作者
      jp_name //本子名
    } = data;

    let isAnime = false;
    let isBook = false;

    const extUrls = data.ext_urls || [];
    let url = extUrls[0];
    //如果结果有多个，优先取danbooru
    extUrls.forEach((u: string) => {
      if (u.indexOf('danbooru') !== -1) {
        url = u;
      }
    })
    url = url.replace('http://', 'https://');
    //处理pixiv替换
    let pidSearch = /pixiv.+illust_id=([0-9]+)/.exec(url);
    if (pidSearch) {
      url = 'https://pixiv.net/i/' + pidSearch[1];
    }
    const origURL = url.replace('https://', '');
    isAnime = origURL.indexOf("anidb.net") !== -1;
    if (jp_name && jp_name.length > 0) {
      isBook = true;
    }
    //标题处理
    if (!title) {
      title = isAnime ? '[AniDB]' : '[YoruDB]';
    }
    if (member_name && member_name.length > 0) {
      title = `「${title}」/「${member_name}」`;
    }

    //低相似度警告
    /*
    if (similarity < 50) {
      //warnMsg += CQ.escape(replyText.serchSimilarityLow);
    }
    */

    //生成消息文本
    const msg = MessageCode.share(url, `${title}\n相似度达到了${similarity}%`, origURL, thumbnail);

    return {
      success: true,
      msg,
      isAnime,
      isBook,
      details: {
        similarity,
        jp_name,
        origURL,
        thumbnail
      }
    }
  } else {
    console.error(`${new Date().toLocaleString()} [Saucenao Error]API ERROR`);
    return {
      success: false,
      msg: ''
    }
  }
}

/**
 * 取得搜图结果
 *
 * @param {*} host 自定义saucenao的host
 * @param {*} imgURL 欲搜索的图片链接
 * @param {number} [db=999] 搜索库
 * @returns Axios对象
 */
async function getSearchResult(host: string, imgURL: string, db = 999) {
  const res = await Axios.get('https://' + host + '/search.php', {
    params: {
      api_key: '16abeee27bd15d00da11a60c92e7429321b8284e',
      db: db,
      output_type: 2,
      numres: 3,
      url: imgURL
    }
  });
  if (res.data) {
    return res.data
  } else {
    return {}
  }
}
