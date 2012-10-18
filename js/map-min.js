SOTE.namespace("SOTE.widget.Map");SOTE.widget.Map.prototype=new SOTE.widget.Component;SOTE.widget.Map=function(containerId,config){this.container=document.getElementById(containerId);if(this.container==null){this.setStatus("Error: element '"+containerId+"' not found!",true);return}this.containerId=containerId;this.id=containerId;this.DEFAULT_OVERLAY_OPACITY=0.95;var currentDate=new Date();var gibsStartDate=new Date(2012,4,7,0,0,0,0);var numDaysToGenerate=(currentDate.getTime()-gibsStartDate.getTime())/(24*60*60*1000)+1;this.NUM_DAYS_TO_GENERATE=Math.round(numDaysToGenerate);this.RESOLUTIONS_ON_SCREEN_GEO_ALL=[0.5625,0.28125,0.140625,0.0703125,0.03515625,0.017578125,0.0087890625,0.00439453125,0.002197265625];this.RESOLUTIONS_ON_SCREEN_POLAR_ALL=[8192,4096,2048,1024,512,256];this.RESOLUTIONS_ON_SERVER_GEO_250m=[0.5625,0.28125,0.140625,0.0703125,0.03515625,0.017578125,0.0087890625,0.00439453125,0.002197265625];this.RESOLUTIONS_ON_SERVER_POLAR_250m=[8192,4096,2048,1024,512,256];this.TILEMATRIXSET_GEO_250m="EPSG4326_250m";this.RESOLUTIONS_ON_SERVER_GEO_500m=[0.5625,0.28125,0.140625,0.0703125,0.03515625,0.017578125,0.0087890625,0.00439453125];this.RESOLUTIONS_ON_SERVER_POLAR_500m=[8192,4096,2048,1024,512];this.TILEMATRIXSET_GEO_500m="EPSG4326_500m";this.RESOLUTIONS_ON_SERVER_GEO_1km=[0.5625,0.28125,0.140625,0.0703125,0.03515625,0.017578125,0.0087890625];this.RESOLUTIONS_ON_SERVER_POLAR_1km=[8192,4096,2048,1024];this.TILEMATRIXSET_GEO_1km="EPSG4326_1km";this.RESOLUTIONS_ON_SERVER_GEO_2km=[0.5625,0.28125,0.140625,0.0703125,0.03515625,0.017578125];this.RESOLUTIONS_ON_SERVER_POLAR_2km=[8192,4096,2048];this.TILEMATRIXSET_GEO_2km="EPSG4326_2km";if(config===undefined){config={}}if(config.hasControls===undefined){config.hasControls=true}if(config.isSelectable===undefined){config.isSelectable=false}if(config.bbox===undefined){var curHour=new Date().getUTCHours();if(curHour<9){curHour=0}var minLon=20.6015625+curHour*(-200.53125/23);var maxLon=minLon+159.328125;config.bbox=minLon.toString()+",-46.546875,"+maxLon.toString()+",53.015625"}if(config.dataSourceUrl===undefined){config.dataSourceUrl=null}if(config.maxWidth===undefined){config.maxWidth=null}if(config.maxHeight===undefined){config.maxHeight=null}if(config.layers===undefined){config.layers=null}if(config.time===undefined){config.time=new Date();config.time=config.time.getUTCFullYear()+"-"+SOTE.util.zeroPad(eval(config.time.getUTCMonth()+1),2)+"-"+SOTE.util.zeroPad(config.time.getUTCDate(),2)+"T"+SOTE.util.zeroPad(config.time.getUTCHours(),2)+":"+SOTE.util.zeroPad(config.time.getUTCMinutes(),2)+":"+SOTE.util.zeroPad(config.time.getUTCSeconds(),2)}if(config.baselayer===undefined){config.baselayer=null}this.hasControls=config.hasControls;this.isSelectable=config.isSelectable;this.bbox=config.bbox;this.value="";this.register=config.register;this.maxWidth=config.maxWidth;this.maxHeight=config.maxHeight;this.dataSourceUrl=config.dataSourceUrl;this.statusStr="";this.disabled=false;this.time=config.time;this.baseLayer=config.baseLayer;this.graticule=null;this.projection="EPSG:4326";this.init();if(REGISTRY){REGISTRY.register(this.id,this)}else{alert("No REGISTRY found!  Cannot register Map!")}this.isSoteMapDataCached=false;this.updateComponent("");if((this.time!=null)&&(this.baseLayer!=null)){this.activateRelevantLayersDisableTheRest([this.baseLayer],this.time)}this.setExtent(this.bbox);if(REGISTRY){REGISTRY.markComponentReady(this.id)}};SOTE.widget.Map.prototype.handleMapMoveEnd=function(b){var a=b.object.getExtent().transform(b.object.getProjectionObject(),new OpenLayers.Projection(this.projection)).toString();this.setValue(a);this.fire()};SOTE.widget.Map.prototype.activateRelevantLayersDisableTheRest=function(activeProductNames,time){var allLayers=this.getAllLayers();var nLayers=allLayers.length;var myDate=SOTE.util.UTCDateFromISO8601String(time);time=myDate.getUTCFullYear()+"-"+SOTE.util.zeroPad(eval(myDate.getUTCMonth()+1),2)+"-"+SOTE.util.zeroPad(myDate.getUTCDate(),2);for(var i=0;i<nLayers;i++){var isLayerFound=false;for(var j=0;j<activeProductNames.length;j++){if((allLayers[i].name==new String(activeProductNames[j]+"__"+time))||(allLayers[i].name==new String(activeProductNames[j]))){allLayers[i].setVisibility(true);isLayerFound=true;if(j==0){this.map.setLayerZIndex(allLayers[i],0);allLayers[i].setOpacity(1)}else{if(this.checkWmsParam(allLayers[i].metadata.preferredOpacity)){allLayers[i].setOpacity(allLayers[i].metadata.preferredOpacity)}else{allLayers[i].setOpacity(this.DEFAULT_OVERLAY_OPACITY)}if(activeProductNames.length>2){this.map.setLayerZIndex(allLayers[i],nLayers-j)}}}}if(!isLayerFound){allLayers[i].setVisibility(false)}}};SOTE.widget.Map.prototype.init=function(){this.container.innerHTML="";var d=function(){window.scrollTo(0,0);document.body.style.height="100%";if(!(/(iphone|ipod)/.test(navigator.userAgent.toLowerCase()))){if(document.body.parentNode){document.body.parentNode.style.height="100%"}}};setTimeout(d,700);setTimeout(d,1500);this.map=document.createElement("div");this.map.setAttribute("id",this.id+"map");this.container.appendChild(this.map);if(this.projection=="EPSG:4326"){this.map=new OpenLayers.Map({div:this.containerId,theme:null,controls:[],maxExtent:new OpenLayers.Bounds(-180,-1350,180,90),projection:this.projection,numZoomLevels:9,fractionalZoom:false,resolutions:this.RESOLUTIONS_ON_SCREEN_GEO_ALL,allOverlays:true,zoom:2})}else{this.map=new OpenLayers.Map({div:this.containerId,theme:null,controls:[],maxExtent:new OpenLayers.Bounds(-4194304,-4194304,4194304,4194304),projection:this.projection,resolutions:this.RESOLUTIONS_ON_SCREEN_POLAR_ALL,allOverlays:true,zoom:2,units:"m",numZoomLevels:6,})}if(this.hasControls){var b=new OpenLayers.Control.ZoomIn();b.title="zoom in";b.displayClass="olControlZoomInCustom";b.id="zoomInCustomId";var c=new OpenLayers.Control.ZoomOut();c.title="zoom out";c.displayClass="olControlZoomOutCustom";c.id="zoomOutCustomId";var a=new OpenLayers.Control.Panel();a.displayClass="olControlZoomPanelCustom";a.addControls(b);a.addControls(c);this.map.addControl(a);this.map.addControl(new OpenLayers.Control.Navigation({dragPanOptions:{enableKinetic:true}}));this.map.addControl(new OpenLayers.Control.Attribution());this.map.addControl(new OpenLayers.Control.ScaleLine({displayClass:"olControlScaleLineCustom"}));this.addGraticuleLayer();var e=this.map.getControlsByClass("OpenLayers.Control.Navigation")[0];e.handlers.wheel.interval=100;e.handlers.wheel.cumulative=false}if(this.isSelectable){this.map.addControl(new OpenLayers.Control.ZoomBox())}if(this.projection=="EPSG:4326"){var f=new OpenLayers.Bounds.fromString("-230, -120, 230, 120",false).transform(new OpenLayers.Projection(this.projection),this.map.getProjectionObject());this.map.restrictedExtent=f}else{this.map.restrictedExtent=new OpenLayers.Bounds.fromString("-6500000,-5000000,6500000,5000000")}if((this.time!=null)&&(this.baseLayer!=null)&&(this.map.layers.length>0)){this.activateRelevantLayersDisableTheRest([this.baseLayer],this.time)}if(this.isSoteMapDataCached){if(this.projection=="EPSG:4326"){this.setExtent("-146.390625,-93.921875,146.390625,93.953125",true);this.fire()}else{this.setExtent("-4194304,-4194304,4194304,4194304",true);this.fire()}}this.map.events.register("moveend",this,this.handleMapMoveEnd)};SOTE.widget.Map.prototype.checkWmsParam=function(a){if((a===undefined)||(a==null)||(a=="")){return false}return true};SOTE.widget.Map.prototype.addLayers=function(d){for(var b=0;b<d.length;b++){if(!this.checkWmsParam(d[b].displayName)){d[b].displayName="unnamed"}if(!this.checkWmsParam(d[b].time)){d[b].time=""}if(!this.checkWmsParam(d[b].format)){d[b].format="image/jpeg"}if(!this.checkWmsParam(d[b].transparent)){d[b].transparent=true}if(!this.checkWmsParam(d[b].projection)){d[b].projection=this.projection}if(!this.checkWmsParam(d[b].numZoomLevels)){d[b].numZoomLevels=(this.projection=="EPSG:4326")?9:6}if(!this.checkWmsParam(d[b].maxExtent)){d[b].maxExtent=(this.projection=="EPSG:4326")?[-180,-1350,180,90]:[-4194304,-4194304,4194304,4194304]}if(!this.checkWmsParam(d[b].maxResolution)){d[b].maxResolution=(this.projection=="EPSG:4326")?0.5625:8192}if(!this.checkWmsParam(d[b].preferredOpacity)){d[b].preferredOpacity=this.DEFAULT_OVERLAY_OPACITY}if(!this.checkWmsParam(d[b].bringToFront)){d[b].bringToFront=false}if(!this.checkWmsParam(d[b].transitionEffect)){d[b].transitionEffect="resize"}if(!this.checkWmsParam(d[b].resolutions)){if(d[b].projection=="EPSG:4326"){d[b].resolutions=this.RESOLUTIONS_ON_SCREEN_GEO_ALL}else{d[b].resolutions=this.RESOLUTIONS_ON_SCREEN_POLAR_ALL}}if(!this.checkWmsParam(d[b].serverResolutions)){if(d[b].projection=="EPSG:4326"){d[b].serverResolutions=this.RESOLUTIONS_ON_SERVER_GEO_250m}else{d[b].serverResolutions=this.RESOLUTIONS_ON_SERVER_POLAR_250m}}if(!this.checkWmsParam(d[b].tileMatrixSet)){if(d[b].projection=="EPSG:4326"){d[b].tileMatrixSet=this.TILEMATRIXSET_GEO_250m}else{d[b].tileMatrixSet=this.TILEMATRIXSET_POLAR_250m}}if(!this.checkWmsParam(d[b].urls)){alert("invalid / no URL passed in for layer "+d[b].displayName);continue}if(!this.checkWmsParam(d[b].wmsProductName)){alert("invalid / unspecified WMS 'layer' parameter");continue}if(!this.checkWmsParam(d[b].tileSize)){var c=new OpenLayers.Layer.WMS(d[b].displayName,d[b].urls,{layers:d[b].wmsProductName,format:d[b].format,transparent:d[b].transparent,},{isBaseLayer:false,visibility:false,transitioneffect:d[b].transitionEffect,projection:d[b].projection,tileSize:new OpenLayers.Size(512,512),metadata:{preferredOpacity:d[b].preferredOpacity,bringToFront:d[b].bringToFront}});if(this.checkWmsParam(d[b].time)){c.mergeNewParams({time:d[b].time})}this.map.addLayer(c)}else{if(this.projection!="EPSG:4326"){this.map.addLayer(new OpenLayers.Layer.WMS(d[b].displayName,d[b].urls,{time:d[b].time,layers:d[b].wmsProductName,Format:d[b].format},{tileSize:new OpenLayers.Size(d[b].tileSize[0],d[b].tileSize[1]),buffer:0,transitionEffect:d[b].transitionEffect,projection:d[b].projection,numZoomLevels:d[b].numZoomLevels,maxExtent:new OpenLayers.Bounds(d[b].maxExtent[0],d[b].maxExtent[1],d[b].maxExtent[2],d[b].maxExtent[3]),maxResolution:d[b].maxResolution,resolutions:d[b].resolutions,serverResolutions:d[b].serverResolutions,visibility:false,metadata:{preferredOpacity:d[b].preferredOpacity,bringToFront:d[b].bringToFront}}))}else{var a=new OpenLayers.Layer.WMTS({name:d[b].displayName,url:d[b].urls,layer:d[b].wmsProductName,matrixSet:d[b].tileMatrixSet,format:d[b].format,buffer:0,style:"",opacity:d[b].preferredOpacity,transitionEffect:d[b].transitionEffect,projection:d[b].projection,numZoomLevels:d[b].numZoomLevels,maxResolution:d[b].maxResolution,resolutions:d[b].resolutions,serverResolutions:d[b].serverResolutions,visibility:false,metadata:{preferredOpacity:d[b].preferredOpacity,bringToFront:d[b].bringToFront},tileSize:new OpenLayers.Size(d[b].tileSize[0],d[b].tileSize[1]),maxExtent:new OpenLayers.Bounds(d[b].maxExtent[0],d[b].maxExtent[1],d[b].maxExtent[2],d[b].maxExtent[3]),isBaseLayer:false});a.mergeNewParams({time:d[b].time});this.map.addLayer(a)}}}if(this.graticule!=null){this.map.setLayerZIndex(this.graticule.gratLayer,this.getAllLayers().length-1)}};SOTE.widget.Map.prototype.addGraticuleLayer=function(){var a=new OpenLayers.Symbolizer.Line({strokeColor:"#AAAAAA",strokeOpacity:0.95,strokeWidth:1.35,strokeLinecap:"square",strokeDashstyle:"dot"});var b=new OpenLayers.Symbolizer.Text({fontFamily:"Gill Sans",fontSize:"16",fontWeight:"550",fontColor:"#0000e1",fontOpacity:1});this.graticule=new OpenLayers.Control.Graticule({layerName:"ol_graticule",numPoints:2,labelled:true,lineSymbolizer:a,labelSymbolizer:b});this.map.addControl(this.graticule)};SOTE.widget.Map.prototype.setValue=function(a){return this.setExtent(a)};SOTE.widget.Map.prototype.getValue=function(){return this.id+"="+this.value};SOTE.widget.Map.prototype.getAllLayers=function(){return this.map.layers};SOTE.widget.Map.prototype.loadFromQuery=function(a){return this.setValue(SOTE.util.extractFromQuery(this.id,a))};SOTE.widget.Map.prototype.validate=function(){var b=this.map.getExtent();if(b==null){this.setStatus("Could not retrieve current extent");return false}var a=b.transform(this.map.getProjectionObject(),new OpenLayers.Projection(this.projection)).toString();if((a.left<-180)||(a.right>180)||(a.top>90)||(a.bottom<-90)){this.setStatus("Current extent is out of bounds");return false}return true};SOTE.widget.Map.prototype.setDataSourceUrl=function(a){};SOTE.widget.Map.prototype.getDataSourceUrl=function(){};SOTE.widget.Map.prototype.setStatus=function(a){this.statusStr=a};SOTE.widget.Map.prototype.getStatus=function(){return this.statusStr};SOTE.widget.Map.prototype.setExtent=function(b,c){var a=new OpenLayers.Bounds.fromString(b,false).transform(new OpenLayers.Projection(this.projection),this.map.getProjectionObject());if(a==null){this.setStatus("Could not set extent");return false}if(b==this.value&&!c){return}this.value=b;this.map.zoomToExtent(a,true);return true};SOTE.widget.Map.prototype.fire=function(){if(REGISTRY){REGISTRY.fire(this)}else{alert("No REGISTRY found! Cannot fire to REGISTRY from Map!")}};SOTE.widget.Map.prototype.updateComponent=function(a){};