# cordova-file-manager
a full file manager to "create/remove/rename/copy/move/list folders content"

## Installation
- https://github.com/dpa99c/cordova-diagnostic-plugin
- https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html#installation

## Usage
```js
import Cfm from 'CordovaFileManager'

document.addEventListener('deviceready', onDeviceReady)

function onDeviceReady() {   
    let fm = new Cfm()
    
    fm.requestSdCardPermission().then(() => {
        fm.resolveSdCardLocation().then(() => {
            fm.createDir('my-dir', fm.getSdCardPath()).then((path) => {
                fm.listDir(path, true).then(() => {
                    console.log('dirs',fm.dirs)
                    console.log('files',fm.files)
                })
            })
        })
    })
},
```

### The file manager is split into 2 main categories and some helpers
- File
    + createFile(name, payload = null, path)
    + removeFile(name, path)
    + renameFile(path, newName) 
    + moveFile(currentPath, newPath, newName = null)
    + copyFile(currentPath, newPath, newName = null) 
    + getFileMeta(path)
 
- Directory
    + createDir(name, path)
    + removeDir(name, path)
    + renameDir(path, newName)
    + moveDir(currentPath, newPath, newName = null)
    + copyDir(currentPath, newPath, newName = null)
    + getDirMeta(path)
    + getDirSize(path)
    + listDir(path, recursive = false)

- Helpers
    + getSdCardPath(item = null, root = false)
    + getSize(bytes, decimals)
    + getParent(entry)
    + checkifExists(path)
