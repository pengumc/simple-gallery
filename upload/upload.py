#! /usr/bin/env python
#author: Murad
import sys, os
import cgi, cgitb
import re
from subprocess import call
import zipfile
import tempfile

#the new gallery name will be appended to the end of this link and
#presented to the user, e.g. href="./gallery2.php#new_gallery"
BASE_GALLERY_LINK = '../gallery2.php#'

#the directory where single file uploads will be stored
#this is relative to the script location, paths starting with / are not
#supported. 
# make sure this path exists
BASE_UPLOAD_LINK = './'



def handle_zipfile(fp, filename):
	#create a gallery from a zipfile of jpg's
	#if there are files in toplevel, use the zipfile's name as
	# gallery name 
	#fail if we find a directory
	try:
		z = zipfile.ZipFile(fp, 'r')
	except Exception as e:
		print('<h1>server could not open zipfile</h1>')
		print(e)
		return(-1)
	if z.testzip():
		print('<h2> bad zipfile</h2>')
		print(z.testzip())
		z.close()
		return(-1)
	if len(z.namelist()) == 0:
		print('<h2>empty zipfile</h2>')
		z.close()
		return(-1)
	#look for dirs
	dirsfound = []
	for name in z.namelist():
		if re.search('\/$', name):
			dirsfound.append(name)
	if len(dirsfound) == 0:
		#no dirs, try to create gallery
		#check if gallery name/ filename is valid
		filename = filename[:-4]
		if re.search('[^a-z0-9\_]', filename, re.IGNORECASE):
			print('<h2>invalid gallery name: %s</h2>' % filename)
			z.close()
			return(-1)
		#create gallery #TODO update/overwrite gallery?
		if create_gallery(filename) == -1:
			z.close()
			return
		#extract all jpegs and txt from zipfile to new gallery
		path = os.getcwd() + os.sep + filename + os.sep
		try:
			print('<br/>extracted:<ul>')
			for name in z.namelist():
				if re.search('\.jpg$|\.txt$', name, re.IGNORECASE):
					z.extract(name, path)
					print('<li>' + name + '</li>')
		except Exception as e:
			print(e)
			print('<li> you\'re a dickwad</li></ul>')
			os.rmdir(filename)
			z.close()
			return 
		print('</ul>')
		#create thumbnailes for galleryg
		call_and_print(['./thumb.php', os.getcwd() + os.sep + filename])
		print(
			'new gallery: <a href="' + BASE_GALLERY_LINK + filename
			+ '">%s</a>' % (filename))
	else:
		print('<h2>you cannot have directories in your zipfile</h2>')		
		z.close()
		return
	z.close()

def create_gallery(name):
	try:
		 os.mkdir(name) #TODO permissions
	except OSError as e:
		print('<b style="color:red">')
		print(e)
		print('</b>')
		return(-1)
	gfile = open(name + os.sep + '.gallery', 'w')
	#write author to file?
	gfile.close()

def call_and_print(args):
	f = tempfile.TemporaryFile()
	call(args, stdout=f, stderr=f)
	f.seek(0)
	print('<h3>output of: %s</h3><ul>' % args)
	for line in f:
		print('<li>%s</li>' % line)
	print('</ul><br>')
	f.close()

#-------------------------------------------------------
cgitb.enable()

#print header stuff
print("Content-Type: text/html; charset=utf-8")
print("")
print('<html><head></head><body>')

form = cgi.FieldStorage()
print(form.headers)
print(os.getenv('HTTP_REFERER'))
f = form['file']
if f.filename:
	#JPEGS 
	if re.search('\.jpg$', f.filename, re.IGNORECASE):
		name  = BASE_UPLOAD_LINK + os.sep + f.filename
		out = open(name, 'wb')
		out.write(f.file.read())
		out.close()
		print(
			'<br/>your file was uploaded and is avalaible as <a href="%s">%s</a>'
			% (name,name))
		args = [os.getcwd() + os.sep + 'thumb.php', '-s', (os.getcwd() + os.sep + name)]
		call_and_print(args)
	#ZIPFILES
	elif re.search('\.zip$', f.filename, re.IGNORECASE):
		handle_zipfile(f.file, f.filename)
	else:
		print('<h1>Not a valid format</h1>')
		print('<p>currently supported: .jpg</p>')
else:
	print('<h1>no file was received</h1>')
print('</body></html>')


