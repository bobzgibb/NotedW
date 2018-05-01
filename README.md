# NotedW
Wiki-like personal knowledge management tool running locally in browser - with backup possibility to DropBox

# Install & first use
- Just copy the single ```dist/wiki.html``` file to any local folder, and open it in your favourite browser. 
- It is advised to add a new page with the title ```Main```. This will serve as a "homepage" in the future. When clicking the Home button, this ```Main``` will be shown.
- You can configure the backup option by clicking the Configuration icon top-right. The fields are - hopefully - self-explanatory.

# General instructions on use
- You can use the markdown syntax on the pages
- You can refer to pages by their names within ```[]```
- If you refer to a non-existing page, you can create it, by clicking on the link
- You can use simple diagrams by following the mermaid syntax within a code block
- External links can be named: ```[visible name](url)```
- For the use of graphs, Gantt-charts, refer to [mermaid](https://github.com/knsv/mermaid) documentation. The annotation shall be used within a ```code block```
- It is possible to embed BPMN diagram also within a ```code block```. Make sure to use the ```bpmn``` before the XML to be embedded.



# Credits

Many thanks to the
- [marked](https://github.com/chjj/marked) project for the Markdown parser,
- [mermaid](https://github.com/knsv/mermaid) project for the graph library,
- [BPMN.io](https://github.com/bpmn-io) for the BPMN.js viewer and editor library
- and to the StackExchange community for the hundreds of already asked and answered questions, which helped me along.
(No new question was posted, and no living animals were harmed during
development.)

This personal wiki / note-taking tool is created by Bob Gibb. You can contact me if you have
questions, suggestions, etc.
