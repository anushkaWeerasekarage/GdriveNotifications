//look for the files in both GDrive and Team drives
function findFiles() {

  var listOfFiles = [];
  var timeUpdate = 0;
  var files = "";
  
  var date = new Date();
  var timezone = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  //var fDate = Utilities.formatDate(date,timezone , 'yyyy-MM-dd HH:mm');
  var MILLIS_PER_HOUR = 1000 * 60 * 60 * 1;
  var hourBefore = new Date(date.getTime() - MILLIS_PER_HOUR);
  var startTime = hourBefore.toISOString();
  
  //list all doc type files
  var filesInDrive = DriveApp.searchFiles('mimeType = "application/vnd.google-apps.document"');
  
    outerloop: while(filesInDrive.hasNext()) {
      var file = filesInDrive.next();
      timeUpdate = file.getLastUpdated();
      var d = new Date(timeUpdate);
      var fTimeUpdate = Utilities.formatDate(d, timezone, 'MMMM dd, yyyy HH:mm');
      //Logger.log(timeUpdate);
      if(timeUpdate >= hourBefore) {
        //listOfFiles.push(file.getName() + " " +file.getLastUpdated());
        //listOfFiles += "<li>" + file.getLastUpdated() + "&nbsp;&nbsp;<a href='"+file.getUrl()+"'>" +file.getName()+ "</a></li>";
        listOfFiles.push("<li>" + fTimeUpdate + "&nbsp;&nbsp;<a href='"+file.getUrl()+"'>" +file.getName()+ "</a></li>");
        //Logger.log(listOfFiles);
        
      }
      
      else {
        break outerloop;
      }
    }
 /**
  ////to get the changes made by team drive members
 **/
  try {
    var teamDrives = Drive.Teamdrives.list({maxResults: 100});
    outerloop2: for(var i = 0; i < teamDrives.items.length; i++) {
      var driveId = teamDrives.items[i].id;
      var driveName = teamDrives.items[i].name;
      if(driveId != null) {
        files = Drive.Files.list({  
          corpora: 'teamDrive',
          supportsTeamDrives: true,
          teamDriveId: driveId,
          includeTeamDriveItems: true,
          q: '(trashed = false and mimeType = "application/vnd.google-apps.document")'
        });
        //Logger.log(files);
        if(files.items.length != 0) {
          innerloop: for(var j = 0; j < files.items.length; j++){
            var time = files.items[j].modifiedDate;
            //Logger.log(time);
            //var formatTime = Utilities.formatDate(time, timezone, 'yyyy-MM-dd HH:mm');
            var fTime = new Date(time);
            var formatTime = Utilities.formatDate(fTime, timezone, 'MMMM dd, yyyy HH:mm');
            //Logger.log(formatTime);
            if(time >= startTime) {
              
              //listOfFiles += "<li>" + files.items[j].modifiedDate + "&nbsp;&nbsp;<a href='"+files.items[j].alternateLink+"'>" +files.items[j].title+ "</a></li>";
              listOfFiles.push("<li>" + formatTime + "&nbsp;&nbsp;<a href='"+files.items[j].alternateLink+"'>" +files.items[j].title+ "</a></li>");
            }
            else {
              break innerloop;
            }
          }
        }
        else {
          continue outerloop2;
        }
      }
    }
    //Logger.log(listOfFiles);
    
    var arrList = [];
    if(listOfFiles != null && listOfFiles.length > 0) {
      for(var k = 0; k < listOfFiles.length; k++) {
        if(arrList.indexOf(listOfFiles[k]) == -1) {
          arrList.push(listOfFiles[k]);
        }
      }
      //Logger.log("---------------------");
      //Logger.log(arrList);
      sendMail(arrList);
    }
    else {
      Logger.log("no files updated");
    }
  }
  catch(err) {
    Logger.log('error is '+err);
  }
}


function sendMail(list) {
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var email = sheet.getRange("A1").getValues();
  //var email = "iboostzone@gmail.com";
  var emailSubject = "Google document has been updated";
  var emailBody = "<br>iBoost Development Team<br>" 
  var emailFooter = "To stop these notifications, please contact USER@EMAIL.COM.";

  row = "<p>Following files are updated in your google drive.</p><br><ol>" + list + "</ol>";
  row +=  emailBody+"<br>" + "<br><small> "+emailFooter+" </a>.</small>";
  //var template = HtmlService.createTemplate(row).evaluate().getContent();
  var template = HtmlService.createHtmlOutput(row).getContent();
  //Logger.log(template);
  //Logger.log(MailApp.getRemainingDailyQuota());
  
  if(MailApp.getRemainingDailyQuota() <= 100) {
     MailApp.sendEmail(email, emailSubject, "", {htmlBody: template});
  }
  else {
     Logger.log("Your daily mailling quota is over");
  }
  
}

function test() {
  Logger.log(MailApp.getRemainingDailyQuota());
  MailApp.sendEmail("writetoraminderpal@gmail.com", "test", "");
  Logger.log(MailApp.getRemainingDailyQuota());
}

