#!/usr/bin/env python
# Name: Harmke Vliek
# Student number: 1989137
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title
    - Rating
    - Year of release (only a number!)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """

    list_actor_title = dom.find_all("a")
    actor = []
    actor_movie = []
    title = []
    list_ratings = dom.find_all("div")
    ratings = []
    list_time = dom.find_all("span")
    year = []
    runtime = []

    for name in list_actor_title:
        # title
        if "title" in name.get("href") and "adv_li_tt" in name.get("href"):
            title.append(name.string)
            if len(title) > 1:
                actor.append(actor_movie)
                actor_movie = []
        # actor
        elif "name" in name.get("href") and "adv_li_st" in name.get("href"):
            actor_movie.append(name.string)

    # make sure last actors are appended to list of actors as well
    actor.append(actor_movie)

    for rating in list_ratings:
        # ratings
        if type(rating) != str and rating.get('data-value') != None:
            rate = rating.get("data-value")
            ratings.append(rate)

    for time in list_time:
        # year
        if time.get("class") is not None and "lister-item-year" in time.get("class"):
            year.append(time.string.strip("()")[-4:])

        # runtime
        if time.get("class") is not None and "runtime" in time.get("class"):
            runtime.append(time.string)

    return [title, ratings, year, actor, runtime]


def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])

    # print new row for every movie
    for movie in range(len(movies[0])):
        writer.writerow([movies[0][movie], movies[1][movie], movies[2][movie],\
        movies[3][movie], movies[4][movie]])

def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """

    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the movies (using the function you implemented)
    movies = extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)
