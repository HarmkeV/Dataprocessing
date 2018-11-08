import csv
import json
import pandas as pd
from requests import get

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

def useless_data(data_list):
    """
    Checks whether a cell is empty
    """

    # check whether any of the four valuecells are empty
    for item in data_list:
        if  item == 'unknown' or item == '':
            return True

    # if all colums are useful
    return False

def central_tendency():
    """
    Calculates central tendencies; mean, median, mode and standard deviation
    """

    # calculate mean
    mean = df.loc[:'GDP ($ per capita) dollars'].mean(axis=0)
    print(mean)


if __name__ == "__main__":

    # get csv content from csv
    input = open_csv("input.csv")

    # create dictionary to save data from csvfile
    data_dict = {}

    # simplefy filling dict by creating shorter variables
    country = 'Country'
    region = 'Region'
    pop = 'Pop. Density (per sq. mi.)'
    mort = 'Infant mortality (per 1000 births)'
    gdp = 'GDP ($ per capita) dollars'

    # fill dictionary
    for row in input:
        data_dict[row[country]] = [row[region], row[pop], row[mort], row[gdp]]

        # raise useless_data() to check whether useless data is present
        if useless_data(data_dict[row[country]]):
            del data_dict[row[country]]

    # create pandas dataframe using the data_dict
    df = pd.DataFrame.from_dict(data_dict, orient='index',
                                columns=['Region', 'Pop. Density (per sq.\
                                mi.)', 'Infant mortality (per 1000 births)',
                                'GDP ($ per capita) dollars'])

    # call central_tendency
    central_tendency()
