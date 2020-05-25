/*
- host/load js via github?
- log errors to sheet
- sections: events
*/

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
}

function logMessage() {
  var user = Session.getActiveUser().getEmail()
  return 'You are logged in as <strong>'+user+'</strong>.'
}

function getUsername() {
  return Session.getActiveUser().getEmail()
}

function getCalendars() {
  var calendars = constantData().calendar.reduce(function(calendars, item) {
    return calendars.concat({ name: item.name, link: item.viewLink })
  }, [])
  return calendars
}

function getCalendarData() {
  var calendars = constantData().calendar.reduce(function(calendars, item) {
    return calendars.concat({ title: item.app().getName(), capacity: item.capacity })
  }, [])
  return calendars
}

function getSheetData() {
  var sheetId = constantData().database
  var sheetName = 'db' 
  var spreadsheet = SpreadsheetApp.openById(sheetId)
  var colStart = 'C'
  var colEnd = 'P'
  var startRow = 2
  var len = spreadsheet.getRange(sheetName+'!A1:A').getValues().filter(String).length
  var range = spreadsheet.getRange(sheetName+'!'+colStart+startRow+':'+colEnd+len)
  var data = range.getValues()
  
  return { spreadsheet: spreadsheet, data: data }
}

function getEventDataByUser() {
  
  // get user
  var user = Session.getActiveUser().getEmail()
  
  // get sheet data
  var data = getSheetData().data
  
  // get Ids for user's current/upcoming valid events only
  var eventIds = data
    .filter(function(el) {
      var isUsersValidActiveEvent = el[2] == user && el[1] != 'invalid' && el[13] != 'cancelled'
      var isWeekly = el[12]
      var today = new Date(new Date().toDateString())
      var isCurrentWeeklyEvent = isWeekly? new Date(el[12]) >= today: false
      var isUpcomingEvent = new Date(el[7]) >= today
      return isUsersValidActiveEvent && ((isWeekly && isCurrentWeeklyEvent) ||  (!isWeekly && isUpcomingEvent)) 
    })
    .map(function(el) { return el[0] })
  
  // try get events
  try {
    var events = eventIds.reduce(function(events, calId) {
      var id = getGoogleEventId(calId)
      var event = CalendarApp.getEventSeriesById(id)
      if (event) {
        var calendarId = event.getOriginalCalendarId()
        var thisEvent = Calendar.Events.get(calendarId, id)   
          return thisEvent.status !== 'cancelled'? events.concat(thisEvent): events
      }
      return events
    }, [ ])
  } catch(error) {
    reportError(error, '')
    var events = [ ]
  }
    
  // format response JSON obj
  var formattedEvents = []
  function eventObj(event, recurrence) {
    var today = new Date()
    var obj = {
      id: event.id,
      title: event.summary,
      created: event.created,
      begin: event.start.dateTime,
      start: eventTime(event.start.dateTime),
      end: eventTime(event.end.dateTime),
      calendar: event.organizer.displayName
    }
    
    if (recurrence) {
      var rec = formatRecurrenceString(recurrence)
      obj.recurrence = rec.content
      obj.until = rec.untilDate
    } else {
      obj.until = event.end.dateTime
    }
    
    var finalDateOfEvent = Date.parse(obj.until)
    var currentDate = Date.parse(today)
    var eventIsPast = finalDateOfEvent < currentDate
    
    return eventIsPast? null: obj
  }
  
  events.forEach(function(event) {
    var obj = eventObj(event, event.recurrence)
    if (obj) { formattedEvents.push(obj) }
  }) 
  
  formattedEvents
    .sort(function(a,b){return Date.parse(a.until) - Date.parse(b.until) })
  
  //formattedEvents.forEach(function(event) { return Logger.log(event.until) })
  
  return JSON.stringify(formattedEvents)
}

function formatRecurrenceString(recurrence) {
  // example input: 'RRULE:FREQ=20101214;UNTIL=20191214T073200Z;BYDAY=MO,WE,FR'
  var until = /UNTIL=(\d{8})/.exec(recurrence)[1] 
  var y = until.slice(0, 4)
  var m = until.slice(4, 6)
  var d = until.slice(6, 8)
  var compiledDate = new Date(y+'-'+m+'-'+d)
  var untilDate = eventDay(compiledDate)
  var days = {
    MO: 'Monday',
    TU: 'Tuesday',
    WE: 'Wednesday',
    TH: 'Thursday',
    FR: 'Friday'
  }
  
  var byday = /BYDAY=(.*)/.exec(recurrence)[1].split(',').map(function(x) { return days[x] }).join(', ')
  var formattedString = 'Weekly on '+byday+', until '+untilDate
  return { content: formattedString, untilDate: compiledDate }
}


function deleteEventById(eventId) {
  
  // try mark event cancelled in Sheet
  try {
    var data = getSheetData().data
    var spreadsheet = getSheetData().spreadsheet
    
    for (var i in data) {
      var sheetEventId = data[i][0]
      if (sheetEventId == eventId) {
        var startRow = 2
        var matchingRowIndex = (Number(i)+startRow).toFixed(0)
        spreadsheet.getRange('P'+matchingRowIndex).setValue('cancelled')  
        break
      }
    }
  } catch(error) {
    reportError(error, '')
  }
  
  // try delete event from calendar
  try {
    var event = CalendarApp.getEventSeriesById(eventId)
    if (event) {
      var calendarId = event.getOriginalCalendarId()
      var eventData = Calendar.Events.get(calendarId, eventId)
      Calendar.Events.remove(calendarId, eventId)
      reportDelete(eventData)
    }
    return true
  } catch(error) {
    reportError(error, '')
    return false
  }

}