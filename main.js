const fs = require("fs");
const lineReader = require("line-reader");
var parse = require("date-fns/parse");
var _ = require("lodash");

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
  const nMessageBySender = getNMessageBySender();
  
  results = {
      nMessageBySender: nMessageBySender
  }
  writeResultFile();
};

const getNMessageBySender = () => {
  const kpi = {};
  const res = _.groupBy(chat, "msgSender");
  Object.entries(res).forEach(([key, value]) => {
    kpi[key] = value.length;
  });
  return kpi;
};

const writeResultFile = () => {
  try {
    fs.writeFile("result.json", JSON.stringify(results), function (err) {
      if (err) return console.log(err);
      console.log("Hello World > helloworld.txt");
    });
  } catch (e) {
    console.log(e);
  }
};

const main = () => {
  readChat();
};

main();
