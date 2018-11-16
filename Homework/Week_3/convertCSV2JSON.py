import csv


def get_data(input):
    """
    Open csvfile, load contents into dictionary
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
    # create dictionary to save data from csvfile
    data_dict = {}

    # fill dictionary
    for row in input:
        data_dict[row[year]] = []
        for var in list_variable:
            data_dict[row[year]].append(var)
    print(data_dict)
    return data_dict

if __name__ == "__main__":
    data_list = get_data('Greenhouse_Gas_Emissions_Estimates.csv')

    # simplefy filling dict by creating shorter variables
    year = 'Year'
    ee = 'Estimated Emissions'
    pebau = 'Projected Emissions - Business As Usual'
    goal = '2020 Goal'
    ppcp = 'Projected Progress under Current Programs'
    ppep = 'Projected Progress under Enhanced Programs'

    list_variable = [ee, pebau, goal, ppcp, ppep]

    # create dictionary
    data_dict = create_dict(data_list, list_variable)
