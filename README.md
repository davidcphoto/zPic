![Icon.png](https://github.com/davidcphoto/zPic/blob/be1a8c1fd9463ad3737c181f3e02eea49d69f422/images/Icon.png) # zPic README

zPic Calculator extension calculates of the PIC from the variables definition ina a Cobol Program or Copybook. Pic calculates the length for alphanumeric, numeric, computational, binary.


## Features


- zPic Calculator - Total: Returns a message with the sum of the length of all selected variables.

![zPicTotal.png](https://github.com/davidcphoto/zPic/blob/6e06eccfd51e33bac4b6c588c7facc98ec80175c/images/zPicList.png)


- zPic Calculator - List: Opens a right panel showing the length of every variable in the selection and the total sum of their lengths.


![zPicList.png](https://github.com/davidcphoto/zPic/blob/6e06eccfd51e33bac4b6c588c7facc98ec80175c/images/zPicList.png)


- zPic - Generate Symnames: Generates a SYSNAMES declaration to use in JCL as variables.

- zPic - Generate Job to convert a Flat File to CSV File: A Job Control Language document to convert a Flat File with the definition of selected fields to a CSV file. The generated JCL is showed in a editor.

- zPic - Generate Job to convert a CSV file to Flat File: A Job Control Language document to convert a CSV File to a Flat File with the definition of selected fields. The generated JCL is showed in a editor.


## Known Issues

- SYMNAMES - does not calculate more than one occurrence.
- Redefines are ignored

## Release Notes

### 0.0.3 - 2023-12-16
### 0.0.2 - 2023-03-24

-Initial release of zPic Calculator for VS-Code