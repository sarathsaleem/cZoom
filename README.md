cZoom
=====

It is a lightweight canvas image zoom plugin with ad Annotations and Pan


### Plublic methods ###
```html
	zoomTo();
	getZoom();
	resetZoom();
	getAnnotations();
	createAnnotation();
	deleteAnnotation();	
	getPan();
	setPan();
	resetPan();
```

### Usage ###
Download the [minified library]() and include it in your html.

```html
<script src="js/cZoom.js"></script>
```

Initialize the plugin to a div elemet like 
```html

<div id="zoomCanvas"></div>

<script>

var myZoom = new cZoom("zoomCanvas","imagename.jpg");

</script>
```


