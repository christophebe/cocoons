var JSFtp        = require("jsftp");
var async        = require('async');
var log          = require('./logger.js').Logger;

var FTP_TYPE_FILE = 0;
var FTP_TYPE_FOLDER = 1;


/**
 * Simple FTP client object based on the nodejs module jsftp
 *
 * @param config json object containing the authentication info
 * @returns an instance of FtpClient
 */
function FtpClient (config) {
    this.host = config.host;
    this.port = config.port;
    this.user = config.user;
    this.password = config.password;
    this.folder = config.folder;
};


/**
 * Connect to the FTP server &
 * change the currenct directory if needed
 *
 * @param callback(error)
 *
 */
FtpClient.prototype.connect = function (callback) {
  this.ftp = new JSFtp({
    host     : this.host,
    port     : this.port,
    user     : this.user,
    pass     : this.password
  });

  var that = this;
  this.ftp.auth(this.user, this.password,
      function(error, data) {
        if (error) {
          callback(new Error("Error during FTP authentification : " + error));
        }
        else {
          log.info("Successfully connected to the FTP server");
          if (that.folder) {
            log.info("Change current directory : " + that.folder);
            that.ftp.raw.cwd(that.folder, function(error, data) {
                if (error) {
                  callback(error);
                }
                callback(null);

            });
          }
        }
    });
}

/**
 * Delete all files & subfolders
 *
 * @param the folder path for which we have to delete files & subfolders
 * @param callback(error)
 */
FtpClient.prototype.deleteAll = function(path, endCallback) {
    var that = this;

    //1. Delete all file
    this.deleteAllFiles(path, [], function(error, folders) {

      //2. Delete subfolders
      async.each(folders, function(folder, callback) {
          that.deleteFolder(folder, callback);
      },
      function(error){
        endCallback(error);
      });

    });

}

/**
 * Delete all files from a parent folder.
 * This method go across the subfolders recursively in order
 * to delete file presents into the subfolders.
 *
 * Due to the fact that FTP protocol doesn't support to delete a non empty directory,
 * This method save the path of the subfolders into a list in order to delete them
 * when all files has been deleted.
 *
 * @param the path of the remote folder from which we have to delete all files
 * @param the list of folders to delete when all files has been deleted
 * @param callback(error, foldersToDelete)
 *
 */
FtpClient.prototype.deleteAllFiles = function (path, foldersToDelete, endCallback) {

  var that = this;

  this.ftp.ls(path, function(error, files) {

      if (error) {
        log.error("Error during ls on path : " + path + " : " + error);
        endCallback(error);
        return;
      }

      async.reduce(files, foldersToDelete, function(foldersToDelete, file, callback) {

        if (file.type == FTP_TYPE_FILE) {
            that.deleteFile(path + "/" + file.name, function(error){
              callback(error, foldersToDelete);
            });
        }
        else { // Suppose to be a folder
            foldersToDelete.unshift(path + "/" + file.name);
            that.deleteAllFiles(path + "/" + file.name, foldersToDelete, function(error) {
              if (error) {
                callback(error);
              }
              else {
                callback(null, foldersToDelete);
              }

            });
        }

      },
      function(error, foldersToDelete){
        endCallback(error, foldersToDelete);
      });

  });
}

/**
 * Delete one file on the FTP server
 *
 * @param the path of the file to delete
 * @param callback(error)
 */
FtpClient.prototype.deleteFile = function(file, callback) {
  log.info("Delete remote file : " + file );
  this.ftp.raw.dele(file, function(error, data){
      if (error) {
        callback(new Error("Impossible to delete the file : " + file + " : " + data.code + " - " + data.text));
      }
      else {
        callback();
      }
  });

}

/**
 * Delete one folder on the FTP server
 * This folder should be empty
 *
 * @param the path of the folder to delete
 * @param callback(error)
 *
 */
FtpClient.prototype.deleteFolder = function(folder, callback) {
  log.info("Delete remote folder : " + folder );
  this.ftp.raw.rmd(folder, function(error, data){
      if (error) {
        callback(new Error("Impossible to delete the folder : " + folder + " : " + data.code + " - " + data.text));
      }
      else {
        callback();
      }
  });

}

/**
 * Send a file to the FTP server
 *
 * @param the path of the local file to send
 * @param the path of the matching remote file to create
 * @param callback(error)
 *
 */
FtpClient.prototype.sendFile = function (from, to, callback) {
    this.ftp.put(from, to, function(error) {
        if (error) {
          log.info("Error during sending the file : " +  from + " : " + to);
          callback(new Error ("Impossible to send the file : " + from  + " : " + error));
        }
        else {
          callback();
        }
    });
}



/**
 * Create a new folder on the FTP server
 *
 * @param the path of the remote folder to create
 * @param callback(error)
 */
FtpClient.prototype.createDir = function (to, callback) {
    this.ftp.raw.mkd(to, function(error) {
        if (error) {
          callback(new Error ("Impossible to create the remote directory : " + to +  " : " + error));
        }
        else {
          callback();
        }
    });
}


/**
 * Disconnect from the FTP server
 *
 * @param callback(error)
 *
 */
FtpClient.prototype.disconnect = function(callback) {
    this.ftp.raw.quit(function(error, data) {
        if (error) {
          log.error("FTP logout error : " + error);
        }
        else {
          log.debug("FTP server logout");
        }

        callback(error);
    });
}


module.exports.FtpClient = FtpClient;
