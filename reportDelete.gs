function reportDelete(data) {
  var email = constantData().admin.email
  var title = constantData().admin.title
  var userEmail = Session.getActiveUser().getEmail()
  var statusEmoji = '⛔'
  try {
    GmailApp.sendEmail(userEmail, statusEmoji+' Event deleted: '+data.summary, '', {
      name: title,
      cc: email,
      htmlBody: 'You deleted an event.<br><br><strong>Title</strong>: '+data.summary
        +'<br><strong>Room</strong>: '+data.organizer.displayName
        +'<br><strong>Event Id</strong>: '+data.id
    })
  } catch(error) {
    Logger.log(error) // service quota met
  }
}
