import pandas as pd
import re
import string

import numpy as np
import more_itertools as mit

path = r"data/WIN Projects - Sheet1.csv"


def parse_data():
    df = pd.read_csv(path)
    df.Category = df.Category.fillna('Other')
    df['Title'] = df.apply(lambda row: string.capwords(row.Title), axis=1)
    df['Project Center'] = df.apply(lambda row: string.capwords(row['Project Center']), axis=1)
    df['Subject Terms'] = df.apply(lambda row: string.capwords(row['Subject Terms']), axis=1)
    cat_arr = df.Category.to_numpy()
    df['Sub_Category'] = filter_arr(cat_arr)
    df['Category'] = df.apply(lambda row: row.Category.split("-")[0], axis=1)
    df = df.sort_values(by=['Category', 'Sub_Category'])

    new_csvpath = r'templates/resources/data.csv'
    print(df.Category)
    pd.DataFrame.to_csv(df, new_csvpath)

    print(df)


def filter_arr(cat_arr):
    new_arr = []
    for i in range(len(cat_arr)):
        el = cat_arr[i].split("-")
        if len(el) <= 1:
            new_arr.append("No Sub-Category")
        elif len(el) > 1:
            new_arr.append(string.capwords(el[1]))
    new_df = pd.DataFrame(data=new_arr)
    return new_df


parse_data()
