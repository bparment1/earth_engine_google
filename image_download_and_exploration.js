//Exploration script to downoload landsat data
//Author: Benoit Parmnetier
//Date created: 08/15/2017
//Date modified: 08/2017


var imageVisParam = {"opacity":1,"bands":["B1","B2","B3"],"gamma":1};

//Set region of interest
var geometry = ee.Geometry.Rectangle([-80.25834, 35.56247, -74.74974, 39.80676]);

var img_collection = ee.ImageCollection("LANDSAT/LT5_L1T_32DAY_TOA");

var reference = img_collection.filterDate('2001-01-01', '2010-12-31')
  // Sort chronologically in descending order.
  .sort('system:time_start', false);

// Compute the mean of the first 10 years.
var mean = reference.mean();
// Convert the collection to a list and get the number of images.
var size = reference.toList(100).length();
//var size = reference.toList().length();

print('Number of images: ', size);

var img_collection = img_collection.filterDate('2000-01-01', '2001-01-01');
// Define reference conditions from the first 10 years of data.
  
var img_collection = img_collection.filterBounds(geometry);
var reference = reference.filterBounds(geometry);

// Get the date range of images in the collection.
var dates = ee.List(img_collection.get('date_range'));
var dateRange = ee.DateRange(dates.get(0), dates.get(1));
print('Date range: ', dateRange);

var list_img = img_collection.toList(100);
list_img[0];

var image = ee.Image(ee.List(list_img).get(0)); //#select first image
var image1 = ee.Image(ee.List(list_img).get(1));

var image3 = ee.Image(ee.List(list_img).get(2));
            

print("image:",image)
print("img_collection:",img_collection);
print("reference:",reference); //this hsould have 10 years 
print("polygon of region:",geometry);

//var centroid = polygon.centroid();
var centroid= geometry.centroid();

// Center the map on the image.
Map.setCenter(centroid,9)
Map.centerObject(img_collection, 9);
Map.centerObject(img_collection);

//Map.setCenter(-77, 37, 9);

// Display the image.
Map.addLayer(img_collection);
Map.addLayer(reference);

///// End of script ////