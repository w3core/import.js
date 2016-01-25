/**
 * JavaScript/CSS/LESS files $import utility
 * 
 * Usage: $import (src[, srcN, ...][, callback])
 * 
 * Where "src" is: "[name:type] url"
 *             OR: "[name] url"
 *             OR: "[:type] url"
 *             OR: "url"
 * 
 * Where "type" is: "js" or "css" or "less"
 * 
 * https://github.com/w3core/import.js/
 * @version 1.0.0
 * @license BSD License
 * @author Max Chuhryaev
 */
(new function (window, document) {

  var NODES = [], head = document.getElementsByTagName("head")[0];

  function on (event, node, fn, sign) { node.addEventListener(event, fn, sign) }
  function off (event, node, fn, sign) { node.removeEventListener(event, fn, sign) }
  function isEnum (o) {return o && typeof o == "object" && typeof o.length == "number" && !o.nodeName && o != window}

  function dispatch (event, data) {
    var e = document.createEvent("HTMLEvents");
    e.data = data;
    e.initEvent(event, true, true );
    return !document.dispatchEvent(e);
  }

  function parseString (s) {
    var v = /^(\s*\[\s*(\!?)\s*([a-zA-Z0-9\.\-_]*)\s*\:?\s*([a-zA-Z]*)\s*\])?\s*([^\s]+)\s*$/g.exec(s);
    var t = /^[^#?]+\.([a-zA-Z0-9]+)([?#].*)?$/g.exec(s);
    return v ? {
      reload: !!v[2],
      name: v[3] ? [v[3]] : [],
      type: v[4] || t ? (v[4] || t[1]).toLowerCase() : null,
      url: v[5]
    } : null;
  }

  function pushSrc (src, s) {
    var s = typeof s == "string" ? parseString(s) : s;
    if (s) {
      var done;
      for (var i=0; i<src.length; i++) {
        if (src[i].url == s.url) {
          if (s.reload) src[i].reload = !0;
          if (s.type && !src[i].type) src[i].type = s.type;
          if (s.name.length) {
            for (var j=0; j<s.name.length; j++) {
              if (src[i].name.indexOf(s.name[j]) < 0) src[i].name.push(s.name[j]);
            }
          }
          done = !0;
          break;
        }
      }
      if (!done) src.push(s);
    }
  }

  function parseArguments (o) {
    var callback = [], src = [], v;

    if (typeof o == "function") callback.push(o);
    else if (typeof o == "string") {
      v = o.split(",");
      for (var i=0; i<v.length; i++) pushSrc(src, v[i]);
    }
    else if (o && typeof o == "object") {
      var list = isEnum(o);
      for (var i in o) {
        v = parseArguments(o[i]);
        for (var s=0; s<v.src.length; s++) {
          if (!list) v.src[s].name.push(i);
          pushSrc(src, v.src[s]);
        }
        for (var c=0; c<v.callback.length; c++) callback.push(v.callback[c]);
      }
    }
    return {src:src, callback:callback};
  }

  function isTypeJS (type) {return !type || type == "js"}
  function tagByType (type) {return isTypeJS(type) ? "script" : "link"}
  function srcByType (type) {return isTypeJS(type) ? "src" : "href"}

  function load (inf, callback) {
    var img = document.createElement("img"),
       load = "load",
      error = "error",
         js = isTypeJS(inf.type),
       node = document.createElement(tagByType(inf.type));
    node.queue = [callback];
    node[srcByType(inf.type)] = inf.url;
    node[js?"type":"rel"] = js ? "text/javascript"
                          : inf.type == "less" ? "stylesheet/less"
                          : "stylesheet";
    var fn = function (e) {
      off(load, node, fn);
      off(error, node, fn);
      if (isEnum(node.queue) && node.queue.length) {
        while (node.queue.length > 0) {
          var callback = node.queue.shift();
          if (typeof callback == "function") callback(node, inf, e);
        }
      }
    };
    on(load, js?node:img, fn);
    on(error, js?node:img, fn);
    NODES.push(node);
    head.appendChild(node);
    if(!js) img.src = inf.url;
    return node;
  }

  function searchExists (type, url) {
    var attr = srcByType(type), list = document.getElementsByTagName(tagByType(type));
    for (var i=0; i<list.length; i++) {
      if (list[i][attr] == url) return list[i];
    }
  }

  function getExists (type, url) {
    var found = searchExists(type, url);
    if (found) {
      if (!isEnum(found.queue)) {
        found.queue = [];
        NODES.push(found);
      }
      return found;
    }
    else {
      var attr = srcByType(type);
      for (var i=0; i<NODES.length; i++) {
        if (NODES[i][attr] == url) return NODES[i];
      }
    }
  }

  function $import (src, callback) {
    var req = parseArguments([].slice.call(arguments));

    var src = req.src, callback = req.callback, done = 0;
    var reconnect = function (node) {
      if (!node.parentNode) head.appendChild(node);
      return node;
    };
    var exec = function () {
      for (var i=0; i<callback.length; i++) callback[i](src);
      for (var i=0; i<src.length; i++) {
        dispatch("@import", src[i]);
        for (var j=0; j<src[i].name.length; j++) dispatch("@import:" + src[i].name[j], src[i]);
      }
    };
    if (!src.length) return exec();
    var calc = function () {
      done++; if (done == src.length) exec();
    };
    for (var i=0; i<src.length; i++) {
      var type = src[i].type, url = src[i].url;
      var exists = getExists(type, url);
      if (exists) {
        src[i].node = reconnect(exists);
        if (exists.queue.length) exists.queue.push(calc);
        else calc();
      }
      else src[i].node = load(src[i], calc);
    }          
  }

  window.$import = $import;
}(window, document));
