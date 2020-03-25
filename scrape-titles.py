import csv
import re
from pprint import pprint
import requests
import urllib.parse
from bs4 import BeautifulSoup
from selenium import webdriver
import time
import pandas as pd

driver_path = r'C:\Users\Petra Kumi\IdeaProjects\women-in-the-world-impact\scraping\chromedriver.exe'
titles_csv_path = r'C:\Users\Petra Kumi\IdeaProjects\women-in-the-world-impact\templates\resources\titles.csv'
url_template = 'https://wpi.primo.exlibrisgroup.com/discovery/search?query=title,exact,_HERE_&tab=studentWorks&search_scope=studentWorks&vid=01WPI_INST:Default&lang=en&offset=0'
real_link = "https://wpi.primo.exlibrisgroup.com/discovery/fulldisplay?context=L&vid=01WPI_INST:Default&search_scope=studentWorks&tab=https:%2F%2Fwpi.primo.exlibrisgroup.com%2Fpermalink%2F01WPI_INST%2F12krsei%2Falma9936832568804746&docid=alma9936832568804746&lang=en"
to_replace = re.search("alma(.*?)&", real_link).group(1)

counter = 0
df = pd.read_csv(r'C:\Users\Petra Kumi\IdeaProjects\women-in-the-world-impact\templates\resources\data.csv')
titles = df.Title
with open(titles_csv_path, 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    for title in titles:
        # title = titles[24]
        print(counter, ': ', title)

        # initiate driver, create correct url to load and load it
        driver = webdriver.Chrome(executable_path=driver_path)
        query_pattern = title.replace(' ', '%20')
        url = url_template.replace('_HERE_', query_pattern)
        driver.get(url)
        time.sleep(2)

        # parse page and get id of current text
        page = requests.get(url)
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        driver.quit()

        try:
            h3_tag = soup.find_all('h3', class_='item-title')
            alma_no = h3_tag[0].find_all('a')
            alma_no = alma_no[len(alma_no)-1]['data-emailref'].replace('alma', '')

            # replace old id with new id on real link
            final_link = real_link.replace(to_replace, alma_no)
            print('final link replaced', final_link)

        except IndexError:
            final_link = df.Link[counter]
            print('final', final_link)


        # write to dict
        writer.writerow([final_link])
        counter += 1
