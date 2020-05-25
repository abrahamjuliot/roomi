// helpers
function locale(x) { return Utilities.formatDate(new Date(x), "PST", "EEE M/d/yyyy @hh:mm aaa, z") }
function eventDay(x) { return Utilities.formatDate(new Date(x), "PST", "EEE M/d/yyyy") }
function eventTime(x) { return Utilities.formatDate(new Date(x), "PST", "hh:mm aaa") }
function newCalDate (d) {
  return new Date(d.replace(/-/g,'/'))
} // regex required for valid date
var weekdays = [ 'monday', 'tuesday', 'wednesday', 'thursday', 'friday' ]

function getGoogleEventId(calId) {
  return /@google.com/.test(calId)? /(.*)@google.com/.exec(calId)[1]: calId
}