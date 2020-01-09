import sys
from bs4 import BeautifulSoup
import re

file = './dom_count/slide_preview.html'
fopen = open(file, 'r', encoding='utf-8')
htmlhandle = fopen.read()
fopen.close()
soup = BeautifulSoup(htmlhandle,'html.parser')
lists = soup.find_all(id=re.compile('list'))

# print(lists[0])
# print(lists[5])

li = lists[0]
tags = li.find_all()
for t in tags:
	attr = ''
	if 'class' in t.attrs:
		attr = t.attrs['class']
	print(t.name, attr)
print(len(tags))
# for li in lists:
# 	tags = li.find_all()
# 	print(len(tags))


