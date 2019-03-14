const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const CronJob = require("cron").CronJob;
const serverPath = require("./path");
const uploadsDir = path.join(serverPath, process.env.UPLOADS_DIR);

const cleanFolder = () => {
  fs.readdir(uploadsDir, (err, files) => {
    files.forEach(file => {
      fs.stat(path.join(uploadsDir, file), (err, stat) => {
        let endTime, now;
        if (err) {
          return console.error(err);
        }
        now = new Date().getTime();
        endTime =
          new Date(stat.ctime).getTime() +
          1000 * 60 * 60 * 24 * process.env.CLEAN_UPLOADS_DAYS -
          10;
        if (now > endTime) {
          return rimraf(path.join(uploadsDir, file), err => {
            if (err) {
              return console.error(err);
            }
          });
        }
      });
    });
  });
};
const minutes = new Date().getMinutes();
const hours = new Date().getHours();
const cleanupJob = new CronJob(
  `${minutes} ${hours} */${process.env.CLEAN_UPLOADS_DAYS} * *`,
  cleanFolder
);
module.exports = cleanupJob;
