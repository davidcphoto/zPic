![Icon.png](images/Icon.png)
# README

zPic Calculator extension calculates of the PIC from the variables definition ina a Cobol Program or Copybook. Pic calculates the length for alphanumeric, numeric, computational, binary.


## Features


- zPic Calculator - Total: Returns a message with the sum of the length of all selected variables.

![zPic Total gif](images/zPic%20Total.gif)


- zPic Calculator - List: Opens a right panel showing the length of every variable in the selection and the total sum of their lengths.

![zPicList.png](images/zPic%20List.gif)


- zPic - Generate Symnames: Generates a SYSNAMES declaration to use in JCL as variables.

![zPicList.png](images/zPic%20Symnames.gif)


- zPic - Generate Job to convert a Flat File to CSV File: A Job Control Language document to convert a Flat File with the definition of selected fields to a CSV file. The generated JCL is showed in a editor.

![zPicList.png](images/zPic%20FlatFileToCSV.gif)


- zPic - Generate Job to convert a CSV file to Flat File: A Job Control Language document to convert a CSV File to a Flat File with the definition of selected fields. The generated JCL is showed in a editor.

![zPicList.png](images/zPic%20CsvToFlatFile.gif)



## Known Issues

- SYMNAMES - does not calculate more than one occurrence.
- Redefines are ignored

## Release Notes

### 0.0.4 - 2023-12-16 First publication

-Initial release of zPic Calculator for VS-Code
