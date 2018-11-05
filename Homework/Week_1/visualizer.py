#!/usr/bin/env python
# Name: Harmke Vliek
# Student number: 10989137
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}

if __name__ == "__main__":
    with open("movies.csv", newline='') as csvfile:
      # read the file as a dictionary for each row ({header : value})
      reader = csv.DictReader(csvfile)
      for row in reader:
          data_dict[row["Year"]].append(float(row["Rating"]))
    print(data_dict)
    # visualize plot
    x = []
    y = []

    for i in data_dict:
        value = data_dict[i]
        average_rating = sum(value)/len(value)
        x.append(i)
        y.append(average_rating)

    plt.plot(x,y)
    plt.title('Average rating of movies per year')
    plt.ylabel('average rating')
    plt.ylabel('year of origin')
    plt.show()
