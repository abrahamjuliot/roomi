function isBusy(calendarId, start, end) {
  var check = {
    items: [{id: calendarId, busy: 'Active'}],
    timeMin: start,
    timeMax: end
  }
      
  try {
    var response = Calendar.Freebusy.query(check)
    var busyCollection = response.calendars[calendarId].busy
    return busyCollection.length 
  }
  
  catch (err) {
  
      return true
  } 

}
