UserScripts for a http://mybb.ru forum (http://programmers.forumsvn.com).
The scripts were tested using TamperMonkey in modern versions of Chrome and Firefox (also may work in GreaseMonkey).

## [Export data](https://github.com/AlexP11223/MybbRuUserscripts/blob/master/export_data.user.js)

Exports data from a mybb.ru forum (they do not allow to do that normally) to JSON. Requires admin/moderator rights to retrieve the message source text (BB codes, etc.).

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
        "author": { "id": 3, "name": "Vadim", "email": "mail_1@gmail.com" },
        "source": "[b]Hello world![/b]"
      },
      ...
      {
        "id": 396,
        "author": { "id": 9, "name": "Serge", "email": "mail_2@gmail.com" },
        "source": "[quote=\"Username\"]Hello[/quote]\nWelcome!"
      },
      ...
    ]
  },
  ...
]
```

Also extracts users to a separate file.

Usage (in the web browser console):

```
exportThreads(1, 2, 42)
```

All threads with id from 1 to 100. (skips non-existing)

```
exportThreads(..._.range(1, 100))
```
