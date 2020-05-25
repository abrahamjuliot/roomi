// check for 1 day conflicts 
function noConflict(room, start, end, thisCalendar) {
  var startISO = start.toISOString()
  var endISO = end.toISOString()    
  return !isBusy(thisCalendar.id, startISO, endISO)
}

function conflictClient(room, beginDate, starttime, endtime) {  
  var begin = newCalDate(beginDate+' '+starttime)
  var end = newCalDate(beginDate+' '+endtime)
  var calendar = constantData().calendar.filter(function(cal) { return cal.name === room })[0]
  var beginISO = begin.toISOString()
  var endISO = end.toISOString()
  var res = isBusy(calendar.id, beginISO, endISO)
  return res
}

