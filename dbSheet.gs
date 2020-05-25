function dbSheet(data){
  var sheetId = constantData().database
  var spreadsheet = SpreadsheetApp.openById(sheetId)
  var sheet = spreadsheet.getSheetByName('db')
  var rowData = [
    data.timestamp,
    data.calId,
    data.eventId,
    data.type,
    data['User'],
    data['Name'],
    data['Dept'],
    data['Title'],
    data['Room'],
    data['Begin'],
    data['Start Time'],
    data['End Time'],
    data['Occur'],
    (data['Occur Weekly On']? data['Occur Weekly On'].join(', '): ''),
    (data['Until']? data['Until']:''),
  ]
  sheet.appendRow(rowData) 
}

// db: Timestamp	Event Id	Type	User	Name	Dept	Title	Room	Begin	Start Time	End Time	Occur	Occur Weekly On	Until

// execute daily @3:00am
// purge rows if until date or begin date is 7 days past or if event is cancelled
function purgeRows() {
  var data = getSheetData().data
  var spreadsheet = getSheetData().spreadsheet
  
  // delete from bottom up (prevents row index error)
  for (var i = data.length-1; i >= 0; i--) {
    var begin = data[i][7], until = data[i][12], status = data[i][13]
    var today = new Date()
    function minusDay(d, n) { return d.setDate( d.getDate() - n ) }
    function deleteRow(i) {
      var startRow = 2
      var matchingRowIndex = (Number(i)+startRow).toFixed(0)
      return spreadsheet.deleteRow(matchingRowIndex)
    }
    today.setHours(0, 0, 0, 0)
    if (until && new Date(until) < minusDay(today,7)) { deleteRow(i) }
    else if (!until && new Date(begin) < minusDay(today,7)) { deleteRow(i) }
    else if (status == 'cancelled') { deleteRow(i) }
  }
}
