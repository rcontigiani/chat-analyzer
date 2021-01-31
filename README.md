# Chat Analyzer

📈 Chat Analyzer is a NodeJS script to analyze WhatsApp chat files. The focus KPIs of projects are:

- Amount of messages sended by each chat participant.
- Average of letters per message by each chat participant.   
- Average of words per message by each chat participant.   
- Amount of emoji sended by each chat participant.   
- Most used emoji by each chat participant.   
- Amount of message sent for hours by each chat participant.   
- Amount of message sent for week days by each chat participant.   
- Amount of message sent for month by each chat participant (Grouped by year).
- Most used words by chat participant.

## Installation

📝 Use the package manager [npm](https://www.npmjs.com/) to install the required packages.

🚀 In project folder run:

```bash
npm install
```

## Usage

-   [💡](https://faq.whatsapp.com/android/chats/how-to-save-your-chat-history/?lang=en) Export chat file in txt format from WhatsApp (without media)
-  ✏️ Rename the file in chat.txt and move in project root folder
-  🚀 Open terminal in project folder and run:

```bash
npm start
```

##Result

-  💥 The process generates `result.json` as output file with the following structure

```json 
{
  "nMessageBySender": {},
  "messageLettersAvgLengthBySender": {},
  "messageWordsAvgLengthBySender": {},
  "messageNEmojiTotalUsageBySender": {},
  "mostUsedEmojiBySender": {},
  "messageByHours": [],
  "messageByWeekDay": [],
  "messageByMonth": {},
  "mostUsedWordsBySender": {}
}
```

## Contributing 

Contributions, issues and feature requests are welcome. 🎉👍

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.
