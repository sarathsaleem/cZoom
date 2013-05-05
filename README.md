cZoom
=====

It is a lightweight JavaScript canvas image zoom plugin with Annotations and Pan

A light weight JavaScript library for image maupulation in HTML "canvas" element. It includes zooming, panning and adding annotations. Its compatible with all touch devices like iPad, iPhone, android tablets etc. It has UI buttons as well as the API to do the functionalities.

In touch devices gesture event is implemented for zooming using the "gesturechange" event and "scale" properly of the event type gesture. Gesture zooming will not work in the devices which doesn't have the support of "event.scale" in gesture events.


### Usage ###
Download the [library](http://sarathsaleem.github.com/cZoom/src/cZoom.js) and include it in your html.

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

