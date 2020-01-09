import sys
from bs4 import BeautifulSoup

for i in range(1,2):	
	file = './dom_count/opt_rect%d.html' % i
	# print(file)
	fopen = open(file, 'r', encoding='utf-8')
	htmlhandle = fopen.read()
	fopen.close()
	soup = BeautifulSoup(htmlhandle,'html.parser')
	tags = soup.find_all()
	print(file, len(htmlhandle), len(tags))
	# for t in tags:
	# 	attr = ''
	# 	if 'class' in t.attrs:
	# 		attr = t.attrs['class']
	# 	print(t.name, attr)
