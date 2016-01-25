$import (src[, srcN, ...][, callback])
======================================

### Basic useful feature list:

 * Load JS/CSS/LESS files into the document and execute callback(s) when loading is complete.
 * Ability to define custom name for any link to the file and handle loading by using event handler.
 * Ability to define custom type of the file (can be useful when the link to the file has not valid file extension) either js when can not be detected.
 * Automatic file caching logic (Any URL will be loaded only once while the page will not reloaded).



Resource definition format
--------------------------

```
[ {name} : {type} ] {url}
```

Resource can be defined by using follow parameters:
* `url` : (required) URL to the file
* `type`: (optional) Type of file that defined in `url`.
          Available values is `js`, `css` or `less`.
          Can be useful when the link to the file has not valid file extension.
* `name`: (optional) `[a-zA-Z0-9.-_]` Unique identifier of the file that defined in `url`.
          When `url` loading is complete the event `@import:{name}` will be dispatched for `document`.

URL to the file can be defined by different ways:

* Simple link:
  ```
  /url/path/to/the/file.{js|css|less}
  ```
* Named link:
  ```
  [some.name] /url/path/to/the/file.{js|css|less}
  ```
* Type defined link:
  ```
  [:css] /url/path/to/the/file.any
  ```
* Both:
  ```
  [some.name : css] /url/path/to/the/file.any
  ```

Installation
------------
Add `script` tag with `src` to the `import.min.js` file on your web site.
```
<script type="text/javascript" src="https://rawgit.com/w3core/import.js/master/import.min.js"></script>
```

Usage
-----

### Basic example
```javascript
$import([
  "script.js",
  "style.css",
  "https://path.to/yet/another/script.js",
  "[:css] https://path.to/yet/another/style.php"
],
function (files) {
  // Loading complete
  console.log(files)
});
```
### Advanced example
```javascript

var plugin_1_files = [
  "https://path.to/the/script.js",
  "[:css] https://path.to/the/style.php"
];

var plugin_2_files = {
  plugin2Styles: "/url/path/to/the/file.css",
  plugin2Scripts: [
    "/url/path/to/the/file.js",
    "[core.script:js] /url/path/to/the/file.any",
    "[ext.script] /url/path/to/the/file.js"
  ],
  plugin2Loaded: function(files){
    console.log("plugin2Loaded >", files);
  }
};

document.addEventListener("@import", function(e){
  console.log("@import >", e.data);
});

document.addEventListener("@import:core.script", function(e){
  console.log("@import:core.script >", e.data);
});

// The property name of an object can be used as `name` too
document.addEventListener("@import:plugin2Styles", function(e){
  console.log("@import:plugin2Styles >", e.data);
});

$import(plugin_1_files, plugin_2_files, function(files){
  console.log("Main callback >", files);
});

```

-- Cheers
