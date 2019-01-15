export default class FileManager {
    constructor(debug = true, byteSize = 1024) {
        this.debug = debug
        this.byteSize = byteSize
        this.sdCardFreeSpace = 0 // bytes
        this.diagnostic = cordova.plugins.diagnostic
    }

    /**
     * request sd card permissions
     */
    requestSdCardPermission() {
        return new Promise((resolve, reject) => {
            this.diagnostic.requestRuntimePermission((status) => {
                switch (status) {
                    case this.diagnostic.permissionStatus.GRANTED:
                        resolve()
                        break
                    case this.diagnostic.permissionStatus.DENIED:
                        console.error('Permission denied')
                        reject('Permission denied')
                        break
                    case this.diagnostic.permissionStatus.DENIED_ALWAYS:
                        console.error('Permission permanently denied')
                        reject('Permission permanently denied')
                        break
                }
            }, (err) => {
                console.error(err)
                reject(err)
            }, this.diagnostic.permission.WRITE_EXTERNAL_STORAGE)
        })
    }

    /**
     * resolve sd root & application path
     */
    resolveSdCardLocation() {
        return new Promise((resolve, reject) => {
            this.diagnostic.getExternalSdCardDetails((details) => {
                details.forEach((detail) => {
                    if (detail.type == 'application') {
                        cordova.file.externalSdCardApplicationDirectory = detail.filePath
                    } else if (detail.type == 'root') {
                        this.sdCardFreeSpace = detail.freeSpace
                        cordova.file.externalSdCardRootDirectory = detail.filePath
                    }
                })
                resolve()
            }, (err) => {
                console.error(err)
                reject(err)
            })
        })
    }

    /**
    * get item full path
    *
    * @param {string|null} item
    * @param {bool} root
    */
    getSdCardPath(item = null, root = false) {
        let path = root
            ? cordova.file.externalSdCardRootDirectory
            : cordova.file.externalSdCardApplicationDirectory

        return item
            ? path + '/' + item
            : path
    }

    /**
     * get file parent dir
     *
     * https://cordova.apache.org/docs/en/2.0.0/cordova/file/fileentry/fileentry.html#getparent
     * https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry/getParent
     *
     * @param {FileEntry} entry
     */
    getParent(entry) {
        return new Promise((resolve, reject) => {
            return entry.getParent((parent) => {
                resolve(parent)
            }, (err) => {
                console.error(err)
                reject(err)
            })
        })
    }

    /**
     *  convert bytes to human readable
     *
     * @param {number} bytes
     * @param {number} decimals
     */
    getSize(bytes, decimals) {
        if (bytes == 0) return '0 Bytes'

        let k = this.byteSize,
            dm = decimals <= 0 ? 0 : decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k))

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    }

    /**
     *  check if path exist
     *
     * @param {string} path
     */
    checkifExists(path) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(path, resolve, reject)
        })
    }


    /**********************************
     * folders
    /**********************************

    /**
     * create new folder
     *
     * @param {string} name
     * @param {string} path
     */
    createDir(name, path) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(path, (fs) => {
                fs.getDirectory(name, { create: true, exclusive: false }, (dirEntry) => {
                    resolve(dirEntry.nativeURL)
                }, (err) => {
                    console.error(err)
                    reject(err)
                })
            }, (err) => {
                console.error(err)
                reject(err)
            })
        })
    }

    /**
     * delete folder
     *
     * @param {string} path
     */
    removeDir(path) {
        let name = path.substring(path.lastIndexOf('/') + 1)

        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(path, (fs) => {
                fs.getDirectory(name, { create: false, exclusive: false }, (dirEntry) => {
                    dirEntry.removeRecursively((dir) => {
                        resolve(dir)
                    }, (err) => {
                        console.error(err)
                        reject(err)
                    })

                    resolve()
                }, (err) => {
                    console.error(err)
                    reject(err)
                })
            }, (err) => {
                console.error(err)
                reject(err)
            })
        })
    }

    /**
     * rename folder
     *
     * @param {string} path
     * @param {string} newName
     */
    renameDir(path, newName) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(path, (fs) => {
                fs.getParent((parent) => {
                    fs.moveTo(parent, newName, (entry) => {
                        resolve(entry)
                    }, (err) => {
                        console.error(err)
                        reject(err)
                    })
                }, (err) => {
                    console.error(err)
                    reject(err)
                })
            }, (err) => {
                console.error(err)
                reject(err)
            })
        })
    }

    /**
     * move folder
     *
     * @param {string} currentPath
     * @param {string} newPath
     * @param {string|null} newName
     */
    moveDir(currentPath, newPath, newName = null) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(newPath, (moveToPath) => {
                window.resolveLocalFileSystemURL(currentPath, (fs) => {
                    fs.moveTo(moveToPath, newName, (entry) => {
                        resolve(entry)
                    }, (err) => {
                        console.error(err)
                        reject(err)
                    })
                }, (err) => {
                    console.error(err)
                    reject(err)
                })
            }, (err) => {
                console.error(err)
                reject(err)
            })
        })
    }

    /**
     * copy folder
     *
     * @param {string} currentPath
     * @param {string} newPath
     * @param {string|null} newName
     */
    copyDir(currentPath, newPath, newName = null) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(newPath, (copyToPath) => {
                window.resolveLocalFileSystemURL(currentPath, (fs) => {
                    fs.copyTo(copyToPath, newName, (entry) => {
                        resolve(entry)
                    }, (err) => {
                        console.error(err)
                        reject(err)
                    })
                }, (err) => {
                    console.error(err)
                    reject(err)
                })
            }, (err) => {
                console.error(err)
                reject(err)
            })
        })
    }

    /**
     *  get folder metadata
     *
     * @param {string} path
     */
    getDirMeta(path) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(path, (fs) => {
                fs.getMetadata((meta) => {
                    resolve(meta)
                })
            }, (err) => {
                console.error(err)
                reject(err)
            })
        })
    }

    /**
     *
     *  get folder size
     */
    getDirSize(path) {
        // TODO
    }

    /**
    * list files/dirs under a path
    *
    * @param {string} path
    * @param {bool} recursive
    */
    listDir(path, recursive = false) {
        let data = {
            dirs: [],
            files: []
        }

        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(path, (fs) => {
                fs.createReader().readEntries((entries) => {
                    entries.forEach((row) => {
                        if (row.isDirectory) {
                            data.dirs.push({
                                url: row.nativeURL,
                                name: row.name,
                                files: recursive ? this.addRecursiveList(row.nativeURL) : []
                            })
                        } else {
                            data.files.push({
                                url: row.nativeURL,
                                name: row.name
                            })
                        }
                    })

                    resolve(data)
                }, (err) => {
                    console.error(err)
                    reject(err)
                })
            }, (err) => {
                console.error(err)
                reject(err)
            })
        })
    }

    addRecursiveList(path) {
        let files = []

        window.resolveLocalFileSystemURL(path, (fs) => {
            fs.createReader().readEntries((entries) => {
                entries.forEach((row) => {
                    if (row.isDirectory) {
                        files.push({
                            url: row.nativeURL,
                            name: row.name,
                            files: this.addRecursiveList(row.nativeURL)
                        })
                    } else {
                        files.push({
                            url: row.nativeURL,
                            name: row.name
                        })
                    }
                })
            })
        })

        return files
    }

    /**********************************
     * files
    /**********************************

     * create new file
     *
     * @param {string} name
     * @param {text|blob|null} payload
     * @param {string} path
     */
    createFile(name, path, payload = null) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(path, (fs) => {
                fs.getFile(name, { create: true, exclusive: false }, (fileEntry) => {

                    fileEntry.createWriter((fileWriter) => {
                        // blob
                        if (payload instanceof Blob) {
                            //append to the end
                            fileWriter.seek(fileWriter.length)

                            const BLOCK_SIZE = 1 * 1024 * 1024 // write blocks of 3 MB at a time
                            let offset = 0
                            let writeNext = (finishCallback) => {
                                let blockSize = Math.min(BLOCK_SIZE, payload.size - offset)
                                let block = payload.slice(offset, offset + blockSize)

                                fileWriter.onwriteend = () => {
                                    if (offset < payload.size) {
                                        offset += blockSize
                                        writeNext(finishCallback)
                                    } else {
                                        finishCallback()
                                    }
                                }

                                fileWriter.onerror = (e) => {
                                    console.error('Failed file write: ' + e.toString())
                                    reject(e)
                                }

                                fileWriter.write(block)
                            }

                            writeNext(() => {
                                resolve(fileEntry)
                            })
                        }
                        // normal
                        else {
                            fileWriter.onwriteend = () => {
                                resolve(fileEntry)
                            }

                            fileWriter.onerror = (e) => {
                                console.error('Failed file write: ' + e.toString())
                                reject(e)
                            }

                            fileWriter.write(payload)
                        }
                    }, (err) => {
                        console.error('error writing: ' + err)
                        reject(err)
                    })

                }, (err) => {
                    console.error(err)
                    reject(err)
                })
            }, (err) => {
                console.error(err)
                reject(err)
            })
        })
    }

    /**
     * delete file
     *
     * @param {string} path
     */
    removeFile(path) {
        let name = path.substring(path.lastIndexOf('/') + 1)

        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(path, (fs) => {
                fs.getFile(name, { create: false }, (fileEntry) => {
                    fileEntry.remove((file) => {
                        resolve(file)
                    }, (err) => {
                        console.error(err)
                        reject(err)
                    })
                }, (err) => {
                    console.error(err)
                    reject(err)
                })
            }, (err) => {
                console.error(err)
                reject(err)
            })
        })
    }

    /**
     * rename file
     *
     * @param {string} path
     * @param {string} newName
     */
    renameFile(path, newName) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(path, (fs) => {
                fs.getParent((parent) => {
                    fs.moveTo(parent, newName, (entry) => {
                        resolve(entry)
                    }, (err) => {
                        console.error(err)
                        reject(err)
                    })
                }, (err) => {
                    console.error(err)
                    reject(err)
                })
            }, (err) => {
                console.error(err)
                reject(err)
            })
        })
    }

    /**
     * move file
     *
     * @param {string} currentPath
     * @param {string} newPath
     * @param {string|null} newName
     */
    moveFile(currentPath, newPath, newName = null) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(newPath, (moveToPath) => {
                window.resolveLocalFileSystemURL(currentPath, (fs) => {
                    fs.moveTo(moveToPath, newName, (entry) => {
                        resolve(entry)
                    }, (err) => {
                        console.error(err)
                        reject(err)
                    })
                }, (err) => {
                    console.error(err)
                    reject(err)
                })
            }, (err) => {
                console.error(err)
                reject(err)
            })
        })
    }

    /**
     * copy file
     *
     * @param {string} currentPath
     * @param {string} newPath
     * @param {string|null} newName
     */
    copyFile(currentPath, newPath, newName = null) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(newPath, (copyToPath) => {
                window.resolveLocalFileSystemURL(currentPath, (fs) => {
                    fs.copyTo(copyToPath, newName, (entry) => {
                        resolve(entry)
                    }, (err) => {
                        console.error(err)
                        reject(err)
                    })
                }, (err) => {
                    console.error(err)
                    reject(err)
                })
            }, (err) => {
                console.error(err)
                reject(err)
            })
        })
    }

    /**
     * get file metadata
     *
     * @param {string} path
     */
    getFileMeta(path) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(path, (fs) => {
                fs.file((meta) => {
                    resolve(meta)
                }, (err) => {
                    console.error(err)
                    reject(err)
                })
            }, (err) => {
                console.error(err)
                reject(err)
            })
        })
    }
}
