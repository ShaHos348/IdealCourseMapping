import pandas as pd
 
dataframe1 = pd.read_excel('Pre-req Chains.xlsx', sheet_name=0)
 
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
    print("Couse Name: ", dataframe1.iloc[i,0])
    print("Pre-Req: ", column_lists[i])