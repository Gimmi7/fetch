const fetch = require('node-fetch');
const XLSX = require('xlsx');
const fs = require('fs');


let groupId = '';
let body = "av=100025615444807&__user=100025615444807&__a=1&__dyn=7AzHxqU5a5Q1ryaxG4VuC0BVU98nwgU765QdwSwAyUco2qwJyEiwp8eE6u3y4o0B-q7oc81xoswMwto88628wgolzUO0n2US2G2Caw9m8wsU9kbxSEtwi831wnEcUC68gwHwlE-UqwsUkxe2GewGwsoqBwJK5Umxm5oe8464-5o4q3y1MBwxy88EbU39Bw_wAyES&__csr=gqi89EY8OisIGOP88OEhn5N4ID4ED_tHbdtjsKDn4GyFJPp2dfkG8BfFqlDyLLXV5iRqi-VfXze-WjWGCjAApaLGQtGDykiVqABGvRKGAHRjJbGRAy8x1i9Jpeqi9x6ucp4mFfyah8yAh6-9Kq8xdvCyF8Rp42ecAgOfggjUGbyfx6cgRe9yVWx-Vo8EybAAxaeAzuhAW-EqzoWcDKpy8gDhK6EdudJ1dCgfHy8Suuu2y2iVEsxJ2FoOayUmwDxK6E4ei7E9E-22uU6idz89EozEizXyElzolKu1fxO3i3yjwwy89onxO2Oawwx68whElyEK27zF80H2E0g1gfk01KoeubF0zxK2q0g8M2tzUkwk80x52o2Fo0AC0m21QhmEOF43ycUS0SoswgbDwq85uU1eQ1tUaE13980kVw7Zwu8&__req=a&__beoa=0&__pc=EXP2%3Acomet_pkg&__bhv=2&__no_rdbl=1&dpr=1.5&__ccg=GOOD&__rev=1003682456&__s=56rbks%3Agefww9%3A1zilxc&__hsi=6955384724262670347-0&__comet_req=1&fb_dtsg=AQH0Vo2GHHAd%3AAQFuROZkAQKg&jazoest=21966&__spin_r=1003682456&__spin_b=trunk&__spin_t=1619426702&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=GroupsCometMembersPageNewForumMembersSectionRefetchQuery&variables=%7B%22count%22%3A10%2C%22cursor%22%3A%22AQHRuajUYdbhjgJRtDhixmUpYJhGvN10qhg26Of-dgp0fWYHGpUEre2x-cPfJ61nNzO0qDhVxH4kgkh-w0mvL8fpxQ%22%2C%22groupID%22%3A%221556327391135482%22%2C%22scale%22%3A1.5%2C%22id%22%3A%221556327391135482%22%7D&server_timestamps=true&doc_id=4276341945786615";

const deDupSet = new Set();
const userArr = [];

function doFetch() {
  fetch("https://www.facebook.com/api/graphql/", {
    "headers": {
      "accept": "*/*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "cookie": "sb=_IpaXnjAI_OiRRartF-64Wkp; datr=_IpaXtvRCMvdYK8WHfzt7r4x; c_user=100025615444807; _fbp=fb.1.1614240765791.1202733604; spin=r.1003682186_b.trunk_t.1619418023_s.1_v.2_; presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1619423073812%2C%22v%22%3A1%7D; xs=47%3AFpaaLh5_jztuNw%3A2%3A1611143202%3A1823%3A15570%3A%3AAcVvwdtUFSM-9sxBd49_OiVwbD6Yh4O5gL3I1DDtvdw; fr=1tiNLq7jVqhdp19xZ.AWUfG7GzBusa6nvJKFIkV0GVVLg.BghnIc.b1.AAA.0.0.BghnIc.AWVGx75CKHo; m_pixel_ratio=1.25; wd=1920x975; dpr=1.25"
    },
    "referrer": "https://www.facebook.com/groups/1556327391135482/members",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": body,
    "method": "POST",
    "mode": "cors"
  })
    .then(res => res.json())
    .then(json => {
      const node = json.data.node;
      groupId = node.id;
      const edges = node.new_forum_members.edges;
      edges.forEach(v => {
        const user = {};
        user.id = v.node.id;
        user.name = v.node.name;
        user.avatar = v.node.profile_picture.uri;
        if (!deDupSet.has(user.id)) {
          deDupSet.add(user.id);
          userArr.push(user);
        } else {
          console.warn("----------dup user=" + user);
        }
      })
      console.log(userArr.length);
      // continue next query with new cursor
      const page_info = node.new_forum_members.page_info;
      if (page_info.has_next_page) {
        const cursor = page_info.end_cursor;
        const replacement = "cursor%22%3A%22" + cursor + "%22";
        body = body.replace(/cursor%22%3A%22(.+?)%22/, replacement);
        doFetch();
      } else {
        let sheet = XLSX.utils.json_to_sheet(userArr);
        let csv = XLSX.utils.sheet_to_csv(sheet);
        const fileName = "D:/trashCan/facebook/group_" + groupId + ".csv";
        if (!fs.existsSync(fileName)) {
          touch(fileName);
        }
        fs.writeFileSync(fileName, csv);
        console.log("write csv to file " + fileName);
        return;
      }
    })
}

function touch(fileName) {
  const arr = fileName.split('/');
  let dir = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    dir = dir + '/' + arr[i];
  }
  fs.writeFileSync(fileName, '')
}

doFetch();

