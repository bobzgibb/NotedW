/*
requirejs(["wiki-lib"], function (wikilib) {
    console.log("wiki-lib loaded");
});
*/


window.onload = function () {
    "use strict";
    var config = {
        startOnLoad: false,
        flowchart: {
            useMaxWidth: true,
            htmlLabels: true
        }
    };
    mermaid.initialize(config);
}

window.addEventListener('message', function (event) {
    var bpmnXML = event.data;
    $("#overlay").css("display", "none");
    updateBPMNInArticle(bpmnXML); 
});

var aGraph_temp = [];
var aBPMN_temp = [];
var LSprefix = "wiki.";
var bpmnModeler;

//window.onload =function(){
//var jq = function() {

$("#navi_list").click(function() {
  listItems();
  
});

$(document).on('click', "#content_head_home", function() {
  main();
});

$("#navi_addnew").click(function() {
  $("#content").empty();
  $("#edit_mdtext").val("");
  $("#edit_wikiword").val("");
  $("#edit_counter").val(0);
  $("#edit").show();
});
        
$("#navi_settings").click(function() {

  $("#content").empty();
  $("#edit").hide();
  $("#content").append($("<div id='content_head'>"));
  $("#content").append($("<div id='content_article'>"));
  $("#content_head").html(getHomeImageLink() + " [Settings, backup & restore]");
  $("#content_article").append("<h1>Dropbox access key</h1>");
  var dropbox_key = localStorage.getItem("NotedW_Dropbox_key");
  $("#content_article").append("<input type='textbox' id='backup_dropbox_key' value='" + dropbox_key + "' /><br/>");
  $("#content_article").append("<h1>Backup</h1>");
  $("#content_article").append($("<div id='backup_innerdiv'>"));
  $("#backup_innerdiv").append("<input type='button' id='backup_local' value='Save to local folder' /> ");
  $("#backup_innerdiv").append("<input type='button' id='backup_dropbox' value='Save to dropbox' />");
  $("#content_article").append("<h1>Restore</h1>");
  $("#content_article").append($("<div id='restore_itemlist'>"));
  $("#restore_itemlist").append("<input type='button' id='restore_local' value='Load local file' /> ");
  $("#restore_itemlist").append("<input type='button' id='list_dropbox' value='Restore from Dropbox' />");
  $("#content_article").append("<h1>Wipe this wiki clean</h1>");
  $("#content_article").append("<input type='button' id='clear_wiki' value='Clear wiki, really' /> ");
});

$(document).on('click', "#clear_wiki", function()  {
  localStorage.clear();
});

$(document).on('change', "#backup_dropbox_key", function()  {
 var dropbox_key = $(this).val();
 localStorage.setItem("NotedW_Dropbox_key", dropbox_key);
});

$(document).on('click', "#backup_dropbox", function()  {
  $("#backup_innerdiv").empty();
  $("#backup_innerdiv").append("Saving to Dropbox....")
  var sbackup = JSON.stringify(localStorage);
  var blobfile = new Blob([sbackup], {type: 'text/plain;charset=utf-8;'});
  var d = new Date();
  var dropbox_key = localStorage.getItem("NotedW_Dropbox_key");
  var hour = ('00' + d.getHours()).substr(-2);
  var min = ('00' + d.getMinutes()).substr(-2);
  var timestamp = d.toISOString().slice(0,10).replace(/-/g,"") + "_" + hour + min;
  var filename = "wikibackup_" + timestamp + ".txt";
  var d1 = $.ajax({
    url: 'https://content.dropboxapi.com/2/files/upload',
    type: 'post',
    data: blobfile,
    processData: false,
    contentType: 'application/octet-stream',
    headers: {
        "Authorization": "Bearer "+dropbox_key,
        "Dropbox-API-Arg": '{"path": "/' + filename +'","mode": "add","autorename": true,"mute": false}'
    },
    success: function (data) {
        console.log(data);
    },
    error: function (data) {
        console.error(data);
    }
  });
  $.when(d1).done(function (a1) {
    $("#backup_innerdiv").empty();
    $("#backup_innerdiv").append("Backup saved to Dropbox.")

  });
});

$(document).on('click', "#backup_local", function()  {
  var tempA = document.createElement("a");
  var sbackup = JSON.stringify(localStorage);
  var file = new Blob([sbackup], {type: 'text/plain;charset=utf-8;'});
  var url = window.URL.createObjectURL(file);
  tempA.href = url;
  var d = new Date();
  var hour = ('00' + d.getHours()).substr(-2);
  var min = ('00' + d.getMinutes()).substr(-2);
  var timestamp = d.toISOString().slice(0,10).replace(/-/g,"") + "_" + hour + min;
  tempA.download = "wikibackup_" + timestamp + ".txt";
  tempA.click();
  window.URL.revokeObjectURL(url);
});

$(document).on('click', "#restore_local", function()  {
 $("#navi_file").click();

});

$(document).on('click', "#list_dropbox", function()  {
  listDropboxbackups();
});

$(document).on('click', "input.dropboxfilerestore", function() {
  var dropbox_key = localStorage.getItem("NotedW_Dropbox_key");
  $("#restore_itemlist").empty();
  $("#restore_itemlist").append("downloading file...");
  var filecontent = "";
  var d1 = $.ajax({
    url: 'https://content.dropboxapi.com/2/files/download',
    type: 'post',
    headers: {
        "Authorization": "Bearer "+dropbox_key,
        "Dropbox-API-Arg": '{"path": "/' + $(this).attr("dropboxfilename") +'"}'
    },
    success: function (data) {
        filecontent = data;
    },
    error: function (data) {
        console.error(data);
    }
  });

$.when(d1).done(function (a1) {
    $("#restore_itemlist").empty();
    $("#restore_itemlist").append("restoring items...");
    var aBkup = JSON.parse(filecontent);
    for (var lsitemkey in aBkup) {
      localStorage.setItem(lsitemkey, aBkup[lsitemkey]);
    }

    $("#restore_itemlist").append("   restored.");
});
});

$(document).on('click', "input.dropboxfileremove", function()  {
  var dropbox_key = localStorage.getItem("NotedW_Dropbox_key");
  $("#restore_itemlist").empty();
  $("#restore_itemlist").append("deleting...");
  var d1 = $.ajax({
    url: 'https://api.dropboxapi.com/2/files/delete',
    type: 'post',
    data: '{"path": "/'+ $(this).attr("dropboxfilename") +'" }',
    contentType: 'application/json',
    headers: {
        "Authorization": "Bearer "+dropbox_key
    },
    success: function (data) {
      //
    },
    error: function (data) {
        console.error(data);
    }
  });

  $.when(d1).done(function (a1) {
    listDropboxbackups();
  });
});

$("#navi_file").change(function(){
    $("#content").empty();
  var importFile = $('#navi_file').prop('files')[0];
  var reader = new FileReader();
  reader.onload = function() {
    var aBkup = JSON.parse(reader.result);
    for (var lsitemkey in aBkup) {
      localStorage.setItem(lsitemkey, aBkup[lsitemkey]);
    }
    main();
  };
  reader.readAsText(importFile);
});
    
$("#navi_todolist").click(function(){
  var todo = "";
  var article = "";
  var LSkey = "";
  var exp = /@@.*?(?=<br|$)/gm;
  var wikiword = "";
  var j = 0;
  $("#content").empty();
  $("#content").append($("<div id='content_head'>"));
  $("#content").append($("<div id='content_article'>"));
  $("#content_head").html(getHomeImageLink() + " [ToDo list]");
  for (var i = 0; i < localStorage.length; i++)   {
    LSkey = localStorage.key(i);
    if (LSkey.indexOf(LSprefix) == 0) {
      article = JSON.parse(localStorage.getItem(LSkey));
      wikiword = LSkey.replace(LSprefix, "");
      aRes = article.match(exp);
      if (aRes === null) {
      } else {
        for (j=0; j<aRes.length; j++) {
          todo = aRes[j].trim();
          todo = todo.slice(2,todo.length);
          todo = todo.trim() + " @ " + linkify(wikiword);
          todo = "<span class='todo'>" + todo + "</span>";
          $("#content_article").append(todo);
        }
      }
    }
  }
});

$("#edit_save").click(function() {
  save(false);

  var wikiword = $("#edit_wikiword").val();
  if (wikiword.indexOf("#")>-1) {
    wikiword = wikiword.substring(0,wikiword.indexOf("#"));
  }
  var article = JSON.parse(localStorage.getItem(LSprefix + wikiword));
  var md_article = marked(article);
  $("#edit").hide();
  $("#edit_counter").val(0);
  displayArticle(wikiword);
  updateFreeSpace();
});

$(document).on('click', "#content_edit", function() {
  var wikiword = $(this).attr("wikiword");
  if (localStorage.getItem(LSprefix + wikiword + "_temp") === null) {
      var article = JSON.parse(localStorage.getItem(LSprefix + wikiword));
  } else {
      var article = JSON.parse(localStorage.getItem(LSprefix + wikiword + "_temp"));
  }
  $("#content").empty();
  $("#edit_mdtext").val(article);
  $("#edit_wikiword").val(wikiword);
  $("#edit_counter").val(0);
  $("#edit").show();
});

$(document).on('click', "#content_delete", function() {
  var wikiword = $(this).attr("wikiword");
  localStorage.removeItem(LSprefix + wikiword);
  $("#edit").hide();
  $("#content").empty();
  main();
});

$("#edit_cancel").click(function() {
  var wikiword = $("#edit_wikiword").val();
  if (wikiword.indexOf("#")>-1) {
  wikiword = wikiword.substring(0,wikiword.indexOf("#"));
  }
  $("#edit").hide();
  $("#edit_counter").val(0);
  $("#content").empty();
  if (localStorage.getItem(LSprefix + wikiword) === null) {
    localStorage.removeItem(LSprefix + wikiword + "_temp");
    main();
  } else {
    displayArticle(wikiword);
    localStorage.removeItem(LSprefix + wikiword + "_temp");

  }
});

$("#edit_mdtext").keypress(function(event) {
  var counter = parseInt($("#edit_counter").val());
  counter = counter + 1;
  if (counter > 25) {
    save(true);
    counter = 0;
  }
  $("#edit_counter").val(counter);

});

$(document).on('click', "img.segment", function() {
  var buttonid = $(this).attr("id");
  var temp = buttonid.split("_");
  var wikiword = "";
  var temp2 = "";

  if (temp.length == 2) {
    if (temp[0]=="segmentedit") {
      temp2 = $(this).closest("H1").text();
      if (temp2.length > 0) {
        temp2 = "# " + temp2;
      } else {
        temp2 = "## " + $(this).closest("H2").text();
      }
      wikiword = $(this).attr("wikiword");
      editSegment(wikiword, temp2);
    }
    if (temp[0] == "segmenttoggle") {
      var segment = "#segment_" + temp[1];
      if ($(this).attr("status") == "max") {
        $(this).attr("status", "min");
        $(this).attr("src", getNodeMaximizeImageURI());
      } else {
        $(this).attr("status","max");
        $(this).attr("src", getNodeMinimizeImageURI());
      }
      $(segment).toggle(500);
    }
  }

});

$(document).on('click', "a.wikiword", function() {
  var wikiword = $(this).attr("id");
  if (localStorage.getItem(LSprefix + wikiword) === null) {
    $("#content").empty();
    $("#edit_mdtext").val("");
    $("#edit_wikiword").val(wikiword);
    $("#edit_counter").val(0);
    $("#edit").show();
  } else {
    displayArticle(wikiword);
      $("#edit").hide();
  }

});

$(document).on('click', ".bpmn_viewer", function() {
    var bpmnID = $(this).attr("id");
    bpmnID = "#t_"+bpmnID;
    //console.log(bpmnID);
    var bpmnXML = $(bpmnID).html();
    bpmnXML = decodeURIComponent(escape(window.atob(bpmnXML)));
    bpmnXML = bpmnXML.substring(5);
    localStorage.setItem("wiki.temp.bpmn", bpmnXML);
    $("#overlay").css("display", "block");
    localStorage.setItem("wiki.temp.wikiword", $("#content_edit").attr("wikiword"));
    localStorage.setItem("wiki.temp.bpmnIndexInArticle", bpmnID.split("_")[2]);
    
    var win = window.open("wiki.html?page=modeler", "bpmneditor", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=800,height=700,top=50,left=50");

});
    
$(document).on('click', "div.mermaid", function() {
    var svg = $(this).html();
    svg = '<?xml version="1.0" standalone="no"?><?xml-stylesheet type="text/css" href="https://cdn.rawgit.com/knsv/mermaid/7.0.0/dist/mermaid.forest.css"?>' + svg;
    var svg_blob = new Blob([svg],{'type': "image/svg+xml"});
    var url = URL.createObjectURL(svg_blob);

    var svg_win = window.open(url, "svg_win");

});

$(document).on('click', "#bpmn_close_cancel", function() {
    window.opener.postMessage("none","*" );
    window.self.close();
});
$(document).on('click', "#bpmn_close_save", function() {
    exportDiagram();
});
main();

//};
//jq.call();

function listDropboxbackups() {
  var dropbox_key = localStorage.getItem("NotedW_Dropbox_key");
  $("#restore_itemlist").empty();
  $("#restore_itemlist").append("Loading...");
  $.ajax({
    url: 'https://api.dropboxapi.com/2/files/list_folder',
    type: 'post',
    data: '{"path": "", "recursive": false, "include_media_info": false, "include_deleted": false, "include_has_explicit_shared_members": false }',
    contentType: 'application/json',
    headers: {
        "Authorization": "Bearer "+dropbox_key
    },
    success: function (data) {
      $("#restore_itemlist").empty();
      if (data.entries.length > 0) {
        var sHTMLtemp = "<table><thead><tr><th>#</th><th>filename</th><th>size</th><th>action</th></tr></thead><tbody>";

        $("#restore_itemlist").append();
        for (var i=0; i< data.entries.length; i++) {
          sHTMLtemp += "<tr><td>"+i + "</td><td>" + data.entries[i].name + "</td><td>" + Math.floor(data.entries[i].size / 1024) + " kB</td>";
          sHTMLtemp += "<td><input type='button' class='dropboxfilerestore' dropboxfilename='"+data.entries[i].name+"' dropboxfileid='"+ data.entries[i].id +"' value='restore'> ";
          sHTMLtemp += "<input type='button' class='dropboxfileremove' dropboxfilename='"+data.entries[i].name+"' dropboxfileid='"+ data.entries[i].id +"' value='remove'></td>";
          sHTMLtemp += "</tr>";
        }
        sHTMLtemp += "</tbody></table>";
        $("#restore_itemlist").append(sHTMLtemp);
      } else {
        $("#restore_itemlist").append("No items.");
      }
    },
    error: function (data) {
        console.error(data);
    }
  });
}
    
function save(isTempSave) {
  isTempSave = isTempSave || false;

  var wikiword = $("#edit_wikiword").val();
  var article;
  if (wikiword.indexOf("#") > -1) {
    wikiword = wikiword.substring(0,wikiword.indexOf("#"));

    article = JSON.parse(localStorage.getItem(LSprefix + wikiword));
    var iBlockStart = $("#edit_mdtext").attr("iblockstart");
    var iBlockEnd = $("#edit_mdtext").attr("iblockend");
    var sTemp1, sTemp2, sTemp3;
    sTemp1 = article.substring(0,iBlockStart);
    sTemp2 = $("#edit_mdtext").val() + "\n";
    sTemp3 = article.substring(iBlockEnd, article.length);
    article = sTemp1 + sTemp2 + sTemp3;

  } else {
  	article = $("#edit_mdtext").val();
  }

  if (isTempSave) {
    localStorage.setItem(LSprefix + wikiword + "_temp", JSON.stringify(article));
  } else  {
    localStorage.setItem(LSprefix + wikiword, JSON.stringify(article));
    localStorage.removeItem(LSprefix + wikiword + "_temp");
  }

}

function editSegment(wikiword, segmentName) {

  var article = JSON.parse(localStorage.getItem(LSprefix + wikiword));
  var rExp1 = /^(?:# ).*$/gm;
  var rExp2 = /^(?:## ).*$/gm;
  var rExp =  /^(?:# |## ).*$/gm;
  var aRes = article.match(rExp);
  var iBlockStart = article.indexOf(aRes[aRes.length]);
  var iBlockEnd = article.length;

  for (var i=0; i < aRes.length; i++) {
  	if (segmentName.trim() ==  aRes[i]) {
  	  iBlockStart = article.indexOf(aRes[i]);
	    if (aRes[i].substr(0,2) == "# ") {
	      for (var j=i+1; j<aRes.length; j++) {
	        if (aRes[j].substr(0,2) == "# ") {
	          iBlockEnd = article.indexOf(aRes[j]);
	        }
	      }
	    } else {
	      if (i<aRes.length-1) {
	        iBlockEnd = article.indexOf(aRes[i+1]);
	      }
	    }
  	  break;
  	}
  }

  var sTemp = article.substring(iBlockStart, iBlockEnd);

  $("#content").empty();
  $("#edit_mdtext").val(sTemp);
  $("#edit_mdtext").attr("iblockstart", iBlockStart);
  $("#edit_mdtext").attr("iblockend", iBlockEnd);
  $("#edit_wikiword").val(wikiword+segmentName);
  $("#edit_counter").val(0);
  $("#edit").show();

}

function addItemToBreadCrumb(item) {
  var t = $("#breadcrumb").text();
  var aBC = [];
  var bExists;
  t = t.trim();
  if (t == "") {
     $("#breadcrumb").html(linkify(item, true));
  } else {
    var aT = t.split(">");
    for (var i=0; i < aT.length; i++) {
      t = aT[i];
      aT[i] = t.trim();
    }

    aT.push(item);
    aBC.push(aT[aT.length-1]);
    for (i=aT.length-1; i > -1; i--) {
      bExists = false;
      for (var j=0; j < aBC.length; j++) {
          if (aT[i] == aBC[j]) {
            bExists = true;
          }
      }

      if (!bExists)   {
        aBC.push(aT[i]);
      }
    }
    $("#breadcrumb").empty();
    if (aBC.length>0) {
      var max = 5;
      if (aBC.length < 5) {
        max = aBC.length;
      }
      $("#breadcrumb").html(linkify(aBC[max-1], true));
      for (i=max-2; i>-1; i--) {
          $("#breadcrumb").append(" > " + linkify(aBC[i], true));
      }
    }
  }
}

function updateFreeSpace() {
  var free = 1024 * 1024 * 5 - escape(encodeURIComponent(JSON.stringify(localStorage))).length;
  free = Math.round(free / 1024);
  $("#navi_freespace").text("Free space: " + free + " kB");
}

function beautifyToDos(article) {
  var exp2 = /@@.*?(?=<br|$)/gm;
  var aRes = article.match(exp2);
  var todo = "";

  if (aRes === null) {
  } else {
    for (var i=0; i<aRes.length; i++) {
      todo = aRes[i].trim();
      todo = todo.slice(2,todo.length);
      todo = todo.trim();
      todo = "<span class='todo'>" + todo + "</span>";
      article = article.replace(aRes[i], todo);
    }
  }
  return article;
}

function createCollapsibleDivs(article, wikiword) {
  var exp = /(<h1 |<h2 ){1}.*(<\/h1>|<\/h2>)/gm;
  var temp = ""
  var firsth1 = true;
  var firsth2 = true
  var lastitem = "h1";

  var aRes = article.match(exp);
  temp = ""
    if (aRes === null) {
  } else {
    for (var i=0; i<aRes.length; i++) {

      temp = aRes[i];
      temp = temp.slice(0,temp.length - 5);
      if (temp.substring(0,3) == "<h1") {
        if (firsth1) {
         temp = temp + '<span class="header_button"><img src="' + getNodeMinimizeImageURI() + '" id="segmenttoggle_a' + i + '" class="segment" status="max" alt="Toggle" /> <img src="' + getEditSegmentImageURI() + '" id="segmentedit_a' + i + '" wikiword="'+ wikiword +'" class="segment" alt="Edit" /></span></h1><div id="segment_a' + i +'">';
         firsth1 = false;
         firsth2 = true;
         lastitem = "h1";
        } else {
         if (lastitem == "h2") {
           temp = '</div>' + temp;
         }
         temp = '</div>' + temp + '<span class="header_button"><img src="' + getNodeMinimizeImageURI() + '" id="segmenttoggle_a' + i + '" class="segment" status="max" alt="Toggle" /> <img src="' + getEditSegmentImageURI() + '" id="segmentedit_a' + i + '" wikiword="'+ wikiword +'" class="segment" alt="Edit" /></span></h1><div id="segment_a' + i + '">';
         firsth2 = true;
         lastitem = "h1"
        }

      } else {
        if (firsth2) {
          temp = temp + '<span class="header_button"><img src="' + getNodeMinimizeImageURI() + '" id="segmenttoggle_b' + i + '" class="segment" status="max" alt="Toggle" />  <img src="'+ getEditSegmentImageURI() +'" id="segmentedit_b' + i + '" wikiword="'+ wikiword +'" class="segment" alt="Edit" /></span></h2><div id="segment_b' + i +'">';
          firsth2 = false;
          lastitem = "h2";
        } else {
          if (lastitem == "h1") {
            alert("error");
          }
          temp = '</div>' + temp + '<span class="header_button"><img src="' + getNodeMinimizeImageURI() + '" id="segmenttoggle_b' + i + '" class="segment" status="max" alt="Toggle" /> <img src="' + getEditSegmentImageURI() + '" id="segmentedit_b' + i + '" wikiword="'+ wikiword +'" class="segment" alt="Edit" /></span></h2><div id="segment_b' + i + '">';
          lastitem = "h2";
        }
      }

      article = article.replace(aRes[i], (temp));
    }
    article = article + "</div>";
  }

  return article;
}

function linkWikiWords(article) {
  var exp = /\[(.*?)\]/g;
  var aRes = article.match(exp);
  var wikiword = "";
  if (aRes === null) {

  } else {
    for (var i=0; i<aRes.length; i++) {
      wikiword = aRes[i].trim();
      wikiword = linkify(wikiword.slice(1,wikiword.length-1));
      article = article.replace(aRes[i], (wikiword));
    }
  }
  return article;
}

function linkify(wikiword, breadcrumb = false) {
  var linkedWikiWord = "";
  if (breadcrumb) {
    linkedWikiWord = "<a class='wikiword breadcrumb' id='"+ wikiword +"'>" + wikiword + "</a>";
  } else {
  if (localStorage.getItem(LSprefix + wikiword) === null) {
    linkedWikiWord = "<a class='wikiword new' id='"+ wikiword +"'>" + wikiword + "</a>";
  } else {
    linkedWikiWord = "<a class='wikiword existing' id='"+ wikiword +"'>" + wikiword + "</a>";
  }
  }
  return(linkedWikiWord);
}

function listItems() {
  var aDispHun = ["0-9","A, Á", "B", "C, Cs", "D, Dz, Dzs", "E, É", "F", "G", "H", "I, Í", "J", "K", "L, Ly", "M", "N, Ny", "O, Ó, Ö, Ő", "P", "Q", "R", "S, Sz", "T, Ty", "U, Ú, Ü, Ű", "V", "W", "X", "Y", "Z, Zs", "Other" ];
  var aSearchHun = ["0123456789", "AÁaá", "Bb", "Cc", "Dd", "EÉeé", "Ff", "Gg", "Hh", "IÍií", "Jj", "Kk", "Ll", "Mm", "Nn", "OÓÖŐoóöő", "Pp", "Qq", "Rr", "Ss", "Tt", "UÚÜŰuúüű", "Vv", "Ww", "Xx", "Yy", "Zz", "_+-.?!=~$;:"  ];
  var LSkey, wikiword, article, i,j, sTemp;
  var bLetterNeeded = true;

  $("#content").empty();
  $("#edit").hide();
  $("#content").append($("<div id='content_head'>"));
  $("#content").append($("<div id='content_article'>"));
  $("#content_head").html(getHomeImageLink() + " [List of articles]");
  $("#content_article").html("");

  for (j=0; j<aSearchHun.length; j++) {
    bLetterNeeded = true;
    for (i = 0; i < localStorage.length; i++)   {
      LSkey = localStorage.key(i);
      if (LSkey.indexOf(LSprefix) == 0) {
        wikiword = LSkey.replace(LSprefix, "");
        sTemp = aSearchHun[j];
        if (sTemp.indexOf(wikiword.substr(0,1))>-1) {
          if (bLetterNeeded) {
            $("#content_article").append("<h2>" + aDispHun[j] + "</h2>");
            bLetterNeeded = false;
          } else {
            $("#content_article").append(" | ");
          }
          article = JSON.parse(localStorage.getItem(LSkey));
          $("#content_article").append(linkify(wikiword));
        }
      }
    }
  }
  updateFreeSpace();
}

function processGraph(article) {
  var exp = /(?:<graph>)([\s\S]+?)(?:<\/graph>)/gm;
  var aResWithTag = [];
  var aResWithoutTag = [];
  var match;
  while (match = exp.exec(article)) {
    aResWithTag.push(match[0]);
    aResWithoutTag.push(match[1].trim());
  }


  if (aResWithTag === null) {}
  else {
    for (var i=0; i<aResWithTag.length; i++) {
      article = article.replace(aResWithTag[i], "<div id='graph_" + i + "' class='mermaid'></div>" );
      //console.log("graph" + i);
    }
    aGraph_temp = aResWithoutTag;
  }

  return article;
}

function displayGraph(article) {

  var aResWithoutTag = aGraph_temp;
  for (var i=0; i<aResWithoutTag.length; i++) {
      $("#graph_"+i).html(aResWithoutTag[i]);
  }
  mermaid.init();


  return article;
}
    
function processBPMN(article) {
  var exp = /(?:<bpmn>)([\s\S]+?)(?:<\/bpmn>)/gm;
  var aResWithTag = [];
  var aResWithoutTag = [];
  var match;
  while (match = exp.exec(article)) {
    aResWithTag.push(match[0]);
    aResWithoutTag.push(match[1].trim());
  }

  if (aResWithTag === null) {}
  else {
    $("#tempfields").empty();
    for (var i=0; i<aResWithTag.length; i++) {
        article = article.replace(aResWithTag[i], "<div id='bpmn_" + i + "' class='bpmn_viewer'></div>" );
        //console.log("bpmn_" + i);
        $("#tempfields").append($("<div id='t_bpmn_"+i+"' class='tempbpmn'>"));
        $("#t_bpmn_"+i).html(window.btoa(unescape(encodeURIComponent(aResWithoutTag[i]))));
    }
    aBPMN_temp = aResWithoutTag;
  }
  return article;
}

function displayBPMN(article) {

  var aResWithoutTag = aBPMN_temp;
  for (var i=0; i<aResWithoutTag.length; i++) {
    var bpmnViewer = new BpmnJS.Viewer({
      container: '#bpmn_'+i
    });
    
      // import diagram
    bpmnViewer.importXML(aResWithoutTag[i], function(err) {
      if (err) {
        return console.error('could not import BPMN 2.0 diagram', err);
      }
      // access viewer components
      var canvas = bpmnViewer.get('canvas');
      // zoom to fit full viewport
      canvas.zoom('fit-viewport');
    });
    
  }
  return article;
}

function displayArticle(wikiword) {
    var article = JSON.parse(localStorage.getItem(LSprefix + wikiword));
    var renderer = new marked.Renderer();
      renderer.code = function (code, language) {
        if(code.trim().match(/^sequenceDiagram/)||code.match(/^graph/)||code.match(/^gantt/)){
           return '<graph>'+code+'</graph>';
        } else
        if(code.trim().match(/^bpmn/)){
           return '<bpmn>'+code+'</bpmn>';
        } else{
          return '<pre><code>'+code+'</code></pre>';
        }
        
      };
    var md_article = marked(article, {renderer:renderer});
    md_article = processGraph(md_article);
    md_article = processBPMN(md_article);
    md_article = linkWikiWords(md_article);
    md_article = beautifyToDos(md_article);
    md_article = createCollapsibleDivs(md_article, wikiword);
    $("#content").empty();
    $("#edit").hide();
    $("#content").append($("<div id='content_head'>"));
    $("#content_head").html(getHomeImageLink() + " [" + wikiword + "]");
    $("#content").append($("<div id='content_article'>"));
    $("#content_article").html(md_article);

    $("#content_article").append("<br/><br/><div id='actionbar'><input type='button' wikiword='"+wikiword+"' id='content_edit' value='Edit'> <input type='button' wikiword='"+wikiword+"' id='content_delete' value='Delete'></div>");
    addItemToBreadCrumb(wikiword);
    displayGraph(md_article);
    displayBPMN(md_article);
}

function main() {
  var oURL = new URL(window.location.href);
  var page = oURL.searchParams.get("page");    
  if (page && page=="modeler") {
    $("#main").empty();
    $("#navi_buttons").empty();
    $("#navi_buttons").append("<input type='button' id='bpmn_close_save' value='Save & close' /> ");
    $("#navi_buttons").append("<input type='button' id='bpmn_close_cancel' value='Cancel edit & close' /> ");
    $("#breadcrumb").text("BPMN diagram #" + localStorage.getItem("wiki.temp.bpmnIndexInArticle") + " @"+ localStorage.getItem("wiki.temp.wikiword"));
    updateFreeSpace();  
    $('#main').append('<div id="bpmn_editor_canvas"></div>');
    $('#bpmn_editor_canvas').height($("#main").parent().outerHeight()-100);
    var bpmnXML = localStorage.getItem("wiki.temp.bpmn");

    if (bpmnXML.length<6) {
        bpmnXML = '<?xml version="1.0" encoding="UTF-8"?><bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn2:process id="Process_1" isExecutable="false"></bpmn2:process><bpmndi:BPMNDiagram id="BPMNDiagram_1"><bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">    </bpmndi:BPMNPlane>  </bpmndi:BPMNDiagram></bpmn2:definitions>';
    } else {
        bpmnXML=bpmnXML.replace('<!--?xml version="1.0" encoding="UTF-8"?-->','<?xml version="1.0" encoding="UTF-8"?>')
    }
        
    // modeler instance
    bpmnModeler = new BpmnJS({
        container: '#bpmn_editor_canvas',
        keyboard: {
            bindTo: window
        }
    });

    console.log(bpmnXML);
    openDiagram(bpmnXML);  
      
      
  } else {
    if (localStorage.getItem(LSprefix + "Main") === null) {
      listItems();
    } else {
      displayArticle("Main");
    }
    updateFreeSpace();
  }
}

function updateBPMNInArticle(bpmnXML) {
    
    if (bpmnXML.trim()=="none") {
    } else {
        $("#tempfields").empty();
        var wikiword = localStorage.getItem("wiki.temp.wikiword");
        var bpmnIndexInArticle = localStorage.getItem("wiki.temp.bpmnIndexInArticle");
        var oldBPMN = localStorage.getItem("wiki.temp.bpmn");
        var article = JSON.parse(localStorage.getItem(LSprefix+wikiword));

        var exp = /(?:```)([\s\S]+?)(?:```)/gm;
        var aResWithoutTag = [];
        var match;
        var oldBPMN;
        while (match = exp.exec(article)) {
            oldBPMN = match[1].trim();
            if (oldBPMN.substr(0,4)=="bpmn") {
                aResWithoutTag.push(oldBPMN);    
            }
        }
        
        bpmnXML = 'bpmn\n' + bpmnXML;
        
        article = article.replace(aResWithoutTag[bpmnIndexInArticle], bpmnXML);

        
        localStorage.setItem(LSprefix+wikiword, JSON.stringify(article));
        displayArticle(wikiword);
    }
    localStorage.removeItem("wiki.temp.wikiword");
    localStorage.removeItem("wiki.temp.bpmnIndexInArticle");
    localStorage.removeItem("wiki.temp.bpmn");
    
}

window.onbeforeunload = function(){
    window.opener.postMessage("none","*" );
}

window.addEventListener("beforeunload", function(e){
    window.opener.postMessage("none","*" ); 
}, false);

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