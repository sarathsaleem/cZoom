/*

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
		
	
	:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:||
			Architecture / Modules description 		 ||
	:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:||
	
	Reffer iScroll structure but there is no need of adding all the var as public , expose just the public api's.	
	Use Stict mode: Ys i want it :)
	
	___IntApp___ : *Get property of container , keep that as global refference.
					* Image loading function , keep image data as global.
						-- f(): load img an give bck the img data
					*init/Create UI . elements UI module is separate than int tht ui accept image data n container refference.
					*all helper functions , checks will go in this section
					___________________________________________________________________________________________________________
					
	__UI__		: *Create dom elemts , buttons , css handeling . 
					*Bind all events , handele touch n mouse binding.
					____________________________________________________________________________________________________________
					
	__Fn___		: *Local copy of all functions including public.
					*Split as zoom, pan, draw section 
					* Identify the shared/connection  methods between sessions.
					* How to handle module__module communicatins ?
					
					
	
*/

(function(window,doc){

"use strict";

var isTouch = 'ontouchstart' in window ,
	resize_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
	start_EV = isTouch ? 'touchstart' : 'mousedown',
	move_EV = isTouch ? 'touchmove' : 'mousemove',
	end_EV = isTouch ? 'touchend' : 'mouseup',
	cancel_EV = isTouch ? 'touchcancel' : 'mouseup',
	canvasSupported = !!document.createElement("canvas").getContext;

	
/*
*
* @para		: id
* @return	: {element , context} or false
*
*/
function createCanvas(id){
	var c = doc.createElement("canvas");
	if(c.getContext && c.getContext('2d')){
		c.id = id || '';
		return c ;	
	}else{		
		return false;
	}
}


//modules
var modules = {
	
	ui : function(ele,imgData){
		var wrapper = ele,
			cWrapper = doc.createElement("div"),
			imgWidth = imgData.width,
			imgHeight = imgData.height,			 
			imgCanvas = createCanvas("cZ_imgCanvas"),			
			textCanvas = createCanvas("cZ_textCanvas");
			
			imgCanvas.width = textCanvas.width = imgWidth;
			imgCanvas.height = textCanvas.width = imgHeight;
			//create main app wrapper
			wrapper.appendChild(cWrapper);	
			cWrapper.style.width = imgWidth+"px";
			cWrapper.style.height = imgHeight+"px";
			cWrapper.className = "cZ_Wrapper";
			cWrapper.style.position = "relative";//may hv to remove
			// Append canvas , add image data , call btn cteate.
			function ui_init(){
				cWrapper.appendChild(imgCanvas);
				//cWrapper.appendChild(textCanvas);
				
				//image size and canvas size are same or else make option to draw in center of canvas
				imgCanvas.getContext('2d').drawImage(imgData, 0, 0);
				
				//
				addBtns();
				
			}
			//Add ui btns
			function addBtns(){
				var templateTool = ['<div class="cZ_toolWrapper">',
									'<div class="cZ_zoom"><div class="cZ_zoomIn cZ_tool_item"></div><div class="cZ_zoomOut cZ_tool_item"></div></div>',
									'<div class="cZ_pan cZ_tool_item"></div>',
									'<div class="cZ_edit cZ_tool_item"></div>',
								'</div>'].join("");			
				cWrapper.insertAdjacentHTML( 'beforeend', templateTool );
				
			
				//text edit			
				var templateEdit = ['<div class="cZ_editWrapper"><div class="cZ_edit_cancel"></div>',	
									'<input value="" class="cZ_edit_text" name="cz_editText" type="text" />',
									'<div class="cZ_edit_done" ></div>',
								'</div>'].join("");			
				cWrapper.insertAdjacentHTML( 'beforeend', templateEdit );
				
			}
		
		ui_init();
		
		var zoomIn = cWrapper.getElementsByClassName("cZ_zoomIn")[0],
			zoomOut = cWrapper.getElementsByClassName("cZ_zoomOut")[0],
			pan = cWrapper.getElementsByClassName("cZ_pan")[0],
			edit = cWrapper.getElementsByClassName("cZ_edit")[0];
			
		var editWrapper = cWrapper.getElementsByClassName("cZ_editWrapper")[0],
			editDone = editWrapper.getElementsByClassName("cZ_edit_done")[0],
			editText = editWrapper.getElementsByClassName("cZ_edit_text")[0],
			editCancel = editWrapper.getElementsByClassName("cZ_edit_cancel")[0];
			//
			var width = cWrapper.style.width.replace('px','')*0.35;
			editText.style.width = (width > 300 ? 300 :width)+"px";
			editWrapper.style.width = (width > 300 ? 300 :width)+75+"px";
							
		return {
			parent : wrapper,
			wrapper : cWrapper,
			imgCanvas : imgCanvas,
			textCanvas : textCanvas,
			zoomIn : zoomIn,
			zoomOut : zoomOut,
			pan : pan,
			edit : edit,
			editWrapper:editWrapper,
			editDone: editDone,
			editText:editText,
			editCancel : editCancel
		};
		
	},
	fn : function(uiObj){
		var that = this;
		var UI = uiObj,
			annotations = [],
			canvas = UI.imgCanvas,
			redrawAnnotations = function(){},		
			transformMTR = {
				transX : 0,
				transY :0,
				scaleX : 1,
				scaleY : 1
			},
			tempCanvas = createCanvas("cZ_imgCanvas_temp"),
			ctx = canvas.getContext('2d'),
			width = canvas.width,
			height = canvas.height,
			imagedata = ctx.getImageData(0,0,width,height);
			
			tempCanvas.width = width;
			tempCanvas.height = height;				
			tempCanvas.getContext('2d').putImageData(imagedata,0,0);
		this.cZMode = "zoom";//by default
		
		this.zoom = function(){			
			var imgCanvas = canvas,						
				scale = 1,
				scaleFactor = 0.01,
				zoomMode = "in";
			
			var zoomCtx = function(scalemode,scaleTo,restTo){
							if(scalemode === "in" ){ 
								scale += (scaleTo||scaleFactor);
							}
							else if(scalemode === "out" ){ 
								scale -= (scaleTo||scaleFactor);
								scale = (scale < 0) ? 0 :scale;
							}
							
							if(restTo){
								scale = restTo; 
							}
																		
							//var sWidth = width * scale;
							//var sHeight = height * scale;
							//transformMTR.transX = -((sWidth-width)/2);
							//transformMTR.transY = -((sHeight-width)/2);
							transformMTR.scaleX = scale;
							transformMTR.scaleY = scale;							
							ctx.save();
							ctx.clearRect(0, 0, width, height);							
							ctx.translate(transformMTR.transX,transformMTR.transY);
							ctx.scale(transformMTR.scaleX, transformMTR.scaleY);					
							ctx.drawImage(tempCanvas, 0, 0);
							ctx.restore();
							redrawAnnotations(transformMTR);												
			};
			
			
			return {
				_zoomIn : function(scale){					
					zoomCtx('in',scale);
				},
				_zoomOut : function(){					
					zoomCtx('out');
				},
				zoomTo: function(scale){
					zoomCtx('','',scale);
				},
				getZoom : function(){
					return scale;
				},
				resetZoom : function(){
					zoomCtx('','',1);
				}
			};
		
		};
		this.text = function(){
			//no need to use sepeerate canvas layer for text edit
			var textCanvas = UI.imgCanvas;
			ctx.fillStyle = "red";
			ctx.strokeStyle = "green";
			ctx.font = '15px Calibri';
			
			function resetEditMode(){
				that.cZMode = "";
				UI.editWrapper.style.display = "none";
			}
			
			//visible in all function module methods
			redrawAnnotations =  function(T){				
				for(var i=0,len = annotations.length;i<len;i++){					
					var text = annotations[i].text;
					var x = annotations[i].x *( T.scaleX || 1) + T.transX;
					var y = annotations[i].y *( T.scaleY || 1) + T.transY;				
					setAnnotations(text,{x:x,y:y});
				}
			};
			var getAnnotations = function(){
					return annotations;
			};
			var setAnnotations = function(text,pos){
				ctx.fillText(text, pos.x, pos.y);				
			};
									
			return {
					_resetText : function(scale){					
						resetEditMode();
					},
					createText : function(text,pos){
							var anotation = {"text":text,x:pos.x,y:pos.y};
							annotations.push(anotation);					
							setAnnotations(text,pos);
							return annotations.length;
					},
					getAll: function(scale){
						return getAnnotations();
					},
					removeText : function(){
						//have to right
						//idea to implement text anotation number for each annotation and delete tht with tht no.
					}
			};
				
		
		};
		this.pan = function(){
			
				var panCanvas = UI.imgCanvas,	
					startPt = {x:0,y:0};
							
				function pan(panPos,noease){
					
					if(panPos){
						if(!noease){
							var velocityX =  ((panPos.x - startPt.x) - transformMTR.transX) * .05;
							var velocityY =  ((panPos.y - startPt.y) - transformMTR.transY) * .05;								
							transformMTR.transX  += velocityX;
							transformMTR.transY  += velocityY;	
						}else{
							transformMTR.transX  = panPos.x;
							transformMTR.transY  = panPos.y;	
						}						
					}
					else{
						transformMTR.transX = 0;
						transformMTR.transY = 0;
					}					
					ctx.save();
					ctx.clearRect(0, 0, width, height);							
					ctx.translate(transformMTR.transX ,transformMTR.transY);
					ctx.scale(transformMTR.scaleX, transformMTR.scaleY);	
					ctx.drawImage(tempCanvas, 0, 0);
					ctx.restore();
					redrawAnnotations(transformMTR);	
				}
				
				return {
					panTo:function(pos,noease){
						pan(pos,noease);
					},
					panStart : function(pos){
						startPt.x = pos.x - transformMTR.transX;
						startPt.y = pos.y - transformMTR.transY;
					},					
					resetPan : function(){			
						pan(0);
					},
					getPan : function(){
						return {
							x : transformMTR.transX,
							y : transformMTR.transY 
						};
					}					
				};
				
		};
		return this;
	
	},
	events:function(uiObj,Fn){
		
		var UI = uiObj,
			fn = Fn;
		var wrapper = UI.wrapper,
			imgCanvas = UI.imgCanvas,
			textCanvas = UI.textCanvas;			
		var fn_zoom = fn.zoom();	
		var fn_text = fn.text();	
		var fn_pan = fn.pan();
		
		function noDefault(){
			e.preventDefault();
		}		
		function handle_E_start(e){
			e.preventDefault();
			var eva = isTouch ? e.touches[0] : e;
			return eva;
			
		}
		function handle_E_end(e){
		
		}
		function handle_E_move(e){
		
		}
		function gestureStart(e){                
               //(e);			 
        }
		function gestureChange(e){				
                e.preventDefault();
               
        }
		function gestureEnd(e){                
               //(e);			
        }		
			
		
		var events_fns = {		
			e_common : function(){			
				imgCanvas.addEventListener(start_EV,handle_E_start , false);
				imgCanvas.addEventListener(end_EV, handle_E_start , false);
				imgCanvas.addEventListener(move_EV, handle_E_move , false);	
			},
			e_zoom : function(){
				
				var zoomInBtn = UI.zoomIn,
					zoomOutBtn = UI.zoomOut;
					
				var zoomInInterval,zoomOutInterval;
				function setModeZoom(){
					fn.cZMode = "zoom";
					fn_text._resetText();
					fn_pan.resetPan();
				}
				
				function zoomInFn(e){
					e.preventDefault();	
					if(fn.cZMode!=="zoom"){
							setModeZoom();
					}										
					zoomInInterval = setInterval(function(){fn_zoom._zoomIn();},1000/60);		
					//fn_zoom._zoomIn()						
				}
				function zoomOutFn(e){
						e.preventDefault();	
						if(fn.cZMode!=="zoom"){
						setModeZoom();
						}											
						zoomOutInterval = setInterval(function(){fn_zoom._zoomOut();},1000/60);						
				}
				function zoomStop(e){
					e.preventDefault();
					clearInterval(zoomInInterval);
					clearInterval(zoomOutInterval);
				}
				
				zoomInBtn.addEventListener(start_EV, zoomInFn, false);
				zoomInBtn.addEventListener(end_EV, zoomStop, false);
				zoomOutBtn.addEventListener(start_EV, zoomOutFn, false);				
				zoomOutBtn.addEventListener(end_EV, zoomStop, false);
				wrapper.addEventListener(end_EV,zoomStop , false);
				
				/*Gesturechanges*/
				
				function zoomGuester(e){
					e.preventDefault();
					var scale =  e.scale;
					//i dnt even knw whts this , some optimization calc:Please feel free to optimize the gesture scale values
					if(scale>1){
						scale = (scale-1)/50;
						fn_zoom._zoomIn(scale);
					}else{
						scale = 1-(scale*100);
						fn_zoom._zoomOut(scale);
					}
				}
				
				imgCanvas.addEventListener("gesturestart", gestureStart, false);
				// gestures to handle pinch
				imgCanvas.addEventListener('gestureend',gestureEnd , false);
				// don't let a gesturechange event propagate
				imgCanvas.addEventListener('gesturechange', zoomGuester, true);
							
				
			},
			e_text : function(){
				var editBtn = UI.edit,
					editWrapper = UI.editWrapper,
					editDone = UI.editDone,
					editText = UI.editText,
					editCancel = UI.editCancel,
					editPos = {x:0,y:0};
					
					function setEditPos(e){						
						if(fn.cZMode === "text"){
							var eva = handle_E_start(e);
							editPos.x = eva.pageX - wrapper.offsetLeft;
							editPos.y = eva.pageY - wrapper.offsetTop;
							editWrapper.style.left = editPos.x+"px";
							editWrapper.style.top = editPos.y+"px";
							editWrapper.style.display = "block";	
						}
						else{
							imgCanvas.removeEventListener(start_EV,setEditPos);
						}
					}				
					function setEditmode(){
						//add edit text in zoom mode later
						fn_zoom.resetZoom();
						fn_pan.resetPan();
						fn.cZMode = "text";						
						imgCanvas.addEventListener(start_EV,setEditPos,false);											
					}
					function addText(){
						var value = editText.value;
						if(value){
							fn_text.createText(value,editPos);
						}
						editWrapper.style.display = "none";	
						editText.value = "";						
					}
					function hidEditWrapper(){
						editWrapper.style.display = "none";
						editText.value ="";
					}					
					editBtn.addEventListener(start_EV, setEditmode, false);					
					editDone.addEventListener(start_EV, addText, false);
					editCancel.addEventListener(start_EV, hidEditWrapper, false);					
			},		
			e_pan : function(){
				var panBtn = UI.pan,
					panPos = {x:0,y:0},
					canvas = UI.imgCanvas,
					panstart = false,
					panInterval = 0;
					function startPan(e){
						clearInterval(panInterval);
						if(fn.cZMode === "pan"){	
							panstart = true;
							panPos.x = e.pageX - UI.parent.offsetLeft;
							panPos.y = e.pageY - UI.parent.offsetTop;
							fn_pan.panStart(panPos);
							panInterval = setInterval(function(){fn_pan.panTo(panPos);},1000/60);							
						}else{
							resetPanMode(e);
						}
					}				
					function doPan(e){
						if(panstart){
							var eva = handle_E_start(e);							
							panPos.x = (eva.pageX - UI.parent.offsetLeft);
							panPos.y = (eva.pageY - UI.parent.offsetTop);							
						}
					}
					function endPan(e){					
						panstart = false;
						clearInterval(panInterval);
					}					
					function setPanMode(e){
						fn.cZMode = "pan";				
						canvas.addEventListener(start_EV, startPan, false);
						canvas.addEventListener(move_EV, doPan, false);
						canvas.addEventListener(end_EV, endPan, false);	
					}
					function resetPanMode(e){
						fn.cZMode = "";				
						canvas.removeEventListener(start_EV, startPan, false);
						canvas.removeEventListener(move_EV, doPan, false);
						canvas.removeEventListener(end_EV, endPan, false);	
					}
					panBtn.addEventListener(start_EV, setPanMode, false);					
			}
		};
		
		//call all the event bind functions
		events_fns.e_common();
		events_fns.e_zoom();
		events_fns.e_text();
		events_fns.e_pan();
		
		return {
			zoom:fn_zoom,
			text:fn_text,
			pan : fn_pan
		};
	}
	
};

// main __InitApp__
var cZoom = function(ele,imgsrc,options){
	
	var cThis = this,
		image = new Image(), //$("<img />"); for cross domain images			
		wrapper = typeof ele === 'object' ? ele : doc.getElementById(ele);	
		image.onload = function(){
			initApp(this);
		};		
		image.src = imgsrc;	
		
		/*
		*^^^^^^Options^^^^^^^*
		 
		#text color , font
		#canvas border
		#
		*/
			
	function initApp(imgData){
		
			var new_UI = modules.ui(wrapper,imgData);
			var new_Fn = modules.fn(new_UI);				
			var new_Event = modules.events(new_UI,new_Fn);
			
			//Public methods:
			
			var zoomMethods = new_Event.zoom;
			var textMethods = new_Event.text;
			var panMethods = new_Event.pan;
			
			//zoom
			//zoomTo();
			//getZoom();
			//resetZoom();	
			cThis.zoomTo = function(val){
				return zoomMethods.zoomTo(val);
			};
			cThis.getZoom = function(){				
				return zoomMethods.getZoom();
			};
			cThis.resetZoom = function(){
				return zoomMethods.resetZoom();
			};
			
			//text
			//getAnnotations();
			//createAnnotation();
			//#__# deleteAnnotation();			
			cThis.getAnnotations = function(){
				return textMethods.getAll();
			};
			cThis.createAnnotation = function(text,pos){
				zoomMethods.resetZoom();
				textMethods.createText(text,pos);
			};
			cThis.deleteAnnotation = function(){
				return textMethods.removeText();
			};
			
			
			//text
			//getPan();
			//setPan();
			//resetPan();			
			cThis.getPan = function(){
				return panMethods.getPan();
			};
			cThis.setPan = function(pos){				
				panMethods.panTo(pos,"noease");
			};
			cThis.resetPan = function(){
				panMethods.resetPan();
			};
			
		}		
	
};

if(!window.cZoom){ 
 window.cZoom = cZoom; 
}

//END
})(window,document);