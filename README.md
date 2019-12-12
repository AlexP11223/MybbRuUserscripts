UserScripts for a http://mybb.ru forum, tested on http://programmers.forumsvn.com in December 2019 (when we were moving to Discourse on https://www.programmersforum.rocks), but probably also work on other forums created via this service.
The scripts were tested using TamperMonkey in modern versions of Chrome and Firefox (also may work in GreaseMonkey).

## [Export data](https://github.com/AlexP11223/MybbRuUserscripts/blob/master/export_data.user.js)

Exports data from a mybb.ru forum (they do not allow to do that normally) to JSON. Requires admin/moderator rights to retrieve the message source text (BB codes, etc.).

There a script for [importing this format into Discourse](https://github.com/AlexP11223/discourse/blob/mybbru/script/import_scripts/mybbru.rb).

Output example:

```
[
  {
    "id": 2,
    "title": "Test thread",
    "category": { "id": 2, "name": "General discussions" },
    "pageCount": 1,
    "posts": [
      {
        "id": 2,
        "createdAt": 1573161738,
        "author": { "id": 3, "name": "Vadim", "email": "mail_1@gmail.com" },
        "source": "[b]Hello world![/b]"
      },
      ...
      {
        "id": 396,
        "createdAt": 1574765951,
        "author": { "id": 9, "name": "Serge", "email": "mail_2@gmail.com" },
        "source": "[quote=\"Username\"]Hello[/quote]\nWelcome!"
      },
      ...
    ]
  },
  ...
]
```

`createdAt` is a Unix timestamp, UTC +0.

Also extracts users to a separate file.

Usage (in the web browser console):

```
exportThreads(1, 2, 42)
```

All threads with id from 1 to 100. (skips non-existing)

```
exportThreads(..._.range(1, 100))
```
