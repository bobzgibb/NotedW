window.onbeforeunload = function(){
    window.opener.postMessage("none","*" );
}

window.addEventListener("beforeunload", function(e){
    window.opener.postMessage("none","*" ); 
}, false);
window.onload = function() {
    "use strict";

    if(/[?&]page=modeler/.test(window.location.search)) {
      //modeler

    $('body').append('<div id="bpmn_editor_canvas"></div>');
    $('body').append('<button id="save-button">');
    $('#save-button').text('Save to NotedW');
    
    var bpmnXML = localStorage.getItem("wiki.temp.bpmn");

    if (bpmnXML.length<6) {
        bpmnXML = '<?xml version="1.0" encoding="UTF-8"?><bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn2:process id="Process_1" isExecutable="false"></bpmn2:process><bpmndi:BPMNDiagram id="BPMNDiagram_1"><bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">    </bpmndi:BPMNPlane>  </bpmndi:BPMNDiagram></bpmn2:definitions>';
    } else {
        bpmnXML=bpmnXML.replace('<!--?xml version="1.0" encoding="UTF-8"?-->','<?xml version="1.0" encoding="UTF-8"?>')
    }
        
    console.log(bpmnXML);
    // modeler instance
    var bpmnModeler = new BpmnJS({
        container: '#bpmn_editor_canvas',
        keyboard: {
            bindTo: window
        }
    });

    // load external diagram file via AJAX and open it
    //$.get(diagramUrl, openDiagram, 'text');
    openDiagram(bpmnXML);


/**
* Save diagram contents and print them to the console.
*/
function exportDiagram() {

    bpmnModeler.saveXML({ format: true }, function(err, xml) {

        if (err) {
            return console.error('could not save BPMN 2.0 diagram', err);
        }

        //alert(xml);
        var orig = window.opener;
        orig.postMessage(xml,"*" );
        window.self.close();    
        //console.log('DIAGRAM', xml);
    });
}

/**
* Open diagram in our modeler instance.
*
* @param {String} bpmnXML diagram to display
*/
function openDiagram(bpmnXML) {

    // import diagram
    bpmnModeler.importXML(bpmnXML, function(err) {

    if (err) {
        return console.error('could not import BPMN 2.0 diagram', err);
    }

    // access modeler components
    var canvas = bpmnModeler.get('bpmn_editor_canvas');
    var overlays = bpmnModeler.get('overlays');


    // zoom to fit full viewport
    canvas.zoom( 'fit-viewport');

    });
}



      // wire save button
      $('#save-button').click(exportDiagram);
}
}