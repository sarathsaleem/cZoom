cZoom
=====

It is a lightweight canvas image zoom plugin with ad Annotations and Pan

Plublic methods:
	zoomTo();
	getZoom();
	resetZoom();	
	
	getAnnotations();
	createAnnotation();
	deleteAnnotation();
	
	getPan();
	setPan();
	resetPan();

### Usage ###

Download the [minified library](http://mrdoob.github.com/three.js/build/Three.js) and include it in your html.
Alternatively see [how to build the library yourself](https://github.com/mrdoob/three.js/wiki/build.py,-or-how-to-generate-a-compressed-Three.js-file). 

```html
<script src="js/Three.js"></script>
```

This code creates a camera, then creates a scene, adds a cube on it, creates a &lt;canvas&gt; renderer and adds its viewport in the document.body element.

```html
<script>

	var camera, scene, renderer,
	geometry, material, mesh;

	init();
	animate();

	function init() {

		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.z = 1000;
		scene.add( camera );

		geometry = new THREE.CubeGeometry( 200, 200, 200 );
		material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

		mesh = new THREE.Mesh( geometry, material );
		scene.add( mesh );

		renderer = new THREE.CanvasRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );

		document.body.appendChild( renderer.domElement );

	}

	function animate() {

		// note: three.js includes requestAnimationFrame shim
		requestAnimationFrame( animate );
		render();

	}

	function render() {

		mesh.rotation.x += 0.01;
		mesh.rotation.y += 0.02;

		renderer.render( scene, camera );

	}

</script>
```

### Change Log ###
