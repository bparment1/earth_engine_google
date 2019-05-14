/**
 * Research Support SESYNC.
 * ROC assessment of crop consensus layer by Varsha Vijay
 * Created: 05/07/2019
 * Modified 05/08/2019
 * 
 * Authors: Benoit Parmentier, Varsha Vijay
 * 
 * This code generates an ROC table used in plotting the ROC figure.
 * The input is the crop consensus layer generated by Varsha Vijay.
 * 
 * Original code by Guy Ziv: see original at:
 * source: https://groups.google.com/d/msg/google-earth-engine-developers/52ASlA15yLg/E3exyfyTGQAJ
 * 
**/


/********* INPUT PARAMETERS AND ARGUMENTS *************/

var validation = "users/varshavijay101/croploctraingeowiki"

// A crop consensus image
var crop1k = ee.Image("users/varshavijay101/AgricultureBiodiversity/cropfinal1km")
// validatation data from geowiki as a feature collection object
var cropbinary = ee.FeatureCollection(validation)

/********** START OF SCRIPT ************/

// Visualize the input map
Map.addLayer(crop1k,{min:0, max:1}, "crop1k")
// Check validation
print("Validation input: ",cropbinary)
//Map.addLayer(cropbinary,{color: 'FF0000'})
Map.addLayer(cropbinary,{color: 'blue'})

var addImgvalue = function(feature) {
  var cropclass= crop1k.reduceRegion({
    reducer: ee.Reducer.first(),
    geometry: feature.geometry(),
    scale: 928
  });
  return feature.set({'cropclass': cropclass.get('b1')});
};

// Extraction for image for every feature in FeatureCollection
var cropvalidation=cropbinary.map(addImgvalue)
//print(cropvalidation.first())
//print(cropbinary.first())
//////////////add classification values to the point valdiataion data

/**
var extractImgvalue = function(feature,img) {
  
  var cropclass= ee.Image(img).reduceRegion({
    reducer: ee.Reducer.first(),
    geometry: feature.geometry(),
    scale: 928
  });
  return feature.set({'cropclass': cropclass.get('b1')});
};

var cropvalidation=cropbinary.map(extractImgvalue,cropbinary)
**/

print("Crop validation: ", cropvalidation)

// add field is_target

//var function featureadd
//cropvalidation.set({'is_target':cropvalidation.set{'cropmaj'})

print("Crop validation: ", cropvalidation)



// add field is_target

//var function featureadd
//cropvalidation.set({'is_target':cropvalidation.set{'cropmaj'})

// Add is target feature.
var addFeature = function(feature){
  return feature.set({'is_target':feature.get('cropmaj')})
};

var cropvalidation=cropvalidation.map(addFeature)

print("Crop validation added cropmaj: ", cropvalidation)
  
// Sample input points.
//agri = ndvi.reduceRegions(agri,ee.Reducer.max().setOutputs(['ndvi']),30).map(function(x){return x.set('is_target',1);})
//urban = ndvi.reduceRegions(urban,ee.Reducer.max().setOutputs(['ndvi']),30).map(function(x){return x.set('is_target',0);})
//var combined = agri.merge(urban)

// Calculate the Receiver Operating Characteristic (ROC) curve
// -----------------------------------------------------------

// Chance these as needed
var ROC_field = 'cropclass', ROC_min = 0, ROC_max = 1, ROC_steps = 100, ROC_points = cropvalidation

// Note that ROC_field sets the name corresponding to the index

print("Print ROC_points object: ",ROC_points)
//generate a sequence with start, end, steps, count
var threshold_seq = ee.List.sequence(ROC_min, ROC_max, null, ROC_steps) //note 
print("Testing threshold_seq: ",threshold_seq)

var target_roc_test = ROC_points.filterMetadata('is_target','equals',1)
print("target_roc_test: ",target_roc_test)
print("target_roc_test size: ",target_roc_test.size())
var target_roc_negative = ROC_points.filterMetadata('is_target','equals',0)
print("target_roc_test size: ",target_roc_negative.size())

//test one specific threshold value at 0.5

var cutoffVal = 0.5
var TPR = ee.Number(target_roc_test.filterMetadata(ROC_field,'greater_than',cutoffVal).size()).divide(target_roc_test.size()) 
print("Threshold 0.5 TPR:",TPR)

// producing ROC_table 
var ROC = ee.FeatureCollection(ee.List.sequence(ROC_min, ROC_max, null, ROC_steps).map(function (cutoff) {
  var target_roc = ROC_points.filterMetadata('is_target','equals',1)
  // true-positive-rate, sensitivity  
  var TPR = ee.Number(target_roc.filterMetadata(ROC_field,'greater_than',cutoff).size()).divide(target_roc.size()) 
  var non_target_roc = ROC_points.filterMetadata('is_target','equals',0)
  // true-negative-rate, specificity  
  var TNR = ee.Number(non_target_roc.filterMetadata(ROC_field,'less_than',cutoff).size()).divide(non_target_roc.size()) 
  return ee.Feature(null,{cutoff: cutoff, TPR: TPR, TNR: TNR, FPR:TNR.subtract(1).multiply(-1),  dist:TPR.subtract(1).pow(2).add(TNR.subtract(1).pow(2)).sqrt()})
}))

print("produced ROC: ",ROC)
print("Type: ",typeof(ROC))


// Use trapezoidal approximation for area under curve (AUC)
var X = ee.Array(ROC.aggregate_array('FPR')), 
    Y = ee.Array(ROC.aggregate_array('TPR')), 
    Xk_m_Xkm1 = X.slice(0,1).subtract(X.slice(0,0,-1)),
    Yk_p_Ykm1 = Y.slice(0,1).add(Y.slice(0,0,-1)),
    AUC = Xk_m_Xkm1.multiply(Yk_p_Ykm1).multiply(0.5).reduce('sum',[0]).abs().toList().get(0)
print(AUC,'Area under curve')
// Plot the ROC curve
print(ui.Chart.feature.byFeature(ROC, 'FPR', 'TPR').setOptions({
      title: 'ROC curve',
      legend: 'none',
      hAxis: { title: 'False-positive-rate'},
      vAxis: { title: 'True-positive-rate'},
      lineWidth: 1}))
// find the cutoff value whose ROC point is closest to (0,1) (= "perfect classification")      
var ROC_best = ROC.sort('dist').first().get('cutoff').aside(print,'best ROC point cutoff')

//compute Recall and precision:

//recall: is TPR

//precision is Positive Predictive value


/****************** END OF SCRIPT *******************************/