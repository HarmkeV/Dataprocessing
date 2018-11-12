"""
Naam: Harmke Vliek
Studentnummer: 10989137
Opdracht: Exploratory Data Analysis
"""

import csv
import json
import pandas as pd
from requests import get
import matplotlib.pyplot as plt
import numpy as np


def open_csv(input):
    """
    Enable python to open the csv file
    """

    data_list = []

    # open csvfile
    with open(input, newline='') as csvfile:
        reader = csv.DictReader(csvfile)

        # append content of csv to list of data
        for row in reader:
            data_list.append(row)

    return data_list


def create_dict(input, list_variable):
    """
    Load csv data into a dictionary
    """
    # create dictionary to save data from csvfile
    data_dict = {}

    # fill dictionary
    for row in input:
        data_dict[row[country]] = []
        for var in list_variable:

            # raise useless_data() to check whether useless data is present
            if useless_data(row[var]):
                del data_dict[row[country]]
                break

            # fill dictionary
            else:
                var_copy = row[var]

                # make sure gdp is cast well
                if var == gdp:
                    var_copy = int(row[var].split(' ')[0])

                # make sure mortality rate is cast well
                elif var == mort:
                    var_copy = float(row[var].replace(',', '.'))
                data_dict[row[country]].append(var_copy)
    return data_dict


def useless_data(item):
    """
    Checks whether a cell is empty
    """

    # check whether any of the  valuecells are empty
    if item == 'unknown' or item == '':
        return True

    # if all colums are useful
    return False


def create_df(data_dict):
    """
    Creates pandas DataFrame
    """
    # create pandas dataframe using the data_dict
    df = pd.DataFrame.from_dict(data_dict, orient='index',
                                columns=['Region', 'Pop. Density (per sq. mi.)',\
                                'Infant mortality (per 1000 births)',
                                'GDP ($ per capita) dollars'])
    return df


def df_strip(df):
    """
    Strips extra spaces from input
    """
    # create duplicate DataFrame
    df_copy = df.copy()

    # check for extra spaces in each column
    for var in df_copy.columns:
        if df_copy[var].dtype == np.object:

            # remove extra spaces in variables the colums
            df_copy[var] = pd.core.strings.str_strip(df_copy[var])
            df_copy = df_copy.rename(columns={var:var.strip()})

    return df_copy


def central_tendency(df):
    """
    Calculates central tendencies; mean, median, mode and standard deviation
    Plots histogram of absolte GPD's
    """

    # calculate mean
    mean = df['GDP ($ per capita) dollars'].mean(axis=0)

    # calculate median
    median = df['GDP ($ per capita) dollars'].median(axis=0)

    # calculate mode
    mode = df['GDP ($ per capita) dollars'].mode()[0]

    # calculate standard deviation
    sd = df['GDP ($ per capita) dollars'].std()

    # plot histogram with GDP data
    df['GDP ($ per capita) dollars'].hist(bins=100)
    plt.title('Distribution GDP ($ per capita)')
    plt.ylabel('Absolute amount')
    plt.xlabel('GDP ($ per capita)')
    plt.show()


def five_number_summary(df):
    """
    Calculates minimum, first quantile, median, third quantile and maximum
    Plots boxplot of mortality per 1000 births
    """
    # compute necessary tendencies
    min = df['Infant mortality (per 1000 births)'].min(axis=0)
    first_quartile = df['Infant mortality (per 1000 births)'].quantile(q=0.25)
    median = df['Infant mortality (per 1000 births)'].median(axis=0)
    third_quartile = df['Infant mortality (per 1000 births)'].quantile(q=0.75)
    max = df['Infant mortality (per 1000 births)'].max(axis=0)

    # plot boxplot
    fig, axis = plt.subplots()
    plt.boxplot(df['Infant mortality (per 1000 births)'])
    plt.title('Five Number Summary of infant mortality')
    plt.ylabel('infant mortality per 1000 births')
    axis.tick_params(labelbottom=False)
    plt.show()


def output(df):
    new_data_dict = df.to_dict('index')

    with open('data.json', 'w') as outfile:
        json.dump(new_data_dict, outfile, indent=4)


if __name__ == "__main__":

    # get csv content from csv
    input = open_csv("input.csv")

    # simplefy filling dict by creating shorter variables
    country = 'Country'
    region = 'Region'
    pop = 'Pop. Density (per sq. mi.)'
    mort = 'Infant mortality (per 1000 births)'
    gdp = 'GDP ($ per capita) dollars'

    list_variable = [region, pop, mort, gdp]

    # create dictionary
    data_dict = create_dict(input, list_variable)

    # create pandas DataFrame
    df = create_df(data_dict)

    # call central_tendency
    #central_tendency(df)

    # call five_number_summary
    #five_number_summary(df)

    # remove extra spaces
    df = df_strip(df)

    # call json
    output(df)
