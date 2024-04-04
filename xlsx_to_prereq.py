import pandas as pd
import json

 
sheets_to_parse = [0, 14, 17, 25, 28, 31]
fileName = 'prereqs'
map = {}

for sheet in sheets_to_parse:

    dataframe1 = pd.read_excel('Pre-req Chains.xlsx', sheet_name=sheet)
    
    column_lists = []
    
    for index, row in dataframe1.iterrows():
        if not row.empty:
            course_name = row.iloc[0]
            pre_req_raw = row[1:].tolist()
            pre_req = []
            for value in pre_req_raw:
                if pd.notna(value):
                    pre_req.append(value)
            column_lists.append(pre_req)
        else:
            continue
    
    for i in range(len(column_lists)):
        print("Course Name: ", dataframe1.iloc[i,0])
        print("Pre-Req: ", column_lists[i])


        major = dataframe1.iloc[i,0].split(" ")[0]
        course_num = dataframe1.iloc[i,0].split(" ")[1]

        if major not in map.keys():
            map[major] = {}
        
        if course_num not in map[major]:
            map[major][course_num] = column_lists[i]
        else:
            print("Duplicate: ", dataframe1.iloc[i,0])

    
with open(fileName + ".json", "w") as f:
    f.write(json.dumps(map, indent=2))