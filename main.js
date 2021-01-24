const fs = require("fs");
const lineReader = require("line-reader");
var parse = require("date-fns/parse");
var getHours = require("date-fns/getHours");
var getDay = require("date-fns/getDay");
var getMonth = require("date-fns/getMonth");
var getYear = require("date-fns/getYear");
var _ = require("lodash");
var onlyEmoji = require("emoji-aware").onlyEmoji;
var withoutEmoji = require("emoji-aware").withoutEmoji;
var figlet = require("figlet");

const chat = [];
var results = {};

// Functions
const initMessage = () => {
  return new Promise((resolve, reject) => {
    figlet("Chat Analyzer!!!", function (err, data) {
      if (err) {
        console.log("Something went wrong...");
        console.dir(err);
        reject();
        return;
      }
      console.log(data);
      resolve();
    });
  });
};

const readChat = () => {
  console.log("📄 Reading File...");

  lineReader.eachLine("chat.txt", function (line, last) {
    try {
      const lineSplit = line?.split("-");
      const msgDate = parse(
        lineSplit?.[0].trim(),
        "dd/MM/yy, HH:mm",
        new Date()
      );

      const content = lineSplit?.[1]?.split(":");
      const msgSender = content?.[0]?.trim();
      const msgText = content?.[1]?.trim();

      if (content && msgSender && msgText) {
        const msg = {
          date: msgDate,
          msgSender: msgSender,
          msgText: msgText,
        };
        chat.push(msg);
      }

      if (last) analyzeChat();
    } catch (e) {
      console.error("error", e);
    }
  });

  console.log("📄 File Reading Completed!");
};

const analyzeChat = () => {
  console.log("📈 Starting Analysis...");
  const chatGroupedBySender = getGroupedBySender(chat);
  const nMessageBySender = getNMessageBySender(chatGroupedBySender);
  const messageLettersAvgLengthBySender = getMessageLettersAvgLengthBySender(
    chatGroupedBySender
  );
  const messageWordsAvgLengthBySender = getMessageWordsAvgLengthBySender(
    chatGroupedBySender
  );

  const messageByHours = getMessageByHours();

  const messageByWeekDay = getMessageByWeekDay();

  const messageByMonth = getMessageByMonth();

  const mostUsedWordsBySender = getMostUserWordBySender(chatGroupedBySender);

  const emojiMessageGroupedBySender = getEmojiMessageBySender(
    chatGroupedBySender
  );
  const messageNEmojiTotalUsageBySender = getMessageNEmojiTotalUsageBySender(
    emojiMessageGroupedBySender
  );
  const mostUsedEmojiBySender = getMostUsedEmojiBySender(
    emojiMessageGroupedBySender
  );

  results = {
    nMessageBySender: nMessageBySender,
    messageLettersAvgLengthBySender: messageLettersAvgLengthBySender,
    messageWordsAvgLengthBySender: messageWordsAvgLengthBySender,
    messageNEmojiTotalUsageBySender: messageNEmojiTotalUsageBySender,
    mostUsedEmojiBySender: mostUsedEmojiBySender,
    messageByHours: messageByHours,
    messageByWeekDay: messageByWeekDay,
    messageByMonth: messageByMonth,
    mostUsedWordsBySender: mostUsedWordsBySender,
  };

  console.log("📈 Analysis Completed!");

  writeResultFile();
};

const getGroupedBySender = (items) => {
  return _.groupBy(items, "msgSender");
};

const getMessageByHours = () => {
  console.log("📊 Starting - Message By Hour Analysis");

  var kpi = {};
  try {
    const hourMessageList = [];
    for (i = 1; i < 25; i++) {
      const hourItem = chat.filter((m) => getHours(m.date) === i);
      const item = {
        hour: i,
        items: hourItem,
      };
      hourMessageList.push(item);
    }

    const hourMessageListGroupedBySender = [];
    hourMessageList.forEach((hi) => {
      const items = hi?.items;
      const grouped = getGroupedBySender(items);
      const hourItem = {};
      let sendersTotal = 0;
      Object.entries(grouped).forEach(([key, value]) => {
        const len = value?.length;
        hourItem[key] = len;
        sendersTotal += len;
      });

      hourItem.total = sendersTotal;

      const item = {
        hour: hi?.hour,
        count: hourItem,
      };
      hourMessageListGroupedBySender.push(item);
    });

    kpi = hourMessageListGroupedBySender;
  } catch (e) {
    console.error(e);
  }

  console.log("📊 Completed - Message By Hour Analysis");

  return kpi;
};

const getMessageByWeekDay = () => {
  console.log("📊 Starting - Message By Week Day Analysis");

  var kpi = {};
  try {
    const wdMessageList = [];
    for (i = 0; i < 7; i++) {
      const wdItem = chat.filter((m) => getDay(m.date) === i);
      const item = {
        weekDay: i,
        items: wdItem,
      };
      wdMessageList.push(item);
    }

    const wdMessageListGroupedBySender = [];
    wdMessageList.forEach((hi) => {
      const items = hi?.items;
      const grouped = getGroupedBySender(items);
      const wdItem = {};
      let sendersTotal = 0;
      Object.entries(grouped).forEach(([key, value]) => {
        const len = value?.length;
        wdItem[key] = len;
        sendersTotal += len;
      });

      wdItem.total = sendersTotal;

      const item = {
        weekDay: hi?.weekDay,
        count: wdItem,
      };
      wdMessageListGroupedBySender.push(item);
    });

    kpi = wdMessageListGroupedBySender;
  } catch (e) {
    console.error(e);
  }

  console.log("📊 Completed - Message By Week Day Analysis");

  return kpi;
};

const getMessageByMonth = () => {
  console.log("📊 Starting - Message By Month (Grouped by year) Analysis");

  var kpi = {};
  try {
    const years = _.groupBy(chat, (i) => getYear(i.date));
    Object.entries(years).forEach(([key, value]) => {
      const year = key;

      const monthMessageList = [];
      for (i = 0; i < 12; i++) {
        const monthItem = value.filter((m) => getMonth(m.date) === i);
        const item = {
          month: i,
          items: monthItem,
        };
        monthMessageList.push(item);
      }

      const monthMessageListGroupedBySender = [];
      monthMessageList.forEach((hi) => {
        const items = hi?.items;
        const grouped = getGroupedBySender(items);
        const monthItem = {};
        let sendersTotal = 0;
        Object.entries(grouped).forEach(([key, value]) => {
          const len = value?.length;
          monthItem[key] = len;
          sendersTotal += len;
        });

        monthItem.total = sendersTotal;

        const item = {
          month: hi?.month,
          count: monthItem,
        };
        monthMessageListGroupedBySender.push(item);
      });
      kpi[year] = monthMessageListGroupedBySender;
    });
  } catch (e) {
    console.error(e);
  }

  console.log("📊 Completed - Message By Month (Grouped by year) Analysis");

  return kpi;
};

const getMostUserWordBySender = (groupedSet) => {
  console.log("📊 Starting - Most Used Words Analysis");
  const kpi = {};

  try {
    Object.entries(groupedSet).forEach(([key, value]) => {
      const sender = key;
      const messages = value;

      let fullTextString = "";
      messages.forEach((m) => {
        fullTextString = fullTextString.concat(" ", m?.msgText);
      });

      const fullTextAndEmojiArray = fullTextString
        ?.split(" ")
        .filter((t) => t?.length > 3);

      const fullTextArray = [];
      fullTextAndEmojiArray.forEach((i) => {
        const wordLettersArray = withoutEmoji(i);
        const wordLetters = wordLettersArray.join("");
        if (wordLetters?.length > 3) fullTextArray.push(wordLetters);
      });

      const count = _.map(_.countBy(fullTextArray), (value, key) => ({
        key: key,
        value: value,
      }));

      const orderedWords = _.orderBy(count, ["value"], ["desc"]);

      kpi[sender] = orderedWords;
    });
  } catch (e) {
    console.error(e);
  }

  console.log("📊 Completed - Most Used Words Analysis");

  return kpi;
};

const getEmojiMessageBySender = (groupedSet) => {
  console.log("📊 Starting - Most Used Emoji Analysis");

  const kpi = {};
  Object.entries(groupedSet).forEach(([key, value]) => {
    try {
      const sender = key;
      var emojiList = [];
      value.forEach((i) => {
        const emojiInMsg = i?.msgText && onlyEmoji(i?.msgText);
        if (emojiInMsg?.length) {
          emojiList.push(emojiInMsg);
        }
      });
      kpi[sender] = emojiList;
    } catch (e) {
      console.error(e);
    }
  });

  console.log("📊 Completed - Most Used Emoji Analysis");

  return kpi;
};

const getNMessageBySender = (groupedSet) => {
  console.log("📊 Starting - Message Amount Analysis");
  const kpi = {};
  Object.entries(groupedSet).forEach(([key, value]) => {
    kpi[key] = value.length;
  });

  console.log("📊 Completed - Message Amount Analysis");

  return kpi;
};

const getMessageLettersAvgLengthBySender = (groupedSet) => {
  console.log("📊 Starting - Message Letters Avg Length Analysis");
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

  console.log("📊 Completed - Message Letters Avg Length Analysis");

  return kpi;
};

const getMessageWordsAvgLengthBySender = (groupedSet) => {
  console.log("📊 Starting - Message Words Avg Length Analysis");
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

  console.log("📊 Completed - Message Words Avg Length Analysis");

  return kpi;
};

const getMessageNEmojiTotalUsageBySender = (groupedSet) => {
  console.log("📊 Starting - Overall  Used Emoji Analysis");
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

  console.log("📊 Completed - Overall Used Emoji Analysis");

  return kpi;
};

const getMostUsedEmojiBySender = (groupedSet) => {
  console.log("📊 Starting - Sender Used Emoji Analysis");
  const kpi = {};
  Object.entries(groupedSet).forEach(([key, value]) => {
    try {
      const sender = key;
      const allEmoji = value.flat();
      const count = _.map(_.countBy(allEmoji), (value, key) => ({
        key: key,
        value: value,
      }));
      const orderedEmoji = _.orderBy(count, ["value"], ["desc"]);
      kpi[sender] = orderedEmoji;
    } catch (e) {
      console.error(e);
    }
  });

  console.log("📊 Completed - Sender Used Emoji Analysis");

  return kpi;
};

const writeResultFile = () => {
  console.log("📄 Writing Result File...");

  try {
    fs.writeFile("result.json", JSON.stringify(results), function (err) {
      if (err) return console.log(err);
    });
  } catch (e) {
    console.log(e);
  }

  console.log("📄 Result File Created");
};

const main = () => {
  initMessage().then(() => {
    readChat();
  });
};

main();
