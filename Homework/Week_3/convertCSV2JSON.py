import csv


def get_data():
    """
    Convert txtfile to csvfile
    """

    with open('KNMI_20181114.txt', 'r') as csvfile:
        csvfile1 = csvfile.readlines()
        with open('KNMI_20181114.txt'.replace('.txt','.csv'), 'w') as csvfile:
            writer = csv.writer(csvfile, delimiter=' ')
            header = []
            row = 0

            while '#' in csvfile1[row]:
                if '=' in csvfile1[row]:
                    print(csvfile1[row].lstrip())
                    header.append(csvfile1[row].rstrip().strip('#').replace(';', ',').replace(' ', ''))
                row += 1
            print(header)
            writer.writerow(header)

            while "#" not in csvfile1[row]:
                row_list = csvfile1[row]
                row_list = row_list.split(',')
                add_data = [row_list[1] ,',', row_list[2].strip()]
                writer.writerow(add_data)
                row += 1
                if row >= len(csvfile1):
                    break

#def convert_csv():

if __name__ == "__main__":
    get_data()
