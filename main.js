const fs = require("fs");
const lineReader = require("line-reader");
var parse = require("date-fns/parse");
var _ = require("lodash");
var onlyEmoji = require("emoji-aware").onlyEmoji;

console.log("-------------------");
console.log("-------------------");
console.log("------ INIT -------");
console.log("-------------------");
console.log("-------------------");

const chat = [];
var results = {};

// Functions
const readChat = () => {
  lineReader.eachLine("chat.txt", function (line, last) {
    try {
      const lineSplit = line?.split("-");
      const msgDate = parse(
        lineSplit?.[0].trim(),
        "dd/MM/yy, HH:mm",
        new Date()
      );

      const content = lineSplit?.[1].split(":");
      const msgSender = content?.[0].trim();
      const msgText = content?.[1].trim();

      const msg = {
        date: msgDate,
        msgSender: msgSender,
        msgText: msgText,
      };
      chat.push(msg);

      if (last) analyzeChat();
    } catch (e) {
      //console.log("error", e);
    }
  });
};

const analyzeChat = () => {
  const chatGroupedBySender = getGroupedBySender();
  /*const nMessageBySender = getNMessageBySender(chatGroupedBySender);
  const messageLettersAvgLengthBySender = getMessageLettersAvgLengthBySender(
    chatGroupedBySender
  );
  const messageWordsAvgLengthBySender = getMessageWordsAvgLengthBySender(
    chatGroupedBySender
  );*/

  const emojiMessageGroupedBySender = getEmojiMessageBySender(
    chatGroupedBySender
  );
  /*const messageNEmojiTotalUsageBySender = getMessageNEmojiTotalUsageBySender(
    emojiMessageGroupedBySender
  );*/
  const mostUsedEmojiBySender = getMostUsedEmojiBySender(
    emojiMessageGroupedBySender
  );

  results = {
    //nMessageBySender: nMessageBySender,
    //messageLettersAvgLengthBySender: messageLettersAvgLengthBySender,
    //messageWordsAvgLengthBySender: messageWordsAvgLengthBySender,
    //messageNEmojiTotalUsageBySender: messageNEmojiTotalUsageBySender,
    mostUsedEmojiBySender: mostUsedEmojiBySender,
  };
  writeResultFile();
};

const getGroupedBySender = () => {
  return _.groupBy(chat, "msgSender");
};

const getEmojiMessageBySender = (groupedSet) => {
  const kpi = {};
  Object.entries(groupedSet).forEach(([key, value]) => {
    try {
      const sender = key;
      var emojiList = [];
      value.forEach((i) => {
        const emojiInMsg = onlyEmoji(i?.msgText);
        if (emojiInMsg.length) {
          emojiList.push(emojiInMsg);
        }
      });
      kpi[sender] = emojiList;
    } catch (e) {
      console.error(e);
    }
  });
  return kpi;
};

const getNMessageBySender = (groupedSet) => {
  const kpi = {};
  Object.entries(groupedSet).forEach(([key, value]) => {
    kpi[key] = value.length;
  });
  return kpi;
};

const getMessageLettersAvgLengthBySender = (groupedSet) => {
  const kpi = {};
  Object.entries(groupedSet).forEach(([key, value]) => {
    try {
      const sender = key;
      const average = _.meanBy(value, (i) => i?.msgText?.length);
      kpi[sender] = Number(average).toFixed(2);
    } catch (e) {
      console.error(e);
    }
  });
  return kpi;
};

const getMessageWordsAvgLengthBySender = (groupedSet) => {
  const kpi = {};
  Object.entries(groupedSet).forEach(([key, value]) => {
    try {
      const sender = key;
      const average = _.meanBy(value, (i) => i?.msgText?.split(" ")?.length);
      kpi[sender] = Number(average).toFixed(2);
    } catch (e) {
      console.error(e);
    }
  });
  return kpi;
};

const getMessageNEmojiTotalUsageBySender = (groupedSet) => {
  const kpi = {};
  Object.entries(groupedSet).forEach(([key, value]) => {
    try {
      const sender = key;
      const average = _.meanBy(value, (i) => i?.length);
      kpi[sender] = Number(average).toFixed(2);
    } catch (e) {
      console.error(e);
    }
  });
  return kpi;
};

const getMostUsedEmojiBySender = (groupedSet) => {
  const kpi = {};
  Object.entries(groupedSet).forEach(([key, value]) => {
    try {
      const sender = key;
      const allEmoji = value.flat();
      const count = _.map(_.countBy(allEmoji), (value, key) => ({
        key: key,
        value: value,
      }));
      const orderedEmoji = _.orderBy(count, ['value'],['desc']);
      kpi[sender] = orderedEmoji;
    } catch (e) {
      console.error(e);
    }
  });
  return kpi;
};

const writeResultFile = () => {
  try {
    fs.writeFile("result.json", JSON.stringify(results), function (err) {
      if (err) return console.log(err);
    });
  } catch (e) {
    console.log(e);
  }
};

const main = () => {
  readChat();
};

main();
