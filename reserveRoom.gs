function reserveRoom(res) {

  // try prepare reserve event data
  try {
    var data = JSON.parse(res)
    var constant = constantData()
    var adminTitle = constant.admin.title
    var adminEmail = constant.admin.email
    var calendar = constant.calendar
      
    // process form reponse
    var creationDate = new Date()
    
    // construct reservation
    var username = data['User']
    var respondentEmail = username || adminEmail
    var name = data['Name']
    var dept = data['Dept']
    var room = data['Room']
    var thisCalendar = calendar.filter(function(cal) { return cal.name === room })[0]
    var title = data['Title']
    var customize = data['Occur']
    var repeat = data['Occur Weekly On']
    var repeatLen = repeat? repeat.length: 0 // if repeat is not undefined, get its length, else length is zero
    
    var eventDate = data['Begin']
    var startTime = data['Start Time']
    var endTime = data['End Time']
    var endDate = data['Until'] || eventDate
    
    var beginsAt = newCalDate(eventDate+' '+startTime)
    var endsAt = newCalDate(eventDate+' '+endTime)
    
    var desc = {
      'description': 
        '\nCreated by: '+name+' @ '+respondentEmail
        +'\nRoom: '+room
        +(repeatLen?
          '\nBegins '+eventDay(beginsAt)
          +'\nOccurs weekly on '+repeat.join(', ')+', until '+eventDay(newCalDate(endDate+' '+endTime)):
          ''
         )
        +'\nCreated on '+locale(creationDate)
    }
    
    // validate time
    function timeLengthInHours(d1, d2) { return Math.abs(d1.getTime() - d2.getTime()) / 3600000 }
    var timeLengthLimitInHours = 12
    var invalidTimeLength = timeLengthInHours(beginsAt, endsAt) > timeLengthLimitInHours
    var invalidTime = (beginsAt>endsAt) || (endDate? beginsAt> newCalDate(endDate+' '+endTime): false)
                                                           
    // recurring event detail
    var eventDetail = {
      room: room,
      selectedWeekdays: repeatLen? repeat.map(function(weekday) { return weekday.toLowerCase() }): [],
      startDate: newCalDate(eventDate),
      endDate: repeatLen? newCalDate(endDate): newCalDate(eventDate),
      startTime: startTime,
      endTime: endTime
    }
    
    // collect 1+ day conflicts
    var conflicts = repeatLen? recurringConflicts(eventDetail, thisCalendar): []
    
    var isAvailable = !repeatLen? noConflict(room, beginsAt, endsAt, thisCalendar): !conflicts.length
     
    var firstWeekday = repeatLen? repeat[0].toLowerCase(): undefined
    var lastWeekday = repeatLen? repeat[repeatLen-1].toLowerCase(): undefined
    var validTimeAndLengthAndIsAvailable = !invalidTime && !invalidTimeLength && isAvailable
    var validDate = customize === 'Once' && validTimeAndLengthAndIsAvailable
    var validRecurringDate = customize === 'Weekly' && validTimeAndLengthAndIsAvailable
    
    var statusEmoji = validTimeAndLengthAndIsAvailable? '✅': '❌'
    
    var content = 'Thank you'
        +(!validTimeAndLengthAndIsAvailable? '<br>This event is not reserved. Please correct the errors and resubmit:': '')
        +(invalidTime?'<br>⚠️The date/time requested ends before it begins.': '')
        +(invalidTimeLength? '<br>⚠️ The length of the time requested should not exceed '
          +timeLengthLimitInHours+' hours.': ''
         )
        +(!isAvailable?'<br>⚠️ The dates/times requested conflict with '
          +(repeatLen? conflicts.length: '1 or more')+' event(s) on the calendar.': ''
         )
        
        +(repeatLen && !isAvailable? '<br><br>The following events conflict with this request:'
          +'<ul>'
          + conflicts.map(function(event) { return '<li style="color:Crimson">'+event+'</li>' }).join('') 
          +'</ul>'
          : ''
         )
        
        +(validDate || validRecurringDate?'<br>This event is reserved on the calendar'
          +(repeatLen?' on recurring weekdays.':
           '.'
           ): ''
         )
        
        +'<br>'
        +'<br><strong>Department</strong>: '+dept
        +'<br><strong>Room</strong>: '+room
        +(!repeatLen?'<br><strong>Reservation Date</strong>: '+eventDay(beginsAt):'')
        +'<br><strong>Start Time</strong>: '+eventTime(beginsAt) 
        +'<br><strong>End Time</strong>: '+eventTime(endsAt)
        +(repeatLen?
          '<br><strong>Begins</strong>: '+eventDay(beginsAt)
          +'<br><strong>Occurs weekly on</strong>: '+repeat.join(', ')+', until '+eventDay(newCalDate(endDate+' '+endTime)):
          ''
         )
        
        +(!invalidTime && repeatLen && (weekdays[beginsAt.getDay()-1] !== firstWeekday) ?'<br>⚠️ Note: The begin date is not on the first reccuring weekday.': '')
        +(!invalidTime && repeatLen && (weekdays[newCalDate(endDate+' '+endTime).getDay()-1] !== lastWeekday) ?'<br>⚠️ Note: The end date is not on the last reccuring weekday.': '')
        
  
        +'<br><br>View the <a href="'+thisCalendar.viewLink+'">calendar</a>.'
        
        +'<br><br>You may cancel your event in the <a href="'+constantData().formURL+'">room reservation form</a>.'
  } catch (error) {
    reportError(error, data)
    throw error
  }    
  
  function isAmongSelectedWeekdays(list, weekday) {
    var lowerCaseList = list.map(function(item) { return item.toLowerCase() })
    return (lowerCaseList.indexOf(weekdays[weekday-1]) > -1)
  }
  
  // try reserve events
  try {
    if (validDate) {
      var event = thisCalendar.app()
        .createEvent(title, beginsAt, endsAt, desc)
        .addGuest(respondentEmail)
    } else if (validRecurringDate) {
      var recurrence = CalendarApp.newRecurrence().addWeeklyRule().onlyOnWeekdays(
        repeat.map(function(item) { return CalendarApp.Weekday[item.toUpperCase()] })
      )
      .until(newCalDate(endDate+' '+endTime))
        
      // exclude the first date if it is not in the event series
      if (!isAmongSelectedWeekdays(repeat, beginsAt.getDay())) { recurrence.addDateExclusion(beginsAt) }
        
      var eventSeries = thisCalendar.app()
        .createEventSeries(title, beginsAt, endsAt, recurrence, desc)
        .addGuest(respondentEmail)
      
    }
    
  } catch(error) {
    reportError(error, data)
    throw error
  } 
  
  // try store data
  try {    
    data.timestamp = Utilities.formatDate(new Date(), "GMT", "MM-dd-yyyy' 'HH:mm:ss")
    data.calId = thisCalendar.id
    data.eventId = event? getGoogleEventId(event.getId()): eventSeries? getGoogleEventId(eventSeries.getId()): '[ invalid event ]'
    data.type = event? 'event': eventSeries? 'series': 'invalid'
    dbSheet(data)
  } catch(error) {
    reportError(error, data)
  }
  
  // try send email content  
  try {
    GmailApp.sendEmail(respondentEmail, statusEmoji+' ENSC Room '+room+' Reservation - '+title+' ('+name+')', '', {
      name: adminTitle,
      cc: adminEmail,
      htmlBody: content+'<br><br><strong>Event Id</strong>: '+data.eventId
    })
  } catch(error) {
    reportError(error, data)
  }


}
