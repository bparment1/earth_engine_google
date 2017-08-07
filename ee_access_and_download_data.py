# -*- coding: utf-8 -*-
"""
Spyder Editor

This is a temporary script file.
"""

#
#!/usr/bin/python
#
#Script to access and downlaod data from Google Earth Engine.
#Landsat composite datasets for coastal changes studies.
#
#
# TODO:
#  - list landsat filter data by date steps
#
# Authors: Benoit Parmentier 
# Created on: 07/24/2017
# Updated on: 08/07/2017

import os, glob
import subprocess
import re, zipfile
import datetime, calendar
import ftplib
#import grass.script as gs
import argparse
import shutil
from osgeo import gdal
from osgeo import ogr
from osgeo import osr
from osgeo import gdal_array
from osgeo import gdalconst

import ee
import sys
import matplotlib.pyplot as plt
#import ee.mapclient #no access

################ NOW FUNCTIONS  ###################

##------------------
# Functions used in the script 
##------------------

#script_path = "/home/bparmentier/Google Drive/Data/SESYNC/earthengine_google/scripts" #bpi 
script_path ="/home/bparmentier/z_drive/Data/projects/earthengine_google/scripts" #bps 


if script_path not in sys.path:
    sys.path.append(script_path)

### Add scripts here
#from ee_acces_and_download_data_functions_07242017.py import *
from ee_acces_and_download_data_functions_07242017 import *

########## READ AND PARSE PARAMETERS AND ARGUMENTS ######### 

#in_dir = "/home/parmentier/Data/IPLANT_project/Maine_interpolation/DSS_SSI_data/"
in_dir ="/home/bparmentier/z_drive/Data/projects/earthengine_google/outputs" 

#Input shape file used to define the zonal regions: could be town or counties in this context
shp_fname = os.path.join(in_dir,"county24.shp")
#input shp defining study area: can be the same as shp_fname or different                                       
shp_reg_outline = os.path.join(in_dir,"county24.shp")

#EPSG: http://spatialreference.org/ref/epsg/26919/proj4/ -->  

CRS_WGS84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"
#CRS_reg = "+proj=utm +zone=19 +ellps=GRS80 +datum=NAD83 +units=m +no_defs" #using EPSG 26919
CRS_reg = CRS_WGS84

file_format = ".tif"
NA_flag_val = -9999
output_type = "Float32"
out_suffix = "gee_08072017"

w_extent_str = "-72 48 -65 41" #minx,maxy (upper left), maxx,miny (lower right)
use_reg_extent = True
os.chdir(in_dir)

out_dir = in_dir

#out_path<-"/data/project/layers/commons/data_workflow/output_data"
out_dir = "output_data_"+out_suffix
out_dir = os.path.join(in_dir,out_dir)
create_dir_and_check_existence(out_dir)
        
os.chdir(out_dir)        #set working directory

########## START SCRIPT #############


#### PART I: GET EXTENT FIRST

#Read in layers from data source,there is only one layer
#reg_area_poly = ogr.Open(shp_reg_outline).GetLayer()

#if use_reg_extent==True:
#    w_extent, reg_area_poly_wgs84 = calculate_region_extent(shp_reg_outline,out_suffix_dst,CRS_dst,out_dir)
#    #w_extent= "-71.083923738042 47.4598539782516 -66.8854440488051 42.9171281482886"
#elif use_reg_extent==False:
#    w_extent = w_extent_str #this is in WGS84
#    #end if
 
##### PART II :  ##########


ee.Initialize()

#### Let's use export to Google drive option

#https://explorer.earthengine.google.com/#detail/LANDSAT%2FLT5_L1T_TOA_FMASK
#USGS Landsat 5 TOA Reflectance (Orthorectified) with Fmask
#Data availability (time)
#Jan 1, 1984 - May 5, 2012
#https://explorer.earthengine.google.com/#detail/LANDSAT%2FLT5_L1T_ANNUAL_TOA
#32 days TOA or 

# Load a landsat image and select three bands.
landsat = ee.Image('LANDSAT/LC8_L1T_TOA/LC81230322014135LGN00')
landsat.select(['B4', 'B3', 'B2'])
landsat.select(['B1'])

# Create a geometry representing an export region.
geometry = ee.Geometry.Rectangle([116.2621, 39.8412, 116.4849, 40.01236])

# Export the image, specifying scale and region.
Export.image.toDrive({
  image: landsat,
  description: 'imageToDriveExample',
  scale: 30,
  region: geometry
});

llx = 116.2621
lly = 39.8412
urx = 116.4849
ury = 40.01236
geometry = [[llx,lly], [llx,ury], [urx,ury], [urx,lly]]

geometry = ee.Geometry.Rectangle([116.2621, 39.8412, 116.4849, 40.01236])
geometry = geometry['coordinates'][0]

task_config = {
    'description': 'imageToDriveExample',
    'scale': 30,  
    'region': geometry
    }

##Export does not work with python api, need to use batch mode
task = ee.batch.Export.image(landsat, 'exportExample', task_config)

task.start()

######################## END OF SCRIPT ##############

#https://blog.webkid.io/analysing-satellite-images-with-google-earth-engine/
#landsat = ee.Image('LANDSAT/LC8_L1T_TOA
#/LC81230322014135LGN00').select(['B4', 'B3', 'B2']);
#Create a geometry representing an export region.

#geometry = ee.Geometry.Rectangle([116.2621, 39.8412, 116.4849, 40.01236]);
#Export the image, specifying scale and region.

#export.image.toDrive({
#    image: landsat,
#    description: 'imageToDriveExample',
#    scale: 30,  
#    region: geometry
#    });




