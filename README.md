# NotedW
Wiki-like personal knowledge management tool running locally in browser - with backup possibility to DropBox
![SPA](docs/res/NotedW_compact.png?raw=true)

# Install & first use
- Just copy the single ```dist/notedw_dist.html``` file to any local folder, and open it in your favourite browser. 
- It is advised to add a new page with the title ```Main```. This will serve as a "homepage" in the future. When clicking the Home button, this ```Main``` will be shown.
- You can configure the backup option by clicking the Configuration icon top-right. The fields are - hopefully - self-explanatory.

# General instructions on use
- Start with the "add new" button - add the page, with title ```Main```
- You can use the markdown syntax on the pages
- It is possible to edit only segments of a page. Level 1 or Level 2 markdown headers create editable segments
- You can refer to pages by their names within ```[]``` 
- If you refer to a non-existing page, you can create it, by clicking on the link
- Navigate between the pages by using their embedded reference, by the breadcrumbs, or by listing all pages
- External links can be named: ```[visible name](url)```
- You can use simple diagrams by following the mermaid syntax within a code block
- For the use of graphs, Gantt-charts, refer to [mermaid](https://github.com/knsv/mermaid) documentation. The annotation shall be used within a ```code block```
- It is possible to embed BPMN diagram also within a ```code block```. Make sure to use the ```bpmn``` before the XML to be embedded.
- Simple annotation for to do-s is also available. Use @@ before the text of the task. The task text is captured until the end of line.

# Some examples
## Create page reference with todo
```
# Main topic
## Subtopic
Lorem ipsum dolor sit amet, consectetur adipiscing elit. [Curabitur] pretium lacus vel elit ullamcorper tincidunt. Nulla ornare ante sem, nec mollis turpis sollicitudin eget. Sed sit amet velit eu massa maximus volutpat. Nam dignissim erat vel dignissim cursus. Curabitur lobortis enim eu mauris congue, vel [pretium] ante pellentesque. ...
@@ Write page [Curabitur]
@@ Write page [pretium]
```
## Create simple diagram within a page
The page structure is given by using markdown. The diagram shall be created within a code block. The definition and edit is done manually, the syntax is according to the desired diagram.
```
# Page
'''
graph LR;
A(something) --> B(anything);
B --> C[everything];
'''
```
It is possible to insert ```graph```, ```gantt``` or ```sequenceDiagram``` similar to the above. The detailed syntax is to be found in the [mermaid](https://github.com/knsv/mermaid) documentation.

## Adding BPMN diagram to a page
The structure is defined by markdown. The BPMN diagram is not edited manually, but in a WYSIWYG editor launched in another window, by clicking on the BPMN block. The placeholder for a new diagram is created like this:
```
# Page
'''
bpmn

'''
```
The empty space will be filled with xml data. The page can be edited manually afterwards. To ensure the XML consistency, it is advised, to leave the BPMN codeblock unabridged.  

## Detailed help
You can find more examples with some screenshots in the [docs](docs/index.md) folder. 

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
