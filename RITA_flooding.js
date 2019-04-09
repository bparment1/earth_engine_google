var site1 = ee.FeatureCollection("users/benoitparmentier/class1_sites");
var image = ee.Image("users/benoitparmentier/flooding_RITA/mosaiced_MOD09A1_A2005265__006_reflectance_masked_RITA_reg_1km");
var scale = image.projection().nominalScale();
print('Spatial resolution', scale);
print('Projection, crs, and crs_transform:', image.projection());

// Get a list of all metadata properties.
var properties = image.propertyNames();
print('Metadata properties: ', properties); // ee.List of metadata properties

Map.addLayer(image);
/* Center the map on the image and set the zoom level to 9*/
Map.centerObject(image, 9);
Map.addLayer(site1, {}, 'default display');

var site1_mean = image.reduceRegions({
  collection: site1,
  reducer: ee.Reducer.mean(),
  scale:1
});

// Load input imagery: Landsat 7 5-year composite.
//var image = ee.Image('LANDSAT/LE7_TOA_5YEAR/2008_2012');

// Load a FeatureCollection of counties in Maine.
//var maineCounties = ee.FeatureCollection('ft:1S4EB6319wWW2sWQDPhDvmSBIVrD3iEmCLYB7nMM')
//  .filter(ee.Filter.eq('StateName', 'Maine'));

// Add reducer output to the Features in the collection.
//var maineMeansFeatures = image.reduceRegions({
//  collection: maineCounties,
//  reducer: ee.Reducer.mean(),
//  scale: 30,
//});

// Print the first feature, to illustrate the result.
//print(ee.Feature(maineMeansFeatures.first()).select(image.bandNames()));
    
//https://developers.google.com/earth-engine/reducers_reduce_to_vectors

// Convert the zones of the thresholded nightlights to vectors.
//var vectors = zones.addBands(nl2012).reduceToVectors({
//  geometry: japan,
//  crs: nl2012.projection(),
//  scale: 1000,
//  geometryType: 'polygon',
//  eightConnected: false,
//  labelProperty: 'zone',
//  reducer: ee.Reducer.mean()
//});

