var config = {
  startOnLoad:false,
  flowchart:{
      useMaxWidth:true,
      htmlLabels:true
  }
};
mermaid.initialize(config);

var gTemp = []
var LSprefix = "wiki.";

window.onload=function(){

$("#navi_list").click(function() {
  listItems();
  //25QhtGLrjCAAAAAAAAAAFTwzZC6QNY4LYeZkgEKOAemg18mHpN8g0FAS_o9CdLpH
});

$(document).on('click', "#content_head_home", function() {
  main();
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
// itt
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
    console.log(match[1]);
  }


  if (aResWithTag === null) {}
  else {
    for (var i=0; i<aResWithTag.length; i++) {
      article = article.replace(aResWithTag[i], "<div id='graph_" + i + "' class='mermaid'></div>" );
      console.log(i);
    }
    gTemp = aResWithoutTag;
  }

  return article;
}

function displayGraph(article) {

  var aResWithoutTag = gTemp;
  for (var i=0; i<aResWithoutTag.length; i++) {
      $("#graph_"+i).html(aResWithoutTag[i]);
  }
  mermaid.init();

  return article;
}

$(document).on('click', "div.mermaid", function() {
    var svg = $(this).html();
    svg = '<?xml version="1.0" standalone="no"?><?xml-stylesheet type="text/css" href="https://cdn.rawgit.com/knsv/mermaid/7.0.0/dist/mermaid.forest.css"?>' + svg;
    var svg_blob = new Blob([svg],{'type': "image/svg+xml"});
    var url = URL.createObjectURL(svg_blob);

    var svg_win = window.open(url, "svg_win");

});


function displayArticle(wikiword) {
    var article = JSON.parse(localStorage.getItem(LSprefix + wikiword));
    var renderer = new marked.Renderer();
      renderer.code = function (code, language) {
        if(code.trim().match(/^sequenceDiagram/)||code.match(/^graph/)||code.match(/^gantt/)){
           return '<graph>'+code+'</graph>';
        }
      };
    var md_article = marked(article, {renderer:renderer});
    md_article = processGraph(md_article);
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
}

function main() {
  if (localStorage.getItem(LSprefix + "Main") === null) {
    listItems();
  } else {
    displayArticle("Main");
  }
  updateFreeSpace();

}
function getNodeMinimizeImageURI() {
  var temp = 'data:image/png;base64,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';

  return temp;
}

function getNodeMaximizeImageURI() {
  var temp = 'data:image/png;base64,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';
  return temp;
}

function getEditSegmentImageURI() {

  temp = "data:image/png;base64,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";
  return temp;
}

function getHomeImageLink() {
  var temp = "<a id='content_head_home'>";
  temp = temp + '<img id="content_head_home_img" src="data:image/png;base64,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" width="21px" height="21px"/>';
  temp = temp + "</a>";
  return temp;
}

main();

};
