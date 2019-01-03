# Content

- Foreword
- Important usage information
- [Getting started with NotedW](firstuse.md)
- [Configuration settings](config.md)
- [Basic editing](edit.md)

# Foreword

These days the corporate IT security departments are getting more and more __creative__ in stripping every possible rights from the poor users. There are many good note taking desktop applications, but one cannot use these in the workplace (because of licence fears). There are also many web-based note taking tools - but they are hosting the information in the cloud, i.e. outside the company. Such breach could easily lead to HR consequences. Better stay on the local computer.

Capturing and transferring knowledge is often better in some graphical formats. The tools for capturing information not in the form of characters are like the note taking ones: desktop applications, cloud-based services, etc. Those, which are based in the cloud, but use local files maybe OK to use... but the created sketches are not composed into one single document - only if one is using such "heavy" tool, like MS Word or OneNote.

NotedW is an experiment to put all goodies together in one SPA, into one single interface and into one single "database".

![SPA](res/NotedW_compact.png?raw=true)

# Important usage information

Do not use NotedW if you cannot accept the following limitations.

## Cave at and always keep in mind
The NotedW is not backing up / archiving your work, you have to take care of your information. The created notes are stored in the browser's LocalStorage - read more on that [here](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). When purging all history / cache / cookies / etc. from your browser you can easily loose the content of your NotedW as well. It is highly advised to use the backup functionality of NotedW regularly (see [config settings](config.md)).

A personal remark - I have not lost any content ever. Still, it is better to be prepared.

## Other limitations
### Storage space
The NotedW is intended for local use as a single page web-app. Because of this, the limit of the LocalStorage is a hard limit, you cannot circumvent it to win additional space by splitting the notes (eg. on dividing work / private).

### NotedW in online environment
An online version of NotedW is not (yet) planned. The app is not tested in online environment, the security risks are unknown. So if you plan to use it online by publishing under a URL - do it at your own risk, you have been warned.
