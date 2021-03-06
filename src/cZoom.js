/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator */
/*
 * Copyright (c) 2012 Sarath Saleem
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */



(function (window, doc) {

    "use strict";

    var isTouch = 'ontouchstart' in window,
        resize_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
        start_EV = isTouch ? 'touchstart' : 'mousedown',
        move_EV = isTouch ? 'touchmove' : 'mousemove',
        end_EV = isTouch ? 'touchend' : 'mouseup',
        cancel_EV = isTouch ? 'touchcancel' : 'mouseup',
        canvasSupported = !! document.createElement("canvas").getContext;


    /*
     *
     * @para		: id
     * @return	: {element , context} or false
     *
     */
    function createCanvas(id) {
        var c = doc.createElement("canvas");
        if (c.getContext && c.getContext('2d')) {
            c.id = id || '';
            return c;
        } else {
            return false;
        }
    }


    //modules
    var modules = {

        ui: function (ele, imgData) {
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
            cWrapper.style.width = imgWidth + "px";
            cWrapper.style.height = imgHeight + "px";
            cWrapper.className = "cZ_Wrapper";
            cWrapper.style.position = "relative"; //may hv to remove
            // Append canvas , add image data , call btn cteate.

            function ui_init() {
                cWrapper.appendChild(imgCanvas);
                //cWrapper.appendChild(textCanvas);

                //image size and canvas size are same or else make option to draw in center of canvas
                imgCanvas.getContext('2d').drawImage(imgData, 0, 0);

                //
                addBtns();

            }
            //Add ui btns

            function addBtns() {
                var templateTool = ['<div class="cZ_toolWrapper">',
                    '<div class="cZ_zoom"><div class="cZ_zoomIn cZ_tool_item"></div><div class="cZ_zoomOut cZ_tool_item"></div></div>',
                    '<div class="cZ_pan cZ_tool_item"></div>',
                    '<div class="cZ_edit cZ_tool_item"></div>',
                    '</div>'].join("");
                cWrapper.insertAdjacentHTML('beforeend', templateTool);


                //text edit			
                var templateEdit = ['<div class="cZ_editWrapper"><div class="cZ_edit_cancel"></div>',
                    '<input value="" class="cZ_edit_text" name="cz_editText" type="text" />',
                    '<div class="cZ_edit_done" ></div>',
                    '</div>'].join("");
                cWrapper.insertAdjacentHTML('beforeend', templateEdit);

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
            var width = cWrapper.style.width.replace('px', '') * 0.35;
            editText.style.width = (width > 300 ? 300 : width) + "px";
            editWrapper.style.width = (width > 300 ? 300 : width) + 75 + "px";

            return {
                parent: wrapper,
                wrapper: cWrapper,
                imgCanvas: imgCanvas,
                textCanvas: textCanvas,
                zoomIn: zoomIn,
                zoomOut: zoomOut,
                pan: pan,
                edit: edit,
                editWrapper: editWrapper,
                editDone: editDone,
                editText: editText,
                editCancel: editCancel
            };

        },
        fn: function (uiObj) {
            var that = this;
            var UI = uiObj,
                annotations = [],
                canvas = UI.imgCanvas,
                redrawAnnotations = function () {},
                transformMTR = {
                    transX: 0,
                    transY: 0,
                    scaleX: 1,
                    scaleY: 1
                },
                tempCanvas = createCanvas("cZ_imgCanvas_temp"),
                ctx = canvas.getContext('2d'),
                width = canvas.width,
                height = canvas.height,
                imagedata = ctx.getImageData(0, 0, width, height);

            tempCanvas.width = width;
            tempCanvas.height = height;
            tempCanvas.getContext('2d').putImageData(imagedata, 0, 0);
            this.cZMode = "zoom"; //by default

            this.zoom = function () {
                var imgCanvas = canvas,
                    scale = 1,
                    scaleFactor = 0.01,
                    zoomMode = "in";

                var zoomCtx = function (scalemode, scaleTo, restTo) {
                    if (scalemode === "in") {
                        scale += (scaleTo || scaleFactor);
                    } else if (scalemode === "out") {
                        scale -= (scaleTo || scaleFactor);
                        scale = (scale < 0) ? 0 : scale;
                    }

                    if (restTo) {
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
                    ctx.translate(transformMTR.transX, transformMTR.transY);
                    ctx.scale(transformMTR.scaleX, transformMTR.scaleY);
                    ctx.drawImage(tempCanvas, 0, 0);
                    ctx.restore();
                    redrawAnnotations(transformMTR);
                };


                return {
                    _zoomIn: function (scale) {
                        zoomCtx('in', scale);
                    },
                    _zoomOut: function (scale) {
                        zoomCtx('out', scale);
                    },
                    zoomTo: function (scale) {
                        zoomCtx('', '', scale);
                    },
                    getZoom: function () {
                        return transformMTR.scaleX;
                    },
                    resetZoom: function () {
                        zoomCtx('', '', 1);
                    }
                };

            };
            this.text = function () {
                //no need to use sepeerate canvas layer for text edit
                var textCanvas = UI.imgCanvas;
                ctx.fillStyle = "red";
                ctx.strokeStyle = "green";
                ctx.font = '15px Calibri';

                function resetEditMode() {
                    that.cZMode = "";
                    UI.editWrapper.style.display = "none";
                }

                //visible in all function module methods
                redrawAnnotations = function (T) {
                    for (var i = 0, len = annotations.length; i < len; i++) {
                        var text = annotations[i].text;
                        var x = annotations[i].x * (T.scaleX || 1) + T.transX;
                        var y = annotations[i].y * (T.scaleY || 1) + T.transY;
                        setAnnotations(text, {
                            x: x,
                            y: y
                        });
                    }
                };
                var getAnnotations = function () {
                    return annotations;
                };
                var setAnnotations = function (text, pos) {
                    ctx.fillText(text, pos.x, pos.y);
                };

                return {
                    _resetText: function (scale) {
                        resetEditMode();
                    },
                    createText: function (text, pos) {
                        var anotation = {
                            "text": text,
                            x: pos.x,
                            y: pos.y
                        };
                        annotations.push(anotation);
                        setAnnotations(text, pos);
                        return annotations.length;
                    },
                    getAll: function (scale) {
                        return getAnnotations();
                    },
                    removeText: function () {
                        //have to right
                        //idea to implement text anotation number for each annotation and delete tht with tht no.
                    }
                };


            };
            this.pan = function () {

                var panCanvas = UI.imgCanvas,
                    startPt = {
                        x: 0,
                        y: 0
                    };

                function pan(panPos, noease) {

                    if (panPos) {
                        if (!noease) {
                            var velocityX = ((panPos.x - startPt.x) - transformMTR.transX) * .05;
                            var velocityY = ((panPos.y - startPt.y) - transformMTR.transY) * .05;
                            transformMTR.transX += velocityX;
                            transformMTR.transY += velocityY;
                        } else {
                            transformMTR.transX = panPos.x;
                            transformMTR.transY = panPos.y;
                        }
                    } else {
                        transformMTR.transX = 0;
                        transformMTR.transY = 0;
                    }
                    ctx.save();
                    ctx.clearRect(0, 0, width, height);
                    ctx.translate(transformMTR.transX, transformMTR.transY);
                    ctx.scale(transformMTR.scaleX, transformMTR.scaleY);
                    ctx.drawImage(tempCanvas, 0, 0);
                    ctx.restore();
                    redrawAnnotations(transformMTR);
                }

                return {
                    panTo: function (pos, noease) {
                        pan(pos, noease);
                    },
                    panStart: function (pos) {
                        startPt.x = pos.x - transformMTR.transX;
                        startPt.y = pos.y - transformMTR.transY;
                    },
                    resetPan: function () {
                        pan(0);
                    },
                    getPan: function () {
                        return {
                            x: transformMTR.transX,
                            y: transformMTR.transY
                        };
                    }
                };

            };
            return this;

        },
        events: function (uiObj, Fn) {

            var UI = uiObj,
                fn = Fn;
            var wrapper = UI.wrapper,
                canvas = UI.imgCanvas,
                textCanvas = UI.textCanvas;

            var fn_text = fn.text();
            var fn_pan = fn.pan();
            var fn_zoom = fn.zoom();


            var _eventHandlers = {};

            function addEvent(node, event, handler, capture) {
                if (!(node in _eventHandlers)) {
                    // _eventHandlers stores references to nodes
                    _eventHandlers[node] = {};
                }
                if (!(event in _eventHandlers[node])) {
                    // each entry contains another entry for each event type
                    _eventHandlers[node][event] = [];
                }
                // capture reference
                _eventHandlers[node][event].push([handler, capture]);
                node.addEventListener(event, handler, capture);
            }


            function removeAllEvents(node, event) {
                if (node in _eventHandlers) {
                    var handlers = _eventHandlers[node];
                    if (event in handlers) {
                        var eventHandlers = handlers[event];
                        for (var i = eventHandlers.length; i--;) {
                            var handler = eventHandlers[i];
                            node.removeEventListener(event, handler[0], handler[1]);
                        }
                    }
                }
            }


            function noDefault() {
                e.preventDefault();
            }

            function handle_E_start(e) {
                e.preventDefault();
                var eva = isTouch ? e.touches[0] : e;
                return eva;
            }

            function handle_E_end(e) {

            }

            function handle_E_move(e) {

            }

            function gestureStart(e) {
                //(e);			 
            }

            function gestureChange(e) {
                e.preventDefault();

            }

            function gestureEnd(e) {
                //(e);			
            }


            var events_fns = {
                e_common: function () {
                    addEvent(canvas, start_EV, handle_E_start, false);
                    addEvent(canvas, end_EV, handle_E_start, false);
                    addEvent(canvas, move_EV, handle_E_move, false);
                },
                e_zoom: function () {

                    var zoomInBtn = UI.zoomIn,
                        zoomOutBtn = UI.zoomOut;

                    var zoomInInterval, zoomOutInterval;

                    function setModeZoom() {

                        fn_text._resetText();
                        //maintain the pan value

                        fn.cZMode = "zoom";
                    }

                    function resetZoomMode() {
                        canvas.style.cursor = "default";
                        removeAllEvents(canvas, start_EV);
                    }


                    function zoomInFn(e) {
                        e.preventDefault();

                        canvas.style.cursor = '-moz-zoom-in';
                        canvas.style.cursor = '-webkit-zoom-in';
                        canvas.style.cursor = 'zoom-in';

                        removeAllEvents(canvas, start_EV);
                        addEvent(canvas, start_EV, zoomInFn, false);

                        if (fn.cZMode !== "zoom") {
                            setModeZoom();
                        }
                        zoomInInterval = setInterval(function () {
                            fn_zoom._zoomIn();
                        }, 1000 / 60);
                        //fn_zoom._zoomIn()						
                    }

                    function zoomOutFn(e) {
                        e.preventDefault();

                        canvas.style.cursor = '-moz-zoom-out';
                        canvas.style.cursor = '-webkit-zoom-out';
                        canvas.style.cursor = 'zoom-out';

                        removeAllEvents(canvas, start_EV);
                        addEvent(canvas, start_EV, zoomOutFn, false);

                        if (fn.cZMode !== "zoom") {
                            setModeZoom();
                        }
                        zoomOutInterval = setInterval(function () {
                            fn_zoom._zoomOut();
                        }, 1000 / 60);
                    }

                    function zoomStop(e) {
                        e.preventDefault();
                        clearInterval(zoomInInterval);
                        clearInterval(zoomOutInterval);
                    }

                    zoomInBtn.addEventListener(start_EV, zoomInFn, false);
                    zoomInBtn.addEventListener(end_EV, zoomStop, false);

                    zoomOutBtn.addEventListener(start_EV, zoomOutFn, false);
                    zoomOutBtn.addEventListener(end_EV, zoomStop, false);


                    wrapper.addEventListener(end_EV, zoomStop, false);

                    /*Gesturechanges*/

                    function zoomGesture(e) {
                        e.preventDefault();
                        var scale = e.scale;
                        //i dnt even knw whts this , some optimization calc:Please feel free to optimize the gesture scale values
                        if (scale > 1) {
                            scale = (scale - 1) / 50;
                            fn_zoom._zoomIn(scale);
                        } else {
                            scale = 1 - (scale * 100);
                            fn_zoom._zoomOut(scale);
                        }
                    }

                    addEvent(canvas, "gesturestart", gestureStart, false);
                    // gestures to handle pinch
                    addEvent(canvas, 'gestureend', gestureEnd, false);
                    // don't let a gesturechange event propagate
                    addEvent(canvas, 'gesturechange', zoomGesture, true);


                },
                e_text: function () {
                    var that = this,
                        editBtn = UI.edit,
                        editWrapper = UI.editWrapper,
                        editDone = UI.editDone,
                        editText = UI.editText,
                        editCancel = UI.editCancel,
                        editPos = {
                            x: 0,
                            y: 0
                        };

                    function setEditPos(e) {
                        if (fn.cZMode === "text") {
                            var eva = handle_E_start(e);
                            editPos.x = eva.pageX - wrapper.offsetLeft;
                            editPos.y = eva.pageY - wrapper.offsetTop;
                            editWrapper.style.left = editPos.x + "px";
                            editWrapper.style.top = editPos.y + "px";
                            editWrapper.style.display = "block";
                        } else {
                            removeAllEvents(canvas, start_EV);
                        }
                    }

                    function setEditmode() {
                        //add edit text in zoom mode later
                        fn_zoom.resetZoom();
                        fn_pan.resetPan();
                        fn.cZMode = "text";
                        canvas.style.cursor = "default";

                        removeAllEvents(canvas, start_EV);
                        addEvent(canvas, start_EV, setEditPos, false);
                    }

                    function addText() {
                        var value = editText.value;
                        if (value) {
                            fn_text.createText(value, editPos);
                        }
                        editWrapper.style.display = "none";
                        editText.value = "";
                    }

                    function hideEditWrapper() {
                        editWrapper.style.display = "none";
                        editText.value = "";
                    }
                    editBtn.addEventListener(start_EV, setEditmode, false);
                    editDone.addEventListener(start_EV, addText, false);
                    editCancel.addEventListener(start_EV, hideEditWrapper, false);
                },
                e_pan: function () {
                    var panBtn = UI.pan,
                        panPos = {
                            x: 0,
                            y: 0
                        },
                        panstart = false,
                        panInterval = 0;

                    function startPan(e) {
                        clearInterval(panInterval);
                        if (fn.cZMode === "pan") {
                            panstart = true;

                            panPos.x = e.pageX - UI.parent.offsetLeft;
                            panPos.y = e.pageY - UI.parent.offsetTop;
                            fn_pan.panStart(panPos);
                            panInterval = setInterval(function () {
                                fn_pan.panTo(panPos);
                            }, 1000 / 60);
                        } else {
                            resetPanMode(e);
                        }
                    }

                    function doPan(e) {
                        if (panstart) {
                            var eva = handle_E_start(e);
                            panPos.x = (eva.pageX - UI.parent.offsetLeft);
                            panPos.y = (eva.pageY - UI.parent.offsetTop);
                        }
                    }

                    function endPan(e) {
                        panstart = false;
                        clearInterval(panInterval);
                    }

                    function setPanMode(e) {

                        //remove all events
                        resetPanMode();
                        fn_text._resetText();

                        fn.cZMode = "pan";

                        //add pan events
                        addEvent(canvas, start_EV, startPan, false);
                        addEvent(canvas, move_EV, doPan, false);
                        addEvent(canvas, end_EV, endPan, false);

                        canvas.style.cursor = "move";
                    }

                    function resetPanMode() {
                        //fn.cZMode = "";				
                        removeAllEvents(canvas, start_EV);
                        removeAllEvents(canvas, move_EV);
                        removeAllEvents(canvas, end_EV);

                        canvas.style.cursor = "default";
                    }

                    panBtn.addEventListener(start_EV, setPanMode, false);
                }
            };

            //call all the event bind functions
            var eventsObj = {
                zoom: events_fns.e_zoom(),
                text: events_fns.e_text(),
                pan: events_fns.e_pan()
            }

            return {
                zoom: fn_zoom,
                text: fn_text,
                pan: fn_pan,
                events: eventsObj
            };
        }

    };

    // main __InitApp__
    var cZoom = function (ele, imgsrc, options) {

        var cThis = this,
            image = new Image(), //$("<img />"); for cross domain images			
            wrapper = typeof ele === 'object' ? ele : doc.getElementById(ele);
        image.onload = function () {
            initApp(this);
        };
        image.src = imgsrc;

        /*
		*^^^^^^Options^^^^^^^*
		 
		#text color , font
		#canvas border
		#
		*/

        function initApp(imgData) {
            var new_UI = modules.ui(wrapper, imgData);
            var new_Fn = modules.fn(new_UI);
            var new_Event = modules.events(new_UI, new_Fn);

            //Public methods:

            var zoomMethods = new_Event.zoom;
            var textMethods = new_Event.text;
            var panMethods = new_Event.pan;
            var eventMethods = new_Event.events;

            //zoom
            //setZoom();
            //getZoom();
            //resetZoom();	
            cThis.setZoom = function (val) {
                return zoomMethods.zoomTo(val);
            };
            cThis.getZoom = function () {
                return zoomMethods.getZoom();
            };
            cThis.resetZoom = function () {
                return zoomMethods.resetZoom();
            };

            //text
            //getAnnotations();
            //createAnnotation();
            //#__# deleteAnnotation();			
            cThis.getAnnotations = function () {
                return textMethods.getAll();
            };
            cThis.createAnnotation = function (text, pos) {
                zoomMethods.resetZoom();
                textMethods.createText(text, pos);
            };
            cThis.deleteAnnotation = function () {
                return textMethods.removeText();
            };

            //text
            //getPan();
            //setPan();
            //resetPan();			
            cThis.getPan = function () {
                return panMethods.getPan();
            };
            cThis.setPan = function (pos) {
                panMethods.panTo(pos, "noease");
            };
            cThis.resetPan = function () {
                panMethods.resetPan();
            };

            //destroy
            cThis.destroy = function () {

            };
            cThis.resetAll = function () {
                //delete annotations : have to work
                panMethods.resetPan();
                zoomMethods.resetZoom();
            }

        }

    };

    if (!window.cZoom) {
        window.cZoom = cZoom;
    }

    //END
})(window, document);