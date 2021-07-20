var popup;    

Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
        GeoExt: "http://localhost:8080/geoportal/first_page/libs/geoext2-2.1.0/src/GeoExt"
    }
});

Ext.require([
   
    'GeoExt.tree.OverlayLayerContainer',
    'GeoExt.tree.BaseLayerContainer',
    'GeoExt.data.LayerTreeModel',
    'GeoExt.Action'
   
]);


Ext.onReady(function() {

    Ext.QuickTips.init();

    var bounds = new OpenLayers.Bounds(
                7378396.8597878255, 6053676.388325059,
                10471939.80774844, 8749289.45984823
            );
        
    var options = {

            projection: "EPSG:3857",
            units: 'degrees',
        };
                

    var map = new OpenLayers.Map('map', options);

    
                
    var Landuse = new OpenLayers.Layer.WMS(
        "Землепользование", "http://localhost:8080/geoserver/wms",
        {
            LAYERS: 'tester:Землепользование',
            STYLES: '',
            format: 'image/png',
            tiled: true,
            transparent: true
        },
        {
        displayInLayerSwitcher: true,
        isBaseLayer: false,
        transitionEffect: 'resize'
        }
    );

    var BuildingPoligon = new OpenLayers.Layer.WMS(
        "Здания полигоны", "http://localhost:8080/geoserver/wms",
        {
            LAYERS: 'tester:Здания полигоны',
            STYLES: '',
            format: 'image/png',
            tiled: true,
            transparent: true
        },
        {
        displayInLayerSwitcher: true,
        isBaseLayer: false,
        transitionEffect: 'resize'
        }
    );

    var Autoroads = new OpenLayers.Layer.WMS(
        "Автодороги", "http://localhost:8080/geoserver/wms",
        {
            LAYERS: 'tester:Автодороги',
            STYLES: '',
            format: 'image/png',
            tiled: true,
            transparent: true
        },
        {
        displayInLayerSwitcher: true,
        isBaseLayer: false,
        transitionEffect: 'resize'
        }
    );


    var OSM_base = new OpenLayers.Layer.WMS(
                    "OSM_base", "https://ows.terrestris.de/osm/service?",
                    {
                        LAYERS: 'OSM-WMS',                           
                    },
					{ isBaseLayer: true}
                );

    map.addLayers([OSM_base, Landuse, BuildingPoligon, Autoroads]);
    map.setCenter(new OpenLayers.LonLat(8936313,7398081), 7);

    var zoomex = Ext.create('GeoExt.Action',{
        icon:"http://localhost:8080/geoportal/first_page/zoomout_16.png",
        control: new OpenLayers.Control.ZoomToMaxExtent(),
        map: map,
        text: "max extent",
        tooltip: "zoom to full extent",
        pressed: false,
        allowDepress: false,
    });
    var zoom_ex = Ext.create('Ext.Button', zoomex);

    var zoomrec = Ext.create('GeoExt.Action',{
         icon:"http://localhost:8080/geoportal/first_page/zoomrec_16.png",
         text: "Zoom Rectangle",
         control: new OpenLayers.Control.ZoomBox(),
         map: map,
         toggleGroup: 'tools', 
         allowDepress: true,
         pressed: false,
         enableToggle: true,
 
         tooltip: "zoom"
     });


 var zoom_rec = Ext.create('Ext.Button', zoomrec);

 var measure_len = Ext.create('GeoExt.Action',{
    icon:"http://localhost:8080/geoportal/first_page/measure_16.png",
     text: "Measure Length",
    control: new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
         geodesic: true,
         eventListeners: {
             measure: function(event) {
               if (event.order == 1) {
                 var win = new Ext.Window({
                     title: "Measure Results",
                     modal: true,
                     width: 180,
                     constrain: true,
                     bodyStyle: {padding: 10},
                     html: event.measure.toFixed(3) + " " + event.units
                 });
                 win.show();}
                 else{
                 var win = new Ext.Window({
                     title: "Measure Results",
                     modal: true,
                     width: 180,
                     constrain: true,
                     bodyStyle: {padding: 10},
                     html: event.measure.toFixed(3) + " " + event.units + "<sup>2</" + "sup>"
                 });
                 win.show();}
             }
         }
     }),
     map: map,
      toggleGroup: 'tools', 
     allowDepress: true,
     tooltip: "measure distance"
 });

var m_len = Ext.create('Ext.Button', measure_len);


    var info = Ext.create('GeoExt.Action',{
        tooltip: "Feature Info",
        icon:"http://localhost:8080/geoportal/first_page/getinfo_16.png",
        text: "GetInfo",
        enableToggle: true,
        allowDepress: true,
        control: new OpenLayers.Control.WMSGetFeatureInfo({
      url: "http://localhost:8080/geoserver/wms",
       title: 'Identify features by clicking',
        queryVisible: true,
        eventListeners: {
            getfeatureinfo: function(event) {
            
            if(popup) {map.removePopup(popup);}
            
                    popup = new OpenLayers.Popup.FramedCloud(
                    "chicken", 
                    map.getLonLatFromPixel(event.xy),
                    null,
                    event.text,
                    null,
                    true
                );
                
                map.addPopup(popup);
            }
        }
}),
        map: map,
        toggleGroup: 'tools'
    });
    
    var get_info = Ext.create('Ext.Button', info);


    var mapPanel = Ext.create('GeoExt.panel.Map', {
            map: map,
            region: 'center',
            stateful: true,
            tbar: [zoom_ex, 
                   zoom_rec, 
                   m_len,
                   get_info, 
                   {text: 'Current center of the map',
                    handler: function(){
                        var c = GeoExt.panel.Map.guess().map.getCenter();
                        Ext.Msg.alert(this.getText(), c.toString());}
                    },
                  ],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
            }]
        });			

    var store = Ext.create('Ext.data.TreeStore', {
            model: 'GeoExt.data.LayerTreeModel',
            root: {
                expanded: true,
                children: [
                    {
                        plugins: [{
                            ptype: 'gx_layercontainer',
                            store: mapPanel.layers
                        }],
                        expanded: true
                    }, {
                        plugins: ['gx_baselayercontainer'],
                        expanded: true,
                        text: "Base Maps"
                    }, {
                        plugins: ['gx_overlaylayercontainer'],
                        expanded: true
                    }
                ]
            }
        });

    var tree = Ext.create('GeoExt.tree.Panel', {
        border: true,
        region: "west",
        title: "Layers",
        width: 250,
        split: true,
        collapsible: true,
        autoScroll: true,
        store: store,
        rootVisible: false,
        lines: false,
    });
        
    var north = Ext.create('Ext.panel.Panel', {
            title: "<center>My First Web GIS page</center>",
            region: 'north',
            });

    var viewport = Ext.create('Ext.Viewport', {
        layout: "fit",
        hideBorders: true,
        items: {
            layout: "border",
            deferredRender: false,
            items: [mapPanel, north, tree]
        }
    });
});  
