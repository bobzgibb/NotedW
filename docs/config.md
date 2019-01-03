[Back](index.md)
# Configuration and misc functions

The "cogwheel" page gives access to the backup / restore functions and also provides a function to remove all NotedW entries.  
![Config page](res/NotedW_config_page.png?raw=true)

## Backup and restore to local file
This function keeps your information on your local computer (you decide what to do with the backup files later), outside of the perils of LocalStorage.

### Backup and handling the file
By clicking the "Save to local folder" button, a file will be downloaded to the default download location. It is your responsibility to take care of the file.

It is advised to create backups of your notes regularly. I do it on a weekly basis.

### Restore
This function will restore the pages to the state which is captured in the backup file. The pages, which were modified after the backup, will be reverted. The pages, which were _created_ after the backup will be left untouched (though, probably unreferenced).

By clicking the button, a file select dialog will open. Selecting the file initiates the restore process.

## Backup and restore to Dropbox

This function is yet to be implemented.
