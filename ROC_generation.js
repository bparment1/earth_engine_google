/**
 * Receiver Operating Characteristic (ROC) curve for binary classification
 * source: https://groups.google.com/d/msg/google-earth-engine-developers/52ASlA15yLg/E3exyfyTGQAJ
 * original code by Guy Ziv
**/


var urban = /* color: #ff0000 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-121.84078216552734, 37.244541608166976]),
            {
              "class": 3,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.81571960449219, 37.2456348218214]),
            {
              "class": 3,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.7915153503418, 37.24303841349834]),
            {
              "class": 3,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.76782608032227, 37.22909827137477]),
            {
              "class": 3,
              "system:index": "3"
            })]),

agri = /* color: #0ee600 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-121.7178726196289, 37.19006583685819]),
            {
              "class": 1,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.72293663024902, 37.19047608998972]),
            {
              "class": 1,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.72774314880371, 37.19184358433035]),
            {
              "class": 1,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.73409461975098, 37.187604271262224]),
            {
              "class": 1,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.74001693725586, 37.18787778251309]),
            {
              "class": 1,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([-121.71152114868164, 37.183091192606184]),
            {
              "class": 1,
              "system:index": "5"
            })]);
            
            


// A random image
var ndvi = ee.Image("LANDSAT/LC8_L1T_TOA/LC80440342013106LGN01").normalizedDifference(['B5', 'B4']).rename('NDVI');
Map.addLayer(ndvi,{min:0, max:1}, "NDVI")

// Sample input points: Extract max value of NDVI for each feature and add field
agri = ndvi.reduceRegions(agri,
                          ee.Reducer.max().setOutputs(['ndvi']),30).map(function(x){return x.set('is_target',1);})
urban = ndvi.reduceRegions(urban,ee.Reducer.max().setOutputs(['ndvi']),30).map(function(x){return x.set('is_target',0);})

print("agri", agri);
print("urban", urban);

var combined = agri.merge(urban)
print("Cobmined:",combined)
// Show NDVI of points
print(agri.aggregate_array('ndvi'),'Ag NDVI')
print(urban.aggregate_array('ndvi'),'Urban NDVI')

// Calculate the Receiver Operating Characteristic (ROC) curve
// -----------------------------------------------------------

// Chance these as needed
var ROC_field = 'ndvi', ROC_min = 0, ROC_max = 1, ROC_steps = 1000, ROC_points = combined

// Note that ROC_field sets the name corresponding to the index

print("Print ROC_points object: ",ROC_points)
//generate a sequence with start, end, steps, count
var threshold_seq = ee.List.sequence(ROC_min, ROC_max, null, ROC_steps) //note 
print("Testing threshold_seq: ",threshold_seq)

var target_roc_test = ROC_points.filterMetadata('is_target','equals',1)
print("target_roc_test: ",target_roc_test)
print("target_roc_test size: ",target_roc_test.size())

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
      vAxis: { title: 'True-negative-rate'},
      lineWidth: 1}))
// find the cutoff value whose ROC point is closest to (0,1) (= "perfect classification")      
var ROC_best = ROC.sort('dist').first().get('cutoff').aside(print,'best ROC point cutoff')