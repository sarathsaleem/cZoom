cZoom
=====

It is a lightweight JavaScript canvas image zoom plugin with Annotations and Pan


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

### Architecture ###

```html

~~~~~~~~~~~~~~#########~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~###~~~~~~~###~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~###~~~~~~~~~###~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~###~~~~~~~~~~~~~~~~~~~~@@@@@@@~~~~@@@~~~~~@@@~~~@@~~@@~~~~~~~~
~~~~~~~~~###~~~~~~~~~~~~~~~~~~~~~~~~~@@~~~~@~~~@~~~@~~~@~~@~@@~@~~~~~~~~
~~~~~~~~~##~~~~~~~~~~~~~~~~~~~~~~~~@@~~~~~~@~~~@~~~@~~~@~~@~~~~@~~~~~~~~
~~~~~~~~~##~~~~~~~~~~~~~~~~~~~~~~@@@@@@@~~~~@@@~~~~~@@@~~~@~~~~@~~~~~~~~
~~~~~~~~~###~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~###~~~~~~~~~~~~###~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~###~~~~~~~~~~###~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~###~~~~~~~~###~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~###########~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			

# Change: new name cZoom();
	initilized with passing the container id.
	pass image path and container id.
	
	@_@ Create tool buttons from app,bind events as both for touch and mouse
	@_@ resize the canvas to image size
		---------------
		Functionalities
		---------------
	@_@ Zoom in/out canvas
	@_@ Draw annotations on canvas(text should not zoom, but shoud retain the position)
	@_@ Pan canvas
	
	
	Flow description:
	====================================================================================

	Use can create instance with new cZoom();
	
	Plublic methods:
	~~~~~~~~~~~~~~~~
	
	resetAll();
	destroy();
	
	#zoomTo();
	#getZoom();
	#resetZoom();
	
	#panTo();
	#getPan();
	#resetPan();
	
	#createAno();
	#removeAno();
	#getAnos();	
		
	
	
```

