#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import numpy as np
from PIL import Image
# pip install numpy Pillow

import sys
from os.path import basename, splitext

def read_image_file(file_name):
	return Image.open(file_name)

def image_to_table(image, res=(20,20)):
	image = image.resize(res).convert('RGB')
	image.save('resized.png')
	return np.array(image.getdata()).reshape(image.size[0], image.size[1], 3)

def get_header():
	return str('/* Portable Table Format 0.9 */\n'
	'porTables[porTables.length] = new Array(\n'
	'"x", "y", "r", "g", "b",\n')

if __name__ == '__main__':
	file_name = sys.argv[1]

	image_data = read_image_file(file_name)
	table_data = image_to_table(image_data, (50,50))

	header_data = get_header()
	
	px_data = []
	for y,row in enumerate(table_data):
		for x,px in enumerate(row):
			px_data.append('{}, {}, {}'.format(x, y, ', '.join([str(v) for v in px])))
	px_data = ',\n'.join(px_data)

	footer_data = ',5);\n' # number of columns

	with open('{}.hpp'.format(splitext(basename(file_name))[0]), 'w') as out_file:
		out_file.write(header_data)
		out_file.write(px_data)
		out_file.write(footer_data)
