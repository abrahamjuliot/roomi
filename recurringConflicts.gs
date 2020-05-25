//check for recurring conflicts  
function recurringConflicts(eventDetail, thisCalendar) {
  
  function getEventTimes(event) { return { starts: event.getStartTime(), ends: event.getEndTime() } }
  
  var room = eventDetail.room
  var startDate = eventDetail.startDate
  var endDate = eventDetail.endDate
  var startTime = eventDetail.startTime
  var endTime = eventDetail.endTime
  var selectedWeekdays = eventDetail.selectedWeekdays
  
  var events = thisCalendar.app().getEvents(startDate, endDate).map(getEventTimes) // collect all events within range
  var conflicts = [] // collect all conflicting events
  var calendarId = thisCalendar.id //determine calendar id
  
  for (var e in events) {
    var event = events[e]
    var day = event.starts.getDay()
    
    var eventStarts = newCalDate(event.starts.toLocaleDateString().replace(/\//g,'-')+' '+startTime)
    var eventEnds = newCalDate(event.ends.toLocaleDateString().replace(/\//g,'-')+' '+endTime)
    
    var startISO = eventStarts.toISOString()
    var endISO = eventEnds.toISOString()
    
    if (selectedWeekdays.indexOf(weekdays[day-1]) > -1) {
      if (isBusy(calendarId, startISO, endISO)) {
        conflicts.push(eventDay(event.starts)+' @'+eventTime(event.starts)+' - '+eventTime(event.ends))
      }
    }
  }
  return conflicts
}

function recurringConflictsClient(eventDetail) {
  function getEventTimes(event) { return { starts: event.getStartTime(), ends: event.getEndTime() } }
  
  var room = eventDetail.room
  var calendar = constantData().calendar.filter(function(cal) { return cal.name === room })[0]
  var startDate = newCalDate(eventDetail.begin)
  var endDate = newCalDate(eventDetail.until)
  var startTime = eventDetail.starttime
  var endTime = eventDetail.endtime
  var repeat = eventDetail.repeat
  var repeatLen = repeat? repeat.length: 0
  var selectedWeekdays = repeatLen? repeat.map(function(weekday) { return weekday.toLowerCase() }): [] 
  
  var events = calendar.app().getEvents(startDate, endDate).map(getEventTimes) // collect all events within range
  var conflicts = [] // collect all conflicting events
  var calendarId = calendar.id //determine calendar id
  
  for (var e in events) {
    var event = events[e]
    var day = event.starts.getDay()
    
    var eventStarts = newCalDate(event.starts.toLocaleDateString().replace(/\//g,'-')+' '+startTime)
    var eventEnds = newCalDate(event.ends.toLocaleDateString().replace(/\//g,'-')+' '+endTime)
    
    var startISO = eventStarts.toISOString()
    var endISO = eventEnds.toISOString()
    
    if (selectedWeekdays.indexOf(weekdays[day-1]) > -1) {
      if (isBusy(calendarId, startISO, endISO)) {
        conflicts.push(eventDay(event.starts)+' @'+eventTime(event.starts)+' - '+eventTime(event.ends))
      }
    }
  }
  
  return conflicts.length
}
