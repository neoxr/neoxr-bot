const { Scraper } = new(require('@neoxr/wb'))
const axios = require('axios'),
   cheerio = require('cheerio'),
   FormData = require('form-data'),
   fetch = require('node-fetch'),
   { fromBuffer } = require('file-type')
   const creator = 'Invoralink'

     
   Scraper.instagram = (url) => {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await axios("https://indown.io/");
        let _$ = cheerio.load(res.data);
        let referer = _$("input[name=referer]").val();
        let locale = _$("input[name=locale]").val();
        let _token = _$("input[name=_token]").val();
        let { data } = await axios.post(
          "https://indown.io/download",
          new URLSearchParams({
            link: url,
            referer,
            locale,
            _token,
          }),
          {
            headers: {
              cookie: res.headers["set-cookie"].join("; "),
            },
          }
        );
  
        let $ = cheerio.load(data);
        let result = [];
        let __$ = cheerio.load($("#result").html());
  
        __$("video").each(function () {
          let $$ = $(this);
          result.push({
            type: "video",
            thumbnail: $$.attr("poster"),
            url: $$.find("source").attr("src"),
          });
        });
  
        __$("img").each(function () {
          let $$ = $(this);
          result.push({
            type: "image",
            url: $$.attr("src"),
          });
        });
  
        resolve({
          creator: creator,
          status: true,
          result
        });
      } catch (error) {
        console.error("Error occurred while scraping Instagram:", error);
        resolve({
          creator: creator,
          status: false,
          message: "An error occurred while trying to scrape the Instagram URL.",
          error: error.message
        });
      }
    });
  };

Scraper.twitter = async (link) => {
    try {
      const config = {
        'URL': link
      };
      const response = await axios.post('https://twdown.net/download.php', qs.stringify(config), {
        headers: {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "sec-ch-ua": '" Not A;Brand";v="99", "Google Chrome";v="113", "Chromium";v="113"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "Windows",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/113.0.5672.126 Safari/537.36",
            "cookie": "_ga=GA1.2.1388798541.1625064838; _gid=GA1.2.1351476739.1625064838"
        }        
      });
      const $ = cheerio.load(response.data);
      return {
        desc: $('div:nth-child(1) > div:nth-child(2) > p').text().trim(),
        thumb: $('div:nth-child(1) > img').attr('src'),
        video_sd: $('tr:nth-child(2) > td:nth-child(4) > a').attr('href'),
        video_hd: $('tbody > tr:nth-child(1) > td:nth-child(4) > a').attr('href'),
        audio: 'https://twdown.net/' + $('body > div.jumbotron > div > center > div.row > div > div:nth-child(5) > table > tbody > tr:nth-child(3) > td:nth-child(4) > a').attr('href')
      };
    } catch (error) {
      throw new Error("Failed to fetch Twitter data. Please try again later.");
    }
  }

Scraper.ssweb = async (url, device) => {
    return new Promise((resolve, reject) => {
      const baseURL = 'https://www.screenshotmachine.com'
      const param = {
        url: url,
        device: device,
        cacheLimit: 0
      }
      axios({
        url: baseURL + '/capture.php',
        method: 'POST',
        data: new URLSearchParams(Object.entries(param)),
        headers: {
          'content-type': 'application/x-www-form-urlencoded charset=UTF-8'
        }
      }).then((data) => {
        const cookies = data.headers['set-cookie']
        if (data.data.status == 'success') {
          axios.get(baseURL + '/' + data.data.link, {
            headers: {
              'cookie': cookies.join('')
            },
            responseType: 'arraybuffer'
          }).then(({
              data
            }) => {
            resolve(data)
          })
        } else {
          reject()
        }
      }).catch(reject)
    })
  }

Scraper.facebook = async (url) => {
    return new Promise((resolve, reject) => {
      axios("https://getmyfb.com/process", {
        headers: {
          "cookie": "PHPSESSID=mtkljtmk74aiej5h6d846gjbo4 __cflb=04dToeZfC9vebXjRcJCMjjSQh5PprejufZXs2vHCt5 _token=K5Qobnj4QvoYKeLCW6uk"
        },
        data: {
          id: url,
          locale: "en"
        },
        "method": "POST"
      }).then(res => {
        let $ = cheerio.load(res.data)
        let result = {}
        result.author = creator
        result.caption = $("div.results-item-text").eq(0).text().trim()
        result.thumb = $(".results-item-image-wrapper img").attr("src")
        result.result = $("a").attr("href")
        resolve(result)
      })
    })
  }

Scraper.tiktok = async (query) => {
    try {
      const encodedParams = new URLSearchParams();
      encodedParams.set('url', query);
      encodedParams.set('hd', '1');

      const response = await axios({
        method: 'POST',
        url: 'https://tikwm.com/api/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': 'current_language=en',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        },
        data: encodedParams
      });

      const videos = response.data.data;
      return videos;
    } catch (error) {
      throw error;
   }
}

Scraper.chatgpt = (text) => {
   return new Promise(async (resolve, reject) => {
  axios("https://www.chatgptdownload.org/wp-json/mwai-ui/v1/chats/submit", {
     "headers": {
         "content-type": "application/json",
         "sec-fetch-dest": "empty",
         "sec-fetch-mode": "cors",
         "sec-fetch-site": "same-origin"
     },
     "referrer": "https://www.chatgptdownload.org/chatgpt/",
     "referrerPolicy": "strict-origin-when-cross-origin",
     data: {
         "id": null,
         "botId": "default",
         "session": "650a79524ce46",
         "clientId": "gbqvuirf317",
         "contextId": 443,
         "messages": [{
             "id": "2c31rhiniuu",
             "role": "assistant",
             "content": "Hi! How can I help you?",
             "who": "AI: ",
             "timestamp": 1695189063347
         }],
         "newMessage": text,
         "stream": false
     },
     "method": "POST"
 }).then(async (p) => { resolve({
                                  creator: global.creator,
                                  status: true,
                                  p
                                  })                               
                         })
 })
 }
