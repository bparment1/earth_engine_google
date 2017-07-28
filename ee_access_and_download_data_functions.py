# -*- coding: utf-8 -*-
"""
Created on Fri Jul 28 14:00:38 2017

@author: bparmentier
"""

#!/usr/bin/python
#
######## FUNCTION TO USE IN GEE SCRIPT   ########
#
#Script to download data from GEE.
##
## Authors: Benoit Parmentier 
# Created on: 07/28/2017
# Updated on: 07/28/2017
# Project: Coastal 
#
# TODO:
# - Need to add more functions by breaking out code!!...--> general call to summary
# - improve performance...by using in multiprocessing pool
# - add option to use raster by raster method for town summaries...
#
######## LOAD LIBRARY/MODULES USED IN THE SCRIPT ###########

import os, glob, sys   #System tools: OS, files, env var etc.
import subprocess      #thread and processes
import re, zipfile     #Regular expression and zip tools
import datetime, calendar #Date processing
import ftplib             #Downloading ftp library
import argparse       #Agumnt for terminal callable scripts
import shutil        #Shell utilities
from osgeo import gdal       #Raster processing tools for geographic ata
from osgeo import ogr        #Vector processing tools for geographic data
from osgeo import osr        #Georeferencing: Spatial refreferen system for geographic data 
from osgeo import gdal_array #gdal geographic library
from osgeo import gdalconst  #gdal geographic library
import psycopg2              # Postgres binding, SQL query etc
import numpy as np           #Array, matrices and scientific computing
import pickle                #Object serialization
from multiprocessing import Process, Manager, Pool #parallel processing
import pdb                   #for debugging
import pandas as pd          #DataFrame object and other R like features for data munging
import pandas.io.sql as sql  #Direct access to database with ouput in DataFrame

################ NOW FUNCTIONS  ###################

#------------------
# Functions used in the script 
#------------------

    
def create_dir_and_check_existence(path):
    #Create a new directory
    try:
        os.makedirs(path)        
    except:
        print "directory already exists"