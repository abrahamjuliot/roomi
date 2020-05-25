function reportError(e, data) {
  var email = constantData().admin.email
  var title = constantData().admin.title
  var statusEmoji = '❗️'
  var executionURL = constantData().executionURL
  try {
    GmailApp.sendEmail(email, statusEmoji+'Error in Apps Script File: '+e.fileName, '', {
      name: title,
      cc: email,
      htmlBody: e.message
      +'<br><br><strong>File</strong>: '+e.fileName
      +'<br><strong>Line</strong>: '+e.lineNumber
      +'<br><strong>Request</strong>: <pre>'+JSON.stringify(data, null, '\t')+'</pre>'
      +'<br><strong>Executions</strong>: <a href="'+executionURL+'">'+executionURL+'</a>'
    })
  } catch(error) {
    Logger.log(error) // service quota met
  }
}
